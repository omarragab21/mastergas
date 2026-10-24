// Skip speculative requests on data-saver or very slow connections.
const canPrefetch = () => {
  const connection = typeof navigator !== 'undefined' ? navigator.connection : null;
  if (!connection) return true;
  return !(connection.saveData || /(^|-)2g$/.test(connection.effectiveType || ''));
};

const quiet = (promise) => Promise.resolve(promise).catch(() => {});

// Hovering, focusing or touching a link starts loading its route chunk so the
// click feels instant. Page data is not prefetched: outside the home page it
// is always fetched fresh when the page opens.
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
