import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { cartState as legacyCartState } from '../../../store/cart';
import { cartService } from '../services/cartService';

export const useCartStore = defineStore('cartFeature', () => {
  const items = computed({
    get: () => legacyCartState.items,
    set: (value) => { legacyCartState.items = value; },
  });
  const showModal = computed(() => legacyCartState.showModal);
  const couponCode = ref('');
  const couponLoading = ref(false);
  const couponMessage = ref('');
  const couponMessageType = ref('');
  const appliedCoupon = ref(null);
  const discountAmount = ref(0);

  const removeItem = (identifier) => legacyCartState.removeFromCart(identifier);
  const updateQuantity = (identifier, quantity) => legacyCartState.updateQuantity(identifier, quantity);

  const applyCoupon = async ({ code = couponCode.value, subtotal = 0, translate }) => {
    const normalizedCode = String(code || '').trim();
    if (!normalizedCode) return false;

    couponCode.value = normalizedCode;
    couponLoading.value = true;
    couponMessage.value = '';

    const fallback = (key, value) => (typeof translate === 'function' ? translate(key, value) : value);

    try {
      const response = await cartService.validateCoupon(normalizedCode, subtotal);
      const discount = Number(response.discount);
      const hasAppliedDiscount = Number.isFinite(discount) && discount > 0;
      if ((response.success || response.valid || response.status === 'success') && hasAppliedDiscount) {
        appliedCoupon.value = response.data || { code: normalizedCode };
        discountAmount.value = discount;
        couponMessage.value = response.message || fallback('cart.coupon_applied_success', 'تم تطبيق الكوبون بنجاح');
        couponMessageType.value = 'success';
        return true;
      }

      appliedCoupon.value = null;
      discountAmount.value = 0;
      couponMessage.value = response.message || fallback('cart.coupon_invalid', 'رمز الكوبون غير صالح');
      couponMessageType.value = 'error';
      return false;
    } catch (error) {
      appliedCoupon.value = null;
      discountAmount.value = 0;
      couponMessage.value = error.response?.data?.message || fallback('cart.coupon_invalid', 'رمز الكوبون غير صالح');
      couponMessageType.value = 'error';
      return false;
    } finally {
      couponLoading.value = false;
    }
  };

  const initialize = () => cartService.refreshItems();

  return {
    items,
    showModal,
    couponCode,
    couponLoading,
    couponMessage,
    couponMessageType,
    appliedCoupon,
    discountAmount,
    removeItem,
    updateQuantity,
    applyCoupon,
    initialize,
  };
});
