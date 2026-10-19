import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

class MemoryStorage {
  constructor() { this.data = new Map(); }
  getItem(key) { return this.data.get(key) ?? null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
  clear() { this.data.clear(); }
}

const storage = new MemoryStorage();
globalThis.localStorage = storage;
globalThis.window = { location: { pathname: '/admin/returns', replace() {} } };

let adminServer;
let websiteServer;
let adminApi;
let websiteApi;
let adminReturns;
let adminSettings;
let adminSettingsModule;
let websiteReturns;
let websiteSettings;
let profileService;
let calls;

const captureAdapter = async (config) => {
  calls.push({ method: config.method, url: config.url, data: config.data, headers: config.headers });
  return {
    data: { status: true, data: [] },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  };
};

before(async () => {
  adminServer = await createServer({ root: new URL('../admin', import.meta.url).pathname, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
  websiteServer = await createServer({ root: new URL('../website', import.meta.url).pathname, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });

  adminApi = (await adminServer.ssrLoadModule('/src/config/axios.js')).default;
  websiteApi = (await websiteServer.ssrLoadModule('/src/config/axios.js')).default;
  adminReturns = (await adminServer.ssrLoadModule('/src/services/returnsService.js')).returnsService;
  adminSettingsModule = await adminServer.ssrLoadModule('/src/services/settingsService.js');
  adminSettings = adminSettingsModule.settingsService;
  websiteReturns = (await websiteServer.ssrLoadModule('/src/services/returnsService.js')).returnsService;
  websiteSettings = (await websiteServer.ssrLoadModule('/src/services/settingsService.js')).settingsService;
  profileService = (await websiteServer.ssrLoadModule('/src/modules/profile/services/profileService.js')).profileService;

  adminApi.defaults.adapter = captureAdapter;
  websiteApi.defaults.adapter = captureAdapter;
});

after(async () => {
  await adminServer?.close();
  await websiteServer?.close();
});

beforeEach(() => {
  calls = [];
  storage.clear();
  storage.setItem('token', 'admin-token');
  storage.setItem('c_token', 'customer-token');
});

test('admin returns use the Postman v1 list and review contract', async () => {
  await adminReturns.listAll();
  assert.equal(calls.at(-1).method, 'get');
  assert.equal(calls.at(-1).url, '/v1/returns');

  await adminReturns.getById(9);
  assert.equal(calls.at(-1).url, '/v1/returns/9');

  await adminReturns.updateStatus(9, { status: 'approved', admin_notes: 'تم الفحص وإعادة المنتج للمخزون' });
  const review = calls.at(-1);
  assert.equal(review.method, 'post');
  assert.equal(review.url, '/v1/returns/9/review');
  assert.deepEqual(JSON.parse(review.data), {
    action: 'approve',
    admin_notes: 'تم الفحص وإعادة المنتج للمخزون',
  });
});

test('admin settings use GET /v1/settings and POST /v1/settings/bulk', async () => {
  await adminSettings.getAdminSettings();
  assert.equal(calls.at(-1).url, '/v1/settings');

  await adminSettings.bulkUpdate({ vat_percentage: 14, social_links: { whatsapp: '+2010' } });
  const update = calls.at(-1);
  assert.equal(update.method, 'post');
  assert.equal(update.url, '/v1/settings/bulk');
  const body = JSON.parse(update.data);
  assert.equal(body.settings[0].key, 'vat_percentage');
  assert.equal(body.settings[0].group, 'commerce');
  assert.equal(body.settings[1].group, 'social');
});

test('every General settings field is serialized and canonical API aliases are included', async () => {
  const generalSettings = {
    site_name: 'Mastergas QA',
    free_delivery_threshold: '33',
    shipping_cost: '25',
    tax_rate: '14',
    delivery_range_km: '20',
    enable_city_shipping: '1',
    use_city_specific_rates: '1',
    default_city_shipping_rate: '7',
    support_phone: '+201000000000',
    support_email: 'qa-support@example.test',
    email: 'qa@example.test',
    address_ar: 'عنوان اختبار ماسترجاز',
    address_en: 'Mastergas QA address',
    working_hours_ar: 'السبت - الخميس: 9 صباحاً - 9 مساءً',
    working_hours_en: 'Saturday - Thursday: 9 AM - 9 PM',
    friday_hours_ar: 'الجمعة: 2 مساءً - 9 مساءً',
    friday_hours_en: 'Friday: 2 PM - 9 PM',
    currency_ar: 'ر.س',
    currency_en: 'SAR',
    logo: 'https://cdn.example.test/logo.png',
    favicon: 'https://cdn.example.test/favicon.png',
    footer_logo: 'https://cdn.example.test/footer-logo.png',
    whatsapp: 'https://wa.me/201000000000',
    facebook: 'https://facebook.com/mastergas-qa',
    instagram: 'https://instagram.com/mastergas-qa',
    x_twitter: 'https://x.com/mastergas-qa',
    linkedin: 'https://linkedin.com/company/mastergas-qa',
    youtube: 'https://youtube.com/@mastergas-qa',
    snapchat: 'https://snapchat.com/add/mastergas-qa',
    tiktok: 'https://tiktok.com/@mastergas-qa',
    home_category_1: '1',
    home_category_2: '2',
    home_section_category_title_ar: 'تسوّق حسب الفئة QA',
    home_section_category_title_en: 'Shop by Category QA',
    home_section_offers_title_ar: 'العروض المميزة QA',
    home_section_offers_title_en: 'Featured Offers QA',
    about_title_ar: 'من نحن QA',
    about_title_en: 'About Us QA',
    about_content_ar: 'محتوى تجريبي بالعربية',
    about_content_en: 'QA content in English',
  };

  await adminSettings.bulkUpdate(generalSettings);
  const body = JSON.parse(calls.at(-1).data);
  const values = Object.fromEntries(body.settings.map((setting) => [setting.key, setting.value]));

  for (const key of Object.keys(generalSettings)) {
    assert.ok(Object.hasOwn(values, key), `missing setting key: ${key}`);
  }

  assert.equal(values.default_shipping_cost, '25');
  assert.equal(values.vat_percentage, 14);
  assert.equal(values.site_contact_phone, '+201000000000');
  assert.deepEqual(values.social_links, {
    whatsapp: 'https://wa.me/201000000000',
    facebook: 'https://facebook.com/mastergas-qa',
    instagram: 'https://instagram.com/mastergas-qa',
    x_twitter: 'https://x.com/mastergas-qa',
    linkedin: 'https://linkedin.com/company/mastergas-qa',
    youtube: 'https://youtube.com/@mastergas-qa',
    snapchat: 'https://snapchat.com/add/mastergas-qa',
    tiktok: 'https://tiktok.com/@mastergas-qa',
  });
});

test('clearing a dashboard social field also clears its nested public-site value', async () => {
  await adminSettings.bulkUpdate({
    social_links: {
      facebook: 'https://facebook.com/old',
      instagram: 'https://instagram.com/old',
    },
    facebook: '',
    instagram: 'https://instagram.com/new',
  });

  const values = Object.fromEntries(JSON.parse(calls.at(-1).data).settings.map((setting) => [setting.key, setting.value]));
  assert.deepEqual(values.social_links, {
    facebook: null,
    instagram: 'https://instagram.com/new',
  });
});

test('website return list and create use the authenticated Site API contract', async () => {
  await websiteReturns.listMine();
  assert.equal(calls.at(-1).url, '/v1/site/returns');

  await websiteReturns.getById(9);
  assert.equal(calls.at(-1).url, '/v1/site/returns/9');

  await websiteReturns.create({
    order_id: 42,
    reason: 'المنتج وصل بحالة مختلفة عن الوصف ومرفق به خدش واضح',
    items: [{ order_item_id: 17, quantity: 2, condition: 'damaged', reason: 'خدش في الواجهة' }],
  });
  const request = calls.at(-1);
  assert.equal(request.method, 'post');
  assert.equal(request.url, '/v1/site/orders/42/returns');
  assert.deepEqual(JSON.parse(request.data), {
    reason: 'المنتج وصل بحالة مختلفة عن الوصف ومرفق به خدش واضح',
    items: [{ order_item_id: 17, quantity: 2, condition: 'damaged', reason: 'خدش في الواجهة' }],
  });
});

test('profile data is no longer hard-coded empty for returns and site settings', async () => {
  await profileService.getReturns();
  assert.equal(calls.at(-1).url, '/v1/site/returns');

  await websiteSettings.getSettings({ ttl: 0 });
  assert.equal(calls.at(-1).url, '/v1/site/settings');
});

test('dashboard VAT and shipping edits override the values loaded from the API', () => {
  // The form holds both the loaded API keys and the editable fields.
  const { buildSettingsPayload } = adminSettingsModule;
  const payload = buildSettingsPayload({
    vat_percentage: 0,
    tax_rate: '14',
    default_shipping_cost: '15',
    shipping_cost: '30',
  });
  const values = Object.fromEntries(payload.map((setting) => [setting.key, setting.value]));
  assert.equal(values.vat_percentage, 14);
  assert.equal(values.default_shipping_cost, '30');
});
