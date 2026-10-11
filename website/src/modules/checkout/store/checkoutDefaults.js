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

export const defaultCitiesList = [
  { id: 1, name: 'الرياض' },
  { id: 2, name: 'جدة' },
  { id: 3, name: 'الدمام' },
  { id: 4, name: 'مكة المكرمة' },
  { id: 5, name: 'المدينة المنورة' },
  { id: 6, name: 'الخبر' },
  { id: 7, name: 'الظهران' },
  { id: 8, name: 'الأحساء' },
  { id: 9, name: 'الطائف' },
  { id: 10, name: 'بريدة' },
  { id: 11, name: 'تبوك' },
  { id: 12, name: 'خميس مشيط' },
  { id: 13, name: 'أبها' },
  { id: 14, name: 'حائل' },
  { id: 15, name: 'جازان' },
  { id: 16, name: 'نجران' },
  { id: 17, name: 'ينبع' },
  { id: 18, name: 'الجبيل' },
];

export const defaultSavedAddresses = [
  {
    id: 1,
    name: 'أحمد الحربي',
    full_name: 'أحمد الحربي',
    recipient_name: 'أحمد الحربي',
    phone: '0557654321',
    city: 'جدة',
    district: 'النعيم',
    address: 'شارع حراء، فيلا 18أ',
    city_id: 2,
    is_default: true,
  },
  {
    id: 2,
    name: 'عبدالله القحطاني',
    full_name: 'عبدالله القحطاني',
    recipient_name: 'عبدالله القحطاني',
    phone: '0501234567',
    city: 'الرياض',
    district: 'الياسمين',
    address: 'طريق الملك عبدالعزيز، شقة 4، مبنى 12',
    city_id: 1,
    is_default: false,
  },
];

export const createCustomerInfo = () => ({
  name: 'أحمد الحربي',
  phone: '0557654321',
  email: '',
  country: 'SA',
  city: 'جدة',
  region: 'منطقة مكة المكرمة',
  country_id: 1,
  city_id: 2,
  address: 'شارع حراء، فيلا 18أ',
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
