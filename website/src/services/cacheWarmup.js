import { productService } from '../modules/product/services/productService';
import { settingsService } from './settingsService';

// Skip speculative requests on data-saver or very slow connections.
const canPrefetch = () => {
  const connection = typeof navigator !== 'undefined' ? navigator.connection : null;
  if (!connection) return true;
  return !(connection.saveData || /(^|-)2g$/.test(connection.effectiveType || ''));
};

const whenIdle = (callback, timeout = 3000) => {
  if (typeof requestIdleCallback === 'function') requestIdleCallback(callback, { timeout });
  else setTimeout(callback, 1200);
};

const quiet = (promise) => Promise.resolve(promise).catch(() => {});

// After the first paint, fill the cache with the public data every page needs.
// Requests that the current page already made are de-duplicated by getCached,
// so this only adds the ones the visitor is likely to need next.
export const warmCriticalData = () => {
  if (typeof window === 'undefined') return;
  whenIdle(async () => {
    if (!canPrefetch()) return;
    await Promise.allSettled([
      quiet(settingsService.getSettings()),
      quiet(settingsService.getSliders()),
      quiet(productService.getCategories()),
      quiet(productService.getOffers()),
    ]);
    // The heavier catalogue calls go second so they never compete with the above.
    await Promise.allSettled([
      quiet(productService.getFeaturedProducts()),
      quiet(productService.getProducts({ is_active: 1 })),
    ]);
  });
};

// Hovering, focusing or touching a link starts loading both its route chunk
// and, for product pages, the product itself, so the click feels instant.
export const installLinkPrefetch = (router) => {
  if (typeof document === 'undefined') return;
  const seen = new Set();
  let hoverTimer = null;

  const prefetchLink = (anchor) => {
    if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
    const href = anchor.getAttribute('href');
    if (!href || !href.startsWith('/') || href.startsWith('//')) return;
    if (seen.has(href) || !canPrefetch()) return;
    seen.add(href);

    let resolved;
    try {
      resolved = router.resolve(href);
    } catch {
      return;
    }
    resolved.matched.forEach((record) => {
      const component = record.components?.default;
      if (typeof component === 'function') quiet(component());
    });
    if (resolved.name === 'ProductDetail' && resolved.params.id) {
      quiet(productService.getProductById(resolved.params.id));
    }
  };

  const anchorFrom = (event) => (event.target instanceof Element ? event.target.closest('a[href]') : null);

  document.addEventListener('pointerover', (event) => {
    if (event.pointerType === 'touch') return;
    const anchor = anchorFrom(event);
    if (!anchor) return;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => prefetchLink(anchor), 65);
  }, { passive: true });
  document.addEventListener('pointerout', () => clearTimeout(hoverTimer), { passive: true });
  document.addEventListener('touchstart', (event) => prefetchLink(anchorFrom(event)), { passive: true });
  document.addEventListener('focusin', (event) => prefetchLink(anchorFrom(event)));
};

// Coming back to the tab (or restoring it from the back/forward cache) counts
// as entering the site again: anything older than the refresh interval is
// fetched again, everything newer is left alone.
export const installRefreshOnReturn = () => {
  if (typeof document === 'undefined') return;
  let lastVisit = Date.now();
  const refreshIfDue = () => {
    const now = Date.now();
    if (document.visibilityState === 'hidden') return;
    if (now - lastVisit < 60 * 1000) return; // ignore quick tab flicks
    lastVisit = now;
    warmCriticalData();
  };
  document.addEventListener('visibilitychange', refreshIfDue);
  window.addEventListener('pageshow', (event) => { if (event.persisted) refreshIfDue(); });
};
