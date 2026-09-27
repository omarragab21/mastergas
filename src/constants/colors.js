/**
 * Shared color mapping and utility functions for product attributes, swatches, and cart variants.
 */

export const colorMap = {
  'أحمر': '#ef4444',
  'red': '#ef4444',
  'أزرق': '#3b82f6',
  'blue': '#3b82f6',
  'أخضر': '#10b981',
  'green': '#10b981',
  'أسود': '#111827',
  'black': '#111827',
  'أبيض': '#ffffff',
  'white': '#ffffff',
  'وردي': '#ec4899',
  'pink': '#ec4899',
  'ذهبي': '#f59e0b',
  'gold': '#f59e0b',
  'فضي': '#9ca3af',
  'silver': '#9ca3af',
  'ستانلس ستيل': '#d1d5db',
  'ستانلس': '#d1d5db',
  'stainless': '#d1d5db',
  'رمادي': '#6b7280',
  'gray': '#6b7280',
  'grey': '#6b7280',
  'برتقالي': '#f97316',
  'orange': '#f97316',
  'أصفر': '#eab308',
  'yellow': '#eab308',
  'بني': '#92400e',
  'brown': '#92400e',
  'بيج': '#f5f5dc',
  'beige': '#f5f5dc',
  'نحاسي': '#b87333',
  'copper': '#b87333',
  'بنفسجي': '#8b5cf6',
  'purple': '#8b5cf6',
};

export const getPresetColorHex = (label) => {
  if (!label) return '#6b7280';
  if (label.startsWith('#')) return label;
  const l = label.toLowerCase().trim();
  return colorMap[l] || '#6b7280';
};

export const getActualColor = (colorName) => {
  if (!colorName) return 'transparent';
  if (colorName.startsWith('#')) return colorName;
  return colorMap[colorName.trim().toLowerCase()] || colorMap[colorName.trim()] || colorName;
};

export const isLightColor = (hex) => {
  if (!hex || typeof hex !== 'string') return false;
  if (hex === '#ffffff' || hex.toLowerCase() === 'white' || hex === 'أبيض') return true;
  if (hex.startsWith('#') && hex.length === 7) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.75;
  }
  return false;
};
