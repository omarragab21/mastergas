import api from '../../config/axios';
import { encodePathSegment } from '../../utils/adminSecurity';

const multipart = (payload, files = {}) => {
  const body = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((item, index) => body.append(`${key}[${index}]`, item));
    } else {
      body.append(key, value);
    }
  });
  Object.entries(files).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((file) => body.append(`${key}[]`, file));
    else if (value) body.append(key, value);
  });
  return body;
};

const json = { headers: { 'Content-Type': 'application/json' } };
const formHeaders = { headers: { 'Content-Type': 'multipart/form-data' } };

export const tijaraAdminApi = {
  listUsers: (params = {}) => api.get('/v1/users', { params }),
  createUser: (payload, image) => api.post('/v1/users', multipart(payload, { image_file: image }), formHeaders),
  updateUser: (id, payload, image) => api.put(`/v1/users/${encodePathSegment(id, 'user id')}`, multipart(payload, { image_file: image }), formHeaders),
  getUser: (id) => api.get(`/v1/users/${encodePathSegment(id, 'user id')}`),
  deleteUser: (id) => api.delete(`/v1/users/${encodePathSegment(id, 'user id')}`),

  listCategories: (params = {}) => api.get('/v1/categories', { params }),
  createCategory: (payload, image) => api.post('/v1/categories', multipart(payload, { image_file: image }), formHeaders),
  updateCategory: (id, payload, image) => api.put(`/v1/categories/${encodePathSegment(id, 'category id')}`, multipart(payload, { image_file: image }), formHeaders),
  getCategory: (id) => api.get(`/v1/categories/${encodePathSegment(id, 'category id')}`),
  deleteCategory: (id) => api.delete(`/v1/categories/${encodePathSegment(id, 'category id')}`),

  listProducts: (params = {}) => api.get('/v1/products', { params }),
  createProduct: (payload, files = []) => api.post('/v1/products', multipart(payload, { images: files }), formHeaders),
  updateProduct: (id, payload, files = []) => api.put(`/v1/products/${encodePathSegment(id, 'product id')}`, multipart(payload, { images: files }), formHeaders),
  getProduct: (id) => api.get(`/v1/products/${encodePathSegment(id, 'product id')}`),
  deleteProduct: (id) => api.delete(`/v1/products/${encodePathSegment(id, 'product id')}`),

  listAttributes: (params = {}) => api.get('/v1/attributes', { params }),
  createAttribute: (payload) => api.post('/v1/attributes', payload, json),
  updateAttribute: (id, payload) => api.put(`/v1/attributes/${encodePathSegment(id, 'attribute id')}`, payload, json),
  getAttribute: (id) => api.get(`/v1/attributes/${encodePathSegment(id, 'attribute id')}`),
  deleteAttribute: (id) => api.delete(`/v1/attributes/${encodePathSegment(id, 'attribute id')}`),
  createAttributeOption: (attributeId, payload) => api.post(`/v1/attributes/${encodePathSegment(attributeId, 'attribute id')}/options`, payload, json),
  updateAttributeOption: (attributeId, optionId, payload) => api.put(`/v1/attributes/${encodePathSegment(attributeId, 'attribute id')}/options/${encodePathSegment(optionId, 'option id')}`, payload, json),
  deleteAttributeOption: (attributeId, optionId) => api.delete(`/v1/attributes/${encodePathSegment(attributeId, 'attribute id')}/options/${encodePathSegment(optionId, 'option id')}`),

  listDiscountCodes: (params = {}) => api.get('/v1/discount_codes', { params }),
  createDiscountCode: (payload) => api.post('/v1/discount_codes', payload, json),
  updateDiscountCode: (id, payload) => api.put(`/v1/discount_codes/${encodePathSegment(id, 'discount code id')}`, payload, json),
  getDiscountCode: (id) => api.get(`/v1/discount_codes/${encodePathSegment(id, 'discount code id')}`),
  deleteDiscountCode: (id) => api.delete(`/v1/discount_codes/${encodePathSegment(id, 'discount code id')}`),

  listOffers: (params = {}) => api.get('/v1/offers', { params }),
  createOffer: (payload, image) => api.post('/v1/offers', multipart(payload, { image_file: image }), formHeaders),
  updateOffer: (id, payload, image) => api.put(`/v1/offers/${encodePathSegment(id, 'offer id')}`, multipart(payload, { image_file: image }), formHeaders),
  getOffer: (id) => api.get(`/v1/offers/${encodePathSegment(id, 'offer id')}`),
  deleteOffer: (id) => api.delete(`/v1/offers/${encodePathSegment(id, 'offer id')}`),

  listReviews: (params = {}) => api.get('/v1/reviews', { params }),
  updateReview: (id, payload) => api.patch(`/v1/reviews/${encodePathSegment(id, 'review id')}`, payload, json),
  deleteReview: (id) => api.delete(`/v1/reviews/${encodePathSegment(id, 'review id')}`),

  listContacts: (params = {}) => api.get('/v1/contacts', { params }),
  getContact: (id) => api.get(`/v1/contacts/${encodePathSegment(id, 'contact id')}`),
  deleteContact: (id) => api.delete(`/v1/contacts/${encodePathSegment(id, 'contact id')}`),

  listSliders: (params = {}) => api.get('/v1/sliders', { params }),
  createSlider: (payload, image) => api.post('/v1/sliders', multipart(payload, { image_file: image }), formHeaders),
  updateSlider: (id, payload, image) => api.put(`/v1/sliders/${encodePathSegment(id, 'slider id')}`, multipart(payload, { image_file: image }), formHeaders),
  getSlider: (id) => api.get(`/v1/sliders/${encodePathSegment(id, 'slider id')}`),
  deleteSlider: (id) => api.delete(`/v1/sliders/${encodePathSegment(id, 'slider id')}`),

  listOrders: (params = {}) => api.get('/v1/orders', { params }),
  getOrder: (id) => api.get(`/v1/orders/${encodePathSegment(id, 'order id')}`),
  updateOrder: (id, payload) => api.patch(`/v1/orders/${encodePathSegment(id, 'order id')}`, payload, json),
  deleteOrder: (id) => api.delete(`/v1/orders/${encodePathSegment(id, 'order id')}`),
};

export default tijaraAdminApi;
