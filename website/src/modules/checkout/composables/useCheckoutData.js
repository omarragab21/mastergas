import { computed, onUnmounted } from 'vue';

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
    savedAddresses.value = [];
    selectedAddressId.value = null;
    addressTab.value = 'other';
  };

  const fetchSettings = async () => {
    // The Site collection has no settings endpoint. Keep only the rules
    // required to build the Site order payload.
    settings.value.enable_city_shipping = false;
    settings.value.use_city_specific_rates = false;
    settings.value.default_city_shipping_rate = 0;
    freeDeliveryThreshold.value = 500;
    shippingCost.value = 15;
    taxRate.value = 0;
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
