/**
 * Single source of truth for price formatting on the website.
 *
 * Digits are always Western (en-US) with "," thousands and "." decimals so the
 * amount reads identically in Arabic and English. Direction handling lives in
 * `PriceText.vue` / `.price-num` (markup) and `isolateLtr` (plain strings): the
 * amount is isolated as its own LTR run so the sign, separators and currency
 * never get reordered by the surrounding RTL paragraph.
 */

const LRI = '⁦'; // left-to-right isolate
const PDI = '⁩'; // pop directional isolate

const FRACTION_OPTIONS = {
  // 0 decimals for whole amounts, 2 otherwise (product cards, cart, wishlist)
  auto: (num) => ({ minimumFractionDigits: num % 1 !== 0 ? 2 : 0, maximumFractionDigits: 2 }),
  // always 2 decimals (checkout, orders, invoices)
  fixed: () => ({ minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  // rounded whole amounts (compact add-to-cart toast)
  none: () => ({ minimumFractionDigits: 0, maximumFractionDigits: 0 }),
};

/**
 * Wrap text in an LTR isolate so it keeps its visual order inside RTL text.
 */
export const isolateLtr = (text) => `${LRI}${text}${PDI}`;

/**
 * Format a numeric amount.
 * @param {number|string} value
 * @param {{ fraction?: 'auto'|'fixed'|'none', negative?: boolean, fallback?: string }} [options]
 */
export const formatPrice = (value, { fraction = 'auto', negative = false, fallback } = {}) => {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return fallback ?? formatPrice(0, { fraction });
  }
  const options = (FRACTION_OPTIONS[fraction] || FRACTION_OPTIONS.auto)(num);
  const text = Math.abs(num).toLocaleString('en-US', options);
  return negative || num < 0 ? `-${text}` : text;
};

/**
 * Amount + currency as a plain string (toasts, labels, printed invoices).
 * The amount is isolated so "-1,234.05 ريال" renders in the right visual order.
 */
export const formatPriceWithCurrency = (value, currency, options) => {
  const amount = isolateLtr(formatPrice(value, options));
  return currency ? `${amount} ${currency}` : amount;
};

/**
 * Amount + currency as an HTML fragment for printed documents (invoices).
 * `safeCurrency` must already be HTML-escaped by the caller.
 */
export const formatPriceHtml = (value, safeCurrency, options = { fraction: 'fixed' }) => {
  const amount = `<bdi dir="ltr" style="unicode-bidi:isolate;white-space:nowrap">${formatPrice(value, options)}</bdi>`;
  return safeCurrency ? `${amount} ${safeCurrency}` : amount;
};
