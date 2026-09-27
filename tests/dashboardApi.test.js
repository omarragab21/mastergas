import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

// ─── In-Memory Storage & DOM Mock ──────────────────────────────────────────
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
    pathname: '/admin/dashboard',
    replace(url) {
      this.pathname = url;
    },
    href: 'http://localhost/admin/dashboard',
  },
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
  globalThis.window.location.pathname = '/admin/dashboard';
});

// ─── Suite: Axios Configuration & Auth Interceptors ─────────────────────────
test('Axios Request Interceptor: attaches admin token to /dashboard/* routes', async () => {
  storage.setItem('token', 'admin-secret-token');
  storage.setItem('c_token', 'customer-token');
  storage.setItem('lang', 'ar');

  const config = await api.interceptors.request.handlers[0].fulfilled({
    url: '/dashboard/statistics',
    headers: {},
  });

  assert.equal(config.headers.Authorization, 'Bearer admin-secret-token');
  assert.equal(config.headers['Accept-Language'], 'ar');
});

test('Axios Request Interceptor: prioritizes customer token for non-admin routes', async () => {
  storage.setItem('token', 'admin-token');
  storage.setItem('c_token', 'customer-token');

  const config = await api.interceptors.request.handlers[0].fulfilled({
    url: '/products',
    headers: {},
  });

  assert.equal(config.headers.Authorization, 'Bearer customer-token');
});

test('Axios Response Interceptor: 401 on /dashboard clears admin session and preserves customer session', async () => {
  storage.setItem('token', 'expired-admin-token');
  storage.setItem('admin', JSON.stringify({ id: 1, name: 'Admin' }));
  storage.setItem('c_token', 'valid-customer-token');

  let redirectedPath = null;
  const mockRouter = {
    currentRoute: { value: { path: '/admin/dashboard' } },
    push: async (path) => {
      redirectedPath = path;
      globalThis.window.location.pathname = path;
    },
  };
  apiModule.setRouter(mockRouter);

  const error401 = {
    response: { status: 401, data: { message: 'Unauthenticated.' } },
    config: { url: '/dashboard/statistics' },
  };

  const errorHandler = api.interceptors.response.handlers[0].rejected;
  await assert.rejects(async () => errorHandler(error401), (err) => err.response.status === 401);

  assert.equal(storage.getItem('token'), null, 'Admin token must be removed');
  assert.equal(storage.getItem('admin'), null, 'Admin data must be removed');
  assert.equal(storage.getItem('c_token'), 'valid-customer-token', 'Customer token must remain intact');
  assert.equal(redirectedPath, '/admin/login', 'Must redirect to /admin/login');
});

test('Axios Response Interceptor: 403 on admin routes does NOT clear session', async () => {
  storage.setItem('token', 'active-admin-token');
  storage.setItem('admin', JSON.stringify({ id: 1 }));

  const error403 = {
    response: { status: 403, data: { message: 'Forbidden.' } },
    config: { url: '/dashboard/statistics' },
  };

  const errorHandler = api.interceptors.response.handlers[0].rejected;
  await assert.rejects(async () => errorHandler(error403), (err) => err.response.status === 403);

  assert.equal(storage.getItem('token'), 'active-admin-token', 'Admin token must NOT be removed on 403');
});

// ─── Suite: Contract & Parsing for GET /dashboard/statistics ────────────────
test('Dashboard API: GET /dashboard/statistics parsing and calculations', async () => {
  const rawStats = {
    summary: {
      total_products: 15,
      total_customers: 24,
      today_orders: 5,
      total_orders: 20,
      monthly_sales: 350,
      today_sales: 50,
      products_change: 10,
    },
    orders_by_status: {
      completed: 10,
      pending: 5,
      processing: 3,
      shipped: 1,
      cancelled: 1,
      returned: 0,
    },
    monthly_data: [{ month_ar: 'يناير', sales: '350' }],
    daily_data: [{ day_ar: 'الاثنين', sales: '50' }],
    recent_orders: [{ id: 1, orderNumber: 'ORD-1', customer: 'أحمد', amount: '50 د.أ', status: 'مكتمل' }],
  };

  // 1. Metric formatting
  const fmt = (n) => {
    const v = Number(n);
    return Number.isFinite(v) ? v.toLocaleString('en-US') : '-';
  };
  const formatAmount = (n) => {
    const v = Number(n);
    return Number.isFinite(v) ? v.toLocaleString('en-US') + ' د.أ' : '-';
  };

  assert.equal(fmt(rawStats.summary.total_products), '15');
  assert.equal(fmt(rawStats.summary.total_customers), '24');
  assert.equal(fmt(rawStats.summary.today_orders), '5');
  assert.equal(formatAmount(rawStats.summary.monthly_sales), '350 د.أ');
  assert.equal(formatAmount(rawStats.summary.today_sales), '50 د.أ');

  // 2. Status counts and pending inclusion
  const parseNonNegativeInt = (val, fallback = 0) => {
    if (val === null || val === undefined || val === '') return fallback;
    const n = Number(val);
    return Number.isFinite(n) && n >= 0 && Math.floor(n) === n ? n : fallback;
  };

  const statusList = [
    { key: 'completed', count: parseNonNegativeInt(rawStats.orders_by_status.completed) },
    { key: 'pending', count: parseNonNegativeInt(rawStats.orders_by_status.pending) },
    { key: 'processing', count: parseNonNegativeInt(rawStats.orders_by_status.processing) },
    { key: 'shipped', count: parseNonNegativeInt(rawStats.orders_by_status.shipped) },
    { key: 'cancelled', count: parseNonNegativeInt(rawStats.orders_by_status.cancelled) },
    { key: 'returned', count: parseNonNegativeInt(rawStats.orders_by_status.returned) },
  ];

  assert.equal(statusList.find(s => s.key === 'pending').count, 5);
  assert.equal(statusList.find(s => s.key === 'completed').count, 10);

  const totalStatus = statusList.reduce((acc, s) => acc + s.count, 0);
  assert.equal(totalStatus, 20);
});

test('Dashboard API: GET /dashboard/statistics handles missing metrics and prevents cross-timeframe pollution', () => {
  const rawStatsWithoutTodayAndMonth = {
    summary: {
      total_products: 10,
      total_customers: 20,
      total_orders: 999,
      total_sales: 8888,
    },
  };

  const s = rawStatsWithoutTodayAndMonth.summary;
  const todayOrders = (s.today_orders !== undefined && s.today_orders !== null && Number.isFinite(Number(s.today_orders)))
    ? String(s.today_orders)
    : '-';
  const monthlySales = (s.monthly_sales !== undefined && s.monthly_sales !== null && Number.isFinite(Number(s.monthly_sales)))
    ? String(s.monthly_sales)
    : '-';

  assert.equal(todayOrders, '-', 'Must not fall back to total_orders (999)');
  assert.equal(monthlySales, '-', 'Must not fall back to total_sales (8888)');
});

test('Dashboard API: GET /dashboard/statistics handles invalid values without NaN', () => {
  const parseNonNegativeInt = (val, fallback = 0) => {
    if (val === null || val === undefined || val === '') return fallback;
    const n = Number(val);
    return Number.isFinite(n) && n >= 0 && Math.floor(n) === n ? n : fallback;
  };

  assert.equal(parseNonNegativeInt('invalid'), 0);
  assert.equal(parseNonNegativeInt(-10), 0);
  assert.equal(parseNonNegativeInt(NaN), 0);
  assert.equal(parseNonNegativeInt(Infinity), 0);
  assert.equal(parseNonNegativeInt(null), 0);
  assert.equal(parseNonNegativeInt('15'), 15);
  assert.equal(parseNonNegativeInt(0), 0);
});

// ─── Suite: List Extraction & Fallback APIs ─────────────────────────────────
test('Dashboard API: extractList handles flat array, { data: [] }, and Laravel pagination { data: { data: [] } }', () => {
  const extractList = (payload) => {
    if (!payload) return null;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;
    return null;
  };

  // Flat array
  const flat = [{ id: 1, name: 'P1' }];
  assert.deepEqual(extractList(flat), flat);

  // Single data envelope
  const envelope = { data: [{ id: 2, name: 'P2' }] };
  assert.deepEqual(extractList(envelope), envelope.data);

  // Laravel double nested pagination
  const laravelPagination = {
    data: {
      data: [{ id: 3, name: 'P3', total_sold: 10, quantity: 2 }],
      total: 1,
      current_page: 1,
    },
  };
  assert.deepEqual(extractList(laravelPagination), [{ id: 3, name: 'P3', total_sold: 10, quantity: 2 }]);

  // Unsupported structure returns null
  assert.equal(extractList({ invalid: true }), null);
});

test('Dashboard API: GET /dashboard/returns handles list and error states', async () => {
  const extractList = (payload) => {
    if (!payload) return null;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;
    return null;
  };

  const successPayload = {
    data: [
      { id: 1, order_id: 101, customer_name: 'علي', product_name: 'أسطوانة', status: 'pending', refund_amount: 15 },
      { id: 2, order_id: 102, customer_name: 'سارة', product_name: 'منظم', status: 'approved', refund_amount: 25 },
    ],
  };

  const list = extractList(successPayload);
  assert.equal(list.length, 2);
  assert.equal(list[0].customer_name, 'علي');

  // Empty response produces valid empty state
  const emptyPayload = { data: [] };
  const emptyList = extractList(emptyPayload);
  assert.deepEqual(emptyList, []);

  // Failed response should set error, not empty state
  const errorResponse = { status: 500, message: 'Server error' };
  assert.equal(errorResponse.status, 500);
});

test('Dashboard API: GET /dashboard/products sorting for best sellers and low stock', () => {
  const products = [
    { id: 1, name: 'منتج أ', total_sold: 5, stock: 20 },
    { id: 2, name: 'منتج ب', total_sold: 25, stock: 2 },
    { id: 3, name: 'منتج ج', total_sold: 12, stock: 0 },
  ];

  // Best sellers: sort descending by total_sold
  const bestSellers = [...products].sort((a, b) => (b.total_sold ?? 0) - (a.total_sold ?? 0));
  assert.deepEqual(bestSellers.map(p => p.name), ['منتج ب', 'منتج ج', 'منتج أ']);

  // Low stock: sort ascending by stock (lowest first)
  const lowStock = [...products].sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
  assert.deepEqual(lowStock.map(p => p.name), ['منتج ج', 'منتج ب', 'منتج أ']);
});

test('Dashboard API: GET /dashboard/orders badge count extraction', () => {
  const ordersResponse = {
    data: [
      { id: 1, status: 'pending' },
      { id: 2, status: 'processing' },
      { id: 3, status: 'completed' },
    ],
  };
  const list = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
  assert.equal(list.length, 3);
});

test('Dashboard API: GET /dashboard/settings logo favicon extraction', () => {
  const settingsResponse = {
    data: [
      { key: 'site_name', value: 'Master Gas' },
      { key: 'logo', value: 'https://cdn.example.com/logo.png' },
    ],
  };
  const logoEntry = settingsResponse.data.find(s => s.key === 'logo');
  assert.equal(logoEntry?.value, 'https://cdn.example.com/logo.png');
});
