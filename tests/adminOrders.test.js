process.env.TZ = 'Asia/Amman';

import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import {
  ORDER_STATUSES,
  ORDER_STEPS,
  ORDER_TRACKING_STEPS,
  canTransition,
  isFinalStatus,
  money,
  normalizeImageUrl,
  nextStatuses,
  paymentMethodLabel,
  statusLabel,
  trackingRank,
  trackingStepIcon,
  trackingStepState,
  trackingStatusLabel,
  toOrder,
  toStatusPayload,
} from '../admin/src/domain/orders/adminOrder.js';

// Shape captured from the live Tijara API (reports/tijara-orders-api-qa-2026-10-13.md).
const rawOrder = (over = {}) => ({
  id: 6,
  order_number: 'ORD-WUIQMFHIOH',
  status: 'pending',
  payment_status: 'unpaid',
  payment_method: 'cash_on_delivery',
  transaction_id: null,
  coupon_code: null,
  discount_code: null,
  subtotal: 876.8500000000000227373675443232059478759765625,
  discount: 0,
  shipping_cost: 25,
  tax_amount: 122.7600000000000051159076974727213382720947265625,
  total_amount: 1024.609999999999899955582804977893829345703125,
  shipping_address: '12 Rainbow St, Amman',
  billing_address: '12 Rainbow St, Amman',
  notes: 'Ring the bell',
  shipped_at: null,
  delivered_at: null,
  payment_time: null,
  estimated_delivery: '2026-10-18T09:13:24+00:00',
  created_at: '2026-10-13T09:13:24+00:00',
  updated_at: '2026-10-13T09:13:24+00:00',
  user: { id: 2, name: 'admin', email: 'admin@mastergas.com' },
  items: [{
    id: 9, order_id: 6, product_id: 16, quantity: 2,
    unit_price: 876.8500000000000227373675443232059478759765625,
    total_price: 1753.7000000000000454747350886464118957519531250,
    product: { id: 16, name: 'Water Heater', image_url: 'https://cdn.test/heater.jpg' },
  }],
  ...over,
});

// ─── Browser globals the admin axios client expects ─────────────────────────
class MemoryStorage {
  constructor() { this.data = new Map(); }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
  clear() { this.data.clear(); }
}
const storage = new MemoryStorage();
globalThis.localStorage = storage;
globalThis.window = { location: { pathname: '/admin/orders', replace() {}, href: 'http://localhost/admin/orders' } };

let viteServer;
let api;
let tijaraAdminApi;
let adminOrderService;
let calls = [];
let respond = () => ({ data: [] });

const captureAdapter = async (config) => {
  calls.push({ method: config.method, url: config.url, params: config.params, headers: config.headers, data: config.data, local: Boolean(config.__localApi) });
  return { data: respond(config), status: 200, statusText: 'OK', headers: {}, config };
};

before(async () => {
  viteServer = await createServer({
    root: new URL('../admin', import.meta.url).pathname,
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  });
  api = (await viteServer.ssrLoadModule('/src/config/axios.js')).default;
  tijaraAdminApi = (await viteServer.ssrLoadModule('/src/infrastructure/api/tijaraAdminApi.js')).default;
  adminOrderService = (await viteServer.ssrLoadModule('/src/application/adminOrderService.js')).default;
  api.defaults.adapter = captureAdapter;
});

after(async () => { await viteServer?.close(); });

beforeEach(() => {
  calls = [];
  respond = () => ({ data: [] });
  storage.clear();
  storage.setItem('token', 'admin-token');
});

// ════════════════════════════════════════════════════════════════════════════
// 1. DOMAIN — mapper (API → OrdersView)
// ════════════════════════════════════════════════════════════════════════════
test('DOMAIN toOrder: maps the Tijara order onto the fields OrdersView renders', () => {
  const order = toOrder(rawOrder());
  assert.equal(order.id, 6);
  assert.equal(order.orderNumber, 'ORD-WUIQMFHIOH');
  assert.equal(order.status, 'pending');
  assert.equal(order.paymentStatus, 'unpaid');
  assert.equal(order.paymentMethod, 'cash_on_delivery');
  assert.equal(order.customerName, 'admin');
  assert.equal(order.customerEmail, 'admin@mastergas.com');
  assert.equal(order.customerAddress, '12 Rainbow St, Amman');
  assert.equal(order.notes, 'Ring the bell');
});

test('DOMAIN toOrder: money is rounded to 2 decimals (API returns raw float noise)', () => {
  const order = toOrder(rawOrder());
  assert.equal(order.subtotal, 876.85);
  assert.equal(order.tax, 122.76);
  assert.equal(order.shipping, 25);
  assert.equal(order.discount, 0);
  assert.equal(order.total, 1024.61);
  assert.equal(money('12.345'), 12.35);
  assert.equal(money(undefined), 0);
  assert.equal(money('abc'), 0);
});

test('DOMAIN toOrder: items become products with name, image, quantity and unit price', () => {
  const [product] = toOrder(rawOrder()).products;
  assert.deepEqual(product, { id: 9, productId: 16, name: 'Water Heater', image: 'https://cdn.test/heater.jpg', quantity: 2, price: 876.85, total: 1753.7 });
});

test('REGRESSION order item images: backend returns /storage/… (HTTP 403) but /public/storage/… is the one that loads', () => {
  const host = 'https://backend-tijara.be-kite.com';
  assert.equal(normalizeImageUrl(`${host}/storage/products/a.jpg`), `${host}/public/storage/products/a.jpg`);
  assert.equal(normalizeImageUrl(`${host}/public/storage/products/a.jpg`), `${host}/public/storage/products/a.jpg`, 'already-correct URLs are untouched');
  assert.equal(normalizeImageUrl('https://cdn.test/heater.jpg'), 'https://cdn.test/heater.jpg', 'foreign hosts are untouched');
  assert.equal(normalizeImageUrl(`${host}/storage/a.jpg?v=2`), `${host}/public/storage/a.jpg?v=2`);
  for (const empty of [undefined, null, '', '   ']) assert.equal(normalizeImageUrl(empty), '');
  const [product] = toOrder(rawOrder({ items: [{ id: 1, product_id: 16, quantity: 1, unit_price: 1, total_price: 1, product: { id: 16, name: 'X', image_url: `${host}/storage/products/a.jpg` } }] })).products;
  assert.equal(product.image, `${host}/public/storage/products/a.jpg`);
});

test('DOMAIN toOrder: product image falls back to images[] primary when image_url is missing', () => {
  const host = 'https://backend-tijara.be-kite.com';
  const product = { id: 16, name: 'X', images: [{ image_url: `${host}/public/storage/p/2.jpg` }, { image_url: `${host}/public/storage/p/1.jpg`, is_primary: true }] };
  const [item] = toOrder(rawOrder({ items: [{ id: 1, quantity: 1, unit_price: 1, total_price: 1, product }] })).products;
  assert.equal(item.image, `${host}/public/storage/p/1.jpg`);
});

test('DOMAIN toOrder: address falls back shipping → billing, and is empty (not "undefined") when both are missing', () => {
  assert.equal(toOrder(rawOrder({ shipping_address: '', billing_address: 'Bill St' })).customerAddress, 'Bill St');
  assert.equal(toOrder(rawOrder({ shipping_address: '  ', billing_address: null })).customerAddress, '');
  assert.equal(toOrder(rawOrder({ shipping_address: 'Ship St', billing_address: 'Bill St' })).customerAddress, 'Ship St');
});

test('DOMAIN toOrder: date/time are local (Asia/Amman) and date is YYYY-MM-DD for the date filter', () => {
  const order = toOrder(rawOrder({ created_at: '2026-10-13T22:30:00+00:00' }));
  assert.equal(order.date, '2026-10-14');
  assert.equal(order.time, '01:30');
});

test('DOMAIN toOrder: phone is empty when the API omits it; falls back across known keys', () => {
  assert.equal(toOrder(rawOrder()).customerPhone, '');
  assert.equal(toOrder(rawOrder({ user: { name: 'A', phone_number: '0790000000' } })).customerPhone, '0790000000');
});

test('DOMAIN toOrder: survives empty / partial payloads without throwing', () => {
  for (const input of [undefined, null, {}, { items: null, user: null }, { items: [{}] }]) {
    const order = toOrder(input);
    assert.ok(Array.isArray(order.products));
    assert.equal(order.total, 0);
    assert.equal(order.customerName, '');
    assert.equal(order.date, '');
  }
  assert.equal(toOrder({ items: [{}] }).products[0].quantity, 0);
});

test('DOMAIN toOrder: a deleted product still renders a row', () => {
  const [product] = toOrder(rawOrder({ items: [{ id: 1, product_id: 99, quantity: 1, unit_price: 10, total_price: 10, product: null }] })).products;
  assert.equal(product.name, '');
  assert.equal(product.image, '');
  assert.equal(product.price, 10);
});

// ════════════════════════════════════════════════════════════════════════════
// 2. DOMAIN — status state machine (the backend accepts any → any, see QA HIGH-1)
// ════════════════════════════════════════════════════════════════════════════
test('STATUS enum matches the API exactly (no legacy "completed")', () => {
  assert.deepEqual(ORDER_STATUSES, ['pending', 'paid_confirmed', 'processing', 'shipped', 'delivered', 'cancelled']);
  assert.deepEqual(ORDER_STEPS, ['pending', 'paid_confirmed', 'processing', 'shipped', 'delivered']);
  for (const status of ORDER_STATUSES) assert.notEqual(statusLabel(status), status, `${status} needs an Arabic label`);
  assert.equal(statusLabel('weird'), 'weird');
  assert.equal(trackingStatusLabel('pending'), 'تم استلام الطلب');
  assert.equal(trackingStatusLabel('paid_confirmed'), 'تم تأكيد الطلب');
  assert.equal(trackingStatusLabel('processing'), 'تم تجهيز الطلب');
  assert.equal(trackingStatusLabel('shipped'), 'تم الشحن');
  assert.equal(trackingStatusLabel('delivered'), 'تم الاستلام');
});

test('STATUS forward flow: pending → paid_confirmed → processing → shipped → delivered', () => {
  for (let i = 0; i < ORDER_STEPS.length - 1; i += 1) {
    assert.ok(canTransition(ORDER_STEPS[i], ORDER_STEPS[i + 1]), `${ORDER_STEPS[i]} → ${ORDER_STEPS[i + 1]}`);
  }
});

test('STATUS cannot skip steps', () => {
  assert.equal(canTransition('pending', 'processing'), false);
  assert.equal(canTransition('pending', 'shipped'), false);
  assert.equal(canTransition('pending', 'delivered'), false);
  assert.equal(canTransition('paid_confirmed', 'delivered'), false);
});

test('STATUS cannot move backward or repeat the same status', () => {
  assert.equal(canTransition('delivered', 'processing'), false);
  assert.equal(canTransition('shipped', 'processing'), false);
  assert.equal(canTransition('processing', 'pending'), false);
  assert.equal(canTransition('pending', 'pending'), false);
});

test('STATUS cancel is allowed only before shipping', () => {
  assert.ok(canTransition('pending', 'cancelled'));
  assert.ok(canTransition('paid_confirmed', 'cancelled'));
  assert.ok(canTransition('processing', 'cancelled'));
  assert.equal(canTransition('shipped', 'cancelled'), false);
  assert.equal(canTransition('delivered', 'cancelled'), false);
});

test('STATUS delivered and cancelled are final', () => {
  assert.deepEqual(nextStatuses('delivered'), []);
  assert.deepEqual(nextStatuses('cancelled'), []);
  assert.ok(isFinalStatus('delivered'));
  assert.ok(isFinalStatus('cancelled'));
  assert.equal(isFinalStatus('pending'), false);
  assert.deepEqual(nextStatuses('unknown'), []);
});

test('TRACKING timeline matches the website six-stage contract', () => {
  assert.deepEqual(
    ORDER_TRACKING_STEPS.map(({ key, label, icon }) => [key, label, icon]),
    [
      ['received', 'تم استلام الطلب', 'fas fa-inbox'],
      ['confirmed', 'تم تأكيد الطلب', 'fas fa-clipboard-check'],
      ['processing', 'تم تجهيز الطلب', 'fas fa-box-open'],
      ['shipped', 'تم الشحن', 'fas fa-box'],
      ['transit', 'الطلب في الطريق', 'fas fa-truck'],
      ['delivered', 'تم الاستلام', 'fas fa-house'],
    ],
  );

  const pending = toOrder(rawOrder());
  assert.equal(trackingRank(pending), 1);
  assert.equal(trackingStepState(pending, 1), 'active');
  assert.equal(trackingStepState(pending, 2), 'pending');
  assert.equal(trackingStepIcon(ORDER_TRACKING_STEPS[0], 'active'), 'fas fa-check');
  assert.equal(trackingStepIcon(ORDER_TRACKING_STEPS[1], 'pending'), 'fas fa-clipboard-check');

  const delivered = toOrder(rawOrder({ status: 'delivered', delivered_at: '2026-10-14T09:00:00+00:00' }));
  assert.equal(trackingRank(delivered), 6);
  assert.equal(trackingStepState(delivered, 5), 'completed');
  assert.equal(trackingStepState(delivered, 6), 'active');
  assert.equal(trackingStepIcon(ORDER_TRACKING_STEPS[5], 'active'), 'fas fa-check');
});

test('PAYLOAD paid_confirmed also marks the payment as paid (backend leaves it unpaid, QA MEDIUM-5)', () => {
  assert.deepEqual(toStatusPayload('pending', 'paid_confirmed'), { status: 'paid_confirmed', payment_status: 'paid' });
  assert.deepEqual(toStatusPayload('processing', 'shipped'), { status: 'shipped' });
});

test('PAYLOAD illegal transitions throw instead of reaching the API', () => {
  assert.throws(() => toStatusPayload('delivered', 'pending'));
  assert.throws(() => toStatusPayload('cancelled', 'processing'));
  assert.throws(() => toStatusPayload('pending', 'refunded'));
});

test('LABEL payment method: known keys translated, unknown shown raw, missing has a placeholder', () => {
  assert.equal(paymentMethodLabel('cash_on_delivery'), 'دفع عند الاستلام');
  assert.equal(paymentMethodLabel('credit_card'), 'بطاقة ائتمان');
  assert.equal(paymentMethodLabel('bitcoin'), 'bitcoin');
  assert.equal(paymentMethodLabel(null), 'غير محدد');
});

// ════════════════════════════════════════════════════════════════════════════
// 3. WIRE — endpoints and verbs
// ════════════════════════════════════════════════════════════════════════════
test('WIRE orders endpoints hit the documented URL + verb', async () => {
  await tijaraAdminApi.listOrders({ status: 'pending', page: 2 });
  await tijaraAdminApi.getOrder(6);
  await tijaraAdminApi.updateOrder(6, { status: 'shipped' });
  await tijaraAdminApi.deleteOrder(6);
  assert.deepEqual(calls.map((c) => `${c.method} ${c.url}`), ['get /v1/orders', 'get /v1/orders/6', 'patch /v1/orders/6', 'delete /v1/orders/6']);
  assert.deepEqual(calls[0].params, { status: 'pending', page: 2 });
  assert.deepEqual(JSON.parse(calls[2].data), { status: 'shipped' });
});

test('WIRE REGRESSION: deleting an order never touches /v1/products (Postman collection bug)', async () => {
  await adminOrderService.deleteOrder(5);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, 'delete');
  assert.equal(calls[0].url, '/v1/orders/5');
  assert.ok(!calls[0].url.includes('products'));
});

test('WIRE deleteOrder refuses a missing id instead of calling DELETE /v1/orders/undefined', async () => {
  await assert.rejects(() => adminOrderService.deleteOrder(undefined));
  await assert.rejects(() => adminOrderService.deleteOrder(''));
  assert.equal(calls.length, 0);
});

test('ROUTING /v1/orders goes to the live API with the admin token, not the local snapshot', async () => {
  await tijaraAdminApi.listOrders();
  await tijaraAdminApi.deleteOrder(3);
  for (const call of calls) {
    assert.equal(call.local, false, `${call.url} must be live`);
    assert.equal(call.headers.Authorization, 'Bearer admin-token');
  }
  const config = await api.interceptors.request.handlers[0].fulfilled({ url: '/v1/orders-export', headers: {} });
  assert.equal(config.__localApi, true, 'prefix match must be segment-safe');
});

// ════════════════════════════════════════════════════════════════════════════
// 4. SERVICE
// ════════════════════════════════════════════════════════════════════════════
test('SERVICE listOrders walks every page (API is fixed at 20/page) and maps each order', async () => {
  respond = (config) => {
    const page = config.params?.page || 1;
    return { data: [rawOrder({ id: page })], meta: { current_page: page, last_page: 3, total: 3 } };
  };
  const orders = await adminOrderService.listOrders();
  assert.deepEqual(calls.map((c) => c.params.page), [1, 2, 3]);
  assert.deepEqual(orders.map((o) => o.id), [1, 2, 3]);
  assert.equal(orders[0].orderNumber, 'ORD-WUIQMFHIOH');
});

test('SERVICE listOrders returns [] on empty / malformed bodies', async () => {
  for (const body of [{ data: [] }, {}, null, '']) {
    respond = () => body;
    assert.deepEqual(await adminOrderService.listOrders(), []);
  }
});

test('SERVICE getOrder unwraps and maps the order', async () => {
  respond = () => ({ data: rawOrder() });
  const order = await adminOrderService.getOrder(6);
  assert.equal(order.total, 1024.61);
});

test('SERVICE updateStatus sends PATCH and returns the mapped order', async () => {
  respond = () => ({ data: rawOrder({ status: 'paid_confirmed', payment_status: 'paid' }) });
  const updated = await adminOrderService.updateStatus({ id: 6, status: 'pending' }, 'paid_confirmed');
  assert.equal(calls[0].method, 'patch');
  assert.equal(calls[0].url, '/v1/orders/6');
  assert.deepEqual(JSON.parse(calls[0].data), { status: 'paid_confirmed', payment_status: 'paid' });
  assert.equal(updated.status, 'paid_confirmed');
  assert.equal(updated.paymentStatus, 'paid');
});

test('SERVICE updateStatus blocks illegal transitions before any request is sent', async () => {
  await assert.rejects(() => adminOrderService.updateStatus({ id: 6, status: 'delivered' }, 'pending'));
  await assert.rejects(() => adminOrderService.updateStatus({ id: 6, status: 'cancelled' }, 'delivered'));
  await assert.rejects(() => adminOrderService.updateStatus({ id: 6, status: 'pending' }, 'delivered'));
  assert.equal(calls.length, 0);
});

test('SERVICE countOrders reads meta.total from a single request', async () => {
  respond = () => ({ data: [rawOrder()], meta: { total: 33, last_page: 2 } });
  assert.equal(await adminOrderService.countOrders(), 33);
  assert.equal(calls.length, 1);
  respond = () => ({});
  assert.equal(await adminOrderService.countOrders(), 0);
});
