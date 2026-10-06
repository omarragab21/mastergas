# تقرير اختبار الكارت عبر المتصفح

تاريخ التنفيذ: 2026-10-06T12:32:41.599Z

## النطاق والمنهجية

- التنفيذ تم من خلال Playwright والمتصفح فقط على `http://127.0.0.1:5173`.
- لم يستخدم سكربت الاختبار Axios أو fetch أو أي API endpoint مباشرة.
- البيانات المحلية تم تجهيزها داخل browser context عبر `localStorage` لتكرار السيناريوهات، ثم تم تنفيذ التفاعلات من خلال عناصر الواجهة المرئية.
- Browser plugin غير متاح في الجلسة؛ لذلك تم استخدام Playwright المحلي كمسار المتصفح البديل.
- وضع التطبيق المستخدم: `VITE_DATA_MODE=local`.
- تم التقاط Screenshot مستقل بعد كل سيناريو داخل مجلد `screenshots/`.

## ملخص النتائج

| المؤشر | النتيجة |
|---|---:|
| إجمالي السيناريوهات | 20 |
| ناجح | 19 |
| فاشل | 1 |
| Screenshots | 20 |

## السيناريوهات المنفذة

### 01. الحالة الأساسية: منتج واحد داخل الكارت على سطح المكتب

- الحالة: **PASS**
- الزمن: 1873ms
- المتوقع: صف واحد وكمية 1 وملخص ظاهر
- الحالة النهائية: URL=http://127.0.0.1:5173/cart، rows=1، quantities=["1"]
- الدليل: [screenshots/01-baseline-single-item.png](screenshots/01-baseline-single-item.png)


### 02. ثلاثة منتجات مختلفة وحساب صفوف الملخص

- الحالة: **PASS**
- الزمن: 1269ms
- المتوقع: 3 صفوف منتجات مع ملخص الإجمالي والشحن والضريبة
- الحالة النهائية: URL=http://127.0.0.1:5173/cart، rows=3، quantities=["1","1","1"]
- الدليل: [screenshots/02-multi-item-summary.png](screenshots/02-multi-item-summary.png)


### 03. إضافة منتج من صفحة المنتجات عبر زر الواجهة

- الحالة: **PASS**
- الزمن: 1652ms
- المتوقع: زر أضف للسلة من المنتجات أنشأ صفًا في الكارت
- الحالة النهائية: URL=http://127.0.0.1:5173/cart، rows=1، quantities=["1"]
- الدليل: [screenshots/03-add-from-products-ui.png](screenshots/03-add-from-products-ui.png)


### 04. إضافة نفس المنتج مرتين من الواجهة ودمج الكمية

- الحالة: **PASS**
- الزمن: 1914ms
- المتوقع: نفس المنتج يبقى في صف واحد والكمية تصبح 2
- الحالة النهائية: URL=http://127.0.0.1:5173/cart، rows=1، quantities=["2"]
- الدليل: [screenshots/04-duplicate-add-increments.png](screenshots/04-duplicate-add-increments.png)


### 05. زيادة الكمية بزر + وتحديث ملخص الكارت

- الحالة: **PASS**
- الزمن: 1157ms
- المتوقع: الكمية تزيد من 1 إلى 2 بعد ضغطة واحدة
- الحالة النهائية: URL=http://127.0.0.1:5173/cart، rows=1، quantities=["2"]
- الدليل: [screenshots/05-increase-quantity.png](screenshots/05-increase-quantity.png)


### 06. حد إنقاص الكمية: زر − مع كمية 1 يظل معطلاً

- الحالة: **PASS**
- الزمن: 1353ms
- المتوقع: لا يمكن النزول تحت كمية 1
- الحالة النهائية: URL=http://127.0.0.1:5173/cart، rows=1، quantities=["1"]
- الدليل: [screenshots/06-decrease-quantity-boundary.png](screenshots/06-decrease-quantity-boundary.png)


### 07. الحد الأعلى للكمية عبر 1000 ضغطة UI

- الحالة: **PASS**
- الزمن: 34490ms
- المتوقع: الكمية تتوقف عند 999 ولا تتجاوزها
- الحالة النهائية: URL=http://127.0.0.1:5173/cart، rows=1، quantities=["999"]
- الدليل: [screenshots/07-quantity-upper-bound.png](screenshots/07-quantity-upper-bound.png)


### 08. حذف منتج واحد مع بقاء باقي المنتجات

- الحالة: **PASS**
- الزمن: 1242ms
- المتوقع: حذف صف واحد لا يمس باقي الصفوف
- الحالة النهائية: URL=http://127.0.0.1:5173/cart، rows=2، quantities=["1","1"]
- الدليل: [screenshots/08-remove-one-of-many.png](screenshots/08-remove-one-of-many.png)


### 09. حذف آخر منتج وظهور الحالة الفارغة

- الحالة: **PASS**
- الزمن: 1140ms
- المتوقع: رسالة السلة الفارغة وزر التسوق يظهران
- الحالة النهائية: URL=http://127.0.0.1:5173/cart، rows=0، quantities=[]
- الدليل: [screenshots/09-remove-last-empty-state.png](screenshots/09-remove-last-empty-state.png)


### 10. استمرارية الكمية بعد إعادة تحميل الصفحة

- الحالة: **PASS**
- الزمن: 1259ms
- المتوقع: الكمية 2 تبقى بعد reload
- الحالة النهائية: URL=http://127.0.0.1:5173/cart، rows=1، quantities=["2"]
- الدليل: [screenshots/10-reload-persistence.png](screenshots/10-reload-persistence.png)


### 11. كوبون غير صالح وإظهار رسالة خطأ بدون خصم

- الحالة: **PASS**
- الزمن: 1186ms
- المتوقع: رسالة خطأ وعدم إضافة صف خصم
- الحالة النهائية: URL=http://127.0.0.1:5173/cart، rows=1، quantities=["1"]
- الدليل: [screenshots/11-invalid-coupon.png](screenshots/11-invalid-coupon.png)


### 12. كوبون صالح وإظهار صف الخصم وتحديث الإجمالي

- الحالة: **PASS**
- الزمن: 1375ms
- المتوقع: الكوبون IRIS2026 يضيف صف الخصم ويعرض رسالة نجاح
- الحالة النهائية: URL=http://127.0.0.1:5173/cart، rows=1، quantities=["1"]
- الدليل: [screenshots/12-valid-coupon.png](screenshots/12-valid-coupon.png)


### 13. تطبيق الكوبون باستخدام زر Enter

- الحالة: **PASS**
- الزمن: 1191ms
- المتوقع: زر Enter داخل حقل الكوبون يطبق الكوبون
- الحالة النهائية: URL=http://127.0.0.1:5173/cart، rows=1، quantities=["1"]
- الدليل: [screenshots/13-coupon-enter-key.png](screenshots/13-coupon-enter-key.png)


### 14. حذف Variant واحد مع الحفاظ على Variant آخر لنفس المنتج

- الحالة: **FAIL**
- الزمن: 2010ms
- المتوقع: حذف Variant بالـ cart_item_key لا يحذف المنتج الآخر
- الحالة النهائية: URL=http://127.0.0.1:5173/cart، rows=0، quantities=[]
- الدليل: [screenshots/14-variant-isolation.png](screenshots/14-variant-isolation.png)
- الخطأ: `Expected one variant left, got 0`

### 15. الانتقال من الكارت إلى checkout

- الحالة: **PASS**
- الزمن: 1575ms
- المتوقع: زر متابعة الطلب ينقل إلى /checkout
- الحالة النهائية: URL=http://127.0.0.1:5173/checkout، rows=0، quantities=[]
- الدليل: [screenshots/15-checkout-navigation.png](screenshots/15-checkout-navigation.png)


### 16. الانتقال من الكارت إلى المنتجات

- الحالة: **PASS**
- الزمن: 1742ms
- المتوقع: زر متابعة التسوق ينقل إلى /products
- الحالة النهائية: URL=http://127.0.0.1:5173/products، rows=0، quantities=[]
- الدليل: [screenshots/16-continue-shopping-navigation.png](screenshots/16-continue-shopping-navigation.png)


### 17. فتح صفحة المنتج من صورة أو اسم المنتج

- الحالة: **PASS**
- الزمن: 2508ms
- المتوقع: النقر على تفاصيل المنتج ينقل إلى صفحة المنتج
- الحالة النهائية: URL=http://127.0.0.1:5173/product/25، rows=0، quantities=[]
- الدليل: [screenshots/17-product-detail-navigation.png](screenshots/17-product-detail-navigation.png)


### 18. تبديل اللغة إلى English والتحقق من LTR

- الحالة: **PASS**
- الزمن: 1927ms
- المتوقع: زر اللغة يحول الصفحة من RTL إلى LTR
- الحالة النهائية: URL=http://127.0.0.1:5173/cart، rows=2، quantities=["1","1"]
- الدليل: [screenshots/18-english-ltr-layout.png](screenshots/18-english-ltr-layout.png)


### 19. عرض الكارت على Mobile بدون قص أو خروج أفقي

- الحالة: **PASS**
- الزمن: 1044ms
- المتوقع: الكارت والملخص يظهران في viewport 390x844 بدون overflow
- الحالة النهائية: URL=http://127.0.0.1:5173/cart، rows=3، quantities=["1","1","1"]
- الدليل: [screenshots/19-mobile-layout.png](screenshots/19-mobile-layout.png)


### 20. تفاعل الكمية والحذف على Mobile

- الحالة: **PASS**
- الزمن: 1136ms
- المتوقع: زيادة الكمية والحذف يعملان على Mobile
- الحالة النهائية: URL=http://127.0.0.1:5173/cart، rows=1، quantities=["2"]
- الدليل: [screenshots/20-mobile-quantity-and-remove.png](screenshots/20-mobile-quantity-and-remove.png)



## فحوصات عامة

- تم التحقق من أن صفحات الكارت والمنتجات والـ checkout وصفحة المنتج ليست Blank.
- تم اختبار الحذف الجزئي والحذف الكامل والحالة الفارغة.
- تم اختبار حفظ الكمية بعد Reload.
- تم اختبار الحد الأدنى للكمية والحد الأعلى 999 من خلال ضغطات UI فعلية.
- تم اختبار كوبون صالح، كوبون غير صالح، وتطبيق الكوبون بزر Enter.
- تم اختبار اختلاف الـ variants لنفس المنتج.
- تم اختبار التنقل إلى المنتجات والـ checkout وصفحة المنتج.
- تم اختبار RTL و LTR و Mobile 390x844.
- تم فحص Console/page errors أثناء التنفيذ.

## صحة الـ Console

- Console errors: **0**.
- Page errors: **0**.
- Console warnings: **166**، وكلها تحذيرات i18n متكررة عن غياب المفتاح `nav.search` في رسائل `ar` و`en`، ولم تمنع أي تفاعل.
- لا ظهر أي Vite/framework error overlay أثناء الاختبارات.

## Findings

- **Variant isolation:** بعد تحديث بيانات المنتج داخل الكارت، يتم فقدان `cart_item_key`/الـ variant identity. عند حذف Variant واحد، يصبح المعرف المستخدم هو product id نفسه، فيتم حذف الـ variants الاثنين بدلًا من واحد. هذه مشكلة في سلوك التطبيق وليست مشكلة في بيانات الاختبار.

## ملاحظات

- 14. حذف Variant واحد مع الحفاظ على Variant آخر لنفس المنتج: Expected one variant left, got 0

## الصور

- 01. [baseline-single-item](screenshots/01-baseline-single-item.png)
- 02. [multi-item-summary](screenshots/02-multi-item-summary.png)
- 03. [add-from-products-ui](screenshots/03-add-from-products-ui.png)
- 04. [duplicate-add-increments](screenshots/04-duplicate-add-increments.png)
- 05. [increase-quantity](screenshots/05-increase-quantity.png)
- 06. [decrease-quantity-boundary](screenshots/06-decrease-quantity-boundary.png)
- 07. [quantity-upper-bound](screenshots/07-quantity-upper-bound.png)
- 08. [remove-one-of-many](screenshots/08-remove-one-of-many.png)
- 09. [remove-last-empty-state](screenshots/09-remove-last-empty-state.png)
- 10. [reload-persistence](screenshots/10-reload-persistence.png)
- 11. [invalid-coupon](screenshots/11-invalid-coupon.png)
- 12. [valid-coupon](screenshots/12-valid-coupon.png)
- 13. [coupon-enter-key](screenshots/13-coupon-enter-key.png)
- 14. [variant-isolation](screenshots/14-variant-isolation.png)
- 15. [checkout-navigation](screenshots/15-checkout-navigation.png)
- 16. [continue-shopping-navigation](screenshots/16-continue-shopping-navigation.png)
- 17. [product-detail-navigation](screenshots/17-product-detail-navigation.png)
- 18. [english-ltr-layout](screenshots/18-english-ltr-layout.png)
- 19. [mobile-layout](screenshots/19-mobile-layout.png)
- 20. [mobile-quantity-and-remove](screenshots/20-mobile-quantity-and-remove.png)
