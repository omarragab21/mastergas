// Picks the Arabic or English text for code that runs outside Vue components
// (services, stores, domain helpers) without importing the i18n instance.
export const currentLang = () => {
  try {
    return globalThis.localStorage?.getItem('lang') === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
};

export const pickText = (ar, en) => (currentLang() === 'en' ? en : ar);
