import fs from 'node:fs';
import path from 'node:path';

const API_BASE = 'https://backend-mastergas.be-kite.com/api';
const EMAIL = 'admin@tijara.com';
const PASSWORD = 'password123';

const products = [
  {
    sku: 'MG-OVEN90-LUX',
    category_id: '57',
    price: '3899',
    discount: '10',
    quantity: '25',
    name_ar: 'فرن غاز مدمج إيطالي ماسترجاز 90 سم أمان كامل شواية دوارة',
    name_en: 'Mastergas 90cm Italian Built-in Gas Oven Full Safety Rotisserie',
    desc_ar: 'فرن غاز مدمج إيطالي فاخر مقاس 90 سم سعة 85 لتر، مصنع من الستانلس ستيل المقاوم للبصمات مع زجاج عاكس مزدوج، أمان إيطالي كامل فوري، إشعال إلكتروني وشواية دائرية دوارة متطورة.',
    desc_en: 'Luxury 90cm 85L Italian built-in gas oven featuring fingerprint-proof stainless steel, dual reflective glass door, instant flame failure safety, and motorized rotisserie turnspit.',
    features_ar: 'سعة داخلية عملاقة 85 لتر تكفي للعزائم الكبيرة\nشواية دائرية دوارة لتحمير متساوي واحترافي\nنظام أمان إيطالي كامل يقطع الغاز فور انطفاء اللهب\nمروحة توزيع حراري تيربو ثلاثية الأبعاد\nشاشة ديجيتال LED مع مؤقت ذكي لضبط وقت الطهي\nباب زجاجي ثلاثي الطبقات بارد الملمس من الخارج',
    features_en: 'Spacious 85L cavity capacity for large family meals\nMotorized rotisserie for even professional browning\nInstantaneous Italian flame safety shutdown system\n3D Turbo convection fan for rapid heat distribution\nSmart digital LED timer display\nTriple-glazed cool-touch glass door',
    tips_ar: 'ينصح بتسخين الفرن مسبقاً لمدة 10 دقائق قبل إدخال الصواني لضمان نضج متجانس.',
    tips_en: 'Preheat the oven for 10 minutes prior to baking for optimal and uniform results.',
    shipping_info_ar: 'شحن مجاني سريع مع خدمة التركيب المعتمدة من ماسترجاز وضمان 3 سنوات.',
    shipping_info_en: 'Free express delivery, certified Mastergas installation, and 3-year full warranty.',
    attributes: {
      'الألوان': ['أسود ملكي', 'فضي'],
      'العرض': ['89.5 سم'],
      'الارتفاع': ['59.5 سم'],
      'العمق': ['56 سم'],
      'السعة': ['85 لتر'],
      'نوع الطاقة': ['غاز طبيعي / مسال'],
      'الجهد الكهربائي': ['220-240 فولت'],
      'وظائف الطهي': ['6 وظائف'],
      'صمام الأمان': ['أمان كامل فوري'],
      'المؤقت الرقمي': ['شاشة رقمية LED'],
      'اللون والمظهر': ['ستانلس ستيل ورمادي معدني'],
      'نظام الإشعال': ['إلكتروني مدمج بالمفتاح'],
      'بلد المنشأ': ['إيطاليا']
    },
    colors: [
      { label: 'أسود ملكي', color: '#111827' },
      { label: 'فضي', color: '#9ca3af' }
    ],
    sizes: ['90 سم'],
    images: [
      'public/catalog_images/prod_173_0.jpg',
      'public/catalog_images/prod_173_1.jpg',
      'public/catalog_images/prod_173_2.jpg'
    ]
  },
  {
    sku: 'MG-HOB90-5B-GLASS',
    category_id: '57',
    price: '2349',
    discount: '8',
    quantity: '30',
    name_ar: 'مسطح غاز زجاجي بلت إن ماسترجاز 5 شعلات 90 سم مع شعلة ووك',
    name_en: 'Mastergas 90cm 5-Burner Tempered Glass Built-in Gas Hob with Wok',
    desc_ar: 'مسطح غاز بلت إن فاخر 90 سم مصنوع من الزجاج الحراري المقسّى الأسود المقاوم للصدمات، 5 شعلات غاز متطورة مع شعلة ووك ثلاثية وحوامل حديد زهر ثقيلة وأمان كامل.',
    desc_en: 'Premium 90cm 5-burner tempered black glass built-in gas hob equipped with a powerful triple-flame wok burner, heavy cast-iron supports, and automatic safety valves.',
    features_ar: 'زجاج حراري أسود مقسّى مقاوم للحرارة والخدش 8 مم\nشعلة ووك ثلاثية التاج بقدرة 4.2kW للطهي فائق السرعة\nشبك ثقيل من حديد الزهر يوفر أقصى ثبات للأواني\nنظام حماية ثلاثية متكاملة لقطع الغاز الفوري\nإشعال إلكتروني أوتوماتيكي فوري مدمج بالمقابض',
    features_en: 'Heavy-duty 8mm tempered scratch-resistant thermal glass\nTriple-flame 4.2kW high-output wok burner\nHeavy-duty cast iron pan supports for absolute stability\nIntegrated triple safety protection with instant cutoff\nAutomatic one-touch knob ignition',
    tips_ar: 'استخدم قطعة قماش ميكروفايبر ناعمة لتنظيف السطح الزجاجي بعد أن يبرد للحفاظ على لمعانه.',
    tips_en: 'Use a soft microfiber cloth to clean the glass surface once cooled to maintain its pristine shine.',
    shipping_info_ar: 'شحن آمن لكافة مناطق المملكة مع ضمان شامل لمدة سنتين.',
    shipping_info_en: 'Insured shipping across the Kingdom with a comprehensive 2-year warranty.',
    attributes: {
      'الألوان': ['أسود ملكي', 'ستانلس ستيل'],
      'العرض': ['86 سم'],
      'الارتفاع': ['5 سم'],
      'العمق': ['51 سم'],
      'السعة': ['5 شعلات غاز'],
      'نوع الطاقة': ['غاز مسال'],
      'الجهد الكهربائي': ['220-240 فولت'],
      'صمام الأمان': ['حماية ثلاثية متكاملة'],
      'المؤقت الرقمي': ['لا'],
      'اللون والمظهر': ['زجاج حراري مقسّى أسود'],
      'نظام الإشعال': ['إلكتروني أوتوماتيكي فوري'],
      'بلد المنشأ': ['إيطاليا']
    },
    colors: [
      { label: 'أسود ملكي', color: '#111827' },
      { label: 'ستانلس ستيل', color: '#c0c0c0' }
    ],
    sizes: ['90 سم'],
    images: [
      'public/catalog_images/prod_174_0.jpg',
      'public/catalog_images/prod_174_1.jpg',
      'public/catalog_images/prod_174_2.jpg'
    ]
  },
  {
    sku: 'MG-HOOD90-PYRAMID',
    category_id: '57',
    price: '1799',
    discount: '12',
    quantity: '20',
    name_ar: 'شفاط مطبخ هرمي إيطالي ماسترجاز 90 سم بقوة شفط 1200 م³/ساعة',
    name_en: 'Mastergas 90cm Italian Pyramid Cooker Hood 1200 m³/h Suction',
    desc_ar: 'شفاط مطبخ هرمي جداري 90 سم بتصميم إيطالي عصري ومحرك توربيني قوي بقوة سحب 1200 م³/ساعة، فلاتر ألمنيوم 5 طبقات قابلة للغسيل وإضاءة LED نقية ومؤشر حرارة رقمي.',
    desc_en: 'Mastergas 90cm Italian pyramid chimney hood with heavy 1200 m³/h suction capacity, washable 5-layer aluminum filters, dual LED lighting, and digital temperature indicator.',
    features_ar: 'محرك توربيني فائق القوة لسحب 1200 متر مكعب/ساعة\n3 سرعات تشغيل مع خاصية التربو المكثف\nفلاتر ألمنيوم خماسية الطبقات لحجز الدهون بنسبة 99%\nإضاءة LED بيضاء ساطعة موفرة للطاقة\nشاشة تحكم ديجيتال مع مؤشر حرارة رقمي',
    features_en: 'Ultra-powerful turbo blower extracting 1200 m³/h\n3 speed settings plus intensive boost mode\n5-layer washable aluminum grease filters\nDual energy-efficient bright white LED spots\nDigital touch interface with temperature readout',
    tips_ar: 'اغسل الفلاتر في غسالة الأطباق مرة كل شهر للحفاظ على كفاءة الشفط القصوى.',
    tips_en: 'Wash aluminum filters monthly in the dishwasher for maximum extraction efficiency.',
    shipping_info_ar: 'توصيل سريع مع كافة ملحقات التركيب والمدخنة وضمان سنتان.',
    shipping_info_en: 'Express delivery with chimney ducting kit included and 2-year warranty.',
    attributes: {
      'الألوان': ['فضي', 'ستانلس ستيل'],
      'العرض': ['90 سم'],
      'الارتفاع': ['115 سم'],
      'العمق': ['50 سم'],
      'السعة': ['قوة شفط 1200 م³/ساعة'],
      'نوع الطاقة': ['كهرباء 230 واط'],
      'الجهد الكهربائي': ['220-240 فولت'],
      'صمام الأمان': ['أمان كامل'],
      'المؤقت الرقمي': ['مؤشر حرارة رقمي'],
      'اللون والمظهر': ['ستانلس ستيل وأسود'],
      'بلد المنشأ': ['إيطاليا']
    },
    colors: [
      { label: 'فضي', color: '#9ca3af' },
      { label: 'ستانلس ستيل', color: '#c0c0c0' }
    ],
    sizes: ['90 سم'],
    images: [
      'public/catalog_images/prod_175_0.jpg',
      'public/catalog_images/prod_175_1.jpg',
      'public/catalog_images/prod_175_2.jpg'
    ]
  },
  {
    sku: 'MG-HOB60-4B-SS',
    category_id: '57',
    price: '1499',
    discount: '5',
    quantity: '35',
    name_ar: 'مسطح غاز ستانلس ستيل بلت إن ماسترجاز 4 شعلات 60 سم',
    name_en: 'Mastergas 60cm 4-Burner Built-in Stainless Steel Gas Hob',
    desc_ar: 'مسطح غاز مدمج 60 سم من الستانلس ستيل المقاوم للصدأ 304، يحتوي على 4 شعلات غاز إيطالية متوازنة، حوامل حديد زهر صلبة، إشعال إلكتروني مدمج بالمفتاح وصمامات أمان كاملة معتمدة.',
    desc_en: 'Compact 60cm 4-burner built-in gas hob engineered from premium 304 stainless steel, featuring cast-iron grids, one-hand knob ignition, and certified safety valves.',
    features_ar: 'سطح ستانلس ستيل 304 سميك ومقاوم للحرارة والتآكل\n4 شعلات غاز إيطالية تناسب مختلف أحجام أواني الطهي\nصمامات أمان معتمدة تمنع تسرب الغاز تلقائياً\nإشعال إلكتروني مدمج بالمفتاح لسهولة الاستخدام بيد واحدة\nتصميم مدمج عصري يناسب المطابخ الحديثة 60 سم',
    features_en: 'Thick 304 stainless steel body resistant to high heat and corrosion\n4 Italian burners accommodating diverse cookware sizes\nCertified flame safety valves preventing gas leaks automatically\nIntegrated one-hand rotary electronic ignition\nSleek 60cm space-efficient modern footprint',
    tips_ar: 'نظف السطح بعد كل استخدام بمنظف ستانلس ستيل غير كاشط للحفاظ على لمعان المعدن.',
    tips_en: 'Wipe down after each use with non-abrasive stainless cleaner to retain pristine sheen.',
    shipping_info_ar: 'شحن سريع خلال يومين مع ضمان استبدال فوري وضمان سنتين.',
    shipping_info_en: '2-day express courier dispatch with instant exchange guarantee and 2 years warranty.',
    attributes: {
      'الألوان': ['ستانلس ستيل', 'أسود ملكي'],
      'العرض': ['58 سم'],
      'الارتفاع': ['4.5 سم'],
      'العمق': ['50 سم'],
      'السعة': ['4 شعلات غاز'],
      'نوع الطاقة': ['غاز طبيعي / مسال'],
      'الجهد الكهربائي': ['220-240 فولت'],
      'صمام الأمان': ['صمامات أمان معتمدة'],
      'اللون والمظهر': ['ستانلس ستيل 304'],
      'نظام الإشعال': ['إلكتروني مدمج بالمفتاح'],
      'بلد المنشأ': ['إيطاليا']
    },
    colors: [
      { label: 'ستانلس ستيل', color: '#c0c0c0' },
      { label: 'أسود ملكي', color: '#111827' }
    ],
    sizes: ['60 سم'],
    images: [
      'public/catalog_images/prod_176_0.jpg',
      'public/catalog_images/prod_176_1.jpg',
      'public/catalog_images/prod_176_2.jpg'
    ]
  },
  {
    sku: 'MG-BBQ-4B-GRILL',
    category_id: '59',
    price: '4499',
    discount: '15',
    quantity: '15',
    name_ar: 'شواية باربيكيو غاز فاخرة 4 شعلات للحدائق والمزارع مع مقياس حرارة',
    name_en: 'Mastergas Premium 4-Burner Outdoor Gas BBQ Grill with Thermometer',
    desc_ar: 'شواية غاز خارجية فاخرة للحدائق والاستراحات مزودة بـ 4 شعلات رئيسية وشبكات طهي واسعة من الستانلس ستيل المقاوم للصدأ، مقياس حرارة مدمج بالغطاء، عجلات قوية لنقل سلس، وأرفف جانبية للتحضير.',
    desc_en: 'Luxury 4-burner outdoor gas BBQ grill crafted for patios and gardens with heavy-duty cooking grates, lid-mounted temperature gauge, smooth mobility casters, and prep shelves.',
    features_ar: '4 شعلات غاز أنبوبية من الستانلس ستيل بقوة حرارية فائقة\nمساحة شواء رحبة 70 × 45 سم تكفي لتحضير وجبات كبيرة\nمقياس حرارة دقيق مدمج بالغطاء لمراقبة مستوى النضج\nصمامات نحاسية آمنة مع نظام إشعال بيزو ذاتي\nهيكل خارجي أسود مطلي حرارياً ومقاوم للظروف الجوية',
    features_en: '4 heavy stainless steel tubular burners delivering intense even heat\nExpansive 70 x 45 cm cooking zone for large outdoor barbecues\nPrecision lid-mounted dial thermometer for temperature control\nHeavy-duty brass valves and instant piezo spark ignition\nAll-weather thermo-powder coated matte exterior',
    tips_ar: 'احرص على تنظيف شبك الشواء بالفرشاة المخصصة وتغطية الشواية بالغطاء الواقي بعد الاستخدام.',
    tips_en: 'Brush the grilling grates clean and cover with a weatherproof tarp after cooling.',
    shipping_info_ar: 'شحن خاص للطلبات الثقيلة مع خدمة التركيب الميداني وضمان سنتين.',
    shipping_info_en: 'White-glove heavy freight shipping with on-site assembly and 2-year warranty.',
    attributes: {
      'الألوان': ['أسود ملكي', 'فضي'],
      'العرض': ['135 سم'],
      'الارتفاع': ['115 سم'],
      'العمق': ['58 سم'],
      'السعة': ['مساحة شواء 70 × 45 سم'],
      'نوع الطاقة': ['غاز مسال'],
      'الجهد الكهربائي': ['لا يتطلب كهرباء'],
      'صمام الأمان': ['صمامات نحاسية آمنة'],
      'المؤقت الرقمي': ['مقياس حرارة مدمج بالغطاء'],
      'اللون والمظهر': ['أسود ملكي'],
      'نظام الإشعال': ['إشعال بيزو ذاتي'],
      'بلد المنشأ': ['إيطاليا']
    },
    colors: [
      { label: 'أسود ملكي', color: '#111827' },
      { label: 'فضي', color: '#9ca3af' }
    ],
    sizes: ['135 سم'],
    images: [
      'public/catalog_images/prod_180_0.jpg',
      'public/catalog_images/prod_180_1.jpg',
      'public/catalog_images/prod_180_2.jpg'
    ]
  },
  {
    sku: 'MG-WATER-HEATER-12L',
    category_id: '58',
    price: '1349',
    discount: '10',
    quantity: '40',
    name_ar: 'سخان مياه غاز فوري رقمي ماسترجاز 12 لتر أمان كامل ODS',
    name_en: 'Mastergas 12L Digital Instant Gas Water Heater Full ODS Safety',
    desc_ar: 'سخان مياه غاز فوري ذكي ديجيتال سعة 10-12 لتر/دقيقة، تدفق مياه ساخنة فوري ومستمر بدون انقطاع، شاشة رقمية LED لضبط درجة الحرارة، نظام أمان ODS متطور يقطع الغاز تلقائياً عند نقص الأكسجين أو الميلان.',
    desc_en: 'Smart 12L/min instant tankless gas water heater delivering uninterrupted hot water, digital LED temperature display, and multi-stage ODS safety shutting off upon oxygen depletion.',
    features_ar: 'تدفق مستمر للمياه الساخنة الفورية حتى 10-12 لتر في الدقيقة\nشاشة رقمية LED تعرض درجة حرارة المياه بدقة عالية\nنظام أمان ODS الذكي مع قفل أوتوماتيكي عند نقص الأكسجين أو الميلان\nإشعال أوتوماتيكي ذكي يعمل تلقائياً فور فتح صنبور المياه\nيعمل بكفاءة عالية حتى مع ضغط المياه المنخفض',
    features_en: 'Continuous instant hot water delivery of 10-12 Liters per minute\nBright digital LED interface displaying exact output temperature\nAdvanced ODS oxygen depletion safety with auto-tilt shutoff\nInstant automatic ignition triggered immediately upon water tap turn\nReliable high-efficiency performance under low water pressure',
    tips_ar: 'تأكد من تركيب مدخنة تصريف العادم بشكل سليم وعدم سد فتحات التهوية المحيطة بالسخان.',
    tips_en: 'Ensure the flue vent pipe is properly vented outside with clear airflow around the unit.',
    shipping_info_ar: 'توصيل سريع خلال 24 ساعة في كافة المدن مع ضمان شامل 3 سنوات.',
    shipping_info_en: '24-hour express courier delivery across all cities with 3-year full warranty.',
    attributes: {
      'الألوان': ['أبيض', 'فضي'],
      'العرض': ['35 سم'],
      'الارتفاع': ['72 سم'],
      'العمق': ['18 سم'],
      'السعة': ['10 لتر / دقيقة'],
      'نوع الطاقة': ['غاز مسال'],
      'الجهد الكهربائي': ['شاشة إلكترونية تعمل بالبطاريات'],
      'صمام الأمان': ['نظام ODS مع قفل عند الميلان'],
      'المؤقت الرقمي': ['شاشة رقمية LED'],
      'اللون والمظهر': ['أبيض ناصع'],
      'نظام الإشعال': ['أوتوماتيكي عند فتح صنبور المياه'],
      'بلد المنشأ': ['إيطاليا']
    },
    colors: [
      { label: 'أبيض', color: '#ffffff' },
      { label: 'فضي', color: '#9ca3af' }
    ],
    sizes: ['12 لتر'],
    images: [
      'public/catalog_images/prod_179_0.jpg',
      'public/catalog_images/prod_179_1.jpg',
      'public/catalog_images/prod_179_2.jpg'
    ]
  }
];

async function main() {
  console.log('=== Step 1: Admin Login ===');
  const loginRes = await fetch(`${API_BASE}/v1/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });

  if (!loginRes.ok) {
    const errText = await loginRes.text();
    throw new Error(`Login failed (${loginRes.status}): ${errText}`);
  }

  const { token } = await loginRes.json();
  console.log('✓ Logged in successfully. Token acquired.\n');

  console.log('=== Step 2: Uploading 6 Products with Attributes & 3 High-Res Images Each ===');
  const uploadedProducts = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`\n[${i + 1}/6] Processing: ${p.sku} - "${p.name_ar}"`);
    console.log(`Price: ${p.price} SAR | Discount: ${p.discount}% | Category: ${p.category_id} | Colors: ${p.colors.map(c => c.label).join(', ')}`);

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

    // Append primary image
    const mainBuf = fs.readFileSync(p.images[0]);
    formData.append('image', new Blob([mainBuf], { type: 'image/jpeg' }), `${p.sku.toLowerCase()}_main.jpg`);

    // Append exactly 3 images into images[]
    for (let imgIdx = 0; imgIdx < p.images.length; imgIdx++) {
      const imgPath = p.images[imgIdx];
      const buf = fs.readFileSync(imgPath);
      formData.append('images[]', new Blob([buf], { type: 'image/jpeg' }), `${p.sku.toLowerCase()}_img_${imgIdx + 1}.jpg`);
    }

    const createRes = await fetch(`${API_BASE}/dashboard/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: formData
    });

    const createText = await createRes.text();
    let createJson;
    try {
      createJson = JSON.parse(createText);
    } catch {
      createJson = { raw: createText };
    }

    if (!createRes.ok) {
      console.error(`✗ Error uploading ${p.sku} (${createRes.status}):`, createJson);
      throw new Error(`Failed to upload ${p.sku}`);
    }

    const createdData = createJson.data || createJson;
    console.log(`✓ Product created successfully! ID: ${createdData.id}`);
    console.log(`  - Attributes stored: ${Object.keys(p.attributes).length} attributes`);
    console.log(`  - Color options: ${p.colors.length} (${p.colors.map(c => c.label).join(', ')})`);
    console.log(`  - Images uploaded: ${p.images.length}`);

    uploadedProducts.push({
      id: createdData.id,
      sku: p.sku,
      name_ar: p.name_ar,
      name_en: p.name_en,
      price: p.price,
      discount: p.discount,
      category_id: p.category_id,
      colors: p.colors,
      attributes_count: Object.keys(p.attributes).length,
      images_count: p.images.length
    });
  }

  console.log('\n=== Step 3: Verification from Backend API ===');
  const verifyRes = await fetch(`${API_BASE}/dashboard/products?per_page=100`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });
  const verifyJson = await verifyRes.json();
  const allProducts = verifyJson.data?.data || verifyJson.data || [];
  console.log(`Total products currently in database: ${allProducts.length}`);

  const report = {
    total_uploaded: uploadedProducts.length,
    total_in_db: allProducts.length,
    products: uploadedProducts
  };

  fs.writeFileSync('scripts/upload_6_products_report.json', JSON.stringify(report, null, 2));
  console.log('\n✓ Report saved to scripts/upload_6_products_report.json');
}

main().catch(err => {
  console.error('\n✗ Fatal Error:', err);
  process.exit(1);
});
