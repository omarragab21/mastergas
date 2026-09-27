# Mastergas — Senior QA Report

تاريخ الفحص: 27 سبتمبر 2026  
النطاق: الـ Features الموجودة حاليًا فقط في الـ Storefront والـ Admin Dashboard والـ APIs المرتبطة بها. لم تتم إضافة أي Feature.

## الخلاصة التنفيذية

الواجهة قابلة للتشغيل، لكن المشروع ليس جاهزًا للإطلاق النهائي قبل إصلاح مجموعة من عيوب البيانات والتكامل:

- الاختبارات الآلية الحالية: **113 ناجحًا / 0 فشل**.
- Production build: **ناجح**.
- Dashboard browser regression: **25 ناجحًا / 7 فاشلة**.
- Smoke test للصفحات العامة على Chrome بدقة 390px: الصفحات الست فتحت بدون JavaScript errors أو API responses بحالة 4xx/5xx عبر الـ proxy.
- الفحص الحي للـ Backend أثبت أن بعض الحالات غير المصادق عليها ترجع 500 بدل 401، وأن بيانات إعدادات عامة قديمة تخص Iris Flowers ما زالت موجودة في الـ API.

الحكم: **لا أنصح بـ Go-Live حاليًا**. الإصلاح داخل أسبوعين واقعي بشرط توفير بيئة Staging وحسابات اختبار Admin/Customer وPayTabs sandbox، والعمل بالتوازي بين Frontend وBackend وQA.

## العيوب المؤكدة

| ID | الأولوية | الطبقة | العيب والدليل | الأثر | تقدير الإصلاح |
|---|---|---|---|---|---:|
| MG-BE-001 | P1 | Backend | الطلب إلى `/dashboard/statistics` أو `/frontend/user` بدون Authorization يرجع **500 HTML** برسالة `Route [login] not defined` بدل `401 application/json`. الطلب بـ token غير صالح يرجع 401 بصورة صحيحة. | الجلسة المنتهية/المفقودة لا تُعالج بعقد API ثابت، والواجهة لا تستطيع تشغيل مسار logout/login المتوقع. | 0.5–1 يوم |
| MG-DATA-001 | P1 | Backend/Data | `/frontend/settings` يرجع `site_name=Iris Flowers`، بريد/هاتف وروابط Iris، ومحتوى About من Iris. `/frontend/topics` و`/frontend/coupons` كذلك يحتويان بيانات Iris و`IRIS2026`. | ظهور هوية ومحتوى متجر مختلف، ورسائل/روابط غير صحيحة للعملاء. | 1–2 يوم |
| MG-DATA-002 | P1 | Frontend + Backend config | عدم اتساق السوق والعملة: SEO والـ defaults تشير للسعودية/SAR، بينما الإعدادات الحية ترجع Amman/JOD، والواجهة تستخدم أيضًا نصوصًا ثابتة مثل `50 دينار` و`500 ريال` وأجزاء Dashboard تستخدم `د.أ`. | أسعار وشحن وضرائب ورسائل قد تظهر بعملة/سوق غير المقصود. | 1 يوم بعد قرار العملة الرسمي |
| MG-FE-001 | P1 | Dashboard | عند وصول `summary.total_orders=10` مع توزيع جزئي `{completed:2}` يعرض Dashboard الإجمالي **2** بدل 10. الاختبار الموسع رقم 31 يفشل. السبب في `DashboardView.vue:396-400`. | KPI رئيسي غير دقيق، وقد يؤثر على قرار التشغيل والتقارير. | 0.5 يوم |
| MG-FE-002 | P2 | Dashboard | عند غياب `orders_by_status` لا تُقرأ حقول `summary.completed_orders` و`pending_orders`. الاختبار رقم 29 يفشل. | حالات الطلبات تظهر صفرًا رغم وجود أرقام من الـ API. | 0.5 يوم |
| MG-FE-003 | P2 | Dashboard | حقلا `top_products` و`low_stock` لا يُدعمان كأسماء بديلة؛ الواجهة تعمل fallback وقد تعرض القائمة فارغة. الاختبار رقم 30 يفشل. | فقدان أفضل المنتجات وتنبيهات المخزون حسب شكل استجابة Backend. | 0.5 يوم |
| MG-FE-004 | P2 | Dashboard | غياب توزيع الحالات يُعرض كأنه كل الحالات = 0 بدون توضيح `غير متاح`. الاختبار رقم 26 يفشل. | صفر حقيقي يختلط مع بيانات غير متوفرة، ما يضلل المستخدم. | 0.25 يوم |
| MG-FE-005 | P2 | Dashboard | قيمة status غير الصالحة تتحول إلى 0 وتظهر كرقم حقيقي. الاختبار رقم 27 يفشل. | إخفاء فساد البيانات بدل إظهار حالة غير متاحة/خطأ. | 0.25 يوم |
| MG-FE-006 | P2 | Dashboard | غياب trend يُعرض `0%` مع سهم صاعد. الاختبار رقم 28 يفشل. | عرض قياس لم يرسله الـ Backend كأنه نمو فعلي. | 0.25 يوم |
| MG-FE-007 | P2 | Dashboard | `parseFloat('123garbage')` ينتج 123 في الرسم البياني. الاختبار رقم 32 يفشل. | رسم مبيعات غير صحيح عند فساد قيمة واحدة. | 0.25 يوم |
| MG-FE-008 | P1 | Storefront/API contract | الواجهة تطلب تقييمات المنتج من `GET /frontend/reviews?product_id=7`، بينما الـ API الحي يعيد 405/500 HTML لهذا المسار ويدعم `GET /frontend/products/7/reviews`. | فشل جلب التقييمات الحية، ثم تعرض الصفحة Reviews ثابتة تجريبية (`defaultReviews`) بدل بيانات العملاء. | 0.5–1 يوم |
| MG-FE-009 | P2 | Storefront | `ProductDetailView.vue:1246-1249` يقرأ نتيجة `productService.getProducts()` من `res.data`، بينما الخدمة ترجع `{ items, total, ... }`. لذلك related products لا تُبنى من نتيجة التصنيف الحية وتنتقل للـ fallback. | المنتجات ذات الصلة لا تلتزم فعليًا بتصنيف المنتج أو بياناته الحية. | 0.25–0.5 يوم |

## ملاحظات Backend إضافية

- Public GET APIs الأساسية عادت 200 في الفحص الحالي: settings، categories، products، offers، sliders، filters، coupons، topics.
- عينة الأداء الحالية كانت تقريبًا: المنتجات 0.42–0.78 ثانية، categories 2.54 ثانية في عينة، offers 0.32 ثانية، sliders/filters حوالي 0.26 ثانية. حدث timeout متقطع في أول فحص متوازٍ لـ settings، لكن خمس محاولات متتالية لاحقة نجحت في 0.25–0.28 ثانية؛ يلزم Benchmark منظم على Staging قبل اعتبار الأداء مغلقًا.
- CORS للـ origin `https://mastergas.sa` رجع إعدادًا صحيحًا في الفحص.
- لا يمكن اعتماد CRUD والـ checkout/PayTabs وRBAC كـ Pass نهائي من غير حسابات اختبار وبيئة Staging؛ الاختبارات الحالية للـ checkout تعتمد بدرجة كبيرة على mocks.

## التغطية التي تم تنفيذها

1. `npm test`: 113 test cases ناجحة.
2. `npm run build`: ناجح، مع توليد feed حي من API لعدد 8 منتجات.
3. Dashboard Chrome regression: 32 سيناريو، 25 Pass و7 Fail، والـ 7 موثقة أعلاه.
4. Chrome smoke على 390px للصفحات: `/`, `/products`, `/offers`, `/product/7`, `/about`, `/contact`.
5. Live read-only API checks للـ public endpoints والـ unauthenticated/invalid-token behavior.
6. فحص فعلي للـ DOM في صفحة المنتج والتقييمات والمنتجات ذات الصلة.

## خطة الإغلاق المقترحة بدون إضافة Features

| الفترة | العمل |
|---|---|
| الأيام 1–2 | إصلاح Backend auth response، تنظيف/تثبيت إعدادات Mastergas، تثبيت قرار العملة والسوق، وتأكيد API contract للتقييمات. |
| الأيام 3–4 | إصلاح عيوب Dashboard السبعة وإضافة assertions تمنع رجوعها. |
| اليوم 5 | إصلاح تقييمات المنتج والـ related products، وإزالة أي fallback تجريبي يظهر مع API ناجح. |
| الأيام 6–7 | اختبار Frontend/API integration على حالات empty/error/slow network، ومراجعة الشحن والعملة والـ coupon data. |
| الأيام 8–9 | Regression على Admin CRUD، customer profile/orders/returns، checkout COD/wallet/PayTabs sandbox، وRBAC بحسابين مختلفين. |
| اليوم 10 | إصلاحات P1/P2 المتبقية، إعادة اختبار كامل، وتقرير Release Candidate. |

## التقدير النهائي

**10 أيام عمل (أسبوعان)** بفريق Frontend + Backend + QA يعملون بالتوازي.  
الـ coding fixes نفسها تساوي تقريبًا 5–7 أيام عمل، والباقي integration/regression/retest. لو العمل سيتم بواسطة شخص واحد بالتتابع فالتقدير الواقعي **12–14 يوم عمل**. عدم توفر Staging أو PayTabs sandbox أو حسابات اختبار قد يضيف **2–3 أيام** ولا يصح اعتباره ضمن ضمان الأسبوعين.

معالجة كل P1، نجاح الـ 32 سيناريو Dashboard، نجاح الـ public/customer/admin smoke flows، وثبات الـ API contracts هي شروط الإغلاق؛ لا توجد في الخطة أي زيادة في نطاق الـ Features.
