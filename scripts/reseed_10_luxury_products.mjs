import fs from 'node:fs';
import path from 'node:path';

const API_BASE = 'https://backend-mastergas.be-kite.com/api';

async function main() {
  console.log('=== 1. Admin Login ===');
  const loginRes = await fetch(`${API_BASE}/v1/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email: 'admin@tijara.com', password: 'password123' })
  });
  if (!loginRes.ok) throw new Error('Login failed: ' + loginRes.status);
  const { token } = await loginRes.json();
  const headers = { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' };

  console.log('=== 2. Delete All Existing Products ===');
  const allProdsRes = await fetch(`${API_BASE}/dashboard/products?per_page=100`, { headers });
  const allProds = (await allProdsRes.json()).data || [];
  console.log(`Found ${allProds.length} products to delete.`);
  for (const p of allProds) {
    const dRes = await fetch(`${API_BASE}/dashboard/products/${p.id}`, {
      method: 'DELETE',
      headers
    });
    console.log(` - Deleted product ID ${p.id} (${p.name}): ${dRes.status}`);
  }

  console.log('\n=== 3. Seed 10 Luxury Mastergas Products (with 3 High-Quality Images Each) ===');
  const products = [
    {
      name_ar: 'فرن غاز مدمج بلت-إن 60 سم فاخر',
      name_en: 'Mastergas Luxury Built-in Gas Oven 60cm',
      price: '2499',
      quantity: '25',
      category_id: '57',
      sku: 'OG604S',
      desc_ar: 'صمم فرن ماسترجاز المدمج بحجم 60 سم ليقدم تجربة طهي احترافية تضاهي المطابخ الإيطالية العالمية. بفضل سعته الكبيرة البالغة 65 لتر، يمكنك طهي وجبات عائلية متكاملة بكل سهولة.',
      desc_en: 'Engineered in a 60cm built-in format for professional culinary excellence. With its spacious 65L capacity, prepare family meals effortlessly.',
      features_ar: 'سعة 65 لتر طهي مريح لمختلف الوجبات\n4 وظائف طهي مبرمجة هندسياً لأداء متكامل\nإشعال كهربائي ذاتي سهل بلمسة واحدة\nباب زجاجي مزدوج يحفظ الحرارة بكفاءة عالية\nصمام أمان كامل يضمن سلامة المطبخ والمنزل\nصنع بالكامل في إيطاليا بمعايير جودة دقيقة',
      features_en: '65L capacity for versatile cooking\n4 engineered preset cooking functions\nOne-touch safe automatic electric ignition\nDouble-glazed door for superior heat retention\nFull safety cutoff valve for kitchen protection\n100% Made in Italy to exacting standards',
      tips_ar: 'تأكد من إيقاف إمداد الغاز والكهرباء بالكامل قبل البدء. جهز فتحة الخزانة بأبعاد 56 × 56 × 55 سم مع تهوية كافية.',
      tips_en: 'Ensure gas and electrical supplies are shut off before installation. Prepare a 56x56x55cm cabinet opening.',
      images: [
        'public/images/products/oven_main.jpg',
        'public/images/products/oven_thumb_1.jpg',
        'public/images/products/oven_thumb_2.jpg'
      ],
      colors: [
        { label: 'ستانلس ستيل', color: '#cbd5e1' },
        { label: 'أسود مطفي', color: '#111827' }
      ],
      sizes: ['60 سم', '65 لتر'],
      attributes: {
        'color': ['ستانلس ستيل', 'أسود مطفي'],
        'size': ['60 سم', '65 لتر'],
        'material': ['ستانلس ستيل 304 مقاوم للصدأ'],
        'dimensions': ['59.5 × 59.5 × 55 سم'],
        'brand': ['ماسترجاز (Mastergas Italy)'],
        'warranty': ['سنتان شامل الصيانة وقطع الغيار']
      },
      reviews: [
        { rating: 5, comment: 'منتج ممتاز والجودة الإيطالية لا يعلى عليها، التسوية متساوية وممتازة.', name: 'أحمد محمد' },
        { rating: 5, comment: 'فرن رائع وتصميم أنيق جداً في المطبخ، والتوصيل كان سريعاً.', name: 'سارة العتيبي' }
      ]
    },
    {
      name_ar: 'فرن غاز بلت-إن 90 سم إمبراطوري 5 شعلات',
      name_en: 'Mastergas Imperial 90cm Built-in Gas Oven',
      price: '3899',
      quantity: '15',
      category_id: '57',
      sku: 'OG905X',
      desc_ar: 'الفرن الإمبراطوري المتكامل بحجم 90 سم مع شواية دورارة ونظام مروحة توربو لتوزيع الحرارة. خيار الطهاة والمنازل الراقية الباحثة عن السعة والكمال.',
      desc_en: 'Imperial 90cm built-in oven with rotating rotisserie and turbo convection fan for optimal heat circulation.',
      features_ar: 'سعة ضخمة 90 لتر تتسع لأكبر الولائم\nشواية دوارة مدمجة لتحمير مثالي 360 درجة\nمروحة تبريد ومروحة توزيع حراري مزدوجة\nشعلات إيطالية فائقة الكفاءة وموفرة للغاز\nنظام أمان كامل مع قفل أطفال ذكي',
      features_en: 'Massive 90L capacity\nIntegrated 360 rotisserie\nDual cooling and convection fans\nHigh-efficiency Italian burners\nFull safety shutoff with child lock',
      tips_ar: 'يحتاج إلى فتحة خزانة بعرض 86 سم وعمق 56 سم، ويفضل تركيبه بواسطة فني معتمد.',
      tips_en: 'Requires 86cm cabinet cutout width and 56cm depth. Professional installation recommended.',
      images: [
        'public/images/products/oven_thumb_3.jpg',
        'public/images/products/oven_thumb_4.jpg',
        'public/images/products/oven_main.jpg'
      ],
      colors: [
        { label: 'ستانلس ستيل', color: '#cbd5e1' },
        { label: 'رمادي معدني', color: '#6b7280' }
      ],
      sizes: ['90 سم', '80 لتر'],
      attributes: {
        'color': ['ستانلس ستيل', 'رمادي معدني'],
        'size': ['90 سم', '80 لتر'],
        'material': ['ستانلس ستيل 304 مقاوم للصدأ'],
        'dimensions': ['90 × 60 × 85 سم'],
        'brand': ['ماسترجاز (Mastergas Italy)'],
        'warranty': ['5 سنوات صيانة ذهبية واستبدال']
      },
      reviews: [
        { rating: 5, comment: 'حجمه عملاق والتوزيع الحراري فيه خيالي!', name: 'خالد الشمري' }
      ]
    },
    {
      name_ar: 'موقد غاز مسطح زجاجي 5 شعلات مع شعلة ووك توربو',
      name_en: 'Mastergas 5-Burner Tempered Glass Gas Hob',
      price: '1949',
      quantity: '28',
      category_id: '57',
      sku: 'HG905GT',
      desc_ar: 'مسطح غاز فاخر بسطح زجاجي حراري أسود مقسّى عالي المقاومة للخدوش مع 5 شعلات نحاسية وحوامل زهر ثقيلة لتحمل كافة أحجام القدور.',
      desc_en: 'Luxury black tempered glass hob with 5 solid brass burners and heavy-duty cast iron pan supports.',
      features_ar: 'شعلة ووك ثلاثية توربو بقوة 4.2 كيلوواط\nزجاج حراري إيطالي مقسّى سماكة 8 ملم ضد الصدمات\nحوامل زهر صلبة مانعة للانزلاق\nنظام صمامات أمان قاطعة للغاز فور انطفاء اللهب\nمفاتيح تحكم أمامية من المعدن المصقول المقاوم للحرارة',
      features_en: '4.2kW triple-ring turbo wok burner\n8mm thick shatterproof Italian tempered glass\nHeavy duty non-slip cast iron supports\nInstant flame-failure safety valves\nFront brushed metal heat-resistant knobs',
      tips_ar: 'نظف السطح الزجاجي بقطعة قماش ناعمة بعد أن يبرد تماماً للحفاظ على لمعانه.',
      tips_en: 'Clean glass surface with a microfiber cloth once fully cooled.',
      images: [
        'public/images/home/cat_hobs.png',
        'public/images/home/cat_hobs.jpg',
        'public/images/home/product_ceramic_hob_60.png'
      ],
      colors: [
        { label: 'أسود مطفي', color: '#111827' }
      ],
      sizes: ['90 سم', '75 سم'],
      attributes: {
        'color': ['أسود مطفي'],
        'size': ['90 سم'],
        'material': ['زجاج حراري مقسّى (Tempered Glass)', 'حديد زهر ثقيل (Cast Iron)'],
        'dimensions': ['86 × 51 × 5 سم'],
        'brand': ['ماسترجاز (Mastergas Italy)'],
        'warranty': ['3 سنوات ضمان معتمد من الوكيل']
      },
      reviews: [
        { rating: 5, comment: 'سهل التنظيف وشعلة الوك قوية جداً للقلي السريع.', name: 'فاطمة ناصر' }
      ]
    },
    {
      name_ar: 'موقد غاز ستانلس ستيل مسطح 4 شعلات أمان كامل',
      name_en: 'Mastergas 4-Burner Stainless Steel Built-in Hob',
      price: '1449',
      quantity: '30',
      category_id: '57',
      sku: 'HG604SS',
      desc_ar: 'مسطح غاز مدمج 60 سم مصنوع من قطعة واحدة من الستانلس ستيل المقاوم للصدأ بدون لحامات لمنع تراكم الدهون وسهولة التنظيف المطلقة.',
      desc_en: 'One-piece seamless stainless steel 60cm built-in gas hob engineered for effortless grease wipe-down.',
      features_ar: 'ستانلس ستيل 304 معالج ضد بصمات الأصابع\n4 شعلات متدرجة القوة لجميع أنواع الطهي\nإشعال إلكتروني مدمج في المفاتيح\nصمامات أمان إيطالية دقيقة\nتصميم مسطح منخفض يندمج مع سطح الرخام بانسيابية',
      features_en: 'Fingerprint-resistant 304 stainless steel\n4 graduated cooking burners\nIntegrated electronic ignition\nPrecision Italian safety valves\nSlim low-profile flush installation design',
      tips_ar: 'مقاس فتحة الرخام القياسية 56 × 48 سم، متوافق مع كافة أسطح المطابخ.',
      tips_en: 'Standard counter cutout 56x48cm, matches modern kitchen countertops.',
      images: [
        'public/images/home/product_ceramic_hob_60.png',
        'public/images/home/cat_hobs.png',
        'public/images/home/cat_hobs.jpg'
      ],
      colors: [
        { label: 'ستانلس ستيل', color: '#cbd5e1' }
      ],
      sizes: ['60 سم'],
      attributes: {
        'color': ['ستانلس ستيل'],
        'size': ['60 سم'],
        'material': ['ستانلس ستيل 304 مقاوم للصدأ'],
        'dimensions': ['58 × 50 × 4.5 سم'],
        'brand': ['ماسترجاز (Mastergas Italy)'],
        'warranty': ['سنتان شامل الصيانة وقطع الغيار']
      },
      reviews: [
        { rating: 4, comment: 'ممتاز جداً وعملي، الخامات قوية وتتحمل الاستخدام اليومي.', name: 'عمر القحطاني' }
      ]
    },
    {
      name_ar: 'شفاط مطبخ هرمي 90 سم بقوة شفط 1200 م³/ساعة',
      name_en: 'Mastergas Chimney Hood 90cm Turbo Suction 1200m3',
      price: '1699',
      quantity: '18',
      category_id: '60',
      sku: 'HD900TB',
      desc_ar: 'شفاط مطبخ فائق القوة بمحرك توربيني صامت يمتص الأبخرة والروائح بقوة 1200 متر مكعب في الساعة مع فلاتر ألومنيوم ثلاثية قابلة للغسيل.',
      desc_en: 'Ultra-powerful silent turbine kitchen hood delivering 1200 m3/h airflow with 3-layer washable aluminum filters.',
      features_ar: 'محرك إيطالي توربو فائق الهدوء بمستوى ضوضاء منخفض\n3 سرعات شفط مع مؤقت إيقاف تلقائي ذكي\nإضاءة LED بيضاء ساطعة وموفرة للطاقة\nفلاتر دهون ألومنيوم متعددة الطبقات تغسل في الجلاية\nهيكل ستانلس ستيل عالي الجودة مع مدخنة قابلة لتعديل الارتفاع',
      features_en: 'Quiet Italian turbine motor\n3 extraction speeds with auto shutoff timer\nBright energy-saving LED illumination\nDishwasher-safe multi-layer aluminum filters\nPremium stainless steel with telescopic flue',
      tips_ar: 'يُفضل تركيب الشفاط على ارتفاع 65 إلى 75 سم فوق سطح الموقد للحصول على أفضل شفط.',
      tips_en: 'Mount 65-75cm above the hob cooking surface for peak performance.',
      images: [
        'public/images/home/cat_hoods.png',
        'public/images/home/cat_hoods.jpg',
        'public/images/home/cat_hoods_mockup.png'
      ],
      colors: [
        { label: 'ستانلس ستيل', color: '#cbd5e1' },
        { label: 'أسود مطفي', color: '#111827' }
      ],
      sizes: ['90 سم'],
      attributes: {
        'color': ['ستانلس ستيل', 'أسود مطفي'],
        'size': ['90 سم'],
        'material': ['ستانلس ستيل 304 مقاوم للصدأ'],
        'dimensions': ['90 × 50 × 60 سم'],
        'brand': ['ماسترجاز (Mastergas Italy)'],
        'warranty': ['3 سنوات ضمان معتمد من الوكيل']
      },
      reviews: [
        { rating: 5, comment: 'صوت هادئ وقوة شفط جبارة، المطبخ نظيف تماماً من الروائح.', name: 'ريم العبدالله' }
      ]
    },
    {
      name_ar: 'سخان غاز رقمي ذكي 10 لتر تدفق مستمر',
      name_en: 'Mastergas Smart Digital 10L Gas Water Heater',
      price: '999',
      quantity: '25',
      category_id: '58',
      sku: 'WH10DIG',
      desc_ar: 'سخان مياه غاز فوري عالي الكفاءة مع شاشة ديجيتال لضبط درجة الحرارة بدقة ومبادل حراري من النحاس الخالي من الأكسجين لعمر أطول.',
      desc_en: 'High efficiency instant digital gas water heater with oxygen-free copper heat exchanger for longevity.',
      features_ar: 'شاشة رقمية LED لعرض درجة الحرارة وتنبيهات الأمان\nيعمل بكفاءة حتى مع ضغط مياه منخفض جداً (0.02 بار)\nمبادل حراري من النحاس النقي 100% لعمر تشغيلي مضاعف\nحماية متكاملة ضد الانطفاء، ارتفاع الحرارة، وزيادة ضغط المياه\nإشعال تلقائي ذكي بمجرد فتح صنبور المياه',
      features_en: 'Digital LED temperature display\nUltra-low water pressure startup (0.02 bar)\n100% oxygen-free pure copper heat exchanger\nMulti-layer flame failure and overheat safety\nAutomatic ignition upon water tap opening',
      tips_ar: 'يجب تركيب السخان في مكان جيد التهوية مع توصيل مدخنة العادم لخارج المنزل.',
      tips_en: 'Install in a ventilated space with flue exhaust vented outdoors.',
      images: [
        'public/images/home/hero_3.jpg',
        'public/images/home/hero_clean_bg.png',
        'public/images/home/hero_pristine.png'
      ],
      colors: [
        { label: 'أبيض ناصع', color: '#ffffff' }
      ],
      sizes: ['10 لتر'],
      attributes: {
        'color': ['أبيض ناصع'],
        'size': ['10 لتر'],
        'material': ['نحاس نقي فائق التحمل (Solid Brass)'],
        'dimensions': ['60 × 35 × 18 سم'],
        'brand': ['ماسترجاز (Mastergas Italy)'],
        'warranty': ['5 سنوات صيانة ذهبية واستبدال']
      },
      reviews: [
        { rating: 5, comment: 'يسخن في ثواني وثابت على درجة الحرارة وما يقطع نهائياً.', name: 'يوسف الدوسري' }
      ]
    },
    {
      name_ar: 'سخان غاز فوري 6 لتر صديق للبيئة منخفض الانبعاثات',
      name_en: 'Mastergas Instant Eco Gas Water Heater 6L',
      price: '699',
      quantity: '20',
      category_id: '58',
      sku: 'WH06ECO',
      desc_ar: 'سخان غاز فوري مدمج مناسب للشقق الصغيرة والمطابخ، يوفر ما يصل إلى 40% من استهلاك الغاز مع تكنولوجيا الاحتراق النظيف.',
      desc_en: 'Compact 6L instant gas heater tailored for apartments and kitchen utility with clean low-emission burn.',
      features_ar: 'حجم مدمج يوفر المساحة ويناسب المطابخ والحمامات الصغيرة\nتوفير فائق في الغاز بنظام الاحتراق النظيف Low-NOx\nمفاتيح تحكم منفصلة في شدة اللهب وتدفق المياه\nحساس أمان يقطع الغاز بعد 20 دقيقة تشغيل متواصل للوقاية\nصمام تفريغ لمنع تجمد المياه في الشتاء',
      features_en: 'Compact space-saving design\nLow-NOx eco-friendly combustion\nDual controls for flame power and water flow\n20-minute safety shutdown timer\nWinter anti-freeze drain valve',
      tips_ar: 'استخدم بطاريات قلوية عالية الجودة لضمان سرعة الإشعال الذاتي.',
      tips_en: 'Use high-quality alkaline batteries for dependable instant ignition.',
      images: [
        'public/images/home/hero_4.jpg',
        'public/images/home/hero_3.jpg',
        'public/images/home/hero_clean_bg.png'
      ],
      colors: [
        { label: 'أبيض ناصع', color: '#ffffff' }
      ],
      sizes: ['6 لتر'],
      attributes: {
        'color': ['أبيض ناصع'],
        'size': ['6 لتر'],
        'material': ['نحاس نقي فائق التحمل (Solid Brass)'],
        'dimensions': ['50 × 30 × 15 سم'],
        'brand': ['ماسترجاز (Mastergas Italy)'],
        'warranty': ['3 سنوات ضمان معتمد من الوكيل']
      },
      reviews: [
        { rating: 4, comment: 'حجمه صغير ومثالي للمطبخ وسريع جداً.', name: 'منى السالم' }
      ]
    },
    {
      name_ar: 'شواية غاز باربيكيو خارجية فاخرة 4 شعلات مع عجلات',
      name_en: 'Mastergas Deluxe 4-Burner Outdoor Gas BBQ Grill',
      price: '2799',
      quantity: '12',
      category_id: '59',
      sku: 'BBQ4000X',
      desc_ar: 'محطة شواء خارجية متكاملة مصنوعة من الستانلس ستيل المقاوم للظروف الجوية مع 4 شعلات رئيسية وشعلة جانبية لتحضير الصلصات وعجلات شديدة التحمل.',
      desc_en: 'All-weather outdoor stainless steel barbecue station featuring 4 main burners, side wok burner, and heavy castors.',
      features_ar: '4 شعلات ستانلس ستيل رئيسية + شعلة جانبية مخصصة للقدور\nشبكات شواء من الحديد الزهر الثقيل المانع للالتصاق\nغطاء مزدوج مزود بمقياس حرارة دقيق لمراقبة الشواء\nطاولات جانبية واسعة وخزانة سفلية لتخزين أسطوانة الغاز\nعجلات دوارة 360 درجة مع فرامل تثبيت لسهولة الحركة',
      features_en: '4 stainless main burners + 1 side burner\nNon-stick heavy cast iron grilling grates\nDual-layer insulated lid with built-in thermometer\nAmple side shelves and enclosed cylinder cabinet\nLockable 360-degree all-terrain caster wheels',
      tips_ar: 'قم بدهن شبكات الحديد الزهر بطبقة خفيفة من الزيت بعد كل استخدام لحمايتها من الرطوبة.',
      tips_en: 'Season cast iron grates with cooking oil after each BBQ session to preserve finish.',
      images: [
        'public/images/home/offer_bbq_pro.jpg',
        'public/images/home/cat_cookers.png',
        'public/images/home/cat_cookers.jpg'
      ],
      colors: [
        { label: 'أسود مطفي', color: '#111827' },
        { label: 'ستانلس ستيل', color: '#cbd5e1' }
      ],
      sizes: ['90 سم'],
      attributes: {
        'color': ['أسود مطفي', 'ستانلس ستيل'],
        'size': ['90 سم'],
        'material': ['حديد زهر ثقيل (Cast Iron)', 'ستانلس ستيل 304 مقاوم للصدأ'],
        'weight': ['45 كغم'],
        'dimensions': ['130 × 60 × 115 سم'],
        'brand': ['ماسترجاز (Mastergas Italy)'],
        'warranty': ['5 سنوات صيانة ذهبية واستبدال']
      },
      reviews: [
        { rating: 5, comment: 'أفخم شواية اقتنيتها، الحرارة متوزعة صح وشوي اللحم فيها أسطوري!', name: 'بندر المهنا' }
      ]
    },
    {
      name_ar: 'دفاية غاز سيراميك ديكورية ذكية بنظام ODS للأمان',
      name_en: 'Mastergas Infrared Ceramic Gas Space Heater ODS',
      price: '849',
      quantity: '22',
      category_id: '53',
      sku: 'HT3000ODS',
      desc_ar: 'مدفأة غاز سيراميكية منزلية أنيقة تمنح دفئاً فورياً مع تقنية الأشعة تحت الحمراء وحساسات أمان ذكية تقطع الغاز فوراً عند نقص الأكسجين أو الميلان.',
      desc_en: 'Elegant ceramic infrared home gas heater delivering instant radiance with automatic ODS anti-tilt shutoff.',
      features_ar: '3 مستويات حرارة قابلة للتحكم (1.5 / 2.8 / 4.2 كيلوواط)\nحساس ODS يوقف الغاز فوراً إذا انخفض مستوى الأكسجين عن 18%\nمفتاح أمان يغلق المدفأة تلقائياً عند السقوط أو الميلان\nإشعال بيزو كهربائي فوري بدون الحاجة لولاعة خارجية\nعجلات خفية سلسة لسهولة نقلها بين غرف المنزل',
      features_en: '3 adjustable heating stages (1.5 / 2.8 / 4.2 kW)\nODS sensor shuts off gas if oxygen falls below 18%\nTip-over safety switch cuts flame if tilted\nInstant piezo electric ignition\nConcealed smooth rolling wheels for room mobility',
      tips_ar: 'استخدم منظم غاز 30 ملي بار منخفض الضغط دائماً مع المدافئ المنزلية.',
      tips_en: 'Always pair with a certified 30mbar low-pressure regulator for domestic use.',
      images: [
        'public/images/home/cat_cookers_mockup.png',
        'public/images/home/cat_cookers.png',
        'public/images/home/cat_cookers.jpg'
      ],
      colors: [
        { label: 'أسود مطفي', color: '#111827' },
        { label: 'رمادي معدني', color: '#6b7280' }
      ],
      sizes: ['50 سم'],
      attributes: {
        'color': ['أسود مطفي', 'رمادي معدني'],
        'size': ['50 سم'],
        'material': ['صاج مطلي بمينا مضادة للالتصاق'],
        'weight': ['12 كغم'],
        'dimensions': ['72 × 42 × 30 سم'],
        'brand': ['ماسترجاز (Mastergas Italy)'],
        'warranty': ['سنتان شامل الصيانة وقطع الغيار']
      },
      reviews: [
        { rating: 5, comment: 'دفء ممتاز وأمان عالي، وموفرة جداً في استهلاك الغاز.', name: 'طارق الزهراني' }
      ]
    },
    {
      name_ar: 'موقد غاز توربو خارجي ثلاثي الشعلات للرحلات والمخيمات',
      name_en: 'Mastergas Heavy-Duty Turbo Outdoor Gas Stove',
      price: '479',
      quantity: '35',
      category_id: '54',
      sku: 'CS300TR',
      desc_ar: 'موقد رحلات وتخييم صلب مصنوع من الحديد الزهر الثقيل يتحمل أصعب ظروف البر والطبخ في الهواء الطلق مع 3 شعلات توربو قوية ومقاومة للرياح.',
      desc_en: 'Cast iron rugged outdoor camp stove with 3 wind-resistant high-output turbo burners.',
      features_ar: 'هيكل حديد زهر صب متين غير قابل للكسر\n3 شعلات منفصلة التحكم بقوة إجمالية 8 كيلوواط\nحواجز حماية مدمجة ضد هبوب الرياح في البر والمخيمات\nأرجل متينة قابلة للتفكيك لسهولة الحمل في صندوق السيارة\nوصلات غاز نحاسية ملولبة عالية الأمان',
      features_en: 'Unbreakable heavy cast iron construction\n3 independently valved burners totaling 8kW output\nBuilt-in windshield barriers for rugged campouts\nDetachable legs for convenient trunk transport\nThreaded heavy brass gas fittings',
      tips_ar: 'مناسب لأسطوانات الغاز المنزلية وخزانات الرحلات مع منظم ضغط عالي أو متوسط.',
      tips_en: 'Compatible with standard LPG cylinders and camping tanks via regulator.',
      images: [
        'public/images/home/offer_clearance_pro.jpg',
        'public/images/home/cat_hobs.png',
        'public/images/home/offer_safety_pro.jpg'
      ],
      colors: [
        { label: 'أسود مطفي', color: '#111827' }
      ],
      sizes: ['50 سم'],
      attributes: {
        'color': ['أسود مطفي'],
        'size': ['50 سم'],
        'material': ['حديد زهر ثقيل (Cast Iron)'],
        'weight': ['8.5 كغم'],
        'dimensions': ['58 × 30 × 12 سم'],
        'brand': ['ماسترجاز (Mastergas Italy)'],
        'warranty': ['سنتان شامل الصيانة وقطع الغيار']
      },
      reviews: [
        { rating: 5, comment: 'وحش في البر! شعلته قوية وما تتأثر بالهواء.', name: 'سلطان العنزي' }
      ]
    }
  ];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`\nCreating Product ${i + 1}/${products.length}: ${p.name_ar}...`);

    const fd = new FormData();
    fd.append('name', JSON.stringify({ ar: p.name_ar, en: p.name_en }));
    fd.append('price', p.price);
    fd.append('quantity', p.quantity);
    fd.append('is_active', '1');
    fd.append('category_id', p.category_id);
    fd.append('discount', '0');
    fd.append('sku', p.sku);
    fd.append('description', JSON.stringify({ ar: p.desc_ar, en: p.desc_en }));
    fd.append('features', JSON.stringify({ ar: p.features_ar, en: p.features_en }));
    fd.append('tips', JSON.stringify({ ar: p.tips_ar, en: p.tips_en }));
    fd.append('shipping_info', JSON.stringify({
      ar: 'شحن مجاني للطلبات فوق 500 ريال. التوصيل خلال 1-3 أيام عمل مع ضمان سنتين معتمد.',
      en: 'Free shipping for orders over 500 SAR. Delivery within 1-3 business days with 2-year warranty.'
    }));

    const all10Specs = [
      {
        'الارتفاع': ['59.5 سم'], 'العرض': ['59.5 سم'], 'السعة': ['65 لتر'], 'العمق': ['55 سم'],
        'الجهد الكهربائي': ['220-240 فولت'], 'نوع الطاقة': ['غاز طبيعي / مسال'], 'المؤقت الرقمي': ['نعم'],
        'وظائف الطهي': ['4 وظائف'], 'نظام الإشعال': ['إلكتروني ذاتي'], 'صمام الأمان': ['أمان كامل'],
        'بلد المنشأ': ['إيطاليا'], 'اللون والمظهر': ['ستانلس ستيل']
      },
      {
        'الارتفاع': ['59.5 سم'], 'العرض': ['89.5 سم'], 'السعة': ['85 لتر'], 'العمق': ['56 سم'],
        'الجهد الكهربائي': ['220-240 فولت'], 'نوع الطاقة': ['غاز طبيعي / مسال'], 'المؤقت الرقمي': ['نعم'],
        'وظائف الطهي': ['6 وظائف'], 'نظام الإشعال': ['إلكتروني ذاتي'], 'صمام الأمان': ['أمان كامل'],
        'بلد المنشأ': ['إيطاليا'], 'اللون والمظهر': ['ستانلس ستيل ورمادي معدني']
      },
      {
        'الارتفاع': ['5 سم'], 'العرض': ['86 سم'], 'السعة': ['5 شعلات غاز'], 'العمق': ['51 سم'],
        'الجهد الكهربائي': ['220-240 فولت'], 'نوع الطاقة': ['غاز طبيعي / مسال'], 'المؤقت الرقمي': ['نعم'],
        'نوع الحوامل': ['حديد زهر ثقيل'], 'نظام الإشعال': ['إلكتروني مدمج بالمفتاح'], 'صمام الأمان': ['أمان كامل فوري'],
        'بلد المنشأ': ['إيطاليا'], 'اللون والمظهر': ['زجاج حراري مقسّى أسود']
      },
      {
        'الارتفاع': ['4.5 سم'], 'العرض': ['58 سم'], 'السعة': ['4 شعلات غاز'], 'العمق': ['50 سم'],
        'الجهد الكهربائي': ['220-240 فولت'], 'نوع الطاقة': ['غاز طبيعي / مسال'], 'المؤقت الرقمي': ['لا'],
        'نوع الحوامل': ['حديد زهر صلب'], 'نظام الإشعال': ['إلكتروني مدمج بالمفتاح'], 'صمام الأمان': ['أمان كامل فوري'],
        'بلد المنشأ': ['إيطاليا'], 'اللون والمظهر': ['ستانلس ستيل 304']
      },
      {
        'الارتفاع': ['70-105 سم'], 'العرض': ['90 سم'], 'السعة': ['قوة شفط 1200 م³/ساعة'], 'العمق': ['50 سم'],
        'الجهد الكهربائي': ['220-240 فولت'], 'نوع الطاقة': ['كهرباء 230 واط'], 'المؤقت الرقمي': ['نعم'],
        'مستويات السرعة': ['3 سرعات توربو'], 'نوع الفلتر': ['فلاتر ألومنيوم متعددة الطبقات'], 'مستوى الضوضاء': ['منخفض (56 ديسيبل)'],
        'بلد المنشأ': ['إيطاليا'], 'اللون والمظهر': ['ستانلس ستيل 304']
      },
      {
        'الارتفاع': ['55 سم'], 'العرض': ['35 سم'], 'السعة': ['10 لتر / دقيقة'], 'العمق': ['18 سم'],
        'الجهد الكهربائي': ['شاشة إلكترونية تعمل بالبطاريات'], 'نوع الطاقة': ['غاز طبيعي / مسال'], 'المؤقت الرقمي': ['شاشة رقمية LED'],
        'ضغط المياه المناسب': ['يعمل مع ضغط المياه المنخفض'], 'نظام الإشعال': ['إلكتروني أوتوماتيكي فوري'], 'صمام الأمان': ['حماية ثلاثية متكاملة'],
        'بلد المنشأ': ['إيطاليا'], 'اللون والمظهر': ['أبيض ناصع مقاوم للصدأ']
      },
      {
        'الارتفاع': ['48 سم'], 'العرض': ['30 سم'], 'السعة': ['6 لتر / دقيقة'], 'العمق': ['15 سم'],
        'الجهد الكهربائي': ['بطاريات جافة'], 'نوع الطاقة': ['غاز طبيعي / مسال'], 'المؤقت الرقمي': ['مؤشر حرارة رقمي'],
        'ضغط المياه المناسب': ['ضغط مياه منخفض 0.2 بار'], 'نظام الإشعال': ['أوتوماتيكي عند فتح صنبور المياه'], 'صمام الأمان': ['صمام أمان ذكي'],
        'بلد المنشأ': ['إيطاليا'], 'اللون والمظهر': ['أبيض ناصع']
      },
      {
        'الارتفاع': ['115 سم'], 'العرض': ['135 سم'], 'السعة': ['مساحة شواء 70 × 45 سم'], 'العمق': ['58 سم'],
        'الجهد الكهربائي': ['لا يتطلب كهرباء'], 'نوع الطاقة': ['أسطوانات غاز مسال'], 'المؤقت الرقمي': ['مقياس حرارة مدمج بالغطاء'],
        'عدد الشعلات': ['4 شعلات ستانلس + شعلة جانبية'], 'نظام الإشعال': ['إلكتروني نبضي'], 'صمام الأمان': ['صمامات أمان معتمدة'],
        'بلد المنشأ': ['إيطاليا'], 'اللون والمظهر': ['ستانلس ستيل وأسود']
      },
      {
        'الارتفاع': ['72 سم'], 'العرض': ['42 سم'], 'السعة': ['3 ألواح تدفئة سيراميك'], 'العمق': ['36 سم'],
        'الجهد الكهربائي': ['لا يتطلب كهرباء'], 'نوع الطاقة': ['أسطوانة غاز منزلي'], 'المؤقت الرقمي': ['تحكم يدوي بثلاث مستويات'],
        'نظام الإشعال': ['إشعال بيزو ذاتي'], 'صمام الأمان': ['نظام ODS مع قفل عند الميلان'],
        'بلد المنشأ': ['إيطاليا'], 'اللون والمظهر': ['أسود ملكي']
      },
      {
        'الارتفاع': ['12 سم'], 'العرض': ['68 سم'], 'السعة': ['3 شعلات حديد زهر'], 'العمق': ['38 سم'],
        'الجهد الكهربائي': ['لا يتطلب كهرباء'], 'نوع الطاقة': ['غاز مسال'], 'المؤقت الرقمي': ['مفاتيح نحاسية مدرجة'],
        'نوع الحوامل': ['حديد زهر عريض'], 'نظام الإشعال': ['يدوي سريع'], 'صمام الأمان': ['صمامات نحاسية آمنة'],
        'بلد المنشأ': ['إيطاليا'], 'اللون والمظهر': ['أسود مطلي حرارياً']
      }
    ];

    const mergedAttrs = {
      ...(p.attributes || {}),
      ...(all10Specs[i] || {})
    };

    fd.append('attributes', JSON.stringify(mergedAttrs));
    fd.append('color_options', JSON.stringify(p.colors));
    fd.append('size_options', JSON.stringify(p.sizes));

    // Append 3 images
    for (let imgIdx = 0; imgIdx < p.images.length; imgIdx++) {
      const imgPath = p.images[imgIdx];
      if (fs.existsSync(imgPath)) {
        const buf = fs.readFileSync(imgPath);
        const mime = imgPath.endsWith('.png') ? 'image/png' : 'image/jpeg';
        const blob = new Blob([buf], { type: mime });
        fd.append('images[]', blob, `prod_${i + 1}_img_${imgIdx + 1}.${imgPath.endsWith('.png') ? 'png' : 'jpg'}`);
      }
    }

    const res = await fetch(`${API_BASE}/dashboard/products`, {
      method: 'POST',
      headers,
      body: fd
    });
    const data = await res.json();
    if (res.ok && data.data?.id) {
      const createdId = data.data.id;
      console.log(` ✔ Created product ID ${createdId}`);

      // Add reviews
      for (const rev of p.reviews) {
        try {
          const revRes = await fetch(`${API_BASE}/frontend/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
              product_id: createdId,
              rating: rev.rating,
              comment: rev.comment,
              name: rev.name
            })
          });
          console.log(`   - Added review (${rev.rating}★) by ${rev.name}: ${revRes.status}`);
        } catch (rErr) {
          console.warn('   - Review failed', rErr.message);
        }
      }
    } else {
      console.error(` ❌ Failed to create product: ${res.status}`, data);
    }
  }

  console.log('\n===========================================');
  console.log('✔ SEEDING OF 10 MASTERGAS PRODUCTS COMPLETE!');
  console.log('===========================================');
}

main().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
