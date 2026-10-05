# Mastergas (ماستر غاز) - Luxury Italian Kitchen Appliances & CMS Platform

<div align="center">
  <img src="public/logo.png" alt="Mastergas Logo" width="220" />
  <p><strong>الرائد الأول في توفير الأجهزة المنزلية الإيطالية الفاخرة في المملكة العربية السعودية</strong></p>
  <p><em>Premium Italian Kitchen Appliances E-Commerce Storefront & Enterprise Admin CMS Dashboard</em></p>

  [![Vue 3](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
  [![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
  [![cPanel](https://img.shields.io/badge/Hosting-cPanel_Ready-orange?style=for-the-badge&logo=cpanel&logoColor=white)](https://cpanel.net/)
  [![Tests](https://img.shields.io/badge/Tests-113%20Passed-brightgreen?style=for-the-badge&logo=node.js&logoColor=white)](tests/)
</div>

---

## 📖 نظرة عامة | Overview

**Mastergas (ماستر غاز)** هو نظام تجارة إلكترونية متكامل ولوحة تحكم إدارية حديثة مخصصة لبيع وتوزيع أجهزة المطبخ الإيطالية الفاخرة في المملكة العربية السعودية (أفران بلت-إن، مواقد غاز، مسطحات سيراميك، شفاطات، وغسالات صحون).

تم بناء الواجهة الأمامية بالكامل باستخدام **Vue 3 (Composition API)** ومحرك الحزم فائق السرعة **Vite 7**، مع دعم كامل للغتين العربية (RTL) والإنجليزية (LTR)، وتطبيق معايير أمان مالية صارمة لعمليات الدفع عبر بوابة **PayTabs**.

كما تم تجهيز المشروع بدعم مزدوج للنشر السريع على **Vercel** والانتقال السلس إلى استضافات **cPanel / Apache** بأقل مجهود وبدون أي تعقيد.

---

## 🌟 الميزات الرئيسية | Key Features

### 🛍️ واجهة المتجر للعملاء (Customer Storefront)
- **كتالوج أجهزة إيطالية فاخرة**: تصفح وتصفية المنتجات حسب الفئة، الماركة، الخصائص الفنية، ونطاق الأسعار، مع بحث فوري.
- **صفحة تفاصيل المنتج (Product Detail)**: معرض صور متفاعل، مواصفات الأبعاد والتركيب، اختيار المتغيرات والألوان، والمنتجات ذات الصلة.
- **سلة الشراء وقائمة الرغبات (Cart & Wishlist)**: مزامنة فورية ومستمرة، وتحديث تلقائي للأسعار والخصومات والشحن.
- **عملية إتمام الطلب والدفع الآمن (Safe Checkout & PayTabs)**:
  - إدخال عناوين التوصيل وحساب تكلفة الشحن آلياً بحسب المدينة السعودية.
  - تطبيق كوبونات الخصم ورصيد المحفظة.
  - تكامل محكم مع بوابة **PayTabs** بمفاتيح عدم التكرار (`Idempotency-Key` / `X-Checkout-Id`) لمنع تكرار الخصم أو إنشاء طلبات مكررة.
  - معالجة ذكية لانقطاع الاتصال واستعادة الإيصال عند إعادة تحميل الصفحة.
- **بوابة العميل (Customer Profile)**: متابعة الطلبات، تحميل الفواتير بتصميم احترافي، إدارة العناوين، وسجل المشتريات.
- **تهيئة محركات البحث والتسويق (SEO & Catalog Feeds)**:
  - علامات Open Graph و Twitter Cards وبيانات جغرافية للمملكة العربية السعودية (`geo.region: SA`).
  - ملف خريطة الموقع `sitemap.xml` وملف `robots.txt`.
  - توليد تلقائي لملف تغذية الكتالوج لفيسبوك وإنستغرام (`meta-products-catalog.csv`).

### 🛡️ لوحة التحكم الإدارية (Admin CMS Dashboard)
- **لوحة التحليلات والإحصائيات**: مؤشرات أداء فورية ومخططات تفاعلية عبر `Chart.js` لمتابعة المبيعات، الإيرادات، وأكثر المنتجات طلباً.
- **إدارة المنتجات والمخزون**: إضافة وتعديل وحذف المنتجات، الفئات، الماركات، السمات، وتتبع تنبيهات نفاد الكميات.
- **إدارة الطلبات واللوجستيات**:
  - تتبع دورة حياة الطلبات (معلق، قيد التجهيز، خارج للتوصيل، تم التسليم، ملغي).
  - تعيين السائقين والموزعين وتخصيص الفروع.
  - ضبط تسعيرة الشحن لكل مدينة سعودية على حدة.
- **العروض والتسويق**: إدارة أكواد الكوبونات، الخصومات المجدولة، وسلايدرات العروض الترويجية.
- **خدمة العملاء والتقييمات**: إدارة رسائل اتصل بنا، مراجعات المنتجات، وطلبات الإرجاع.
- **الأمان والصلاحيات**: إدارة حسابات المشرفين، الأدوار والصلاحيات الدقيقة، وسجل كامل لعمليات وتعديلات النظام (Activity Logs).

---

## 🛠️ التقنيات المستخدمة | Tech Stack

- **الواجهة الأمامية**: [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- **أداة البناء**: [Vite 7](https://vitejs.dev/)
- **التصميم والواجهات**: [Tailwind CSS v4](https://tailwindcss.com/), PostCSS, FontAwesome 7
- **الخطوط**: [IBM Plex Sans Arabic](https://fonts.google.com/specimen/IBM+Plex+Sans+Arabic) (محلياً ومدمجاً)
- **إدارة المسارات**: [Vue Router 4](https://router.vuejs.org/)
- **التعريب وتعدد اللغات**: [Vue I18n 9](https://vue-i18n.intlify.dev/)
- **الاتصال بالواجهة الخلفية**: [Axios](https://axios-http.com/)
- **الرسوم البيانية**: [Chart.js](https://www.chartjs.org/)
- **الأمان والتعقيم**: [DOMPurify](https://github.com/cure53/DOMPurify)
- **محرك الاختبارات**: Node.js Test Runner (113 اختبار وحدة وتكامل مالي)

---

## 📁 هيكل المشروع | Project Structure

```
mastergas/
├── public/                     # الملفات الثابتة المباشرة
│   ├── .htaccess               # إعدادات Apache و SPA Rewrite لـ cPanel
│   ├── favicon.png             # أيقونة الموقع
│   ├── logo.png                # شعار ماستر غاز الرئيسي
│   ├── logo-dashboard.png      # شعار لوحة التحكم
│   ├── robots.txt              # قواعد محركات البحث
│   ├── sitemap.xml             # خريطة الموقع
│   ├── fonts/                  # الخطوط المحلية (IBM Plex Sans Arabic)
│   └── feeds/                  # كتالوج المنتجات التسويقي
├── scripts/
│   └── generateFeed.js         # سكربت توليد كتالوج المنتجات بصيغة CSV
├── src/
│   ├── assets/                 # ملفات التنسيق والأيقونات
│   ├── components/             # المكونات القابلة لإعادة الاستخدام (متجر ولوحة تحكم)
│   ├── composables/            # دوال Vue Composable المشتركة
│   ├── config/                 # إعدادات API والتطبيق
│   ├── i18n/                   # ملفات الترجمة (العربية والإنجليزية)
│   ├── router/                 # توجيه الصفحات وحماية المسارات
│   ├── store/                  # إدارة الحالة العامة (State Management)
│   ├── utils/                  # أدوات معالجة الدفع والأمان
│   ├── views/                  # صفحات لوحة التحكم الإدارية
│   │   └── website/            # صفحات المتجر الموجهة للمستخدم
│   ├── App.vue                 # المكون الجذري للتطبيق
│   ├── main.js                 # نقطة انطلاق التطبيق
│   └── style.css               # ملف استيراد Tailwind وتنسيقات الموقع
├── tests/                      # حزمة الاختبارات الشاملة (113 اختبار)
├── .env.example                # نموذج المتغيرات البيئية
├── .gitignore                  # الملفات المستثناة من تتبع Git
├── .htaccess                   # نسخة الجذر من إعدادات Apache
├── index.html                  # ملف HTML الرئيسي وعلامات SEO
├── package.json                # التبعيات والسكربتات
├── tailwind.config.js          # إعدادات Tailwind CSS
├── vercel.json                 # إعدادات النشر والتوجيه على Vercel
└── vite.config.js              # إعدادات حزم وتجميع Vite
```

---

## ⚙️ إعداد المتغيرات البيئية | Environment Variables

أنشئ ملف `.env` في المجلد الرئيسي بالاعتماد على `.env.example`:

```bash
cp .env.example .env
```

محتوى الملف:
```env
# رابط الـ API للواجهة الخلفية
VITE_API_BASE_URL=https://backend-mastergas.be-kite.com/api

# نمط البيانات: local يستخدم snapshot JSON، وapi يستخدم الـ backend
VITE_DATA_MODE=local

# رابط إعادة التوجيه لبوابة PayTabs بعد إتمام الدفع (اختياري/للإنتاج)
VITE_PAYTABS_RETURN_URL=

# رابط الإلغاء لبوابة PayTabs (اختياري)
VITE_PAYTABS_CANCEL_URL=
```

### 🧪 تشغيل البيانات المحلية

أثناء `npm run dev` يستخدم المشروع تلقائياً snapshot البيانات الموجود في [`src/data/localData.json`](src/data/localData.json)، وتعمل الصور من `public/local-assets`. لتحديث الـ snapshot من الـ API شغّل:

```bash
npm run sync:local-data
```

حسابات التجربة المحلية:

- عميل المتجر: `demo@mastergas.local` / `demo123`
- لوحة التحكم: `admin@mastergas.local` / `admin123`

لتشغيل الـ backend بدلاً من JSON استخدم `VITE_DATA_MODE=api`.

---

## 🚀 التشغيل والتطوير المحلي | Getting Started

### المتطلبات الأساسية
- **Node.js**: إصدار 18.0.0 أو أحدث (موصى بـ v20 أو v22)
- **npm**: إصدار 9.0.0 أو أحدث

### خطوات التثبيت والتشغيل
```bash
# 1. تثبيت الحزم والتبعيات
npm install

# 2. تشغيل سيرفر التطوير المحلي
npm run dev

# افتح المتصفح على: http://localhost:5173
```

---

## 📜 السكربتات المتاحة | Available Scripts

| الأمر | الوصف |
| :--- | :--- |
| `npm run dev` | تشغيل سيرفر التطوير المحلي مع Hot Module Replacement |
| `npm run build` | توليد كتالوج المنتجات وبناء ملفات الإنتاج في مجلد `dist` |
| `npm run build:clean` | تنظيف مخلفات البناء السابقة وبناء نسخة إنتاج نظيفة تماماً |
| `npm run build:cpanel` | بناء المشروع وتجهيز أرشيف مضغوط جاهز للرفع مباشرة على cPanel |
| `npm run preview` | معاينة نسخة الإنتاج محلياً والتأكد من عمل المسارات |
| `npm test` | تشغيل الاختبارات الآلية (113 اختبار للتحقق من سلامة الطلبات والدفع) |

---

## 🚢 دليل النشر | Deployment Guide

تم تجهيز هذا المشروع بدعم كامل لنمطين من الاستضافة، لتسهيل مرحلة المراجعة والانتقال للإنتاج النهائي:

### ⚡ 1. النشر على Vercel (المرحلة الحالية)

المشروع يحتوي على ملف [`vercel.json`](vercel.json) المخصص الذي يضبط إعادة توجيه مسارات SPA وقواعد الـ Cache للأصول الثابتة:

#### الطريقة الأولى: عبر لوحة تحكم Vercel (موصى بها)
1. افتح [Vercel Dashboard](https://vercel.com/new).
2. اختر **Import Git Repository** وحدد مستودع `omarragab21/mastergas`.
3. سيتعرف Vercel تلقائياً على إعدادات **Vite**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. أضف أي متغيرات بيئية مثل `VITE_API_BASE_URL` في قسم **Environment Variables**.
5. اضغط **Deploy**. سيتم إنشاء رابط مباشر للمشروع مع تفعيل التحديث الآلي مع كل `git push`.

#### الطريقة الثانية: عبر Vercel CLI
```bash
# تثبيت أو تشغيل أداة Vercel
npx vercel

# للنشر على بيئة الإنتاج المباشرة:
npx vercel --prod
```

---

### 🌐 2. النقل إلى cPanel / Apache (المرحلة اللاحقة)

تم تسهيل عملية النقل إلى أي استضافة تدعم cPanel بنسبة 100%:

1. **توليد حزمة النشر**:
   ```bash
   npm run build:cpanel
   ```
   هذا الأمر سيقوم بالآتي تلقائياً:
   - جلب وتحديث كتالوج المنتجات.
   - بناء ملفات المتجر ولوحة التحكم في مجلد `dist/`.
   - دمج ملف `.htaccess` المجهز مسبقاً بقواعد إعادة التوجيه لـ SPA وضغط Gzip وحماية الترويسات.
   - إنشاء ملف مضغوط باسم `cpanel-public_html.zip` في مجلد المشروع الرئيسي.

2. **الرفع على cPanel**:
   - سجل الدخول إلى لوحة تحكم **cPanel**.
   - افتح **File Manager (إدارة الملفات)**.
   - انتقل إلى المجلد المستهدف للموقع (غالباً `public_html` أو مجلد الـ Subdomain).
   - اضغط **Upload (رفع)** وارفع الملف `cpanel-public_html.zip`.
   - انقر بزر الفأرة الأيمن على الملف المرفوع واختر **Extract (استخراج)**.
   - انتهى النقل! سيعمل الموقع ولوحة التحكم والمسارات كاملة دون أي أخطاء 404 عند التحديث.

---

## 🔒 معايير الأمان المالي والدفع (PayTabs Safety Contract)

يتبع التطبيق بروتوكول سلامة صارم لمنع أي خسائر مالية أو أخطاء ناتجة عن انقطاع الإنترنت أو تكرار النقرات:
1. **مفتاح عدم التكرار (Idempotency Key)**: يتم توليد معرّف فريد لكل محاولة طلب، لمنع تكرار معالجة الدفع من الباك إند.
2. **استعادة إيصال الدفع (Receipt Persistence)**: في حال إتمام العملية ثم تحديث المتصفح، يتم قراءة الإيصال المخزن وعرض شاشة التأكيد دون إعادة إرسال الطلب للباك إند.
3. **التعامل مع انقطاع الشبكة (Offline Resilience)**: في حال انقطاع الاتصال لحظة إتمام المعاملة، يتم حفظ المحاولة في `LocalStorage` ومراقبة عودة الاتصال لإعادة التحقق تلقائياً دون فقدان بيانات العميل.

---

## 📄 الترخيص | License

جميع الحقوق محفوظة لصالح **Mastergas Saudi Arabia (ماستر غاز)** © 2026.
