import { getPresetColorHex, normalizeHexColor } from '../../constants/colors.js';
import { isColorAttribute } from '../../utils/productAttributes.js';

// Selectable product options ("المواصفات العامة": color, size, energy type…).
//
// The site API returns them per product as
//   attributes: { "<group name>": [{ id, name, value_code }, …], … }
// with group and option names already translated to the request language, so
// the keys differ between Arabic and English. Option ids are the only stable
// identity: groups are keyed by their option ids and selections store ids,
// with both languages' labels kept alongside for display.

const HEX_CODE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const toOption = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const id = Number(value.id);
  const name = String(value.name ?? '').trim();
  if (!Number.isFinite(id) || !name) return null;
  return { id, name, value_code: value.value_code ?? null };
};

const groupKeyOf = (options) => options.map((option) => option.id).sort((a, b) => a - b).join('-');

/**
 * Selectable option groups of a product, in API order:
 * [{ key, name, isColor, options: [{ id, name, value_code, hex }] }]
 * Legacy text specs (strings instead of { id, name }) are not selectable.
 */
export const extractOptionGroups = (product) => {
  const attributes = product?.attributes;
  if (!attributes || typeof attributes !== 'object' || Array.isArray(attributes)) return [];

  return Object.entries(attributes).map(([name, values]) => {
    const options = (Array.isArray(values) ? values : []).map(toOption).filter(Boolean);
    if (!options.length) return null;
    const isColor = options.every((option) => HEX_CODE.test(String(option.value_code ?? '')))
      || isColorAttribute({ name });
    return {
      key: groupKeyOf(options),
      name: String(name).trim(),
      isColor,
      options: options.map((option) => ({
        ...option,
        hex: isColor ? (normalizeHexColor(option.value_code) || getPresetColorHex(option.name) || null) : null,
      })),
    };
  }).filter(Boolean);
};

/**
 * Adds both languages' names to each group and option, matched by option id:
 * name_i18n: { ar, en }. `other` is the same product fetched in the other language.
 */
export const withBilingualLabels = (groups, otherGroups, lang) => {
  const otherLang = lang === 'ar' ? 'en' : 'ar';
  const otherOptionNames = new Map();
  const otherGroupNames = new Map();
  (otherGroups || []).forEach((group) => {
    otherGroupNames.set(group.key, group.name);
    group.options.forEach((option) => otherOptionNames.set(option.id, option.name));
  });

  return groups.map((group) => ({
    ...group,
    name_i18n: { [lang]: group.name, [otherLang]: otherGroupNames.get(group.key) || group.name },
    options: group.options.map((option) => ({
      ...option,
      name_i18n: { [lang]: option.name, [otherLang]: otherOptionNames.get(option.id) || option.name },
    })),
  }));
};

/** The first option of every group: a product is always added with a full choice. */
export const defaultOptionSelection = (groups) => Object.fromEntries(
  groups.map((group) => [group.key, group.options[0].id]),
);

/** Keeps valid choices, falls back to the first option for anything missing. */
export const completeOptionSelection = (groups, selection = {}) => Object.fromEntries(
  groups.map((group) => {
    const chosen = Number(selection[group.key]);
    const valid = group.options.some((option) => option.id === chosen);
    return [group.key, valid ? chosen : group.options[0].id];
  }),
);

/**
 * What a cart line stores: [{ id, group: { ar, en }, name: { ar, en }, value_code, hex }].
 */
export const buildSelectedOptions = (groups, selection) => groups.map((group) => {
  const option = group.options.find((item) => item.id === Number(selection[group.key]));
  if (!option) return null;
  return {
    id: option.id,
    group: group.name_i18n || { ar: group.name, en: group.name },
    name: option.name_i18n || { ar: option.name, en: option.name },
    value_code: option.value_code,
    hex: option.hex,
  };
}).filter(Boolean);

const pickLang = (value, lang) => {
  if (value && typeof value === 'object') return value[lang] || value.ar || value.en || '';
  return String(value ?? '');
};

/** Display rows for a cart line in the current language: [{ id, group, name, hex }]. */
export const describeSelectedOptions = (selectedOptions, lang) => (
  (Array.isArray(selectedOptions) ? selectedOptions : []).map((option) => ({
    id: option.id,
    group: pickLang(option.group, lang),
    name: pickLang(option.name, lang),
    hex: option.hex || null,
  })).filter((option) => option.name)
);

export const selectedOptionIds = (selectedOptions) => (
  (Array.isArray(selectedOptions) ? selectedOptions : [])
    .map((option) => Number(option.id))
    .filter(Number.isFinite)
);
