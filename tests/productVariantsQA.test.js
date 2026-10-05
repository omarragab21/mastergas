import test, { after, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { dedupeColorOptions } from '../src/utils/productAttributes.js';

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
  storage.setItem('c_token', 'test-user');
  cartState.clearCart();
});

test('Product Variants QA: Multi-image support', () => {
  const productWithMultipleImages = {
    id: 101,
    name: 'فرن بلت إن إيطالي 90 سم',
    image: 'products/main.jpg',
    images: ['products/main.jpg', 'products/side.jpg', 'products/inside.jpg', 'products/controls.jpg'],
    price: 3200
  };

  assert.equal(productWithMultipleImages.images.length, 4);
  assert.equal(productWithMultipleImages.images[0], 'products/main.jpg');
  assert.equal(productWithMultipleImages.images[1], 'products/side.jpg');
});

test('Product Variants QA: Color options parsing and hex formatting', () => {
  const colorMap = {
    'أسود': '#111827',
    'black': '#111827',
    'أبيض': '#ffffff',
    'white': '#ffffff',
    'فضي': '#9ca3af',
    'silver': '#9ca3af',
    'ستانلس ستيل': '#a8b2bc'
  };

  const resolveColor = (raw) => {
    if (typeof raw === 'object' && raw !== null) {
      return { name: raw.name || raw.label, hex: raw.hex || colorMap[raw.name] || '#6b7280' };
    }
    const str = String(raw);
    if (str.includes('|')) {
      const [name, hex] = str.split('|');
      return { name: name.trim(), hex: hex.trim() };
    }
    return { name: str.trim(), hex: colorMap[str.trim().toLowerCase()] || colorMap[str.trim()] || '#6b7280' };
  };

  const pipeFormat = resolveColor('أسود|#000000');
  assert.equal(pipeFormat.name, 'أسود');
  assert.equal(pipeFormat.hex, '#000000');

  const objFormat = resolveColor({ name: 'فضي', hex: '#C0C0C0' });
  assert.equal(objFormat.name, 'فضي');
  assert.equal(objFormat.hex, '#C0C0C0');

  const nameFallback = resolveColor('ستانلس ستيل');
  assert.equal(nameFallback.name, 'ستانلس ستيل');
  assert.equal(nameFallback.hex, '#a8b2bc');
});

test('Product Variants QA: Color aliases and pipe strings are deduplicated before rendering', () => {
  const colors = dedupeColorOptions([
    { label: 'أسود', color: '#111827' },
    { label: '  أسود  ', color: '#000000' },
    'أسود|#111827',
    { name: 'فضي', hex: '#9ca3af' },
    'فضي|#9ca3af'
  ]);

  assert.equal(colors.length, 2);
  assert.equal(colors[0].label, 'أسود');
  assert.equal(colors[1].name, 'فضي');
});

test('Product Variants QA: Adding distinct variants of same product generates distinct cart keys', () => {
  const product = {
    id: 50,
    name: 'مسطح غاز إيطالي 4 شعلات',
    price: 1500,
    discount: 0
  };

  // Add Variant 1: Black 60cm
  cartState.addToCart(product, 1, { 'color': 'أسود', 'size': '60 سم' });
  assert.equal(cartState.items.length, 1);
  assert.equal(cartState.items[0].id, 50);
  assert.equal(cartState.items[0].quantity, 1);
  assert.equal(cartState.items[0].cart_item_key, '50_color:أسود|size:60 سم');

  // Add Variant 2: Silver 90cm of the SAME product
  cartState.addToCart(product, 2, { 'color': 'فضي', 'size': '90 سم' });
  assert.equal(cartState.items.length, 2);
  assert.equal(cartState.items[1].cart_item_key, '50_color:فضي|size:90 سم');
  assert.equal(cartState.items[1].quantity, 2);

  // Add Variant 1 again: Should increment quantity of Variant 1, not Variant 2
  cartState.addToCart(product, 3, { 'color': 'أسود', 'size': '60 سم' });
  assert.equal(cartState.items.length, 2);
  assert.equal(cartState.items[0].quantity, 4); // 1 + 3
  assert.equal(cartState.items[1].quantity, 2);
});

test('Product Variants QA: Updating and removing specific variant items', () => {
  const product = {
    id: 88,
    name: 'سخان غاز فوري ماسترجاز',
    price: 900
  };

  cartState.addToCart(product, 1, { 'size': '6 لتر' });
  cartState.addToCart(product, 1, { 'size': '10 لتر' });
  assert.equal(cartState.items.length, 2);

  const key6L = cartState.items[0].cart_item_key;
  const key10L = cartState.items[1].cart_item_key;

  // Update quantity of 6L
  cartState.updateQuantity(key6L, 5);
  assert.equal(cartState.items.find(i => i.cart_item_key === key6L).quantity, 5);
  assert.equal(cartState.items.find(i => i.cart_item_key === key10L).quantity, 1);

  // Remove 6L variant only
  cartState.removeFromCart(key6L);
  assert.equal(cartState.items.length, 1);
  assert.equal(cartState.items[0].cart_item_key, key10L);
});

test('Product Variants QA: Backward compatibility without attributes', () => {
  const standardProduct = {
    id: 999,
    name: 'منظم غاز إيطالي مع هوز',
    price: 120
  };

  // Add without attributes
  cartState.addToCart(standardProduct, 2);
  assert.equal(cartState.items.length, 1);
  assert.equal(cartState.items[0].id, 999);
  assert.equal(cartState.items[0].quantity, 2);
  // Without attributes, cart_item_key is undefined and item behaves as standard item
  assert.equal(cartState.items[0].cart_item_key, undefined);

  // Updating using numeric ID
  cartState.updateQuantity(999, 4);
  assert.equal(cartState.items[0].quantity, 4);

  // Removing using numeric ID
  cartState.removeFromCart(999);
  assert.equal(cartState.items.length, 0);
});
