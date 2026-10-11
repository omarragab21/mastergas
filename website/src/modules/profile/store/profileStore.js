import { defineStore } from 'pinia';
import { profileService } from '../services/profileService';

const normalizeNotification = (notification, { localized, formatDate }) => ({
  id: notification.id,
  title: notification.title || notification.message || localized(notification, 'title'),
  time: notification.time || (notification.created_at ? formatDate(notification.created_at) : 'اليوم'),
  is_read: !!notification.is_read,
});

export const useProfileStore = defineStore('profileFeature', {
  state: () => ({
    user: null,
    loadingData: false,
    addressesList: [],
    ordersList: [],
    notificationsList: [],
    returnsList: [],
    walletData: { balance: 0, transactions: [] },
    loadingWallet: false,
    countries: [],
    cities: [],
  }),

  getters: {
    notificationCount: (state) => state.notificationsList.filter((notification) => !notification.is_read).length,
  },

  actions: {
    async load({ fallbackAddresses = [], fallbackReturns = [], fallbackNotifications = [], localized, formatDate }) {
      this.loadingData = true;
      const [userResult, addressesResult, ordersResult, notificationsResult, returnsResult] = await Promise.allSettled([
        profileService.getUser(),
        profileService.getAddresses(),
        profileService.getOrders(),
        profileService.getNotifications(),
        profileService.getReturns(),
      ]);

      if (userResult.status === 'fulfilled') this.user = userResult.value;
      this.addressesList = addressesResult.status === 'fulfilled' && addressesResult.value.length > 0
        ? addressesResult.value
        : [...fallbackAddresses];
      this.ordersList = ordersResult.status === 'fulfilled' ? ordersResult.value : [];
      this.notificationsList = notificationsResult.status === 'fulfilled' && notificationsResult.value.length > 0
        ? notificationsResult.value.map((notification) => normalizeNotification(notification, { localized, formatDate }))
        : [...fallbackNotifications];
      this.returnsList = returnsResult.status === 'fulfilled' && returnsResult.value.length > 0
        ? returnsResult.value
        : [...fallbackReturns];
      this.loadingData = false;
      return this.user;
    },

    async fetchWallet() {
      this.loadingWallet = true;
      try {
        const payload = await profileService.getWallet();
        this.walletData = {
          balance: Number(payload.balance || 0),
          transactions: Array.isArray(payload.transactions) ? payload.transactions : [],
        };
      } finally {
        this.loadingWallet = false;
      }
    },

    getCountries() {
      return profileService.getCountries();
    },

    getCities(params) {
      return profileService.getCities(params);
    },

    getSettings() {
      return profileService.getSettings();
    },

    async fetchNotifications({ fallback = [], localized, formatDate }) {
      try {
        const notifications = await profileService.getNotifications();
        this.notificationsList = notifications.length > 0
          ? notifications.map((notification) => normalizeNotification(notification, { localized, formatDate }))
          : [...fallback];
      } catch {
        this.notificationsList = [...fallback];
      }
    },

    async markAllNotificationsRead() {
      this.notificationsList.forEach((notification) => { notification.is_read = true; });
      try {
        await profileService.markAllNotificationsRead();
      } catch {
        // The local read state remains useful when the API is unavailable.
      }
    },

    async markNotificationRead(notification) {
      if (!notification || notification.is_read) return;
      notification.is_read = true;
      try {
        await profileService.markNotificationRead(notification.id);
      } catch {
        // Keep the optimistic read state, matching the previous UI behavior.
      }
    },

    updateProfile(payload) {
      return profileService.updateProfile(payload).then((user) => {
        this.user = user;
        return user;
      });
    },

    changePassword(payload) {
      return profileService.changePassword(payload);
    },

    submitReview(payload) {
      return profileService.submitReview(payload);
    },

    createAddress(payload) {
      return profileService.createAddress(payload);
    },

    updateAddress(id, payload) {
      return profileService.updateAddress(id, payload);
    },

    deleteAddress(id) {
      return profileService.deleteAddress(id);
    },

    createReturn(payload) {
      return profileService.createReturn(payload);
    },
  },
});
