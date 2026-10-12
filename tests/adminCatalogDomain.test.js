import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toAttribute,
  toCategory,
  toDiscountCode,
  toProduct,
  toProductPayload,
} from '../admin/src/domain/catalog/adminCatalog.js';

test('Tijara category mapper exposes bilingual names and hierarchy for the View layer', () => {
  const category = toCategory({
    id: 10,
    name: 'Gas Cylinders',
    parent_id: null,
    translations: { ar: { name: 'أسطوانات الغاز' }, en: { name: 'Gas Cylinders' } },
    sub_categories: [{ id: 11, parent_id: 10, name: 'Sub', translations: { ar: { name: 'فرعي' } } }],
  });

  assert.equal(category.name_i18n.ar, 'أسطوانات الغاز');
  assert.equal(category.name_i18n.en, 'Gas Cylinders');
  assert.equal(category.sub_categories[0].parent_id, 10);
});

test('Tijara product mapper normalizes stock, status, discount, images, and category', () => {
  const product = toProduct({
    id: 7,
    category_id: 3,
    number: 8,
    is_active: true,
    discount_percentage: 10,
    images: [{ id: 1, image_url: '/storage/product.jpg' }],
    translations: { ar: { name: 'منتج' }, en: { name: 'Product' } },
    category: { id: 3, name: 'Kitchen', translations: { ar: { name: 'مطبخ' } } },
  });

  assert.equal(product.name_i18n.ar, 'منتج');
  assert.equal(product.stock, 8);
  assert.equal(product.status, 'active');
  assert.equal(product.discount, 10);
  assert.deepEqual(product.images, ['/storage/product.jpg']);
  assert.equal(product.category.name_i18n.ar, 'مطبخ');
});

test('Tijara attributes normalize color_swatch options to UI values', () => {
  const attribute = toAttribute({
    id: 2,
    type: 'color_swatch',
    name: 'Colors',
    translations: { ar: { name: 'الألوان' } },
    options: [{ id: 6, name: 'Royal Black', value_code: '#111827' }],
  });

  assert.equal(attribute.type, 'color');
  assert.equal(attribute.label, 'الألوان');
  assert.equal(attribute.values[0].label, 'Royal Black');
  assert.equal(attribute.values[0].color, '#111827');
});

test('Tijara discount mapper derives status from is_active and validity dates', () => {
  const discount = toDiscountCode({
    id: 5,
    is_active: true,
    start_date: '2026-01-01T00:00:00Z',
    end_date: '2026-01-02T00:00:00Z',
    translations: { ar: { name: 'خصم' }, en: { name: 'Discount' } },
  });

  assert.equal(discount.status, 'expired');
  assert.equal(discount.name_i18n.ar, 'خصم');
});

test('product payload uses the Tijara v1 field contract', () => {
  const payload = toProductPayload({
    name_ar: 'منتج',
    name_en: 'Product',
    category_id: 3,
    price: 100,
    quantity: 4,
    discount: 5,
    is_active: true,
    description_ar: 'وصف',
    description_en: 'Description',
  });

  assert.equal(payload.name_ar, 'منتج');
  assert.equal(payload.category_id, 3);
  assert.equal(payload.number, 4);
  assert.equal(payload.discount_percentage, 5);
  assert.deepEqual(payload.product_description_en, ['Description']);
  assert.equal(Object.hasOwn(payload, 'quantity'), false);
});
