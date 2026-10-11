import { cartState as legacyCartState } from '../../../store/cart';
import { couponService } from '../../../services/couponService';

/**
 * Cart feature gateway.
 * The legacy cart state remains the single persistence boundary so existing
 * product, checkout, wishlist, and payment flows keep the same behavior.
 */
export const cartService = {
  refreshItems() {
    return legacyCartState.refreshCartItems();
  },

  validateCoupon(code, subtotal) {
    return couponService.validate(code, subtotal);
  },
};
