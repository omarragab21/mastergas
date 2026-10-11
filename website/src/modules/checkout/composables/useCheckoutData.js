import { computed, onUnmounted, watch } from 'vue';
import { defaultCitiesList, defaultSavedAddresses } from '../store/checkoutDefaults';

export function useCheckoutData({
  state,
  cartState,
  authState,
  checkoutService,
}) {
  const {
    addressTab,
    saveToMyAddresses,
    loading,
    customerInfo,
    newAddrForm,
    savedAddresses,
    selectedAddressId,
    countries,
    cities,
    cityShippingRate,
    settings,
    walletBalance,
    freeDeliveryThreshold,
    shippingCost,
    taxRate,
  } = state;

  const citiesList = computed(() => (
    cities.value?.length > 0 ? cities.value : defaultCitiesList
  ));

  const displayAddresses = computed(() => (
    savedAddresses.value?.length > 0 ? savedAddresses.value : defaultSavedAddresses
  ));

  let citiesRequestId = 0;
  let shippingRateRequestId = 0;

  const fetchCityShippingRate = async (cityId) => {
    const requestId = ++shippingRateRequestId;
    if (!cityId || !settings.value.enable_city_shipping) {
      cityShippingRate.value = 0;
      return;
    }

    cityShippingRate.value = 0;
    try {
      const city = await checkoutService.getCityShippingRate(cityId);
      if (requestId !== shippingRateRequestId) return;
      if (city?.shipping_rate?.is_active) {
        cityShippingRate.value = Number(city.shipping_rate.shipping_cost) || 0;
      } else {
        cityShippingRate.value = settings.value.default_city_shipping_rate;
      }
    } catch (error) {
      if (requestId !== shippingRateRequestId) return;
      console.error('Failed to fetch city shipping rate', error);
      cityShippingRate.value = settings.value.default_city_shipping_rate;
    }
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

  const onCityChange = () => {
    const chosen = citiesList.value.find(city => String(city.id) === String(customerInfo.value.city_id));
    if (!chosen) return;
    customerInfo.value.city = chosen.name;
    if (settings.value.enable_city_shipping) fetchCityShippingRate(chosen.id);
  };

  const fetchUserData = async () => {
    if (!authState.token) return;

    try {
      const [user, fetchedAddresses] = await Promise.all([
        checkoutService.getUserProfile(),
        checkoutService.getAddresses(),
      ]);
      customerInfo.value.name = user.name || '';
      customerInfo.value.phone = user.phone || '';
      customerInfo.value.email = user.email || '';

      if (fetchedAddresses.length > 0) {
        savedAddresses.value = fetchedAddresses;
        selectAddress(savedAddresses.value.find(address => address.is_default) || savedAddresses.value[0]);
      } else {
        savedAddresses.value = [...defaultSavedAddresses];
        selectAddress(defaultSavedAddresses[0]);
      }
    } catch (error) {
      console.error('Failed to pre-fill user data', error);
      savedAddresses.value = [...defaultSavedAddresses];
      selectAddress(defaultSavedAddresses[0]);
    }
  };

  const fetchSettings = async () => {
    try {
      const rawSettings = await checkoutService.getSettings();
      const settingsData = Array.isArray(rawSettings)
        ? rawSettings
        : Object.entries(rawSettings || {}).map(([key, value]) => ({ key, value }));
      const getValue = (key) => settingsData.find(setting => setting.key === key)?.value;
      const threshold = getValue('free_delivery_threshold');
      const shipping = getValue('shipping_cost');
      const tax = getValue('tax_rate');
      const enableCityShipping = getValue('enable_city_shipping');
      const useCitySpecificRates = getValue('use_city_specific_rates');
      const defaultCityShippingRate = getValue('default_city_shipping_rate');

      if (threshold !== undefined && threshold !== null && threshold !== '') freeDeliveryThreshold.value = Math.max(0, parseFloat(threshold) || 0);
      if (shipping !== undefined && shipping !== null && shipping !== '') shippingCost.value = Math.max(0, parseFloat(shipping) || 0);
      if (tax !== undefined && tax !== null && tax !== '') taxRate.value = Math.max(0, parseFloat(tax) || 0);
      settings.value.enable_city_shipping = enableCityShipping === '1' || enableCityShipping === true;
      settings.value.use_city_specific_rates = useCitySpecificRates === '1' || useCitySpecificRates === true;
      settings.value.default_city_shipping_rate = Math.max(0, parseFloat(defaultCityShippingRate) || 0);
    } catch (error) {
      console.error('Failed to fetch checkout settings', error);
    }
  };

  const fetchCities = async (countryId = null) => {
    const requestId = ++citiesRequestId;
    try {
      const fetchedCities = await checkoutService.getCities(countryId);
      if (requestId !== citiesRequestId) return;
      cities.value = fetchedCities;
      const riyadh = cities.value.find(city => (
        (city.name || '').includes('رياض') ||
        (city.name || '').toLowerCase().includes('riyadh') ||
        (city.name_ar || '').includes('رياض')
      )) || cities.value[0];
      if (!riyadh) return;

      if (!customerInfo.value.city_id) {
        customerInfo.value.city_id = riyadh.id;
        customerInfo.value.city = riyadh.name || riyadh.name_ar || 'الرياض';
        if (settings.value.enable_city_shipping) fetchCityShippingRate(riyadh.id);
      }
      if (!newAddrForm.value.city_id) {
        newAddrForm.value.city_id = riyadh.id;
        newAddrForm.value.city = riyadh.name || riyadh.name_ar || 'الرياض';
      }
    } catch (error) {
      if (requestId !== citiesRequestId) return;
      console.error('Failed to fetch cities', error);
    }
  };

  const fetchCountries = async () => {
    try {
      countries.value = await checkoutService.getCountries();
      const saudi = countries.value.find(country => (
        country.name?.includes('سعودي') || country.name?.includes('Saudi') || country.code === 'SA'
      )) || countries.value[0];
      if (saudi) {
        customerInfo.value.country_id = saudi.id;
        newAddrForm.value.country_id = saudi.id;
        await fetchCities(saudi.id);
      } else {
        await fetchCities();
      }
    } catch (error) {
      console.error('Failed to fetch countries', error);
    }
  };

  const handleCustomerCountryChange = async () => {
    customerInfo.value.city_id = null;
    customerInfo.value.city = '';
    cityShippingRate.value = 0;
    shippingRateRequestId += 1;
    await fetchCities(customerInfo.value.country_id);
  };

  const handleNewAddressCountryChange = async () => {
    newAddrForm.value.city_id = null;
    newAddrForm.value.city = '';
    await fetchCities(newAddrForm.value.country_id);
  };

  const fetchWalletBalance = async () => {
    if (!authState.token) {
      walletBalance.value = 500;
      return;
    }
    try {
      const wallet = await checkoutService.getWallet();
      walletBalance.value = Math.max(0, Number(wallet.balance) || 500);
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      walletBalance.value = 500;
    }
  };

  const handlePageShow = (event) => {
    if (event.persisted) {
      cartState.syncWithToken();
      loading.value = false;
    }
  };

  watch(() => customerInfo.value.city_id, (newCityId) => {
    const selectedCity = cities.value.find(city => String(city.id) === String(newCityId));
    if (selectedCity) customerInfo.value.city = selectedCity.name || selectedCity.name_ar || '';
    if (newCityId && settings.value.enable_city_shipping) {
      fetchCityShippingRate(newCityId);
    } else if (!newCityId) {
      cityShippingRate.value = 0;
    }
  });

  watch(() => newAddrForm.value.city_id, (newCityId) => {
    const selectedCity = cities.value.find(city => String(city.id) === String(newCityId));
    if (selectedCity) newAddrForm.value.city = selectedCity.name || selectedCity.name_ar || '';
  });

  watch(() => customerInfo.value.country_id, (newCountryId) => {
    const selectedCountry = countries.value.find(country => String(country.id) === String(newCountryId));
    if (selectedCountry) {
      customerInfo.value.country = selectedCountry.code || selectedCountry.iso_code || selectedCountry.name || 'JO';
    }
  });

  onUnmounted(() => {
    window.removeEventListener('pageshow', handlePageShow);
  });

  return {
    citiesList,
    displayAddresses,
    selectAddress,
    switchToSavedAddresses,
    switchToOtherRecipient,
    switchToNewAddress,
    onCityChange,
    fetchUserData,
    fetchSettings,
    fetchCountries,
    fetchCities,
    fetchCityShippingRate,
    fetchWalletBalance,
    handleCustomerCountryChange,
    handleNewAddressCountryChange,
    handlePageShow,
  };
}
