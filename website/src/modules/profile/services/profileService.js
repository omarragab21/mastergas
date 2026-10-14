import api from '../../../config/axios';
import returnsService from '../../../services/returnsService';
import { listSiteOrders } from '../../invoice/services/siteOrdersApi';
import { authState } from '../../../store/auth';

const unwrap = (response) => response?.data?.data || response?.data || response;
export const profileService = {
  async getUser() {
    return authState.user;
  },

  async getAddresses() {
    return [];
  },

  async getOrders() {
    return listSiteOrders();
  },

  async getNotifications() {
    return [];
  },

  async getReturns() {
    return [];
  },

  createReturn(payload) {
    return returnsService.create(payload);
  },

  async getWallet() {
    return { balance: 0, transactions: [] };
  },

  async getSettings() {
    return [];
  },

  async getCountries() {
    return [];
  },

  async getCities(params = {}) {
    return [];
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
