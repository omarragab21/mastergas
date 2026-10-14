import { computed } from 'vue';
import { extractColorOptions, isColorAttribute, isSizeAttribute, localizedText } from '../../../utils/productAttributes';

export function useProductContent({ product, locale, localized, selectedAttributes, getActiveOfferForProduct, calculatePriceWithOffer }) {
  // Bullet specs matching Figma inspect (excluding warranty, dimensions, materials, origin, and burner specs)
  const productFeatures = computed(() => {
    const rawFeat = localized(product.value, 'features') || product.value?.features;
    let list = [];
    if (Array.isArray(rawFeat) && rawFeat.length > 0) {
      list = [...rawFeat];
    } else if (typeof rawFeat === 'string' && rawFeat.trim()) {
      list = rawFeat.split(/[\n\r]+/).map(s => s.replace(/^[-•*❖]\s*/, '').trim()).filter(Boolean);
    }
  
    const excludedPatterns = [
      /ضمان/i, /warranty/i,
      /خامة/i, /خامات/i, /material/i,
      /أبعاد/i, /ابعاد/i, /dimensions/i,
      /بلد المنشأ/i, /صنع بالكامل في إيطاليا/i, /صنع في/i, /made in/i,
      /شعلات/i, /شعلة/i, /burners/i,
      /قدرة حرارية/i, /btu/i
    ];
  
    list = list.filter(item => !excludedPatterns.some(regex => regex.test(item)));
  
    if (list.length === 0) {
      list = [
        locale.value === 'ar' ? 'سعة 65 لتر لطهي مريح لمختلف الوجبات' : '65L capacity for versatile and effortless cooking',
        locale.value === 'ar' ? '٤ وظائف طهي مبرمجة هندسياً لأداء متكامل' : '4 engineered preset cooking functions for integrated performance',
        locale.value === 'ar' ? 'إشعال كهربائي ذاتي سهل وآمن بلمسة واحدة' : 'One-touch safe automatic electric ignition',
        locale.value === 'ar' ? 'باب زجاجي مزدوج يحفظ الحرارة بكفاءة عالية' : 'Double-glazed door for superior heat retention',
        locale.value === 'ar' ? 'صمام أمان كامل يضمن سلامة المطبخ والمنزل' : 'Full safety cutoff valve ensuring kitchen and home protection'
      ];
    }
    return list.slice(0, 6);
  });
  
  // Dynamic Overview Data
  const dynamicOverviewTitle = computed(() => {
    return locale.value === 'ar' ? 'تحكم كامل وتوزيع حراري متساوٍ' : 'Complete Control & Uniform Heat Distribution';
  });
  
  const dynamicOverviewDesc = computed(() => {
    const desc = localized(product.value, 'description');
    if (desc && desc.trim()) return desc;
    return locale.value === 'ar' 
      ? 'صمم فرن ماستر غاز المدمج بحجم 60 سم ليقدم تجربة طهي احترافية تضاهي المطابخ العالمية. بفضل سعته الكبيرة البالغة 65 لتر، يمكنك طهي وجبات عائلية متكاملة بكل سهولة. يتميز الفرن بتصميم إيطالي فاخر معزز بأنظمة أمان ذكية وصمام أمان كامل يضمن راحة البال التامة لك ولعائلتك.'
      : 'Designed in 60cm built-in format for professional culinary excellence matching international standards. With its 65L capacity, prepare family meals effortlessly. Italian luxury styling reinforced with smart safety systems.';
  });
  
  const dynamicOverviewFeatures = computed(() => {
    const rawFeat = localized(product.value, 'features') || product.value?.features;
    if (Array.isArray(rawFeat) && rawFeat.length > 0) {
      return rawFeat;
    }
    if (typeof rawFeat === 'string' && rawFeat.trim()) {
      const list = rawFeat.split(/[\n\r]+/).map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
      if (list.length > 0) return list;
    }
    return [
      locale.value === 'ar' ? 'تنظيف سهل وسريع بفضل طبقة المينا الداخلية المانعة للالتصاق' : 'Easy-clean non-stick enamel interior coating',
      locale.value === 'ar' ? 'سعة كبيرة تبلغ 65 لتر تناسب العائلات والأطباق الضخمة' : 'Spacious 65L capacity tailored for family feasts',
      locale.value === 'ar' ? 'أمان متقدم مع صمام أمان إيطالي كامل لقطع الغاز الفوري' : 'Advanced full Italian safety cutoff valve for instant gas stop',
      locale.value === 'ar' ? 'توزيع حراري متساوٍ يضمن خبزاً وتحميراً مثالياً من جميع الجهات' : 'Even convection heat distribution for flawless baking and roasting'
    ];
  });
  
  // Dynamic Technical Specifications driven directly from API
  const technicalSpecifications = computed(() => {
    const isAr = locale.value === 'ar';
    const prod = product.value || {};
    const name = (prod.name_i18n?.ar || prod.name || '').toLowerCase();
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
      'اللون والمظهر': { ar: 'اللون والمظهر', en: 'Color & Finish' },
      'color_finish': { ar: 'اللون والمظهر', en: 'Color & Finish' },
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
  
    let specsList = [];
  
    if (name.includes('موقد') || name.includes('مسطح') || name.includes('hob') || name.includes('cooktop')) {
      const is90 = name.includes('90') || name.includes('5');
      specsList = [
        { label: isAr ? 'الارتفاع' : 'Height', value: getAttrValue(['الارتفاع', 'height']) || dimH || '5 سم' },
        { label: isAr ? 'العرض' : 'Width', value: getAttrValue(['العرض', 'width']) || dimW || (is90 ? '86 سم' : '59.5 سم') },
        { label: isAr ? 'السعة' : 'Capacity', value: getAttrValue(['السعة', 'capacity']) || (is90 ? (isAr ? '5 شعلات غاز' : '5 Gas Burners') : (isAr ? '4 شعلات غاز' : '4 Gas Burners')) },
        { label: isAr ? 'العمق' : 'Depth', value: getAttrValue(['العمق', 'depth']) || dimD || '51 سم' },
        { label: isAr ? 'الجهد الكهربائي' : 'Voltage', value: getAttrValue(['الجهد الكهربائي', 'voltage']) || '220-240 فولت' },
        { label: isAr ? 'نوع الطاقة' : 'Energy Source', value: getAttrValue(['نوع الطاقة', 'power', 'energy']) || (isAr ? 'غاز طبيعي / مسال' : 'Natural / LPG Gas') },
        { label: isAr ? 'المؤقت الرقمي' : 'Digital Timer', value: getAttrValue(['المؤقت الرقمي', 'timer']) || (isAr ? 'نعم' : 'Yes') },
        { label: isAr ? 'نوع الحوامل' : 'Pan Supports', value: getAttrValue(['نوع الحوامل', 'pan_supports', 'pan_support']) || (isAr ? 'حديد زهر ثقيل' : 'Heavy-Duty Cast Iron') },
        { label: isAr ? 'نظام الإشعال' : 'Ignition System', value: getAttrValue(['نظام الإشعال', 'ignition']) || (isAr ? 'إلكتروني مدمج بالمفتاح' : 'Integrated Auto-Ignition') },
        { label: isAr ? 'صمام الأمان' : 'Safety Valve', value: getAttrValue(['صمام الأمان', 'safety']) || (isAr ? 'أمان كامل فوري' : 'Full Flame Safety') },
        { label: isAr ? 'بلد المنشأ' : 'Country of Origin', value: getAttrValue(['بلد المنشأ', 'origin']) || (isAr ? 'إيطاليا' : 'Italy') },
        { label: isAr ? 'اللون والمظهر' : 'Color & Finish', value: selectedColorName.value || getAttrValue(['اللون والمظهر', 'material', 'المادة']) || (name.includes('زجاج') ? (isAr ? 'زجاج حراري مقسّى' : 'Tempered Glass') : (isAr ? 'ستانلس ستيل' : 'Stainless Steel')) }
      ];
    } else if (name.includes('شفاط') || name.includes('hood')) {
      specsList = [
        { label: isAr ? 'الارتفاع' : 'Height', value: getAttrValue(['الارتفاع', 'height']) || dimH || '70-105 سم' },
        { label: isAr ? 'العرض' : 'Width', value: getAttrValue(['العرض', 'width']) || dimW || '90 سم' },
        { label: isAr ? 'السعة' : 'Capacity', value: getAttrValue(['السعة', 'capacity']) || (isAr ? 'قوة شفط 1200 م³/ساعة' : '1200 m³/h Suction') },
        { label: isAr ? 'العمق' : 'Depth', value: getAttrValue(['العمق', 'depth']) || dimD || '50 سم' },
        { label: isAr ? 'الجهد الكهربائي' : 'Voltage', value: getAttrValue(['الجهد الكهربائي', 'voltage']) || '220-240 فولت' },
        { label: isAr ? 'نوع الطاقة' : 'Energy Source', value: getAttrValue(['نوع الطاقة', 'power', 'energy']) || (isAr ? 'كهرباء 230 واط' : 'Electric 230W') },
        { label: isAr ? 'المؤقت الرقمي' : 'Digital Timer', value: getAttrValue(['المؤقت الرقمي', 'timer']) || (isAr ? 'نعم' : 'Yes') },
        { label: isAr ? 'مستويات السرعة' : 'Speed Levels', value: getAttrValue(['مستويات السرعة', 'speed']) || (isAr ? '3 سرعات توربو' : '3 Turbo Speeds') },
        { label: isAr ? 'نوع الفلتر' : 'Filter Type', value: getAttrValue(['نوع الفلتر', 'filter']) || (isAr ? 'فلاتر ألومنيوم متعددة الطبقات' : 'Multi-layer Aluminum') },
        { label: isAr ? 'مستوى الضوضاء' : 'Noise Level', value: getAttrValue(['مستوى الضوضاء', 'noise']) || (isAr ? 'منخفض (56 ديسيبل)' : 'Ultra Quiet (56 dB)') },
        { label: isAr ? 'بلد المنشأ' : 'Country of Origin', value: getAttrValue(['بلد المنشأ', 'origin']) || (isAr ? 'إيطاليا' : 'Italy') },
        { label: isAr ? 'اللون والمظهر' : 'Color & Finish', value: selectedColorName.value || getAttrValue(['اللون والمظهر', 'material', 'المادة']) || (isAr ? 'ستانلس ستيل 304' : 'Stainless Steel 304') }
      ];
    } else if (name.includes('سخان') || name.includes('heater') || name.includes('water')) {
      const is10 = name.includes('10');
      specsList = [
        { label: isAr ? 'الارتفاع' : 'Height', value: getAttrValue(['الارتفاع', 'height']) || dimH || '55 سم' },
        { label: isAr ? 'العرض' : 'Width', value: getAttrValue(['العرض', 'width']) || dimW || '35 سم' },
        { label: isAr ? 'السعة' : 'Capacity', value: getAttrValue(['السعة', 'capacity']) || (is10 ? (isAr ? '10 لتر / دقيقة' : '10 L/min') : (isAr ? '6 لتر / دقيقة' : '6 L/min')) },
        { label: isAr ? 'العمق' : 'Depth', value: getAttrValue(['العمق', 'depth']) || dimD || '18 سم' },
        { label: isAr ? 'الجهد الكهربائي' : 'Voltage', value: getAttrValue(['الجهد الكهربائي', 'voltage']) || (isAr ? 'شاشة إلكترونية تعمل بالبطاريات' : 'Battery-Powered') },
        { label: isAr ? 'نوع الطاقة' : 'Energy Source', value: getAttrValue(['نوع الطاقة', 'power', 'energy']) || (isAr ? 'غاز طبيعي / أسطوانات مسال' : 'Natural / LPG Gas') },
        { label: isAr ? 'المؤقت الرقمي' : 'Digital Timer', value: getAttrValue(['المؤقت الرقمي', 'timer']) || (isAr ? 'شاشة رقمية LED' : 'Digital LED Display') },
        { label: isAr ? 'ضغط المياه المناسب' : 'Operating Water Pressure', value: getAttrValue(['ضغط المياه المناسب', 'pressure']) || (isAr ? 'يعمل مع ضغط المياه المنخفض' : 'Low Water Pressure') },
        { label: isAr ? 'نظام الإشعال' : 'Ignition System', value: getAttrValue(['نظام الإشعال', 'ignition']) || (isAr ? 'إلكتروني أوتوماتيكي فوري' : 'Instant Auto-Ignition') },
        { label: isAr ? 'صمام الأمان' : 'Safety Valve', value: getAttrValue(['صمام الأمان', 'safety']) || (isAr ? 'حماية ثلاثية من انقطاع الغاز والحرارة' : 'Triple Safety') },
        { label: isAr ? 'بلد المنشأ' : 'Country of Origin', value: getAttrValue(['بلد المنشأ', 'origin']) || (isAr ? 'إيطاليا' : 'Italy') },
        { label: isAr ? 'اللون والمظهر' : 'Color & Finish', value: selectedColorName.value || getAttrValue(['اللون والمظهر', 'material', 'المادة']) || (isAr ? 'أبيض ناصع مقاوم للصدأ' : 'Pure White') }
      ];
    } else {
      // Built-in Oven (matching exact Figma inspect)
      const is90 = name.includes('90');
      specsList = [
        { label: isAr ? 'العرض' : 'Width', value: getAttrValue(['العرض', 'width']) || dimW || (is90 ? '89.5 سم' : '59.5 سم') },
        { label: isAr ? 'الارتفاع' : 'Height', value: getAttrValue(['الارتفاع', 'height']) || dimH || '59.5 سم' },
        { label: isAr ? 'العمق' : 'Depth', value: getAttrValue(['العمق', 'depth']) || dimD || (is90 ? '56 سم' : '55 سم') },
        { label: isAr ? 'السعة' : 'Capacity', value: getAttrValue(['السعة', 'capacity']) || (is90 ? '85 لتر' : '65 لتر') },
        { label: isAr ? 'نوع الطاقة' : 'Energy Source', value: getAttrValue(['نوع الطاقة', 'power', 'energy']) || (isAr ? 'غاز طبيعي / مسال' : 'Natural / LPG Gas') },
        { label: isAr ? 'الجهد الكهربائي' : 'Voltage', value: getAttrValue(['الجهد الكهربائي', 'voltage']) || '220-240 فولت' },
        { label: isAr ? 'وظائف الطهي' : 'Cooking Functions', value: getAttrValue(['وظائف الطهي', 'functions']) || (is90 ? (isAr ? '6 وظائف' : '6 Functions') : (isAr ? '4 وظائف' : '4 Functions')) },
        { label: isAr ? 'المؤقت الرقمي' : 'Digital Timer', value: getAttrValue(['المؤقت الرقمي', 'timer']) || (isAr ? 'نعم' : 'Yes') },
        { label: isAr ? 'صمام الأمان' : 'Safety Valve', value: getAttrValue(['صمام الأمان', 'safety']) || (isAr ? 'أمان كامل' : 'Full Flame Safety') },
        { label: isAr ? 'نظام الإشعال' : 'Ignition System', value: getAttrValue(['نظام الإشعال', 'ignition']) || (isAr ? 'إلكتروني ذاتي' : 'Electronic Auto-Ignition') },
        { label: isAr ? 'اللون والمظهر' : 'Color & Finish', value: selectedColorName.value || getAttrValue(['اللون والمظهر', 'material', 'المادة']) || (isAr ? 'ستانلس ستيل' : 'Stainless Steel') },
        { label: isAr ? 'بلد المنشأ' : 'Country of Origin', value: getAttrValue(['بلد المنشأ', 'origin']) || (isAr ? 'إيطاليا' : 'Italy') }
      ];
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
          const label = specConf ? (isAr ? specConf.ar : specConf.en) : (isAr ? (/^[a-zA-Z]/.test(k) ? '' : k) : k);
          if (label && !specsList.some(s => s.label === label)) {
            specsList.push({ label, value: strVal });
          }
        }
      });
    }
  
    const excludedSpecLabels = [
      'بلد المنشأ', 'country of origin', 'origin',
      'الضمان', 'warranty',
      'الخامة', 'الخامات', 'material', 'materials',
      'الأبعاد', 'ابعاد', 'dimensions',
      'الارتفاع', 'height', 'العرض', 'width', 'العمق', 'depth',
      'عدد الشعلات', 'burners count', 'burners',
      'القدرة الحرارية', 'thermal power', 'btu',
      'الألوان', 'colors', 'خيارات الألوان'
    ];
    return specsList.filter(item => {
      const lbl = (item.label || '').toLowerCase().trim();
      if (lbl.includes('اللون والمظهر') || lbl.includes('color & finish')) {
        return true;
      }
      return !excludedSpecLabels.some(ex => lbl.includes(ex));
    });
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
          label: localizedText(key),
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
    if (options.length > 0) return options;
    return [
      { label: locale.value === 'ar' ? 'ستانلس ستيل' : 'Stainless Steel', name: locale.value === 'ar' ? 'ستانلس ستيل' : 'Stainless Steel', hex: '#d1d5db' },
      { label: locale.value === 'ar' ? 'أسود' : 'Black', name: locale.value === 'ar' ? 'أسود' : 'Black', hex: '#111827' }
    ];
  });
  
  const selectedColorName = computed(() => {
    const selected = selectedAttributes.value['color'] || selectedAttributes.value['اللون'];
    if (selected) return selected;
    return colorOptions.value[0]?.label || colorOptions.value[0]?.name || (locale.value === 'ar' ? 'ستانلس ستيل' : 'Stainless Steel');
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
    const price = Number(product.value?.price) || 2499;
    const salePrice = Number(product.value?.sale_price) || 0;
    if (salePrice > 0 && salePrice < price) return salePrice;
    const discount = Number(product.value?.discount) || 0;
    return price * (1 - discount / 100);
  });

  return {
    productFeatures,
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
