// Central cache policy for public storefront data.
//
// Data is fetched once, kept (in memory and in localStorage) for the refresh
// interval, and fetched again the first time the visitor opens the site after
// that interval has passed. Until then no network request is made for it.
//
// Change the interval in ONE place: set VITE_CACHE_REFRESH_MINUTES in the
// environment (e.g. 60 for an hour), or edit DEFAULT_REFRESH_MINUTES below.
const DEFAULT_REFRESH_MINUTES = 30;
const MIN_REFRESH_MINUTES = 1;
const MAX_REFRESH_MINUTES = 24 * 60;

const readMinutes = () => {
  const raw = Number(import.meta.env?.VITE_CACHE_REFRESH_MINUTES);
  const minutes = Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_REFRESH_MINUTES;
  return Math.min(MAX_REFRESH_MINUTES, Math.max(MIN_REFRESH_MINUTES, minutes));
};

export const REFRESH_MINUTES = readMinutes();
export const REFRESH_INTERVAL_MS = REFRESH_MINUTES * 60 * 1000;

// Per-group intervals. Every group follows the global interval by default; set
// a number of minutes on a group only if it needs its own rhythm (for example
// `products: 10` to refresh prices and stock more often).
const GROUP_MINUTES = Object.freeze({
  settings: null,
  categories: null,
  sliders: null,
  topics: null,
  offers: null,
  products: null,
  productDetail: null,
  countries: null,
  cities: null,
  shippingRates: null,
});

export const API_TTL = Object.freeze(
  Object.fromEntries(
    Object.entries(GROUP_MINUTES).map(([group, minutes]) => [group, (minutes ?? REFRESH_MINUTES) * 60 * 1000]),
  ),
);
