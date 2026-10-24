import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

let viteServer;
let f;

before(async () => {
  viteServer = await createServer({ root: new URL('../website', import.meta.url).pathname, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
  f = await viteServer.ssrLoadModule('/src/domain/product/productFilters.js');
});
after(async () => { await viteServer?.close(); });

test('in stock: quantity above zero; unknown quantity is not hidden', () => {
  assert.equal(f.isInStock({ stock: 5 }), true);
  assert.equal(f.isInStock({ stock: 0 }), false);
  assert.equal(f.isInStock({ stock: '0' }), false);
  assert.equal(f.isInStock({ stock: undefined }), true);
  assert.equal(f.isInStock({ quantity: 0 }), false);
});

test('offers & discounts: a real price drop or membership in an active offer', () => {
  const offers = [
    { applies_to: 'products', selected_products: ['64', '66'] },
    { applies_to: 'categories', selected_categories: [7] },
  ];
  assert.equal(f.isDiscounted({ id: 1, price: 100, sale_price: 90, has_discount: true, discount: 10 }, []), true);
  assert.equal(f.isDiscounted({ id: 1, price: 100, sale_price: 100, has_discount: false, discount: 0 }, []), false);
  assert.equal(f.isDiscounted({ id: 64, price: 100, sale_price: 100 }, offers), true, 'bundle offer product');
  assert.equal(f.isDiscounted({ id: 9, category_id: 7, price: 100, sale_price: 100 }, offers), true, 'offer on its category');
  assert.equal(f.isDiscounted({ id: 9, category_id: 8, price: 100, sale_price: 100 }, offers), false);
  assert.equal(f.isDiscounted({ id: 64, price: 100, sale_price: 100 }, [{ applies_to: 'products', selected_products: ['65'] }]), false);
});

test('made in Italy: read from the product origin data, never guessed from the name', () => {
  assert.equal(f.isItalianMade({ name: 'Mastergas 90cm Italian Built-in Gas Oven' }), false);
  assert.equal(f.isItalianMade({ country_of_origin: 'Italy' }), true);
  assert.equal(f.isItalianMade({ origin: 'إيطاليا' }), true);
  assert.equal(f.isItalianMade({ origin: 'Turkey' }), false);
  assert.equal(f.isItalianMade({ attributes: { 'بلد المنشأ': [{ id: 1, name: 'إيطاليا', value_code: 'italy' }] } }), true);
  assert.equal(f.isItalianMade({ attributes: { Origin: [{ id: 2, name: 'Italy', value_code: 'italy' }] } }), true);
  assert.equal(f.isItalianMade({ attributes: { Origin: [{ id: 3, name: 'Germany', value_code: 'de' }] } }), false);
  // A spec that merely mentions Italy is not an origin.
  assert.equal(f.isItalianMade({ attributes: { Color: [{ id: 4, name: 'Italian Red', value_code: '#c00' }] } }), false);
});

test('combined filters narrow together', () => {
  const rows = [
    { id: 1, stock: 3, price: 100, sale_price: 80, origin: 'Italy' },
    { id: 2, stock: 0, price: 100, sale_price: 80, origin: 'Italy' },
    { id: 3, stock: 3, price: 100, sale_price: 100, origin: 'Italy' },
    { id: 4, stock: 3, price: 100, sale_price: 80 },
  ];
  const ids = (filters) => rows.filter((p) => f.matchesExtraFilters(p, filters, [])).map((p) => p.id);
  assert.deepEqual(ids({}), [1, 2, 3, 4]);
  assert.deepEqual(ids({ inStock: true }), [1, 3, 4]);
  assert.deepEqual(ids({ discounted: true }), [1, 2, 4]);
  assert.deepEqual(ids({ italian: true }), [1, 2, 3]);
  assert.deepEqual(ids({ inStock: true, discounted: true, italian: true }), [1]);
});
