import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import {
  categoryName,
  dataFromResponse,
  listFromResponse,
  toAttribute,
  toAttributeOptionPayload,
  toAttributePayload,
  toAttributeUpdatePayload,
  toCategory,
  toCategoryPayload,
  toDiscountCode,
  toDiscountPayload,
  toLines,
  toProduct,
  toProductPayload,
} from '../admin/src/domain/catalog/adminCatalog.js';

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
globalThis.window = { location: { pathname: '/admin/products', replace() {}, href: 'http://localhost/admin/products' } };

let viteServer;
let api;
let tijaraAdminApi;
let adminCatalogService;
let productAttributeService;
let calls = [];
let nextResponse = { data: { data: [] } };

// Replaces the network layer so we can assert exactly what the UI would send.
const captureAdapter = async (config) => {
  calls.push({
    method: config.method,
    url: config.url,
    headers: config.headers,
    data: config.data,
    adapterWasLocal: Boolean(config.__localApi),
  });
  return { data: nextResponse, status: 200, statusText: 'OK', headers: {}, config };
};

const formEntries = (body) => [...body.entries()].map(([key, value]) => [key, value instanceof Blob ? `file:${value.name}` : value]);

before(async () => {
  viteServer = await createServer({
    root: new URL('../admin', import.meta.url).pathname,
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  });
  api = (await viteServer.ssrLoadModule('/src/config/axios.js')).default;
  tijaraAdminApi = (await viteServer.ssrLoadModule('/src/infrastructure/api/tijaraAdminApi.js')).default;
  adminCatalogService = (await viteServer.ssrLoadModule('/src/application/adminCatalogService.js')).default;
  productAttributeService = (await viteServer.ssrLoadModule('/src/services/productAttributeService.js')).productAttributeService;
  api.defaults.adapter = captureAdapter;
});

after(async () => { await viteServer?.close(); });

beforeEach(() => {
  calls = [];
  nextResponse = { data: [] };
  storage.clear();
  storage.setItem('token', 'admin-token');
});

// ════════════════════════════════════════════════════════════════════════════
// 1. DOMAIN — mappers (API → UI)
// ════════════════════════════════════════════════════════════════════════════
test('DOMAIN toCategory: survives empty / null-ish input without throwing', () => {
  for (const input of [undefined, {}, { translations: null }, { sub_categories: null }, { parent: null }]) {
    const category = toCategory(input);
    assert.deepEqual(category.sub_categories, []);
    assert.equal(category.parent, null);
    assert.equal(category.products_count, 0);
  }
});

test('DOMAIN toCategory: name fallbacks ar → name, en → name; image_url wins over image', () => {
  const c = toCategory({ name: 'Plain', image_url: '/a.png', image: '/b.png' });
  assert.deepEqual(c.name_i18n, { ar: 'Plain', en: 'Plain' });
  assert.equal(c.image, '/a.png');
  assert.equal(toCategory({ image: '/b.png' }).image, '/b.png');
});

test('DOMAIN toCategory: is_active only false for false/0 (string "0" and null stay active — documented behaviour)', () => {
  assert.equal(toCategory({ is_active: false }).is_active, false);
  assert.equal(toCategory({ is_active: 0 }).is_active, false);
  assert.equal(toCategory({ is_active: 1 }).is_active, true);
  assert.equal(toCategory({}).is_active, true);
});

test('DOMAIN toCategory: products_count is coerced to a number (string / camelCase / garbage)', () => {
  assert.equal(toCategory({ products_count: '7' }).products_count, 7);
  assert.equal(toCategory({ productsCount: 3 }).products_count, 3);
  assert.ok(Number.isNaN(toCategory({ products_count: 'abc' }).products_count), 'garbage count becomes NaN – UI would print NaN');
});

test('DOMAIN toCategory: nested parent and children are mapped recursively', () => {
  const c = toCategory({
    id: 2, parent: { id: 1, translations: { ar: { name: 'أب' } } },
    sub_categories: [{ id: 3, translations: { ar: { name: 'ابن' } } }],
  });
  assert.equal(c.parent.name_i18n.ar, 'أب');
  assert.equal(c.sub_categories[0].name_i18n.ar, 'ابن');
});

test('DOMAIN toProduct: stock/quantity prefer `number`, keep a legitimate 0', () => {
  assert.equal(toProduct({ number: 0, quantity: 9 }).stock, 0);
  assert.equal(toProduct({ quantity: 9 }).stock, 9);
  assert.equal(toProduct({ stock: 4 }).stock, 4);
  assert.equal(toProduct({}).stock, undefined);
});

test('DOMAIN toProduct: status and discount edge cases', () => {
  assert.equal(toProduct({ is_active: false }).status, 'inactive');
  assert.equal(toProduct({ is_active: 0 }).status, 'inactive');
  assert.equal(toProduct({ is_active: 1 }).status, 'active');
  assert.equal(toProduct({ discount_percentage: 0, discount: 5 }).discount, 0, '0% must not fall through to the legacy field');
  assert.equal(toProduct({ discount: 5 }).discount, 5);
  assert.equal(toProduct({}).discount, 0);
});

test('DOMAIN toProduct: images accept strings, {image_url}, {url}, {image}; drop empties; tolerate missing', () => {
  const p = toProduct({ images: ['/a.jpg', { image_url: '/b.jpg' }, { url: '/c.jpg' }, { image: '/d.jpg' }, {}, { image_url: '' }] });
  assert.deepEqual(p.images, ['/a.jpg', '/b.jpg', '/c.jpg', '/d.jpg']);
  assert.deepEqual(toProduct({}).images, []);
  assert.deepEqual(toProduct({ images: null }).images, []);
});

test('DOMAIN toProduct: category object is mapped, string category is kept, category_id derived', () => {
  const withObject = toProduct({ category: { id: 5, name: 'X', translations: { ar: { name: 'س' } } } });
  assert.equal(withObject.category_id, 5);
  assert.equal(withObject.category.name_i18n.ar, 'س');
  assert.equal(toProduct({ category: 'Legacy', category_id: 2 }).category, 'Legacy');
  assert.equal(toProduct({ category_id: 8 }).category_id, 8);
});

test('DOMAIN toProduct: long-text fields keep API arrays intact (regression: view crashed on .split)', () => {
  const p = toProduct({ translations: { ar: { tips: ['نصيحة 1', 'نصيحة 2'], key_features: ['م1'] } } });
  assert.deepEqual(p.tips_i18n.ar, ['نصيحة 1', 'نصيحة 2']);
  assert.deepEqual(p.features_i18n.ar, ['م1']);
});

// Regression BUG-2 / BUG-3 (fixed 2026-10-12)
test('REGRESSION toLines never throws and always returns string lines (product view modal crash)', () => {
  assert.deepEqual(toLines(['a', 'b']), ['a', 'b']);
  assert.deepEqual(toLines('a\nb'), ['a', 'b']);
  assert.deepEqual(toLines(null), ['']);
  assert.deepEqual(toLines(undefined), ['']);
  assert.deepEqual(toLines([1, null]), ['1', 'null']);
  assert.deepEqual(toLines(42), ['42']);
  for (const v of [[], {}, 0, false, NaN]) assert.doesNotThrow(() => toLines(v).map((l) => l.trim()));
});

test('REGRESSION categoryName renders a label, never a raw object (product table showed JSON)', () => {
  assert.equal(categoryName(toCategory({ name: 'Kitchen', translations: { ar: { name: 'مطبخ' } } })), 'مطبخ');
  assert.equal(categoryName({ name: 'OnlyName' }), 'OnlyName');
  assert.equal(categoryName('Legacy string'), 'Legacy string');
  assert.equal(categoryName(null), null);
  assert.equal(categoryName(undefined), undefined);
  assert.notEqual(typeof categoryName({ name: 'x' }), 'object');
});

test('DOMAIN toAttribute: type mapping, colour detection by type and by name', () => {
  assert.equal(toAttribute({ type: 'color_swatch', name: 'Finish' }).type, 'color');
  assert.equal(toAttribute({ type: 'color', name: 'Finish' }).type, 'color');
  assert.equal(toAttribute({ name: 'Colors' }).type, 'color');
  assert.equal(toAttribute({ name: 'الألوان' }).type, 'color');
  assert.equal(toAttribute({ type: 'select', name: 'Size' }).type, 'select');
  assert.equal(toAttribute({ name: 'Size' }).type, 'select');
  assert.equal(toAttribute({ type: 'text', name: 'Note' }).type, 'text');
});

test('DOMAIN toAttribute: option sources (options | values | values_list incl. "name|#hex" strings)', () => {
  const fromStrings = toAttribute({ name: 'C', values_list: ['Red|#f00', 'Blue'] });
  assert.deepEqual(fromStrings.values.map((v) => [v.label, v.color]), [['Red', '#f00'], ['Blue', null]]);
  const fromValues = toAttribute({ name: 'S', values: [{ id: 1, label: 'XL' }] });
  assert.equal(fromValues.values[0].label, 'XL');
  assert.deepEqual(toAttribute({ name: 'S' }).values, []);
});

test('DOMAIN toAttribute: options without a name are dropped, inactive flag preserved, ids synthesised', () => {
  const a = toAttribute({ name: 'S', options: [{ id: 1, name: 'A', is_active: false }, { id: 2 }, 'B'] });
  assert.deepEqual(a.values.map((v) => v.label), ['A', 'B']);
  assert.equal(a.values[0].is_active, false);
  assert.ok(a.values[1].id, 'string options get a synthetic id');
});

test('DOMAIN toAttribute: colour name heuristic does NOT hijack an explicit non-colour type (fixed QA-F1)', () => {
  assert.equal(toAttribute({ type: 'select', name: 'Color family' }).type, 'select');
  assert.equal(toAttribute({ type: 'text', name: 'الألوان' }).type, 'text');
  assert.equal(toAttribute({ type: 'select', name: 'Color & Appearance' }).type, 'select');
  assert.equal(toAttribute({ type: 'color_swatch', name: 'Finish' }).type, 'color', 'explicit colour type still wins');
  assert.equal(toAttribute({ name: 'Colors' }).type, 'color', 'legacy payloads without a type keep the heuristic');
});

test('DOMAIN toDiscountCode: status derivation across the whole lifecycle', () => {
  const day = 86_400_000;
  const iso = (offset) => new Date(Date.now() + offset * day).toISOString();
  assert.equal(toDiscountCode({ is_active: false }).status, 'paused');
  assert.equal(toDiscountCode({ is_active: true, start_date: iso(2) }).status, 'scheduled');
  assert.equal(toDiscountCode({ is_active: true, end_date: iso(-1) }).status, 'expired');
  assert.equal(toDiscountCode({ is_active: true, start_date: iso(-2), end_date: iso(2) }).status, 'active');
  assert.equal(toDiscountCode({ is_active: true }).status, 'active', 'no dates ⇒ open-ended');
  assert.equal(toDiscountCode({ is_active: true, start_date: 'garbage', end_date: 'garbage' }).status, 'active');
  assert.equal(toDiscountCode({ is_active: false, end_date: iso(-1) }).status, 'paused', 'paused outranks expired');
});

test('DOMAIN toDiscountCode: counters and lists default safely', () => {
  const d = toDiscountCode({});
  assert.equal(d.total_uses, 0);
  assert.equal(d.max_uses, null);
  assert.equal(d.usage_percentage, 0);
  assert.deepEqual(d.selected_categories, []);
  assert.deepEqual(d.selected_products, []);
  assert.equal(toDiscountCode({ total_uses: '5', usage_percentage: '50' }).total_uses, 5);
});

test('DOMAIN toDiscountCode: missing is_active is treated as PAUSED by status but ACTIVE by flag (fixed QA-F2)', () => {
  const d = toDiscountCode({});
  assert.equal(d.status === 'paused', d.is_active === false);
});

test('DOMAIN listFromResponse / dataFromResponse handle every envelope the backend uses', () => {
  assert.deepEqual(listFromResponse([1]), [1]);
  assert.deepEqual(listFromResponse({ data: [1] }), [1]);
  assert.deepEqual(listFromResponse({ data: { data: [1] } }), [1]);
  assert.deepEqual(listFromResponse({ data: { items: [1] } }), [1]);
  assert.deepEqual(listFromResponse({ items: [1] }), [1]);
  assert.deepEqual(listFromResponse(null), []);
  assert.deepEqual(listFromResponse(undefined), []);
  assert.deepEqual(listFromResponse({ data: 'oops' }), []);
  assert.deepEqual(dataFromResponse({ data: { id: 1 } }), { id: 1 });
  assert.deepEqual(dataFromResponse({ id: 1 }), { id: 1 });
});

// ════════════════════════════════════════════════════════════════════════════
// 2. DOMAIN — payload builders (UI → API)
// ════════════════════════════════════════════════════════════════════════════
test('PAYLOAD category: trims, maps is_active to 0/1, parent_id optional, numeric sort_order', () => {
  const p = toCategoryPayload({ name_en: '  A  ', name_ar: ' ب ', is_active: false, parent_id: '', sort_order: '3' });
  assert.equal(p.name_en, 'A');
  assert.equal(p.name_ar, 'ب');
  assert.equal(p.is_active, 0);
  assert.equal(p.parent_id, undefined);
  assert.equal(p.sort_order, 3);
  assert.equal(toCategoryPayload({ parent_id: 4 }).parent_id, 4);
  assert.equal(toCategoryPayload({}).is_active, 1);
  assert.equal(toCategoryPayload({ sort_order: '' }).sort_order, 0);
  assert.doesNotThrow(() => toCategoryPayload({}));
});

test('PAYLOAD product: sub-category wins over category; empty ⇒ empty string', () => {
  assert.equal(toProductPayload({ category_id: 1, subcategory_id: 9 }).category_id, 9);
  assert.equal(toProductPayload({ category_id: 1, subcategory_id: '' }).category_id, 1);
  assert.equal(toProductPayload({}).category_id, '');
});

test('PAYLOAD product: stock 0, price 0 and string numerics are passed through untouched', () => {
  const p = toProductPayload({ price: '0', quantity: 0 });
  assert.equal(p.price, '0');
  assert.equal(p.number, 0);
});

test('PAYLOAD product: blank discount defaults to 1 (documented), explicit 0 is kept', () => {
  assert.equal(toProductPayload({ discount: '' }).discount_percentage, 1);
  assert.equal(toProductPayload({ discount: null }).discount_percentage, 1);
  assert.equal(toProductPayload({ discount: 0 }).discount_percentage, 0);
  assert.equal(toProductPayload({ discount: 25 }).discount_percentage, 25);
});

test('PAYLOAD product: discount undefined must behave like blank (fixed QA-F3)', () => {
  assert.equal(toProductPayload({}).discount_percentage, 1);
});

test('PAYLOAD product: multiline text becomes arrays, blank lines removed, CRLF-safe-ish', () => {
  const p = toProductPayload({ description_en: 'a\n\nb\n', features_ar: 'x', tips_en: '', shipping_info_en: 'l1\nl2' });
  assert.deepEqual(p.product_description_en, ['a', 'b']);
  assert.deepEqual(p.key_features_ar, ['x']);
  assert.deepEqual(p.tips_en, []);
  assert.deepEqual(p.shipping_info_en, ['l1', 'l2']);
  assert.deepEqual(toProductPayload({ description_en: 'a\r\nb' }).product_description_en, ['a\r', 'b'], 'CR is kept – backend receives a trailing \\r');
});

test('PAYLOAD product: names are trimmed and cannot be turned into objects', () => {
  assert.equal(toProductPayload({ name_en: '  x ' }).name_en, 'x');
  assert.equal(toProductPayload({ name_en: null }).name_en, '');
  assert.equal(toProductPayload({ name_en: { evil: 1 } }).name_en, '[object Object]', 'garbage in ⇒ garbage out (UI binds text inputs only)');
});

test('PAYLOAD discount: date formatting, open-ended end date, booleans', () => {
  const p = toDiscountPayload({ code: ' SPRING ', type: 'percentage', value: '10', start_date: '2026-10-12', end_date: '2026-12-31', is_active: 1, min_order_value: '', max_discount: '' });
  assert.equal(p.code, 'SPRING');
  assert.equal(p.value, 10);
  assert.equal(p.start_date, '2026-10-12 00:00:00');
  assert.equal(p.end_date, '2026-12-31 23:59:59');
  assert.equal(p.is_active, true);
  assert.equal(p.minimum_amount, null);
  assert.equal(p.max_discount, null);
  assert.equal(toDiscountPayload({ no_end_date: true, end_date: '2026-12-31' }).end_date, null);
  assert.equal(toDiscountPayload({ end_date: '' }).end_date, null);
  assert.equal(toDiscountPayload({}).start_date, null);
  assert.equal(toDiscountPayload({}).type, 'percentage');
  assert.equal(toDiscountPayload({ is_active: 0 }).is_active, false);
});

test('PAYLOAD discount: a form missing min_order_value must not send NaN (fixed QA-F4)', () => {
  assert.equal(toDiscountPayload({ code: 'X', minimum_amount: 50 }).minimum_amount, 50, 'server field name is honoured (duplicate offer)');
  assert.equal(toDiscountPayload({ code: 'X' }).minimum_amount, null);
  assert.equal(toDiscountPayload({ code: 'X', min_order_value: 'abc', max_discount: undefined }).minimum_amount, null);
  assert.equal(toDiscountPayload({ code: 'X', max_discount: 0 }).max_discount, 0);
});

test('PAYLOAD discount: value garbage / negative are NOT validated client-side (FINDING QA-F5, backend must reject)', () => {
  assert.equal(toDiscountPayload({ value: '-5' }).value, -5);
  assert.ok(Number.isNaN(toDiscountPayload({ value: 'abc' }).value));
  assert.equal(toDiscountPayload({ value: '' }).value, 0);
});

test('PAYLOAD attribute: colour ⇒ color_swatch, options parsed with optional hex', () => {
  const p = toAttributePayload({ type: 'color', name_en: 'Color', name_ar: 'لون', values_list: 'أسود|#111827, أبيض|#fff ,, Plain ' });
  assert.equal(p.type, 'color_swatch');
  assert.deepEqual(p.options.map((o) => [o.name_en, o.value_code]), [['أسود', '#111827'], ['أبيض', '#fff'], ['Plain', null]]);
  assert.equal(toAttributePayload({}).type, 'select');
  assert.deepEqual(toAttributePayload({ values_list: '' }).options, []);
  assert.deepEqual(toAttributePayload({ values_list: '   ,  , ' }).options, []);
});

test('PAYLOAD attribute: a value containing a comma is split in two (known limitation, QA-F6)', () => {
  assert.equal(toAttributePayload({ values_list: 'A,B' }).options.length, 2);
  assert.equal(toAttributePayload({ values_list: 'a|#1|extra' }).options[0].value_code, '#1', '3rd segment ignored');
});

test('PAYLOAD attribute option: label doubles as both languages; colour optional', () => {
  assert.deepEqual(toAttributeOptionPayload({ label: ' أحمر ', color: '#f00' }), { name_en: 'أحمر', name_ar: 'أحمر', value_code: '#f00' });
  assert.equal(toAttributeOptionPayload({ label: 'XL' }).value_code, null);
  assert.equal(toAttributeOptionPayload({ label: 'XL', color: '' }).value_code, null);
});

// ════════════════════════════════════════════════════════════════════════════
// 3. INFRASTRUCTURE — what really goes over the wire
// ════════════════════════════════════════════════════════════════════════════
const png = () => new File([new Uint8Array([137, 80, 78, 71])], 'a.png', { type: 'image/png' });

test('WIRE REGRESSION BUG-1: product images are sent as images[] (backend returned 422 "images must be an array")', async () => {
  await tijaraAdminApi.createProduct({ name_en: 'P' }, [png(), new File([new Uint8Array([1])], 'b.png', { type: 'image/png' })]);
  const body = calls[0].data;
  assert.ok(body instanceof FormData);
  const entries = formEntries(body);
  assert.deepEqual(entries.filter(([k]) => k === 'images[]').map(([, v]) => v), ['file:a.png', 'file:b.png']);
  assert.equal(entries.some(([k]) => k === 'images'), false, 'bare `images` key must never be used');
});

test('WIRE updateProduct uses PUT /v1/products/:id with the same images[] contract', async () => {
  await tijaraAdminApi.updateProduct(10, { name_en: 'P' }, [png()]);
  assert.equal(calls[0].method, 'put');
  assert.equal(calls[0].url, '/v1/products/10');
  assert.ok(formEntries(calls[0].data).some(([k]) => k === 'images[]'));
});

test('WIRE product with zero new images sends no image field at all', async () => {
  await tijaraAdminApi.createProduct({ name_en: 'P' }, []);
  assert.equal(formEntries(calls[0].data).some(([k]) => k.startsWith('images')), false);
  await tijaraAdminApi.createProduct({ name_en: 'P' });
  assert.equal(formEntries(calls[1].data).some(([k]) => k.startsWith('images')), false);
});

test('WIRE multipart: arrays are indexed, empty/undefined/null dropped, 0 and false kept', async () => {
  await tijaraAdminApi.createProduct({ tips_en: ['a', 'b'], empty: '', nothing: null, missing: undefined, zero: 0, no: false, emptyList: [] }, []);
  const entries = formEntries(calls[0].data);
  const keys = entries.map(([k]) => k);
  assert.ok(keys.includes('tips_en[0]') && keys.includes('tips_en[1]'));
  assert.ok(!keys.includes('empty') && !keys.includes('nothing') && !keys.includes('missing'));
  assert.deepEqual(entries.find(([k]) => k === 'zero'), ['zero', '0']);
  assert.deepEqual(entries.find(([k]) => k === 'no'), ['no', 'false']);
  assert.ok(!keys.some((k) => k.startsWith('emptyList')));
});

test('WIRE category create/update send ONE image_file and omit it when absent', async () => {
  await tijaraAdminApi.createCategory({ name_en: 'C' }, png());
  assert.deepEqual(formEntries(calls[0].data).filter(([k]) => k === 'image_file'), [['image_file', 'file:a.png']]);
  await tijaraAdminApi.updateCategory(3, { name_en: 'C' });
  assert.equal(calls[1].url, '/v1/categories/3');
  assert.equal(calls[1].method, 'put');
  assert.equal(formEntries(calls[1].data).some(([k]) => k === 'image_file'), false);
});

test('WIRE every CRUD endpoint hits the documented URL + verb', async () => {
  const expected = [
    [() => tijaraAdminApi.listCategories(), 'get', '/v1/categories'],
    [() => tijaraAdminApi.deleteCategory(1), 'delete', '/v1/categories/1'],
    [() => tijaraAdminApi.listProducts({ page: 2 }), 'get', '/v1/products'],
    [() => tijaraAdminApi.deleteProduct(2), 'delete', '/v1/products/2'],
    [() => tijaraAdminApi.listAttributes(), 'get', '/v1/attributes'],
    [() => tijaraAdminApi.createAttribute({}), 'post', '/v1/attributes'],
    [() => tijaraAdminApi.updateAttribute(3, {}), 'put', '/v1/attributes/3'],
    [() => tijaraAdminApi.deleteAttribute(3), 'delete', '/v1/attributes/3'],
    [() => tijaraAdminApi.createAttributeOption(3, {}), 'post', '/v1/attributes/3/options'],
    [() => tijaraAdminApi.updateAttributeOption(3, 4, {}), 'put', '/v1/attributes/3/options/4'],
    [() => tijaraAdminApi.deleteAttributeOption(3, 4), 'delete', '/v1/attributes/3/options/4'],
    [() => tijaraAdminApi.listDiscountCodes(), 'get', '/v1/discount_codes'],
    [() => tijaraAdminApi.createDiscountCode({}), 'post', '/v1/discount_codes'],
    [() => tijaraAdminApi.updateDiscountCode(7, {}), 'put', '/v1/discount_codes/7'],
    [() => tijaraAdminApi.deleteDiscountCode(7), 'delete', '/v1/discount_codes/7'],
  ];
  for (const [run, method, url] of expected) {
    calls = [];
    await run();
    assert.equal(calls[0].method, method, url);
    assert.equal(calls[0].url, url);
  }
});

test('WIRE listProducts forwards query params; JSON endpoints declare JSON content-type', async () => {
  let seen;
  api.defaults.adapter = async (config) => { seen = config; return { data: { data: [] }, status: 200, statusText: 'OK', headers: {}, config }; };
  await tijaraAdminApi.listProducts({ page: 3, category_id: 4 });
  assert.deepEqual(seen.params, { page: 3, category_id: 4 });
  await tijaraAdminApi.createDiscountCode({ code: 'X' });
  assert.equal(seen.headers['Content-Type'], 'application/json');
  api.defaults.adapter = captureAdapter;
});

// ─── Routing: catalogue resources must never be served from the local snapshot ──
test('ROUTING live catalogue paths bypass the local snapshot adapter, others do not', async () => {
  const run = async (url) => api.interceptors.request.handlers[0].fulfilled({ url, headers: {} });
  for (const url of ['/v1/products', '/v1/products/5', '/v1/categories', '/v1/attributes/3/options', '/v1/discount_codes/7', '/v1/users', '/api/v1/products']) {
    const config = await run(url);
    assert.notEqual(config.__localApi, true, `${url} must go to the live API`);
  }
  for (const url of ['/dashboard/statistics', '/v1/orders', '/v1/productsX']) {
    const config = await run(url);
    assert.equal(config.__localApi, true, `${url} should still be served locally`);
  }
});

test('ROUTING prefix match is segment-safe (/v1/productsX is not /v1/products)', async () => {
  const config = await api.interceptors.request.handlers[0].fulfilled({ url: '/v1/products-export', headers: {} });
  assert.equal(config.__localApi, true);
});

test('AUTH request interceptor attaches the admin bearer token to catalogue calls', async () => {
  const config = await api.interceptors.request.handlers[0].fulfilled({ url: '/v1/products', headers: {} });
  assert.equal(config.headers.Authorization, 'Bearer admin-token');
  storage.clear();
  const anonymous = await api.interceptors.request.handlers[0].fulfilled({ url: '/v1/products', headers: {} });
  assert.equal(anonymous.headers.Authorization, undefined);
});

test('AUTH a 401 from a LIVE catalogue call clears the admin session (not swallowed as a local-snapshot 401)', async () => {
  storage.setItem('admin', JSON.stringify({ id: 1 }));
  const handler = api.interceptors.response.handlers[0].rejected;
  const error = { response: { status: 401 }, config: { url: '/v1/products', __localApi: false }, message: 'x' };
  await assert.rejects(() => handler(error));
  assert.equal(storage.getItem('token'), null, 'expired token removed');
  assert.equal(storage.getItem('admin'), null);
});

test('AUTH a 401 from the LOCAL snapshot adapter does not log the admin out', async () => {
  storage.setItem('admin', JSON.stringify({ id: 1 }));
  const handler = api.interceptors.response.handlers[0].rejected;
  await assert.rejects(() => handler({ response: { status: 401 }, config: { url: '/dashboard/x', __localApi: true }, message: 'x' }));
  assert.equal(storage.getItem('token'), 'admin-token');
});

// ════════════════════════════════════════════════════════════════════════════
// 4. APPLICATION — service layer maps responses
// ════════════════════════════════════════════════════════════════════════════
test('SERVICE listCategories maps every envelope shape through toCategory', async () => {
  for (const body of [[{ id: 1, name: 'A' }], { data: [{ id: 1, name: 'A' }] }, { data: { data: [{ id: 1, name: 'A' }] } }]) {
    nextResponse = body;
    const list = await adminCatalogService.listCategories();
    assert.equal(list.length, 1);
    assert.equal(list[0].name_i18n.ar, 'A');
  }
});

test('SERVICE list* returns [] (not a crash) on empty / malformed bodies', async () => {
  for (const body of [null, {}, { data: null }, 'oops']) {
    nextResponse = body;
    assert.deepEqual(await adminCatalogService.listCategories(), []);
    assert.deepEqual(await adminCatalogService.listAttributes(), []);
    assert.deepEqual(await adminCatalogService.listDiscountCodes(), []);
  }
});

test('SERVICE listProducts keeps pagination meta and exposes mapped data + items', async () => {
  nextResponse = { data: [{ id: 1, name: 'P', number: 2 }], meta: { total: 11, last_page: 2 } };
  const result = await adminCatalogService.listProducts({ page: 1 });
  assert.equal(result.meta.total, 11);
  assert.equal(result.data[0].stock, 2);
  assert.equal(result.items[0].name_i18n.en, 'P');
});

test('SERVICE createProduct unwraps {data:{…}} and maps it', async () => {
  nextResponse = { data: { id: 9, name: 'New', number: 1, category: { id: 2, name: 'C' } } };
  const product = await adminCatalogService.createProduct({ name_en: 'New' }, []);
  assert.equal(product.id, 9);
  assert.equal(categoryName(product.category), 'C');
});

test('SERVICE errors from the API propagate untouched so the views can show the backend message', async () => {
  api.defaults.adapter = async (config) => { const e = new Error('Request failed'); e.config = config; e.response = { status: 422, data: { message: 'The images field must be an array.' }, config }; throw e; };
  await assert.rejects(() => adminCatalogService.createProduct({}, []), (e) => e.response.data.message === 'The images field must be an array.');
  api.defaults.adapter = captureAdapter;
});

test('SERVICE productAttributeService delegates to the Tijara endpoints with mapped payloads', async () => {
  await productAttributeService.create({ type: 'color', name_en: 'C', name_ar: 'ل', values_list: 'Red|#f00' });
  assert.equal(calls[0].url, '/v1/attributes');
  const body = JSON.parse(calls[0].data);
  assert.equal(body.type, 'color_swatch');
  assert.equal(body.options[0].value_code, '#f00');

  calls = [];
  await productAttributeService.createValue(9, { label: 'Green', color: '#0f0' });
  assert.equal(calls[0].url, '/v1/attributes/9/options');
  assert.equal(JSON.parse(calls[0].data).value_code, '#0f0');

  calls = [];
  await productAttributeService.updateValue(9, 21, { label: 'Lime' });
  assert.equal(calls[0].method, 'put');
  assert.equal(calls[0].url, '/v1/attributes/9/options/21');

  calls = [];
  await productAttributeService.deleteValue(9, 21);
  await productAttributeService.delete(9);
  assert.deepEqual(calls.map((c) => `${c.method} ${c.url}`), ['delete /v1/attributes/9/options/21', 'delete /v1/attributes/9']);
});

test('AUTH backend quirk: HTTP 500 {"message":"Unauthenticated."} is handled like a 401 (expired token ⇒ logout)', async () => {
  storage.setItem('admin', JSON.stringify({ id: 1 }));
  const handler = api.interceptors.response.handlers[0].rejected;
  await assert.rejects(() => handler({ response: { status: 500, data: { message: 'Unauthenticated.' } }, config: { url: '/v1/products' }, message: 'x' }));
  assert.equal(storage.getItem('token'), null);
  assert.equal(storage.getItem('admin'), null);
});

test('AUTH a genuine 500 (any other message) must NOT log the admin out', async () => {
  const handler = api.interceptors.response.handlers[0].rejected;
  await assert.rejects(() => handler({ response: { status: 500, data: { message: 'Server Error' } }, config: { url: '/v1/products' }, message: 'x' }));
  assert.equal(storage.getItem('token'), 'admin-token');
});

// ─── Regression QA-BUG-4: only the first page of categories was shown ──────────
test('REGRESSION BUG-4 listCategories / listAttributes / listDiscountCodes walk ALL pages (UI hid item #11+)', async () => {
  const pages = {
    1: { data: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }], meta: { current_page: 1, last_page: 3 } },
    2: { data: [{ id: 3, name: 'C' }], meta: { current_page: 2, last_page: 3 } },
    3: { data: [{ id: 4, name: 'D' }], meta: { current_page: 3, last_page: 3 } },
  };
  api.defaults.adapter = async (config) => {
    calls.push({ url: config.url, params: config.params });
    return { data: pages[config.params?.page || 1], status: 200, statusText: 'OK', headers: {}, config };
  };
  const categories = await adminCatalogService.listCategories();
  assert.deepEqual(categories.map((c) => c.id), [1, 2, 3, 4]);
  assert.deepEqual(calls.map((c) => c.params.page), [1, 2, 3]);

  calls = [];
  assert.equal((await adminCatalogService.listAttributes()).length, 4);
  assert.equal((await adminCatalogService.listDiscountCodes()).length, 4);
  api.defaults.adapter = captureAdapter;
});

test('REGRESSION BUG-4 a single-page response triggers exactly one request; a lying last_page is capped', async () => {
  nextResponse = { data: [{ id: 1 }], meta: { last_page: 1 } };
  await adminCatalogService.listCategories();
  assert.equal(calls.length, 1);

  calls = [];
  nextResponse = { data: [{ id: 1 }], meta: { last_page: 999999 } };
  await adminCatalogService.listCategories();
  assert.ok(calls.length <= 50, `bounded to 50 requests, got ${calls.length}`);
});

test('REGRESSION BUG-4 a failing later page rejects (UI shows an error instead of a silently partial list)', async () => {
  api.defaults.adapter = async (config) => {
    if (config.params?.page === 2) { const e = new Error('boom'); e.config = config; e.response = { status: 500, data: {}, config }; throw e; }
    return { data: { data: [{ id: 1 }], meta: { last_page: 2 } }, status: 200, statusText: 'OK', headers: {}, config };
  };
  await assert.rejects(() => adminCatalogService.listCategories());
  api.defaults.adapter = captureAdapter;
});

// ─── Attribute edit (new UI, 2026-10-12) ────────────────────────────────────────
test('PAYLOAD attribute update renames/retypes but NEVER sends options (would replace existing values)', () => {
  const p = toAttributeUpdatePayload({ type: 'color', name_en: ' Color ', name_ar: 'لون', values_list: 'A|#fff,B' });
  assert.equal(p.type, 'color_swatch');
  assert.equal(p.name_en, 'Color');
  assert.equal(Object.hasOwn(p, 'options'), false);
});

test('SERVICE productAttributeService.update → PUT /v1/attributes/:id without options', async () => {
  await productAttributeService.update(9, { type: 'select', name_en: 'Size', name_ar: 'مقاس', values_list: 'x,y' });
  assert.equal(calls[0].method, 'put');
  assert.equal(calls[0].url, '/v1/attributes/9');
  const body = JSON.parse(calls[0].data);
  assert.deepEqual(Object.keys(body).sort(), ['name_ar', 'name_en', 'type']);
});

test('PAYLOAD discount: unsupported usage-limit fields are never sent to the API', () => {
  const p = toDiscountPayload({ code: 'X', value: 5, max_uses: 100, max_per_customer: 2 });
  assert.equal(Object.hasOwn(p, 'max_uses'), false);
  assert.equal(Object.hasOwn(p, 'max_per_customer'), false);
});
