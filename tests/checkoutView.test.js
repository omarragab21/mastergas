import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createRenderer } from 'vue';
import { createI18n } from 'vue-i18n';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createServer } from 'vite';
import { readPendingPayment } from '../src/utils/checkoutSafety.js';

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
const alerts = [];
globalThis.localStorage = storage;
globalThis.alert = message => alerts.push(message);
globalThis.window = {
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() {},
  scrollTo() {},
  location: { origin: 'https://shop.example.test', href: '' },
};
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
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

const originalCart = [{ id: 7, name: 'Rose', price: 10, discount: 0, quantity: 1 }];
const originalWishlist = [{ id: 99, name: 'Favorite' }];
const snapshot = value => JSON.parse(JSON.stringify(value));

let viteServer;
let api;
let authState;
let cartState;
let CheckoutView;

before(async () => {
  storage.setItem('c_token', 'test-token');
  viteServer = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  });
  api = (await viteServer.ssrLoadModule('/src/config/axios.js')).default;
  ({ authState } = await viteServer.ssrLoadModule('/src/store/auth.js'));
  ({ cartState } = await viteServer.ssrLoadModule('/src/store/cart.js'));
  CheckoutView = (await viteServer.ssrLoadModule('/src/views/website/CheckoutView.vue')).default;
});

after(async () => {
  await viteServer.close();
});

const waitFor = async (condition) => {
  const startedAt = Date.now();
  while (!condition() && Date.now() - startedAt < 1_000) {
    await new Promise(resolve => setTimeout(resolve, 5));
  }
};

const mountCheckout = async (post) => {
  alerts.length = 0;
  storage.clear();
  storage.setItem('c_token', 'test-token');
  storage.setItem('cart_test-token', JSON.stringify(originalCart));
  storage.setItem('wishlist_test-token', JSON.stringify(originalWishlist));
  cartState.syncWithToken();
  authState.token = 'test-token';
  authState.user = { id: 1, name: 'Tester', phone: '0790000000', email: 'test@example.test' };
  window.location.href = '';

  api.get = async (url) => {
    if (url.includes('/frontend/products/')) {
      return { data: { data: { id: 7, name: 'Rose', price: 10, discount: 0 } } };
    }
    if (url === '/frontend/user') return { data: { data: authState.user } };
    if (url === '/frontend/addresses') return { data: { data: [] } };
    if (url === '/frontend/wallet') return { data: { data: { balance: 0 } } };
    return { data: { data: [] } };
  };

  const calls = [];
  api.post = async (url, payload, config) => {
    calls.push({ url, payload, config });
    return post(url, payload, config);
  };

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/checkout', component: { template: '<div />' } },
      { path: '/cart', component: { template: '<div />' } },
    ],
  });
  await router.push('/checkout');
  await router.isReady();

  const app = renderer.createApp(CheckoutView);
  app.use(router);
  app.use(createI18n({
    legacy: false,
    locale: 'ar',
    messages: { ar: { checkout: { order_error: 'order error' } } },
  }));
  app.provide(Symbol.for('v-scx'), { modules: new Set() });
  app.config.warnHandler = () => {};
  app.mount({ children: [] });

  const state = app._instance.setupState;
  await waitFor(() => state.cities && state.countries && !state.loading);
  state.customerInfo = {
    name: 'Tester',
    phone: '0790000000',
    email: 'test@example.test',
    address: 'Street 1',
    city: 'Amman',
    country: 'JO',
    country_id: 1,
    city_id: 1,
    building: '',
    floor: '',
    notes: '',
  };
  state.currentStep = 4;

  return { app, calls, state };
};

test('CheckoutView order submission safety scenarios', async (t) => {
  await t.test('COD keeps cart pending, blocks duplicate clicks, then commits real order state', async () => {
    let resolveOrder;
    const checkout = await mountCheckout(async () => new Promise(resolve => {
      resolveOrder = () => resolve({
        data: { success: true, data: { id: 777, order_number: 'ORD-777' } },
      });
    }));
    checkout.state.selectedPayment = 'cod';

    const firstSubmission = checkout.state.confirmOrder();
    const duplicateSubmission = checkout.state.confirmOrder();
    await waitFor(() => checkout.calls.length === 1);

    assert.equal(checkout.calls.length, 1);
    assert.equal(checkout.state.currentStep, 4);
    assert.deepEqual(snapshot(cartState.items), originalCart);
    assert.deepEqual(snapshot(cartState.wishlist), originalWishlist);

    // Simulate additions from another tab while the request is in flight.
    cartState.items[0].quantity = 2;
    cartState.items.push({ id: 8, name: 'New item', price: 5, quantity: 1 });
    cartState.saveCart();

    resolveOrder();
    await Promise.all([firstSubmission, duplicateSubmission]);

    assert.equal(checkout.state.currentStep, 5);
    assert.equal(checkout.state.confirmedOrderDisplayNumber, 'ORD-777');
    assert.deepEqual(snapshot(cartState.items), [
      { id: 7, name: 'Rose', price: 10, discount: 0, quantity: 1 },
      { id: 8, name: 'New item', price: 5, quantity: 1 },
    ]);
    assert.deepEqual(snapshot(cartState.wishlist), originalWishlist);
    checkout.app.unmount();
  });

  await t.test('COD failure or unconfirmed response preserves cart and review state', async () => {
    const originalConsoleError = console.error;
    console.error = () => {};
    try {
      const checkout = await mountCheckout(async () => ({ data: { success: false, message: 'rejected' } }));
      checkout.state.selectedPayment = 'cod';
      await checkout.state.confirmOrder();

      assert.equal(checkout.state.currentStep, 4);
      assert.equal(checkout.state.confirmedOrder, null);
      assert.deepEqual(snapshot(cartState.items), originalCart);
      assert.deepEqual(snapshot(cartState.wishlist), originalWishlist);
      assert.equal(alerts.length, 1);
      checkout.app.unmount();
    } finally {
      console.error = originalConsoleError;
    }
  });

  await t.test('COD response cannot clean a different account cart after a token change', async () => {
    const originalConsoleError = console.error;
    console.error = () => {};
    try {
      let resolveOrder;
      const checkout = await mountCheckout(async () => new Promise(resolve => {
        resolveOrder = () => resolve({
          data: { success: true, data: { id: 778, order_number: 'ORD-778' } },
        });
      }));
      checkout.state.selectedPayment = 'cod';
      const submission = checkout.state.confirmOrder();
      await waitFor(() => checkout.calls.length === 1);

      storage.setItem('c_token', 'second-user-token');
      storage.setItem('cart_second-user-token', JSON.stringify([{ id: 50, quantity: 2 }]));
      storage.setItem('wishlist_second-user-token', JSON.stringify([{ id: 51 }]));
      cartState.syncWithToken();

      resolveOrder();
      await submission;

      assert.equal(checkout.state.currentStep, 5);
      assert.deepEqual(snapshot(cartState.items), [{ id: 50, quantity: 2 }]);
      assert.deepEqual(snapshot(cartState.wishlist), [{ id: 51 }]);
      assert.deepEqual(JSON.parse(storage.getItem('cart_second-user-token')), [{ id: 50, quantity: 2 }]);
      checkout.app.unmount();
    } finally {
      console.error = originalConsoleError;
    }
  });

  await t.test('COD idempotent 409 can reconcile an existing confirmed order', async () => {
    const checkout = await mountCheckout(async (_url, _payload, config) => {
      const error = new Error('Already created');
      error.response = {
        status: 409,
        data: {
          success: true,
          checkout_attempt_id: config.headers['Idempotency-Key'],
          data: { id: 409, order_number: 'ORD-409' },
        },
      };
      throw error;
    });
    checkout.state.selectedPayment = 'cod';
    await checkout.state.confirmOrder();

    assert.equal(checkout.state.currentStep, 5);
    assert.equal(checkout.state.confirmedOrderDisplayNumber, 'ORD-409');
    assert.deepEqual(snapshot(cartState.items), []);
    assert.deepEqual(snapshot(cartState.wishlist), originalWishlist);
    checkout.app.unmount();
  });

  await t.test('COD rejects an unrelated 409 order and preserves checkout state', async () => {
    const originalConsoleError = console.error;
    console.error = () => {};
    try {
      const checkout = await mountCheckout(async () => {
        const error = new Error('Unrelated conflict');
        error.response = {
          status: 409,
          data: { success: true, data: { id: 410, order_number: 'ORD-410' } },
        };
        throw error;
      });
      checkout.state.selectedPayment = 'cod';
      await checkout.state.confirmOrder();

      assert.equal(checkout.state.currentStep, 4);
      assert.equal(checkout.state.confirmedOrder, null);
      assert.deepEqual(snapshot(cartState.items), originalCart);
      assert.deepEqual(snapshot(cartState.wishlist), originalWishlist);
      checkout.app.unmount();
    } finally {
      console.error = originalConsoleError;
    }
  });

  await t.test('wallet covering the full amount never opens PayTabs even if card was selected', async () => {
    const checkout = await mountCheckout(async () => ({
      data: { success: true, data: { id: 888, order_number: 'ORD-888' } },
    }));
    checkout.state.selectedPayment = 'card';
    checkout.state.useWallet = true;
    checkout.state.walletBalance = 1_000;
    await checkout.state.confirmOrder();

    assert.deepEqual(checkout.calls.map(call => call.url), ['/frontend/orders']);
    assert.equal(checkout.calls[0].payload.payment_method, 'wallet');
    assert.equal(window.location.href, '');
    assert.equal(checkout.state.currentStep, 5);
    assert.deepEqual(snapshot(cartState.wishlist), originalWishlist);
    checkout.app.unmount();
  });

  await t.test('a zero-value order uses the normal order endpoint and is not mislabeled as wallet', async () => {
    const checkout = await mountCheckout(async () => ({
      data: { success: true, data: { id: 889, order_number: 'ORD-889' } },
    }));
    cartState.items[0].price = 0;
    cartState.saveCart();
    checkout.state.selectedPayment = 'card';
    checkout.state.useWallet = false;
    await checkout.state.confirmOrder();

    assert.deepEqual(checkout.calls.map(call => call.url), ['/frontend/orders']);
    assert.equal(checkout.calls[0].payload.payment_method, 'cod');
    assert.equal(checkout.calls[0].payload.use_wallet, false);
    assert.equal(checkout.calls[0].payload.total_amount, 0);
    checkout.app.unmount();
  });

  await t.test('card checkout stores a scoped attempt and redirects without clearing state', async () => {
    const checkout = await mountCheckout(async () => ({
      data: { redirect_url: 'https://pay.example.test/session/1' },
    }));
    checkout.state.selectedPayment = 'card';
    checkout.state.useWallet = false;
    await checkout.state.confirmOrder();

    assert.deepEqual(checkout.calls.map(call => call.url), ['/frontend/paytabs/checkout']);
    const attemptId = checkout.calls[0].config.headers['Idempotency-Key'];
    assert.ok(attemptId);
    assert.equal(readPendingPayment(attemptId, storage).ok, true);
    assert.equal(checkout.calls[0].payload.checkout_attempt_id, attemptId);
    assert.equal(checkout.calls[0].payload.cart_id, attemptId);
    assert.deepEqual(checkout.calls[0].payload.order_data.items, [
      { product_id: 7, quantity: 1, unit_price: 10, attributes: null },
    ]);
    assert.match(checkout.calls[0].payload.return_url, new RegExp(`attempt=${attemptId}`));
    assert.equal(window.location.href, 'https://pay.example.test/session/1');
    assert.deepEqual(snapshot(cartState.items), originalCart);
    assert.deepEqual(snapshot(cartState.wishlist), originalWishlist);
    assert.equal(checkout.state.currentStep, 4);
    checkout.app.unmount();
  });

  await t.test('an uncertain card-session failure keeps its exact attempt and the full cart', async () => {
    const originalConsoleError = console.error;
    console.error = () => {};
    try {
      const checkout = await mountCheckout(async () => {
        throw new Error('network timeout after request');
      });
      checkout.state.selectedPayment = 'card';
      await checkout.state.confirmOrder();
      await checkout.state.confirmOrder();

      const attemptId = checkout.calls[0].config.headers['Idempotency-Key'];
      assert.equal(checkout.calls.length, 2);
      assert.equal(checkout.calls[1].config.headers['Idempotency-Key'], attemptId);
      assert.equal(readPendingPayment(attemptId, storage).ok, true);
      assert.deepEqual(snapshot(cartState.items), originalCart);
      assert.deepEqual(snapshot(cartState.wishlist), originalWishlist);
      assert.equal(window.location.href, '');
      assert.equal(checkout.state.currentStep, 4);
      checkout.app.unmount();
    } finally {
      console.error = originalConsoleError;
    }
  });
});
