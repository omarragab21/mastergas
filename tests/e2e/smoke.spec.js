import { test, expect } from '@playwright/test';

test('storefront and dashboard login screens render without console errors', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto('/');
  await expect(page.locator('body')).toContainText('Mastergas');

  await page.goto('/admin/login');
  await expect(page.locator('body')).toContainText('تسجيل الدخول');
  expect(consoleErrors).toEqual([]);
});
