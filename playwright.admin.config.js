import { defineConfig, devices } from '@playwright/test';

// Admin-only E2E run (no website dev server). Talks to the REAL Tijara backend through the Vite proxy,
// so every record the suite creates is prefixed QA-PW / QAPW and removed in afterAll.
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /admin-catalog\.spec\.js/,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'reports/admin-e2e-results.json' }]],
  outputDir: 'reports/admin-e2e-artifacts',
  use: {
    baseURL: 'http://127.0.0.1:5174',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'npm --prefix admin run dev -- --host 127.0.0.1 --port 5174',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
