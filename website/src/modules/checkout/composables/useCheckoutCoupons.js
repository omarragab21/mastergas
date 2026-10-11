export function useCheckoutCoupons({
  couponCode,
  appliedCoupon,
  discountAmount,
  couponMessage,
  couponMessageType,
  subtotalWithDiscount,
  roundMoney,
  checkoutService,
  t,
}) {
  const localizeCouponMessage = (rawMsg, isSuccess) => {
    if (!rawMsg) return isSuccess ? t('checkout.coupon_applied') : t('checkout.invalid_coupon');
    const message = rawMsg.toString().toLowerCase().trim();
    if (
      message.includes('coupon is valid') ||
      message.includes('coupon applied') ||
      message.includes('valid coupon') ||
      message.includes('success')
    ) {
      return t('checkout.coupon_applied');
    }
    if (
      message.includes('invalid') ||
      message.includes('not found') ||
      message.includes('expired') ||
      message.includes('disabled')
    ) {
      return t('checkout.invalid_coupon');
    }
    return rawMsg;
  };

  const applyCoupon = async () => {
    if (!couponCode.value) return;

    try {
      const codeClean = couponCode.value.trim();
      const response = await checkoutService.validateCoupon(codeClean, subtotalWithDiscount.value);
      const isValid = response.valid === true ||
        response.is_valid === true ||
        response.success === true ||
        response.status === 'success' ||
        response.status === true ||
        (response.data && !response.error && response.valid !== false && response.success !== false);

      if (isValid) {
        const coupon = response.data || response.coupon || { code: codeClean };
        appliedCoupon.value = coupon;

        let calculatedDiscount = parseFloat(
          response.discount || response.discount_amount || response.amount || 0
        );
        if (!calculatedDiscount && coupon.value) {
          if (coupon.type === 'percentage') {
            calculatedDiscount = subtotalWithDiscount.value * (parseFloat(coupon.value) / 100);
            if (coupon.max_discount && calculatedDiscount > parseFloat(coupon.max_discount)) {
              calculatedDiscount = parseFloat(coupon.max_discount);
            }
          } else {
            calculatedDiscount = parseFloat(coupon.value);
          }
        }
        if (!Number.isFinite(calculatedDiscount)) calculatedDiscount = 0;

        discountAmount.value = roundMoney(Math.min(
          subtotalWithDiscount.value,
          Math.max(0, calculatedDiscount)
        ));
        couponMessage.value = localizeCouponMessage(response.message, true);
        couponMessageType.value = 'success';
      } else {
        appliedCoupon.value = null;
        discountAmount.value = 0;
        couponMessage.value = localizeCouponMessage(response.message || response.error, false);
        couponMessageType.value = 'error';
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      appliedCoupon.value = null;
      discountAmount.value = 0;
      const serverMessage = error.response?.data?.message || error.response?.data?.error || error.response?.data?.data?.message;
      couponMessage.value = localizeCouponMessage(serverMessage, false);
      couponMessageType.value = 'error';
    }
  };

  const removeCoupon = () => {
    appliedCoupon.value = null;
    discountAmount.value = 0;
    couponCode.value = '';
    couponMessage.value = '';
    couponMessageType.value = '';
  };

  return { applyCoupon, removeCoupon, localizeCouponMessage };
}
