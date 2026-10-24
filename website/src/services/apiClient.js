import { HOME_CACHE_TTL_MS } from '../config/cache';
import api, {
  classifyApiError,
  isCancelledRequest,
  recordApiMetric,
} from '../config/axios';

const inflightRequests = new Map();
const responseCache = new Map();

const RETRY_DELAYS = [300, 800, 1500];

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export const stableSerialize = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  if (isPlainObject(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value ?? null);
};

export const createRequestKey = (endpoint, params = {}) => `${endpoint}?${stableSerialize(params)}`;

const numeric = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
};

const getMetaSource = (body) => {
  if (!isPlainObject(body)) return {};
  const nested = isPlainObject(body.data) ? body.data : {};
  const nestedMeta = isPlainObject(nested.meta) ? nested.meta : {};
  return {
    ...body,
    ...nested,
    ...(isPlainObject(body.meta) ? body.meta : {}),
    ...(isPlainObject(nested.meta) ? nested.meta : {}),
    ...nestedMeta,
  };
};

/**
 * Normalize every collection response shape used by Laravel and the public API.
 * Supports raw arrays, {data: []}, {data: {data: []}}, and pagination metadata.
 */
export const parseCollectionResponse = (payload) => {
  const body = payload?.config && Object.prototype.hasOwnProperty.call(payload, 'data')
    ? payload.data
    : payload;

  let items = [];
  let data = body;

  if (Array.isArray(body)) {
    items = body;
  } else if (isPlainObject(body)) {
    if (Array.isArray(body.data)) {
      items = body.data;
      data = body.data;
    } else if (isPlainObject(body.data) && Array.isArray(body.data.data)) {
      items = body.data.data;
      data = body.data.data;
    } else if (Array.isArray(body.items)) {
      items = body.items;
      data = body.items;
    }
  }

  const metaSource = getMetaSource(body);
  const meta = {
    ...metaSource,
    total: numeric(metaSource.total ?? metaSource.total_count, items.length),
    current_page: numeric(metaSource.current_page ?? metaSource.currentPage, 1) || 1,
    last_page: numeric(metaSource.last_page ?? metaSource.lastPage, 1) || 1,
    per_page: numeric(metaSource.per_page ?? metaSource.perPage, items.length) || items.length,
  };

  return {
    items,
    total: meta.total,
    current_page: meta.current_page,
    last_page: meta.last_page,
    per_page: meta.per_page,
    meta,
    data,
    raw: body,
  };
};

export const parseDataResponse = (payload) => {
  const body = payload?.config && Object.prototype.hasOwnProperty.call(payload, 'data')
    ? payload.data
    : payload;
  if (isPlainObject(body) && body.data !== undefined) {
    if (isPlainObject(body.data) && body.data.data !== undefined) return body.data.data;
    return body.data;
  }
  return body;
};

const createCancelledError = () => {
  const error = new Error('Request cancelled');
  error.name = 'AbortError';
  error.code = 'ERR_CANCELED';
  return error;
};

const wait = (milliseconds, signal) => new Promise((resolve, reject) => {
  if (signal?.aborted) {
    reject(createCancelledError());
    return;
  }
  const timer = setTimeout(resolve, milliseconds);
  signal?.addEventListener('abort', () => {
    clearTimeout(timer);
    reject(createCancelledError());
  }, { once: true });
});

const shouldRetry = (error) => {
  if (isCancelledRequest(error)) return false;
  const kind = classifyApiError(error);
  return kind === 'timeout' || kind === 'network' || kind === '5xx';
};

const requestWithRetry = async (endpoint, params, options) => {
  const retries = Math.max(0, Math.min(Number(options.retries ?? 2), RETRY_DELAYS.length));
  let attempt = 0;

  while (true) {
    if (options.signal?.aborted) throw createCancelledError();
    try {
      const response = await api.get(endpoint, {
        params,
        signal: options.signal,
        timeout: options.timeout,
        ...(options.lang ? { headers: { 'Accept-Language': options.lang } } : {}),
        __retryCount: attempt,
      });
      return response.data;
    } catch (error) {
      if (attempt >= retries || !shouldRetry(error)) throw error;
      await wait(RETRY_DELAYS[attempt], options.signal);
      attempt += 1;
    }
  }
};

const recordCacheMetric = (endpoint, params, cache) => {
  const now = Date.now();
  recordApiMetric({
    endpoint,
    parameters: params,
    start_time: now,
    end_time: now,
    duration: 0,
    status: 200,
    retry_count: 0,
    cache,
    aborted: false,
  });
};

// ─── Persistent (cross-reload) cache ──────────────────────────────────────────
// Home page data is also kept in localStorage so a reload, a new tab or a
// return visit renders the home page instantly from the last good response
// while a fresh copy is fetched in the background. Only an allow-list of
// public endpoints is ever persisted: customer data (orders, returns, wallet,
// profile) never is.
const PERSIST_PREFIX = 'mg:api:v2:';
// Entries written before caching was limited to the home page.
const LEGACY_PERSIST_PREFIXES = ['mg:api:v1:'];
const PERSIST_MAX_AGE = 7 * 24 * 60 * 60 * 1000;   // never serve data older than a week
const PERSIST_MAX_ENTRY_CHARS = 700 * 1000;         // skip pathological payloads
const PERSIST_MAX_TOTAL_CHARS = 3 * 1000 * 1000;    // ~3M chars of the ~5M quota
const PERSISTABLE_ENDPOINTS = [
  /^\/v1\/site\/(settings|sliders|site-images|categories|offers)(\/|$)/,
  /^\/v1\/site\/products(\/|$)/,
  /^\/frontend\/(countries|cities|city-shipping-rates|topics)(\/|$)/,
];

const getStorage = () => {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
};

// The API localises its payloads from Accept-Language, so the language is part
// of every cache key. Without it, switching language would serve stale text.
const currentLang = () => {
  try {
    return getStorage()?.getItem('lang') || 'ar';
  } catch {
    return 'ar';
  }
};

// options.lang fetches in a language other than the visitor's current one.
const cacheKeyFor = (endpoint, params, lang) => `${createRequestKey(endpoint, params)}|${lang || currentLang()}`;

const isPersistable = (endpoint) => PERSISTABLE_ENDPOINTS.some((pattern) => pattern.test(endpoint));

const persistedKeys = (storage) => {
  const keys = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key && key.startsWith(PERSIST_PREFIX)) keys.push(key);
  }
  return keys;
};

const readPersisted = (key) => {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(PERSIST_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry || typeof entry !== 'object' || !('value' in entry) || !Number.isFinite(entry.savedAt)) {
      storage.removeItem(PERSIST_PREFIX + key);
      return null;
    }
    if (Date.now() - entry.savedAt > PERSIST_MAX_AGE) {
      storage.removeItem(PERSIST_PREFIX + key);
      return null;
    }
    return entry;
  } catch {
    try { storage.removeItem(PERSIST_PREFIX + key); } catch { /* storage unavailable */ }
    return null;
  }
};

// Drop the oldest entries until the total stays inside the budget.
const enforcePersistBudget = (storage, reserve = 0) => {
  const rows = persistedKeys(storage).map((key) => {
    const raw = storage.getItem(key) || '';
    let savedAt = 0;
    try { savedAt = JSON.parse(raw).savedAt || 0; } catch { /* corrupt entry is evicted first */ }
    return { key, size: raw.length, savedAt };
  }).sort((a, b) => a.savedAt - b.savedAt);
  let total = rows.reduce((sum, row) => sum + row.size, 0) + reserve;
  for (const row of rows) {
    if (total <= PERSIST_MAX_TOTAL_CHARS) break;
    storage.removeItem(row.key);
    total -= row.size;
  }
};

const writePersisted = (key, entry) => {
  const storage = getStorage();
  if (!storage) return;
  try {
    const raw = JSON.stringify(entry);
    if (raw.length > PERSIST_MAX_ENTRY_CHARS) return;
    enforcePersistBudget(storage, raw.length);
    try {
      storage.setItem(PERSIST_PREFIX + key, raw);
    } catch {
      // Quota exceeded: free everything older than this entry and retry once.
      persistedKeys(storage).forEach((existing) => storage.removeItem(existing));
      storage.setItem(PERSIST_PREFIX + key, raw);
    }
  } catch {
    // Persistence is an optimisation; a full or blocked storage must never break a request.
  }
};

const removePersisted = (matches) => {
  const storage = getStorage();
  if (!storage) return;
  try {
    persistedKeys(storage).forEach((storageKey) => {
      if (matches(storageKey.slice(PERSIST_PREFIX.length))) storage.removeItem(storageKey);
    });
  } catch { /* storage unavailable */ }
};

const removeLegacyPersisted = () => {
  const storage = getStorage();
  if (!storage) return;
  try {
    const legacy = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key && LEGACY_PERSIST_PREFIXES.some((prefix) => key.startsWith(prefix))) legacy.push(key);
    }
    legacy.forEach((key) => storage.removeItem(key));
  } catch { /* storage unavailable */ }
};
removeLegacyPersisted();

// Memory first, then the persisted copy (hydrated into memory for next time).
const lookupCache = (key) => {
  const inMemory = responseCache.get(key);
  if (inMemory) return inMemory;
  const persisted = readPersisted(key);
  if (!persisted) return null;
  const entry = { value: persisted.value, expiresAt: persisted.expiresAt, savedAt: persisted.savedAt };
  responseCache.set(key, entry);
  return entry;
};

const storeEntry = (key, endpoint, value, options) => {
  if (!options.cache) return value;
  const savedAt = Date.now();
  const entry = { value, expiresAt: savedAt + Math.max(0, Number(options.ttl ?? HOME_CACHE_TTL_MS)), savedAt };
  responseCache.set(key, entry);
  if (options.persist !== false && isPersistable(endpoint)) {
    // Serialising a large catalogue is not free; keep it off the render path.
    setTimeout(() => writePersisted(key, entry), 0);
  }
  return value;
};

// A cached (home) caller may join a request another caller started without
// caching, e.g. the layout's settings request; store its response all the same.
const joinInflight = (key, endpoint, params, options) => {
  recordCacheMetric(endpoint, params, 'inflight');
  return inflightRequests.get(key).then((value) => storeEntry(key, endpoint, value, options));
};

const startCachedRequest = (key, endpoint, params, options, cache = 'miss') => {
  recordCacheMetric(endpoint, params, cache);
  const promise = requestWithRetry(endpoint, params, options)
    .then((value) => storeEntry(key, endpoint, value, options))
    .finally(() => {
      if (inflightRequests.get(key) === promise) inflightRequests.delete(key);
    });

  // A request with its own AbortSignal is never shared: when its owner cancels
  // it (a newer filter click), everyone who joined it would be cancelled too and
  // the page would be left showing stale results.
  if (!options.signal) inflightRequests.set(key, promise);
  return promise;
};

/**
 * GET a public endpoint.
 *
 * Without `cache: true` (every page except home) the request always goes to
 * the API; identical requests running at the same time share one response.
 *
 * With `cache: true` (home page only) the last response is served while it is
 * fresh, an expired one is served instantly while a new copy is fetched, and
 * `refresh: true` skips the cached copy and fetches a new one (used by the
 * home page's periodic refresh).
 */
export const getCached = (endpoint, params = {}, options = {}) => {
  const key = cacheKeyFor(endpoint, params, options.lang);

  if (!options.cache) {
    if (!options.signal && inflightRequests.has(key)) return joinInflight(key, endpoint, params, options);
    return startCachedRequest(key, endpoint, params, options, 'bypass');
  }

  const now = Date.now();
  const cached = options.persist === false ? responseCache.get(key) : lookupCache(key);

  if (cached && cached.expiresAt > now && !options.refresh) {
    recordCacheMetric(endpoint, params, 'hit');
    return Promise.resolve(cached.value);
  }

  // Public catalog data can be rendered from the last successful response
  // while a refresh runs in the background. This removes a blank/loading
  // state after the TTL expires without serving stale data forever.
  if (cached && !options.refresh && options.staleWhileRevalidate !== false) {
    if (!inflightRequests.has(key)) {
      startCachedRequest(key, endpoint, params, options, 'revalidate').catch(() => {
        // The previous successful value remains available until the next
        // request; background refresh failures must not create unhandled
        // promise rejections or interrupt rendering.
      });
    } else {
      joinInflight(key, endpoint, params, options).catch(() => {});
    }
    recordCacheMetric(endpoint, params, 'stale');
    return Promise.resolve(cached.value);
  }

  const request = !options.signal && inflightRequests.has(key)
    ? joinInflight(key, endpoint, params, options)
    : startCachedRequest(key, endpoint, params, options);
  if (!cached) return request;
  // stale-if-error: an expired copy beats an error page when the API is down.
  return request.catch((error) => {
    if (isCancelledRequest(error)) throw error;
    recordCacheMetric(endpoint, params, 'stale-error');
    return cached.value;
  });
};

export const getStaleCached = (endpoint, params = {}) => lookupCache(cacheKeyFor(endpoint, params))?.value;

export const invalidateCache = (endpoint, params) => {
  const matches = params
    ? (key) => key === cacheKeyFor(endpoint, params)
    : (key) => key.startsWith(`${endpoint}?`);
  for (const key of [...responseCache.keys()]) {
    if (matches(key)) responseCache.delete(key);
  }
  removePersisted(matches);
};

export const clearApiCache = () => {
  responseCache.clear();
  inflightRequests.clear();
  removePersisted(() => true);
};

// Memory only: what a page reload does. The persisted copy survives.
export const clearMemoryCache = () => {
  responseCache.clear();
  inflightRequests.clear();
};

export const getCacheState = () => ({
  entries: [...responseCache.entries()].map(([key, value]) => ({ key, ...value })),
  inflight: [...inflightRequests.keys()],
});

export default {
  getCached,
  getStaleCached,
  invalidateCache,
  clearApiCache,
  parseCollectionResponse,
  parseDataResponse,
  createRequestKey,
};
