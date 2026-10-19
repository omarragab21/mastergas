import api from '../../../config/axios';
import returnsService from '../../../services/returnsService';
import settingsService from '../../../services/settingsService';
import { listSiteOrders } from '../../invoice/services/siteOrdersApi';
import { authState } from '../../../store/auth';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

const unwrapList = (response) => {
  const body = response?.data ?? response;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.data?.data)) return body.data.data;
  if (Array.isArray(body?.items)) return body.items;
  return [];
};

const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const normalizeAddress = (address = {}) => ({
  ...address,
  name: firstValue(address.name, address.full_name, address.recipient_name, ''),
  full_name: firstValue(address.full_name, address.name, address.recipient_name, ''),
  phone: firstValue(address.phone, address.phone_number, ''),
  phone_number: firstValue(address.phone_number, address.phone, ''),
  region: firstValue(address.region, address.area, ''),
  area: firstValue(address.area, address.region, ''),
});

const toAddressPayload = (address = {}) => {
  const payload = {
    name: firstValue(address.name, address.full_name, address.recipient_name),
    phone_number: firstValue(address.phone_number, address.phone),
    city: typeof address.city === 'object' ? firstValue(address.city.name, address.city.name_ar, address.city.name_en) : address.city,
    area: firstValue(address.area, address.region),
    address: address.address,
    notes: address.notes,
    is_default: Boolean(address.is_default),
  };
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined && value !== null));
};

const toProfilePayload = (profile = {}) => {
  const payload = {
    name: firstValue(profile.name, profile.full_name),
    phone_number: firstValue(profile.phone_number, profile.phone),
  };
  if (firstValue(profile.email)) payload.email = profile.email;
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined && value !== null));
};

export const profileService = {
  async getUser() {
    const response = await api.get('/v1/site/profile');
    return unwrap(response);
  },

  async getAddresses() {
    const response = await api.get('/v1/site/addresses');
    return unwrapList(response).map(normalizeAddress);
  },

  async getOrders() {
    return listSiteOrders();
  },

  async getNotifications() {
    return [];
  },

  async getReturns() {
    return returnsService.listMine();
  },

  createReturn(payload) {
    return returnsService.create(payload);
  },

  async getSettings() {
    const data = await settingsService.getSettings();
    return Array.isArray(data) ? data : Object.entries(data || {}).map(([key, value]) => ({ key, value }));
  },

  async getCountries() {
    return [];
  },

  async getCities(params = {}) {
    return [];
  },

  updateProfile(payload) {
    return api.post('/v1/site/profile', toProfilePayload(payload)).then(unwrap);
  },

  changePassword(payload) {
    return api.put('/v1/site/profile/password', payload).then(unwrap);
  },

  submitReview(payload) {
    return api.post('/v1/site/reviews', payload);
  },

  createAddress(payload) {
    return api.post('/v1/site/addresses', toAddressPayload(payload)).then((response) => normalizeAddress(unwrap(response)));
  },

  updateAddress(id, payload) {
    return api.put(`/v1/site/addresses/${encodeURIComponent(String(id))}`, toAddressPayload(payload)).then((response) => normalizeAddress(unwrap(response)));
  },

  setDefaultAddress(id) {
    return api.patch(`/v1/site/addresses/${encodeURIComponent(String(id))}/set-default`).then((response) => normalizeAddress(unwrap(response)));
  },

  deleteAddress(id) {
    return api.delete(`/v1/site/addresses/${encodeURIComponent(String(id))}`);
  },

  markAllNotificationsRead() {
    return api.post('/frontend/notifications/mark-all-read');
  },

  markNotificationRead(id) {
    return api.post(`/frontend/notifications/${id}/read`);
  },
};
