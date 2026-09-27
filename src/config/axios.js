import axios from 'axios';

const serverUrl = 'https://backend-mastergas.be-kite.com/api';
const envUrl = import.meta.env.VITE_API_BASE_URL;

const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && 
  window.location?.hostname &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const forceRemote = import.meta.env.VITE_USE_PROXY === 'false';

// When running in a browser locally, route through Vite dev server proxy '/api'
// to eliminate browser Cross-Origin Request Blocked (CORS) errors.
// In SSR/Node test environments or production builds, use VITE_API_BASE_URL or fallback.
const baseURL = (!forceRemote && isBrowser && (import.meta.env.DEV || isLocalhost))
  ? '/api'
  : (envUrl || serverUrl);

const api = axios.create({
  baseURL,
  timeout: 6000,
  headers: {
    'Accept': 'application/json',
  },
});

const apiMetrics = [];
const MAX_METRICS = 250;

const getStorage = () => (typeof localStorage !== 'undefined' ? localStorage : null);

const getRequestPath = (config = {}) => {
  const rawUrl = config.url || '';
  return rawUrl.split('?')[0].replace(/^\/api/, '') || '/';
};

const sanitizeParameters = (parameters = {}) => Object.fromEntries(
  Object.entries(parameters || {}).map(([key, value]) => {
    const sensitive = /token|password|secret|authorization|email|phone/i.test(key);
    return [key, sensitive ? '[redacted]' : value];
  })
);

export const getRequestTimeout = (url = '') => {
  const path = String(url).split('?')[0].replace(/^\/api/, '');
  if (/^\/frontend\/(settings|categories|offers|sliders)(\/|$)/.test(path)) return 4000;
  if (/^\/frontend\/products\/[^/]+$/.test(path)) return 6000;
  if (/^\/frontend\/products(\/|$)/.test(path)) return 6000;
  return 6000;
};

const performanceMark = (name) => {
  try {
    if (typeof performance !== 'undefined' && typeof performance.mark === 'function') {
      performance.mark(name);
    }
  } catch (_) {
    // Performance marks must never affect a customer request.
  }
};

export const recordApiMetric = (metric) => {
  const entry = { ...metric, recorded_at: new Date().toISOString() };
  apiMetrics.push(entry);
  if (apiMetrics.length > MAX_METRICS) apiMetrics.shift();
  if (typeof window !== 'undefined') {
    window.__mastergasApiMetrics = apiMetrics;
  }
  return entry;
};

export const getApiMetrics = () => [...apiMetrics];
export const clearApiMetrics = () => apiMetrics.splice(0, apiMetrics.length);

export const isCancelledRequest = (error) => Boolean(
  error?.code === 'ERR_CANCELED' ||
  error?.name === 'CanceledError' ||
  error?.name === 'AbortError' ||
  (typeof axios.isCancel === 'function' && axios.isCancel(error))
);

export const classifyApiError = (error) => {
  if (isCancelledRequest(error)) return 'cancelled';
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') return 'timeout';
  if (!error?.response) return 'network';
  if (error.response.status >= 500) return '5xx';
  if (error.response.status >= 400) return '4xx';
  return 'unknown';
};

/**
 * Attach only the token that belongs to the requested API surface.
 */
api.interceptors.request.use(config => {
  const storage = getStorage();
  const lang = storage?.getItem('lang') || 'ar';
  config.headers['Accept-Language'] = lang;

  const requestId = config.headers['X-Request-ID'] || `mg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  config.headers['X-Request-ID'] = requestId;
  config.timeout = config.timeout ?? getRequestTimeout(config.url);
  config.__mastergasRequest = {
    requestId,
    startedAt: performanceNow(),
    endpoint: getRequestPath(config),
    retryCount: config.__retryCount || 0,
  };
  if (!globalThis.__mastergasFirstApiRequest) {
    globalThis.__mastergasFirstApiRequest = true;
    performanceMark('mastergas:first-api-request');
  }
  performanceMark(`mastergas:api:start:${requestId}`);

  const requestUrl = config.url || '';
  const cleanPath = requestUrl.split('?')[0].replace(/^\/api/, '');
  const isFrontendRequest = cleanPath.startsWith('/frontend');
  const isAdminRequest = !isFrontendRequest && (
    cleanPath.startsWith('/dashboard') || 
    cleanPath.startsWith('/v1/admins') || 
    cleanPath.startsWith('/admin')
  );
  let token;

  if (isAdminRequest) {
    token = storage?.getItem('token');
  } else {
    // For all customer and website routes, use strictly the customer token (never fallback to admin token)
    token = storage?.getItem('c_token');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const performanceNow = () => {
  try {
    return typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
  } catch (_) {
    return Date.now();
  }
};

const finalizeMetric = (config, overrides = {}) => {
  const request = config?.__mastergasRequest || {};
  const start = request.startedAt || performanceNow();
  const duration = Math.max(0, performanceNow() - start);
  const requestId = request.requestId || config?.headers?.['X-Request-ID'];
  performanceMark(`mastergas:api:end:${requestId || 'unknown'}`);
  return recordApiMetric({
    endpoint: request.endpoint || getRequestPath(config),
    parameters: sanitizeParameters(config?.params || {}),
    start_time: start,
    end_time: start + duration,
    duration,
    status: overrides.status ?? null,
    retry_count: request.retryCount || 0,
    cache: overrides.cache || 'miss',
    aborted: Boolean(overrides.aborted),
    error_type: overrides.errorType,
  });
};

let appRouter = null;
export function setRouter(r) {
  appRouter = r;
}

let isRedirectingToAdminLogin = false;

api.interceptors.response.use(
  response => {
    finalizeMetric(response.config, { status: response.status });
    if (getRequestPath(response.config).startsWith('/frontend/products')) {
      performanceMark('mastergas:products-api-complete');
    }
    return response;
  },
  error => {
    finalizeMetric(error.config, {
      status: error.response?.status || null,
      aborted: isCancelledRequest(error),
      errorType: classifyApiError(error),
    });
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      const cleanPath = url.split('?')[0].replace(/^\/api/, '');
      const isFrontendReq = cleanPath.startsWith('/frontend');
      const isAdminReq = !isFrontendReq && (
        cleanPath.startsWith('/dashboard') || 
        cleanPath.startsWith('/v1/admins') || 
        cleanPath.startsWith('/admin')
      );
      const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

      if (isAdminReq || isAdminPath) {
        const storage = getStorage();
        storage?.removeItem('token');
        storage?.removeItem('admin');

        if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login' && !isRedirectingToAdminLogin) {
          isRedirectingToAdminLogin = true;
          if (appRouter && appRouter.currentRoute?.value?.path !== '/admin/login') {
            appRouter.push('/admin/login').finally(() => {
              isRedirectingToAdminLogin = false;
            });
          } else {
            window.location.replace('/admin/login');
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
