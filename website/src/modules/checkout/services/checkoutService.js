import api from '../../../config/axios';
import { authService } from '../../../services/authService';
import { couponService } from '../../../services/couponService';
import { settingsService } from '../../../services/settingsService';

const checkoutRequestOptions = (idempotencyKey) => ({
  timeout: 30_000,
  headers: {
    'Idempotency-Key': idempotencyKey,
    'X-Checkout-Id': idempotencyKey,
  },
});

export const checkoutService = {
  getUserProfile: () => authService.getUserProfile(),
  getAddresses: () => authService.getAddresses(),
  addAddress: (addressData) => authService.addAddress(addressData),
  getWallet: () => authService.getWallet(),
  getSettings: (options) => settingsService.getSettings(options),
  getCountries: (options) => settingsService.getCountries(options),
  getCities: (countryId, options) => settingsService.getCities(countryId, options),
  validateCoupon: (code, amount) => couponService.validate(code, amount),

  async getCityShippingRate(cityId) {
    const response = await api.get(`/frontend/cities/${cityId}/shipping-rate`);
    return response.data?.data || response.data;
  },

  // Both calls resolve with the full axios response: the checkout safety helpers
  // (extractCreatedOrder / extractPaymentUrl) read `response.data` and the HTTP status.
  createOrder(orderData, idempotencyKey) {
    return api.post('/frontend/orders', orderData, checkoutRequestOptions(idempotencyKey));
  },

  createPaytabsCheckout(payload, idempotencyKey) {
    return api.post('/frontend/paytabs/checkout', payload, checkoutRequestOptions(idempotencyKey));
  },
};

export default checkoutService;
