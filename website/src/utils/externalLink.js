// Admin-managed links (sliders, banners) can be a full URL or a site path.
// `router-link` turns "https://…" into "/https://…", so classify them first.
const UNSAFE_SCHEME = /^(javascript|data|vbscript|file):/i;

export const resolveLink = (value, fallback = '/products') => {
  let raw = String(value ?? '').trim();
  if (!raw || UNSAFE_SCHEME.test(raw)) return { external: false, href: fallback };

  // Undo the "/https://…" that a router-link already produced.
  if (/^\/https?:\/\//i.test(raw)) raw = raw.slice(1);

  if (/^https?:\/\//i.test(raw)) return { external: true, href: raw };
  if (raw.startsWith('//')) return { external: true, href: `https:${raw}` };
  if (/^www\./i.test(raw)) return { external: true, href: `https://${raw}` };
  return { external: false, href: raw.startsWith('/') ? raw : `/${raw}` };
};

export const openExternal = (href) => {
  if (typeof window === 'undefined') return;
  window.open(href, '_blank', 'noopener,noreferrer');
};
