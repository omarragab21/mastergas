import api from '../config/axios';
import { isOwnedByCurrentCustomer } from '../domain/orders/siteOrder.js';
import { pickText } from '../utils/localeText.js';

const UNKNOWN_PRODUCT_AR = 'منتج غير محدد';
const unknownProduct = () => pickText(UNKNOWN_PRODUCT_AR, 'Unspecified product');

const unwrapList = (payload) => {
  const body = payload?.data ?? payload;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.data?.data)) return body.data.data;
  if (Array.isArray(body?.items)) return body.items;
  return [];
};

const first = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const normalizeReturnItem = (raw = {}) => ({
  ...raw,
  id: first(raw.id, raw.order_item_id, raw.orderItemId),
  orderItemId: first(raw.order_item_id, raw.orderItemId, raw.id),
  productName: first(raw.product_name, raw.product?.name, raw.order_item?.product_name, raw.order_item?.name, unknownProduct()),
  productImage: first(raw.product_image, raw.product?.image_url, raw.product?.image, raw.order_item?.image),
  quantity: Math.max(1, Number(raw.quantity) || 1),
  condition: first(raw.condition, '—'),
  reason: first(raw.reason, raw.customer_note, '—'),
  refundAmount: Number(first(raw.refund_amount, raw.refundAmount, raw.total_price, raw.order_item?.total_price, 0)) || 0,
});

export const normalizeReturn = (raw = {}) => {
  const items = (Array.isArray(raw.items) ? raw.items : Array.isArray(raw.return_items) ? raw.return_items : []).map(normalizeReturnItem);
  const firstItem = items[0];
  const itemsRefund = items.reduce((sum, item) => sum + item.refundAmount, 0);
  const named = (value) => (value && value !== UNKNOWN_PRODUCT_AR && value !== 'Unspecified product' ? value : undefined);
  return {
    ...raw,
    id: first(raw.id, raw.return_id, raw.returnId),
    returnNumber: first(raw.return_number, raw.returnNumber, raw.number, raw.id),
    orderId: first(raw.order_id, raw.order?.id),
    orderNumber: first(raw.order_number, raw.order?.order_number, raw.order?.number),
    customerName: first(raw.customer_name, raw.customer?.name, raw.user?.name, '—'),
    customerEmail: first(raw.customer_email, raw.customer?.email, raw.user?.email, '—'),
    items,
    productName: first(raw.product_name, raw.product?.name, raw.order_item?.product_name, raw.order_item?.name, named(firstItem?.productName), unknownProduct()),
    productImage: first(raw.product_image, raw.product?.image_url, raw.product?.image, raw.order_item?.image, firstItem?.productImage),
    reason: first(raw.reason, raw.customer_note, '—'),
    adminNotes: first(raw.admin_notes, raw.admin_note, raw.adminNote),
    refundAmount: Number(first(raw.refund_amount, raw.refundAmount, itemsRefund || undefined, raw.order_item?.total_price, 0)) || 0,
    status: String(first(raw.status, 'pending')).toLowerCase(),
    date: first(raw.date, raw.created_at, raw.createdAt),
  };
};

const VALID_RETURN_CONDITIONS = new Set(['unopened', 'opened', 'damaged']);

export const returnsService = {
  async listMine() {
    const response = await api.get('/v1/site/returns');
    return unwrapList(response.data)
      .filter((raw) => isOwnedByCurrentCustomer(raw))
      .map(normalizeReturn);
  },

  async getById(id) {
    const safeId = encodeURIComponent(String(id ?? '').trim());
    if (!safeId) throw new Error(pickText('رقم طلب الإرجاع غير صالح', 'Invalid return request number'));
    const response = await api.get(`/v1/site/returns/${safeId}`);
    const raw = response.data?.data ?? response.data;
    if (raw && typeof raw === 'object' && !isOwnedByCurrentCustomer(raw)) {
      const error = new Error(pickText('غير مصرح بالوصول إلى طلب الإرجاع هذا', 'You are not authorized to access this return request'));
      error.status = 403;
      throw error;
    }
    return normalizeReturn(raw);
  },

  async create(payload) {
    const orderId = payload?.order_id;
    if (!orderId) throw new Error(pickText('رقم الطلب مطلوب لإنشاء طلب الإرجاع', 'Order number is required to create a return request'));
    const safeOrderId = encodeURIComponent(String(orderId).trim());
    const rawItems = Array.isArray(payload?.items) && payload.items.length
      ? payload.items
      : [{ order_item_id: payload.order_item_id, quantity: payload.quantity || 1, condition: payload.condition || 'opened', reason: payload.reason }];
    if (!rawItems[0]?.order_item_id) throw new Error(pickText('يجب اختيار منتج من الطلب', 'Please select a product from the order'));

    // Consolidate duplicate order_item_id entries so a single request cannot bypass returnable quantity checks
    const consolidated = new Map();
    for (const item of rawItems) {
      const itemId = item?.order_item_id;
      if (!itemId) continue;
      const key = String(itemId).trim();
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const rawCondition = String(item.condition || 'opened').trim().toLowerCase();
      const condition = VALID_RETURN_CONDITIONS.has(rawCondition) ? rawCondition : 'opened';
      const itemReason = item.reason ? String(item.reason).trim().slice(0, 1000) : '';
      const existing = consolidated.get(key);
      if (existing) {
        existing.quantity += quantity;
      } else {
        consolidated.set(key, {
          order_item_id: itemId,
          quantity,
          condition,
          ...(itemReason ? { reason: itemReason } : {}),
        });
      }
    }

    const response = await api.post(`/v1/site/orders/${safeOrderId}/returns`, {
      reason: String(payload.reason || '').trim().slice(0, 1000),
      items: [...consolidated.values()],
    });
    return response.data;
  },

  async listAll() {
    const response = await api.get('/dashboard/returns');
    return unwrapList(response.data).map(normalizeReturn);
  },

  async updateStatus(id, payload) {
    const response = await api.patch(`/dashboard/returns/${id}/status`, payload);
    return response.data;
  },
};

export default returnsService;
