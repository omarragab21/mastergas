import fs from 'node:fs';
import path from 'node:path';

const API_BASE = 'https://backend-mastergas.be-kite.com/api';

const productsToUpload = [
  {
    sku: 'MG-HOB90-5B',
    name_ar: 'مسطح غاز إيطالي بلت إن 5 شعلات مع شعلة ووك ثلاثية 90 سم',
    name_en: 'Mastergas 90cm 5-Burner Built-in Gas Hob with Triple Wok',
    category_id: '57',
    price: '2199',
    discount: '10',
    quantity: '30',
    desc_ar: 'مسطح غاز بلت إن إيطالي فاخر مقاس 90 سم مزود بـ 5 شعلات نحاسية متطورة تشمل شعلة ووك ثلاثية التاج (Triple Ring Wok) لطهي سريع وشديد القوة، مع شبك ثقيل من حديد الزهر (Cast Iron) ونظام أمان إيطالي كامل لكافة العيون.',
    desc_en: 'Luxury 90cm Italian built-in gas hob featuring 5 precision brass burners including a high-output triple-ring wok burner, heavy-duty cast-iron pan supports, and instantaneous flame failure safety.',
    features_ar: '5 شعلات نحاسية إيطالية عالية الكفاءة\nشعلة ووك ثلاثية التاج للطهي السريع 4.0kW\nشبك ثقيل من حديد الزهر شديد المتانة\nصمامات أمان إيطالية تقطع الغاز فور انطفاء اللهب\nإشعال إلكتروني مدمج بالمقابض بلمسة واحدة\nسطح من الستانلس ستيل 304 المقاوم للحرارة والخدش',
    features_en: '5 Italian high-efficiency brass burners\nTriple-ring wok burner for high heat cooking 4.0kW\nHeavy-duty cast iron pan supports\nInstantaneous safety valves stop gas if flame goes out\nOne-touch integrated knob ignition\nStainless steel 304 scratch-resistant surface',
    tips_ar: 'يجب تنظيف الشعلات والشبك بانتظام بعد أن تبرد، والتأكد من تركيب حوامل الأواني بشكل متوازن.',
    tips_en: 'Clean the burners and cast-iron grids regularly after cooling. Ensure pan supports are properly seated.',
    shipping_info_ar: 'شحن مجاني لكافة المدن مع خدمة التركيب المعتمدة وضمان 3 سنوات.',
    shipping_info_en: 'Free shipping to all cities with certified installation and 3 years warranty.',
    attributes: {
      'المقاس': ['90 سم'],
      'عدد الشعلات': ['5 شعلات'],
      'بلد المنشأ': ['إيطاليا (Made in Italy)'],
      'الخامة': ['ستانلس ستيل 304'],
      'نوع الحوامل': ['حديد زهر ثقيل (Cast Iron)'],
      'نظام الأمان': ['أمان كامل (Full Safety)']
    },
    colors: [
      { label: 'فضي ستانلس ستيل', color: '#94a3b8' },
      { label: 'أسود زجاجي', color: '#0f172a' }
    ],
    sizes: ['90 سم'],
    images: [
      'public/catalog_images/prod_176_0.jpg',
      'public/catalog_images/prod_176_1.jpg',
      'public/catalog_images/prod_176_2.jpg',
      'public/catalog_images/prod_161.jpg'
    ]
  },
  {
    sku: 'MG-HOOD90-IT',
    name_ar: 'شفاط مطبخ إيطالي هرمي فاخر 90 سم بقوة سحب 1000 م³/ساعة',
    name_en: 'Mastergas Luxury 90cm Pyramid Chimney Hood 1000 m³/h',
    category_id: '57',
    price: '1650',
    discount: '12',
    quantity: '20',
    desc_ar: 'شفاط مطابخ إيطالي هرمي مقاس 90 سم بقوة سحب توربينية خارقة تصل إلى 1000 م³/ساعة، مزود بمحرك فائق الهدوء وفلاتر ألمنيوم متعددة الطبقات قابلة للغسيل وإضاءة LED بيضاء دافئة موفرة للطاقة.',
    desc_en: 'Mastergas 90cm Italian pyramid chimney hood with an ultra-powerful 1000 m³/h extraction capacity, whisper-quiet motor, multi-layer washable aluminum filters, and dual warm LED task lighting.',
    features_ar: 'قوة شفط توربينية جبارة 1000 م³/ساعة\n3 سرعات تشغيل بالإضافة إلى سرعة التيربو القصوى\nمحرك ألماني إيطالي هادئ بنظام عزل صوتي متطور\nفلاتر ألمنيوم 5 طبقات سهلة الفك والتنظيف في غسالة الأطباق\nإضاءة LED مدمجة موفرة للطاقة لإضاءة سطح الطهي بالكامل',
    features_en: 'Massive 1000 m³/h turbo extraction power\n3 extraction speeds plus intensive boost mode\nWhisper-quiet motor with acoustic insulation\n5-layer washable aluminum grease filters\nDual energy-efficient LED cooktop illumination',
    tips_ar: 'ينصح بتشغيل الشفاط قبل بدء الطهي بدقيقتين وتركه يعمل 5 دقائق بعد الانتهاء لتنقية الهواء بالكامل.',
    tips_en: 'Switch on the hood 2 minutes before cooking and let it run for 5 minutes after to purify room air.',
    shipping_info_ar: 'شحن آمن وضمان سنتان مع توفير فلاتر كربونية إضافية عند الطلب.',
    shipping_info_en: 'Secure delivery and 2 years warranty with optional charcoal filters available.',
    attributes: {
      'المقاس': ['90 سم'],
      'قوة الشفط': ['1000 م³/ساعة'],
      'عدد السرعات': ['3 سرعات + Booster'],
      'بلد المنشأ': ['إيطاليا (Made in Italy)'],
      'نوع الفلاتر': ['ألمنيوم متعدد الطبقات قابل للغسيل'],
      'الضمان': ['سنتان شامل المحرك']
    },
    colors: [
      { label: 'ستانلس ستيل مطفي', color: '#64748b' }
    ],
    sizes: ['90 سم'],
    images: [
      'public/catalog_images/prod_178_0.jpg',
      'public/catalog_images/prod_178_1.jpg',
      'public/catalog_images/prod_178_2.jpg',
      'public/catalog_images/prod_149.jpg'
    ]
  },
  {
    sku: 'MG-WH12L-SMART',
    name_ar: 'سخان مياه غاز فوري ذكي ديجيتال 12 لتر مع شاشة لمس',
    name_en: 'Mastergas Smart 12L Digital Instant Gas Water Heater',
    category_id: '58',
    price: '1280',
    discount: '8',
    quantity: '40',
    desc_ar: 'سخان مياه غاز فوري ذكي بدون خزان بسعة 12 لتر/دقيقة، مزود بشاشة ديجيتال لمراقبة وضبط درجة الحرارة بدقة متناهية، ومبادل حراري من النحاس الخالي من الأكسجين، ونظام أمان سباعي ضد زيادة الضغط وارتفاع الحرارة.',
    desc_en: 'Smart tankless instant gas water heater providing 12L/min continuous hot water, digital LED temperature touch control, oxygen-free copper heat exchanger, and 7-fold safety protections.',
    features_ar: 'تدفق مياه ساخنة مستمر وفوري بسعة 12 لتر في الدقيقة\nشاشة LED لمسية ذكية لضبط درجة الحرارة بدقة 1 درجة مئوية\nمبادل حراري من النحاس الأحمر النقي الخالي من الأكسجين لعمر أطول\nنظام حماية سباعي: ضد انطفاء اللهب، ارتفاع الضغط، والحرارة الزائدة\nيعمل بكفاءة عالية حتى مع ضغط المياه المنخفض جداً (0.02 ميجا باسكال)',
    features_en: 'Continuous instant hot water flow of 12 Liters per minute\nSmart LED touch screen with 1°C precision temperature control\nPure oxygen-free copper heat exchanger for extended durability\n7-fold multi-protection system for complete home peace of mind\nOperates reliably even under ultra-low water pressure (0.02 MPa)',
    tips_ar: 'يجب تركيب السخان في مكان جيد التهوية مع مدخنة العادم المرفقة واستخدام منظم غاز منخفض الضغط.',
    tips_en: 'Install in a well-ventilated area with the included exhaust flue and use an approved low-pressure regulator.',
    shipping_info_ar: 'شحن سريع خلال 24 ساعة مع ضمان 3 سنوات ومجموعة وصلات التركيب مجاناً.',
    shipping_info_en: 'Fast 24-hour shipping with 3 years warranty and free installation accessory kit.',
    attributes: {
      'السعة': ['12 لتر/دقيقة'],
      'الشاشة': ['شاشة ديجيتال لمسية LED'],
      'المبادل الحراري': ['نحاس أحمر خالي من الأكسجين'],
      'ضغط التشغيل': ['0.02 - 0.8 ميجا باسكال'],
      'بلد المنشأ': ['إيطاليا (Made in Italy)'],
      'الضمان': ['3 سنوات معتمدة']
    },
    colors: [
      { label: 'أبيض لؤلؤي', color: '#f8fafc' },
      { label: 'رمادي تيتانيوم', color: '#475569' }
    ],
    sizes: ['12 لتر'],
    images: [
      'public/catalog_images/prod_177_0.jpg',
      'public/catalog_images/prod_177_1.jpg',
      'public/catalog_images/prod_177_2.jpg',
      'public/catalog_images/prod_164.jpg'
    ]
  },
  {
    sku: 'MG-BBQ4B-PRO',
    name_ar: 'شواية باربيكيو غاز فاخرة 4 شعلات للمزارع والحدائق مع شعلة جانبية',
    name_en: 'Mastergas Professional 4-Burner Outdoor Gas BBQ Grill',
    category_id: '59',
    price: '4250',
    discount: '15',
    quantity: '15',
    desc_ar: 'شواية باربيكيو غاز فاخرة مصنوعة من الستانلس ستيل المقاوم للصدأ وعوامل الطقس، مزودة بـ 4 شعلات رئيسية مع شعلة جانبية لتحضير الصلصات، وغطاء مزدوج مع مقياس حرارة مدمج وعجلات قفل للتحريك السلس.',
    desc_en: 'Premium outdoor 4-burner stainless steel gas barbecue grill with infrared side sear burner, double-layer hood with integrated thermometer, and heavy-duty swivel locking casters.',
    features_ar: '4 شعلات ستانلس ستيل رئيسية فائقة القوة بقدرة إجمالية 58,000 BTU\nشعلة جانبية مدمجة مخصصة للمقالي والصلصات\nشبكات طهي من حديد الزهر المطلي بالمينا لحفظ الحرارة وطهي مثالي\nغطاء مزدوج الجدار مع مقياس حرارة دقيق للتحكم في الشواء غير المباشر\nخزانة سفلية واسعة لتخزين أسطوانة الغاز وأدوات الشواء مع عجلات دوارة',
    features_en: '4 high-output stainless steel burners delivering 58,000 total BTU\nDedicated side burner for pans and sauces\nHeavy porcelain-enameled cast-iron cooking grates\nDouble-walled stainless hood with built-in precision thermometer\nSpacious lower cabinet for cylinder storage with 360° locking wheels',
    tips_ar: 'احرص على تغطية الشواية بالغطاء الواقي المرفق بعد أن تبرد لحمايتها من العوامل الجوية والغبار.',
    tips_en: 'Always cover the grill with the included weather cover once cool to protect against dust and rain.',
    shipping_info_ar: 'توصيل مصفح مجاني مع خدمة التجميع والتركيب في موقع العميل.',
    shipping_info_en: 'Complimentary reinforced delivery with on-site assembly service.',
    attributes: {
      'عدد الشعلات': ['4 شعلات رئيسية + 1 جانبية'],
      'القدرة الحرارية': ['58,000 BTU'],
      'الخامة': ['ستانلس ستيل 304 عالي المقاومة'],
      'الأبعاد': ['142 × 58 × 120 سم'],
      'بلد المنشأ': ['إيطاليا (Made in Italy)'],
      'الضمان': ['سنتان شامل الهيكل والشعلات']
    },
    colors: [
      { label: 'ستانلس ستيل فضي', color: '#94a3b8' }
    ],
    sizes: ['142 سم'],
    images: [
      'public/catalog_images/prod_179_0.jpg',
      'public/catalog_images/prod_179_1.jpg',
      'public/catalog_images/prod_179_2.jpg',
      'public/catalog_images/prod_167.jpg'
    ]
  },
  {
    sku: 'MG-DET-SHUT01',
    name_ar: 'نظام كاشف تسريب الغاز الذكي مع صمام إغلاق كهرومغناطيسي تلقائي',
    name_en: 'Mastergas Smart Gas Leak Detector with Auto Shutoff Valve',
    category_id: '56',
    price: '385',
    discount: '5',
    quantity: '60',
    desc_ar: 'نظام حماية أمان متكامل يشمل كاشف تسريب غاز ذكي عالي الحساسية متصل بصمام كهرومغناطيسي إيطالي يغلق إمداد الغاز فورياً وتلقائياً خلال 0.5 ثانية عند استشعار أي تسريب مع إطلاق صفارة إنذار 85 ديسيبل.',
    desc_en: 'Advanced gas leak safety package featuring an ultra-sensitive catalytic gas sensor paired with an Italian electromagnetic shutoff valve that automatically cuts gas supply within 0.5s with an 85dB alarm.',
    features_ar: 'استشعار فائق الدقة لغاز الميثان وغاز البترول المسال LPG\nصمام إغلاق كهرومغناطيسي سريع يقطع الغاز آلياً في أقل من 0.5 ثانية\nإنذار صوتي قوي 85 ديسيبل مع إضاءة فلاش حمراء تحذيرية\nزر فحص ذاتي (Self-Test) للتأكد من جاهزية النظام بضغطة واحدة\nيمكن ربطه بأنظمة الإنذار المركزية والمنازل الذكية',
    features_en: 'Ultra-sensitive detection of methane and LPG fuel gases\nRapid electromagnetic valve cuts off gas in under 0.5 seconds\nLoud 85dB acoustic siren accompanied by flashing red LED strobe\nSingle-button self-test feature to verify readiness\nCompatible with home automation and centralized alarm systems',
    tips_ar: 'ركب الكاشف على بعد 30 سم من الأرض لغاز الأسطوانات LPG أو 30 سم من السقف للغاز الطبيعي.',
    tips_en: 'Mount the sensor 30cm from the floor for LPG or 30cm from ceiling for natural gas.',
    shipping_info_ar: 'شحن فوري خلال 24 ساعة وضمان استبدال فوري لمدة سنتين.',
    shipping_info_en: 'Immediate 24-hour dispatch with 2-year direct replacement warranty.',
    attributes: {
      'سرعة الاستجابة': ['أقل من 0.5 ثانية'],
      'مستوى الإنذار': ['85 ديسيبل (dB)'],
      'مقاس الصمام': ['1/2 بوصة نحاس معتمد'],
      'جهد التشغيل': ['110 - 240 فولت'],
      'بلد المنشأ': ['إيطاليا (Made in Italy)'],
      'الضمان': ['سنتان استبدال فوري']
    },
    colors: [
      { label: 'أبيض ناصع', color: '#ffffff' }
    ],
    sizes: ['معيار 1/2 بوصة'],
    images: [
      'public/catalog_images/prod_182_0.jpg',
      'public/catalog_images/prod_182_1.jpg',
      'public/catalog_images/prod_182_2.jpg',
      'public/catalog_images/prod_158.jpg'
    ]
  },
  {
    sku: 'MG-REG-MANO90',
    name_ar: 'منظم غاز إيطالي عالي الجودة مع ساعة ضغط مانومتر وصمام أمان',
    name_en: 'Mastergas Certified Italian Gas Regulator with Pressure Gauge',
    category_id: '52',
    price: '185',
    discount: '0',
    quantity: '100',
    desc_ar: 'منظم غاز إيطالي أصلي معتمد حاصل على علامة الجودة، مزود بساعة قياس ضغط (مانومتر) دقيقة لمعرفة كمية الغاز المتبقية وكشف أي تسريب في الشبكة، مع صمام أمان تلقائي ضد زيادة التدفق مفاجئ.',
    desc_en: 'Genuine certified Italian high-pressure gas regulator equipped with a precision manometer gauge for leak detection and fuel level tracking, with built-in excess flow safety shutoff.',
    features_ar: 'صناعة إيطالية أصلية 100% مطابقة للمواصفات والمقاييس\nساعة مانومتر لقياس الضغط بدقة وكشف التسريبات قبل التشغيل\nصمام أمان مدمج يغلق التدفق فوراً في حال قطع أو انفلات الخرطوم\nهيكل نحاسي متين مقاوم للتآكل والصدأ وظروف الطقس القاسية\nمفتاح تحكم مريح لفتح وإغلاق تدفق الغاز بسهولة وأمان',
    features_en: '100% Authentic Italian manufacture complying with safety standards\nIntegrated manometer gauge for pressure check and pre-operation leak testing\nBuilt-in excess flow check valve activates if hose detaches\nRugged solid brass body resistant to corrosion and extreme weather\nErgonomic handle for smooth on/off gas flow control',
    tips_ar: 'استخدم دائماً رغوة الصابون للتأكد من عدم وجود تسريب عند ربط المنظم بالأسطوانة لأول مرة.',
    tips_en: 'Always use soapy water test to ensure 100% tight connection when attaching regulator.',
    shipping_info_ar: 'توصيل خلال يومين عمل مع كيس لحماية المنظم مجاناً.',
    shipping_info_en: 'Delivery within 2 business days with free storage pouch.',
    attributes: {
      'نوع المنظم': ['منظم ضغط مع مانومتر'],
      'مادة الصنع': ['نحاس نقي صلب ومقاوم'],
      'بلد المنشأ': ['إيطاليا (Made in Italy)'],
      'ضغط الخروج': ['قابل للضبط 20 - 60 ملي بار'],
      'الاعتماد': ['مطابق للمواصفات القياسية SASO / CE'],
      'الضمان': ['3 سنوات']
    },
    colors: [
      { label: 'أخضر زمردي مع نحاس', color: '#059669' }
    ],
    sizes: ['قياسي لكافة الأسطوانات'],
    images: [
      'public/catalog_images/prod_181_0.jpg',
      'public/catalog_images/prod_181_1.jpg',
      'public/catalog_images/prod_181_2.jpg',
      'public/catalog_images/prod_146.jpg'
    ]
  },
  {
    sku: 'MG-CYL-COMP24',
    name_ar: 'أسطوانة غاز فيبر جلاس خفيفة الوزن ومضادة للانفجار 24.5 لتر',
    name_en: 'Mastergas Ultra-Light Composite LPG Gas Cylinder 24.5L',
    category_id: '51',
    price: '449',
    discount: '10',
    quantity: '50',
    desc_ar: 'أسطوانة غاز مصنوعة من ألياف الفيبر جلاس المركبة الحديثة المقاومة للصدأ والانفجار بنسبة 100%، وتتميز بوزن خفيف جداً يسهل حملها ورؤية مستوى الغاز المتبقي من الخارج بشفافية عالية.',
    desc_en: 'Ultra-lightweight 24.5L composite fiberglass LPG gas cylinder, 100% explosion-proof, completely rust-free, translucent body for effortless gas level visibility, and ergonomic handles.',
    features_ar: 'آمنة تماماً ومقاومة للانفجار بنسبة 100% حتى في أشد حالات الحريق\nوزن خفيف جداً (نصف وزن الأسطوانة الحديدية التقليدية)\nجسم شفاف نصف شفاف يسمح برؤية مستوى الغاز المتبقي بالعين المجردة\nمقاومة تامة للصدأ والتآكل ولا تترك أي بقع على الأرضيات أو أسطح المطبخ\nمقابض مريحة مصممة هندسياً لسهولة الحمل والتبديل في أي وقت',
    features_en: '100% explosion-proof and shatter-proof even in extreme fire conditions\nUltra-lightweight (less than half the weight of traditional steel cylinders)\nTranslucent casing lets you monitor gas level at a glance\nCorrosion-free, never rusts or stains your floors and cabinets\nErgonomic built-in handles for effortless lifting and swapping',
    tips_ar: 'تأكد من تخزين الأسطوانة في وضع رأسي دائماً وفي مكان مظلل وجيد التهوية.',
    tips_en: 'Always store cylinder upright in a shaded, well-ventilated location.',
    shipping_info_ar: 'توصيل مبرد وآمن حتى باب المنزل مع ضمان شامل 5 سنوات.',
    shipping_info_en: 'Safe delivery directly to your door with 5-year comprehensive warranty.',
    attributes: {
      'السعة': ['24.5 لتر (10 كجم غاز)'],
      'الوزن فارغة': ['5.3 كجم فقط'],
      'مادة الصنع': ['فيبر جلاس مركب مقاوم للانفجار'],
      'مقاومة الصدأ': ['مقاومة 100% (Rust-Free)'],
      'بلد المنشأ': ['أوروبا (European Standard)'],
      'الضمان': ['5 سنوات شامل']
    },
    colors: [
      { label: 'برتقالي ماسترجاز', color: '#ea580c' },
      { label: 'رمادي عصري', color: '#475569' }
    ],
    sizes: ['24.5 لتر (10 كجم)'],
    images: [
      'public/catalog_images/prod_180_0.jpg',
      'public/catalog_images/prod_180_1.jpg',
      'public/catalog_images/prod_180_2.jpg',
      'public/catalog_images/prod_143.jpg'
    ]
  }
];

async function main() {
  console.log('=== Step 1: Login as Admin ===');
  const loginRes = await fetch(`${API_BASE}/v1/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email: 'admin@tijara.com', password: 'password123' })
  });

  if (!loginRes.ok) {
    const txt = await loginRes.text();
    throw new Error(`Login failed (${loginRes.status}): ${txt}`);
  }
  const { token } = await loginRes.json();
  console.log('Admin login successful! Token acquired.\n');

  const uploadedResults = [];

  for (let idx = 0; idx < productsToUpload.length; idx++) {
    const p = productsToUpload[idx];
    console.log(`----------------------------------------------------------------`);
    console.log(`[${idx + 1}/7] Uploading Product: "${p.name_ar}" (SKU: ${p.sku})`);
    console.log(`Price: ${p.price} | Category ID: ${p.category_id} | Stock: ${p.quantity}`);

    const formData = new FormData();
    formData.append('name', JSON.stringify({ ar: p.name_ar, en: p.name_en }));
    formData.append('description', JSON.stringify({ ar: p.desc_ar, en: p.desc_en }));
    formData.append('price', p.price);
    formData.append('quantity', p.quantity);
    formData.append('category_id', p.category_id);
    formData.append('is_active', '1');
    formData.append('discount', p.discount);
    formData.append('sku', p.sku);

    formData.append('features', JSON.stringify({ ar: p.features_ar, en: p.features_en }));
    formData.append('tips', JSON.stringify({ ar: p.tips_ar, en: p.tips_en }));
    formData.append('shipping_info', JSON.stringify({ ar: p.shipping_info_ar, en: p.shipping_info_en }));

    formData.append('attributes', JSON.stringify(p.attributes));
    formData.append('color_options', JSON.stringify(p.colors));
    formData.append('size_options', JSON.stringify(p.sizes));

    // Primary image
    const mainBuf = fs.readFileSync(p.images[0]);
    const mainBlob = new Blob([mainBuf], { type: 'image/jpeg' });
    formData.append('image', mainBlob, `${p.sku.toLowerCase()}_main.jpg`);

    // All 4 images in images[]
    for (let i = 0; i < p.images.length; i++) {
      const buf = fs.readFileSync(p.images[i]);
      const blob = new Blob([buf], { type: 'image/jpeg' });
      formData.append('images[]', blob, `${p.sku.toLowerCase()}_img_${i + 1}.jpg`);
    }

    const res = await fetch(`${API_BASE}/dashboard/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: formData
    });

    const resText = await res.text();
    let resJson;
    try {
      resJson = JSON.parse(resText);
    } catch (_) {
      console.error(`Failed to parse response:`, resText);
    }

    const createdProd = resJson?.data || resJson?.product || resJson;
    const prodId = createdProd?.id;

    if (res.ok && prodId) {
      console.log(`=> SUCCESS! Created Product ID: ${prodId}`);
      console.log(`=> Images count returned: ${(createdProd.images || []).length}`);
      uploadedResults.push({
        id: prodId,
        sku: p.sku,
        name_ar: p.name_ar,
        name_en: p.name_en,
        price: p.price,
        discount: p.discount,
        category: p.category_id,
        stock: p.quantity,
        images: createdProd.images || [],
        primary_image: createdProd.image
      });
    } else {
      console.error(`=> FAILED! Status: ${res.status}`, resText);
    }
  }

  console.log('\n================================================================');
  console.log(`=== Upload Summary: ${uploadedResults.length} / 7 Products Successfully Created ===`);
  console.log('================================================================\n');

  // Verify each from Storefront
  console.log('=== Step 3: Verifying all from Public Storefront API ===');
  for (const item of uploadedResults) {
    const storeRes = await fetch(`${API_BASE}/frontend/products/${item.id}`, {
      headers: { 'Accept': 'application/json' }
    });
    const storeJson = await storeRes.json();
    const pData = storeJson?.data;
    console.log(`- Product #${item.id} [${item.sku}]: Storefront status ${storeRes.status} | Images: ${(pData?.images || []).length} | Price: ${pData?.price}`);
  }

  fs.writeFileSync('scripts/uploaded_7_products_result.json', JSON.stringify(uploadedResults, null, 2));
  console.log('\nSaved full report to scripts/uploaded_7_products_result.json');
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
