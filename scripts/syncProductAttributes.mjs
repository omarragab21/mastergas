/**
 * Sync product attributes and their values from the catalog specifications.
 *
 * Required environment variables:
 *   MASTERGAS_ADMIN_EMAIL
 *   MASTERGAS_ADMIN_PASSWORD
 * Optional:
 *   MASTERGAS_API_BASE (defaults to the production API)
 *
 * The script is intentionally non-destructive:
 * - it never deletes an existing attribute or value;
 * - it creates missing attributes with an empty values_list;
 * - it adds missing values through the dedicated /values endpoint.
 */

const API_BASE = process.env.MASTERGAS_API_BASE || 'https://backend-mastergas.be-kite.com/api';
const EMAIL = process.env.MASTERGAS_ADMIN_EMAIL;
const PASSWORD = process.env.MASTERGAS_ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) {
  throw new Error('Set MASTERGAS_ADMIN_EMAIL and MASTERGAS_ADMIN_PASSWORD before running this script.');
}

const definitions = [
  {
    ar: 'الألوان',
    en: 'Colors',
    type: 'color',
    sort_order: 1,
    values: [
      { label: 'أسود', color: '#111827' },
      { label: 'أبيض', color: '#ffffff' },
      { label: 'فضي', color: '#9ca3af' },
      { label: 'ستانلس ستيل', color: '#c0c0c0' },
      { label: 'رمادي معدني', color: '#6b7280' },
    ],
  },
  {
    ar: 'الارتفاع',
    en: 'Height',
    type: 'select',
    sort_order: 2,
    values: ['59.5 سم', '5 سم', '4.5 سم', '70-105 سم', '55 سم', '48 سم', '115 سم', '72 سم', '12 سم'].map(label => ({ label })),
  },
  {
    ar: 'العرض',
    en: 'Width',
    type: 'select',
    sort_order: 3,
    values: ['59.5 سم', '89.5 سم', '86 سم', '58 سم', '90 سم', '35 سم', '30 سم', '135 سم', '42 سم', '68 سم'].map(label => ({ label })),
  },
  {
    ar: 'السعة',
    en: 'Capacity',
    type: 'select',
    sort_order: 4,
    values: ['65 لتر', '85 لتر', '5 شعلات غاز', '4 شعلات غاز', 'قوة شفط 1200 م³/ساعة', '10 لتر / دقيقة', '6 لتر / دقيقة', 'مساحة شواء 70 × 45 سم', '3 ألواح تدفئة سيراميك', '3 شعلات حديد زهر'].map(label => ({ label })),
  },
  {
    ar: 'العمق',
    en: 'Depth',
    type: 'select',
    sort_order: 5,
    values: ['55 سم', '56 سم', '51 سم', '50 سم', '18 سم', '15 سم', '58 سم', '36 سم', '38 سم'].map(label => ({ label })),
  },
  {
    ar: 'الجهد الكهربائي',
    en: 'Voltage',
    type: 'select',
    sort_order: 6,
    values: ['220-240 فولت', 'شاشة إلكترونية تعمل بالبطاريات', 'بطاريات جافة', 'لا يتطلب كهرباء'].map(label => ({ label })),
  },
  {
    ar: 'نوع الطاقة',
    en: 'Energy Source',
    type: 'select',
    sort_order: 7,
    values: ['غاز طبيعي / مسال', 'كهرباء 230 واط', 'أسطوانات غاز مسال', 'أسطوانة غاز منزلي', 'غاز مسال'].map(label => ({ label })),
  },
  {
    ar: 'المؤقت الرقمي',
    en: 'Digital Timer',
    type: 'select',
    sort_order: 8,
    values: ['نعم', 'لا', 'شاشة رقمية LED', 'مؤشر حرارة رقمي', 'مقياس حرارة مدمج بالغطاء', 'تحكم يدوي بثلاث مستويات', 'مفاتيح نحاسية مدرجة'].map(label => ({ label })),
  },
  {
    ar: 'وظائف الطهي',
    en: 'Cooking Functions',
    type: 'select',
    sort_order: 9,
    values: ['4 وظائف', '6 وظائف'].map(label => ({ label })),
  },
  {
    ar: 'نظام الإشعال',
    en: 'Ignition System',
    type: 'select',
    sort_order: 10,
    values: ['إلكتروني ذاتي', 'إلكتروني مدمج بالمفتاح', 'إلكتروني أوتوماتيكي فوري', 'أوتوماتيكي عند فتح صنبور المياه', 'إلكتروني نبضي', 'إشعال بيزو ذاتي', 'يدوي سريع'].map(label => ({ label })),
  },
  {
    ar: 'صمام الأمان',
    en: 'Safety Valve',
    type: 'select',
    sort_order: 11,
    values: ['أمان كامل', 'أمان كامل فوري', 'حماية ثلاثية متكاملة', 'صمامات أمان معتمدة', 'نظام ODS مع قفل عند الميلان', 'صمامات نحاسية آمنة'].map(label => ({ label })),
  },
  {
    ar: 'بلد المنشأ',
    en: 'Country of Origin',
    type: 'select',
    sort_order: 12,
    values: [{ label: 'إيطاليا' }],
  },
  {
    ar: 'اللون والمظهر',
    en: 'Color & Finish',
    type: 'select',
    sort_order: 13,
    values: ['ستانلس ستيل', 'ستانلس ستيل ورمادي معدني', 'زجاج حراري مقسّى أسود', 'ستانلس ستيل 304', 'أبيض ناصع مقاوم للصدأ', 'أبيض ناصع', 'ستانلس ستيل وأسود', 'أسود ملكي', 'أسود مطلي حرارياً'].map(label => ({ label })),
  },
];

const parseBody = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
};

const request = async (path, { token, method = 'GET', body } = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await parseBody(response);
  if (!response.ok) {
    throw new Error(`${method} ${path} failed with ${response.status}: ${JSON.stringify(data)}`);
  }
  return { status: response.status, data };
};

const unwrapList = (payload) => payload?.data?.data || payload?.data || [];
const unwrapRecord = (payload) => payload?.data || payload;

const login = await request('/v1/login', {
  method: 'POST',
  body: { email: EMAIL, password: PASSWORD },
});
const token = login.data?.token;
if (!token) throw new Error('Login succeeded without a token.');

const before = unwrapList((await request('/dashboard/product-attributes', { token })).data);
const summary = [];

for (const definition of definitions) {
  let attribute = before.find(item => String(item.name) === definition.ar);
  let created = false;

  if (!attribute) {
    const result = await request('/dashboard/product-attributes/store', {
      token,
      method: 'POST',
      body: {
        name: { ar: definition.ar, en: definition.en },
        label: { ar: `اختر ${definition.ar}`, en: `Select ${definition.en}` },
        type: definition.type,
        values_list: [],
        is_active: true,
        sort_order: definition.sort_order,
      },
    });
    attribute = unwrapRecord(result.data);
    created = true;
  }

  const currentValues = Array.isArray(attribute.values) ? attribute.values : [];
  const added = [];
  for (const value of definition.values) {
    const exists = currentValues.some(item => String(item.label) === String(value.label));
    if (exists) continue;

    const result = await request(`/dashboard/product-attributes/${attribute.id}/values`, {
      token,
      method: 'POST',
      body: { label: value.label, color: value.color || null, is_active: true },
    });
    added.push({ label: value.label, status: result.status });
  }

  summary.push({
    name: definition.ar,
    id: attribute.id,
    created,
    expectedValues: definition.values.length,
    addedValues: added.length,
    added,
  });
}

const after = unwrapList((await request('/dashboard/product-attributes', { token })).data);
const verification = definitions.map(definition => {
  const attribute = after.find(item => String(item.name) === definition.ar);
  const actualLabels = new Set((attribute?.values || []).map(value => String(value.label)));
  const missing = definition.values.map(value => value.label).filter(label => !actualLabels.has(label));
  return { name: definition.ar, id: attribute?.id || null, actualValues: attribute?.values?.length || 0, missing };
});

if (verification.some(item => !item.id || item.missing.length)) {
  throw new Error(`Verification failed: ${JSON.stringify(verification)}`);
}

console.log(JSON.stringify({
  api_base: API_BASE,
  attributes_before: before.length,
  attributes_after: after.length,
  summary,
  verification,
}, null, 2));
