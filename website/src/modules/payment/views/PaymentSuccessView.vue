<template>
  <PaymentSuccessStateCard
    :loading="loading"
    :is-offline="isOffline"
    :order-id="orderId"
    :order-error="orderError"
    :order-confirmed="orderConfirmed"
    :can-retry="canRetry"
    :tr="tr"
    @retry="processPaytabsOrder"
    @checkout="goCheckout"
    @orders="goOrders"
    @home="goHome"
  />
</template>

<script setup>
import PaymentSuccessStateCard from '../components/PaymentSuccessStateCard.vue';
import { usePaymentSuccessFlow } from '../composables/usePaymentSuccessFlow';

const {
  loading,
  isOffline,
  orderId,
  orderError,
  orderConfirmed,
  canRetry,
  tr,
  processPaytabsOrder,
  goCheckout,
  goOrders,
  goHome,
} = usePaymentSuccessFlow();
</script>

<style src="../styles/payment-success.css"></style>

