<template>
  <div class="payment-failure-page">
    <div class="payment-failure-card">
      <div class="failure-icon">
        <i class="fas fa-times-circle"></i>
      </div>
      <h1>لم يتم إتمام الدفع</h1>
      <p>تم إلغاء عملية الدفع أو لم تكتمل. سلة مشترياتك ما زالت محفوظة كما هي.</p>
      <p v-if="errorMessage" class="error-detail">{{ errorMessage }}</p>
      <div class="actions">
        <button class="retry-btn" @click="goCheckout">العودة لإتمام الطلب</button>
        <button class="home-btn" @click="goHome">الرئيسية</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// IMPORTANT: This page must NEVER clear the cart.
// The backend redirects here when payment is cancelled or fails.
const errorMessage = computed(() => route.query.error || '');

const goCheckout = () => {
  router.push('/checkout');
};

const goHome = () => {
  router.push('/');
};
</script>

<style scoped>
.payment-failure-page {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #fdfcfd;
}

.payment-failure-card {
  background: #fff;
  border-radius: 20px;
  padding: 50px 40px;
  max-width: 520px;
  width: 100%;
  text-align: center;
  box-shadow: 0 15px 50px rgba(239, 68, 68, 0.08);
}

.failure-icon {
  font-size: 64px;
  color: #ef4444;
  margin-bottom: 20px;
}

.payment-failure-card h1 {
  font-size: 1.6rem;
  color: #111827;
  margin-bottom: 12px;
}

.payment-failure-card p {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 16px;
}

.error-detail {
  font-size: 0.85rem;
  color: #ef4444;
  background: #fef2f2;
  border-radius: 8px;
  padding: 10px 14px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 12px;
}

.retry-btn {
  padding: 12px 28px;
  border-radius: 10px;
  border: 0;
  background: #000000;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #6d264c;
}

.home-btn {
  padding: 12px 28px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
}

.home-btn:hover {
  background: #f3f4f6;
}

@media (max-width: 640px) {
  .payment-failure-page { padding: 24px 12px; }
  .payment-failure-card { padding: 32px 20px; border-radius: 16px; }
  .failure-icon { font-size: 48px; margin-bottom: 14px; }
  .payment-failure-card h1 { font-size: 1.3rem; }
  .payment-failure-card p { font-size: 14px; }
  .actions { flex-direction: column; gap: 10px; }
  .retry-btn, .home-btn { width: 100%; padding: 13px; }
}
</style>
