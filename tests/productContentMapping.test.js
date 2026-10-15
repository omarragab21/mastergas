import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSiteProduct } from '../website/src/services/siteDataMappers.js';

test('site product mapping preserves localized installation and shipping content', () => {
  const product = normalizeSiteProduct({
    id: 39,
    translations: {
      ar: {
        tips: ['تعليمات تركيب عربية'],
        shipping_info: ['شحن وإرجاع عربي'],
      },
      en: {
        tips: ['English installation instruction'],
        shipping_info: ['English shipping and returns'],
      },
    },
  });

  assert.deepEqual(product.tips_i18n, {
    ar: ['تعليمات تركيب عربية'],
    en: ['English installation instruction'],
  });
  assert.deepEqual(product.shipping_info_i18n, {
    ar: ['شحن وإرجاع عربي'],
    en: ['English shipping and returns'],
  });
});

test('site product mapping keeps missing content empty instead of inventing defaults', () => {
  const product = normalizeSiteProduct({ id: 40, attributes: { voltage: '220V' } });

  assert.deepEqual(product.tips_i18n, { ar: [], en: [] });
  assert.deepEqual(product.shipping_info_i18n, { ar: [], en: [] });
  assert.deepEqual(product.features_i18n, { ar: [], en: [] });
});
