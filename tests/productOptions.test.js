import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

let viteServer;
let options;
let orderOptions;
let siteOrder;
let adminOrderOptions;

// Product 75 as GET /v1/site/products/75 returns it (group and option names
// follow Accept-Language, ids do not).
const productAr = {
  id: 75,
  attributes: {
    'اللون': [{ id: 119, name: 'أسود ملكي', value_code: '#111827' }, { id: 120, name: 'ستانلس ستيل فضي', value_code: '#9ca3af' }],
    'المقاس': [{ id: 121, name: '60 سم', value_code: '60cm' }, { id: 122, name: '90 سم', value_code: '90cm' }],
    'نوع الطاقة والغاز': [{ id: 123, name: 'غاز طبيعي', value_code: 'natural_gas' }, { id: 124, name: 'أسطوانات غاز LPG', value_code: 'lpg' }],
  },
};
const productEn = {
  id: 75,
  attributes: {
    Color: [{ id: 119, name: 'Royal Black', value_code: '#111827' }, { id: 120, name: 'Brushed Stainless', value_code: '#9ca3af' }],
    Size: [{ id: 121, name: '60 cm', value_code: '60cm' }, { id: 122, name: '90 cm', value_code: '90cm' }],
    'Energy Type': [{ id: 123, name: 'Natural Gas', value_code: 'natural_gas' }, { id: 124, name: 'LPG Cylinder', value_code: 'lpg' }],
  },
};

before(async () => {
  viteServer = await createServer({ root: new URL('../website', import.meta.url).pathname, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
  options = await viteServer.ssrLoadModule('/src/domain/product/productOptions.js');
  orderOptions = await viteServer.ssrLoadModule('/src/domain/order/orderOptions.js');
  siteOrder = await viteServer.ssrLoadModule('/src/domain/orders/siteOrder.js');
  adminOrderOptions = await import('../admin/src/domain/orders/orderOptions.js');
});

after(async () => {
  await viteServer?.close();
});

const bilingualGroups = () => options.withBilingualLabels(
  options.extractOptionGroups(productAr),
  options.extractOptionGroups(productEn),
  'ar',
);

test('option groups: one group per attribute, keyed by option ids, color detected from hex codes', () => {
  const groups = options.extractOptionGroups(productAr);
  assert.deepEqual(groups.map((group) => [group.key, group.name, group.isColor]), [
    ['119-120', 'اللون', true],
    ['121-122', 'المقاس', false],
    ['123-124', 'نوع الطاقة والغاز', false],
  ]);
  assert.equal(groups[0].options[1].hex, '#9ca3af');
  assert.equal(groups[1].options[0].hex, null);
  // Same keys in English, so a selection survives a language switch.
  assert.deepEqual(options.extractOptionGroups(productEn).map((group) => group.key), groups.map((group) => group.key));
});

test('option groups: legacy text specs are not selectable', () => {
  assert.deepEqual(options.extractOptionGroups({ attributes: { warranty: 'سنتان', burners: ['5'] } }), []);
  assert.deepEqual(options.extractOptionGroups({}), []);
});

test('selection: defaults to the first option and keeps both languages for the cart', () => {
  const groups = bilingualGroups();
  const selection = options.completeOptionSelection(groups, { '119-120': 120, '121-122': 999 });
  assert.deepEqual(selection, { '119-120': 120, '121-122': 121, '123-124': 123 });

  const selected = options.buildSelectedOptions(groups, selection);
  assert.deepEqual(selected[0], {
    id: 120,
    group: { ar: 'اللون', en: 'Color' },
    name: { ar: 'ستانلس ستيل فضي', en: 'Brushed Stainless' },
    value_code: '#9ca3af',
    hex: '#9ca3af',
  });
  assert.deepEqual(options.describeSelectedOptions(selected, 'en').map((row) => `${row.group}: ${row.name}`), [
    'Color: Brushed Stainless', 'Size: 60 cm', 'Energy Type: Natural Gas',
  ]);
  assert.deepEqual(options.describeSelectedOptions(selected, 'ar').map((row) => row.name), [
    'ستانلس ستيل فضي', '60 سم', 'غاز طبيعي',
  ]);
});

test('order: lines of one product merge into one item (the API rejects duplicates)', () => {
  const merged = orderOptions.mergeOrderItems([
    { product_id: 75, quantity: 1, unit_price: 1572.5 },
    { product_id: 75, quantity: 2, unit_price: 1572.5 },
    { product_id: 12, quantity: 1 },
  ]);
  assert.deepEqual(merged, [{ product_id: 75, quantity: 3, unit_price: 1572.5 }, { product_id: 12, quantity: 1 }]);
});

test('order notes: the options block round-trips and stays out of the customer text', () => {
  const groups = bilingualGroups();
  const lines = [
    { id: 75, quantity: 1, selectedOptions: options.buildSelectedOptions(groups, { '119-120': 120, '121-122': 122, '123-124': 124 }) },
    { id: 75, quantity: 2, selectedOptions: options.buildSelectedOptions(groups, { '119-120': 119, '121-122': 121, '123-124': 123 }) },
    { id: 12, quantity: 1 },
  ];
  const notes = orderOptions.appendOrderOptions('اتصل قبل الوصول', lines);
  assert.match(notes, /^اتصل قبل الوصول\n\n\[MG-OPTIONS\]/);
  assert.deepEqual(orderOptions.parseOrderOptions(notes), [
    { p: 75, q: 1, o: [120, 122, 124] },
    { p: 75, q: 2, o: [119, 121, 123] },
  ]);
  assert.equal(orderOptions.stripOrderOptions(notes), 'اتصل قبل الوصول');
  assert.equal(orderOptions.appendOrderOptions('بدون مواصفات', [{ id: 12, quantity: 1 }]), 'بدون مواصفات');
  assert.deepEqual(orderOptions.parseOrderOptions('[MG-OPTIONS]{broken[/MG-OPTIONS]'), []);
});

test('order notes: the 1000-character API limit shortens the customer text, never the block', () => {
  const lines = [{ id: 75, quantity: 1, selectedOptions: [{ id: 120 }, { id: 122 }, { id: 124 }] }];
  const notes = orderOptions.appendOrderOptions('x'.repeat(1500), lines);
  const fitted = orderOptions.fitOrderNotes(notes, 1000);
  assert.ok(fitted.length <= 1000);
  assert.deepEqual(orderOptions.parseOrderOptions(fitted), [{ p: 75, q: 1, o: [120, 122, 124] }]);

  const payload = siteOrder.toSiteOrderPayload({
    payment_method: 'cash_on_delivery',
    shipping_address: 'Riyadh',
    notes: `Coupon: SAVE10. ${notes}`,
    items: [{ product_id: 75, quantity: 1 }, { product_id: 75, quantity: 2 }],
  });
  assert.ok(payload.notes.length <= 1000);
  assert.ok(!payload.notes.startsWith('Coupon:'));
  assert.deepEqual(orderOptions.parseOrderOptions(payload.notes), [{ p: 75, q: 1, o: [120, 122, 124] }]);
  assert.deepEqual(payload.items, [{ product_id: 75, quantity: 3 }]);
});

test('order display: website and dashboard resolve chosen ids against the product options', () => {
  const notes = '[MG-OPTIONS]{"v":1,"items":[{"p":75,"q":2,"o":[119,121]}]}[/MG-OPTIONS]';
  const item = {
    product_id: 75,
    product: {
      options: [
        { id: 119, attribute_name: 'Color', type: 'color_swatch', name: 'Royal Black', value_code: '#111827' },
        { id: 121, attribute_name: 'Size', type: 'select', name: '60 cm', value_code: '60cm' },
      ],
    },
  };
  const expected = [{
    quantity: 2,
    options: [
      { id: 119, group: 'Color', name: 'Royal Black', hex: '#111827' },
      { id: 121, group: 'Size', name: '60 cm', hex: null },
    ],
  }];
  assert.deepEqual(orderOptions.orderItemChoices(item, orderOptions.parseOrderOptions(notes)), expected);
  assert.deepEqual(adminOrderOptions.orderItemChoices(item, adminOrderOptions.parseOrderOptions(notes)), expected);
  // The site order mapper keeps the options under item.options.
  assert.deepEqual(orderOptions.orderItemChoices({ product_id: 75, options: item.product.options }, orderOptions.parseOrderOptions(notes)), expected);
  assert.equal(adminOrderOptions.stripOrderOptions(`ملاحظة\n\n${notes}`), 'ملاحظة');
});
