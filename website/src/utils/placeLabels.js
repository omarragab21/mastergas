// English display names for the Arabic city/region values used by the address
// forms. The Arabic value stays the stored value; only the label is translated.
const PLACE_LABELS_EN = {
  'الرياض': 'Riyadh',
  'جدة': 'Jeddah',
  'مكة المكرمة': 'Makkah',
  'المدينة المنورة': 'Madinah',
  'الدمام': 'Dammam',
  'الخبر': 'Khobar',
  'القصيم': 'Qassim',
  'أبها': 'Abha',
  'تبوك': 'Tabuk',
  'حائل': 'Hail',
  'الطائف': 'Taif',
  'منطقة الرياض': 'Riyadh Region',
  'منطقة مكة المكرمة': 'Makkah Region',
  'المنطقة الشرقية': 'Eastern Province',
  'منطقة المدينة المنورة': 'Madinah Region',
  'منطقة القصيم': 'Qassim Region',
  'منطقة عسير': 'Asir Region',
  'منطقة تبوك': 'Tabuk Region',
  'منطقة حائل': 'Hail Region',
  'منطقة الحدود الشمالية': 'Northern Borders Region',
  'منطقة جازان': 'Jazan Region',
  'منطقة نجران': 'Najran Region',
  'منطقة الباحة': 'Al-Baha Region',
  'منطقة الجوف': 'Al-Jouf Region',
};

export const placeLabel = (name, lang) => (lang === 'ar' ? name : (PLACE_LABELS_EN[name] || name));
