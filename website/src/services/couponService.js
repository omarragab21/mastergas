import api from '../config/axios';

const listFromResponse = (payload) => {
  const body = payload?.data ?? payload;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.items)) return body.items;
  return [];
};

const asNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const getLocale = () => {
  try {
    return globalThis.localStorage?.getItem('lang') === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
};

const couponMessage = (key, value) => {
  const messages = {
    ar: {
      applied: 'تم تطبيق الكوبون بنجاح',
      invalid: 'رمز الكوبون غير صالح',
      expired: 'الكوبون لم يعد صالحاً',
      minimum: `الحد الأدنى للطلب هو ${value}`,
      noDiscount: 'الكوبون لا يخصم أي قيمة من هذا الطلب',
    },
    en: {
      applied: 'Coupon applied successfully',
      invalid: 'Invalid coupon code',
      expired: 'This coupon is no longer valid',
      minimum: `Minimum order amount is ${value}`,
      noDiscount: 'This coupon does not apply a discount to this order',
    },
  };
  return messages[getLocale()][key];
};

export const couponService = {
  async validate(code, amount) {
    const normalizedCode = String(code ?? '').trim();
    const orderAmount = Math.max(0, asNumber(amount));
    const response = await api.get('/v1/discount_codes', {
      params: { code: normalizedCode },
    });
    const coupon = listFromResponse(response.data).find(
      (item) => String(item.code || '').trim().toUpperCase() === normalizedCode.toUpperCase(),
    );

    if (!coupon) {
      return { success: false, valid: false, message: couponMessage('invalid') };
    }

    const minimumAmount = asNumber(coupon.minimum_amount ?? coupon.min_order_value);
    const active = coupon.is_active !== false && coupon.is_active !== 0;
    const validNow = coupon.is_valid_now !== false;
    const remainingUses = coupon.max_uses == null || asNumber(coupon.max_uses) > asNumber(coupon.used_count);

    if (!active || !validNow || !remainingUses) {
      return { success: false, valid: false, data: coupon, message: couponMessage('expired') };
    }
    if (orderAmount < minimumAmount) {
      return {
        success: false,
        valid: false,
        data: coupon,
        message: couponMessage('minimum', minimumAmount),
      };
    }

    const value = asNumber(coupon.value);
    const rawDiscount = coupon.type === 'percentage'
      ? orderAmount * (value / 100)
      : value;
    const cappedDiscount = coupon.max_discount == null
      ? rawDiscount
      : Math.min(rawDiscount, asNumber(coupon.max_discount));

    const discount = Math.min(orderAmount, Math.max(0, cappedDiscount));
    if (discount <= 0) {
      return {
        success: false,
        valid: false,
        data: coupon,
        message: couponMessage('noDiscount'),
      };
    }

    return {
      success: true,
      valid: true,
      status: 'success',
      data: coupon,
      coupon,
      discount,
      message: couponMessage('applied'),
    };
  },
};
