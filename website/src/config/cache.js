// Cache policy for public storefront data.
//
// Only the home page caches API data. Every other page asks the API on each
// visit, so prices, stock and content are always current there.
//
// On the home page the last response is kept (in memory and in localStorage)
// so it renders instantly, and the page asks the API again every
// HOME_REFRESH_INTERVAL_MS while it is open and visible.
const DEFAULT_HOME_REFRESH_SECONDS = 10;
const MIN_HOME_REFRESH_SECONDS = 5;
const MAX_HOME_REFRESH_SECONDS = 5 * 60;

const readSeconds = () => {
  const raw = Number(import.meta.env?.VITE_HOME_REFRESH_SECONDS);
  const seconds = Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_HOME_REFRESH_SECONDS;
  return Math.min(MAX_HOME_REFRESH_SECONDS, Math.max(MIN_HOME_REFRESH_SECONDS, seconds));
};

export const HOME_REFRESH_SECONDS = readSeconds();
export const HOME_REFRESH_INTERVAL_MS = HOME_REFRESH_SECONDS * 1000;

// A cached home response counts as fresh for one refresh interval.
export const HOME_CACHE_TTL_MS = HOME_REFRESH_INTERVAL_MS;
