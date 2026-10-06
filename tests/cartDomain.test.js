import test from 'node:test';
import assert from 'node:assert/strict';
import { createCartItemKey, normalizeCartItems } from '../src/domain/cart/cartItem.js';

test('cart item keys are deterministic regardless of attribute order', () => {
  assert.equal(
    createCartItemKey(25, { size: '60', color: 'Black' }),
    '25_color:Black|size:60',
  );
  assert.equal(
    createCartItemKey(25, { color: 'Black', size: '60' }),
    '25_color:Black|size:60',
  );
});

test('normalizing cart items preserves existing variant identity', () => {
  const item = {
    id: 25,
    quantity: 0,
    selectedAttributes: { color: 'Black' },
    cart_item_key: 'server-issued-key',
  };

  assert.deepEqual(normalizeCartItems([item]), [{
    ...item,
    quantity: 1,
  }]);
});

test('normalizing legacy variant items derives a stable key', () => {
  assert.equal(
    normalizeCartItems([{ id: 25, quantity: 2, selectedAttributes: { color: 'Silver' } }])[0].cart_item_key,
    '25_color:Silver',
  );
});
