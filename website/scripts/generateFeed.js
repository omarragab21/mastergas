import fs from 'fs';
import path from 'path';
import https from 'https';
const API_BASE = process.env.VITE_API_BASE_URL || 'https://backend-tijara.be-kite.com/api';
const API_URL = `${API_BASE}/v1/site/products/all_products?per_page=500`;
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const headers = { Accept: 'application/json', 'Accept-Language': 'ar' };
    if (process.env.VITE_SITE_TOKEN) headers.Authorization = `Bearer ${process.env.VITE_SITE_TOKEN}`;
    const req = https.get(url, { headers, timeout: 4000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('timeout', () => {
      req.destroy(new Error('Request timed out'));
    });
    req.on('error', reject);
  });
}

function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/"/g, '""');
  str = str.replace(/<[^>]*>?/gm, '');
  str = str.replace(/[\r\n]+/g, ' ');
  return `"${str.trim()}"`;
}

async function main() {
  console.log('Fetching live products from Tijara Site API (/v1/site/products/all_products)...');
  let products = [];
  try {
    const resData = await fetchJSON(API_URL);
    const rawList = resData?.data?.data || resData?.data || resData || [];
    products = Array.isArray(rawList) ? rawList : [];
    console.log(`Fetched ${products.length} live products successfully.`);
  } catch (err) {
    console.warn('Could not fetch from Tijara Site API:', err.message);
  }

  // Ensure public and public/feeds directory exist
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
  const FEEDS_DIR = path.join(PUBLIC_DIR, 'feeds');
  if (!fs.existsSync(FEEDS_DIR)) {
    fs.mkdirSync(FEEDS_DIR, { recursive: true });
  }

  const storeUrl = 'https://mastergas.sa';
  const currency = 'SAR';

  const csvHeaders = [
    'id',
    'title',
    'description',
    'availability',
    'condition',
    'price',
    'link',
    'image_link',
    'brand',
    'google_product_category'
  ];

  const csvRows = products.map(product => {
    const id = product.id;
    const title = product.translations?.ar?.name || product.translations?.en?.name || product.name || `Product #${id}`;
    const description = product.translations?.ar?.product_description || product.translations?.en?.product_description || product.product_description || title;
    
    const isAvailable = product.is_active !== false && product.is_active !== 0;
    const availability = isAvailable ? 'in stock' : 'out of stock';
    
    const numPrice = parseFloat(product.price || 0).toFixed(2);
    const priceFormatted = `${numPrice} ${currency}`;
    
    const link = `${storeUrl}/product/${id}`;
    let imageLink = product.images?.find(image => image.is_primary)?.image_url || product.images?.[0]?.image_url || '';
    if (imageLink && !imageLink.startsWith('http')) {
      imageLink = `${storeUrl}${imageLink.startsWith('/') ? '' : '/'}${imageLink}`;
    }

    const brand = product.brand_name || product.brand?.name || 'Mastergas';
    const category = product.category_name || product.category?.name || 'Shopping';

    return [
      escapeCSV(id),
      escapeCSV(title),
      escapeCSV(description),
      escapeCSV(availability),
      escapeCSV('new'),
      escapeCSV(priceFormatted),
      escapeCSV(link),
      escapeCSV(imageLink),
      escapeCSV(brand),
      escapeCSV(category)
    ].join(',');
  });

  const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

  // Save files inside the project
  const rootCsvPath = path.join(PUBLIC_DIR, 'meta-products-catalog.csv');
  const feedsCsvPath = path.join(FEEDS_DIR, 'products.csv');

  fs.writeFileSync(rootCsvPath, csvContent, 'utf8');
  fs.writeFileSync(feedsCsvPath, csvContent, 'utf8');

  console.log(`✓ Saved static CSV feed file to project root public folder: ${rootCsvPath}`);
  console.log(`✓ Saved static CSV feed file to feeds folder: ${feedsCsvPath}`);
}

main();
