import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

class MemoryStorage {
  constructor() { this.data = new Map(); }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
  clear() { this.data.clear(); }
}

const localStore = new MemoryStorage();
const sessionStore = new MemoryStorage();
globalThis.localStorage = localStore;
globalThis.sessionStorage = sessionStore;
globalThis.window = {
  location: {
    hostname: 'localhost',
    pathname: '/',
    search: '',
    href: 'http://localhost/',
    replace(url) { this.pathname = url; },
  },
};

let websiteServer;
let adminServer;
let sanitizeMod;
let sessionMod;
let siteOrderMod;
let siteOrdersApiMod;
let websiteReturnsMod;
let websiteAxios;
let adminAxios;

before(async () => {
  websiteServer = await createServer({
    root: new URL('../website', import.meta.url).pathname,
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  });
  adminServer = await createServer({
    root: new URL('../admin', import.meta.url).pathname,
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  });

  sanitizeMod = await websiteServer.ssrLoadModule('/src/utils/sanitize.js');
  sessionMod = await websiteServer.ssrLoadModule('/src/utils/customerSession.js');
  siteOrderMod = await websiteServer.ssrLoadModule('/src/domain/orders/siteOrder.js');
  siteOrdersApiMod = await websiteServer.ssrLoadModule('/src/modules/invoice/services/siteOrdersApi.js');
  websiteReturnsMod = await websiteServer.ssrLoadModule('/src/services/returnsService.js');
  websiteAxios = (await websiteServer.ssrLoadModule('/src/config/axios.js')).default;
  adminAxios = (await adminServer.ssrLoadModule('/src/config/axios.js')).default;
});

after(async () => {
  await websiteServer?.close();
  await adminServer?.close();
});

beforeEach(() => {
  localStore.clear();
  sessionStore.clear();
  globalThis.window.location.hostname = 'localhost';
  globalThis.window.location.pathname = '/';
  globalThis.window.location.search = '';
});

test('Security [XSS & URL Sanitization]: sanitizeHtml and sanitizeUrl strip dangerous tags, attributes, and schemes', async () => {
  const { sanitizeHtml, sanitizeUrl } = sanitizeMod;
  const { resolveLink } = await websiteServer.ssrLoadModule('/src/utils/externalLink.js');

  const dirtyHtml = '<p onclick="alert(1)" data-evil="1" aria-label="spoof">Safe</p><script>alert(1)</script><svg onload="alert(2)"></svg><a href="javascript:alert(3)" target="_blank">Click</a>';
  const cleaned = sanitizeHtml(dirtyHtml);
  assert.ok(!cleaned.includes('<script'), 'Must strip <script> tags');
  assert.ok(!cleaned.includes('<svg'), 'Must strip <svg> tags');
  assert.ok(!cleaned.includes('onclick'), 'Must strip event handlers');
  assert.ok(!cleaned.includes('javascript:'), 'Must strip javascript: href');
  assert.ok(!cleaned.includes('target='), 'Must strip target attribute to prevent tabnabbing');
  assert.ok(!cleaned.includes('data-evil'), 'Must strip data-* attributes');
  assert.ok(!cleaned.includes('aria-label'), 'Must strip aria-* attributes');
  assert.ok(cleaned.includes('Safe'), 'Must preserve safe text content');

  assert.equal(sanitizeUrl('javascript:alert(1)', '/brand/logo.png'), '/brand/logo.png');
  assert.equal(sanitizeUrl('java\tscript:alert(1)', '/brand/logo.png'), '/brand/logo.png');
  assert.equal(sanitizeUrl('java\nscript:alert(1)', '/brand/logo.png'), '/brand/logo.png');
  assert.equal(sanitizeUrl('data:text/html,<script>alert(1)</script>', '/brand/logo.png'), '/brand/logo.png');
  assert.equal(sanitizeUrl('//evil.example.com/logo.png', '/brand/logo.png'), '/brand/logo.png');
  assert.equal(sanitizeUrl('/\\evil.example.com/logo.png', '/brand/logo.png'), '/brand/logo.png');
  assert.equal(sanitizeUrl('https://cdn.mastergas.com/logo.png', '/brand/logo.png'), 'https://cdn.mastergas.com/logo.png');
  assert.equal(sanitizeUrl('/storage/logo.png', '/brand/logo.png'), '/storage/logo.png');

  assert.deepEqual(resolveLink('java\tscript:alert(1)', '/products'), { external: false, href: '/products' });
  assert.deepEqual(resolveLink('/\\evil.com', '/products'), { external: false, href: '/evil.com' });
});

test('Security [Customer Session]: rejects corrupted token strings and blocks ?mockAuth=true on non-local hosts', () => {
  const { getCustomerToken, setCustomerToken } = sessionMod;

  setCustomerToken('undefined');
  assert.equal(getCustomerToken(), null);

  setCustomerToken('null');
  assert.equal(getCustomerToken(), null);

  setCustomerToken('   ');
  assert.equal(getCustomerToken(), null);

  globalThis.window.location.search = '?mockAuth=true';
  globalThis.window.location.hostname = 'mastergas.com';
  assert.equal(getCustomerToken(), null, 'mockAuth=true must not work on production hostnames');

  globalThis.window.location.hostname = 'localhost';
  assert.equal(getCustomerToken(), 'preview_token', 'mockAuth=true remains available on localhost for dev/QA');
});

test('Security [Order & Return Payload Integrity]: consolidates duplicate items to prevent quantity/stock check bypass', async () => {
  const { toSiteOrderPayload } = siteOrderMod;
  const payload = toSiteOrderPayload({
    shipping_address: 'Amman',
    payment_method: 'cod',
    items: [
      { product_id: 14, quantity: 2 },
      { product_id: 14, quantity: 3 },
    ],
  });
  assert.equal(payload.items.length, 1);
  assert.deepEqual(payload.items[0], { product_id: 14, quantity: 5 });

  let capturedBody = null;
  websiteAxios.defaults.adapter = async (config) => {
    capturedBody = JSON.parse(config.data);
    return { data: { status: true, data: {} }, status: 201, statusText: 'Created', headers: {}, config };
  };

  await websiteReturnsMod.returnsService.create({
    order_id: 55,
    reason: 'Damaged item',
    items: [
      { order_item_id: 99, quantity: 1, condition: 'damaged' },
      { order_item_id: 99, quantity: 2, condition: 'damaged' },
    ],
  });
  assert.equal(capturedBody.items.length, 1);
  assert.equal(capturedBody.items[0].order_item_id, 99);
  assert.equal(capturedBody.items[0].quantity, 3);
});

test('Security [BOLA/IDOR Defense-in-Depth]: blocks orders and returns belonging to a different customer', async () => {
  localStore.setItem('c_token', 'customer-token');
  localStore.setItem('c_user', JSON.stringify({ id: 101, email: 'owner@mastergas.com' }));

  // Foreign order returned by backend for ID 999
  websiteAxios.defaults.adapter = async (config) => ({
    data: {
      data: {
        id: 999,
        user_id: 202,
        order_number: 'ORD-FOREIGN',
        total_amount: 500,
        items: [],
      },
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  });

  const foreignOrder = await siteOrdersApiMod.getSiteOrder(999);
  assert.equal(foreignOrder, null, 'Foreign order must be rejected by client-side ownership guard');

  // Foreign return returned by backend for ID 888
  websiteAxios.defaults.adapter = async (config) => ({
    data: {
      data: {
        id: 888,
        user_id: 202,
        order_id: 999,
        status: 'pending',
      },
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  });

  await assert.rejects(
    () => websiteReturnsMod.returnsService.getById(888),
    (err) => err.status === 403
  );

  // Owned order succeeds
  websiteAxios.defaults.adapter = async (config) => ({
    data: {
      data: {
        id: 105,
        user_id: 101,
        order_number: 'ORD-MINE',
        total_amount: 250,
        items: [],
      },
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  });

  const ownedOrder = await siteOrdersApiMod.getSiteOrder(105);
  assert.equal(ownedOrder?.id, 105);
});

test('Security [Token Isolation & 401 Cleanup]: isolates customer/admin tokens and clears expired sessions', async () => {
  localStore.setItem('token', 'admin-secret');
  localStore.setItem('c_token', 'customer-secret');
  localStore.setItem('c_user', JSON.stringify({ id: 101 }));

  // Website Axios must not attach c_token to /dashboard or /v1/admin paths
  const adminReqOnWebsite = await websiteAxios.interceptors.request.handlers[0].fulfilled({
    url: '/dashboard/statistics',
    headers: {},
  });
  assert.equal(adminReqOnWebsite.headers.Authorization, undefined);

  // Admin Axios must not attach admin token to /v1/site or /frontend paths
  const siteReqOnAdmin = await adminAxios.interceptors.request.handlers[0].fulfilled({
    url: '/v1/site/orders',
    headers: {},
  });
  assert.equal(siteReqOnAdmin.headers.Authorization, undefined);

  // Website Axios clears c_token and c_user on 500 {"message":"Unauthenticated."} from /v1/site/orders
  const websiteErrHandler = websiteAxios.interceptors.response.handlers[0].rejected;
  const unauthError = {
    response: { status: 500, data: { message: 'Unauthenticated.' } },
    config: { url: '/v1/site/orders' },
  };
  await assert.rejects(() => websiteErrHandler(unauthError));
  assert.equal(localStore.getItem('c_token'), null);
  assert.equal(localStore.getItem('c_user'), null);
  assert.equal(localStore.getItem('token'), 'admin-secret', 'Admin token must remain untouched');
});

test('Security [Admin Dashboard Hardening]: blocks SVG/script uploads, neutralizes CSV/Excel formula injection, encodes API path segments, and enforces login rate limits & cache cleanup', async () => {
  const adminSec = await adminServer.ssrLoadModule('/src/utils/adminSecurity.js');
  const feedExporter = await adminServer.ssrLoadModule('/src/utils/dataFeedExporter.js');
  const tijaraAdminApi = (await adminServer.ssrLoadModule('/src/infrastructure/api/tijaraAdminApi.js')).default;

  // 1. Image Upload Validation: block SVG (Stored XSS), executables, double extensions, and oversized files
  assert.equal(adminSec.validateAdminImageFile({ name: 'xss.svg', type: 'image/svg+xml', size: 1024 }).valid, false);
  assert.equal(adminSec.validateAdminImageFile({ name: 'shell.php.png', type: 'image/png', size: 1024 }).valid, false);
  assert.equal(adminSec.validateAdminImageFile({ name: 'fake.png', type: 'text/html', size: 1024 }).valid, false);
  assert.equal(adminSec.validateAdminImageFile({ name: 'huge.png', type: 'image/png', size: 10 * 1024 * 1024 }, { maxSizeMB: 2 }).valid, false);
  assert.equal(adminSec.validateAdminImageFile({ name: 'product.webp', type: 'image/webp', size: 250 * 1024 }, { maxSizeMB: 2 }).valid, true);

  // 2. CSV / Excel Formula Injection Defense
  assert.equal(adminSec.sanitizeSpreadsheetCell("=cmd|'/C calc'!A0"), "'=cmd|'/C calc'!A0");
  assert.equal(adminSec.sanitizeSpreadsheetCell('+HYPERLINK("http://evil.com")'), '\'+HYPERLINK("http://evil.com")');
  assert.equal(adminSec.sanitizeSpreadsheetCell('@SUM(1+1)'), "'@SUM(1+1)");
  assert.equal(adminSec.sanitizeSpreadsheetCell('-25.50'), '-25.50', 'Plain negative numbers must remain untouched');

  const csv = feedExporter.generateMetaCSV([
    { id: 1, name_ar: '=1+1', description_ar: '@malicious', price: 100 },
  ]);
  assert.ok(csv.includes('"\'=1+1"'), 'CSV export must prefix formula triggers with a single quote');
  assert.ok(csv.includes('"\'@malicious"'), 'CSV export must neutralize @ formula triggers');

  // 3. API Path Segment Encoding & Traversal Prevention
  assert.throws(() => adminSec.encodePathSegment('../admin'), /Invalid/);
  assert.throws(() => adminSec.encodePathSegment('12/delete'), /Invalid/);
  assert.throws(() => adminSec.encodePathSegment('12?admin=1'), /Invalid/);
  assert.equal(adminSec.encodePathSegment(42), '42');
  await assert.rejects(async () => tijaraAdminApi.deleteProduct('../users/1'), /Invalid product id/);

  // 4. Session Validation & Cache Purge on Logout/401
  localStore.setItem('token', 'valid-admin-token');
  localStore.setItem('admin', '{corrupt-json');
  assert.equal(adminSec.hasValidAdminSession(localStore), false, 'Corrupt admin JSON must invalidate session');
  assert.equal(localStore.getItem('token'), null);

  localStore.setItem('token', 'valid-admin-token');
  localStore.setItem('admin', JSON.stringify({ role: 'customer', is_admin: 'false' }));
  assert.equal(adminSec.hasValidAdminSession(localStore), false, 'String "false" on is_admin must not bypass role guard');

  localStore.setItem('token', 'valid-admin-token');
  localStore.setItem('admin_dashboard_cache_v1', JSON.stringify({ data: { secret: 1 } }));
  globalThis.__mastergasDashboardCache = { data: { secret: 1 }, version: 1, owner: 'x', inFlight: null };
  adminSec.clearAdminSessionArtifacts(localStore);
  assert.equal(localStore.getItem('admin_dashboard_cache_v1'), null);
  assert.equal(globalThis.__mastergasDashboardCache.data, null);

  // 5. Login Brute-Force Rate Limiting
  adminSec.resetLoginRateLimit();
  const baseNow = 1_700_000_000_000;
  for (let i = 0; i < 4; i += 1) {
    assert.equal(adminSec.recordLoginFailure(baseNow).blocked, false);
  }
  const fifth = adminSec.recordLoginFailure(baseNow);
  assert.equal(fifth.blocked, true);
  assert.equal(adminSec.checkLoginRateLimit(baseNow + 10_000).blocked, true);
  assert.equal(adminSec.checkLoginRateLimit(baseNow + 61_000).blocked, false);
});
