import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

class MemoryStorage {
  constructor() { this.data = new Map(); }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  clear() { this.data.clear(); }
}

const storage = new MemoryStorage();
globalThis.localStorage = storage;
globalThis.window = { location: { pathname: '/', href: 'http://localhost/' } };

let viteServer;
let api;
let couponService;
let checkoutService;
let request;

before(async () => {
  viteServer = await createServer({
    root: new URL('../website', import.meta.url).pathname,
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  });
  api = (await viteServer.ssrLoadModule('/src/config/axios.js')).default;
  couponService = (await viteServer.ssrLoadModule('/src/services/couponService.js')).couponService;
  checkoutService = (await viteServer.ssrLoadModule('/src/modules/checkout/services/checkoutService.js')).default;
  api.defaults.adapter = async (config) => {
    request = config;
    return {
      data: {
        data: [{
          id: 14,
          code: 'PWMV6P8I93',
          type: 'percentage',
          value: 30,
          minimum_amount: 200,
          max_discount: 75,
          max_uses: 15,
          used_count: 0,
          is_active: true,
          is_valid_now: true,
        }],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  };
});

after(async () => { await viteServer?.close(); });

beforeEach(() => {
  storage.clear();
  storage.setItem('c_token', 'customer-token');
  request = null;
});

test('coupon validation reads Tijara discount_codes and applies max-discount rules', async () => {
  const result = await couponService.validate(' PWMV6P8I93 ', 900);

  assert.equal(request.method, 'get');
  assert.equal(request.url, '/v1/discount_codes');
  assert.equal(request.params.code, 'PWMV6P8I93');
  assert.equal(result.valid, true);
  assert.equal(result.discount, 75, '30% of 900 is capped at the coupon max discount of 75');
});

test('checkoutService delegates coupon validation to the same live coupon service', async () => {
  const result = await checkoutService.validateCoupon('PWMV6P8I93', 900);
  assert.equal(result.success, true);
  assert.equal(result.discount, 75);
});

test('coupon messages follow the selected site language', async () => {
  storage.setItem('lang', 'ar');
  assert.equal((await couponService.validate('PWMV6P8I93', 900)).message, 'تم تطبيق الكوبون بنجاح');

  storage.setItem('lang', 'en');
  assert.equal((await couponService.validate('PWMV6P8I93', 900)).message, 'Coupon applied successfully');
});

test('a coupon with no calculated discount is never reported as applied', async () => {
  api.defaults.adapter = async (config) => ({
    data: { data: [{ code: 'ZERO', type: 'fixed', value: 0, is_active: true, is_valid_now: true }] },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  });

  const result = await couponService.validate('ZERO', 900);
  assert.equal(result.success, false);
  assert.equal(result.valid, false);
  assert.equal(result.discount, undefined);

  api.defaults.adapter = async (config) => ({
    data: {
      data: [{
        id: 14,
        code: 'PWMV6P8I93',
        type: 'percentage',
        value: 30,
        minimum_amount: 200,
        max_discount: 75,
        max_uses: 15,
        used_count: 0,
        is_active: true,
        is_valid_now: true,
      }],
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  });
});
