# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-catalog.spec.js >> Products CRUD + attribute linkage >> PRD-14 identical Arabic and English names (e.g. a brand name) can be saved
- Location: tests/e2e/admin-catalog.spec.js:624:3

# Error details

```
Error: {"status":false,"message":"SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry 'qa-pw-same-mv58iepl' for key 'product_translations.product_translations_slug_unique' (Connection: mysql, Host: 127.0.0.1, Port: 3306, Database: tijara-new-database, SQL: insert into `product_translations` (`locale`, `product_id`, `name`, `slug`, `product_description`, `key_features`, `tips`, `shipping_info`) values (ar, 37, QA-PW Same MV58IEPL, qa-pw-same-mv58iepl, ?, ?, ?, ?))","exception":"UniqueConstraintViolationException","file":"\/home11\/bekite\/backend-tijara.be-kite.com\/vendor\/laravel\/framework\/src\/Illuminate\/Database\/Connection.php","line":843,"trace":[{"file":"\/home11\/bekite\/backend-tijara.be-kite.com\/vendor\/laravel\/framework\/src\/Illuminate\/Database\/Connection.php","line":799,"function":"runQueryCallback","class":"Illuminate\\Database\\Connection"},{"file":"\/home11\/bekite\/backend-tijara.be-kite.com\/vendor\/laravel\/framework\/src\/Illuminate\/Database\/MySqlConnection.php","line":42,"function":"run","class":"Illuminate\\Database\\Connection"},{"file":"\/home11\/bekite\/backend-tijara.be-kite.com\/vendor\/laravel\/framework\/src\/Illuminate\/Database\/Query\/Processors\/MySqlProcessor.php","line":35,"function":"insert","class":"Illuminate\\Database\\MySqlConnection"},{"file":"\/home11\/bekite\/backend-tijara.be-kite.com\/vendor\/laravel\/framework\/src\/Illuminate\/Database\/Query\/Builder.php","line":4257,"function":"processInsertGetId","class":"Illuminate\\Database\\Query\\Processors\\MySqlProcessor"},{"file":"\/home11\/bekite\/backend-tijara.be-kite.com\/vendor\/laravel\/framework\/src\/Illuminate\/Database\/Eloquent\/Builder.php","line":2271,"function":"insertGetId","class":"Illuminate\\Database\\Query\\Builder"}]}

expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 500
```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - complementary [ref=f1e4]:
    - img "Mastergas" [ref=f1e7]
    - navigation [ref=f1e8]:
      - link "لوحة القيادة" [ref=f1e9] [cursor=pointer]:
        - /url: /admin/dashboard
      - link "أقسام المنتجات" [ref=f1e17] [cursor=pointer]:
        - /url: /admin/categories
      - link "المنتجات" [ref=f1e22] [cursor=pointer]:
        - /url: /admin/products
      - link "خصائص المنتجات" [ref=f1e28] [cursor=pointer]:
        - /url: /admin/attributes
      - link "تغذية المنتجات (Feeds)" [ref=f1e32] [cursor=pointer]:
        - /url: /admin/data-feeds
      - link "الطلبات" [ref=f1e39] [cursor=pointer]:
        - /url: /admin/orders
      - link "المرتجعات" [ref=f1e45] [cursor=pointer]:
        - /url: /admin/returns
      - link "تقييمات المنتجات" [ref=f1e53] [cursor=pointer]:
        - /url: /admin/reviews
      - link "العملاء" [ref=f1e59] [cursor=pointer]:
        - /url: /admin/customers
      - link "أكواد الخصم" [ref=f1e67] [cursor=pointer]:
        - /url: /admin/coupons
      - link "العروض والخصومات" [ref=f1e72] [cursor=pointer]:
        - /url: /admin/discounts
      - link "إعلانات السلايدر" [ref=f1e79] [cursor=pointer]:
        - /url: /admin/sliders
      - link "بوابات الدفع" [ref=f1e84] [cursor=pointer]:
        - /url: /admin/payments
      - link "رسائل العملاء" [ref=f1e89] [cursor=pointer]:
        - /url: /admin/messages
      - link "صفحات الموقع" [ref=f1e94] [cursor=pointer]:
        - /url: /admin/topics
      - link "الإعدادات" [ref=f1e100] [cursor=pointer]:
        - /url: /admin/settings
  - generic [ref=f1e106]:
    - banner [ref=f1e107]:
      - navigation [ref=f1e109]:
        - generic [ref=f1e112]: لوحة التحكم الرئيسية
      - generic [ref=f1e113]:
        - button [ref=f1e114] [cursor=pointer]
        - generic [ref=f1e119] [cursor=pointer]: admin
    - main [ref=f1e127]:
      - generic [ref=f1e128]:
        - generic [ref=f1e129]:
          - generic [ref=f1e130]:
            - heading "إدارة المنتجات" [level=2] [ref=f1e131]
            - paragraph [ref=f1e132]: إضافة وتعديل وإدارة المنتجات
          - button "إضافة منتج جديد" [ref=f1e133] [cursor=pointer]
        - generic [ref=f1e135]:
          - generic [ref=f1e142]:
            - generic [ref=f1e143]: إجمالي المنتجات
            - generic [ref=f1e144]: "10"
          - generic [ref=f1e150]:
            - generic [ref=f1e151]: منتجات نشطة
            - generic [ref=f1e152]: "10"
          - generic [ref=f1e157]:
            - generic [ref=f1e158]: منتجات غير نشطة
            - generic [ref=f1e159]: "0"
          - generic [ref=f1e164]:
            - generic [ref=f1e165]: إجمالي المبيعات
            - generic [ref=f1e166]: "0"
        - generic [ref=f1e167]:
          - textbox "البحث عن منتج..." [ref=f1e172]
          - combobox [ref=f1e174] [cursor=pointer]:
            - option "جميع الحالات" [selected]
            - option "نشط"
            - option "غير نشط"
          - combobox [ref=f1e176] [cursor=pointer]:
            - option "جميع الأقسام" [selected]
            - option "ملحقات وقطع غيار الغاز"
            - option "شوايات الغاز الخارجية"
            - option "سخانات المياه بالغاز"
            - option "مواقد وبلت إن الغاز"
            - option "كواشف تسرب الغاز وأنظمة الأمان"
            - option "خراطيم ووصلات الغاز"
            - option "معدات الغاز للتخييم والرحلات"
            - option "مدافئ ومواقد الغاز"
            - option "منظمات وصمامات الغاز"
            - option "أسطوانات الغاز والخزانات"
            - option "QA-PW قسم المنتج MV58IEPL"
            - option "QA-PW <img src=x onerror=\"window.__xss=1\"> MV58IEPL"
        - table [ref=f1e178]:
          - rowgroup [ref=f1e179]:
            - row [ref=f1e180]:
              - columnheader "المنتج" [ref=f1e181]
              - columnheader "السعر" [ref=f1e182]
              - columnheader "المخزون" [ref=f1e183]
              - columnheader "المبيعات" [ref=f1e184]
              - columnheader "الحالة" [ref=f1e185]
              - columnheader "الإجراءات" [ref=f1e186]
          - rowgroup [ref=f1e187]:
            - row [ref=f1e188]:
              - cell "QA-PW <script>window.__xss=1</script><img src=x onerror=window.__xss=2> AR MV58IEPL QA-PW <script>window.__xss=1</script><img src=x onerror=window.__xss=2> AR MV58IEPL QA-PW قسم المنتج MV58IEPL" [ref=f1e189]:
                - generic [ref=f1e190]:
                  - img "QA-PW <script>window.__xss=1</script><img src=x onerror=window.__xss=2> AR MV58IEPL" [ref=f1e192]
                  - generic [ref=f1e193]:
                    - generic [ref=f1e194]: QA-PW <script>window.__xss=1</script><img src=x onerror=window.__xss=2> AR MV58IEPL
                    - generic [ref=f1e195]: QA-PW قسم المنتج MV58IEPL
              - cell "98.51 د.أ 99.50 د.أ" [ref=f1e196]:
                - generic [ref=f1e197]:
                  - generic [ref=f1e198]: 98.51 د.أ
                  - generic [ref=f1e199]: 99.50 د.أ
              - cell "6210" [ref=f1e200]
              - cell [ref=f1e201]
              - cell "نشط" [ref=f1e205]
              - cell [ref=f1e207]:
                - generic [ref=f1e208]:
                  - button "حذف" [ref=f1e209] [cursor=pointer]
                  - button "تعديل" [ref=f1e212] [cursor=pointer]
                  - button "عرض" [ref=f1e216] [cursor=pointer]
            - row [ref=f1e220]:
              - cell "QA-PW منتج MV58IEPL ZERO QA-PW منتج MV58IEPL ZERO QA-PW قسم المنتج MV58IEPL" [ref=f1e221]:
                - generic [ref=f1e222]:
                  - img "QA-PW منتج MV58IEPL ZERO" [ref=f1e224]
                  - generic [ref=f1e225]:
                    - generic [ref=f1e226]: QA-PW منتج MV58IEPL ZERO
                    - generic [ref=f1e227]: QA-PW قسم المنتج MV58IEPL
              - cell "0.99 د.أ 1.00 د.أ" [ref=f1e228]:
                - generic [ref=f1e229]:
                  - generic [ref=f1e230]: 0.99 د.أ
                  - generic [ref=f1e231]: 1.00 د.أ
              - cell "0" [ref=f1e232]
              - cell [ref=f1e233]
              - cell "نشط" [ref=f1e237]
              - cell [ref=f1e239]:
                - generic [ref=f1e240]:
                  - button "حذف" [ref=f1e241] [cursor=pointer]
                  - button "تعديل" [ref=f1e244] [cursor=pointer]
                  - button "عرض" [ref=f1e248] [cursor=pointer]
            - row [ref=f1e252]:
              - cell "QA-PW منتج MV58IEPL QA-PW منتج MV58IEPL QA-PW قسم المنتج MV58IEPL" [ref=f1e253]:
                - generic [ref=f1e254]:
                  - img "QA-PW منتج MV58IEPL" [ref=f1e256]
                  - generic [ref=f1e257]:
                    - generic [ref=f1e258]: QA-PW منتج MV58IEPL
                    - generic [ref=f1e259]: QA-PW قسم المنتج MV58IEPL
              - cell "108.00 د.أ 120.00 د.أ" [ref=f1e260]:
                - generic [ref=f1e261]:
                  - generic [ref=f1e262]: 108.00 د.أ
                  - generic [ref=f1e263]: 120.00 د.أ
              - cell "6209" [ref=f1e264]
              - cell [ref=f1e265]
              - cell "نشط" [ref=f1e269]
              - cell [ref=f1e271]:
                - generic [ref=f1e272]:
                  - button "حذف" [ref=f1e273] [cursor=pointer]
                  - button "تعديل" [ref=f1e276] [cursor=pointer]
                  - button "عرض" [ref=f1e280] [cursor=pointer]
            - row [ref=f1e284]:
              - cell "منتج اختبار Playwright بمعرف قسم 18 1791804769766 منتج اختبار Playwright بمعرف قسم 18 1791804769766 مواقد وبلت إن الغاز" [ref=f1e285]:
                - generic [ref=f1e286]:
                  - img "منتج اختبار Playwright بمعرف قسم 18 1791804769766" [ref=f1e288]
                  - generic [ref=f1e289]:
                    - generic [ref=f1e290]: منتج اختبار Playwright بمعرف قسم 18 1791804769766
                    - generic [ref=f1e291]: مواقد وبلت إن الغاز
              - cell "224.99 د.أ 249.99 د.أ" [ref=f1e292]:
                - generic [ref=f1e293]:
                  - generic [ref=f1e294]: 224.99 د.أ
                  - generic [ref=f1e295]: 249.99 د.أ
              - cell "7" [ref=f1e296]
              - cell [ref=f1e297]
              - cell "نشط" [ref=f1e301]
              - cell [ref=f1e303]:
                - generic [ref=f1e304]:
                  - button "حذف" [ref=f1e305] [cursor=pointer]
                  - button "تعديل" [ref=f1e308] [cursor=pointer]
                  - button "عرض" [ref=f1e312] [cursor=pointer]
            - row [ref=f1e316]:
              - cell "سخان مياه غاز فوري رقمي ماسترجاز 12 لتر أمان كامل ODS +3 سخان مياه غاز فوري رقمي ماسترجاز 12 لتر أمان كامل ODS سخانات المياه بالغاز" [ref=f1e317]:
                - generic [ref=f1e318]:
                  - generic [ref=f1e319]:
                    - img "سخان مياه غاز فوري رقمي ماسترجاز 12 لتر أمان كامل ODS" [ref=f1e320]
                    - generic "3 صور للمنتج" [ref=f1e321]: "+3"
                  - generic [ref=f1e322]:
                    - generic [ref=f1e323]: سخان مياه غاز فوري رقمي ماسترجاز 12 لتر أمان كامل ODS
                    - generic [ref=f1e324]: سخانات المياه بالغاز
              - cell "876.85 د.أ 1,349.00 د.أ" [ref=f1e325]:
                - generic [ref=f1e326]:
                  - generic [ref=f1e327]: 876.85 د.أ
                  - generic [ref=f1e328]: 1,349.00 د.أ
              - cell "40" [ref=f1e329]
              - cell [ref=f1e330]
              - cell "نشط" [ref=f1e334]
              - cell [ref=f1e336]:
                - generic [ref=f1e337]:
                  - button "حذف" [ref=f1e338] [cursor=pointer]
                  - button "تعديل" [ref=f1e341] [cursor=pointer]
                  - button "عرض" [ref=f1e345] [cursor=pointer]
            - row [ref=f1e349]:
              - cell "شواية باربيكيو غاز فاخرة 4 شعلات للحدائق والمزارع مع مقياس حرارة +3 شواية باربيكيو غاز فاخرة 4 شعلات للحدائق والمزارع مع مقياس حرارة شوايات الغاز الخارجية" [ref=f1e350]:
                - generic [ref=f1e351]:
                  - generic [ref=f1e352]:
                    - img "شواية باربيكيو غاز فاخرة 4 شعلات للحدائق والمزارع مع مقياس حرارة" [ref=f1e353]
                    - generic "3 صور للمنتج" [ref=f1e354]: "+3"
                  - generic [ref=f1e355]:
                    - generic [ref=f1e356]: شواية باربيكيو غاز فاخرة 4 شعلات للحدائق والمزارع مع مقياس حرارة
                    - generic [ref=f1e357]: شوايات الغاز الخارجية
              - cell "2,924.35 د.أ 4,499.00 د.أ" [ref=f1e358]:
                - generic [ref=f1e359]:
                  - generic [ref=f1e360]: 2,924.35 د.أ
                  - generic [ref=f1e361]: 4,499.00 د.أ
              - cell "15" [ref=f1e362]
              - cell [ref=f1e363]
              - cell "نشط" [ref=f1e367]
              - cell [ref=f1e369]:
                - generic [ref=f1e370]:
                  - button "حذف" [ref=f1e371] [cursor=pointer]
                  - button "تعديل" [ref=f1e374] [cursor=pointer]
                  - button "عرض" [ref=f1e378] [cursor=pointer]
            - row [ref=f1e382]:
              - cell "مسطح غاز ستانلس ستيل بلت إن ماسترجاز 4 شعلات 60 سم +3 مسطح غاز ستانلس ستيل بلت إن ماسترجاز 4 شعلات 60 سم مواقد وبلت إن الغاز" [ref=f1e383]:
                - generic [ref=f1e384]:
                  - generic [ref=f1e385]:
                    - img "مسطح غاز ستانلس ستيل بلت إن ماسترجاز 4 شعلات 60 سم" [ref=f1e386]
                    - generic "3 صور للمنتج" [ref=f1e387]: "+3"
                  - generic [ref=f1e388]:
                    - generic [ref=f1e389]: مسطح غاز ستانلس ستيل بلت إن ماسترجاز 4 شعلات 60 سم
                    - generic [ref=f1e390]: مواقد وبلت إن الغاز
              - cell "974.35 د.أ 1,499.00 د.أ" [ref=f1e391]:
                - generic [ref=f1e392]:
                  - generic [ref=f1e393]: 974.35 د.أ
                  - generic [ref=f1e394]: 1,499.00 د.أ
              - cell "35" [ref=f1e395]
              - cell [ref=f1e396]
              - cell "نشط" [ref=f1e400]
              - cell [ref=f1e402]:
                - generic [ref=f1e403]:
                  - button "حذف" [ref=f1e404] [cursor=pointer]
                  - button "تعديل" [ref=f1e407] [cursor=pointer]
                  - button "عرض" [ref=f1e411] [cursor=pointer]
            - row [ref=f1e415]:
              - cell "شفاط مطبخ هرمي إيطالي ماسترجاز 90 سم بقوة شفط 1200 م³/ساعة +3 شفاط مطبخ هرمي إيطالي ماسترجاز 90 سم بقوة شفط 1200 م³/ساعة مواقد وبلت إن الغاز" [ref=f1e416]:
                - generic [ref=f1e417]:
                  - generic [ref=f1e418]:
                    - img "شفاط مطبخ هرمي إيطالي ماسترجاز 90 سم بقوة شفط 1200 م³/ساعة" [ref=f1e419]
                    - generic "3 صور للمنتج" [ref=f1e420]: "+3"
                  - generic [ref=f1e421]:
                    - generic [ref=f1e422]: شفاط مطبخ هرمي إيطالي ماسترجاز 90 سم بقوة شفط 1200 م³/ساعة
                    - generic [ref=f1e423]: مواقد وبلت إن الغاز
              - cell "1,169.35 د.أ 1,799.00 د.أ" [ref=f1e424]:
                - generic [ref=f1e425]:
                  - generic [ref=f1e426]: 1,169.35 د.أ
                  - generic [ref=f1e427]: 1,799.00 د.أ
              - cell "20" [ref=f1e428]
              - cell [ref=f1e429]
              - cell "نشط" [ref=f1e433]
              - cell [ref=f1e435]:
                - generic [ref=f1e436]:
                  - button "حذف" [ref=f1e437] [cursor=pointer]
                  - button "تعديل" [ref=f1e440] [cursor=pointer]
                  - button "عرض" [ref=f1e444] [cursor=pointer]
            - row [ref=f1e448]:
              - cell "مسطح غاز زجاجي بلت إن ماسترجاز 5 شعلات 90 سم مع شعلة ووك +3 مسطح غاز زجاجي بلت إن ماسترجاز 5 شعلات 90 سم مع شعلة ووك مواقد وبلت إن الغاز" [ref=f1e449]:
                - generic [ref=f1e450]:
                  - generic [ref=f1e451]:
                    - img "مسطح غاز زجاجي بلت إن ماسترجاز 5 شعلات 90 سم مع شعلة ووك" [ref=f1e452]
                    - generic "3 صور للمنتج" [ref=f1e453]: "+3"
                  - generic [ref=f1e454]:
                    - generic [ref=f1e455]: مسطح غاز زجاجي بلت إن ماسترجاز 5 شعلات 90 سم مع شعلة ووك
                    - generic [ref=f1e456]: مواقد وبلت إن الغاز
              - cell "1,526.85 د.أ 2,349.00 د.أ" [ref=f1e457]:
                - generic [ref=f1e458]:
                  - generic [ref=f1e459]: 1,526.85 د.أ
                  - generic [ref=f1e460]: 2,349.00 د.أ
              - cell "30" [ref=f1e461]
              - cell [ref=f1e462]
              - cell "نشط" [ref=f1e466]
              - cell [ref=f1e468]:
                - generic [ref=f1e469]:
                  - button "حذف" [ref=f1e470] [cursor=pointer]
                  - button "تعديل" [ref=f1e473] [cursor=pointer]
                  - button "عرض" [ref=f1e477] [cursor=pointer]
            - row [ref=f1e481]:
              - cell "فرن غاز مدمج إيطالي ماسترجاز 90 سم أمان كامل شواية دوارة +3 فرن غاز مدمج إيطالي ماسترجاز 90 سم أمان كامل شواية دوارة مواقد وبلت إن الغاز" [ref=f1e482]:
                - generic [ref=f1e483]:
                  - generic [ref=f1e484]:
                    - img "فرن غاز مدمج إيطالي ماسترجاز 90 سم أمان كامل شواية دوارة" [ref=f1e485]
                    - generic "3 صور للمنتج" [ref=f1e486]: "+3"
                  - generic [ref=f1e487]:
                    - generic [ref=f1e488]: فرن غاز مدمج إيطالي ماسترجاز 90 سم أمان كامل شواية دوارة
                    - generic [ref=f1e489]: مواقد وبلت إن الغاز
              - cell "2,534.35 د.أ 3,899.00 د.أ" [ref=f1e490]:
                - generic [ref=f1e491]:
                  - generic [ref=f1e492]: 2,534.35 د.أ
                  - generic [ref=f1e493]: 3,899.00 د.أ
              - cell "25" [ref=f1e494]
              - cell [ref=f1e495]
              - cell "نشط" [ref=f1e499]
              - cell [ref=f1e501]:
                - generic [ref=f1e502]:
                  - button "حذف" [ref=f1e503] [cursor=pointer]
                  - button "تعديل" [ref=f1e506] [cursor=pointer]
                  - button "عرض" [ref=f1e510] [cursor=pointer]
        - generic [ref=f1e514]: إظهار 1 - 10 من أصل 10 منتج
        - generic [ref=f1e517]:
          - button [ref=f1e518] [cursor=pointer]
          - heading "إضافة منتج جديدة" [level=3] [ref=f1e522]
          - paragraph [ref=f1e523]: أدخل معلومات السلعة للجدول
          - tablist "Language" [ref=f1e524]:
            - button "English" [ref=f1e525] [cursor=pointer]
            - button "العربية" [ref=f1e526] [cursor=pointer]
          - generic [ref=f1e527]:
            - button "معلومات المنتج" [ref=f1e528] [cursor=pointer]
            - button "خصائص المنتج" [ref=f1e529] [cursor=pointer]
          - generic [ref=f1e530]:
            - generic [ref=f1e531]:
              - generic [ref=f1e532]:
                - generic [ref=f1e533]:
                  - generic [ref=f1e534]: صور المنتج *
                  - generic [ref=f1e535]: 1 / 15 صور
                - generic [ref=f1e536]:
                  - paragraph [ref=f1e542] [cursor=pointer]: اضغط أو اسحب لرفع صور متعددة للمنتج(JPG, PNG, WebP | بحد أقصى 15 صورة)
                  - generic [ref=f1e544]:
                    - generic [ref=f1e546]: الرئيسية
                    - button "✕" [ref=f1e547] [cursor=pointer]
              - generic [ref=f1e548]:
                - generic [ref=f1e549]: اسم المنتج (عربي) *
                - textbox "أدخل اسم المنتج بالعربي (Enter product name in Arabic)" [ref=f1e550]: QA-PW Same MV58IEPL
              - generic [ref=f1e551]:
                - generic [ref=f1e552]:
                  - generic [ref=f1e553]: القسم الرئيسي *
                  - combobox [ref=f1e555] [cursor=pointer]:
                    - option "اختر القسم الرئيسي هنا (Select Main Category)" [disabled]
                    - option "ملحقات وقطع غيار الغاز"
                    - option "شوايات الغاز الخارجية"
                    - option "سخانات المياه بالغاز"
                    - option "مواقد وبلت إن الغاز"
                    - option "كواشف تسرب الغاز وأنظمة الأمان"
                    - option "خراطيم ووصلات الغاز"
                    - option "معدات الغاز للتخييم والرحلات"
                    - option "مدافئ ومواقد الغاز"
                    - option "منظمات وصمامات الغاز"
                    - option "أسطوانات الغاز والخزانات"
                    - option "QA-PW قسم المنتج MV58IEPL" [selected]
                    - option "QA-PW <img src=x onerror=\"window.__xss=1\"> MV58IEPL"
                - generic [ref=f1e556]:
                  - generic [ref=f1e557]: القسم الفرعي
                  - combobox [disabled] [ref=f1e559] [cursor=pointer]:
                    - option "لا يوجد (None)" [selected]
              - generic [ref=f1e560]:
                - generic [ref=f1e561]:
                  - generic [ref=f1e562]: السعر (د.أ) *
                  - spinbutton "0.00 (Price in JOD)" [ref=f1e563]: "99.5"
                - generic [ref=f1e564]:
                  - generic [ref=f1e565]: الخصم (%)
                  - spinbutton "1–99% (Discount)" [ref=f1e566]
                  - generic [ref=f1e567]: الحد الأدنى المقبول من النظام 1% — يُطبَّق تلقائياً عند ترك الحقل فارغاً.
              - generic [ref=f1e568]:
                - generic [ref=f1e569]:
                  - generic [ref=f1e570]: المخزون *
                  - spinbutton "0 (Stock)" [ref=f1e571]: "6211"
                - generic [ref=f1e572]:
                  - generic [ref=f1e573]: الحالة
                  - combobox [ref=f1e575] [cursor=pointer]:
                    - option "نشط (Active)" [selected]
                    - option "غير نشط (Inactive)"
              - generic [ref=f1e576]:
                - generic [ref=f1e577]: وصف المنتج (عربي) *
                - generic [ref=f1e578]:
                  - generic [ref=f1e579]:
                    - generic [ref=f1e580] [cursor=pointer]: B
                    - generic [ref=f1e581] [cursor=pointer]: I
                    - generic [ref=f1e582] [cursor=pointer]: U
                  - textbox "أدخل تفاصيل ووصف المنتج بالعربي هنا... (Enter product description in Arabic...)" [ref=f1e583]
              - generic [ref=f1e584]:
                - generic [ref=f1e585]: المميزات ونظرة عامة (Features & Overview)
                - generic [ref=f1e586]:
                  - generic [ref=f1e587]:
                    - generic [ref=f1e588] [cursor=pointer]: B
                    - generic [ref=f1e589] [cursor=pointer]: I
                    - generic [ref=f1e590] [cursor=pointer]: U
                  - textbox "أدخل المزايا الرئيسية للمنتج (تغذي تبويب نظرة عامة بالمتجر - ميزة في كل سطر)..." [ref=f1e591]
              - generic [ref=f1e592]:
                - generic [ref=f1e593]: دليل التركيب وإرشادات الاستخدام (Installation Guide & Tips)
                - generic [ref=f1e594]:
                  - generic [ref=f1e595]:
                    - generic [ref=f1e596] [cursor=pointer]: B
                    - generic [ref=f1e597] [cursor=pointer]: I
                    - generic [ref=f1e598] [cursor=pointer]: U
                  - textbox "أدخل متطلبات التركيب وخطوات التركيب وإرشادات الأمان (تغذي تبويب التركيب بالمتجر)..." [ref=f1e599]
              - generic [ref=f1e600]:
                - generic [ref=f1e601]: الشحن والإرجاع والضمان (Shipping, Returns & Warranty)
                - generic [ref=f1e602]:
                  - generic [ref=f1e603]:
                    - generic [ref=f1e604] [cursor=pointer]: B
                    - generic [ref=f1e605] [cursor=pointer]: I
                    - generic [ref=f1e606] [cursor=pointer]: U
                  - textbox "تفاصيل الشحن، شروط الاستبدال والإرجاع، ومدة وسياسة الضمان (تغذي تبويب الشحن والإرجاع بالمتجر)..." [ref=f1e607]
            - button "إضافة المنتج" [ref=f1e609] [cursor=pointer]
        - generic [ref=f1e610]: "SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry 'qa-pw-same-mv58iepl' for key 'product_translations.product_translations_slug_unique' (Connection: mysql, Host: 127.0.0.1, Port: 3306, Database: tijara-new-database, SQL: insert into `product_translations` (`locale`, `product_id`, `name`, `slug`, `product_description`, `key_features`, `tips`, `shipping_info`) values (ar, 37, QA-PW Same MV58IEPL, qa-pw-same-mv58iepl, ?, ?, ?, ?))"
```

# Test source

```ts
  534 |     await expect(rowOf(page, prodAr)).toBeVisible();
  535 |     await page.locator('input.search-input').fill('zzzz-none-zzzz');
  536 |     await expect(page.locator('tbody tr', { hasText: prodAr })).toHaveCount(0);
  537 |     await page.locator('input.search-input').fill('');
  538 |     await page.locator('select.form-select').nth(1).selectOption({ label: prodCatAr });
  539 |     await expect(rowOf(page, prodAr)).toBeVisible();
  540 |   });
  541 | 
  542 |   test('PRD-8 required fields: empty submit is blocked, nothing is posted', async ({ page }) => {
  543 |     await page.locator('.add-btn').click();
  544 |     let posted = false;
  545 |     page.on('request', (r) => { if (r.method() === 'POST' && r.url().endsWith('/api/v1/products')) posted = true; });
  546 |     await page.locator('.btn-submit').click();
  547 |     await page.waitForTimeout(1200);
  548 |     expect(posted).toBe(false);
  549 |   });
  550 | 
  551 |   test('PRD-15 the 1% minimum discount is explained and out-of-range discounts are rejected with a message', async ({ page }) => {
  552 |     await page.locator('.add-btn').click();
  553 |     await expect(page.locator('.field-hint')).toContainText('1%');
  554 |     await fillBasics(page, { discount: '100' });
  555 |     let posted = false;
  556 |     page.on('request', (r) => { if (r.method() === 'POST' && r.url().endsWith('/api/v1/products')) posted = true; });
  557 |     await page.locator('.btn-submit').click({ noWaitAfter: true });
  558 |     await page.waitForTimeout(1200);
  559 |     expect(posted).toBe(false);
  560 |   });
  561 | 
  562 |   test('PRD-9 negative price / negative stock / discount 100 are not stored as-is', async ({ page }) => {
  563 |     const attempts = [
  564 |       { price: '-5', stock: '1', discount: '' },
  565 |       { price: '10', stock: '-3', discount: '' },
  566 |       { price: '10', stock: '1', discount: '150' },
  567 |     ];
  568 |     for (const a of attempts) {
  569 |       await page.locator('.add-btn').click();
  570 |       await fillBasics(page, a);
  571 |       const respPromise = page.waitForResponse((r) => r.request().method() === 'POST' && r.url().endsWith('/api/v1/products'), { timeout: 5000 }).catch(() => null);
  572 |       await page.locator('.btn-submit').click();
  573 |       const res = await respPromise;
  574 |       const outcome = res ? res.status() : 'blocked-by-browser-validation';
  575 |       test.info().annotations.push({ type: 'observation', description: `${JSON.stringify(a)} → ${outcome}` });
  576 |       expect(res === null || res.status() === 422 || res.status() === 400, `invalid input ${JSON.stringify(a)} must not be created (got ${outcome})`).toBe(true);
  577 |       if (res && res.status() === 201) { const b = await res.json(); const { ctx, headers } = await apiToken(); await ctx.delete(`/api/v1/products/${b.data.id}`, { headers }); await ctx.dispose(); }
  578 |       await page.keyboard.press('Escape');
  579 |       await page.locator('.modal-close').first().click().catch(() => {});
  580 |       await open(page, 'products');
  581 |     }
  582 |   });
  583 | 
  584 |   test('PRD-10 stock 0 is accepted and shown as 0 (boundary)', async ({ page }) => {
  585 |     await page.locator('.add-btn').click();
  586 |     await fillBasics(page, { price: '1', stock: '0' });
  587 |     await page.locator('input[placeholder^="Product name"]').fill(`${prodEn} ZERO`);
  588 |     await page.locator('.i18n-btn', { hasText: 'العربية' }).click();
  589 |     await page.locator('input[placeholder^="أدخل اسم المنتج"]').fill(`${prodAr} ZERO`);
  590 |     const [res] = await Promise.all([page.waitForResponse((r) => r.request().method() === 'POST' && r.url().endsWith('/api/v1/products')), page.locator('.btn-submit').click()]);
  591 |     expect(res.status()).toBe(201);
  592 |     await expect(rowOf(page, `${prodAr} ZERO`)).toContainText('0');
  593 |   });
  594 | 
  595 |   test('PRD-11 hostile HTML in name is inert in table and view modal', async ({ page }) => {
  596 |     await page.locator('.add-btn').click();
  597 |     await fillBasics(page, { stock: String(STOCK + 1) });
  598 |     const xss = (lang) => `${TAG} <script>window.__xss=1</script><img src=x onerror=window.__xss=2> ${lang} ${RUN}`;
  599 |     await page.locator('.i18n-btn', { hasText: 'English' }).click();
  600 |     await page.locator('input[placeholder^="Product name"]').fill(xss('EN'));
  601 |     await page.locator('.i18n-btn', { hasText: 'العربية' }).click();
  602 |     await page.locator('input[placeholder^="أدخل اسم المنتج"]').fill(xss('AR'));
  603 |     const [res] = await Promise.all([page.waitForResponse((r) => r.request().method() === 'POST' && r.url().endsWith('/api/v1/products')), page.locator('.btn-submit').click()]);
  604 |     expect(res.status(), await res.text()).toBe(201);
  605 |     await page.waitForTimeout(1500);
  606 |     await rowOf(page, 'window.__xss').locator('.view-btn').click();
  607 |     await expect(page.locator('.modal-content.view-content')).toBeVisible();
  608 |     expect(await page.evaluate(() => window.__xss)).toBeUndefined();
  609 |     expect(await page.locator('tbody img[src="x"], .view-content img[src="x"]').count()).toBe(0);
  610 |   });
  611 | 
  612 |   // KNOWN DEFECT QA-B2: expected to FAIL until the backend stops treating stock (`number`) as unique.
  613 |   test('PRD-13 two products may share the same stock quantity', async ({ page }) => {
  614 |     test.fail(true, 'Backend validates `number` (stock) as unique: "The number has already been taken."');
  615 |     await page.locator('.add-btn').click();
  616 |     await fillBasics(page, { stock: String(STOCK) });
  617 |     await page.locator('.i18n-btn', { hasText: 'English' }).click();
  618 |     await page.locator('input[placeholder^="Product name"]').fill(`${prodEn} SAMESTOCK`);
  619 |     const [res] = await Promise.all([page.waitForResponse((r) => r.request().method() === 'POST' && r.url().endsWith('/api/v1/products')), page.locator('.btn-submit').click()]);
  620 |     expect(res.status(), await res.text()).toBe(201);
  621 |   });
  622 | 
  623 |   // KNOWN DEFECT QA-B3: expected to FAIL until the backend validates slug uniqueness instead of crashing.
  624 |   test('PRD-14 identical Arabic and English names (e.g. a brand name) can be saved', async ({ page }) => {
  625 |     test.fail(true, 'Backend answers HTTP 500 "SQLSTATE[23000] Duplicate entry … slug" when both languages produce the same slug');
  626 |     await page.locator('.add-btn').click();
  627 |     await fillBasics(page, { stock: String(STOCK + 2) });
  628 |     const same = `${TAG} Same ${RUN}`;
  629 |     await page.locator('.i18n-btn', { hasText: 'English' }).click();
  630 |     await page.locator('input[placeholder^="Product name"]').fill(same);
  631 |     await page.locator('.i18n-btn', { hasText: 'العربية' }).click();
  632 |     await page.locator('input[placeholder^="أدخل اسم المنتج"]').fill(same);
  633 |     const [res] = await Promise.all([page.waitForResponse((r) => r.request().method() === 'POST' && r.url().endsWith('/api/v1/products')), page.locator('.btn-submit').click()]);
> 634 |     expect(res.status(), await res.text()).toBe(201);
      |                                            ^ Error: {"status":false,"message":"SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry 'qa-pw-same-mv58iepl' for key 'product_translations.product_translations_slug_unique' (Connection: mysql, Host: 127.0.0.1, Port: 3306, Database: tijara-new-database, SQL: insert into `product_translations` (`locale`, `product_id`, `name`, `slug`, `product_description`, `key_features`, `tips`, `shipping_info`) values (ar, 37, QA-PW Same MV58IEPL, qa-pw-same-mv58iepl, ?, ?, ?, ?))","exception":"UniqueConstraintViolationException","file":"\/home11\/bekite\/backend-tijara.be-kite.com\/vendor\/laravel\/framework\/src\/Illuminate\/Database\/Connection.php","line":843,"trace":[{"file":"\/home11\/bekite\/backend-tijara.be-kite.com\/vendor\/laravel\/framework\/src\/Illuminate\/Database\/Connection.php","line":799,"function":"runQueryCallback","class":"Illuminate\\Database\\Connection"},{"file":"\/home11\/bekite\/backend-tijara.be-kite.com\/vendor\/laravel\/framework\/src\/Illuminate\/Database\/MySqlConnection.php","line":42,"function":"run","class":"Illuminate\\Database\\Connection"},{"file":"\/home11\/bekite\/backend-tijara.be-kite.com\/vendor\/laravel\/framework\/src\/Illuminate\/Database\/Query\/Processors\/MySqlProcessor.php","line":35,"function":"insert","class":"Illuminate\\Database\\MySqlConnection"},{"file":"\/home11\/bekite\/backend-tijara.be-kite.com\/vendor\/laravel\/framework\/src\/Illuminate\/Database\/Query\/Builder.php","line":4257,"function":"processInsertGetId","class":"Illuminate\\Database\\Query\\Processors\\MySqlProcessor"},{"file":"\/home11\/bekite\/backend-tijara.be-kite.com\/vendor\/laravel\/framework\/src\/Illuminate\/Database\/Eloquent\/Builder.php","line":2271,"function":"insertGetId","class":"Illuminate\\Database\\Query\\Builder"}]}
  635 |   });
  636 | 
  637 |   test('PRD-12 delete the products created by this suite', async ({ page }) => {
  638 |     for (const text of [`${prodAr} ZERO`, 'window.__xss', `${TAG} Same ${RUN}`, prodAr]) {
  639 |       for (let i = 0; i < 3 && (await page.locator('tbody tr', { hasText: text }).count()) > 0; i++) {
  640 |         await rowOf(page, text).locator('.delete-btn').click();
  641 |         await expect(toast(page)).toBeVisible();
  642 |         await page.waitForTimeout(900);
  643 |         await open(page, 'products');
  644 |       }
  645 |     }
  646 |     await expect(page.locator('tbody tr', { hasText: TAG })).toHaveCount(0);
  647 |   });
  648 | 
  649 |   test('ATT-7 an attribute can be deleted once its product is gone; row disappears', async ({ page }) => {
  650 |     await open(page, 'attributes');
  651 |     await rowOf(page, attrAr).locator('.delete-btn').click();
  652 |     await expect(toast(page)).toContainText('تم حذف الخاصية بنجاح');
  653 |     await page.reload(); await open(page, 'attributes');
  654 |     await expect(page.locator('tbody tr', { hasText: attrAr })).toHaveCount(0);
  655 |   });
  656 | 
  657 |   test('POST cleanup the product category', async ({ page }) => {
  658 |     await open(page, 'categories');
  659 |     await rowOf(page, prodCatAr).locator('.delete-btn').click();
  660 |     await expect(toast(page)).toContainText('تم الحذف بنجاح');
  661 |   });
  662 | });
  663 | 
  664 | // ════════════════════════════════════════════════════════════════════════════
  665 | // DISCOUNTS
  666 | // ════════════════════════════════════════════════════════════════════════════
  667 | const dName = `${TAG} Disc ${RUN}`;
  668 | const dNameAr = `${TAG} خصم ${RUN}`;
  669 | 
  670 | test.describe('Discounts CRUD', () => {
  671 |   test.describe.configure({ mode: 'serial' });
  672 |   test.beforeEach(async ({ page }) => { await loginOk(page); await open(page, 'discounts'); });
  673 | 
  674 |   const fillOffer = async (page, { code, type = 'نسبة مئوية', value = '10', min = '', start = '2026-10-12', end = '2031-12-31', nameEn = dName, nameAr = dNameAr } = {}) => {
  675 |     await page.locator('.i18n-btn', { hasText: 'العربية' }).click();
  676 |     await page.locator('input[placeholder="مثلاً: خصم الربيع الكبير"]').fill(nameAr);
  677 |     await page.locator('.i18n-btn', { hasText: 'English' }).click();
  678 |     await page.locator('input[placeholder="Offer name in English"]').fill(nameEn);
  679 |     await page.locator('.type-card', { hasText: type }).click();
  680 |     await page.locator('input[placeholder="0.00"]').first().fill(value);
  681 |     await page.locator('input[placeholder="SPRING20"]').fill(code);
  682 |     if (min) await page.locator('input[placeholder="0.00"]').nth(2).fill(min).catch(() => {});
  683 |     const dates = page.locator('.offer-form input[type=date]');
  684 |     await dates.nth(0).fill(start);
  685 |     if (end) await dates.nth(1).fill(end);
  686 |   };
  687 | 
  688 |   test('DSC-1 create a percentage code; payload carries formatted dates', async ({ page }) => {
  689 |     await page.locator('.add-btn').click();
  690 |     await fillOffer(page, { code: CODE('A') });
  691 |     const [req] = await Promise.all([page.waitForRequest((r) => r.method() === 'POST' && r.url().endsWith('/api/v1/discount_codes')), page.locator('.btn-submit-form').click()]);
  692 |     const body = req.postDataJSON();
  693 |     expect(body.code).toBe(CODE('A'));
  694 |     expect(body.type).toBe('percentage');
  695 |     expect(body.value).toBe(10);
  696 |     expect(body.start_date).toBe('2026-10-12 00:00:00');
  697 |     expect(body.end_date).toBe('2031-12-31 23:59:59');
  698 |     await expect(toast(page)).toContainText('تم إنشاء العرض بنجاح');
  699 |     await expect(rowOf(page, CODE('A'))).toContainText('10%');
  700 |   });
  701 | 
  702 |   test('DSC-2 backend stores it as active with the right code/value', async () => {
  703 |     const d = (await listApi('discount_codes')).find((x) => x.code === CODE('A'));
  704 |     expect(d).toBeTruthy();
  705 |     expect(Number(d.value)).toBe(10);
  706 |     expect(d.is_active).toBeTruthy();
  707 |   });
  708 | 
  709 |   test('DSC-3 create a FIXED-amount code with a minimum order amount', async ({ page }) => {
  710 |     await page.locator('.add-btn').click();
  711 |     await fillOffer(page, { code: CODE('B'), type: 'قيمة ثابتة', value: '5', nameEn: `${dName} fixed`, nameAr: `${dNameAr} ثابت` });
  712 |     await page.locator('.form-label', { hasText: 'الحد الأدنى' }).locator('xpath=following::input[1]').fill('50').catch(() => {});
  713 |     const [req] = await Promise.all([page.waitForRequest((r) => r.method() === 'POST' && r.url().endsWith('/api/v1/discount_codes')), page.locator('.btn-submit-form').click()]);
  714 |     const body = req.postDataJSON();
  715 |     expect(body.type).toBe('fixed');
  716 |     test.info().annotations.push({ type: 'observation', description: `minimum_amount sent: ${body.minimum_amount}` });
  717 |     await expect(toast(page)).toContainText('تم إنشاء العرض بنجاح');
  718 |   });
  719 | 
  720 |   test('DSC-4 edit the value and see it in the table + after reload', async ({ page }) => {
  721 |     await rowOf(page, CODE('A')).locator('.edit-btn').click();
  722 |     await page.locator('input[placeholder="0.00"]').first().fill('25');
  723 |     const [res] = await Promise.all([waitWrite(page, 'PUT', '/api/v1/discount_codes/'), page.locator('.btn-submit-form').click()]);
  724 |     expect(res.status()).toBe(200);
  725 |     await expect(toast(page)).toContainText('تم تحديث العرض بنجاح');
  726 |     await page.reload(); await open(page, 'discounts');
  727 |     await expect(rowOf(page, CODE('A'))).toContainText('25%');
  728 |   });
  729 | 
  730 |   test('DSC-5 toggling status flips is_active on the backend and back', async ({ page }) => {
  731 |     const row = rowOf(page, CODE('A'));
  732 |     await row.locator('label').first().click();
  733 |     await expect(toast(page)).toContainText('تم تعطيل العرض');
  734 |     let d = (await listApi('discount_codes')).find((x) => x.code === CODE('A'));
```