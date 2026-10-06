import test, { after, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { getCheckoutOwner } from '../src/utils/checkoutSafety.js';

class MemoryStorage {
  constructor() {
    this.data = new Map();
  }

  getItem(key) {
    return this.data.has(key) ? this.data.get(key) : null;
  }

  setItem(key, value) {
    this.data.set(key, String(value));
  }

  removeItem(key) {
    this.data.delete(key);
  }

  key(index) {
    return [...this.data.keys()][index] ?? null;
  }

  get length() {
    return this.data.size;
  }

  clear() {
    this.data.clear();
  }
}

const storage = new MemoryStorage();
globalThis.localStorage = storage;
globalThis.window = {};

let viteServer;
let cartState;

before(async () => {
  viteServer = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  });
  ({ cartState } = await viteServer.ssrLoadModule('/src/store/cart.js'));
});

after(async () => {
  await viteServer.close();
});

beforeEach(() => {
  storage.clear();
  storage.setItem('c_token', 'test-token');
  storage.setItem('cart_test-token', JSON.stringify([
    { id: 1, price: 10, quantity: 3 },
    { id: 2, price: 20, quantity: 1 },
  ]));
  storage.setItem('wishlist_test-token', JSON.stringify([{ id: 99 }]));
  cartState.syncWithToken();
});

test('clearCart preserves wishlist state and storage', () => {
  cartState.clearCart();

  assert.equal(cartState.items.length, 0);
  assert.equal(storage.getItem('cart_test-token'), null);
  assert.deepEqual(cartState.wishlist.map(item => item.id), [99]);
  assert.deepEqual(JSON.parse(storage.getItem('wishlist_test-token')), [{ id: 99 }]);
});

test('confirmed checkout removes purchased quantities but preserves later additions', () => {
  cartState.removePurchasedItems([
    { product_id: '1', quantity: 2 },
    { product_id: 2, quantity: 1 },
  ]);

  assert.deepEqual(cartState.items, [{ id: 1, price: 10, quantity: 1 }]);
  assert.deepEqual(JSON.parse(storage.getItem('cart_test-token')), [
    { id: 1, price: 10, quantity: 1 },
  ]);
  assert.deepEqual(cartState.wishlist.map(item => item.id), [99]);
});

test('confirmed checkout merges cleanup against a newer cart persisted by another tab', () => {
  // The reactive state still contains the beforeEach snapshot, while another
  // tab has increased product 1 and added product 3 directly in storage.
  storage.setItem('cart_test-token', JSON.stringify([
    { id: 1, price: 10, quantity: 5 },
    { id: 2, price: 20, quantity: 1 },
    { id: 3, price: 30, quantity: 2 },
  ]));

  cartState.removePurchasedItems([
    { product_id: 1, quantity: 3 },
    { product_id: 2, quantity: 1 },
  ]);

  const expectedCart = [
    { id: 1, price: 10, quantity: 2 },
    { id: 3, price: 30, quantity: 2 },
  ];
  assert.deepEqual(cartState.items, expectedCart);
  assert.deepEqual(JSON.parse(storage.getItem('cart_test-token')), expectedCart);
  assert.deepEqual(cartState.wishlist.map(item => item.id), [99]);
});

test('confirmed checkout never cleans a cart after the authenticated owner changes', () => {
  const originalItems = JSON.parse(storage.getItem('cart_test-token'));
  const originalOwner = getCheckoutOwner(storage);
  storage.setItem('c_token', 'different-token');
  storage.setItem('cart_different-token', JSON.stringify([{ id: 50, quantity: 2 }]));

  assert.throws(
    () => cartState.removePurchasedItems(
      [{ product_id: 1, quantity: 1 }],
      { expectedOwner: originalOwner }
    ),
    /owner changed/
  );
  assert.deepEqual(JSON.parse(storage.getItem('cart_test-token')), originalItems);
  assert.deepEqual(JSON.parse(storage.getItem('cart_different-token')), [{ id: 50, quantity: 2 }]);
});

test('full clear remains available for logout', () => {
  cartState.clear();
  assert.equal(cartState.items.length, 0);
  assert.equal(cartState.wishlist.length, 0);
  assert.equal(storage.getItem('cart_test-token'), null);
  assert.equal(storage.getItem('wishlist_test-token'), null);
});

test('corrupted local storage does not crash cart synchronization', () => {
  storage.setItem('cart_cleared_by_user', '1');
  storage.setItem('cart_test-token', '{not-json');
  assert.doesNotThrow(() => cartState.syncWithToken());
  assert.deepEqual(cartState.items, []);
  assert.equal(storage.getItem('cart_test-token'), null);
});

test('stored cart quantities are normalized to safe positive integers', () => {
  storage.setItem('cart_test-token', JSON.stringify([
    { id: 1, quantity: -5 },
    { id: 2, quantity: 10_000 },
    { quantity: 3 },
  ]));
  cartState.syncWithToken();
  assert.deepEqual(cartState.items, [
    { id: 1, quantity: 1 },
    { id: 2, quantity: 999 },
  ]);
});

test('refreshCartItems preserves variant identity so one variant can be removed safely', async () => {
  const variants = [
    {
      id: 25,
      price: 100,
      quantity: 1,
      selectedAttributes: { color: 'أسود' },
      cart_item_key: '25_color:أسود',
    },
    {
      id: 25,
      price: 100,
      quantity: 1,
      selectedAttributes: { color: 'فضي' },
      cart_item_key: '25_color:فضي',
    },
  ];
  storage.setItem('cart_test-token', JSON.stringify(variants));
  cartState.syncWithToken();

  await cartState.refreshCartItems();

  assert.deepEqual(
    cartState.items.map(item => item.cart_item_key),
    ['25_color:أسود', '25_color:فضي']
  );

  cartState.removeFromCart('25_color:أسود');

  assert.equal(cartState.items.length, 1);
  assert.equal(cartState.items[0].cart_item_key, '25_color:فضي');
});
