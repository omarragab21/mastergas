import api from '../../../config/axios';

export const paymentService = {
  verifyPaytabsOrder(payload, config) {
    return api.post('/frontend/paytabs/order', payload, config);
  },

  createFallbackOrder(payload, config) {
    return api.post('/frontend/orders', payload, config);
  },
};

