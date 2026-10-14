import api from '../../../config/axios';
import { toSiteOrderPayload } from '../../../domain/orders/siteOrder';
import { couponService } from '../../../services/couponService';

const checkoutRequestOptions = (idempotencyKey) => ({
  timeout: 30_000,
  headers: {
    'Idempotency-Key': idempotencyKey,
    'X-Checkout-Id': idempotencyKey,
  },
});

export const checkoutService = {
  validateCoupon: (code, amount) => couponService.validate(code, amount),

  // Both calls resolve with the full axios response: the checkout safety helpers
  // (extractCreatedOrder / extractPaymentUrl) read `response.data` and the HTTP status.
  async createOrder(orderData, idempotencyKey) {
    return api.post('/v1/site/orders', toSiteOrderPayload(orderData), checkoutRequestOptions(idempotencyKey));
  },

  createPaytabsCheckout(payload, idempotencyKey) {
    return api.post('/frontend/paytabs/checkout', payload, checkoutRequestOptions(idempotencyKey));
  },
};

export default checkoutService;
