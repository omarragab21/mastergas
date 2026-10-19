const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const hasValue = (value) => value !== undefined && value !== null && value !== '';

const SOCIAL_KEYS = ['whatsapp', 'facebook', 'instagram', 'x_twitter', 'linkedin', 'youtube', 'snapchat', 'tiktok'];

const unwrapSettingsPayload = (data) => {
  if (Array.isArray(data)) return data;
  if (!isObject(data)) return {};

  // The site endpoint has returned both { data: {...} } and
  // { data: { settings: [...] } } over time. Keep accepting the flat
  // response too, since it is the shape used by the current API.
  if (data.settings !== undefined) return unwrapSettingsPayload(data.settings);
  if (data.data && (Array.isArray(data.data) || isObject(data.data))) {
    const hasSettingFields = Object.keys(data).some((key) => key !== 'data' && key !== 'status' && key !== 'message');
    if (!hasSettingFields) return unwrapSettingsPayload(data.data);
  }

  return data;
};

const parseSocialLinks = (value) => {
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return {};
    }
  }
  if (Array.isArray(value)) {
    return value.reduce((links, item) => {
      if (item?.key) links[item.key] = item.value;
      return links;
    }, {});
  }
  return isObject(value) ? value : {};
};

export const settingsToObject = (data) => {
  const payload = unwrapSettingsPayload(data);
  const source = Array.isArray(payload)
    ? payload.reduce((accumulator, item) => {
      if (item?.key) accumulator[item.key] = item.value;
      return accumulator;
    }, {})
    : { ...payload };

  const socialLinks = parseSocialLinks(source.social_links);

  Object.entries(socialLinks).forEach(([key, value]) => {
    // Some Site API responses include the same social keys as null alongside
    // the real nested `social_links` JSON. Treat null/empty flat fields as
    // missing so the dashboard value can flow through to the storefront.
    if (!hasValue(source[key]) && hasValue(value)) source[key] = value;
  });

  // The dashboard historically called X/Twitter by either name. Expose the
  // canonical field on the website regardless of which one the API returns.
  if (!hasValue(source.x_twitter) && hasValue(source.twitter)) source.x_twitter = source.twitter;
  if (!hasValue(source.x_twitter) && hasValue(source.x_link)) source.x_twitter = source.x_link;
  if (!hasValue(source.twitter) && hasValue(source.x_twitter)) source.twitter = source.x_twitter;
  if (!hasValue(source.x_link) && hasValue(source.x_twitter)) source.x_link = source.x_twitter;

  // Always expose the social map in the same normalized shape as the
  // dashboard, even when the API returns it as [] or a JSON string.
  source.social_links = SOCIAL_KEYS.reduce((links, key) => {
    if (hasValue(source[key])) links[key] = source[key];
    return links;
  }, {});

  return source;
};

export const firstSetting = (settings, ...keys) => {
  const source = settingsToObject(settings);
  return keys.map((key) => source[key]).find(hasValue);
};

export const numericSetting = (value, fallback = 0) => {
  if (!hasValue(value)) return fallback;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
};

// The Tijara backend stores vat_percentage as a percentage (14 means 14%) and
// computes order tax as subtotal * vat_percentage / 100. Treating values <= 1
// as a fraction showed 14% in the cart while the server charged 0.14%.
export const vatPercentage = (value, fallback = 0) => numericSetting(value, fallback);

export const booleanSetting = (value) => value === true || value === 1 || value === '1' || value === 'true';
