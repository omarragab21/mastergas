import api from '../config/axios';

export const authService = {
  /**
   * Customer login
   */
  async login(credentials) {
    const response = await api.post('/v1/login', credentials);
    return response.data;
  },

  /**
   * Customer registration
   */
  async register(userData) {
    const response = await api.post('/v1/register', userData);
    return response.data;
  },

  /**
   * Customer logout
   */
  async logout() {
    const response = await api.post('/v1/logout');
    return response.data;
  },

  /**
   * Fetch current authenticated customer profile & wallet balance
   */
  async getUserProfile() {
    const response = await api.get('/v1/site/profile');
    return response.data?.data || response.data;
  },

  /**
   * Update customer profile info
   */
  async updateProfile(profileData) {
    const response = await api.post('/v1/site/profile', profileData);
    return response.data;
  },

  /**
   * Change customer password
   */
  async changePassword(passwordData) {
    const response = await api.put('/v1/site/profile/password', passwordData);
    return response.data;
  },

  /**
   * Fetch wallet balance & transactions
   */
  async getWallet() {
    const response = await api.get('/frontend/wallet');
    return response.data?.data || response.data;
  },

  /**
   * Customer addresses
   */
  async getAddresses() {
    const response = await api.get('/v1/site/addresses');
    return response.data?.data || response.data;
  },

  async addAddress(addressData) {
    const response = await api.post('/v1/site/addresses', addressData);
    return response.data?.data || response.data;
  },

  async deleteAddress(addressId) {
    const response = await api.delete(`/v1/site/addresses/${addressId}`);
    return response.data;
  },
};

export default authService;
