import { test, expect } from '@playwright/test';

test('website and admin run as separate Vue projects with isolated routing', async ({ page, browser }) => {
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto('/');
  await expect(page.locator('body')).toContainText('Mastergas');

  await page.goto('/admin');
  await expect(page.locator('body')).toContainText('مشكلة في الراوتنج');

  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  adminPage.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  adminPage.on('pageerror', (error) => consoleErrors.push(error.message));

  await adminPage.goto('http://127.0.0.1:5174/');
  await expect(adminPage.locator('body')).toContainText('تسجيل الدخول');
  await adminPage.locator('#email').fill('admin@mastergas.local');
  await adminPage.locator('#password').fill('admin123');
  await adminPage.locator('button[type="submit"]').click();
  await adminPage.waitForURL('**/admin/dashboard');
  await expect(adminPage.locator('body')).toContainText('لوحة القيادة');
  expect(consoleErrors).toEqual([]);
  await adminContext.close();
});
