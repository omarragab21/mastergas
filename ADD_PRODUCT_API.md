# توثيق إضافة المنتجات في لوحة التحكم (Add Product API & Payload Guide)

دليل شامل يوضح بالتدقيق كيفية عمل الـ API المسؤول عن إضافة المنتجات في لوحة التحكم (Dashboard)، شكل البيانات والـ Payload، الكود الفعلي المنفذ، وكيفية إرسال مصفوفة الصور المتعددة.

---

## 1. معلومات الـ Endpoint والمصادقة

- **الرابط الكامل (Full URL):** `https://backend-mastergas.be-kite.com/api/dashboard/products`
- **نوع الطلب (HTTP Method):** `POST`
- **نوع المحتوى (Content-Type):** `multipart/form-data`
- **ترويسات المصادقة المطلوبة (Headers):**
  ```http
  Authorization: Bearer <ADMIN_TOKEN>
  Accept: application/json
  ```

---

## 2. جدول الحقول والبيانات المرسلة (FormData Fields)

| اسم المفتاح (Key) | النوع في الـ Request | الوصف | مثال واقعي للقيمة (Example Value) |
|---|---|---|---|
| `name` | Text (JSON String) | اسم المنتج باللغتين العربية والإنجليزية | `{"ar":"فرن غاز مدمج 60 سم","en":"Built-in Gas Oven 60cm"}` |
| `description` | Text (JSON String) | وصف تفصيلي للمنتج باللغتين | `{"ar":"فرن غاز إيطالي متطور بسعة 65 لتر","en":"Italian gas oven with 65L capacity"}` |
| `price` | Text / Number | السعر الأساسي للمنتج | `2499` |
| `quantity` أو `stock` | Text / Number | الكمية المتوفرة بالمخزون | `25` |
| `category_id` | Text / Number | الرقم التعريفي للتصنيف التابع له | `57` |
| `subcategory_id` | Text / Number (اختياري) | الرقم التعريفي للتصنيف الفرعي | `null` |
| `discount` | Text / Number (اختياري) | نسبة الخصم المباشرة (0 إذا لا يوجد خصم) | `0` أو `15` |
| `is_active` | Text / Number | حالة تفعيل المنتج في المتجر | `1` (نشط) أو `0` (معطل) |
| `sku` | Text (اختياري) | كود الموديل الفريد | `MG-OV60-IT` |
| `features` | Text (JSON String) | قائمة النقاط والمميزات مفصولة بأسطر | `{"ar":"سعة 65 لتر\nأمان كامل\nإشعال ذاتي","en":"65L Capacity\nFull Safety\nAuto Ignition"}` |
| `tips` | Text (JSON String) | تعليمات وإرشادات دليل التركيب | `{"ar":"تأكد من إيقاف إمداد الغاز قبل البدء","en":"Shut off gas supply before setup"}` |
| `shipping_info` | Text (JSON String) | معلومات الشحن والضمان | `{"ar":"شحن مجاني وضمان 3 سنوات","en":"Free shipping with 3 years warranty"}` |
| `attributes` | Text (JSON String) | مصفوفة المواصفات التقنية كـ Key-Value | `{"المقاس":["60 سم"],"بلد المنشأ":["إيطاليا"],"صمام الأمان":["أمان كامل"]}` |
| `color_options` | Text (JSON String) | خيارات الألوان المعروضة للمشتري | `[{"label":"ستانلس ستيل","color":"#cbd5e1"},{"label":"أسود مطفي","color":"#111827"}]` |
| `size_options` | Text (JSON String) | خيارات المقاسات | `["60 سم", "65 لتر"]` |
| `image` | File (Binary) | ملف الصورة الرئيسية للغلاف | *(الملف الثنائي للصورة الأولى)* |
| `images[]` | File (Binary) | مصفوفة صور المعرض (تكرر لكل صورة) | *(الملف الثنائي للصورة الأولى)* |
| `images[]` | File (Binary) | تكرار نفس المفتاح للصورة الثانية | *(الملف الثنائي للصورة الثانية)* |
| `images[]` | File (Binary) | تكرار نفس المفتاح للصورة الثالثة | *(الملف الثنائي للصورة الثالثة)* |

---

## 3. الكود الفعلي من مشروع لوحة التحكم (`src/views/ProductsView.vue`)

هذا هو الكود المطبق في لوحة التحكم عند الضغط على زر **"حفظ المنتج"**:

```javascript
// مقتطف من src/views/ProductsView.vue (السطور 1469 - 1540)
const submitForm = async () => {
  isSubmitting.value = true;
  
  const fd = new FormData();
  
  // 1. البيانات الأساسية
  fd.append('name', JSON.stringify({ 
    ar: form.value.name_ar || '', 
    en: form.value.name_en || '' 
  }));
  fd.append('price', form.value.price);
  fd.append('quantity', form.value.quantity);
  fd.append('is_active', form.value.is_active ? 1 : 0);
  
  if (form.value.category_id) fd.append('category_id', form.value.category_id);
  if (form.value.subcategory_id) fd.append('subcategory_id', form.value.subcategory_id);
  
  fd.append('description', JSON.stringify({ 
    ar: form.value.description_ar || '', 
    en: form.value.description_en || '' 
  }));
  fd.append('discount', form.value.discount || 0);
  fd.append('features', JSON.stringify({ 
    ar: form.value.features_ar || '', 
    en: form.value.features_en || '' 
  }));
  fd.append('tips', JSON.stringify({ 
    ar: form.value.tips_ar || '', 
    en: form.value.tips_en || '' 
  }));
  fd.append('shipping_info', JSON.stringify({ 
    ar: form.value.shipping_info_ar || '', 
    en: form.value.shipping_info_en || '' 
  }));

  // 2. المواصفات الفنية المدمجة
  fd.append('attributes', JSON.stringify(finalAttributes));
  fd.append('color_options', JSON.stringify(form.value.colors || []));
  fd.append('size_options', JSON.stringify(form.value.sizes || []));

  // 3. إرفاق مصفوفة الصور الجديدة
  form.value.new_images.forEach(imgFile => { 
    fd.append('images[]', imgFile); 
  });

  // وضع الصورة الأولى كصورة غلاف رئيسية
  if (form.value.new_images.length > 0 && form.value.existing_images.length === 0) {
    fd.append('image', form.value.new_images[0]);
  }

  // 4. تنفيذ طلب الإرسال إلى السيرفر
  try {
    if (isEdit.value) {
      // في حالة التعديل يتم إرسال _method: PUT
      fd.append('_method', 'PUT');
      await api.post(`/dashboard/products/${editingId.value}`, fd, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
    } else {
      // في حالة الإضافة الجديدة
      await api.post('/dashboard/products', fd, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
    }
  } catch (error) {
    console.error('Save failed:', error);
  } finally {
    isSubmitting.value = false;
  }
};
```

---

## 4. سكريبت تجربة جاهز للتشغيل في Node.js / JavaScript

يمكنك تشغيل هذا الكود لاختبار رفع منتج مع 3 صور برمجياً في أي وقت:

```javascript
import fs from 'node:fs';

async function testAddProduct() {
  const token = 'YOUR_ADMIN_TOKEN_HERE';
  const API_URL = 'https://backend-mastergas.be-kite.com/api/dashboard/products';

  const fd = new FormData();

  // النصوص المترجمة
  fd.append('name', JSON.stringify({
    ar: 'فرن غاز مدمج بلت-إن 60 سم فاخر',
    en: 'Mastergas Luxury Built-in Gas Oven 60cm'
  }));
  fd.append('description', JSON.stringify({
    ar: 'صمم فرن ماسترجاز المدمج بحجم 60 سم ليقدم تجربة طهي احترافية.',
    en: 'Engineered in 60cm built-in format for professional culinary excellence.'
  }));
  fd.append('price', '2499');
  fd.append('quantity', '25');
  fd.append('category_id', '57');
  fd.append('sku', 'MG-OV60-IT');
  fd.append('is_active', '1');

  // المواصفات والألوان
  fd.append('attributes', JSON.stringify({
    'المقاس': ['60 سم', 'سعة 65 لتر'],
    'بلد المنشأ': ['إيطاليا'],
    'الضمان': ['3 سنوات شامل الصيانة المنزلية']
  }));
  fd.append('color_options', JSON.stringify([
    { label: 'ستانلس ستيل', color: '#cbd5e1' },
    { label: 'أسود مطفي', color: '#111827' }
  ]));

  // إرفاق ملفات الصور الثلاث
  const img1 = new Blob([fs.readFileSync('public/catalog_images/prod_173_0.jpg')], { type: 'image/jpeg' });
  const img2 = new Blob([fs.readFileSync('public/catalog_images/prod_173_1.jpg')], { type: 'image/jpeg' });
  const img3 = new Blob([fs.readFileSync('public/catalog_images/prod_173_2.jpg')], { type: 'image/jpeg' });

  fd.append('image', img1, 'cover.jpg');
  fd.append('images[]', img1, 'img_0.jpg');
  fd.append('images[]', img2, 'img_1.jpg');
  fd.append('images[]', img3, 'img_2.jpg');

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    body: fd
  });

  const json = await res.json();
  console.log('Server Response:', json);
}

testAddProduct();
```

---

## 5. شكل استجابة السيرفر المتوقعة عند النجاح (`HTTP 201 Created`)

```json
{
  "status": "success",
  "message": "Product created successfully",
  "data": {
    "id": 183,
    "sku": "MG-OV60-IT",
    "name": "Mastergas Luxury Built-in Gas Oven 60cm",
    "name_i18n": {
      "ar": "فرن غاز مدمج بلت-إن 60 سم فاخر",
      "en": "Mastergas Luxury Built-in Gas Oven 60cm"
    },
    "price": 2499,
    "stock": 25,
    "category_id": 57,
    "is_active": true,
    "image": "https://backend-mastergas.be-kite.com/storage/products/183_cover.jpg",
    "images": [
      "https://backend-mastergas.be-kite.com/storage/products/183_img_0.jpg",
      "https://backend-mastergas.be-kite.com/storage/products/183_img_1.jpg",
      "https://backend-mastergas.be-kite.com/storage/products/183_img_2.jpg"
    ],
    "created_at": "2026-09-15T12:00:00.000000Z"
  }
}
```
