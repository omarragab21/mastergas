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
          <button class="action-btn retry-btn" @click="emit('retry')">
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
        <button v-if="canRetry" class="action-btn retry-btn" @click="emit('retry')">
          <i class="fas fa-redo-alt"></i> {{ tr('checkout.retry', 'إعادة المحاولة') }}
        </button>
        <button v-else class="action-btn home-btn" @click="emit('checkout')">
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
          <button class="action-btn orders-btn" @click="emit('orders')">
            {{ tr('profile.orders', 'طلباتي') }}
          </button>
          <button class="action-btn home-btn" @click="emit('home')">
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
        <button class="action-btn home-btn" @click="emit('checkout')">
          {{ tr('checkout.back_to_checkout', 'العودة لإتمام الطلب') }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: { type: Boolean, default: true },
  isOffline: { type: Boolean, default: false },
  orderId: { type: [String, Number], default: null },
  orderError: { type: String, default: '' },
  orderConfirmed: { type: Boolean, default: false },
  canRetry: { type: Boolean, default: false },
  tr: { type: Function, required: true },
});

const emit = defineEmits(['retry', 'checkout', 'orders', 'home']);
</script>

