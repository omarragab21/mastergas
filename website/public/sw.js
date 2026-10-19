/* Mastergas static-asset cache. API requests are never intercepted. */
const VERSION = 'v1';
const STATIC_CACHE = `mg-static-${VERSION}`;
const IMAGE_CACHE = `mg-images-${VERSION}`;
const PAGE_CACHE = `mg-pages-${VERSION}`;
const KNOWN_CACHES = [STATIC_CACHE, IMAGE_CACHE, PAGE_CACHE];

const MAX_IMAGES = 250;
const NAVIGATION_TIMEOUT_MS = 4000;
// Vite emits content-hashed files (name-AbC123xy.js), which can never change.
const HASHED_ASSET = /^\/assets\/.+-[A-Za-z0-9_-]{8,}\.(?:js|css|woff2?|ttf|png|jpe?g|webp|avif|svg|gif)$/;
const EXTERNAL_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'backend-tijara.be-kite.com'];

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => !KNOWN_CACHES.includes(name)).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

const trim = async (cacheName, max) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((key) => cache.delete(key)));
};

const cacheable = (response) => response && (response.ok || response.type === 'opaque');

const cacheFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (cacheable(response)) cache.put(request, response.clone());
  return response;
};

const staleWhileRevalidate = async (event, cacheName, max) => {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(event.request);
  const refresh = fetch(event.request).then((response) => {
    if (cacheable(response)) {
      cache.put(event.request, response.clone()).then(() => (max ? trim(cacheName, max) : null));
    }
    return response;
  });
  if (hit) {
    event.waitUntil(refresh.catch(() => {}));
    return hit;
  }
  return refresh;
};

// HTML is always fetched fresh so a new deployment is picked up on the next
// visit; the cached shell is only a fallback for flaky or offline networks.
const networkFirstPage = async (event) => {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await Promise.race([
      fetch(event.request),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), NAVIGATION_TIMEOUT_MS)),
    ]);
    if (response.ok && (response.headers.get('content-type') || '').includes('text/html')) {
      cache.put('/index.html', response.clone());
    }
    return response;
  } catch {
    const shell = await cache.match('/index.html');
    if (shell) return shell;
    return fetch(event.request);
  }
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || request.headers.has('range')) return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (!sameOrigin) {
    if (!EXTERNAL_HOSTS.includes(url.hostname)) return;
    // Only static-looking external requests; the backend's JSON API is left alone.
    if (url.hostname === 'backend-tijara.be-kite.com' && request.destination !== 'image') return;
    if (request.destination === 'image') event.respondWith(staleWhileRevalidate(event, IMAGE_CACHE, MAX_IMAGES));
    else event.respondWith(staleWhileRevalidate(event, STATIC_CACHE));
    return;
  }

  if (url.pathname.startsWith('/api/') || url.pathname === '/sw.js') return;

  if (request.mode === 'navigate') {
    // Real files (sitemap.xml, feeds, verification files) are not the SPA shell.
    if (/\.[a-z0-9]+$/i.test(url.pathname)) return;
    event.respondWith(networkFirstPage(event));
    return;
  }
  if (HASHED_ASSET.test(url.pathname) || url.pathname.startsWith('/fonts/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  if (request.destination === 'image' || url.pathname.startsWith('/storage/')) {
    event.respondWith(staleWhileRevalidate(event, IMAGE_CACHE, MAX_IMAGES));
    return;
  }
  if (['script', 'style', 'font'].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(event, STATIC_CACHE));
  }
});
