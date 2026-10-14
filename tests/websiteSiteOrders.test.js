process.env.TZ = 'Asia/Amman';

import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import {
  TIJARA_PRODUCT_IDS,
  toSiteOrder,
  toSiteOrderPayload,
} from '../website/src/domain/orders/siteOrder.js';

const checkoutData = (over = {}) => ({
  customer_name: 'Omar', customer_phone: '0790000000', customer_email: 'o@x.com',
  shipping_address: '12 Rainbow St, Amman', billing_address: '12 Rainbow St, Amman',
  total_amount: 9999, subtotal: 1, discount: 500, tax_amount: 0, shipping_cost: 25,
  payment_method: 'cod', use_wallet: false, wallet_amount: 0, coupon_code: null,
  notes: 'Ring the bell', is_gift: false,
  items: [{ product_id: 28, quantity: 2, unit_price: 1, attributes: { color: 'red' } }],
  ...over,
});

const rawOrder = (over = {}) => ({
  id: 41, order_number: 'ORD-ABC', status: 'paid_confirmed', payment_status: 'paid', payment_method: 'cash_on_delivery',
  subtotal: 1498.7000000000000455, discount: 0, shipping_cost: 25, tax_amount: 209.8200000000000145, total_amount: 1733.5200000000000955,
  shipping_address: '12 Rainbow St, Amman', billing_address: '12 Rainbow St, Amman', notes: 'n',
  created_at: '2026-10-13T22:30:00+00:00',
  items: [{ id: 1, product_id: 14, quantity: 2, unit_price: 974.35, total_price: 1948.7,
    product: { id: 14, name: 'Hob', image_url: 'https://backend-tijara.be-kite.com/storage/products/a.jpg' } }],
  ...over,
});

test('IDS website snapshot ids map to the live Tijara product ids (same price) and the BBQ grill has none', () => {
  assert.deepEqual(TIJARA_PRODUCT_IDS, { 25: 11, 26: 12, 27: 13, 28: 14, 30: 16 });
});

test('PAYLOAD maps the website checkout snapshot to the Tijara /site/orders contract', () => {
  assert.deepEqual(toSiteOrderPayload(checkoutData()), {
    shipping_address: '12 Rainbow St, Amman',
    billing_address: '12 Rainbow St, Amman',
    payment_method: 'cash_on_delivery',
    notes: 'Ring the bell',
    shipping_cost: 25,
    items: [{ product_id: 14, quantity: 2 }],
  });
});

test('PAYLOAD never sends client-side money, status or user fields', () => {
  const payload = toSiteOrderPayload(checkoutData());
  for (const key of ['total_amount', 'subtotal', 'discount', 'tax_amount', 'customer_id', 'status', 'payment_status', 'unit_price']) {
    assert.ok(!(key in payload), `${key} must not be sent`);
  }
  assert.ok(!('unit_price' in payload.items[0]));
});

test('PAYLOAD sends coupon_code only when there is one, and keeps notes free of the coupon prefix', () => {
  assert.equal('coupon_code' in toSiteOrderPayload(checkoutData()), false);
  const payload = toSiteOrderPayload(checkoutData({ coupon_code: 'SUMMER5250', notes: 'Coupon: SUMMER5250. Ring' }));
  assert.equal(payload.coupon_code, 'SUMMER5250');
  assert.equal(payload.notes, 'Ring');
});

test('PAYLOAD payment method: cod → cash_on_delivery, card → credit_card, wallet is unsupported', () => {
  assert.equal(toSiteOrderPayload(checkoutData({ payment_method: 'cod' })).payment_method, 'cash_on_delivery');
  assert.equal(toSiteOrderPayload(checkoutData({ payment_method: 'card' })).payment_method, 'credit_card');
  assert.throws(() => toSiteOrderPayload(checkoutData({ payment_method: 'wallet' })), /wallet|المحفظة/i);
});

test('PAYLOAD rejects a product that does not exist on Tijara before any request is sent', () => {
  assert.throws(() => toSiteOrderPayload(checkoutData({ items: [{ product_id: 29, quantity: 1 }] })), /29|غير متاح/);
  assert.throws(() => toSiteOrderPayload(checkoutData({ items: [] })));
});

test('PAYLOAD quantity is a positive integer and notes are capped at the API limit of 1000 chars', () => {
  assert.equal(toSiteOrderPayload(checkoutData({ items: [{ product_id: 25, quantity: '3' }] })).items[0].quantity, 3);
  assert.equal(toSiteOrderPayload(checkoutData({ items: [{ product_id: 25, quantity: 0 }] })).items[0].quantity, 1);
  assert.equal(toSiteOrderPayload(checkoutData({ notes: 'x'.repeat(1500) })).notes.length, 1000);
});

test('DOMAIN toSiteOrder maps Tijara order to the fields Profile and Invoice read, money rounded', () => {
  const order = toSiteOrder(rawOrder());
  assert.equal(order.id, 41);
  assert.equal(order.order_number, 'ORD-ABC');
  assert.equal(order.orderNumber, 'ORD-ABC');
  assert.equal(order.status, 'paid_confirmed');
  assert.equal(order.total_amount, 1733.52);
  assert.equal(order.total, 1733.52);
  assert.equal(order.subtotal, 1498.7);
  assert.equal(order.shipping, 25);
  assert.equal(order.tax, 209.82);
  assert.equal(order.date, '2026-10-14');
  assert.equal(order.customerAddress, '12 Rainbow St, Amman');
  assert.equal(order.payment_method, 'cash_on_delivery');
  assert.deepEqual(order.items[0], { id: 1, product_id: 14, name: 'Hob', quantity: 2, price: 974.35, total: 1948.7, image: 'https://backend-tijara.be-kite.com/public/storage/products/a.jpg' });
});

test('DOMAIN toSiteOrder survives empty payloads', () => {
  for (const input of [undefined, null, {}, { items: null }]) {
    const order = toSiteOrder(input);
    assert.deepEqual(order.items, []);
    assert.equal(order.total, 0);
  }
});

// ─── Wire level ─────────────────────────────────────────────────────────────
class MemoryStorage {
  constructor() { this.data = new Map(); }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
  clear() { this.data.clear(); }
  key(i) { return [...this.data.keys()][i] ?? null; }
  get length() { return this.data.size; }
}
const storage = new MemoryStorage();
globalThis.localStorage = storage;
globalThis.sessionStorage = new MemoryStorage();
globalThis.window = { location: { pathname: '/checkout', search: '', replace() {}, href: 'http://localhost/checkout' } };

let viteServer; let api; let checkoutService; let profileService; let invoiceService;
let calls = []; let respond = () => ({ data: [] });
const captureAdapter = async (config) => {
  calls.push({ method: config.method, url: config.url, params: config.params, headers: config.headers, data: config.data, local: Boolean(config.adapter && config.adapter !== captureAdapter) });
  return { data: respond(config), status: 200, statusText: 'OK', headers: {}, config };
};

before(async () => {
  viteServer = await createServer({ root: new URL('../website', import.meta.url).pathname, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
  api = (await viteServer.ssrLoadModule('/src/config/axios.js')).default;
  checkoutService = (await viteServer.ssrLoadModule('/src/modules/checkout/services/checkoutService.js')).default;
  profileService = (await viteServer.ssrLoadModule('/src/modules/profile/services/profileService.js')).profileService;
  invoiceService = (await viteServer.ssrLoadModule('/src/modules/invoice/services/invoiceService.js')).invoiceService;
});
after(async () => { await viteServer?.close(); });
beforeEach(() => {
  calls = []; respond = () => ({ data: [] }); storage.clear();
  storage.setItem('c_token', 'customer-token');
});

const stub = () => { api.defaults.adapter = captureAdapter; };

test('ROUTING /v1/site/orders bypasses the local snapshot and carries the customer token', async () => {
  const run = (url) => api.interceptors.request.handlers[0].fulfilled({ url, headers: {} });
  for (const url of ['/v1/site/orders', '/v1/site/orders/5']) {
    const config = await run(url);
    assert.equal(config.adapter, undefined, `${url} must be live`);
    assert.equal(config.headers.Authorization, 'Bearer customer-token');
  }
  assert.equal((await run('/v1/site/orders-export')).adapter, undefined, 'segment-safe Site routing stays live');
});

test('WIRE checkout createOrder POSTs the mapped payload to /v1/site/orders and returns the full response', async () => {
  stub();
  respond = () => ({ data: rawOrder() });
  const response = await checkoutService.createOrder(checkoutData(), 'key-1');
  assert.equal(calls[0].method, 'post');
  assert.equal(calls[0].url, '/v1/site/orders');
  assert.equal(calls[0].headers['Idempotency-Key'], 'key-1');
  assert.deepEqual(JSON.parse(calls[0].data).items, [{ product_id: 14, quantity: 2 }]);
  assert.equal(response.data.data.order_number, 'ORD-ABC');
});

test('WIRE checkout createOrder refuses an unsupported cart before any request', async () => {
  stub();
  await assert.rejects(() => checkoutService.createOrder(checkoutData({ items: [{ product_id: 29, quantity: 1 }] }), 'k'));
  assert.equal(calls.length, 0);
});

test('WIRE profile getOrders reads every page of /v1/site/orders and maps them', async () => {
  stub();
  respond = (config) => ({ data: [rawOrder({ id: config.params.page })], meta: { last_page: 2 } });
  const orders = await profileService.getOrders();
  assert.deepEqual(calls.map((c) => `${c.method} ${c.url} p${c.params.page}`), ['get /v1/site/orders p1', 'get /v1/site/orders p2']);
  assert.deepEqual(orders.map((o) => o.id), [1, 2]);
  assert.equal(orders[0].total_amount, 1733.52);
});

test('WIRE invoice getOrder reads /v1/site/orders/{id}', async () => {
  stub();
  respond = () => ({ data: rawOrder() });
  const order = await invoiceService.getOrder(41);
  assert.equal(calls[0].url, '/v1/site/orders/41');
  assert.equal(order.order_number, 'ORD-ABC');
  assert.equal(order.items[0].name, 'Hob');
});

test('WIRE invoice getOrder falls back to the order number via the list, and returns null when unknown', async () => {
  stub();
  respond = (config) => (config.url === '/v1/site/orders/ORD-ABC' ? Promise.reject(Object.assign(new Error('nf'), { response: { status: 404 } })) : { data: [rawOrder()], meta: { last_page: 1 } });
  api.defaults.adapter = async (config) => {
    calls.push({ url: config.url });
    if (config.url === '/v1/site/orders/ORD-ABC') { const e = new Error('nf'); e.response = { status: 404, data: {}, config }; e.config = config; throw e; }
    return { data: { data: [rawOrder()], meta: { last_page: 1 } }, status: 200, statusText: 'OK', headers: {}, config };
  };
  assert.equal((await invoiceService.getOrder('ORD-ABC'))?.id, 41);
  assert.equal(await invoiceService.getOrder('ORD-NOPE'), null);
});
