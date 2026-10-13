// Website ↔ Tijara `/v1/site/orders` contract, verified live in
// reports/tijara-orders-api-qa-2026-10-13.md.

// The website still renders the catalogue from the local snapshot (ids 25–30,
// pulled from the old backend). Tijara has the same products under other ids.
// Remove this table once the catalogue itself is served by the Tijara API.
// 29 (outdoor BBQ grill) does not exist on Tijara, so it cannot be ordered yet.
export const TIJARA_PRODUCT_IDS = { 25: 11, 26: 12, 27: 13, 28: 14, 30: 16 };

const NOTES_LIMIT = 1000;
const PAYMENT_METHODS = { cod: 'cash_on_delivery', cash: 'cash_on_delivery', cash_on_delivery: 'cash_on_delivery', card: 'credit_card', credit_card: 'credit_card' };

const toTijaraProductId = (id) => {
  const mapped = TIJARA_PRODUCT_IDS[Number(id)];
  if (!mapped) throw new Error(`المنتج رقم ${id} غير متاح للطلب حالياً`);
  return mapped;
};

export const toSiteOrderPayload = (order = {}) => {
  const method = PAYMENT_METHODS[String(order.payment_method || '').toLowerCase()];
  if (!method) throw new Error('طريقة الدفع غير مدعومة حالياً (المحفظة الإلكترونية غير متاحة في هذا النوع من الطلبات)');
  if (!Array.isArray(order.items) || order.items.length === 0) throw new Error('السلة فارغة');

  const code = order.coupon_code ? String(order.coupon_code).trim() : '';
  // The checkout view prepends "Coupon: CODE. " to the notes; the API has a coupon_code field for that.
  const notes = String(order.notes || '').replace(/^Coupon: [^.]*\.\s*/, '').trim().slice(0, NOTES_LIMIT);

  return {
    shipping_address: order.shipping_address,
    billing_address: order.billing_address || order.shipping_address,
    payment_method: method,
    ...(code ? { coupon_code: code } : {}),
    ...(notes ? { notes } : {}),
    shipping_cost: Math.max(0, Number(order.shipping_cost) || 0),
    items: order.items.map((item) => ({
      product_id: toTijaraProductId(item.product_id ?? item.id),
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
    })),
  };
};

export const money = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round((number + Number.EPSILON) * 100) / 100 : 0;
};

// `/storage/…` answers 403 on orders, `/public/storage/…` is the one that loads.
export const normalizeImageUrl = (url) => String(url ?? '').trim().replace(/^(https?:\/\/[^/]+)\/storage\//i, '$1/public/storage/');

const pad = (value) => String(value).padStart(2, '0');
const localDate = (iso) => {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const toItem = (item = {}) => ({
  id: item.id,
  product_id: item.product_id ?? item.product?.id,
  name: item.product?.name ?? '',
  quantity: Number(item.quantity) || 0,
  price: money(item.unit_price),
  total: money(item.total_price),
  image: normalizeImageUrl(item.product?.image_url),
});

// Keeps the snake_case keys Profile/Invoice already read, plus the camelCase aliases.
export const toSiteOrder = (raw) => {
  const order = raw || {};
  const address = String(order.shipping_address || '').trim() || String(order.billing_address || '').trim();
  return {
    id: order.id,
    order_number: order.order_number ?? '',
    orderNumber: order.order_number ?? '',
    status: order.status ?? '',
    payment_status: order.payment_status ?? '',
    payment_method: order.payment_method ?? '',
    shipping_address: order.shipping_address ?? '',
    customerAddress: address,
    notes: order.notes ?? '',
    coupon_code: order.coupon_code ?? '',
    created_at: order.created_at ?? null,
    date: localDate(order.created_at),
    subtotal: money(order.subtotal),
    discount: money(order.discount),
    shipping: money(order.shipping_cost),
    tax: money(order.tax_amount),
    total_amount: money(order.total_amount),
    total: money(order.total_amount),
    items: Array.isArray(order.items) ? order.items.map(toItem) : [],
  };
};
