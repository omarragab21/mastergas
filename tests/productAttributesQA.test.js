import test from 'node:test';
import assert from 'node:assert/strict';
import { localizedText } from '../website/src/utils/productAttributes.js';
import { normalizeSiteProduct } from '../website/src/services/siteDataMappers.js';

test('product attribute arrays render their names instead of [object Object]', () => {
  assert.equal(localizedText([{ name: '27' }]), '27');
  assert.equal(
    localizedText([{ name: '6 وظائف' }, { name: '7 وظائف' }]),
    '6 وظائف / 7 وظائف',
  );
});

test('localized product values prefer Arabic and support nested fields', () => {
  assert.equal(localizedText({ ar: 'السعة', en: 'Capacity' }), 'السعة');
  assert.equal(localizedText({ value: { ar: 'غاز مسال', en: 'LPG' } }), 'غاز مسال');
});

test('product content arrays also normalize nested API objects', () => {
  const product = normalizeSiteProduct({
    id: 16,
    price: 1349,
    final_price: 876.85,
    product_description: [{ name: 'وصف' }],
    key_features: [{ name: 'ميزة' }],
  });

  assert.equal(product.description_ar, 'وصف');
  assert.deepEqual(product.features, ['ميزة']);
  assert.equal(product.price, 1349);
  assert.equal(product.sale_price, 876.85);
});
