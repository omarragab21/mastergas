import api from '../../../config/axios';
import { toSiteOrderPayload } from '../../../domain/orders/siteOrder';

const checkoutRequestOptions = (idempotencyKey) => ({
  timeout: 30_000,
  headers: {
    'Idempotency-Key': idempotencyKey,
    'X-Checkout-Id': idempotencyKey,
  },
});

export const checkoutService = {
  validateCoupon: async () => ({
    valid: false,
    message: 'Coupons are not available in the Site API.',
  }),

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
