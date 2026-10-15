import { computed } from 'vue';

export function useCheckoutTotals({
  cartState,
  settings,
  cityShippingRate,
  freeDeliveryThreshold,
  shippingCost,
  taxRate,
  discountAmount,
  useWallet,
  walletBalance,
  selectedPayment,
  getCartPricing,
  roundMoney,
}) {
  const cartPricing = computed(() => getCartPricing(cartState.items));
  const subtotalWithDiscount = computed(() => cartPricing.value.subtotal);

  const taxableAmount = computed(() => roundMoney(
    Math.max(0, subtotalWithDiscount.value - discountAmount.value)
  ));

  const shippingAmount = computed(() => {
    if (taxableAmount.value <= 0) return 0;

    if (settings.value.enable_city_shipping) {
      const rate = cityShippingRate.value > 0
        ? cityShippingRate.value
        : settings.value.default_city_shipping_rate;
      return taxableAmount.value >= freeDeliveryThreshold.value ? 0 : roundMoney(rate);
    }

    return taxableAmount.value >= freeDeliveryThreshold.value ? 0 : roundMoney(shippingCost.value);
  });

  const taxAmount = computed(() => roundMoney(
    Math.max(0, taxableAmount.value * (taxRate.value / 100))
  ));

  const grandTotal = computed(() => roundMoney(
    taxableAmount.value + shippingAmount.value + taxAmount.value
  ));

  const walletPayment = computed(() => {
    if (!useWallet.value) return 0;
    return roundMoney(Math.min(walletBalance.value, grandTotal.value));
  });

  const remainingAmount = computed(() => {
    if (!useWallet.value) return grandTotal.value;
    return roundMoney(Math.max(0, grandTotal.value - walletBalance.value));
  });

  const effectivePaymentMethod = computed(() => (
    remainingAmount.value <= 0
      ? (useWallet.value && walletPayment.value > 0 ? 'wallet' : 'cod')
      : (selectedPayment.value === 'card' ? 'card' : 'cod')
  ));

  return {
    subtotalWithDiscount,
    taxableAmount,
    shippingAmount,
    taxAmount,
    grandTotal,
    walletPayment,
    remainingAmount,
    effectivePaymentMethod,
    cartPricing,
  };
}
