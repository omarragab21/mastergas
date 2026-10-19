import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPrice,
  formatPriceHtml,
  formatPriceWithCurrency,
  isolateLtr,
} from '../website/src/utils/price.js';

test('formatPrice uses Western digits with thousands separators', () => {
  assert.equal(formatPrice(1234.05), '1,234.05');
  assert.equal(formatPrice('1234'), '1,234');
  assert.equal(formatPrice(2045.07), '2,045.07');
});

test('formatPrice fraction modes', () => {
  assert.equal(formatPrice(1234, { fraction: 'fixed' }), '1,234.00');
  assert.equal(formatPrice(1234.5, { fraction: 'auto' }), '1,234.50');
  assert.equal(formatPrice(1234.56, { fraction: 'none' }), '1,235');
});

test('formatPrice handles invalid input and negatives', () => {
  assert.equal(formatPrice(undefined), '0');
  assert.equal(formatPrice('abc', { fraction: 'fixed' }), '0.00');
  assert.equal(formatPrice(50, { negative: true }), '-50');
  assert.equal(formatPrice(-50), '-50');
});

test('currency strings isolate the amount so RTL text cannot reorder it', () => {
  assert.equal(formatPriceWithCurrency(1234, 'ريال'), `${isolateLtr('1,234')} ريال`);
  assert.equal(formatPriceWithCurrency(1234.05, '', { fraction: 'fixed' }), isolateLtr('1,234.05'));
  assert.ok(formatPriceWithCurrency(10, 'SAR', { negative: true }).startsWith('⁦-10⁩'));
});

test('printed invoice fragments wrap the amount in an LTR bdi', () => {
  const html = formatPriceHtml(1234.5, 'ر.س');
  assert.match(html, /<bdi dir="ltr"[^>]*>1,234\.50<\/bdi> ر\.س$/);
});
