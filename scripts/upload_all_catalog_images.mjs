import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const catalogDir = '/Users/omarragab/.gemini/antigravity-ide/brain/d0368e90-5821-4b09-8796-e6ac58bddb3e/catalog_images';

async function main() {
  console.log('--- Logging in to Backend ---');
  const loginRes = await fetch('https://backend-mastergas.be-kite.com/api/v1/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email: 'admin@tijara.com', password: 'password123' })
  });
  
  if (!loginRes.ok) {
    throw new Error('Login failed with status ' + loginRes.status);
  }
  const { token } = await loginRes.json();
  console.log('Login successful! Obtained token.');
  const headers = { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' };

  // 1. Upload Category Images (IDs 51 to 60)
  console.log('\n=========================================');
  console.log('Updating Category Images (IDs 51 - 60)...');
  console.log('=========================================');
  const categoryResults = [];

  for (let catId = 51; catId <= 60; catId++) {
    const imgPath = path.join(catalogDir, `cat_${catId}.jpg`);
    if (!existsSync(imgPath)) {
      console.warn(`Image file missing: ${imgPath}`);
      continue;
    }

    try {
      const getRes = await fetch(`https://backend-mastergas.be-kite.com/api/dashboard/categories/${catId}`, { headers });
      if (!getRes.ok) {
        console.error(`Failed to get category ${catId}: ${getRes.status}`);
        continue;
      }
      const catData = (await getRes.json()).data;
      const imgBuffer = readFileSync(imgPath);
      const blob = new Blob([imgBuffer], { type: 'image/jpeg' });

      const fd = new FormData();
      fd.append('_method', 'PUT');
      fd.append('name', JSON.stringify({
        ar: catData.name_i18n?.ar || catData.name,
        en: catData.name_i18n?.en || catData.name
      }));
      fd.append('description', JSON.stringify({
        ar: catData.description_i18n?.ar || catData.description || '',
        en: catData.description_i18n?.en || ''
      }));
      fd.append('is_active', '1');
      fd.append('sort_order', String(catData.sort_order || (catId - 50)));
      fd.append('image', blob, `cat_${catId}.jpg`);

      const updateRes = await fetch(`https://backend-mastergas.be-kite.com/api/dashboard/categories/${catId}`, {
        method: 'POST',
        headers,
        body: fd
      });

      const resJson = await updateRes.json();
      if (updateRes.ok) {
        console.log(`[Category ${catId}] ✅ Updated successfully -> ${resJson.data?.image}`);
        categoryResults.push({ id: catId, name: catData.name, image: resJson.data?.image });
      } else {
        console.error(`[Category ${catId}] ❌ Failed:`, resJson);
      }
    } catch (err) {
      console.error(`[Category ${catId}] Error:`, err.message);
    }
  }

  // 2. Upload Product Images (IDs 143 to 172)
  console.log('\n=========================================');
  console.log('Updating Product Images (IDs 143 - 172)...');
  console.log('=========================================');
  const productResults = [];

  for (let prodId = 143; prodId <= 172; prodId++) {
    const imgPath = path.join(catalogDir, `prod_${prodId}.jpg`);
    if (!existsSync(imgPath)) {
      console.warn(`Product image missing: ${imgPath}`);
      continue;
    }

    try {
      const getRes = await fetch(`https://backend-mastergas.be-kite.com/api/dashboard/products/${prodId}`, { headers });
      if (!getRes.ok) {
        console.error(`Failed to get product ${prodId}: ${getRes.status}`);
        continue;
      }
      const pData = (await getRes.json()).data;
      const imgBuffer = readFileSync(imgPath);
      const blob = new Blob([imgBuffer], { type: 'image/jpeg' });

      const fd = new FormData();
      fd.append('_method', 'PUT');
      fd.append('name', JSON.stringify({
        ar: pData.name_i18n?.ar || pData.name,
        en: pData.name_i18n?.en || pData.name
      }));
      fd.append('price', String(pData.price || '50.0'));
      fd.append('quantity', String(pData.quantity || pData.stock || '50'));
      fd.append('is_active', '1');
      fd.append('category_id', String(pData.category_id || 51));
      fd.append('discount', String(pData.discount || '0'));
      fd.append('description', JSON.stringify({
        ar: pData.description_i18n?.ar || pData.description || '',
        en: pData.description_i18n?.en || ''
      }));
      fd.append('features', JSON.stringify({
        ar: pData.features_i18n?.ar || '',
        en: pData.features_i18n?.en || ''
      }));
      fd.append('tips', JSON.stringify({
        ar: pData.tips_i18n?.ar || '',
        en: pData.tips_i18n?.en || ''
      }));
      fd.append('shipping_info', JSON.stringify({
        ar: 'توصيل سريع لكافة أنحاء المملكة وضمان شامل',
        en: 'Fast express delivery with official warranty'
      }));
      fd.append('attributes', JSON.stringify(pData.attributes || {}));
      fd.append('images[]', blob, `prod_${prodId}.jpg`);

      const updateRes = await fetch(`https://backend-mastergas.be-kite.com/api/dashboard/products/${prodId}`, {
        method: 'POST',
        headers,
        body: fd
      });

      const resJson = await updateRes.json();
      if (updateRes.ok) {
        console.log(`[Product ${prodId}] ✅ Updated successfully -> ${JSON.stringify(resJson.data?.images)}`);
        productResults.push({ id: prodId, name: pData.name, images: resJson.data?.images });
      } else {
        console.error(`[Product ${prodId}] ❌ Failed:`, resJson);
      }
    } catch (err) {
      console.error(`[Product ${prodId}] Error:`, err.message);
    }
  }

  console.log('\n=========================================');
  console.log('UPLOAD COMPLETE SUMMARY:');
  console.log(`Categories Updated: ${categoryResults.length} / 10`);
  console.log(`Products Updated: ${productResults.length} / 30`);
  console.log('=========================================');

  const { writeFileSync } = await import('node:fs');
  writeFileSync('/Users/omarragab/.gemini/antigravity-ide/brain/d0368e90-5821-4b09-8796-e6ac58bddb3e/scratch/updated_catalog_images.json', JSON.stringify({
    categories: categoryResults,
    products: productResults
  }, null, 2));
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
