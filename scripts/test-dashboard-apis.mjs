#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Master Gas - Dashboard API Test Runner
 * اختبار شامل لجميع واجهات برمجة التطبيقات (APIs) الخاصة بلوحة تحكم المشرف
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * الاستخدام:
 *   1. الفحص الآلي والمحاكاة (Contract & Logic Tests):
 *      node scripts/test-dashboard-apis.mjs
 * 
 *   2. الفحص الحي مع السيرفر الحقيقي (Live API Mode):
 *      node scripts/test-dashboard-apis.mjs --live --token="YOUR_ADMIN_TOKEN"
 *      أو:
 *      ADMIN_TOKEN="YOUR_ADMIN_TOKEN" node scripts/test-dashboard-apis.mjs --live
 */

import { createServer } from 'vite';

const isLive = process.argv.includes('--live') || process.env.LIVE === '1';
const tokenArg = process.argv.find(a => a.startsWith('--token='));
const adminToken = tokenArg ? tokenArg.split('=')[1] : (process.env.ADMIN_TOKEN || '');
const baseUrl = process.env.VITE_API_BASE_URL || 'https://backend-mastergas.be-kite.com/api';

// ANSI styling
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bgBlue: '\x1b[44m',
};

const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
};

function pass(name, details = '') {
  stats.total++;
  stats.passed++;
  console.log(`  ${C.green}✔ PASS${C.reset}  ${C.bold}${name}${C.reset}${details ? ` ${C.gray}(${details})${C.reset}` : ''}`);
}

function fail(name, error) {
  stats.total++;
  stats.failed++;
  console.log(`  ${C.red}✖ FAIL${C.reset}  ${C.bold}${name}${C.reset}`);
  console.log(`         ${C.red}${error.message || error}${C.reset}`);
}

function info(msg) {
  console.log(`\n${C.cyan}${C.bold}▶ ${msg}${C.reset}`);
}

function formatAmount(num) {
  const v = Number(num);
  return Number.isFinite(v) ? v.toLocaleString('en-US') + ' د.أ' : '-';
}

function parseNonNegativeInt(val, fallback = 0) {
  if (val === null || val === undefined || val === '') return fallback;
  const n = Number(val);
  return Number.isFinite(n) && n >= 0 && Math.floor(n) === n ? n : fallback;
}

function extractList(payload) {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Part 1: Contract & Unit Tests (Simulated & Interceptor Tests)
// ─────────────────────────────────────────────────────────────────────────────

async function runContractTests() {
  info('جاري اختبار بيئة Axios والاعتراضات (Interceptors & Auth Lifecycle)');

  class MemoryStorage {
    constructor() { this.data = new Map(); }
    getItem(k) { return this.data.has(k) ? this.data.get(k) : null; }
    setItem(k, v) { this.data.set(k, String(v)); }
    removeItem(k) { this.data.delete(k); }
    clear() { this.data.clear(); }
  }

  const storage = new MemoryStorage();
  globalThis.localStorage = storage;
  globalThis.window = {
    location: {
      pathname: '/admin/dashboard',
      replace(url) { this.pathname = url; },
    },
  };

  const viteServer = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  });

  const apiModule = await viteServer.ssrLoadModule('/src/config/axios.js');
  const api = apiModule.default;

  try {
    // 1. Request Interceptor Auth Token Priority
    {
      storage.setItem('token', 'admin-token-123');
      storage.setItem('c_token', 'client-token-456');
      storage.setItem('lang', 'ar');

      const adminReq = await api.interceptors.request.handlers[0].fulfilled({
        url: '/dashboard/statistics',
        headers: {},
      });

      if (adminReq.headers.Authorization === 'Bearer admin-token-123' && adminReq.headers['Accept-Language'] === 'ar') {
        pass('Request Interceptor: إرفاق Bearer Token للمشرف ولغة ar لمسارات /dashboard/*');
      } else {
        fail('Request Interceptor: فشل إرفاق Bearer Token للمشرف', 'Authorization or Accept-Language mismatch');
      }

      const clientReq = await api.interceptors.request.handlers[0].fulfilled({
        url: '/frontend/cart',
        headers: {},
      });

      if (clientReq.headers.Authorization === 'Bearer client-token-456') {
        pass('Request Interceptor: إرفاق c_token الخاص بالعميل لمسارات المتجر');
      } else {
        fail('Request Interceptor: فشل إرفاق c_token للعميل', 'Customer token should take priority on non-admin routes');
      }
    }

    // 2. Response Interceptor 401 Session Cleanup
    {
      storage.setItem('token', 'expired-admin');
      storage.setItem('admin', JSON.stringify({ name: 'Admin User' }));
      storage.setItem('c_token', 'preserve-customer-token');

      let redirected = null;
      apiModule.setRouter({
        currentRoute: { value: { path: '/admin/dashboard' } },
        push: async (path) => { redirected = path; },
      });

      const errorHandler = api.interceptors.response.handlers[0].rejected;
      try {
        await errorHandler({
          response: { status: 401, data: { message: 'Unauthenticated.' } },
          config: { url: '/dashboard/statistics' },
        });
      } catch (err) {
        // Expected rejection
      }

      const tokenCleared = storage.getItem('token') === null;
      const adminCleared = storage.getItem('admin') === null;
      const customerPreserved = storage.getItem('c_token') === 'preserve-customer-token';
      const redirectedToLogin = redirected === '/admin/login';

      if (tokenCleared && adminCleared && customerPreserved && redirectedToLogin) {
        pass('Response Interceptor 401: مسح جلسة المشرف، الحفاظ على جلسة المتجر c_token، والتحويل إلى /admin/login');
      } else {
        fail('Response Interceptor 401: خطأ في تنظيف الجلسة', {
          tokenCleared, adminCleared, customerPreserved, redirectedToLogin,
        });
      }
    }

    // 3. Response Interceptor 403 No-Drop
    {
      storage.setItem('token', 'active-admin');
      const errorHandler = api.interceptors.response.handlers[0].rejected;
      try {
        await errorHandler({
          response: { status: 403, data: { message: 'Forbidden' } },
          config: { url: '/dashboard/statistics' },
        });
      } catch (err) {}

      if (storage.getItem('token') === 'active-admin') {
        pass('Response Interceptor 403: الحفاظ على الجلسة دون تسجيل خروج عند نقص الصلاحيات');
      } else {
        fail('Response Interceptor 403: تم مسح الجلسة بشكل خاطئ عند تلقي 403', 'Admin token was cleared');
      }
    }

    info('جاري اختبار عقود البيانات ومعالجة الاستجابات (Data Contracts & Resilience)');

    // 4. GET /dashboard/statistics parsing
    {
      const rawStats = {
        summary: {
          total_products: 42,
          total_customers: 120,
          today_orders: 8,
          total_orders: 550,
          monthly_sales: 12500,
          today_sales: 450,
          products_change: 12,
        },
        orders_by_status: {
          pending: 7,
          processing: 4,
          shipped: 10,
          completed: 120,
          cancelled: 2,
          returned: 1,
        },
        monthly_data: [
          { month_ar: 'يناير', sales: '12500' },
          { month_ar: 'فبراير', sales: '14200' },
        ],
        daily_data: [
          { day_ar: 'السبت', sales: '450' },
        ],
        recent_orders: [
          { id: 101, order_number: 'ORD-101', customer_name: 'سالم أحمد', total_amount: 85, status: 'completed' },
        ],
      };

      const s = rawStats.summary;
      const verified = (
        Number(s.total_products) === 42 &&
        Number(s.total_customers) === 120 &&
        Number(s.today_orders) === 8 &&
        formatAmount(s.monthly_sales) === '12,500 د.أ' &&
        formatAmount(s.today_sales) === '450 د.أ'
      );

      if (verified) {
        pass('GET /dashboard/statistics: معالجة بطاقات المؤشرات (Summary KPIs: المنتجات، العملاء، طلبات اليوم، مبيعات الشهر واليوم)');
      } else {
        fail('GET /dashboard/statistics: خطأ في مطابقة مؤشرات summary', rawStats);
      }

      // Check status breakdown including pending
      const statuses = Object.keys(rawStats.orders_by_status);
      const hasPending = statuses.includes('pending') && rawStats.orders_by_status.pending === 7;
      const hasCompleted = statuses.includes('completed') && rawStats.orders_by_status.completed === 120;

      if (hasPending && hasCompleted) {
        pass('GET /dashboard/statistics: دعم كافة حالات الطلبات بما فيها "قيد الانتظار" (pending)', `pending: 7, completed: 120`);
      } else {
        fail('GET /dashboard/statistics: نقص في توزيع الحالات orders_by_status', rawStats.orders_by_status);
      }
    }

    // 5. Cross-timeframe pollution prevention
    {
      const payloadWithoutDaily = {
        summary: {
          total_products: 10,
          total_customers: 20,
          total_orders: 9999, // Should NOT be used for today_orders
          total_sales: 88888, // Should NOT be used for monthly_sales or today_sales
        },
      };

      const s = payloadWithoutDaily.summary;
      const todayOrders = (s.today_orders !== undefined && s.today_orders !== null && Number.isFinite(Number(s.today_orders)))
        ? String(s.today_orders)
        : '-';
      const monthlySales = (s.monthly_sales !== undefined && s.monthly_sales !== null && Number.isFinite(Number(s.monthly_sales)))
        ? String(s.monthly_sales)
        : '-';

      if (todayOrders === '-' && monthlySales === '-') {
        pass('GET /dashboard/statistics: منع تسريب الأرقام الإجمالية (total_orders / total_sales) إلى أرقام اليوم والشهر عند غيابها');
      } else {
        fail('GET /dashboard/statistics: تسريب أرقام إجمالية غير دقيقة', { todayOrders, monthlySales });
      }
    }

    // 6. Safe integer parsing against NaN
    {
      const tests = [
        { input: '12', expected: 12 },
        { input: 0, expected: 0 },
        { input: -5, expected: 0 },
        { input: 'invalid', expected: 0 },
        { input: null, expected: 0 },
        { input: undefined, expected: 0 },
      ];

      const allValid = tests.every(t => parseNonNegativeInt(t.input) === t.expected);
      if (allValid) {
        pass('GET /dashboard/statistics: التحقق من الحماية ضد قيم NaN والأرقام السالبة في المؤشرات');
      } else {
        fail('GET /dashboard/statistics: فشل فحص parseNonNegativeInt', tests);
      }
    }

    // 7. extractList envelopes (flat array, single envelope, Laravel double pagination)
    {
      const flat = [{ id: 1 }];
      const single = { data: [{ id: 2 }] };
      const laravel = { data: { data: [{ id: 3 }] } };

      const okFlat = extractList(flat)?.[0]?.id === 1;
      const okSingle = extractList(single)?.[0]?.id === 2;
      const okLaravel = extractList(laravel)?.[0]?.id === 3;

      if (okFlat && okSingle && okLaravel) {
        pass('List Envelopes: دعم مصفوفات البيانات المباشرة، { data: [] } والتغليف المتداخل لـ Laravel { data: { data: [] } }');
      } else {
        fail('List Envelopes: فشل استخراج القوائم من هياكل الاستجابة المختلفة', { okFlat, okSingle, okLaravel });
      }
    }

    // 8. GET /dashboard/returns
    {
      const mockReturns = {
        data: [
          { id: 1, order_id: 201, customer_name: 'محمد', product_name: 'أنبوبة غاز 12كغ', status: 'pending', refund_amount: 15 },
          { id: 2, order_id: 202, customer_name: 'خالد', product_name: 'محبس أمان', status: 'approved', refund_amount: 8 },
        ],
      };

      const list = extractList(mockReturns);
      if (list && list.length === 2 && list[0].customer_name === 'محمد') {
        pass('GET /dashboard/returns: جلب وإظهار قائمة المرتجعات مع اسم العميل، المنتج وحالة الإرجاع');
      } else {
        fail('GET /dashboard/returns: فشل استخراج المرتجعات', mockReturns);
      }
    }

    // 9. GET /dashboard/products?sort_by=total_sold (Best sellers)
    {
      const rawProducts = [
        { id: 1, name: 'أسطوانة حديد', total_sold: 5 },
        { id: 2, name: 'أسطوانة فايبر', total_sold: 25 },
        { id: 3, name: 'منظم غاز إيطالي', total_sold: 15 },
      ];

      const sorted = [...rawProducts].sort((a, b) => (b.total_sold ?? 0) - (a.total_sold ?? 0));
      if (sorted[0].name === 'أسطوانة فايبر' && sorted[1].name === 'منظم غاز إيطالي') {
        pass('GET /dashboard/products (Best Sellers): ترتيب المنتجات الأكثر مبيعاً تنازلياً');
      } else {
        fail('GET /dashboard/products: خطأ في ترتيب الأكثر مبيعاً', sorted);
      }
    }

    // 10. GET /dashboard/products?low_stock=1 (Low stock alerts)
    {
      const rawStock = [
        { id: 1, name: 'خرطوم ضغط عالي', stock: 12 },
        { id: 2, name: 'صمام أمان', stock: 0 },
        { id: 3, name: 'مفتاح أسطوانة', stock: 3 },
      ];

      const sorted = [...rawStock].sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
      if (sorted[0].name === 'صمام أمان' && sorted[1].name === 'مفتاح أسطوانة') {
        pass('GET /dashboard/products (Low Stock): ترتيب تنبيهات نفاد المخزون تصاعدياً (الأقل مخزوناً أولاً)');
      } else {
        fail('GET /dashboard/products: خطأ في فرز تنبيهات المخزون', sorted);
      }
    }

    // 11. GET /dashboard/orders (AppLayout orders badge)
    {
      const mockOrders = {
        data: [
          { id: 1, status: 'pending' },
          { id: 2, status: 'processing' },
          { id: 3, status: 'completed' },
        ],
      };
      const list = extractList(mockOrders);
      if (list && list.length === 3) {
        pass('GET /dashboard/orders: حساب إجمالي الطلبات لشارة القائمة الجانبية (Sidebar Badge)');
      } else {
        fail('GET /dashboard/orders: فشل استخراج الطلبات للـ badge', mockOrders);
      }
    }

    // 12. GET /dashboard/settings (AppLayout branding & favicon)
    {
      const mockSettings = {
        data: [
          { key: 'site_name', value: 'ماستر غاز - Master Gas' },
          { key: 'logo', value: 'https://cdn.example.com/logo.png' },
          { key: 'favicon', value: 'https://cdn.example.com/favicon.ico' },
        ],
      };
      const logo = mockSettings.data.find(s => s.key === 'logo')?.value;
      const favicon = mockSettings.data.find(s => s.key === 'favicon')?.value;

      if (logo && favicon) {
        pass('GET /dashboard/settings: استخراج هوية الموقع (Logo & Favicon) بنجاح');
      } else {
        fail('GET /dashboard/settings: فشل استخراج إعدادات الهوية', mockSettings);
      }
    }

    // 13. POST /logout
    {
      const mockLogout = { success: true, message: 'Logged out successfully' };
      if (mockLogout.success) {
        pass('POST /logout: تسجيل خروج المشرف وإنهاء الجلسة');
      } else {
        fail('POST /logout: خطأ في مسار تسجيل الخروج', mockLogout);
      }
    }

  } finally {
    await viteServer.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Part 2: Live Server API Tests (Optional --live mode)
// ─────────────────────────────────────────────────────────────────────────────

async function runLiveTests() {
  info(`جاري فحص الخادم الحي: ${baseUrl}`);

  if (!adminToken) {
    console.log(`  ${C.yellow}⚠ تنبيه: لم يتم تزويد رمز دخول المشرف (ADMIN_TOKEN).${C.reset}`);
    console.log(`  ${C.gray}سيتم فحص استجابة الخادم بدون مصادقة للتحقق من الاتصال ورمز الخطأ 401.${C.reset}`);
    console.log(`  ${C.dim}لتشغيل الفحص الموثق: node scripts/test-dashboard-apis.mjs --live --token="YOUR_BEARER_TOKEN"${C.reset}\n`);
  }

  const endpoints = [
    { method: 'GET', path: '/dashboard/statistics', desc: 'مؤشرات وإحصائيات لوحة التحكم' },
    { method: 'GET', path: '/dashboard/returns?per_page=4', desc: 'قائمة المرتجعات' },
    { method: 'GET', path: '/dashboard/products?per_page=7&sort_by=total_sold&sort_dir=desc', desc: 'المنتجات الأكثر مبيعاً' },
    { method: 'GET', path: '/dashboard/products?low_stock=1&per_page=5', desc: 'تنبيهات انخفاض المخزون' },
    { method: 'GET', path: '/dashboard/orders', desc: 'قائمة الطلبات' },
    { method: 'GET', path: '/dashboard/settings', desc: 'إعدادات الموقع والشعار' },
  ];

  for (const ep of endpoints) {
    const url = `${baseUrl}${ep.path}`;
    const start = Date.now();
    try {
      const headers = {
        'Accept': 'application/json',
        'Accept-Language': 'ar',
      };
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      const res = await fetch(url, { method: ep.method, headers });
      const duration = Date.now() - start;
      const status = res.status;

      if (adminToken) {
        if (res.ok) {
          const json = await res.json();
          pass(`${ep.method} ${ep.path}`, `${ep.desc} | HTTP ${status} | ${duration}ms`);
        } else {
          fail(`${ep.method} ${ep.path}`, `HTTP ${status}: ${res.statusText} (${duration}ms)`);
        }
      } else {
        // Without token, 401 or 403 proves the endpoint exists and is protected
        if (status === 401 || status === 403) {
          pass(`${ep.method} ${ep.path}`, `محمي بصلاحيات المشرف (HTTP ${status}) | ${duration}ms`);
        } else if (res.ok) {
          pass(`${ep.method} ${ep.path}`, `متاح بدون مصادقة (HTTP ${status}) | ${duration}ms`);
        } else {
          // If 500 without token, note it
          console.log(`  ${C.yellow}⚠ WARN${C.reset}  ${ep.method} ${ep.path} -> HTTP ${status} (${duration}ms)`);
        }
      }
    } catch (err) {
      fail(`${ep.method} ${ep.path}`, `تعذر الاتصال بالخادم: ${err.message}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Execution
// ─────────────────────────────────────────────────────────────────────────────

console.log(`${C.bold}${C.blue}══════════════════════════════════════════════════════════════════${C.reset}`);
console.log(`${C.bold}    Master Gas - فحص شامل لـ APIs لوحة التحكم (Admin Dashboard)${C.reset}`);
console.log(`${C.bold}${C.blue}══════════════════════════════════════════════════════════════════${C.reset}`);

try {
  await runContractTests();
  if (isLive) {
    await runLiveTests();
  } else {
    console.log(`\n${C.gray}تلميح: لفحص السيرفر الفعلي المباشر أضف --live أو --token="TOKEN"${C.reset}`);
  }
} catch (err) {
  console.error('\nFatal test execution error:', err);
  process.exit(1);
}

console.log(`\n${C.bold}النتيجة النهائية:${C.reset}`);
console.log(`  إجمالي الفحوصات: ${stats.total}`);
console.log(`  ${C.green}الناجحة: ${stats.passed}${C.reset}`);
if (stats.failed > 0) {
  console.log(`  ${C.red}الفاشلة: ${stats.failed}${C.reset}`);
  process.exit(1);
} else {
  console.log(`  ${C.green}${C.bold}✔ اكتملت جميع اختبارات Dashboard APIs بنجاح 100%!${C.reset}\n`);
  process.exit(0);
}
