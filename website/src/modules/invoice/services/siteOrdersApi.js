import api from '../../../config/axios';
import { isOwnedByCurrentCustomer, toSiteOrder } from '../../../domain/orders/siteOrder';

const MAX_PAGES = 20;

export const listSiteOrders = async () => {
  const first = await api.get('/v1/site/orders', { params: { page: 1 } });
  const orders = [...(first.data?.data || [])];
  const lastPage = Math.min(Number(first.data?.meta?.last_page) || 1, MAX_PAGES);
  for (let page = 2; page <= lastPage; page += 1) {
    const next = await api.get('/v1/site/orders', { params: { page } });
    orders.push(...(next.data?.data || []));
  }
  return orders.filter((raw) => isOwnedByCurrentCustomer(raw)).map(toSiteOrder);
};

export const getSiteOrder = async (id) => {
  const safeId = encodeURIComponent(String(id ?? '').trim());
  if (!safeId) return null;
  const response = await api.get(`/v1/site/orders/${safeId}`);
  const data = response.data?.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  if (!isOwnedByCurrentCustomer(data)) return null;
  return toSiteOrder(data);
};
