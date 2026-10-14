export const regionsList = [
  'منطقة الرياض',
  'منطقة مكة المكرمة',
  'المنطقة الشرقية',
  'منطقة المدينة المنورة',
  'منطقة القصيم',
  'منطقة عسير',
  'منطقة تبوك',
  'منطقة حائل',
  'منطقة الحدود الشمالية',
  'منطقة جازان',
  'منطقة نجران',
  'منطقة الباحة',
  'منطقة الجوف',
];

export const createCustomerInfo = () => ({
  name: '',
  phone: '',
  email: '',
  country: 'SA',
  city: '',
  region: '',
  country_id: null,
  city_id: null,
  address: '',
  building: '',
  floor: '',
  notes: '',
});

export const createNewAddressForm = () => ({
  name: '',
  full_name: '',
  city: '',
  country_id: null,
  city_id: null,
  phone: '',
  address: '',
  is_default: false,
});

export const createCheckoutSettings = () => ({
  enable_city_shipping: false,
  use_city_specific_rates: false,
  default_city_shipping_rate: 0,
});
