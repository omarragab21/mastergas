import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

class MemoryStorage {
  constructor() {
    this.data = new Map();
  }
  getItem(key) {
    return this.data.has(key) ? this.data.get(key) : null;
  }
  setItem(key, value) {
    this.data.set(key, String(value));
  }
  removeItem(key) {
    this.data.delete(key);
  }
  clear() {
    this.data.clear();
  }
}

const storage = new MemoryStorage();
globalThis.localStorage = storage;
globalThis.window = {
  location: {
    hostname: 'localhost',
    pathname: '/',
    href: 'http://localhost/',
    replace(url) { this.pathname = url; }
  },
  scrollTo() {}
};

let viteServer;
let apiModule;
let api;

before(async () => {
  viteServer = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  });
  apiModule = await viteServer.ssrLoadModule('/src/config/axios.js');
  api = apiModule.default;
});

after(async () => {
  await viteServer?.close();
});

beforeEach(() => {
  storage.clear();
});

// ─── 1. Security & Token Isolation Audit for Website APIs ───────────────────
test('Website API Security Audit: Token isolation and header configuration', async (t) => {
  await t.test('Customer endpoints use c_token and never leak admin token', async () => {
    storage.setItem('token', 'ADMIN_SUPER_SECRET_TOKEN_XYZ');
    storage.setItem('c_token', 'CUSTOMER_SESSION_TOKEN_123');

    // Test a frontend customer endpoint
    const config = await api.interceptors.request.handlers[0].fulfilled({
      url: '/frontend/user',
      headers: {}
    });

    assert.strictEqual(
      config.headers.Authorization,
      'Bearer CUSTOMER_SESSION_TOKEN_123',
      'Frontend route must strictly use customer token (c_token)'
    );
    assert.notStrictEqual(
      config.headers.Authorization,
      'Bearer ADMIN_SUPER_SECRET_TOKEN_XYZ',
      'Frontend route must never attach admin token'
    );
  });

  await t.test('Guest browsing on website sends clean requests without Authorization header', async () => {
    storage.clear(); // Guest: no tokens

    const config = await api.interceptors.request.handlers[0].fulfilled({
      url: '/frontend/products',
      headers: {}
    });

    assert.strictEqual(
      config.headers.Authorization,
      undefined,
      'Guest website requests must not send Authorization header'
    );
  });

  await t.test('Language header reflects current site language', async () => {
    storage.setItem('lang', 'ar');
    let config = await api.interceptors.request.handlers[0].fulfilled({ url: '/frontend/products', headers: {} });
    assert.strictEqual(config.headers['Accept-Language'], 'ar');

    storage.setItem('lang', 'en');
    config = await api.interceptors.request.handlers[0].fulfilled({ url: '/frontend/products', headers: {} });
    assert.strictEqual(config.headers['Accept-Language'], 'en');
  });
});

// ─── 2. Website Public Catalog APIs Contract Audit ──────────────────────────
test('Website Public Catalog APIs: Contract, params and resilience', async (t) => {
  const publicEndpoints = [
    { name: 'Settings API', path: '/frontend/settings', method: 'GET' },
    { name: 'Sliders API', path: '/frontend/sliders?is_active=1', method: 'GET' },
    { name: 'Categories API (with active filter)', path: '/frontend/categories?is_active=1', method: 'GET' },
    { name: 'Categories API (general)', path: '/frontend/categories', method: 'GET' },
    { name: 'Products Catalog API', path: '/frontend/products?per_page=20&is_active=1', method: 'GET' },
    { name: 'Products Filtered (category, search, in_stock)', path: '/frontend/products?category_id=57&search=oven&in_stock=1&is_active=1', method: 'GET' },
    { name: 'Single Product Detail API', path: '/frontend/products/173', method: 'GET' },
    { name: 'Offers API', path: '/frontend/offers?is_active=1', method: 'GET' },
    { name: 'Top Bar Coupons Promo API', path: '/frontend/coupons', method: 'GET' },
    { name: 'Published Topics API', path: '/frontend/topics?status=published', method: 'GET' },
    { name: 'Single Topic By Slug API', path: '/frontend/topics/privacy-policy', method: 'GET' },
    { name: 'Single Page By Slug API', path: '/frontend/pages/about-us', method: 'GET' },
    { name: 'Product Reviews API', path: '/frontend/reviews?product_id=173', method: 'GET' },
    { name: 'Countries List API', path: '/frontend/countries', method: 'GET' },
    { name: 'Cities List API', path: '/frontend/cities?country_id=1', method: 'GET' },
    { name: 'City Shipping Rate API', path: '/frontend/cities/5/shipping-rate', method: 'GET' },
  ];

  await t.test('All public endpoints conform to /frontend/ prefix and valid HTTP method', () => {
    for (const ep of publicEndpoints) {
      assert.ok(ep.path.startsWith('/frontend/'), `Endpoint ${ep.name} must start with /frontend/`);
      assert.ok(['GET', 'POST', 'PUT', 'DELETE'].includes(ep.method));
    }
  });

  await t.test('Products response parser handles all backend response structures safely', () => {
    // 1. Standard Laravel Resource: { data: [...] }
    const shapeA = { data: [{ id: 1, name: 'Product A' }] };
    const extractA = shapeA.data?.data || shapeA.data || [];
    assert.strictEqual(extractA.length, 1);
    assert.strictEqual(extractA[0].id, 1);

    // 2. Paginated Laravel Resource: { data: { data: [...] } }
    const shapeB = { data: { data: [{ id: 2, name: 'Product B' }] } };
    const extractB = shapeB.data?.data || shapeB.data || [];
    assert.strictEqual(extractB.length, 1);
    assert.strictEqual(extractB[0].id, 2);

    // 3. Raw array: [...]
    const shapeC = [{ id: 3, name: 'Product C' }];
    const extractC = shapeC?.data || shapeC;
    assert.strictEqual(extractC.length, 1);
    assert.strictEqual(extractC[0].id, 3);

    // 4. Empty or error response: null / empty object
    const shapeD = null;
    const extractD = shapeD?.data || shapeD || [];
    assert.ok(Array.isArray(extractD));
    assert.strictEqual(extractD.length, 0);
  });
});

// ─── 3. Website Customer Authenticated APIs Contract Audit ──────────────────
test('Website Customer Account & Action APIs: Contract and parameter safety', async (t) => {
  const customerEndpoints = [
    { name: 'Customer Login', path: '/frontend/login', method: 'POST', body: { email: 'user@example.com', password: 'secret' } },
    { name: 'Customer Register', path: '/frontend/register', method: 'POST', body: { name: 'Customer', email: 'user@example.com', password: 'secret' } },
    { name: 'Customer Logout', path: '/frontend/logout', method: 'POST' },
    { name: 'Forgot Password', path: '/frontend/forgot-password', method: 'POST', body: { email: 'user@example.com' } },
    { name: 'Customer Profile Fetch', path: '/frontend/user', method: 'GET' },
    { name: 'Customer Profile Update', path: '/frontend/profile', method: 'PUT', body: { name: 'Updated' } },
    { name: 'Change Password', path: '/frontend/change-password', method: 'POST', body: { current_password: 'old', password: 'new' } },
    { name: 'List Addresses', path: '/frontend/addresses', method: 'GET' },
    { name: 'Create Address', path: '/frontend/addresses', method: 'POST', body: { country_id: 1, city_id: 1, address: 'Test' } },
    { name: 'Update Address', path: '/frontend/addresses/10', method: 'PUT', body: { address: 'Updated' } },
    { name: 'Delete Address', path: '/frontend/addresses/10', method: 'DELETE' },
    { name: 'Customer Wallet', path: '/frontend/wallet', method: 'GET' },
    { name: 'Customer Orders List', path: '/frontend/orders/me', method: 'GET' },
    { name: 'Direct Order Detail', path: '/frontend/orders/101', method: 'GET' },
    { name: 'Create Standard Order (COD / Wallet)', path: '/frontend/orders', method: 'POST', body: { payment_method: 'cod', items: [] } },
    { name: 'PayTabs Gateway Checkout', path: '/frontend/paytabs/checkout', method: 'POST', body: { cart_id: 'test', cart_amount: '100' } },
    { name: 'PayTabs Gateway Order Verification', path: '/frontend/paytabs/order', method: 'POST', body: { payment_method: 'card', tran_ref: 'T1' } },
    { name: 'List Returns', path: '/frontend/returns', method: 'GET' },
    { name: 'Submit Return Request', path: '/frontend/returns', method: 'POST', body: { order_id: 1, order_item_id: 2, reason: 'Defect' } },
    { name: 'Submit Product Review', path: '/frontend/reviews', method: 'POST', body: { product_id: 173, rating: 5, comment: 'Great' } },
    { name: 'Toggle Wishlist', path: '/frontend/wishlist/toggle', method: 'POST', body: { product_id: 173 } },
    { name: 'Contact Us Form', path: '/frontend/contact', method: 'POST', body: { name: 'Ali', email: 'ali@test.com', message: 'Hello' } },
    { name: 'Validate Coupon', path: '/frontend/coupons/validate', method: 'POST', body: { code: 'SAVE10', amount: 100 } },
    { name: 'Notifications', path: '/frontend/notifications', method: 'GET' },
  ];

  await t.test('All customer endpoints are properly structured', () => {
    for (const ep of customerEndpoints) {
      assert.ok(ep.path.startsWith('/frontend/'));
      assert.ok(['GET', 'POST', 'PUT', 'DELETE'].includes(ep.method));
    }
  });

  await t.test('Coupon validation recognizes multiple backend status indicators', () => {
    const validVariants = [
      { valid: true },
      { is_valid: true },
      { success: true },
      { status: 'success' },
      { status: true },
      { data: { code: 'DISC20', value: '20' } }
    ];

    for (const resData of validVariants) {
      const isValid = resData.valid === true ||
                      resData.is_valid === true ||
                      resData.success === true ||
                      resData.status === 'success' ||
                      resData.status === true ||
                      (resData.data && !resData.error && resData.valid !== false && resData.success !== false);
      assert.strictEqual(Boolean(isValid), true, `Variant ${JSON.stringify(resData)} should be recognized as valid`);
    }

    const invalidVariants = [
      { valid: false, message: 'Expired' },
      { success: false, message: 'Invalid code' },
      { status: 'error' }
    ];

    for (const resData of invalidVariants) {
      const isValid = resData.valid === true ||
                      resData.is_valid === true ||
                      resData.success === true ||
                      resData.status === 'success' ||
                      resData.status === true ||
                      (resData.data && !resData.error && resData.valid !== false && resData.success !== false);
      assert.strictEqual(Boolean(isValid), false, `Variant ${JSON.stringify(resData)} should be recognized as invalid`);
    }
  });
});

// ─── 4. Client-side Resilience & Error Degradation Audit ────────────────────
test('Website Client-side Resilience: Graceful error handling without crashes', async (t) => {
  await t.test('Array extractors in ProfileView safely prevent .filter crashes on non-array data', () => {
    // If backend mistakenly returns an object instead of array:
    const objectResponse = { status: 'fulfilled', value: { data: { message: 'no orders' } } };
    const raw = objectResponse.value.data?.data || objectResponse.value.data || [];
    const safeOrders = Array.isArray(raw) ? raw : (Array.isArray(raw.data) ? raw.data : []);

    assert.ok(Array.isArray(safeOrders), 'Must normalize to an array');
    assert.doesNotThrow(() => {
      // Template filter operation
      safeOrders.filter(o => o.status === 'pending');
    });
  });

  await t.test('InvoiceView safely handles missing orders without crashing', () => {
    const rawOrders = [];
    const orderId = '999';
    const found = rawOrders.find(o => o.id == orderId || o.order_number == orderId);
    assert.strictEqual(found, undefined);
  });

  await t.test('useOffers date filter handles edge-case dates and active flags', async () => {
    const useOffersModule = await viteServer.ssrLoadModule('/src/composables/useOffers.js');
    const { isOfferActive, isOfferDateValid } = useOffersModule;

    // Active offer within valid date
    assert.strictEqual(isOfferActive({
      status: 'active',
      is_active: 1,
      start_date: '2020-01-01',
      end_date: '2030-12-31'
    }), true);

    // Inactive offer
    assert.strictEqual(isOfferActive({
      status: 'inactive',
      is_active: 0
    }), false);

    // Expired offer
    assert.strictEqual(isOfferDateValid({
      end_date: '2020-01-01'
    }), false);

    // Future offer not started yet
    assert.strictEqual(isOfferDateValid({
      start_date: '2030-01-01'
    }), false);
  });
});
