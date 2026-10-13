import api from '../../../config/axios';
import { getSiteOrder, listSiteOrders } from './siteOrdersApi';

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
    if (!orderId) return null;
    try {
      return await getSiteOrder(orderId);
    } catch {
      // An order number (ORD-…) is not a valid id for the show endpoint; look it up in the customer's list.
      try {
        const orders = await listSiteOrders();
        return orders.find((order) => order.id == orderId || order.order_number == orderId) || null;
      } catch {
        return null;
      }
    }
  },
};
