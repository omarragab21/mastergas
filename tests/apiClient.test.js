import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

let viteServer;
let api;
let apiClient;

before(async () => {
  viteServer = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
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
      apiClient.getCached('/frontend/products', { page: 1 }, { ttl: 50, retries: 0 }),
      apiClient.getCached('/frontend/products', { page: 1 }, { ttl: 50, retries: 0 }),
    ]);
    assert.equal(calls, 1);
    assert.strictEqual(first, second);

    await apiClient.getCached('/frontend/products', { page: 1 }, { ttl: 50, retries: 0 });
    assert.equal(calls, 1);
    await new Promise((resolve) => setTimeout(resolve, 60));
    await apiClient.getCached('/frontend/products', { page: 1 }, { ttl: 50, retries: 0 });
    assert.equal(calls, 2);
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
    const body = await apiClient.getCached('/frontend/products', { page: 2 }, { ttl: 1, retries: 1 });
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
