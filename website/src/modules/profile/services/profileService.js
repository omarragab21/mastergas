import api from '../../../config/axios';
import returnsService from '../../../services/returnsService';

const unwrap = (response) => response?.data?.data || response?.data || response;
const unwrapList = (response) => {
  const value = unwrap(response);
  return Array.isArray(value) ? value : (Array.isArray(value?.data) ? value.data : []);
};

export const profileService = {
  async getUser() {
    return unwrap(await api.get('/frontend/user'));
  },

  async getAddresses() {
    return unwrapList(await api.get('/frontend/addresses'));
  },

  async getOrders() {
    return unwrapList(await api.get('/frontend/orders/me'));
  },

  async getNotifications() {
    return unwrapList(await api.get('/frontend/notifications'));
  },

  async getReturns() {
    return returnsService.listMine();
  },

  createReturn(payload) {
    return returnsService.create(payload);
  },

  async getWallet() {
    return unwrap(await api.get('/frontend/wallet', { timeout: 8000 })) || {};
  },

  async getSettings() {
    return unwrapList(await api.get('/frontend/settings'));
  },

  async getCountries() {
    return unwrapList(await api.get('/frontend/countries'));
  },

  async getCities(params = {}) {
    return unwrapList(await api.get('/frontend/cities', { params }));
  },

  updateProfile(payload) {
    return api.put('/frontend/profile', payload).then(unwrap);
  },

  changePassword(payload) {
    return api.post('/frontend/change-password', payload);
  },

  submitReview(payload) {
    return api.post('/frontend/reviews', payload);
  },

  createAddress(payload) {
    return api.post('/frontend/addresses', payload);
  },

  updateAddress(id, payload) {
    return api.put(`/frontend/addresses/${id}`, payload);
  },

  deleteAddress(id) {
    return api.delete(`/frontend/addresses/${id}`);
  },

  markAllNotificationsRead() {
    return api.post('/frontend/notifications/mark-all-read');
  },

  markNotificationRead(id) {
    return api.post(`/frontend/notifications/${id}/read`);
  },
};
