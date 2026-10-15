import test from 'node:test';
import assert from 'node:assert/strict';
import { useCheckoutPricing } from '../website/src/composables/useCheckoutPricing.js';

const pricing = useCheckoutPricing({
  getActiveOfferForProduct: (item) => item.offer || null,
  calculatePriceWithOffer: (item, offer) => item.price * (1 - offer.discount / 100),
});

test('checkout pricing applies percentage discounts and quantities', () => {
  assert.equal(pricing.getItemPriceWithDiscount({ price: 100, discount: 10, quantity: 2 }), 180);
  assert.equal(pricing.getItemUnitPrice({ price: 100, discount: 10, quantity: 2 }), 90);
});

test('checkout pricing supports fixed discounts', () => {
  assert.equal(pricing.getItemPriceWithDiscount({ price: 100, discount: 15, quantity: 2, type: 'fixed' }), 170);
  assert.equal(pricing.getItemUnitPrice({ price: 100, discount: 15, quantity: 2, type: 'fixed' }), 85);
});

test('checkout pricing prefers an active offer over the cart discount', () => {
  const item = { price: 200, discount: 5, quantity: 1, offer: { discount: 25 } };
  assert.equal(pricing.getItemPriceWithDiscount(item), 150);
  assert.equal(pricing.getItemUnitPrice(item), 150);
});

test('bundle pricing charges the bundle once when all required products are in the cart', () => {
  const offer = {
    id: 7,
    type: 'bundle',
    bundle_price: 1999,
    items: [
      { product_id: 49, quantity: 1 },
      { product_id: 50, quantity: 1 },
    ],
  };
  const items = [
    { id: 49, price: 2249.1, quantity: 1, offer },
    { id: 50, price: 1671.12, quantity: 1, offer },
  ];
  const cartPricing = pricing.getCartPricing(items);

  assert.equal(cartPricing.subtotal, 1999);
  assert.equal(
    pricing.getItemPriceWithDiscount(items[0], items) + pricing.getItemPriceWithDiscount(items[1], items),
    1999,
  );
});

test('incomplete bundle falls back to the normal product price', () => {
  const offer = {
    id: 7,
    type: 'bundle',
    bundle_price: 1999,
    items: [
      { product_id: 49, quantity: 1 },
      { product_id: 50, quantity: 1 },
    ],
  };
  const items = [{ id: 49, price: 2249.1, quantity: 1, offer }];

  assert.equal(pricing.getCartPricing(items).subtotal, 2249.1);
});
