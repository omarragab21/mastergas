import api from '../../../config/axios';
import { toSiteOrder } from '../../../domain/orders/siteOrder';

const MAX_PAGES = 20;

export const listSiteOrders = async () => {
  const first = await api.get('/v1/site/orders', { params: { page: 1 } });
  const orders = [...(first.data?.data || [])];
  const lastPage = Math.min(Number(first.data?.meta?.last_page) || 1, MAX_PAGES);
  for (let page = 2; page <= lastPage; page += 1) {
    const next = await api.get('/v1/site/orders', { params: { page } });
    orders.push(...(next.data?.data || []));
  }
  return orders.map(toSiteOrder);
};

export const getSiteOrder = async (id) => {
  const response = await api.get(`/v1/site/orders/${id}`);
  const data = response.data?.data;
  return data && typeof data === 'object' && !Array.isArray(data) ? toSiteOrder(data) : null;
};
