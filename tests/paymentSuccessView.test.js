import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createRenderer } from 'vue';
import { createI18n } from 'vue-i18n';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createServer } from 'vite';
import {
  readPendingPayment,
  saveCompletedPayment,
  savePendingPayment,
} from '../src/utils/checkoutSafety.js';

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

  key(index) {
    return [...this.data.keys()][index] ?? null;
  }

  get length() {
    return this.data.size;
  }

  clear() {
    this.data.clear();
  }
}

const storage = new MemoryStorage();
globalThis.localStorage = storage;
globalThis.window = {
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() {},
};
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  writable: true,
  value: { onLine: true },
});

const renderer = createRenderer({
  patchProp() {},
  insert(child, parent) {
    (parent.children ||= []).push(child);
    child.parent = parent;
  },
  remove() {},
  createElement(type) {
    return { type, children: [] };
  },
  createText(text) {
    return { text };
  },
  createComment(text) {
    return { comment: text };
  },
  setText(node, text) {
    node.text = text;
  },
  setElementText(node, text) {
    node.text = text;
  },
  parentNode(node) {
    return node.parent || null;
  },
  nextSibling() {
    return null;
  },
  querySelector() {
    return null;
  },
  setScopeId() {},
  insertStaticContent() {
    return [{}, {}];
  },
});

const originalCart = [{ id: 7, name: 'Rose', price: 10, quantity: 1 }];
const originalWishlist = [{ id: 99, name: 'Favorite' }];
const orderSnapshot = {
  payment_method: 'card',
  total_amount: 10,
  items: [{ product_id: 7, quantity: 1, unit_price: 10 }],
};

let viteServer;
let api;
let cartState;
let PaymentSuccessView;

before(async () => {
  viteServer = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  });
  api = (await viteServer.ssrLoadModule('/src/config/axios.js')).default;
  ({ cartState } = await viteServer.ssrLoadModule('/src/store/cart.js'));
  PaymentSuccessView = (await viteServer.ssrLoadModule('/src/views/website/PaymentSuccessView.vue')).default;
});

after(async () => {
  await viteServer.close();
});

const waitForSettled = async (state) => {
  const startedAt = Date.now();
  while ((state.loading || state.processing) && Date.now() - startedAt < 1_000) {
    await new Promise(resolve => setTimeout(resolve, 5));
  }
};

const snapshot = (value) => JSON.parse(JSON.stringify(value));

const mountScenario = async ({
  query,
  post,
  withPending = true,
  setupStorage,
}) => {
  storage.clear();
  storage.setItem('c_token', 'test-token');
  storage.setItem('cart_test-token', JSON.stringify(originalCart));
  storage.setItem('wishlist_test-token', JSON.stringify(originalWishlist));
  if (withPending) {
    savePendingPayment(orderSnapshot, {
      storage,
      idempotencyKey: 'checkout-component-test',
    });
  }
  setupStorage?.();
  cartState.syncWithToken();

  const calls = [];
  api.post = async (url, payload, config) => {
    calls.push({ url, payload, config });
    return post(url, payload, config);
  };

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/payment/success', component: { template: '<div />' } }],
  });
  await router.push(`/payment/success${query}`);
  await router.isReady();

  const app = renderer.createApp(PaymentSuccessView);
  app.use(router);
  app.use(createI18n({ legacy: false, locale: 'ar', messages: { ar: {} } }));
  app.provide(Symbol.for('v-scx'), { modules: new Set() });
  app.config.warnHandler = () => {};
  app.mount({ children: [] });

  const state = app._instance.setupState;
  await waitForSettled(state);
  const result = {
    calls,
    cart: snapshot(cartState.items),
    wishlist: snapshot(cartState.wishlist),
    pending: readPendingPayment('checkout-component-test', storage),
    orderConfirmed: state.orderConfirmed,
    orderId: state.orderId,
    orderError: state.orderError,
    isOffline: state.isOffline,
  };
  app.unmount();
  return result;
};

test('PaymentSuccessView safety scenarios', async (t) => {
  await t.test('confirmed backend order updates UI then removes only purchased cart items', async () => {
    const result = await mountScenario({
      query: '?respStatus=A&tranRef=T-100&attempt=checkout-component-test',
      post: async () => ({ data: { success: true, data: { id: 100, order_number: 'ORD-100' } } }),
    });

    assert.deepEqual(result.calls.map(call => call.url), ['/frontend/paytabs/order']);
    assert.equal(result.calls[0].config.headers['Idempotency-Key'], 'checkout-component-test');
    assert.equal(result.calls[0].payload.checkout_attempt_id, 'checkout-component-test');
    assert.equal(result.orderConfirmed, true);
    assert.equal(result.orderId, 'ORD-100');
    assert.deepEqual(result.cart, []);
    assert.deepEqual(result.wishlist, originalWishlist);
    assert.equal(result.pending.ok, false);
  });

  await t.test('declined payment never calls an order endpoint and preserves state', async () => {
    const result = await mountScenario({
      query: '?respStatus=D&tranRef=T-DECLINED&attempt=checkout-component-test',
      post: async () => {
        throw new Error('API must not be called for declined payment');
      },
    });

    assert.equal(result.calls.length, 0);
    assert.deepEqual(result.cart, originalCart);
    assert.deepEqual(result.wishlist, originalWishlist);
    assert.equal(result.pending.ok, true);
    assert.equal(result.orderConfirmed, false);
  });

  await t.test('opening the success URL directly cannot create an order', async () => {
    const result = await mountScenario({
      query: '',
      post: async () => {
        throw new Error('API must not be called without a verified return shape');
      },
    });

    assert.equal(result.calls.length, 0);
    assert.deepEqual(result.cart, originalCart);
    assert.equal(result.pending.ok, true);
    assert.equal(result.orderConfirmed, false);
    assert.match(result.orderError, /تعذر التحقق/);
  });

  await t.test('verification 422 has no generic-order fallback and preserves cart', async () => {
    const originalConsoleError = console.error;
    console.error = () => {};
    try {
      const result = await mountScenario({
        query: '?respStatus=A&tranRef=T-422&attempt=checkout-component-test',
        post: async () => {
          const error = new Error('Verification rejected');
          error.response = { status: 422 };
          throw error;
        },
      });

      assert.deepEqual(result.calls.map(call => call.url), ['/frontend/paytabs/order']);
      assert.deepEqual(result.cart, originalCart);
      assert.deepEqual(result.wishlist, originalWishlist);
      assert.equal(result.pending.ok, true);
      assert.equal(result.orderConfirmed, false);
      assert.match(result.orderError, /إعادة المحاولة/);
    } finally {
      console.error = originalConsoleError;
    }
  });

  await t.test('explicit success=false cannot clear the cart', async () => {
    const originalConsoleError = console.error;
    console.error = () => {};
    try {
      const result = await mountScenario({
        query: '?respStatus=A&tranRef=T-FALSE&attempt=checkout-component-test',
        post: async () => ({ data: { success: false, data: { id: 555 } } }),
      });

      assert.deepEqual(result.cart, originalCart);
      assert.equal(result.pending.ok, true);
      assert.equal(result.orderConfirmed, false);
    } finally {
      console.error = originalConsoleError;
    }
  });

  await t.test('idempotent 409 replay reconciles only when it includes the existing order', async () => {
    const result = await mountScenario({
      query: '?respStatus=A&tranRef=T-409&attempt=checkout-component-test',
      post: async (_url, _payload, config) => {
        const error = new Error('Already finalized');
        error.response = {
          status: 409,
          data: {
            success: true,
            checkout_attempt_id: config.headers['Idempotency-Key'],
            data: { id: 409, order_number: 'ORD-409' },
          },
        };
        throw error;
      },
    });

    assert.equal(result.calls.length, 1);
    assert.equal(result.orderConfirmed, true);
    assert.equal(result.orderId, 'ORD-409');
    assert.deepEqual(result.cart, []);
    assert.deepEqual(result.wishlist, originalWishlist);
  });

  await t.test('an uncorrelated 409 order is rejected and cannot clear the cart', async () => {
    const originalConsoleError = console.error;
    console.error = () => {};
    try {
      const result = await mountScenario({
        query: '?respStatus=A&tranRef=T-409-BAD&attempt=checkout-component-test',
        post: async () => {
          const error = new Error('Unrelated conflict');
          error.response = {
            status: 409,
            data: { success: true, data: { id: 410, order_number: 'ORD-410' } },
          };
          throw error;
        },
      });

      assert.equal(result.orderConfirmed, false);
      assert.deepEqual(result.cart, originalCart);
      assert.equal(result.pending.ok, true);
    } finally {
      console.error = originalConsoleError;
    }
  });

  await t.test('a successful return cannot consume a different checkout attempt', async () => {
    const result = await mountScenario({
      query: '?respStatus=A&tranRef=T-WRONG&attempt=another-attempt',
      post: async () => {
        throw new Error('Mismatched attempt must not reach the API');
      },
    });

    assert.equal(result.calls.length, 0);
    assert.equal(result.orderConfirmed, false);
    assert.deepEqual(result.cart, originalCart);
    assert.equal(result.pending.ok, true);
  });

  await t.test('local cart cleanup failure keeps the pending idempotency attempt for safe recovery', async () => {
    const originalRemovePurchasedItems = cartState.removePurchasedItems;
    const originalConsoleError = console.error;
    console.error = () => {};
    try {
      const result = await mountScenario({
        query: '?respStatus=A&tranRef=T-CLEANUP&attempt=checkout-component-test',
        setupStorage: () => {
          cartState.removePurchasedItems = () => {
            throw new Error('storage unavailable');
          };
        },
        post: async () => ({
          data: { success: true, data: { id: 700, order_number: 'ORD-700' } },
        }),
      });

      assert.equal(result.orderConfirmed, true);
      assert.equal(result.orderId, 'ORD-700');
      assert.deepEqual(result.cart, originalCart);
      assert.deepEqual(result.wishlist, originalWishlist);
      assert.equal(result.pending.ok, true);
    } finally {
      cartState.removePurchasedItems = originalRemovePurchasedItems;
      console.error = originalConsoleError;
    }
  });

  await t.test('an optional UI event failure cannot replace confirmed-order state with an error', async () => {
    const originalDispatchEvent = window.dispatchEvent;
    const originalCustomEvent = globalThis.CustomEvent;
    try {
      const result = await mountScenario({
        query: '?respStatus=A&tranRef=T-EVENT&attempt=checkout-component-test',
        setupStorage: () => {
          globalThis.CustomEvent = class CustomEvent {
            constructor(type, options) {
              this.type = type;
              this.detail = options?.detail;
            }
          };
          window.dispatchEvent = () => {
            throw new Error('listener failure');
          };
        },
        post: async () => ({
          data: { success: true, data: { id: 701, order_number: 'ORD-701' } },
        }),
      });

      assert.equal(result.orderConfirmed, true);
      assert.equal(result.orderId, 'ORD-701');
      assert.equal(result.orderError, '');
      assert.deepEqual(result.cart, []);
    } finally {
      window.dispatchEvent = originalDispatchEvent;
      globalThis.CustomEvent = originalCustomEvent;
    }
  });

  await t.test('refresh after completion restores receipt without posting again', async () => {
    const result = await mountScenario({
      query: '?respStatus=A&tranRef=T-COMPLETE&attempt=checkout-component-test',
      withPending: false,
      setupStorage: () => {
        saveCompletedPayment(
          {
            transactionRef: 'T-COMPLETE',
            attemptId: 'checkout-component-test',
            orderId: 8,
            orderNumber: 'ORD-8',
            cleanupState: 'complete',
          },
          storage
        );
      },
      post: async () => {
        throw new Error('Completed payment must not be posted twice');
      },
    });

    assert.equal(result.calls.length, 0);
    assert.equal(result.orderConfirmed, true);
    assert.equal(result.orderId, 'ORD-8');
    assert.deepEqual(result.cart, originalCart);
  });

  await t.test('offline client preserves pending payment, sets isOffline, and never drops data', async () => {
    const originalNavigator = globalThis.navigator;
    globalThis.navigator = { onLine: false };
    try {
      const result = await mountScenario({
        query: '?respStatus=A&tranRef=T-OFFLINE&attempt=checkout-component-test',
        post: async () => {
          throw new Error('API must not be called when client is offline');
        },
      });

      assert.equal(result.calls.length, 0);
      assert.equal(result.isOffline, true);
      assert.equal(result.orderConfirmed, false);
      assert.equal(result.orderError, '');
      assert.deepEqual(result.cart, originalCart);
      assert.deepEqual(result.wishlist, originalWishlist);
      assert.equal(result.pending.ok, true);
      assert.equal(result.pending.record.orderData.tran_ref, 'T-OFFLINE');
    } finally {
      globalThis.navigator = originalNavigator;
    }
  });

  await t.test('connection drop during API execution preserves pending payment, switches to offline mode, and does not lose data', async () => {
    const originalConsoleError = console.error;
    console.error = () => {};
    try {
      const result = await mountScenario({
        query: '?respStatus=A&tranRef=T-DROPPED&attempt=checkout-component-test',
        post: async () => {
          const networkErr = new Error('Network Error');
          networkErr.code = 'ERR_NETWORK';
          throw networkErr;
        },
      });

      assert.equal(result.calls.length, 1);
      assert.equal(result.isOffline, true);
      assert.equal(result.orderConfirmed, false);
      assert.equal(result.orderError, '');
      assert.deepEqual(result.cart, originalCart);
      assert.deepEqual(result.wishlist, originalWishlist);
      assert.equal(result.pending.ok, true);
      assert.equal(result.pending.record.orderData.tran_ref, 'T-DROPPED');
    } finally {
      console.error = originalConsoleError;
    }
  });
});
