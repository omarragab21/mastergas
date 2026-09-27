// Runs the original 15 scenarios plus the additional acceptance checks below.
import test from 'node:test';
import assert from 'node:assert/strict';
import { openDashboard, statistics, readState } from './audit-dashboard.mjs';

for (const section of ['returns', 'bestSellers', 'lowStock']) {
  test(`follow-up: ${section} retry recovers without reloading statistics`, async t => {
    const stats = statistics();
    const options = { stats };
    let container, result;
    if (section === 'returns') {
      options.returnsStatus = 500;
      options.returnsResponse = { data: [{ id: 5, status: 'pending', customer_name: 'عميل إرجاع', product_name: 'منتج مرتجع', refund_amount: 10 }] };
      container = '.returns-list'; result = '.return-item';
    } else {
      delete stats[section === 'bestSellers' ? 'best_selling_products' : 'low_stock_products'];
      options.productsStatus = 500;
      options.productsResponse = { data: [{ id: 9, name: 'منتج الاستعادة', total_sold: 3, quantity: 1 }] };
      container = section === 'bestSellers' ? '.tables-row .section-card:last-child' : '.inventory-list';
      result = section === 'bestSellers' ? '.td-product-name' : '.inv-name';
    }
    const { page, calls, errors } = await openDashboard(t, options);
    options.returnsStatus = 200;
    options.productsStatus = 200;
    await page.locator(container).getByRole('button', { name: 'إعادة المحاولة' }).click();
    await page.locator(container).locator(result).waitFor();
    assert.equal(await page.locator(container).locator('.section-error').count(), 0);
    assert.equal(calls.filter(c => c.path.endsWith('/dashboard/statistics')).length, 1);
    assert.deepEqual(errors, []);
  });
}

test('follow-up: genuine empty arrays do not request product fallback', async t => {
  const stats = statistics();
  stats.best_selling_products = [];
  stats.low_stock_products = [];
  const { page, calls } = await openDashboard(t, { stats });
  assert.equal(calls.filter(c => c.path.endsWith('/dashboard/products')).length, 0);
  assert.equal(await page.getByText('لا توجد تنبيهات مخزون', { exact: true }).count(), 1);
  assert.equal(await page.getByText('لا توجد طلبات إرجاع', { exact: true }).count(), 1);
});

test('follow-up: genuine zero metrics remain visible', async t => {
  const stats = statistics();
  stats.summary = { total_products: 0, total_customers: 0, today_orders: 0, total_orders: 0, monthly_sales: 0, today_sales: 0 };
  stats.orders_by_status = { completed: 0, pending: 0 };
  const { page } = await openDashboard(t, { stats });
  assert.deepEqual(await page.locator('.stat-value').allTextContents(), ['0', '0', '0', '0 د.أ', '0 د.أ']);
  assert.equal(await page.locator('.donut-total-num').innerText(), '0');
});

test('follow-up: cards fit at 360, 768 and 1440 pixels', async t => {
  for (const width of [360, 768, 1440]) {
    const { page } = await openDashboard(t, { viewport: { width, height: 1000 } });
    const rects = await page.locator('.dashboard .stat-card, .dashboard .chart-card').evaluateAll(elements => elements.map(e => {
      const r = e.getBoundingClientRect(); return { left: r.left, right: r.right };
    }));
    assert.ok(rects.length > 0 && rects.every(r => r.left >= 0 && r.right <= width), JSON.stringify({ width, rects }));
  }
});

test('follow-up: mobile menu opens, closes with Escape, and closes after navigation', async t => {
  const { page } = await openDashboard(t, { viewport: { width: 390, height: 844 } });
  const toggle = page.getByRole('button', { name: 'قائمة التنقل' });
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  await toggle.click();
  await page.locator('.sidebar a[href="/admin/returns"]').click();
  await page.waitForURL('**/admin/returns');
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
});

test('follow-up: admin 401 clears only admin storage and login remains stable', async t => {
  const { page } = await openDashboard(t, { statsStatus: 401 });
  await page.waitForURL('**/admin/login');
  assert.deepEqual(await page.evaluate(() => ({ token: localStorage.getItem('token'), admin: localStorage.getItem('admin'), customer: localStorage.getItem('c_token') })),
    { token: null, admin: null, customer: 'audit-customer-token' });
  await page.waitForTimeout(300);
  assert.equal(new URL(page.url()).pathname, '/admin/login');
});

test('follow-up: admin 403 keeps the session and shows an error', async t => {
  const { page } = await openDashboard(t, { statsStatus: 403 });
  assert.equal(new URL(page.url()).pathname, '/admin/dashboard');
  assert.equal(await page.evaluate(() => localStorage.getItem('token')), 'audit-admin-token');
  assert.match(await page.locator('.error-alert').innerText(), /403/);
});

test('follow-up: repeated route visits do not accumulate charts', async t => {
  const { page } = await openDashboard(t);
  await page.evaluate(() => { window.__auditChart = document.querySelector('.dashboard').__vueParentComponent.setupState.Chart; });
  for (let i = 0; i < 3; i++) {
    await page.locator('.dashboard a[href="/admin/returns"]').click();
    await page.locator('.dashboard').waitFor({ state: 'detached' });
    assert.equal(await page.evaluate(() => Object.keys(window.__auditChart.instances).length), 0);
    await page.locator('.sidebar a[href="/admin/dashboard"]').click();
    await page.locator('.dashboard canvas').first().waitFor();
    assert.equal(await page.evaluate(() => Object.keys(window.__auditChart.instances).length), 2);
  }
});

test('follow-up: missing breakdown is explicitly distinguished from zero counts', async t => {
  const stats = statistics(); delete stats.orders_by_status;
  const { page } = await openDashboard(t, { stats });
  assert.match(await page.locator('.donut-card').innerText(), /غير متاح|غير متوفر|لا تتوفر|لا توجد بيانات/);
});

test('follow-up: invalid status counts are not silently presented as real zeros', async t => {
  const stats = statistics(); stats.orders_by_status.completed = 'invalid';
  const { page } = await openDashboard(t, { stats });
  const completed = page.locator('.legend-row').filter({ hasText: 'مكتمل' });
  assert.notEqual((await completed.locator('.legend-count').innerText()).trim(), '0');
});

test('follow-up: missing trend is not advertised as measured zero percent change', async t => {
  const { page } = await openDashboard(t);
  const customers = page.locator('.stat-card').filter({ hasText: 'العملاء' });
  assert.doesNotMatch(await customers.innerText(), /0%/);
});

test('follow-up: summary status fields still work without orders_by_status', async t => {
  const stats = statistics(); delete stats.orders_by_status;
  Object.assign(stats.summary, { completed_orders: 2, pending_orders: 8, processing_orders: 0 });
  const { page } = await openDashboard(t, { stats });
  const breakdown = await readState(page, 'orderStatusData');
  assert.equal(breakdown.find(s => s.key === 'completed').count, 2);
  assert.equal(breakdown.find(s => s.key === 'pending').count, 8);
});

test('follow-up: previously supported product aliases do not lose supplied records', async t => {
  const stats = statistics();
  stats.top_products = stats.best_selling_products;
  stats.low_stock = stats.low_stock_products;
  delete stats.best_selling_products; delete stats.low_stock_products;
  const { page } = await openDashboard(t, { stats });
  assert.deepEqual(await page.locator('.td-product-name').allTextContents(), ['منتج ثان', 'منتج أول']);
  assert.deepEqual(await page.locator('.inv-name').allTextContents(), ['منتج نافد', 'مخزون قليل']);
});

test('follow-up: partial breakdown does not silently replace the supplied order total', async t => {
  const stats = statistics();
  stats.orders_by_status = { completed: 2 };
  const { page } = await openDashboard(t, { stats });
  assert.equal(await page.locator('.donut-total-num').innerText(), '10');
});

test('follow-up: a malformed sales string is not parsed as a valid sale', async t => {
  const stats = statistics(); stats.monthly_data = [{ month_ar: 'يناير', sales: '123garbage' }];
  const { page } = await openDashboard(t, { stats });
  const data = await page.evaluate(() => {
    const state = document.querySelector('.dashboard').__vueParentComponent.setupState;
    return Object.values(state.Chart.instances).find(c => c.config.type === 'line').data.datasets[0].data;
  });
  assert.notEqual(data[0], 123);
});
