import fs from 'node:fs';
import path from 'node:path';

const API_BASE = 'https://backend-mastergas.be-kite.com/api';

async function uploadProductWith4Images() {
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
  console.log('Login successful! Token acquired.');

  console.log('\n=== Step 2: Preparing 4 High-Quality Images ===');
  const imgPaths = [
    'public/catalog_images/prod_174_0.jpg',
    'public/catalog_images/prod_174_1.jpg',
    'public/catalog_images/prod_174_2.jpg',
    'public/catalog_images/prod_173_1.jpg'
  ];

  for (const p of imgPaths) {
    if (!fs.existsSync(p)) {
      throw new Error(`Missing image: ${p}`);
    }
    const stat = fs.statSync(p);
    console.log(`- ${p}: ${Math.round(stat.size / 1024)} KB`);
  }

  const formData = new FormData();
  formData.append('name', JSON.stringify({
    ar: 'فرن غاز إيطالي مدمج 90 سم رويال (Mastergas Royal 90)',
    en: 'Mastergas Royal 90cm Italian Built-in Gas Oven'
  }));
  formData.append('description', JSON.stringify({
    ar: 'فرن غاز بلت إن فاخر مقاس 90 سم بمعايير إيطالية متطورة وسعة ضخمة 110 لتر، مزود بنظام تبريد حراري ثلاثي الأبعاد وشواية دوارة ونظام أمان إيطالي كامل.',
    en: 'Luxury 90cm Italian built-in gas oven with 110L capacity, dynamic 3D convection fan, rotisserie grill, and full safety cut-off valves.'
  }));
  formData.append('price', '3499');
  formData.append('quantity', '25');
  formData.append('category_id', '57');
  formData.append('is_active', '1');
  formData.append('discount', '15');
  formData.append('sku', 'MG-ROYAL90-IT');

  formData.append('features', JSON.stringify({
    ar: 'سعة عملاقة 110 لتر\nمروحة توزيع حراري ثلاثية الأبعاد 3D Fan\nصمام أمان إيطالي كامل لكافة الشعلات\nشواية دوارة بمحرك ثنائي\nباب زجاجي ثلاثي الطبقات عازل للحرارة تماماً\nإشعال إلكتروني مدمج بلمسة واحدة\nضمان شامل 5 سنوات معتمد',
    en: 'Giant 110L internal capacity\n3D convection cooling fan\nFull Italian safety valve on all burners\nHeavy-duty rotisserie motor\nTriple-glazed cool-touch glass door\nOne-touch integrated electric ignition\n5 years comprehensive warranty'
  }));

  formData.append('tips', JSON.stringify({
    ar: 'يجب أن يتم التركيب بواسطة فني معتمد لضمان التهوية الصحيحة وتوصيل منظم الغاز الإيطالي بدقة.',
    en: 'Must be installed by an authorized technician to ensure proper cabinet ventilation and regulator connection.'
  }));

  formData.append('shipping_info', JSON.stringify({
    ar: 'شحن مجاني سريع خلال 24-48 ساعة مع خدمة التركيب والتشغيل المجانية داخل كافة المدن.',
    en: 'Free express shipping within 24-48 hours with complimentary installation.'
  }));

  const attributes = {
    'المقاس': ['90 سم', '110 لتر'],
    'بلد المنشأ': ['إيطاليا (Made in Italy)'],
    'نظام الأمان': ['أمان إيطالي كامل'],
    'الخامة': ['ستانلس ستيل 304 مقاوم للبصمات'],
    'الضمان': ['5 سنوات شامل الصيانة وقطع الغيار']
  };
  formData.append('attributes', JSON.stringify(attributes));

  const colors = [
    { label: 'ستانلس ستيل فضي', color: '#94a3b8' },
    { label: 'أسود كريستال ملكي', color: '#0f172a' }
  ];
  formData.append('color_options', JSON.stringify(colors));
  formData.append('size_options', JSON.stringify(['90 سم', '110 لتر']));

  // Attach primary image
  const firstBuffer = fs.readFileSync(imgPaths[0]);
  const firstBlob = new Blob([firstBuffer], { type: 'image/jpeg' });
  formData.append('image', firstBlob, 'prod_main_90.jpg');

  // Attach all 4 images to images[]
  for (let i = 0; i < imgPaths.length; i++) {
    const buf = fs.readFileSync(imgPaths[i]);
    const blob = new Blob([buf], { type: 'image/jpeg' });
    formData.append('images[]', blob, `prod_gallery_${i + 1}.jpg`);
  }

  console.log('\n=== Step 3: Sending POST /dashboard/products ===');
  const createRes = await fetch(`${API_BASE}/dashboard/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    body: formData
  });

  const responseText = await createRes.text();
  console.log(`Status: ${createRes.status}`);
  let createdData;
  try {
    createdData = JSON.parse(responseText);
    console.log('Response JSON:', JSON.stringify(createdData, null, 2));
  } catch (_) {
    console.log('Raw response:', responseText);
  }

  const createdId = createdData?.data?.id || createdData?.product?.id || createdData?.id;
  console.log(`\nCreated Product ID: ${createdId}`);

  console.log('\n=== Step 4: Verifying Product via Public Storefront API ===');
  if (createdId) {
    const getRes = await fetch(`${API_BASE}/frontend/products/${createdId}`, {
      headers: { 'Accept': 'application/json' }
    });
    console.log(`GET /frontend/products/${createdId} status: ${getRes.status}`);
    const getJson = await getRes.json();
    console.log('Storefront Data:', JSON.stringify(getJson, null, 2));
  }

  console.log('\n=== Step 5: Checking /frontend/products list ===');
  const listRes = await fetch(`${API_BASE}/frontend/products?per_page=10&is_active=1`, {
    headers: { 'Accept': 'application/json' }
  });
  const listJson = await listRes.json();
  console.log(`Total products in store: ${listJson?.data?.length || 0}`);
}

uploadProductWith4Images().catch(err => {
  console.error('Error occurred:', err);
  process.exit(1);
});
