const colorMap = {
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
  'purple': '#8b5cf6'
};

const getActualColor = (colorName) => {
  if (!colorName) return 'transparent';
  if (colorName.startsWith('#')) return colorName;
  return colorMap[colorName.trim().toLowerCase()] || colorMap[colorName.trim()] || colorName;
};

export function useProductVisuals(colorOptions) {
  const isLightColor = (hex) => {
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

  const isColorSpec = (label) => {
    if (!label) return false;
    const l = String(label).toLowerCase();
    return l.includes('اللون') || l.includes('color');
  };

  const getSpecColorHex = (value) => {
    if (!value) return '#18181B';
    const val = String(value).toLowerCase();
    const opt = colorOptions.value?.find(c =>
      val.includes(String(c.label || '').toLowerCase()) ||
      val.includes(String(c.name || '').toLowerCase())
    );
    if (opt && opt.hex) return opt.hex;
    if (val.includes('ستانلس') || val.includes('فضي') || val.includes('stainless') || val.includes('silver') || val.includes('كروم') || val.includes('chrome')) return '#94A3B8';
    if (val.includes('أسود') || val.includes('اسود') || val.includes('black')) return '#18181B';
    if (val.includes('أبيض') || val.includes('ابيض') || val.includes('white')) return '#FFFFFF';
    if (val.includes('ذهبي') || val.includes('gold')) return '#D97706';
    if (val.includes('رمادي') || val.includes('gray') || val.includes('grey')) return '#6B7280';
    if (val.includes('برونزي') || val.includes('bronze')) return '#92400E';
    if (val.includes('أحمر') || val.includes('red')) return '#DC2626';
    if (val.includes('أزرق') || val.includes('blue')) return '#2563EB';
    return getActualColor(value) || '#64748B';
  };

  const getSpecColorsList = (specValue) => {
    if (!specValue) return [];
    if (typeof specValue === 'string' && (specValue.includes('،') || specValue.includes(','))) {
      return specValue.split(/[،,]+/).map(s => s.trim()).filter(Boolean).map(c => ({
        label: c,
        hex: getSpecColorHex(c)
      }));
    }
    return [{ label: String(specValue), hex: getSpecColorHex(specValue) }];
  };

  return { isLightColor, isColorSpec, getSpecColorsList };
}

