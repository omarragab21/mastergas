import fs from 'node:fs';

const API_BASE = 'http://backend-mastergas.be-kite.com/api';

const newOffers = [
  {
    name_ar: 'باقة الطهي الإيطالي المتكامل - خصم 20%',
    name_en: 'Master Chef Complete Italian Deal - 20% OFF',
    desc_ar: 'عرض حصري متكامل يجمع أفضل أفران ومسطحات الغاز والشفاطات الإيطالية الفاخرة بخصم استثنائي 20% مع شحن وتركيب مجاني.',
    desc_en: 'Exclusive bundle deal combining luxury Italian built-in ovens, 5-burner gas hobs, and cooker hoods with a 20% discount plus free installation.',
    type: 'percentage',
    value: '20',
    applies_to: 'products',
    selected_products: ['7', '8', '9'],
    image_path: 'public/catalog_images/prod_174_0.jpg',
    badge_text_ar: 'خصم 20%',
    badge_text_en: '20% OFF'
  },
  {
    name_ar: 'منظومة الأمان والسلامة الذكية - خصم 15%',
    name_en: 'Smart Gas Safety & Protection Pack - 15% OFF',
    desc_ar: 'احمِ منزلك وعائلتك مع باقة الأمان الشاملة: كاشف تسريب الغاز الذكي مع صمام الغلق التلقائي ومنظم الغاز الإيطالي المانومتر.',
    desc_en: 'Secure your home and kitchen with the complete safety bundle: smart gas detector, automatic shutoff valve, and high-precision Italian regulator.',
    type: 'percentage',
    value: '15',
    applies_to: 'products',
    selected_products: ['12', '13'],
    image_path: 'public/catalog_images/prod_182_0.jpg',
    badge_text_ar: 'أمان متكامل',
    badge_text_en: 'Full Safety'
  },
  {
    name_ar: 'سخانات المياه الفورية الذكية - خصم 10%',
    name_en: 'Smart Instant Water Heaters - 10% OFF',
    desc_ar: 'تمتع بمياه ساخنة فورية غير محدودة مع سخانات ماسترجاز الذكية الموفرة للطاقة وشاشات اللمس الرقمية ومبادل النحاس النقي.',
    desc_en: 'Experience limitless instant hot water with Mastergas smart energy-saving digital gas water heaters with pure copper exchangers.',
    type: 'percentage',
    value: '10',
    applies_to: 'products',
    selected_products: ['10'],
    image_path: 'public/catalog_images/prod_177_0.jpg',
    badge_text_ar: 'توفير طاقة',
    badge_text_en: 'Eco Smart'
  },
  {
    name_ar: 'عروض شوايات الحدائق والمزارع - خصم 25%',
    name_en: 'Luxury Outdoor BBQ & Patio Grills - 25% OFF',
    desc_ar: 'تجربة شواء استثنائية في الهواء الطلق مع شوايات الغاز المصنوعة من الستانلس ستيل المقاوم للطقس وأسطوانات الفيبر جلاس الخفيفة المقاومة للانفجار.',
    desc_en: 'Exceptional open-air barbecue experience with commercial-grade stainless steel grills and explosion-proof composite cylinders.',
    type: 'percentage',
    value: '25',
    applies_to: 'products',
    selected_products: ['11', '14'],
    image_path: 'public/catalog_images/prod_179_0.jpg',
    badge_text_ar: 'خصم 25%',
    badge_text_en: '25% OFF'
  }
];

async function main() {
  console.log('=== Step 1: Admin Login ===');
  const loginRes = await fetch(`${API_BASE}/v1/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email: 'admin@tijara.com', password: 'password123' })
  });

  if (!loginRes.ok) throw new Error('Login failed: ' + loginRes.status);
  const { token } = await loginRes.json();
  const headers = { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' };
  console.log('Admin login successful!');

  console.log('\n=== Step 2: Clear Existing Offers in Dashboard ===');
  const existingRes = await fetch(`${API_BASE}/dashboard/offers?per_page=100`, { headers });
  const existingJson = await existingRes.json();
  const existingOffers = existingJson.data || [];
  console.log(`Found ${existingOffers.length} existing offers to delete.`);

  for (const off of existingOffers) {
    const delRes = await fetch(`${API_BASE}/dashboard/offers/${off.id}`, {
      method: 'DELETE',
      headers
    });
    console.log(` - Deleted offer ID ${off.id} (${off.name}): ${delRes.status}`);
  }

  console.log('\n=== Step 3: Create 4 New Offers and Link Products ===');
  const createdOffers = [];

  for (let i = 0; i < newOffers.length; i++) {
    const offer = newOffers[i];
    console.log(`\n[${i + 1}/4] Creating Offer: "${offer.name_ar}"`);
    console.log(`Discount: ${offer.value}% | Linked Products: ${offer.selected_products.join(', ')}`);

    const formData = new FormData();
    formData.append('name', JSON.stringify({ ar: offer.name_ar, en: offer.name_en }));
    formData.append('description', JSON.stringify({ ar: offer.desc_ar, en: offer.desc_en }));
    formData.append('type', offer.type);
    formData.append('value', offer.value);
    formData.append('is_active', '1');
    formData.append('start_date', '2026-09-01');
    formData.append('end_date', '2027-12-31');
    formData.append('applies_to', offer.applies_to);

    offer.selected_products.forEach((pId, pIdx) => {
      formData.append(`selected_products[${pIdx}]`, pId);
    });

    if (fs.existsSync(offer.image_path)) {
      const buf = fs.readFileSync(offer.image_path);
      const blob = new Blob([buf], { type: 'image/jpeg' });
      formData.append('image', blob, `offer_${i + 1}.jpg`);
    } else {
      console.warn('Image file not found:', offer.image_path);
    }

    const createRes = await fetch(`${API_BASE}/dashboard/offers`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
      },
      body: formData
    });

    const createJson = await createRes.json();
    if (createRes.ok && createJson.data) {
      const d = createJson.data;
      console.log(`=> SUCCESS! Offer Created with ID: ${d.id}`);
      console.log(`=> Image URL: ${d.image}`);
      console.log(`=> Linked Products: ${JSON.stringify(d.selected_products)}`);
      createdOffers.push(d);
    } else {
      console.error(`=> FAILED! Status: ${createRes.status}`, createJson);
    }
  }

  console.log('\n=== Step 4: Verify via Storefront API (GET /frontend/offers) ===');
  const frontRes = await fetch(`${API_BASE}/frontend/offers?is_active=1`, {
    headers: { 'Accept': 'application/json' }
  });
  const frontJson = await frontRes.json();
  const frontList = frontJson.data || [];
  console.log(`Storefront returned ${frontList.length} active offers.`);
  frontList.forEach(o => {
    console.log(` - Offer #${o.id}: "${o.name_i18n?.ar || o.name}" | Products: ${JSON.stringify(o.selected_products)} | Image: ${o.image}`);
  });

  fs.writeFileSync('scripts/new_offers_result.json', JSON.stringify(createdOffers, null, 2));
  console.log('\nSaved results to scripts/new_offers_result.json');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
