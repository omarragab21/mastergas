<template>
  <div class="payment-success-page">
    <div class="payment-success-card">
      <!-- Loading State during sequential order submit -->
      <template v-if="loading">
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin loading-icon"></i>
          <h1>{{ tr('checkout.processing_order', 'جاري تأكيد وإرسال الطلب...') }}</h1>
          <p>{{ tr('checkout.please_wait', 'يرجى الانتظار للحظات لحين إكمال ربط بيانات الطلب') }}</p>
        </div>
      </template>

      <!-- Offline State -->
      <template v-else-if="isOffline">
        <div class="offline-state">
          <i class="fas fa-wifi-slash offline-icon"></i>
          <h1>{{ tr('checkout.offline_title', 'لا يوجد اتصال بالإنترنت') }}</h1>
          <p>{{ tr('checkout.offline_desc', 'تم الدفع بنجاح ولكن تعذر إرسال بيانات الطلب لعدم وجود اتصال بالإنترنت. بيانات طلبك محفوظة بأمان وسيقوم النظام بإعادة الإرسال تلقائياً فور توفر الاتصال.') }}</p>
          <div class="auto-retry-indicator">
            <i class="fas fa-circle-notch fa-spin"></i>
            <span>{{ tr('checkout.auto_reconnecting', 'جاري فحص الاتصال وإعادة المحاولة تلقائياً...') }}</span>
          </div>
          <button class="action-btn retry-btn" @click="processPaytabsOrder">
            <i class="fas fa-redo-alt"></i> {{ tr('checkout.retry_now', 'إعادة المحاولة الآن') }}
          </button>
        </div>
      </template>

      <!-- Order Error State -->
      <template v-else-if="orderError">
        <div class="cancel-icon">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <h1>{{ tr('checkout.order_error_title', 'حدث خطأ في حفظ الطلب') }}</h1>
        <p>{{ orderError }}</p>
        <button v-if="canRetry" class="action-btn retry-btn" @click="processPaytabsOrder">
          <i class="fas fa-redo-alt"></i> {{ tr('checkout.retry', 'إعادة المحاولة') }}
        </button>
        <button v-else class="action-btn home-btn" @click="goCheckout">
          {{ tr('checkout.back_to_checkout', 'العودة لإتمام الطلب') }}
        </button>
      </template>

      <!-- Successful Payment & Order Confirmed -->
      <template v-else-if="orderConfirmed">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h1>{{ tr('checkout.order_confirmed', 'تم تأكيد الطلب بنجاح') }}</h1>
        <p>{{ tr('checkout.order_confirmed_desc', 'شكرًا لك! تم استلام طلبك وسيتم تجهيزه وشحنه في أقرب وقت.') }}</p>
        <div v-if="orderId" class="order-id-badge">
          <span>{{ tr('checkout.order_number', 'رقم الطلب') }}:</span>
          <strong>#{{ orderId }}</strong>
        </div>
        <div class="actions-group">
          <button class="action-btn orders-btn" @click="goOrders">
            {{ tr('profile.orders', 'طلباتي') }}
          </button>
          <button class="action-btn home-btn" @click="goHome">
            {{ tr('checkout.back_to_home', 'الرجوع إلى الصفحة الرئيسية') }}
          </button>
        </div>
      </template>

      <!-- Payment Failed / Cancelled -->
      <template v-else>
        <div class="cancel-icon">
          <i class="fas fa-times-circle"></i>
        </div>
        <h1>{{ tr('checkout.payment_failed_title', 'لم يتم إتمام الدفع') }}</h1>
        <p>{{ tr('checkout.payment_failed_desc', 'تم إلغاء عملية الدفع أو لم تكتمل. سلة مشترياتك ما زالت محفوظة دون تغيير.') }}</p>
        <button class="action-btn home-btn" @click="goCheckout">
          {{ tr('checkout.back_to_checkout', 'العودة لإتمام الطلب') }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { cartState } from '../../store/cart';
import { useI18n } from 'vue-i18n';
import api from '../../config/axios';
import {
  acquirePaymentLock,
  clearPendingPayment,
  extractCreatedOrder,
  extractMatchingConflictOrder,
  getIdempotencyConfig,
  getPaymentReturnState,
  getPendingPaymentKey,
  readCompletedPayment,
  readPendingPayment,
  releasePaymentLock,
  saveCompletedPayment,
} from '../../utils/checkoutSafety';
import { trackPurchase } from '../../utils/metaPixel';
import { logPayment } from '../../utils/terminalLogger.js';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const tr = (key, fallback) => {
  if (typeof t === 'function') {
    try {
      const val = t(key);
      if (val && val !== key && !val.includes('.')) return val;
    } catch (_) {}
  }
  return fallback;
};

const loading = ref(true);
const isOffline = ref(false);
const orderId = ref(null);
const orderError = ref('');
const orderConfirmed = ref(false);
const processing = ref(false);

// The browser callback is only a signal to ask the backend to verify the
// transaction. It is never sufficient on its own to confirm an order.
const paymentReturnState = computed(() => getPaymentReturnState(route.query));
const canRetry = computed(() => paymentReturnState.value.kind === 'success');

const pendingErrorMessage = (reason) => {
  if (reason === 'expired') return tr('checkout.err_expired', 'انتهت صلاحية محاولة الدفع المحفوظة. يرجى التواصل معنا إذا تم خصم المبلغ.');
  if (reason === 'invalid') return tr('checkout.err_invalid', 'بيانات محاولة الدفع غير صالحة أو تخص جلسة مستخدم أخرى.');
  if (reason === 'missing_attempt') return tr('checkout.err_missing_attempt', 'رابط الدفع لا يحتوي على رقم محاولة يمكن مطابقته بأمان.');
  return tr('checkout.err_missing_data', 'لم يتم العثور على بيانات الطلب المرتبطة بعملية الدفع.');
};

const saveReceiptState = (receipt, cleanupState) => saveCompletedPayment({
  transactionRef: receipt.transactionRef,
  attemptId: receipt.attemptId,
  orderId: receipt.orderId,
  orderNumber: receipt.orderNumber,
  purchasedItems: receipt.purchasedItems,
  cleanupState,
});

// The three-state receipt avoids subtracting purchased quantities twice if the
// page is interrupted between localStorage writes. In an ambiguous "started"
// state we deliberately preserve the cart instead of risking data loss.
const finishLocalCleanup = (receipt) => {
  if (receipt.cleanupState === 'complete') {
    clearPendingPayment(receipt.attemptId);
    return true;
  }
  if (receipt.cleanupState !== 'pending') return false;

  saveReceiptState(receipt, 'started');
  cartState.removePurchasedItems(receipt.purchasedItems, {
    expectedOwner: receipt.owner,
  });
  saveReceiptState(receipt, 'complete');
  clearPendingPayment(receipt.attemptId);
  return true;
};

let offlineIntervalId = null;

const stopOfflineWatcher = () => {
  if (offlineIntervalId) {
    clearInterval(offlineIntervalId);
    offlineIntervalId = null;
  }
};

const checkInternetConnection = async () => {
  // 1. Browser check
  if (typeof navigator !== 'undefined' && 'onLine' in navigator && !navigator.onLine) {
    return false;
  }

  // 2. Active network probe if in browser environment
  if (typeof window !== 'undefined' && window?.location?.origin && typeof window.fetch === 'function') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const probeUrl = `${window.location.origin}/favicon.png?_ping=${Date.now()}`;
      await fetch(probeUrl, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return true;
    } catch (_) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return false;
      }
      return false;
    }
  }

  return typeof navigator === 'undefined' || navigator.onLine !== false;
};

const isNetworkError = (error) => {
  if (!error) return false;
  if (typeof navigator !== 'undefined' && 'onLine' in navigator && !navigator.onLine) {
    return true;
  }
  if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return true;
  }
  const msg = (error.message || '').toLowerCase();
  if (
    msg.includes('network error') ||
    msg.includes('networkerror') ||
    msg.includes('timeout') ||
    msg.includes('failed to fetch') ||
    msg.includes('offline') ||
    msg.includes('internet')
  ) {
    return true;
  }
  // If request was made via Axios but no response was received, it represents a connection drop
  if (error.isAxiosError && !error.response) {
    return true;
  }
  return false;
};

const startOfflineWatcher = () => {
  if (offlineIntervalId) return;
  offlineIntervalId = setInterval(async () => {
    if (orderConfirmed.value) {
      stopOfflineWatcher();
      return;
    }
    if (processing.value) return;

    const isConnected = await checkInternetConnection();
    if (isConnected) {
      logPayment('Auto Reconnect', 'Internet connection restored. Auto-retrying pending order...');
      stopOfflineWatcher();
      processPaytabsOrder();
    }
  }, 4000);
};

const processPaytabsOrder = async () => {
  if (processing.value || orderConfirmed.value) return;

  logPayment('Redirect Mount', 'Returned from PayTabs gateway. Evaluating route query params...', route.query);

  const returnState = paymentReturnState.value;
  if (returnState.kind === 'failed') {
    logPayment('Redirect Failed', 'Gateway reported failed or cancelled payment status', returnState);
    loading.value = false;
    return;
  }

  if (returnState.kind !== 'success') {
    logPayment('Redirect Invalid', 'Gateway return URL does not contain valid success parameters', returnState);
    orderError.value = tr('checkout.verify_error', 'تعذر التحقق من نتيجة الدفع. رابط العودة لا يحتوي على بيانات دفع مؤكدة.');
    loading.value = false;
    return;
  }

  logPayment('Redirect Verified', 'Gateway returned success status. Checking local completed receipt...', returnState);

  // A refresh after a completed order must show the saved receipt without
  // sending the order a second time.
  let completedPayment;
  try {
    completedPayment = readCompletedPayment(
      returnState.transactionRef,
      returnState.attemptId
    );
  } catch (storageError) {
    console.error('Failed to read completed payment state:', storageError);
  }
  if (completedPayment) {
    logPayment('Receipt Found', 'Already confirmed payment receipt found in LocalStorage. Restoring receipt state.', completedPayment);
    orderId.value = completedPayment.orderNumber || completedPayment.orderId;
    orderConfirmed.value = true;
    try {
      finishLocalCleanup(completedPayment);
    } catch (cleanupError) {
      console.error('Completed payment local cleanup could not finish:', cleanupError);
    }
    loading.value = false;
    return;
  }

  let pendingResult;
  try {
    pendingResult = readPendingPayment(returnState.attemptId);
  } catch (storageError) {
    console.error('Failed to read pending payment state:', storageError);
    orderError.value = tr('checkout.err_missing_data', 'تعذر قراءة بيانات الطلب المحفوظة على هذا الجهاز.');
    loading.value = false;
    return;
  }
  if (!pendingResult.ok) {
    logPayment('Pending Record Error', `Pending order snapshot read error: "${pendingResult.reason}"`);
    orderError.value = pendingErrorMessage(pendingResult.reason);
    loading.value = false;
    return;
  }

  const { record } = pendingResult;

  // Enrich and preserve pending payment record with transactionRef in LocalStorage
  // so that payment reference and attempt details are NEVER lost under any circumstance!
  if (returnState.transactionRef && record?.orderData) {
    if (!record.orderData.tran_ref || record.orderData.tran_ref !== returnState.transactionRef) {
      record.orderData.tran_ref = returnState.transactionRef;
      record.orderData.payment_reference = returnState.transactionRef;
      try {
        const targetStorage = globalThis.localStorage;
        const key = pendingResult.key || getPendingPaymentKey(record.attemptId, targetStorage);
        if (key && targetStorage) {
          targetStorage.setItem(key, JSON.stringify(record));
          logPayment('Pending Preserved', 'Enriched pending payment record in LocalStorage with transactionRef', {
            attemptId: record.attemptId,
            transactionRef: returnState.transactionRef,
          });
        }
      } catch (storageErr) {
        console.error('Failed to update pending payment record with transactionRef:', storageErr);
      }
    }
  }

  // Pre-execution Internet Connection Check
  const isOnline = await checkInternetConnection();
  if (!isOnline) {
    logPayment('Offline Warning', 'No internet connection detected before processing order. Keeping order pending in LocalStorage and starting auto-reconnect watcher.');
    isOffline.value = true;
    loading.value = false;
    startOfflineWatcher();
    return;
  }

  isOffline.value = false;
  orderError.value = '';
  loading.value = true;
  processing.value = true;
  let paymentLock;
  try {
    paymentLock = acquirePaymentLock(record.idempotencyKey);
  } catch (storageError) {
    console.error('Failed to acquire payment lock:', storageError);
    processing.value = false;
    loading.value = false;
    orderError.value = tr('checkout.err_lock_failed', 'تعذر تأمين محاولة الدفع على هذا الجهاز. يرجى المحاولة مرة أخرى.');
    return;
  }
  if (!paymentLock) {
    logPayment('Lock Contention', 'Payment is already being processed in another tab or thread');
    processing.value = false;
    loading.value = false;
    orderError.value = tr('checkout.err_lock_busy', 'عملية الدفع قيد التأكيد بالفعل في نافذة أخرى. انتظر لحظات ثم أعد المحاولة.');
    return;
  }

  try {
    const resolveNumericOrderId = () => {
      const candidates = [
        route.query?.order_id,
        route.query?.orderId,
        route.query?.id,
        record.orderData?.order_id,
        record.orderData?.id,
      ];
      for (const candidate of candidates) {
        if (candidate !== null && candidate !== undefined && candidate !== '') {
          const parsed = parseInt(candidate, 10);
          if (Number.isInteger(parsed) && parsed > 0 && String(parsed) === String(candidate).trim()) {
            return parsed;
          }
        }
      }
      return undefined;
    };

    const numericOrderId = resolveNumericOrderId();
    const pendingOrderData = {
      ...record.orderData,
      tran_ref: returnState.transactionRef,
      payment_reference: returnState.transactionRef,
      checkout_attempt_id: record.attemptId,
      cart_id: record.attemptId,
    };

    if (numericOrderId !== undefined) {
      pendingOrderData.order_id = numericOrderId;
    } else {
      delete pendingOrderData.order_id;
    }

    logPayment('Verify Order API', 'Sending POST /frontend/paytabs/order to verify transaction with backend', pendingOrderData);

    // This endpoint must verify the transaction with PayTabs. There is
    // deliberately no fallback to the generic order endpoint.
    let createdOrder;
    try {
      const response = await api.post(
        '/frontend/paytabs/order',
        pendingOrderData,
        getIdempotencyConfig(record.idempotencyKey)
      );
      createdOrder = extractCreatedOrder(response);
      logPayment('Verify Response', 'Received verified order response from backend', response.data);
    } catch (requestError) {
      logPayment('Verify API Error', `POST /frontend/paytabs/order failed with status ${requestError.response?.status}`, requestError.response?.data);
      if (requestError.response?.status === 409) {
        createdOrder = extractMatchingConflictOrder(requestError.response, {
          idempotencyKey: record.idempotencyKey,
          transactionRef: returnState.transactionRef,
        });
        if (createdOrder) {
          logPayment('409 Reconciled', 'Successfully reconciled 409 Conflict with matching order snapshot');
        }
      }
      if (!createdOrder) throw requestError;
    }

    // If paytabs/order verified payment but did not create the database order record,
    // call /frontend/orders to guarantee the order appears in the CMS dashboard.
    if (!createdOrder?.order?.order_number && !createdOrder?.order?.orderNumber && (!createdOrder?.number || createdOrder?.number === 'CONFIRMED')) {
      try {
        logPayment('Fallback CMS Order', 'Calling fallback POST /frontend/orders to ensure order in CMS dashboard');
        const orderResponse = await api.post(
          '/frontend/orders',
          pendingOrderData,
          getIdempotencyConfig(record.idempotencyKey)
        );
        const fullCreatedOrder = extractCreatedOrder(orderResponse);
        if (fullCreatedOrder) {
          createdOrder = fullCreatedOrder;
        }
      } catch (orderSaveError) {
        console.warn('CMS order creation fallback error:', orderSaveError);
      }
    }

    if (!createdOrder) throw new Error('Payment API did not return a confirmed order');

    // Commit receipt/UI state before touching cart storage.
    const resolvedOrderRef = (createdOrder.number && createdOrder.number !== 'CONFIRMED')
      ? createdOrder.number
      : (createdOrder.id && createdOrder.id !== 'CONFIRMED' ? createdOrder.id : (returnState.transactionRef || record.attemptId));

    orderId.value = resolvedOrderRef;
    orderConfirmed.value = true;
    stopOfflineWatcher();

    logPayment('Order Confirmed Success', `Order confirmed successfully! Order Number: #${resolvedOrderRef}`);

    // Meta Pixel Track Purchase Event
    trackPurchase({
      orderId: resolvedOrderRef,
      totalValue: createdOrder.total || createdOrder.total_amount || record?.orderData?.total_amount || 0,
      items: record?.orderData?.items || [],
    });
    let completedReceipt = null;
    try {
      completedReceipt = saveCompletedPayment({
        transactionRef: returnState.transactionRef,
        attemptId: record.attemptId,
        orderId: resolvedOrderRef,
        orderNumber: resolvedOrderRef,
        purchasedItems: record.orderData.items,
        cleanupState: 'pending',
      });
    } catch (storageError) {
      console.error('Failed to persist completed payment receipt:', storageError);
    }

    // Never discard the pending idempotency record unless both the receipt and
    // cart cleanup were persisted. A retry then remains bound to the same order.
    if (completedReceipt) {
      try {
        finishLocalCleanup(completedReceipt);
        logPayment('Cart Cleaned', 'Successfully removed purchased items from local cart state');
      } catch (cleanupError) {
        console.error('Confirmed order cart cleanup failed:', cleanupError);
      }
    }

    if (typeof window !== 'undefined' && typeof CustomEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('order:created', { detail: createdOrder.order }));
      } catch (_) {
        // This event only refreshes optional UI listeners. It must never turn a
        // server-confirmed order back into an error screen.
      }
    }
  } catch (err) {
    logPayment('Final Order Error', `Order verification failed: ${err.message}`, err);
    console.error('Failed to submit order after payment:', err);
    if (isNetworkError(err)) {
      logPayment('Connection Lost', 'Internet connection lost during order submission. Preserving pending order in LocalStorage and waiting for reconnection.', {
        attemptId: record.attemptId,
        error: err.message,
      });
      isOffline.value = true;
      orderError.value = '';
      startOfflineWatcher();
    } else {
      orderError.value = 'تعذر إرسال بيانات الطلب إلى السيرفر. يرجى إعادة المحاولة.';
    }
  } finally {
    try {
      releasePaymentLock(paymentLock);
    } catch (storageError) {
      console.error('Failed to release payment lock:', storageError);
    }
    processing.value = false;
    loading.value = false;
  }
};

const handleOnlineEvent = async () => {
  if (!orderConfirmed.value && (isOffline.value || orderError.value)) {
    const isConnected = await checkInternetConnection();
    if (isConnected) {
      stopOfflineWatcher();
      processPaytabsOrder();
    }
  }
};

onMounted(() => {
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('online', handleOnlineEvent);
  }
  processPaytabsOrder();
});

onUnmounted(() => {
  stopOfflineWatcher();
  if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
    window.removeEventListener('online', handleOnlineEvent);
  }
});

const goHome = () => {
  router.push('/');
};

const goOrders = () => {
  router.push('/profile?tab=orders');
};

const goCheckout = () => {
  router.push('/checkout');
};
</script>

<style scoped>
.payment-success-page {
  min-height: 75vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #fdfcfd;
}

.payment-success-card {
  background: #fff;
  border-radius: 24px;
  padding: 50px 40px;
  max-width: 520px;
  width: 100%;
  text-align: center;
  box-shadow: 0 15px 50px rgba(135, 50, 96, 0.08);
  border: 1px solid #f3e8ee;
}

.loading-state, .offline-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-icon {
  font-size: 54px;
  color: #000000;
  margin-bottom: 16px;
}

.offline-icon {
  font-size: 54px;
  color: #f59e0b;
  margin-bottom: 16px;
}

.auto-retry-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fef3c7;
  color: #92400e;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 20px;
  border: 1px solid #fde68a;
}

.success-icon {
  font-size: 64px;
  color: #10b981;
  margin-bottom: 20px;
}

.cancel-icon {
  font-size: 64px;
  color: #ef4444;
  margin-bottom: 20px;
}

.payment-success-card h1 {
  font-size: 1.6rem;
  color: #111827;
  font-weight: 700;
  margin-bottom: 12px;
}

.payment-success-card p {
  color: #6b7280;
  line-height: 1.6;
  font-size: 0.95rem;
  margin-bottom: 24px;
}

.order-id-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f8f0f4;
  color: #000000;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 0.95rem;
  margin-bottom: 28px;
}

.actions-group {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.action-btn {
  padding: 12px 32px;
  border-radius: 12px;
  border: 0;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.home-btn {
  background: #000000;
  color: #fff;
}

.home-btn:hover {
  background: #6d264c;
  transform: translateY(-1px);
}

.orders-btn {
  background: #fff;
  color: #000000;
  border: 1px solid #000000;
}

.orders-btn:hover {
  background: #f8f0f4;
  transform: translateY(-1px);
}

.retry-btn {
  background: #f59e0b;
  color: #fff;
}

.retry-btn:hover {
  background: #d97706;
}

@media (max-width: 640px) {
  .payment-success-page { padding: 30px 16px; }
  .payment-success-card { padding: 36px 24px; border-radius: 18px; }
  .success-icon, .cancel-icon, .loading-icon, .offline-icon { font-size: 46px; margin-bottom: 14px; }
  .payment-success-card h1 { font-size: 1.35rem; }
  .payment-success-card p { font-size: 14px; margin-bottom: 20px; }
  .action-btn { width: 100%; padding: 13px; }
}
</style>
