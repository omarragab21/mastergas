// Functional regression audit. All remote requests are intercepted; no live data is changed.
// Run: PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node --test scripts/audit-dashboard.mjs
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { pathToFileURL } from 'node:url';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

let browser, server, origin;
before(async () => {
  const modulePath = process.env.PLAYWRIGHT_MODULE;
  const { chromium } = await import(modulePath ? pathToFileURL(modulePath).href : 'playwright');
  server = await createServer({ server: { host: '127.0.0.1', port: 0 }, logLevel: 'error' });
  await server.listen();
  origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch({ channel: 'chrome', headless: true });
});
after(async () => {
  await browser?.close();
  await server?.close();
});

const statistics = () => ({
  summary: { total_products: 12, total_customers: 8, today_orders: 3, total_orders: 10,
    monthly_sales: 150, today_sales: 25, products_change: -5 },
  orders_by_status: { completed: 4, processing: 2, shipped: 1, cancelled: 2, returned: 1 },
  monthly_data: [{ month_ar: 'يناير', sales: '150' }],
  daily_data: [{ day_ar: 'الاثنين', sales: '25' }],
  recent_orders: [{ id: 4, orderNumber: 'ORD-4', customer: 'عميل تجريبي', amount: '25 د.أ', status: 'مكتمل', statusClass: 'completed' }],
  best_selling_products: [{ id: 1, name: 'منتج أول', sales: 2, revenue: 20 }, { id: 2, name: 'منتج ثان', sales: 8, revenue: 80 }],
  low_stock_products: [{ id: 1, name: 'مخزون قليل', stock: 3 }, { id: 2, name: 'منتج نافد', stock: 0 }],
});

async function openDashboard(t, options = {}) {
  const context = await browser.newContext({ viewport: options.viewport || { width: 1440, height: 1000 } });
  t.after(() => context.close());
  await context.addInitScript(({ authenticated }) => {
    localStorage.setItem('theme', 'light');
    localStorage.setItem('lang', 'ar');
    if (authenticated) {
      localStorage.setItem('token', 'audit-admin-token');
      localStorage.setItem('c_token', 'audit-customer-token');
      localStorage.setItem('admin', JSON.stringify({ id: 1, name: 'Audit Admin' }));
    }
  }, { authenticated: options.authenticated !== false });
  const calls = [], errors = [];
  let statsAttempts = 0;
  await context.route('**/*', async route => {
    const req = route.request();
    const url = new URL(req.url());
    const isApi = url.pathname.startsWith('/api/');
    if (url.origin === origin && !isApi) return route.continue();
    if (!isApi) return route.fulfill({ status: 200, body: '', contentType: 'text/plain' });
    calls.push({ path: url.pathname, headers: req.headers() });
    let status = 200, data = { data: [] };
    if (url.pathname.endsWith('/dashboard/statistics')) {
      statsAttempts++;
      status = typeof options.statsStatus === 'function' ? options.statsStatus(statsAttempts) : (options.statsStatus || 200);
      data = status === 200 ? { data: options.stats || statistics() } : { message: 'Audit API failure' };
    } else if (url.pathname.endsWith('/dashboard/returns')) {
      status = options.returnsStatus || 200;
      data = options.returnsResponse || { data: [] };
    } else if (url.pathname.endsWith('/dashboard/products')) {
      status = options.productsStatus || 200;
      data = options.productsResponse || { data: [] };
    }
    await route.fulfill({ status, json: data, headers: { 'Access-Control-Allow-Origin': '*' } });
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/admin/dashboard`);
  if (options.authenticated !== false) {
    await page.waitForFunction(() => location.pathname === '/admin/login' ||
      (document.querySelector('.dashboard') && !document.querySelector('.dashboard-loading')));
  }
  return { page, calls, errors };
}

const readState = (page, key) => page.evaluate(key => document.querySelector('.dashboard').__vueParentComponent.setupState[key], key);

// Shared by the follow-up suite; importing also runs these original regression tests.
export { openDashboard, statistics, readState };

test('normal response renders cards, orders, sorted products and both charts', async t => {
  const { page, calls, errors } = await openDashboard(t);
  assert.deepEqual(await page.locator('.stat-value').allTextContents(), ['12', '8', '3', '150 د.أ', '25 د.أ']);
  assert.deepEqual(await page.locator('.td-product-name').allTextContents(), ['منتج ثان', 'منتج أول']);
  assert.deepEqual(await page.locator('.inv-name').allTextContents(), ['منتج نافد', 'مخزون قليل']);
  assert.equal(await page.locator('.td-order-id').innerText(), '#4');
  assert.equal(await page.locator('.dashboard canvas').count(), 2);
  assert.ok(calls.filter(c => c.path.includes('/dashboard/')).every(c => c.headers.authorization === 'Bearer audit-admin-token'));
  assert.deepEqual(errors, []);
});

test('daily/monthly controls update the real Chart.js dataset', async t => {
  const { page } = await openDashboard(t);
  await page.getByRole('button', { name: 'يومي', exact: true }).click();
  const dataset = () => page.evaluate(() => {
    const state = document.querySelector('.dashboard').__vueParentComponent.setupState;
    return Object.values(state.Chart.instances).find(c => c.config.type === 'line').data.datasets[0].data;
  });
  assert.deepEqual(await dataset(), [25]);
  await page.getByRole('button', { name: 'شهري', exact: true }).click();
  assert.deepEqual(await dataset(), [150]);
});

test('server failure displays error and retry recovers', async t => {
  const { page } = await openDashboard(t, { statsStatus: attempt => attempt === 1 ? 500 : 200 });
  assert.match(await page.locator('.error-alert').innerText(), /500/);
  await page.getByRole('button', { name: 'إعادة المحاولة' }).click();
  await page.locator('.stats-grid').waitFor();
  assert.equal(await page.locator('.stat-value').first().innerText(), '12');
});

test('unauthenticated dashboard navigation goes to admin login', async t => {
  const { page } = await openDashboard(t, { authenticated: false });
  await page.waitForURL('**/admin/login');
  assert.equal(new URL(page.url()).pathname, '/admin/login');
});

test('pending orders are included in the distribution and total', async t => {
  const stats = statistics();
  stats.orders_by_status = { completed: 2, pending: 8 };
  const { page } = await openDashboard(t, { stats });
  assert.equal(await page.locator('.donut-total-num').innerText(), '10');
});

test('missing status breakdown must not classify all orders as completed', async t => {
  const stats = statistics();
  delete stats.orders_by_status;
  const { page } = await openDashboard(t, { stats });
  const completed = (await readState(page, 'orderStatusData')).find(s => s.key === 'completed');
  assert.equal(completed?.count ?? 0, 0, 'No completed count was supplied by the API');
});

test('all-time orders must not be shown as today orders', async t => {
  const stats = statistics();
  delete stats.summary.today_orders;
  stats.summary.total_orders = 999;
  const { page } = await openDashboard(t, { stats });
  assert.notEqual(await page.locator('.stat-value').nth(2).innerText(), '999');
});

test('all-time sales must not be shown as monthly sales', async t => {
  const stats = statistics();
  delete stats.summary.monthly_sales;
  stats.summary.total_sales = 999;
  const { page } = await openDashboard(t, { stats });
  assert.notEqual(await page.locator('.stat-value').nth(3).innerText(), '999 د.أ');
});

test('failed returns request must not display a successful empty state', async t => {
  const { page } = await openDashboard(t, { returnsStatus: 500 });
  assert.equal(await page.getByText('لا توجد طلبات إرجاع', { exact: true }).count(), 0);
});

test('paginated product fallback renders records supported by ProductsView', async t => {
  const stats = statistics();
  delete stats.best_selling_products;
  delete stats.low_stock_products;
  const { page } = await openDashboard(t, { stats, productsResponse: { data: { data: [{ id: 9, name: 'منتج مرقم', total_sold: 8, quantity: 1 }], total: 1 } } });
  assert.deepEqual(await page.locator('.td-product-name').allTextContents(), ['منتج مرقم']);
  assert.deepEqual(await page.locator('.inv-name').allTextContents(), ['منتج مرقم']);
});

test('failed inventory fallback must not display a successful empty state', async t => {
  const stats = statistics();
  delete stats.low_stock_products;
  const { page } = await openDashboard(t, { stats, productsStatus: 500 });
  assert.equal(await page.getByText('لا توجد تنبيهات مخزون', { exact: true }).count(), 0);
});

test('invalid status count must not render NaN', async t => {
  const stats = statistics();
  stats.orders_by_status.completed = 'invalid';
  const { page } = await openDashboard(t, { stats });
  assert.doesNotMatch(await page.locator('.donut-body').innerText(), /NaN/);
});

test('leaving dashboard destroys its Chart.js instances', async t => {
  const { page } = await openDashboard(t);
  await page.evaluate(() => {
    window.__auditChart = document.querySelector('.dashboard').__vueParentComponent.setupState.Chart;
  });
  assert.equal(await page.evaluate(() => Object.keys(window.__auditChart.instances).length), 2);
  await page.locator('.dashboard a[href="/admin/returns"]').click();
  await page.waitForURL('**/admin/returns');
  await page.locator('.dashboard').waitFor({ state: 'detached' });
  assert.equal(await page.evaluate(() => Object.keys(window.__auditChart.instances).length), 0);
});

test('expired admin token returns the user to login', async t => {
  const { page } = await openDashboard(t, { statsStatus: 401 });
  assert.equal(new URL(page.url()).pathname, '/admin/login');
});

test('dashboard at 390px keeps its cards inside the visible viewport', async t => {
  const { page } = await openDashboard(t, { viewport: { width: 390, height: 844 } });
  if (process.env.AUDIT_ARTIFACT_DIR) {
    await mkdir(process.env.AUDIT_ARTIFACT_DIR, { recursive: true });
    // Capture the final chart frame rather than its initial animation.
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(process.env.AUDIT_ARTIFACT_DIR, 'dashboard-mobile.png'), fullPage: true });
  }
  const dimensions = await page.evaluate(() => ({ width: innerWidth,
    cards: [...document.querySelectorAll('.dashboard .stat-card, .dashboard .chart-card')].map(el => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, width: r.width };
    }) }));
  assert.ok(dimensions.cards.every(r => r.left >= 0 && r.right <= dimensions.width), JSON.stringify(dimensions));
});
