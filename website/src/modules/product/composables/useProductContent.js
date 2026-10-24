import { computed } from 'vue';
import { extractColorOptions, isColorAttribute, isSizeAttribute, localizedText } from '../../../utils/productAttributes';

export function useProductContent({ product, locale, localized, selectedAttributes, getActiveOfferForProduct, calculatePriceWithOffer }) {
  const contentLines = (value) => {
    const values = Array.isArray(value) ? value : String(value ?? '').split(/\r?\n/);
    return values
      .map((item) => String(item ?? '').replace(/^[-•*❖]\s*/, '').trim())
      .filter(Boolean);
  };

  // Header bullet points: every point entered under Features in the dashboard.
  const productFeatures = computed(() => {
    const rawFeat = localized(product.value, 'features') || product.value?.features;
    return contentLines(rawFeat);
  });
  
  // Dynamic Overview Data
  const dynamicOverviewTitle = computed(() => {
    return locale.value === 'ar' ? 'تحكم كامل وتوزيع حراري متساوٍ' : 'Complete Control & Uniform Heat Distribution';
  });
  
  const dynamicOverviewDesc = computed(() => {
    const desc = localized(product.value, 'description');
    return String(desc ?? '').trim();
  });
  
  const dynamicOverviewFeatures = computed(() => {
    const rawFeat = localized(product.value, 'features') || product.value?.features;
    return contentLines(rawFeat);
  });

  const installationItems = computed(() => contentLines(localized(product.value, 'tips')));
  const shippingItems = computed(() => contentLines(localized(product.value, 'shipping_info')));
  
  // Dynamic Technical Specifications driven directly from API
  const technicalSpecifications = computed(() => {
    const isAr = locale.value === 'ar';
    const prod = product.value || {};
    const attrs = prod.attributes || prod.raw_attributes || {};

    function cleanSpecValue(val) {
      if (val === undefined || val === null) return '';
      let str = String(localizedText(val) ?? '').trim();
      if (isAr) {
        str = str.replace(/\s*\([A-Za-z0-9\s/&,.-]+\)/g, '').trim();
      }
      return str;
    }
  
    const specKeyMap = {
      'الارتفاع': { ar: 'الارتفاع', en: 'Height' },
      'height': { ar: 'الارتفاع', en: 'Height' },
      'العرض': { ar: 'العرض', en: 'Width' },
      'width': { ar: 'العرض', en: 'Width' },
      'السعة': { ar: 'السعة', en: 'Capacity' },
      'capacity': { ar: 'السعة', en: 'Capacity' },
      'العمر': { ar: 'العمر', en: 'Age' },
      'age': { ar: 'العمر', en: 'Age' },
      'العمق': { ar: 'العمق', en: 'Depth' },
      'depth': { ar: 'العمق', en: 'Depth' },
      'الجهد الكهربائي': { ar: 'الجهد الكهربائي', en: 'Voltage' },
      'voltage': { ar: 'الجهد الكهربائي', en: 'Voltage' },
      'نوع الطاقة': { ar: 'نوع الطاقة', en: 'Energy Source' },
      'energy': { ar: 'نوع الطاقة', en: 'Energy Source' },
      'energy_source': { ar: 'نوع الطاقة', en: 'Energy Source' },
      'power': { ar: 'نوع الطاقة', en: 'Energy Source' },
      'المؤقت الرقمي': { ar: 'المؤقت الرقمي', en: 'Digital Timer' },
      'timer': { ar: 'المؤقت الرقمي', en: 'Digital Timer' },
      'وظائف الطهي': { ar: 'وظائف الطهي', en: 'Cooking Functions' },
      'functions': { ar: 'وظائف الطهي', en: 'Cooking Functions' },
      'نظام الإشعال': { ar: 'نظام الإشعال', en: 'Ignition System' },
      'ignition': { ar: 'نظام الإشعال', en: 'Ignition System' },
      'صمام الأمان': { ar: 'صمام الأمان', en: 'Safety Valve' },
      'safety': { ar: 'صمام الأمان', en: 'Safety Valve' },
      'بلد المنشأ': { ar: 'بلد المنشأ', en: 'Country of Origin' },
      'origin': { ar: 'بلد المنشأ', en: 'Country of Origin' },
      'الخامة': { ar: 'الخامة', en: 'Material' },
      'المادة': { ar: 'الخامة', en: 'Material' },
      'material': { ar: 'الخامة', en: 'Material' },
      'اللون والمظهر': { ar: 'اللون', en: 'Color' },
      'color_finish': { ar: 'اللون', en: 'Color' },
      'نوع الحوامل': { ar: 'نوع الحوامل', en: 'Pan Supports' },
      'pan_supports': { ar: 'نوع الحوامل', en: 'Pan Supports' },
      'pan_support': { ar: 'نوع الحوامل', en: 'Pan Supports' },
      'مستويات السرعة': { ar: 'مستويات السرعة', en: 'Speed Levels' },
      'speed': { ar: 'مستويات السرعة', en: 'Speed Levels' },
      'نوع الفلتر': { ar: 'نوع الفلتر', en: 'Filter Type' },
      'filter': { ar: 'نوع الفلتر', en: 'Filter Type' },
      'مستوى الضوضاء': { ar: 'مستوى الضوضاء', en: 'Noise Level' },
      'noise': { ar: 'مستوى الضوضاء', en: 'Noise Level' },
      'ضغط المياه المناسب': { ar: 'ضغط المياه المناسب', en: 'Operating Water Pressure' },
      'pressure': { ar: 'ضغط المياه المناسب', en: 'Operating Water Pressure' },
      'عدد الشعلات': { ar: 'عدد الشعلات', en: 'Burners Count' },
      'burners': { ar: 'عدد الشعلات', en: 'Burners Count' },
      'الوزن الصافي': { ar: 'الوزن الصافي', en: 'Net Weight' },
      'weight': { ar: 'الوزن الصافي', en: 'Net Weight' }
    };
  
    function getAttrValue(keyAliases) {
      if (!attrs || typeof attrs !== 'object') return null;
      for (const k of keyAliases) {
        if (attrs[k] !== undefined && attrs[k] !== null) {
          const val = cleanSpecValue(attrs[k]);
          if (val && val !== 'null') return val;
        }
        const lower = k.toLowerCase();
        if (attrs[lower] !== undefined && attrs[lower] !== null) {
          const val = cleanSpecValue(attrs[lower]);
          if (val && val !== 'null') return val;
        }
      }
      return null;
    }
  
    let dimH = null, dimW = null, dimD = null;
    const rawDims = attrs.dimensions || attrs['الأبعاد'] || attrs.Dimensions;
    if (rawDims) {
      const dimStr = cleanSpecValue(rawDims);
      const parts = dimStr.split(/[×xX*]/).map(s => s.trim().replace('سم', '').trim()).filter(Boolean);
      if (parts.length >= 3) {
        dimH = `${parts[0]} سم`;
        dimW = `${parts[1]} سم`;
        dimD = `${parts[2]} سم`;
      }
    }
  
    const specsList = [];
    const addSpec = (aliases, labels) => {
      const value = getAttrValue(aliases);
      if (value) specsList.push({ label: isAr ? labels.ar : labels.en, value });
    };

    addSpec(['الارتفاع', 'height'], { ar: 'الارتفاع', en: 'Height' });
    addSpec(['العرض', 'width'], { ar: 'العرض', en: 'Width' });
    addSpec(['السعة', 'capacity'], { ar: 'السعة', en: 'Capacity' });
    addSpec(['العمق', 'depth'], { ar: 'العمق', en: 'Depth' });
    addSpec(['الجهد الكهربائي', 'voltage'], { ar: 'الجهد الكهربائي', en: 'Voltage' });
    addSpec(['نوع الطاقة', 'energy', 'energy_source', 'power'], { ar: 'نوع الطاقة', en: 'Energy Source' });
    addSpec(['المؤقت الرقمي', 'timer'], { ar: 'المؤقت الرقمي', en: 'Digital Timer' });
    addSpec(['وظائف الطهي', 'functions'], { ar: 'وظائف الطهي', en: 'Cooking Functions' });
    addSpec(['نظام الإشعال', 'ignition'], { ar: 'نظام الإشعال', en: 'Ignition System' });
    addSpec(['صمام الأمان', 'safety'], { ar: 'صمام الأمان', en: 'Safety Valve' });
    addSpec(['بلد المنشأ', 'origin'], { ar: 'بلد المنشأ', en: 'Country of Origin' });
    addSpec(['الخامة', 'المادة', 'material'], { ar: 'الخامة', en: 'Material' });
    addSpec(['اللون والمظهر', 'color_finish', 'color', 'اللون', 'color_options', 'colors', 'الألوان', 'الوان'], { ar: 'اللون', en: 'Color' });
    addSpec(['نوع الحوامل', 'pan_supports', 'pan_support'], { ar: 'نوع الحوامل', en: 'Pan Supports' });
    addSpec(['مستويات السرعة', 'speed'], { ar: 'مستويات السرعة', en: 'Speed Levels' });
    addSpec(['نوع الفلتر', 'filter'], { ar: 'نوع الفلتر', en: 'Filter Type' });
    addSpec(['مستوى الضوضاء', 'noise'], { ar: 'مستوى الضوضاء', en: 'Noise Level' });
    addSpec(['ضغط المياه المناسب', 'pressure'], { ar: 'ضغط المياه المناسب', en: 'Operating Water Pressure' });
    addSpec(['عدد الشعلات', 'burners'], { ar: 'عدد الشعلات', en: 'Burners Count' });
    addSpec(['الوزن الصافي', 'weight'], { ar: 'الوزن الصافي', en: 'Net Weight' });

    if (dimH && !specsList.some((spec) => spec.label === (isAr ? 'الارتفاع' : 'Height'))) {
      specsList.push({ label: isAr ? 'الارتفاع' : 'Height', value: dimH });
    }
    if (dimW && !specsList.some((spec) => spec.label === (isAr ? 'العرض' : 'Width'))) {
      specsList.push({ label: isAr ? 'العرض' : 'Width', value: dimW });
    }
    if (dimD && !specsList.some((spec) => spec.label === (isAr ? 'العمق' : 'Depth'))) {
      specsList.push({ label: isAr ? 'العمق' : 'Depth', value: dimD });
    }
  
    const handledKeys = [
      'color', 'اللون', 'الألوان', 'الوان', 'colors', 'color_options', 'size', 'المقاس', 'الحجم', 
      'images', 'image', 'dimensions', 'الأبعاد', 
      'brand', 'العلامة التجارية', 'warranty', 'الضمان',
      'material', 'المادة', 'خامة الصنع',
      'الارتفاع', 'height', 'العرض', 'width', 'السعة', 'capacity', 'العمق', 'depth',
      'الجهد الكهربائي', 'voltage', 'نوع الطاقة', 'power', 'energy', 'energy_source',
      'المؤقت الرقمي', 'timer', 'وظائف الطهي', 'functions',
      'نظام الإشعال', 'ignition', 'صمام الأمان', 'safety',
      'بلد المنشأ', 'origin', 'اللون والمظهر', 'color_finish',
      'نوع الحوامل', 'pan_supports', 'مستويات السرعة', 'speed',
      'نوع الفلتر', 'filter', 'مستوى الضوضاء', 'noise',
      'ضغط المياه المناسب', 'pressure'
    ];
  
    if (attrs && typeof attrs === 'object') {
      Object.keys(attrs).forEach(k => {
        const lower = k.toLowerCase().trim();
        if (handledKeys.includes(lower) || handledKeys.includes(k.trim())) return;
        const v = attrs[k];
        const strVal = cleanSpecValue(v);
        if (strVal && strVal !== 'null') {
          const specConf = specKeyMap[lower] || specKeyMap[k.trim()];
          const label = specConf ? (isAr ? specConf.ar : specConf.en) : k;
          if (label && !specsList.some(s => s.label === label)) {
            specsList.push({ label, value: strVal });
          }
        }
      });
    }
  
    return specsList.filter(item => item?.label && item?.value);
  });
  
  const specRows = computed(() => {
    const rows = [];
    const list = technicalSpecifications.value;
    for (let i = 0; i < list.length; i += 2) {
      rows.push({
        col1: list[i],
        col2: list[i + 1] || null
      });
    }
    return rows;
  });
  
  // Normalized Attributes & Color Options
  const normalizedAttributes = computed(() => {
    if (!product.value) return [];
    const result = [];
    const attributeLabels = {
      age: { ar: 'العمر', en: 'Age' },
      'العمر': { ar: 'العمر', en: 'Age' },
    };
    const rawAttrs = product.value.attributes && typeof product.value.attributes === 'object'
      ? product.value.attributes
      : {};
  
    const parseOption = (raw) => {
      if (raw && typeof raw === 'object') return localizedText(raw.label ?? raw.name ?? raw.value);
      return String(raw ?? '').split('|', 1)[0].trim();
    };
  
    const colors = extractColorOptions(product.value);
    
    if (colors.length > 0) {
      result.push({
        key: 'color',
        label: locale.value === 'ar' ? 'اللون' : 'Color',
        isColor: true,
        options: colors
      });
    }
  
    Object.entries(rawAttrs).forEach(([key, rawValue]) => {
      if (['color', 'اللون', 'Color', 'الالوان'].includes(key) || isColorAttribute({ name: key, label: key })) return;
      const options = (Array.isArray(rawValue) ? rawValue : [rawValue]).map(parseOption).filter(Boolean);
      if (options.length > 0) {
        result.push({
          key,
          label: attributeLabels[key.toLowerCase()]?.[locale.value] || localizedText(key),
          isColor: false,
          isSize: isSizeAttribute({ name: key, label: key }),
          options: [...new Set(options)]
        });
      }
    });
    return result;
  });
  
  const isBlacklistedSpec = (key) => {
    const k = String(key || '').toLowerCase().trim();
    const blacklisted = [
      'خامة', 'خامات', 'material', 'materials',
      'ضمان', 'warranty',
      'أبعاد', 'ابعاد', 'dimension', 'dimensions',
      'منشأ', 'origin', 'بلد', 'بلد_المنشأ',
      'شعلة', 'شعلات', 'burner', 'burners',
      'قدرة', 'حرارية', 'حراريه', 'btu', 'thermal', 'power',
      'أمان', 'امان', 'safety',
      'حامل', 'حوامل', 'pan_support', 'pan_supports',
      'سرعة', 'speed',
      'فلتر', 'filter',
      'ضوضاء', 'noise',
      'ضغط', 'pressure',
      'وظيفة', 'وظائف', 'function', 'functions',
      'وزن', 'weight',
      'جهد', 'فولت', 'voltage',
      'مؤقت', 'timer',
      'إشعال', 'اشعال', 'ignition',
      'طاقة', 'energy', 'energy_source',
      'ارتفاع', 'عرض', 'عمق', 'سعة'
    ];
    return blacklisted.some(term => k.includes(term));
  };
  
  const selectableAttributes = computed(() => {
    return normalizedAttributes.value.filter((attr) => {
      if (attr.isColor) return false;
      if (isBlacklistedSpec(attr.key) || isBlacklistedSpec(attr.label)) return false;
      // Only real variant choices that have more than 1 option to choose from!
      return Array.isArray(attr.options) && attr.options.length > 1;
    });
  });
  
  const colorOptions = computed(() => {
    const options = extractColorOptions(product.value);
    return options;
  });
  
  const selectedColorName = computed(() => {
    const selected = selectedAttributes.value['color'] || selectedAttributes.value['اللون'];
    if (selected) return selected;
    return colorOptions.value[0]?.label || colorOptions.value[0]?.name || '';
  });
  
  const selectColor = (name) => {
    selectedAttributes.value['color'] = name;
    selectedAttributes.value['اللون'] = name;
  };
  
  const selectAttribute = (key, value) => {
    selectedAttributes.value[key] = value;
  };
  
  // Calculate active offer for this product
  const activeOffer = computed(() => {
    if (product.value) {
      return getActiveOfferForProduct(product.value);
    }
    return null;
  });
  
  const currentPrice = computed(() => {
    if (activeOffer.value) {
      return calculatePriceWithOffer(product.value, activeOffer.value);
    }
    const price = Number(product.value?.price);
    if (!Number.isFinite(price)) return null;
    const salePrice = Number(product.value?.sale_price) || 0;
    if (salePrice > 0 && salePrice < price) return salePrice;
    const discount = Number(product.value?.discount) || 0;
    return price * (1 - discount / 100);
  });

  return {
    productFeatures,
    installationItems,
    shippingItems,
    dynamicOverviewTitle,
    dynamicOverviewDesc,
    dynamicOverviewFeatures,
    specRows,
    colorOptions,
    selectedColorName,
    selectableAttributes,
    selectColor,
    selectAttribute,
    currentPrice,
  };
}
