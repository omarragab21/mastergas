import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

let viteServer;
let api;
let apiClient;

before(async () => {
  viteServer = await createServer({ root: new URL('../website', import.meta.url).pathname, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
  api = (await viteServer.ssrLoadModule('/src/config/axios.js')).default;
  apiClient = await viteServer.ssrLoadModule('/src/services/apiClient.js');
});

after(async () => {
  await viteServer?.close();
});

test('parseCollectionResponse normalizes arrays, envelopes, and Laravel pagination', () => {
  const shapes = [
    [{ id: 1 }],
    { data: [{ id: 2 }], total: 8, current_page: 2, last_page: 4, per_page: 2 },
    { data: { data: [{ id: 3 }], total: 9, current_page: 3, last_page: 5, per_page: 2 } },
  ];

  assert.deepEqual(shapes.map((shape) => apiClient.parseCollectionResponse(shape).items[0].id), [1, 2, 3]);
  const result = apiClient.parseCollectionResponse(shapes[2]);
  assert.deepEqual(
    { total: result.total, current_page: result.current_page, last_page: result.last_page, per_page: result.per_page },
    { total: 9, current_page: 3, last_page: 5, per_page: 2 }
  );
});

test('getCached deduplicates concurrent requests and respects TTL', async () => {
  apiClient.clearApiCache();
  let calls = 0;
  const originalGet = api.get;
  api.get = async () => {
    calls += 1;
    return { data: { data: [{ id: calls }] } };
  };

  try {
    const [first, second] = await Promise.all([
      apiClient.getCached('/frontend/products', { page: 1 }, { cache: true, ttl: 50, retries: 0 }),
      apiClient.getCached('/frontend/products', { page: 1 }, { cache: true, ttl: 50, retries: 0 }),
    ]);
    assert.equal(calls, 1);
    assert.strictEqual(first, second);

    await apiClient.getCached('/frontend/products', { page: 1 }, { cache: true, ttl: 50, retries: 0 });
    assert.equal(calls, 1);
    await new Promise((resolve) => setTimeout(resolve, 60));
    await apiClient.getCached('/frontend/products', { page: 1 }, { cache: true, ttl: 50, retries: 0 });
    assert.equal(calls, 2);
  } finally {
    api.get = originalGet;
    apiClient.clearApiCache();
  }
});

test('without cache: true (every page except home) each call goes to the API', async () => {
  apiClient.clearApiCache();
  let calls = 0;
  const originalGet = api.get;
  api.get = async () => {
    calls += 1;
    return { data: { data: [{ id: calls }] } };
  };

  try {
    const [first, second] = await Promise.all([
      apiClient.getCached('/v1/site/products/featured', {}, { retries: 0 }),
      apiClient.getCached('/v1/site/products/featured', {}, { retries: 0 }),
    ]);
    assert.equal(calls, 1, 'concurrent identical requests still share one response');
    assert.strictEqual(first, second);

    const next = await apiClient.getCached('/v1/site/products/featured', {}, { retries: 0 });
    assert.equal(calls, 2);
    assert.equal(apiClient.parseCollectionResponse(next).items[0].id, 2);
    assert.equal(apiClient.getStaleCached('/v1/site/products/featured'), undefined, 'nothing is cached');
  } finally {
    api.get = originalGet;
    apiClient.clearApiCache();
  }
});

test('a request with its own AbortSignal is never shared, so a newer caller is not cancelled with it', async () => {
  apiClient.clearApiCache();
  const originalGet = api.get;
  api.get = (url, config = {}) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve({ data: { data: [{ id: 1 }] } }), 30);
    config.signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(Object.assign(new Error('cancelled'), { name: 'CanceledError', code: 'ERR_CANCELED' }));
    });
  });
  try {
    const first = new AbortController();
    const second = new AbortController();
    const cancelled = apiClient.getCached('/v1/site/products/all_products', {}, { signal: first.signal, retries: 0 });
    const kept = apiClient.getCached('/v1/site/products/all_products', {}, { signal: second.signal, retries: 0 });
    first.abort();
    await assert.rejects(cancelled);
    assert.deepEqual(await kept, { data: [{ id: 1 }] });
  } finally {
    api.get = originalGet;
    apiClient.clearApiCache();
  }
});

test('home refresh: refresh: true fetches a new copy even while the cached one is fresh', async () => {
  apiClient.clearApiCache();
  let calls = 0;
  const originalGet = api.get;
  api.get = async () => {
    calls += 1;
    return { data: { data: [{ id: calls }] } };
  };

  try {
    await apiClient.getCached('/v1/site/sliders', {}, { cache: true, ttl: 60000, retries: 0 });
    await apiClient.getCached('/v1/site/sliders', {}, { cache: true, ttl: 60000, retries: 0 });
    assert.equal(calls, 1, 'fresh cached copy is reused');

    const refreshed = await apiClient.getCached('/v1/site/sliders', {}, { cache: true, refresh: true, ttl: 60000, retries: 0 });
    assert.equal(calls, 2);
    assert.equal(apiClient.parseCollectionResponse(refreshed).items[0].id, 2);
    const reused = await apiClient.getCached('/v1/site/sliders', {}, { cache: true, ttl: 60000, retries: 0 });
    assert.equal(apiClient.parseCollectionResponse(reused).items[0].id, 2, 'refresh updates the cache');
  } finally {
    api.get = originalGet;
    apiClient.clearApiCache();
  }
});

test('getCached serves stale public data while refreshing in the background', async () => {
  apiClient.clearApiCache();
  let calls = 0;
  const originalGet = api.get;
  api.get = async () => {
    calls += 1;
    if (calls === 1) return { data: { data: [{ id: 1 }] } };
    await new Promise((resolve) => setTimeout(resolve, 15));
    return { data: { data: [{ id: 2 }] } };
  };

  try {
    const first = await apiClient.getCached('/v1/site/settings', {}, { cache: true, ttl: 20, retries: 0 });
    assert.equal(apiClient.parseCollectionResponse(first).items[0].id, 1);

    await new Promise((resolve) => setTimeout(resolve, 30));
    const stale = await apiClient.getCached('/v1/site/settings', {}, {
      cache: true,
      ttl: 20,
      retries: 0,
      staleWhileRevalidate: true,
    });
    assert.equal(apiClient.parseCollectionResponse(stale).items[0].id, 1);
    assert.equal(calls, 2);

    await new Promise((resolve) => setTimeout(resolve, 25));
    const refreshed = await apiClient.getCached('/v1/site/settings', {}, { cache: true, ttl: 20, retries: 0 });
    assert.equal(apiClient.parseCollectionResponse(refreshed).items[0].id, 2);
  } finally {
    api.get = originalGet;
    apiClient.clearApiCache();
  }
});

test('getCached retries GET 5xx once with bounded retry policy', async () => {
  apiClient.clearApiCache();
  let calls = 0;
  const originalGet = api.get;
  api.get = async () => {
    calls += 1;
    if (calls === 1) {
      const error = new Error('server error');
      error.response = { status: 500 };
      throw error;
    }
    return { data: { data: [{ id: 10 }] } };
  };

  try {
    const body = await apiClient.getCached('/frontend/products', { page: 2 }, { cache: true, ttl: 1, retries: 1 });
    assert.equal(calls, 2);
    assert.equal(apiClient.parseCollectionResponse(body).items[0].id, 10);
  } finally {
    api.get = originalGet;
    apiClient.clearApiCache();
  }
});

test('getCached propagates AbortController cancellation without retrying', async () => {
  apiClient.clearApiCache();
  let calls = 0;
  const originalGet = api.get;
  api.get = (_endpoint, config) => new Promise((resolve, reject) => {
    calls += 1;
    config.signal.addEventListener('abort', () => {
      const error = new Error('cancelled');
      error.code = 'ERR_CANCELED';
      reject(error);
    }, { once: true });
    setTimeout(() => resolve({ data: { data: [] } }), 50);
  });

  const controller = new AbortController();
  const request = apiClient.getCached('/frontend/products', { page: 3 }, { signal: controller.signal, retries: 2 });
  controller.abort();

  try {
    await assert.rejects(request, (error) => error.code === 'ERR_CANCELED');
    assert.equal(calls, 1);
  } finally {
    api.get = originalGet;
    apiClient.clearApiCache();
  }
});

test('Axios Request Interceptor: storefront requests use the customer token, not the admin token', async () => {
  const store = new Map([['token', 'admin-token'], ['c_token', 'customer-token']]);
  const previous = globalThis.localStorage;
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  };
  try {
    const config = await api.interceptors.request.handlers[0].fulfilled({ url: '/products', headers: {} });
    assert.equal(config.headers.Authorization, 'Bearer customer-token');
  } finally {
    globalThis.localStorage = previous;
  }
});

const installStorage = () => {
  const data = new Map();
  globalThis.localStorage = {
    get length() { return data.size; },
    key: (index) => [...data.keys()][index] ?? null,
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => { data.set(key, String(value)); },
    removeItem: (key) => { data.delete(key); },
    clear: () => data.clear(),
  };
  return data;
};

const stubApi = (handler) => {
  const originalGet = api.get;
  api.get = async (...args) => handler(...args);
  return () => { api.get = originalGet; };
};

test('persistent cache: a reload renders from the stored copy without waiting for the network', async () => {
  const storage = installStorage();
  apiClient.clearApiCache();
  let calls = 0;
  const restore = stubApi(async () => { calls += 1; return { data: { data: [{ id: calls }] } }; });
  try {
    await apiClient.getCached('/v1/site/categories', {}, { cache: true, ttl: 20, retries: 0, staleWhileRevalidate: true });
    await new Promise((resolve) => setTimeout(resolve, 10)); // let the deferred write run
    assert.ok([...storage.keys()].some((key) => key.startsWith('mg:api:v2:/v1/site/categories')));

    apiClient.clearMemoryCache(); // simulate a page reload
    await new Promise((resolve) => setTimeout(resolve, 30)); // the stored copy is now past its TTL
    const result = await apiClient.getCached('/v1/site/categories', {}, { cache: true, ttl: 20, retries: 0, staleWhileRevalidate: true });
    assert.deepEqual(result, { data: [{ id: 1 }] }, 'stale copy is returned immediately');
    await new Promise((resolve) => setTimeout(resolve, 10));
    assert.equal(calls, 2, 'and refreshed in the background');
  } finally {
    restore();
    apiClient.clearApiCache();
  }
});

test('persistent cache: customer endpoints are never written to storage', async () => {
  const storage = installStorage();
  apiClient.clearApiCache();
  const restore = stubApi(async () => ({ data: { data: [{ secret: true }] } }));
  try {
    await apiClient.getCached('/v1/site/orders', {}, { cache: true, ttl: 1000, retries: 0 });
    await apiClient.getCached('/v1/site/returns', {}, { cache: true, ttl: 1000, retries: 0 });
    await apiClient.getCached('/frontend/wallet', {}, { cache: true, ttl: 1000, retries: 0 });
    await new Promise((resolve) => setTimeout(resolve, 10));
    assert.equal(storage.size, 0);
  } finally {
    restore();
    apiClient.clearApiCache();
  }
});

test('cache keys include the language so switching language never serves the other one', async () => {
  const storage = installStorage();
  apiClient.clearApiCache();
  const restore = stubApi(async () => ({ data: { data: [{ name: localStorage.getItem('lang') }] } }));
  try {
    storage.set('lang', 'ar');
    const ar = await apiClient.getCached('/v1/site/categories', {}, { cache: true, ttl: 60000, retries: 0 });
    storage.set('lang', 'en');
    const en = await apiClient.getCached('/v1/site/categories', {}, { cache: true, ttl: 60000, retries: 0 });
    assert.equal(ar.data[0].name, 'ar');
    assert.equal(en.data[0].name, 'en');
    storage.set('lang', 'ar');
    assert.equal((await apiClient.getCached('/v1/site/categories', {}, { cache: true, ttl: 60000, retries: 0 })).data[0].name, 'ar');
    await new Promise((resolve) => setTimeout(resolve, 10)); // flush deferred writes
  } finally {
    restore();
    apiClient.clearApiCache();
  }
});

test('stale-if-error: an expired copy is served when the API is down, and old/corrupt storage is ignored', async () => {
  const storage = installStorage();
  apiClient.clearApiCache();
  let fail = false;
  const restore = stubApi(async () => {
    if (fail) { const error = new Error('down'); error.response = { status: 503 }; throw error; }
    return { data: { data: ['ok'] } };
  });
  try {
    await apiClient.getCached('/v1/site/settings', {}, { cache: true, ttl: 5, retries: 0 });
    await new Promise((resolve) => setTimeout(resolve, 15));
    fail = true;
    const result = await apiClient.getCached('/v1/site/settings', {}, { cache: true, ttl: 5, retries: 0 });
    assert.deepEqual(result, { data: ['ok'] });

    apiClient.clearMemoryCache();
    const key = [...storage.keys()].find((name) => name.startsWith('mg:api:v2:/v1/site/settings'));
    storage.set(key, '{not json');
    await assert.rejects(apiClient.getCached('/v1/site/settings', {}, { cache: true, ttl: 5, retries: 0 }));
    assert.ok(!storage.has(key) || storage.get(key) !== '{not json', 'corrupt entry is discarded');
  } finally {
    restore();
    apiClient.clearApiCache();
  }
});

test('persistent cache stays inside its storage budget', async () => {
  const storage = installStorage();
  apiClient.clearApiCache();
  const big = 'x'.repeat(500 * 1000);
  const restore = stubApi(async () => ({ data: { data: [big] } }));
  try {
    for (let page = 1; page <= 8; page += 1) {
      await apiClient.getCached('/v1/site/offers', { page }, { cache: true, ttl: 1000, retries: 0 });
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    const total = [...storage.entries()].filter(([key]) => key.startsWith('mg:api:v2:')).reduce((sum, [, value]) => sum + value.length, 0);
    assert.ok(total <= 3 * 1000 * 1000 + 600 * 1000, `stored ${total} chars`);
  } finally {
    restore();
    apiClient.clearApiCache();
  }
});

test('home refresh interval: defaults to 10 seconds and is the home cache lifetime', async () => {
  const cache = await viteServer.ssrLoadModule('/src/config/cache.js');
  assert.equal(cache.HOME_REFRESH_SECONDS, 10);
  assert.equal(cache.HOME_REFRESH_INTERVAL_MS, 10 * 1000);
  assert.equal(cache.HOME_CACHE_TTL_MS, cache.HOME_REFRESH_INTERVAL_MS);
});

test('refresh interval: data is fetched once, reused inside the interval, fetched again after it', async () => {
  installStorage();
  apiClient.clearApiCache();
  let calls = 0;
  const restore = stubApi(async () => { calls += 1; return { data: { data: [calls] } }; });
  try {
    const options = { cache: true, ttl: 40, retries: 0, staleWhileRevalidate: true };
    await apiClient.getCached('/v1/site/products/featured', {}, options);
    apiClient.clearMemoryCache(); // new visit inside the interval
    await new Promise((resolve) => setTimeout(resolve, 10));
    await apiClient.getCached('/v1/site/products/featured', {}, options);
    assert.equal(calls, 1, 'no request while the stored copy is still fresh');

    await new Promise((resolve) => setTimeout(resolve, 50)); // interval passes
    apiClient.clearMemoryCache(); // next visit
    const shown = await apiClient.getCached('/v1/site/products/featured', {}, options);
    assert.deepEqual(shown, { data: [1] }, 'old copy is shown instantly');
    await new Promise((resolve) => setTimeout(resolve, 10));
    assert.equal(calls, 2, 'and a new request refreshes it');
  } finally {
    restore();
    apiClient.clearApiCache();
  }
});
