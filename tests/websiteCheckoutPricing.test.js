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
