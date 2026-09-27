# Mastergas Backend Performance Action Plan

## الهدف

تحسين أداء واستقرار Public Storefront APIs بدون تغيير عقد الاستجابة أو كسر تكامل Vue Frontend الحالي.

الأهداف المقترحة بعد التنفيذ:

- Products API: median أقل من 500ms.
- Products API: P95 أقل من 800ms.
- Settings/Categories/Offers/Sliders: P95 أقل من 400ms.
- عدم وجود N+1 queries.
- دعم `per_page=9`, `20`, و`50` بزمن استجابة مستقر.
- الحفاظ على نفس شكل JSON الحالي أثناء فترة الانتقال.

## نتائج الفحص الحالي

تم فحص الـ public endpoints مباشرة بتاريخ 2026-09-21 من بيئة خارجية:

| Endpoint | النتيجة المرصودة |
|---|---:|
| `GET /api/frontend/products?per_page=9&is_active=1` | حوالي 1.5–1.8 ثانية في العينة |
| `GET /api/frontend/products?per_page=20&is_active=1` | حوالي 1.5 ثانية في العينة |
| `GET /api/frontend/categories?is_active=1` | حوالي 1.4 ثانية في العينة |
| `GET /api/frontend/offers?is_active=1` | حوالي 1.1 ثانية في العينة |
| `GET /api/frontend/settings` | حوالي 1.2 ثانية في العينة |
| `GET /api/frontend/sliders?is_active=1` | timeout متقطع أثناء الفحص |

Headers المرصودة:

```http
Cache-Control: no-cache, private
Content-Type: application/json
Server: LiteSpeed
```

لم يظهر `Content-Encoding: gzip` أو `br` في الفحص. يجب التأكد من إعداد الضغط على مستوى LiteSpeed أو reverse proxy.

هذه عينة تشخيصية وليست benchmark إنتاجيًا نهائيًا، لكنها تؤكد أن البطء الأساسي ليس من Vue فقط.

## الأولوية P0 — Products API

### 1. فحص SQL وقياس كل مرحلة

أضف قياسًا منفصلًا لـ:

- زمن SQL query.
- زمن eager loading للعلاقات.
- زمن serialization/resource transformation.
- زمن ضغط وإرسال response.

استخدم Laravel Telescope أو query listener في بيئة staging، وسجّل:

- endpoint.
- filters بعد sanitization.
- عدد queries.
- مجموع زمن SQL.
- عدد النتائج.
- `per_page`.
- response bytes.

لا تسجل tokens أو بيانات العملاء.

### 2. Indexes مطلوبة

تحقق من schema الفعلي ثم أضف migrations مناسبة. الأسماء التالية مقترحة وليست إلزامية:

```sql
CREATE INDEX products_active_category_idx
ON products (is_active, category_id);

CREATE INDEX products_active_created_idx
ON products (is_active, created_at);

CREATE INDEX products_active_price_idx
ON products (is_active, price);

CREATE INDEX products_active_stock_idx
ON products (is_active, stock);
```

إذا كان البحث يستخدم `LIKE '%term%'` فلا يكفي index عادي. استخدم أحد الحلول التالية:

- MySQL FULLTEXT index على الأعمدة النصية المناسبة.
- Laravel Scout مع Meilisearch/Typesense.
- search column normalized ومفهرس إذا كان البحث محدودًا.

لا تضف indexes عشوائيًا قبل مراجعة `EXPLAIN` لأن كثرة indexes ترفع تكلفة الكتابة.

### 3. منع N+1

تأكد من استخدام eager loading واحد واضح:

```php
$products = Product::query()
    ->select([
        'id', 'category_id', 'brand_id', 'name', 'slug',
        'price', 'sale_price', 'discount', 'stock',
        'is_active', 'created_at', 'updated_at',
    ])
    ->with([
        'category:id,name,name_ar,name_en',
        'brand:id,name,name_ar,name_en',
        'images:id,product_id,path,sort_order',
    ]);
```

لا ترجع أعمدة غير مستخدمة في product cards أو listing.

### 4. Pagination حقيقية

استخدم `paginate()` أو `simplePaginate()`، ولا تجلب كل المنتجات ثم تعمل `slice()` في PHP.

الاستجابة يجب أن تحافظ على الشكل التالي:

```json
{
  "data": {
    "data": [],
    "current_page": 1,
    "last_page": 4,
    "per_page": 20,
    "total": 73
  }
}
```

كما يجب قبول:

- `page`.
- `per_page` مع whitelist مثل `9, 20, 50`.
- `category_id`.
- `search`.
- `is_active`.
- `in_stock`.
- `has_discount` أو `has_offer`.
- `origin`.
- `sort_by`.

ضع حدًا أقصى لـ `per_page` مثل 50 لمنع abuse.

### 5. تطبيق الفلاتر داخل SQL

لا تعتمد على فلترة الصفحة الحالية في Frontend. الفلاتر يجب تنفيذها قبل pagination:

```php
$query->when($request->filled('category_id'), fn ($q) =>
    $q->where('category_id', $request->integer('category_id'))
);

$query->when($request->boolean('in_stock'), fn ($q) =>
    $q->where('stock', '>', 0)
);

$query->when($request->boolean('has_discount'), fn ($q) =>
    $q->where(function ($discountQuery) {
        $discountQuery
            ->where(function ($q) {
                $q->whereNotNull('sale_price')
                  ->whereColumn('sale_price', '<', 'price');
            })
            ->orWhere('discount', '>', 0)
            ->orWhereHas('activeOffers');
    })
);
```

يجب تعريف `activeOffers` بوضوح مع فحص:

- `is_active`.
- start date.
- end date.
- product/category scope.

لا تعتبر وجود `sale_price` وحده دليلًا على وجود active offer.

### 6. Sorting آمن

استخدم whitelist فقط:

```php
$sortMap = [
    'relevant' => ['created_at', 'desc'],
    'price_asc' => ['price', 'asc'],
    'price_desc' => ['price', 'desc'],
    'newest' => ['created_at', 'desc'],
];
```

لا تمرر `sort_by` مباشرة إلى `orderBy` بدون whitelist.

## الأولوية P0 — الاستجابة والـ HTTP

### 1. Compression

فعّل Brotli أو gzip للـ JSON والصور التي تمر عبر الخادم. تحقق من وجود:

```http
Content-Encoding: br
```

أو:

```http
Content-Encoding: gzip
```

### 2. Cache headers للـ public GET APIs

بعد التأكد أن البيانات public ولا تحتوي بيانات مستخدم:

```http
Cache-Control: public, max-age=60, s-maxage=60, stale-while-revalidate=300
ETag: "..."
Vary: Accept-Language
```

المدد المقترحة:

| Resource | Browser/CDN TTL |
|---|---:|
| settings | 300 ثانية |
| categories | 300 ثانية |
| offers | 60 ثانية |
| sliders | 60 ثانية |
| product list | 30–60 ثانية |
| product detail | 60 ثانية |

أبقى `private/no-cache` فقط للـ authenticated endpoints.

### 3. Response compression and payload size

قِس response bytes قبل وبعد:

- حذف الحقول غير المستخدمة.
- عدم إعادة كل صور المنتج في listing.
- إرسال thumbnail واحدة فقط في list.
- إرسال full-size images في detail فقط.
- استخدام URLs مباشرة من object storage/CDN.

الـ listing يجب ألا يعيد image metadata كبيرًا أو descriptions طويلة إلا عند الحاجة.

## الأولوية P1 — Categories / Offers / Settings / Sliders

### Settings

- حوّل settings إلى object server-side أو حافظ على array مع endpoint version واضح.
- أرجع فقط public settings المطلوبة للمتجر.
- استخدم cache دائم نسبيًا مع invalidation عند تعديل setting من dashboard.

### Categories

- أرجع `products_count` من query محسّن أو cached count.
- لا تشغّل count query منفصلة لكل category.
- استخدم aggregate واحد أو denormalized counter إذا كان العدد يتغير كثيرًا.

### Offers

- أرجع active offers فقط في public endpoint.
- استخدم query موحد للتاريخ والحالة.
- أرجع product/category IDs المطلوبة بدل تحميل المنتجات كاملة داخل كل offer.
- أضف index على status/date إذا كان جدول offers كبيرًا:

```sql
CREATE INDEX offers_active_dates_idx
ON offers (is_active, start_date, end_date);
```

### Sliders

- أصلح timeout المتقطع أولًا.
- لا ترجع raw image payload أو بيانات غير مستخدمة.
- استخدم CDN وresponsive image variants.
- أرجع active sliders مرتبة بوضوح.

## الأولوية P1 — الصور وCDN

لكل منتج وفّر:

- thumbnail للقائمة بعرض تقريبي 480px.
- medium للـ related products.
- full-size لصفحة التفاصيل فقط.
- WebP أو AVIF مع fallback JPEG.
- `width` و`height` ثابتين.

يفضل تخزين الصور في object storage/CDN بدل Laravel filesystem المباشر إذا كان ذلك متاحًا.

مثال response للقائمة:

```json
{
  "image": {
    "thumb": "https://cdn.example.com/products/7/thumb.webp",
    "medium": "https://cdn.example.com/products/7/medium.webp"
  }
}
```

لا تغيّر field القديم فجأة. يمكن إضافة `image_variants` مع الإبقاء على `image` خلال فترة انتقالية.

## الأولوية P1 — ثبات عقد الـ API مع Frontend

لا تغيّر هذه النقاط بدون versioning أو فترة توافق:

- `/frontend/products`.
- `/frontend/products/{id}`.
- `/frontend/categories`.
- `/frontend/offers`.
- `/frontend/settings`.
- `/frontend/sliders`.

الـ Frontend الحالي يدعم عدة response shapes، لكن العقد المفضل هو:

```json
{
  "data": {
    "data": [],
    "total": 0,
    "current_page": 1,
    "last_page": 1,
    "per_page": 20
  }
}
```

في حال تغيير أسماء query parameters، يجب دعم الأسماء القديمة لمدة انتقالية أو إصدار `/v2/frontend/...`.

## Observability وSLO

أضف dashboard أو logs قابلة للبحث تحتوي على:

- route.
- status code.
- duration.
- DB query count.
- DB duration.
- response bytes.
- cache hit/miss.
- `per_page`.
- filter combination.
- request ID.

راقب منفصلًا:

- median.
- P90.
- P95.
- P99.
- error rate.
- timeout rate.

التنبيه المقترح:

- P95 للمنتجات يتجاوز 800ms لمدة 5 دقائق.
- timeout rate يتجاوز 1%.
- 5xx rate يتجاوز 0.5%.
- query count يتجاوز 10 للـ products list.

## خطة تنفيذ بدون التأثير على Frontend

### المرحلة 1 — قياس فقط

1. أضف query logging وrequest ID في staging.
2. نفّذ `EXPLAIN` على products list مع `per_page=9,20,50`.
3. حدّد N+1 والحقول الأكبر حجمًا.
4. خذ baseline median/P95/P99.

### المرحلة 2 — تحسين داخلي متوافق

1. أضف indexes بعد مراجعة EXPLAIN.
2. طبّق eager loading وselect fields.
3. طبّق SQL pagination والفلاتر.
4. فعّل compression.
5. لا تغيّر JSON contract.

### المرحلة 3 — cache وCDN

1. فعّل ETag وpublic cache للـ GET public endpoints.
2. أضف invalidation من dashboard عند تعديل products/categories/offers/settings/sliders.
3. انقل الصور إلى variants/CDN.

### المرحلة 4 — إطلاق تدريجي

1. Canary أو feature flag للـ optimized query.
2. قارن النتائج القديمة والجديدة.
3. تحقق من العدد والـ pagination والـ filters.
4. راقب الأخطاء لمدة 24–48 ساعة.

## اختبارات قبول يجب أن يسلّمها Backend

- Products list لا يتجاوز 10 SQL queries.
- `per_page=9,20,50` يرجع `total/current_page/last_page/per_page` صحيحة.
- البحث لا يستخدم full table scan بعد تجهيز search index.
- category/stock/discount/origin/sort تعمل على مستوى SQL.
- لا يوجد N+1 عند تحميل category/brand/images/offers.
- 100 concurrent requests لا تسبب timeout أو انهيار.
- response compression فعّال.
- cache headers موجودة للـ public GET.
- sliders لا تتجاوز 400ms P95 ولا يوجد timeout متقطع.
- response القديمة والجديدة متطابقة business-wise.

## ملاحظة مهمة للـ Frontend

لا يحتاج Frontend إلى تغيير إضافي إذا حافظ Backend على:

- نفس endpoint paths.
- نفس query parameter names.
- نفس response envelope.
- نفس semantics للـ filters والـ offers.
- `meta` pagination كاملة.

أي تغيير breaking يجب أن يأتي بإصدار API جديد أو compatibility layer، وليس بتغيير مفاجئ في endpoint الحالي.
