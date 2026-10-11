import api from '../../../config/axios';

const unwrap = (response) => response?.data?.data || response?.data || response;

const normalizeSettings = (value) => {
  if (Array.isArray(value)) return value;
  return Object.entries(value || {}).map(([key, settingValue]) => ({ key, value: settingValue }));
};

export const invoiceService = {
  async getSettings() {
    const response = await api.get('/frontend/settings');
    return normalizeSettings(unwrap(response));
  },

  async getOrder(orderId) {
    const response = await api.get('/frontend/orders/me');
    const raw = unwrap(response);
    const orders = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
    const found = orders.find((order) => order.id == orderId || order.order_number == orderId);
    if (found || !orderId) return found || null;

    try {
      const directResponse = await api.get(`/frontend/orders/${orderId}`);
      const directOrder = unwrap(directResponse);
      return directOrder && typeof directOrder === 'object' && !Array.isArray(directOrder)
        ? directOrder
        : null;
    } catch {
      return null;
    }
  },
};
