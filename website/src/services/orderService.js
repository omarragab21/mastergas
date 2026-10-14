import api from '../config/axios';

export const orderService = {
  /**
   * Validate discount coupon code against current cart
   */
  async validateCoupon(code, cartTotal = 0) {
    const response = await api.post('/frontend/coupons/validate', {
      code,
      cart_total: cartTotal,
    });
    return response.data;
  },

  /**
   * Submit an order (Cash on Delivery or Wallet)
   */
  async createOrder(orderPayload, idempotencyKey = null, options = {}) {
    const headers = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
      headers['X-Checkout-Id'] = idempotencyKey;
    }
    const response = await api.post('/v1/site/orders', orderPayload, { ...options, headers });
    return response.data;
  },

  /**
   * Initiate PayTabs checkout session
   */
  async createPaytabsCheckout(payload, idempotencyKey = null, options = {}) {
    const headers = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
      headers['X-Checkout-Id'] = idempotencyKey;
    }
    const response = await api.post('/frontend/paytabs/checkout', payload, { ...options, headers });
    return response.data;
  },

  /**
   * Verify completed PayTabs order transaction
   */
  async verifyPaytabsOrder(payload, idempotencyKey = null) {
    const headers = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
      headers['X-Checkout-Id'] = idempotencyKey;
    }
    const response = await api.post('/frontend/paytabs/order', payload, { headers });
    return response.data;
  },

  /**
   * Fetch customer orders list
   */
  async getOrders(params = {}) {
    const response = await api.get('/v1/site/orders', { params });
    return response.data?.data || response.data;
  },

  /**
   * Fetch single order details / invoice
   */
  async getOrderById(id) {
    const response = await api.get(`/v1/site/orders/${id}`);
    return response.data?.data || response.data;
  },

  /**
   * Request order return
   */
  async requestReturn(returnData) {
    const response = await api.post('/frontend/returns', returnData);
    return response.data;
  },
};

export default orderService;
