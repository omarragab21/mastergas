import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PAYMENT_ATTEMPT_TTL_MS,
  acquirePaymentLock,
  clearOrderAttempt,
  clearPendingPayment,
  extractCreatedOrder,
  extractMatchingConflictOrder,
  getIdempotencyConfig,
  getOrCreateOrderAttempt,
  getPaymentReturnState,
  getPendingPaymentKey,
  readCompletedPayment,
  readPendingPayment,
  releasePaymentLock,
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
}

const orderData = {
  payment_method: 'card',
  items: [{ product_id: 7, quantity: 1 }],
};

test('PayTabs return accepts a confirmed status only when a transaction reference exists', () => {
  assert.deepEqual(
    getPaymentReturnState({ respStatus: 'A', tranRef: 'T-123', cartId: 'attempt-1' }),
    {
      kind: 'success',
      status: 'A',
      transactionRef: 'T-123',
      attemptId: 'attempt-1',
      gatewayError: '',
    }
  );
  assert.equal(getPaymentReturnState({ respStatus: 'A', tranRef: '' }).kind, 'invalid');
  assert.equal(getPaymentReturnState({}).kind, 'invalid');
});

test('PayTabs decline and error values never count as success', () => {
  for (const status of ['D', 'C', 'E', 'X', 'FAILED', 'DECLINED', 'ERROR']) {
    assert.equal(getPaymentReturnState({ respStatus: status, tranRef: 'T-123', attempt: 'attempt-1' }).kind, 'failed');
  }
  assert.equal(getPaymentReturnState({ respStatus: 'A', tranRef: 'T-123', attempt: 'attempt-1', error: 'cancelled' }).kind, 'failed');
});

test('order response must contain a real order identity and no explicit failure', () => {
  assert.deepEqual(
    extractCreatedOrder({ data: { success: true, data: { id: 44, order_number: 'ORD-44' } } }),
    { order: { id: 44, order_number: 'ORD-44' }, id: 44, number: 'ORD-44' }
  );
  assert.equal(extractCreatedOrder({ data: { success: false, data: { id: 44 } } }), null);
  assert.equal(extractCreatedOrder({ data: { status: 'failed', order_id: 44 } }), null);
  assert.equal(extractCreatedOrder({ data: { success: true, message: 'ok' } }), null);
});

test('pending payment is customer and attempt scoped, expires, and clears exactly one attempt', () => {
  const storage = new MemoryStorage();
  storage.setItem('c_token', 'customer-one-token');
  const record = savePendingPayment(orderData, {
    storage,
    now: 1_000,
    idempotencyKey: 'checkout-attempt-1',
  });

  savePendingPayment(
    { ...orderData, items: [{ product_id: 8, quantity: 2 }] },
    { storage, now: 1_000, idempotencyKey: 'checkout-attempt-2' }
  );

  assert.equal(readPendingPayment('checkout-attempt-1', storage, 1_001).record.idempotencyKey, 'checkout-attempt-1');
  assert.equal(readPendingPayment('checkout-attempt-2', storage, 1_001).record.orderData.items[0].product_id, 8);
  assert.equal(clearPendingPayment('different-attempt', storage), true);
  assert.ok(storage.getItem(getPendingPaymentKey('checkout-attempt-1', storage)));
  assert.ok(storage.getItem(getPendingPaymentKey('checkout-attempt-2', storage)));

  storage.setItem('c_token', 'customer-two-token');
  assert.equal(readPendingPayment('checkout-attempt-1', storage, 1_001).reason, 'missing');

  storage.setItem('c_token', 'customer-one-token');
  assert.equal(readPendingPayment('checkout-attempt-1', storage, record.expiresAt).reason, 'expired');
  assert.equal(storage.getItem(getPendingPaymentKey('checkout-attempt-1', storage)), null);
  assert.equal(readPendingPayment('checkout-attempt-2', storage, 1_001).ok, true);
});

test('uncorrelated legacy pending data is never auto-finalized for the current user', () => {
  const storage = new MemoryStorage();
  storage.setItem('c_token', 'customer-token');
  storage.setItem('pending_paytabs_order', JSON.stringify(orderData));

  const result = readPendingPayment('unknown-attempt', storage, 5_000);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'missing');
  assert.ok(storage.getItem('pending_paytabs_order'));
});

test('completed payment receipt supports refresh but is bound to transaction and TTL', () => {
  const storage = new MemoryStorage();
  storage.setItem('c_token', 'customer-token');
  saveCompletedPayment(
    {
      transactionRef: 'T-9',
      attemptId: 'attempt-9',
      orderId: 9,
      orderNumber: 'ORD-9',
    },
    storage,
    2_000
  );

  assert.equal(readCompletedPayment('T-9', 'attempt-9', storage, 2_001).orderNumber, 'ORD-9');
  assert.equal(readCompletedPayment('T-other', 'attempt-9', storage, 2_001), null);
  assert.equal(readCompletedPayment('T-9', 'different-attempt', storage, 2_001), null);
  assert.equal(readCompletedPayment('T-9', 'attempt-9', storage, 2_000 + PAYMENT_ATTEMPT_TTL_MS), null);
});

test('409 reconciliation requires an explicit matching attempt or transaction marker', () => {
  const response = {
    data: {
      success: true,
      checkout_attempt_id: 'attempt-7',
      payment_reference: 'T-7',
      data: { id: 7, order_number: 'ORD-7' },
    },
  };

  assert.equal(
    extractMatchingConflictOrder(response, { idempotencyKey: 'attempt-7' }).number,
    'ORD-7'
  );
  assert.equal(
    extractMatchingConflictOrder(response, { transactionRef: 'T-7' }).number,
    'ORD-7'
  );
  assert.equal(
    extractMatchingConflictOrder(response, { idempotencyKey: 'other', transactionRef: 'other' }),
    null
  );
  assert.equal(
    extractMatchingConflictOrder(
      { data: { success: true, data: { id: 7, order_number: 'ORD-7' } } },
      { idempotencyKey: 'attempt-7' }
    ),
    null
  );
});

test('processing lock prevents concurrent finalization and is owner-safe', () => {
  const storage = new MemoryStorage();
  const firstLock = acquirePaymentLock('attempt-1', storage, 10_000);
  assert.ok(firstLock);
  assert.equal(acquirePaymentLock('attempt-1', storage, 10_001), null);

  releasePaymentLock({ ...firstLock, owner: 'not-the-owner' }, storage);
  assert.equal(acquirePaymentLock('attempt-1', storage, 10_001), null);

  releasePaymentLock(firstLock, storage);
  assert.ok(acquirePaymentLock('attempt-1', storage, 10_002));
});

test('idempotency key is sent using stable request headers', () => {
  assert.deepEqual(getIdempotencyConfig('checkout-123'), {
    timeout: 30_000,
    headers: {
      'Idempotency-Key': 'checkout-123',
      'X-Checkout-Id': 'checkout-123',
    },
  });
});

test('COD order attempts are isolated by snapshot and each retry reuses the right key', () => {
  const storage = new MemoryStorage();
  storage.setItem('c_token', 'customer-token');

  const first = getOrCreateOrderAttempt(orderData, { storage, now: 100 });
  const retry = getOrCreateOrderAttempt(orderData, { storage, now: 101 });
  assert.equal(retry.idempotencyKey, first.idempotencyKey);

  const changedOrderData = {
    ...orderData,
    items: [{ product_id: 7, quantity: 2 }],
  };
  const changed = getOrCreateOrderAttempt(
    changedOrderData,
    { storage, now: 102 }
  );
  assert.notEqual(changed.idempotencyKey, first.idempotencyKey);
  assert.equal(
    getOrCreateOrderAttempt(orderData, { storage, now: 103 }).idempotencyKey,
    first.idempotencyKey
  );
  assert.equal(clearOrderAttempt(storage, changed.idempotencyKey, orderData), false);
  assert.equal(clearOrderAttempt(storage, first.idempotencyKey, orderData), true);
  assert.equal(clearOrderAttempt(storage, changed.idempotencyKey, changedOrderData), true);
});

test('creating a new attempt sweeps abandoned expired COD snapshots', () => {
  const storage = new MemoryStorage();
  storage.setItem('c_token', 'customer-token');
  getOrCreateOrderAttempt(orderData, { storage, now: 100 });

  getOrCreateOrderAttempt(
    { ...orderData, items: [{ product_id: 99, quantity: 1 }] },
    { storage, now: 100 + PAYMENT_ATTEMPT_TTL_MS + 1 }
  );

  // Only the token plus the fresh attempt remain.
  assert.equal(storage.length, 2);
});
