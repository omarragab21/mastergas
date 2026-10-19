import { computed, onUnmounted } from 'vue';
import settingsService from '../../../services/settingsService';
import { booleanSetting, firstSetting, numericSetting, settingsToObject, vatPercentage } from '../../../utils/siteSettings';
import { profileService } from '../../profile/services/profileService';

export function useCheckoutData({
  state,
  cartState,
  authState,
}) {
  const {
    addressTab,
    saveToMyAddresses,
    loading,
    customerInfo,
    savedAddresses,
    selectedAddressId,
    cityShippingRate,
    settings,
    walletBalance,
    freeDeliveryThreshold,
    shippingCost,
    taxRate,
  } = state;

  const displayAddresses = computed(() => savedAddresses.value || []);

  const fetchCityShippingRate = async (cityId) => {
    if (!cityId || !settings.value.enable_city_shipping) {
      cityShippingRate.value = 0;
      return;
    }

    cityShippingRate.value = settings.value.default_city_shipping_rate;
  };

  const selectAddress = (address) => {
    if (!address) return;
    selectedAddressId.value = address.id;
    customerInfo.value.name = address.recipient_name || address.full_name || address.name || customerInfo.value.name;
    customerInfo.value.phone = address.phone || customerInfo.value.phone;
    customerInfo.value.address = address.address || '';
    customerInfo.value.city = address.city?.name || address.city_name || address.city || '';
    customerInfo.value.country = address.country?.code || address.country_code || address.country?.name || address.country || 'SA';
    customerInfo.value.country_id = address.country_id ?? address.country?.id ?? 1;
    customerInfo.value.city_id = address.city_id ?? address.city?.id ?? (address.city === 'جدة' ? 2 : 1);
    customerInfo.value.notes = address.notes || '';

    if (customerInfo.value.city_id && settings.value.enable_city_shipping) {
      fetchCityShippingRate(customerInfo.value.city_id);
    }
  };

  const switchToSavedAddresses = () => {
    addressTab.value = 'saved';
    if (!selectedAddressId.value && displayAddresses.value.length > 0) {
      selectAddress(displayAddresses.value[0]);
    }
  };

  const clearAddressFields = () => {
    selectedAddressId.value = null;
    customerInfo.value = {
      ...customerInfo.value,
      name: '',
      phone: '',
      address: '',
      notes: '',
      city_id: '',
      city: '',
      region: '',
    };
  };

  const switchToOtherRecipient = () => {
    addressTab.value = 'other';
    clearAddressFields();
    saveToMyAddresses.value = false;
  };

  const switchToNewAddress = () => {
    addressTab.value = 'new';
    clearAddressFields();
    saveToMyAddresses.value = true;
  };

  const fetchUserData = async () => {
    if (!authState.token) return;

    const user = authState.user || {};
    customerInfo.value.name = user.name || '';
    customerInfo.value.phone = user.phone || '';
    customerInfo.value.email = user.email || '';
    customerInfo.value.country = 'SA';
    customerInfo.value.country_id = null;
    selectedAddressId.value = null;
    addressTab.value = 'other';

    try {
      // Checkout must use the same persisted customer addresses as the profile
      // page instead of silently falling back to an empty address list.
      savedAddresses.value = await profileService.getAddresses();
    } catch (error) {
      savedAddresses.value = [];
      console.warn('Checkout saved addresses unavailable; using manual address entry', error?.message);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await settingsService.getSettings({ ttl: 300000, retries: 1 });
      const siteSettings = settingsToObject(response);
      const threshold = firstSetting(siteSettings, 'free_delivery_threshold', 'delivery_range');
      const shipping = firstSetting(siteSettings, 'default_shipping_cost', 'shipping_cost');
      const vat = firstSetting(siteSettings, 'vat_percentage', 'tax_rate');
      const defaultCityRate = firstSetting(siteSettings, 'default_city_shipping_rate');

      settings.value.enable_city_shipping = booleanSetting(firstSetting(siteSettings, 'enable_city_shipping'));
      settings.value.use_city_specific_rates = booleanSetting(firstSetting(siteSettings, 'use_city_specific_rates'));
      settings.value.default_city_shipping_rate = numericSetting(defaultCityRate, 0);
      if (threshold !== undefined) freeDeliveryThreshold.value = numericSetting(threshold, freeDeliveryThreshold.value);
      if (shipping !== undefined) shippingCost.value = numericSetting(shipping, shippingCost.value);
      if (vat !== undefined) taxRate.value = vatPercentage(vat, taxRate.value);
    } catch (error) {
      // Keep the store defaults when the public settings endpoint is unavailable.
      console.warn('Checkout settings unavailable; using checkout defaults', error?.message);
    }
  };

  const fetchWalletBalance = async () => {
    walletBalance.value = 0;
  };

  const handlePageShow = (event) => {
    if (event.persisted) {
      cartState.syncWithToken();
      loading.value = false;
    }
  };

  onUnmounted(() => {
    window.removeEventListener('pageshow', handlePageShow);
  });

  return {
    displayAddresses,
    selectAddress,
    switchToSavedAddresses,
    switchToOtherRecipient,
    switchToNewAddress,
    fetchUserData,
    fetchSettings,
    fetchCityShippingRate,
    fetchWalletBalance,
    handlePageShow,
  };
}
