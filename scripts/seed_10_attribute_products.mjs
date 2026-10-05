/**
 * Create ten QA products using only values already registered in
 * /dashboard/product-attributes.
 *
 * Required environment variables:
 *   MASTERGAS_ADMIN_EMAIL
 *   MASTERGAS_ADMIN_PASSWORD
 * Optional:
 *   MASTERGAS_API_BASE
 *
 * The script is idempotent by SKU: an existing SKU is skipped.
 * It does not delete or update existing products.
 */

import fs from 'node:fs';
import path from 'node:path';

const API_BASE = process.env.MASTERGAS_API_BASE || 'https://backend-mastergas.be-kite.com/api';
const EMAIL = process.env.MASTERGAS_ADMIN_EMAIL;
const PASSWORD = process.env.MASTERGAS_ADMIN_PASSWORD;
const IMAGE_PATH = path.resolve('public/images/products/oven_main.jpg');

if (!EMAIL || !PASSWORD) {
  throw new Error('Set MASTERGAS_ADMIN_EMAIL and MASTERGAS_ADMIN_PASSWORD before running this script.');
}

const plans = [
  {
    sku: 'MG-QA-ATTR-01', nameAr: 'فرن غاز مدمج ماسترجاز 60 سم - اختبار الخصائص 01', nameEn: 'Mastergas 60cm Built-in Gas Oven - Attribute QA 01',
    category: 57, price: 2499, quantity: 25, discount: 8,
    attrs: {
      'الألوان': ['ستانلس ستيل'], 'الارتفاع': ['59.5 سم'], 'العرض': ['59.5 سم'], 'السعة': ['65 لتر'], 'العمق': ['55 سم'],
      'الجهد الكهربائي': ['220-240 فولت'], 'نوع الطاقة': ['غاز طبيعي / مسال'], 'المؤقت الرقمي': ['نعم'], 'وظائف الطهي': ['4 وظائف'],
      'صمام الأمان': ['أمان كامل'], 'اللون والمظهر': ['ستانلس ستيل 304'], 'نظام الإشعال': ['إلكتروني ذاتي'], 'بلد المنشأ': ['إيطاليا'],
    },
  },
  {
    sku: 'MG-QA-ATTR-02', nameAr: 'فرن غاز مدمج ماسترجاز 90 سم - اختبار الخصائص 02', nameEn: 'Mastergas 90cm Built-in Gas Oven - Attribute QA 02',
    category: 57, price: 3899, quantity: 15, discount: 10,
    attrs: {
      'الألوان': ['فضي'], 'الارتفاع': ['70-105 سم'], 'العرض': ['89.5 سم'], 'السعة': ['85 لتر'], 'العمق': ['56 سم'],
      'الجهد الكهربائي': ['220-240 فولت'], 'نوع الطاقة': ['غاز طبيعي / مسال'], 'المؤقت الرقمي': ['شاشة رقمية LED'], 'وظائف الطهي': ['6 وظائف'],
      'صمام الأمان': ['أمان كامل فوري'], 'اللون والمظهر': ['ستانلس ستيل ورمادي معدني'], 'نظام الإشعال': ['إلكتروني مدمج بالمفتاح'], 'بلد المنشأ': ['إيطاليا'],
    },
  },
  {
    sku: 'MG-QA-ATTR-03', nameAr: 'مسطح غاز زجاجي ماسترجاز 5 شعلات - اختبار الخصائص 03', nameEn: 'Mastergas 5-Burner Glass Gas Hob - Attribute QA 03',
    category: 57, price: 1949, quantity: 28, discount: 5,
    attrs: {
      'الألوان': ['ستانلس ستيل'], 'الارتفاع': ['5 سم'], 'العرض': ['86 سم'], 'السعة': ['5 شعلات غاز'], 'العمق': ['51 سم'],
      'الجهد الكهربائي': ['لا يتطلب كهرباء'], 'نوع الطاقة': ['غاز مسال'], 'المؤقت الرقمي': ['لا'], 'صمام الأمان': ['حماية ثلاثية متكاملة'],
      'اللون والمظهر': ['زجاج حراري مقسّى أسود'], 'نظام الإشعال': ['إلكتروني أوتوماتيكي فوري'], 'بلد المنشأ': ['إيطاليا'],
    },
  },
  {
    sku: 'MG-QA-ATTR-04', nameAr: 'مسطح غاز ستانلس ستيل ماسترجاز 4 شعلات - اختبار الخصائص 04', nameEn: 'Mastergas 4-Burner Stainless Gas Hob - Attribute QA 04',
    category: 57, price: 1449, quantity: 30, discount: 0,
    attrs: {
      'الألوان': ['فضي'], 'الارتفاع': ['4.5 سم'], 'العرض': ['58 سم'], 'السعة': ['4 شعلات غاز'], 'العمق': ['50 سم'],
      'الجهد الكهربائي': ['220-240 فولت'], 'نوع الطاقة': ['غاز طبيعي / مسال'], 'صمام الأمان': ['صمامات أمان معتمدة'],
      'اللون والمظهر': ['ستانلس ستيل'], 'نظام الإشعال': ['إلكتروني مدمج بالمفتاح'], 'بلد المنشأ': ['إيطاليا'],
    },
  },
  {
    sku: 'MG-QA-ATTR-05', nameAr: 'شفاط مطبخ هرمي ماسترجاز 90 سم - اختبار الخصائص 05', nameEn: 'Mastergas 90cm Pyramid Hood - Attribute QA 05',
    category: 57, price: 1650, quantity: 20, discount: 12,
    attrs: {
      'الألوان': ['فضي'], 'الارتفاع': ['115 سم'], 'العرض': ['90 سم'], 'السعة': ['قوة شفط 1200 م³/ساعة'], 'العمق': ['50 سم'],
      'الجهد الكهربائي': ['220-240 فولت'], 'نوع الطاقة': ['كهرباء 230 واط'], 'المؤقت الرقمي': ['مؤشر حرارة رقمي'],
      'صمام الأمان': ['أمان كامل'], 'اللون والمظهر': ['ستانلس ستيل وأسود'], 'بلد المنشأ': ['إيطاليا'],
    },
  },
  {
    sku: 'MG-QA-ATTR-06', nameAr: 'سخان مياه غاز فوري ماسترجاز 12 لتر - اختبار الخصائص 06', nameEn: 'Mastergas 12L Instant Gas Water Heater - Attribute QA 06',
    category: 58, price: 1280, quantity: 40, discount: 8,
    attrs: {
      'الألوان': ['أبيض'], 'الارتفاع': ['72 سم'], 'العرض': ['35 سم'], 'السعة': ['10 لتر / دقيقة'], 'العمق': ['18 سم'],
      'الجهد الكهربائي': ['شاشة إلكترونية تعمل بالبطاريات'], 'نوع الطاقة': ['غاز مسال'], 'المؤقت الرقمي': ['شاشة رقمية LED'],
      'صمام الأمان': ['نظام ODS مع قفل عند الميلان'], 'اللون والمظهر': ['أبيض ناصع'], 'نظام الإشعال': ['أوتوماتيكي عند فتح صنبور المياه'], 'بلد المنشأ': ['إيطاليا'],
    },
  },
  {
    sku: 'MG-QA-ATTR-07', nameAr: 'شواية غاز خارجية ماسترجاز 4 شعلات - اختبار الخصائص 07', nameEn: 'Mastergas 4-Burner Outdoor Gas Grill - Attribute QA 07',
    category: 59, price: 4250, quantity: 15, discount: 15,
    attrs: {
      'الألوان': ['ستانلس ستيل'], 'الارتفاع': ['115 سم'], 'العرض': ['135 سم'], 'السعة': ['مساحة شواء 70 × 45 سم'], 'العمق': ['58 سم'],
      'الجهد الكهربائي': ['لا يتطلب كهرباء'], 'نوع الطاقة': ['غاز مسال'], 'المؤقت الرقمي': ['مقياس حرارة مدمج بالغطاء'],
      'صمام الأمان': ['صمامات نحاسية آمنة'], 'اللون والمظهر': ['ستانلس ستيل 304'], 'نظام الإشعال': ['إشعال بيزو ذاتي'], 'بلد المنشأ': ['إيطاليا'],
    },
  },
  {
    sku: 'MG-QA-ATTR-08', nameAr: 'كاشف تسرب الغاز ماسترجاز مع صمام أمان - اختبار الخصائص 08', nameEn: 'Mastergas Gas Leak Detector with Safety Valve - Attribute QA 08',
    category: 56, price: 385, quantity: 60, discount: 5,
    attrs: {
      'الألوان': ['أبيض'], 'الارتفاع': ['12 سم'], 'العرض': ['30 سم'], 'السعة': ['6 لتر / دقيقة'], 'العمق': ['15 سم'],
      'الجهد الكهربائي': ['220-240 فولت'], 'نوع الطاقة': ['كهرباء 230 واط'], 'المؤقت الرقمي': ['مؤشر حرارة رقمي'],
      'صمام الأمان': ['حماية ثلاثية متكاملة'], 'اللون والمظهر': ['أبيض ناصع مقاوم للصدأ'], 'نظام الإشعال': ['إلكتروني أوتوماتيكي فوري'], 'بلد المنشأ': ['إيطاليا'],
    },
  },
  {
    sku: 'MG-QA-ATTR-09', nameAr: 'منظم غاز ماسترجاز مع مقياس ضغط - اختبار الخصائص 09', nameEn: 'Mastergas Gas Regulator with Pressure Gauge - Attribute QA 09',
    category: 52, price: 185, quantity: 100, discount: 0,
    attrs: {
      'الألوان': ['فضي'], 'الارتفاع': ['48 سم'], 'العرض': ['42 سم'], 'السعة': ['3 شعلات حديد زهر'], 'العمق': ['36 سم'],
      'الجهد الكهربائي': ['لا يتطلب كهرباء'], 'نوع الطاقة': ['أسطوانة غاز منزلي'], 'المؤقت الرقمي': ['لا'],
      'صمام الأمان': ['صمامات نحاسية آمنة'], 'اللون والمظهر': ['أسود ملكي'], 'نظام الإشعال': ['يدوي سريع'], 'بلد المنشأ': ['إيطاليا'],
    },
  },
  {
    sku: 'MG-QA-ATTR-10', nameAr: 'أسطوانة غاز مركبة ماسترجاز 24.5 لتر - اختبار الخصائص 10', nameEn: 'Mastergas 24.5L Composite Gas Cylinder - Attribute QA 10',
    category: 51, price: 449, quantity: 50, discount: 10,
    attrs: {
      'الألوان': ['أبيض'], 'الارتفاع': ['72 سم'], 'العرض': ['42 سم'], 'السعة': ['6 لتر / دقيقة'], 'العمق': ['38 سم'],
      'الجهد الكهربائي': ['لا يتطلب كهرباء'], 'نوع الطاقة': ['أسطوانات غاز مسال'], 'المؤقت الرقمي': ['لا'],
      'صمام الأمان': ['أمان كامل'], 'اللون والمظهر': ['أبيض ناصع'], 'نظام الإشعال': ['يدوي سريع'], 'بلد المنشأ': ['إيطاليا'],
    },
  },
];

const readJson = async (response) => {
  const text = await response.text();
  try { return text ? JSON.parse(text) : null; } catch { return text; }
};

const request = async (endpoint, { token, method = 'GET', body } = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }) },
    ...(body === undefined ? {} : { body: body instanceof FormData ? body : JSON.stringify(body) }),
  });
  const data = await readJson(response);
  if (!response.ok) throw new Error(`${method} ${endpoint} failed (${response.status}): ${JSON.stringify(data)}`);
  return { status: response.status, data };
};

const unwrapList = (payload) => payload?.data?.data || payload?.data || [];
const unwrapRecord = (payload) => payload?.data || payload;

const login = await request('/v1/login', { method: 'POST', body: { email: EMAIL, password: PASSWORD } });
const token = login.data?.token;
if (!token) throw new Error('Login succeeded without a token.');

const attributesPayload = (await request('/dashboard/product-attributes', { token })).data;
const apiAttributes = unwrapList(attributesPayload).filter(attribute => attribute.is_active !== false);
const apiByName = new Map(apiAttributes.map(attribute => [String(attribute.name), attribute]));

const resolveAttributes = (wanted) => {
  const resolved = {};
  for (const [name, labels] of Object.entries(wanted)) {
    const attribute = apiByName.get(name);
    if (!attribute) throw new Error(`Missing API attribute: ${name}`);
    const available = new Set((attribute.values || []).map(value => String(value.label)));
    const missing = labels.filter(label => !available.has(label));
    if (missing.length) throw new Error(`Missing values for ${name}: ${missing.join(', ')}`);
    resolved[name] = [...new Set(labels)];
  }
  return resolved;
};

const productsBefore = unwrapList((await request('/dashboard/products?per_page=100', { token })).data);
const existingSkus = new Set(productsBefore.map(product => String(product.sku || '')));
const results = [];

for (const plan of plans) {
  if (existingSkus.has(plan.sku)) {
    results.push({ sku: plan.sku, status: 'skipped_existing' });
    continue;
  }

  const attributes = resolveAttributes(plan.attrs);
  const form = new FormData();
  form.append('name', JSON.stringify({ ar: plan.nameAr, en: plan.nameEn }));
  form.append('description', JSON.stringify({ ar: `منتج اختبار تكاملي لخصائص المنتجات رقم ${plan.sku}.`, en: `Integrated product-attributes QA product ${plan.sku}.` }));
  form.append('price', String(plan.price));
  form.append('quantity', String(plan.quantity));
  form.append('discount', String(plan.discount));
  form.append('category_id', String(plan.category));
  form.append('is_active', '1');
  form.append('sku', plan.sku);
  form.append('features', JSON.stringify({ ar: 'خصائص مختارة من API\nبيانات متنوعة لاختبار شاشة التعديل', en: 'Values selected from the API\nDiverse data for edit-screen QA' }));
  form.append('tips', JSON.stringify({ ar: 'بيانات اختبارية قابلة للمراجعة من لوحة التحكم.', en: 'QA data reviewable from the admin dashboard.' }));
  form.append('shipping_info', JSON.stringify({ ar: 'منتج اختبار داخلي.', en: 'Internal QA product.' }));
  form.append('attributes', JSON.stringify(attributes));

  // Compatibility fields keep storefront color/size renderers populated while
  // the edit form reads the canonical Arabic attribute keys above.
  const colorValues = attributes['الألوان'] || [];
  const colorAttribute = apiByName.get('الألوان');
  const colorOptions = colorValues.map(label => ({ label, color: colorAttribute.values.find(value => value.label === label)?.color || '#111827' }));
  form.append('color_options', JSON.stringify(colorOptions));
  form.append('size_options', JSON.stringify([...(attributes['العرض'] || []), ...(attributes['السعة'] || [])]));

  if (fs.existsSync(IMAGE_PATH)) {
    const image = fs.readFileSync(IMAGE_PATH);
    form.append('image', new Blob([image], { type: 'image/jpeg' }), `${plan.sku.toLowerCase()}.jpg`);
  }

  const created = unwrapRecord((await request('/dashboard/products', { token, method: 'POST', body: form })).data);
  results.push({ sku: plan.sku, status: 'created', id: created?.id || null, attributeKeys: Object.keys(attributes), selectedValueCount: Object.values(attributes).flat().length });
  existingSkus.add(plan.sku);
}

const productsAfter = unwrapList((await request('/dashboard/products?per_page=100', { token })).data);
const verification = plans.map(plan => {
  const product = productsAfter.find(item => String(item.sku) === plan.sku);
  const expected = resolveAttributes(plan.attrs);
  const actual = product?.attributes || {};
  const missingValues = Object.entries(expected).flatMap(([name, labels]) => labels
    .filter(label => !Array.isArray(actual[name]) || !actual[name].includes(label))
    .map(label => `${name}: ${label}`));
  return {
    id: product?.id || null,
    sku: plan.sku,
    status: product ? 200 : 404,
    savedAttributeKeys: Object.keys(actual),
    savedAttributeCount: Object.values(actual).flat().length,
    missingValues,
  };
});

if (verification.some(item => item.status !== 200 || item.missingValues.length > 0)) {
  throw new Error(`Product attribute verification failed: ${JSON.stringify(verification)}`);
}

console.log(JSON.stringify({ api_base: API_BASE, requested: plans.length, results, verification }, null, 2));
