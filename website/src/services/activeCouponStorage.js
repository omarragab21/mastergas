import { getCustomerToken } from '../utils/customerSession.js';

const getOwnerKey = () => {
  try {
    const rawUser = localStorage.getItem('c_user') || sessionStorage.getItem('c_user');
    const user = rawUser ? JSON.parse(rawUser) : null;
    return String(user?.id || getCustomerToken() || 'guest');
  } catch {
    return String(getCustomerToken() || 'guest');
  }
};

const getStorageKey = () => `mastergas_active_coupon_${getOwnerKey()}`;

export const readActiveCoupon = () => {
  try {
    const raw = localStorage.getItem(getStorageKey());
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveActiveCoupon = ({ code, coupon, discount }) => {
  if (!code || Number(discount) <= 0) return;
  localStorage.setItem(getStorageKey(), JSON.stringify({
    code: String(code).trim(),
    coupon: coupon || { code: String(code).trim() },
    discount: Number(discount),
  }));
};

export const clearActiveCoupon = () => {
  localStorage.removeItem(getStorageKey());
};
