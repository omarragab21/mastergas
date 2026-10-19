// Admin-managed links (sliders, banners) can be a full URL or a site path.
// `router-link` turns "https://…" into "/https://…", so classify them first.
const UNSAFE_SCHEME = /^(javascript|data|vbscript|file|blob):/i;
const stripControlCharacters = (value) => [...String(value)].filter((char) => {
  const code = char.charCodeAt(0);
  return code > 31 && code !== 127;
}).join('');

const isGenericSearchDestination = (value) => {
  try {
    const url = new URL(value);
    return /(?:^|\.)google\.[a-z.]+$/i.test(url.hostname);
  } catch {
    return false;
  }
};

export const resolveLink = (value, fallback = '/products') => {
  let raw = stripControlCharacters(value ?? '').trim();
  const schemeProbe = raw.replace(/\s+/g, '');
  if (!raw || UNSAFE_SCHEME.test(schemeProbe)) return { external: false, href: fallback };

  // Undo the "/https://…" that a router-link already produced.
  if (/^\/https?:\/\//i.test(raw)) raw = raw.slice(1);

  if (/^https?:\/\//i.test(raw)) {
    return isGenericSearchDestination(raw)
      ? { external: false, href: fallback }
      : { external: true, href: raw };
  }
  if (raw.startsWith('//')) {
    const href = `https:${raw}`;
    return isGenericSearchDestination(href)
      ? { external: false, href: fallback }
      : { external: true, href };
  }
  if (/^www\./i.test(raw)) {
    const href = `https://${raw}`;
    return isGenericSearchDestination(href)
      ? { external: false, href: fallback }
      : { external: true, href };
  }
  const safePath = raw.replace(/^[\\/]+/, '');
  return { external: false, href: `/${safePath}` };
};

export const openExternal = (href) => {
  if (typeof window === 'undefined') return;
  const resolved = resolveLink(href, '');
  if (!resolved.href) return;
  const win = window.open(resolved.href, '_blank', 'noopener,noreferrer');
  if (win) win.opener = null;
};
