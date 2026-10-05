import fs from 'node:fs/promises';
import path from 'node:path';

const API_BASE = process.env.MASTERGAS_API_BASE_URL || 'https://backend-mastergas.be-kite.com/api';
const projectRoot = process.cwd();
const publicAssetRoot = path.join(projectRoot, 'public', 'local-assets');

const endpointDefinitions = {
  products: '/frontend/products?per_page=100&page=1',
  categories: '/frontend/categories?is_active=1',
  brands: '/frontend/brands?is_active=1',
  offers: '/frontend/offers?is_active=1',
  settings: '/frontend/settings',
  sliders: '/frontend/sliders?is_active=1',
  topics: '/frontend/topics?status=published',
  coupons: '/frontend/coupons',
  filters: '/frontend/filters',
  countries: '/frontend/countries',
  cities: '/frontend/cities',
  shippingRates: '/frontend/city-shipping-rates',
};

const extractList = (body) => {
  const root = body?.data ?? body;
  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.data)) return root.data;
  if (Array.isArray(root?.items)) return root.items;
  return [];
};

const fetchJson = async (endpoint) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { Accept: 'application/json' },
  });
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON from ${endpoint}, received HTTP ${response.status}`);
  }
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${endpoint}`);
  return body;
};

const extensionFor = (url, contentType = '') => {
  const fromUrl = String(url).split('?')[0].match(/\.([a-z0-9]+)$/i)?.[1];
  if (fromUrl) return fromUrl.toLowerCase() === 'jpeg' ? 'jpg' : fromUrl.toLowerCase();
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  return 'jpg';
};

const downloadedAssets = new Map();
const downloadAsset = async (url, folder, name) => {
  if (!url || !/^https?:\/\//i.test(String(url))) return url;
  if (downloadedAssets.has(url)) return downloadedAssets.get(url);

  try {
    const candidates = [url];
    if (String(url).includes('/storage/')) candidates.push(String(url).replace('/storage/', '/public/storage/'));
    let response;
    for (const candidate of candidates) {
      const candidateResponse = await fetch(candidate);
      if (candidateResponse.ok) {
        response = candidateResponse;
        break;
      }
    }
    if (!response) throw new Error('all asset URLs returned an error');
    const extension = extensionFor(url, response.headers.get('content-type') || '');
    const relativePath = `/local-assets/${folder}/${name}.${extension}`;
    const absolutePath = path.join(publicAssetRoot, folder, `${name}.${extension}`);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, Buffer.from(await response.arrayBuffer()));
    downloadedAssets.set(url, relativePath);
    return relativePath;
  } catch (error) {
    console.warn(`Could not download asset ${url}: ${error.message}`);
    return url;
  }
};

const localizeAssets = async (data) => {
  const products = data.products?.data || data.products || [];
  for (const product of products) {
    if (product.image) product.image = await downloadAsset(product.image, 'products', `${product.id}-cover`);
    if (Array.isArray(product.images)) {
      product.images = await Promise.all(product.images.map((image, index) => downloadAsset(image, 'products', `${product.id}-${index + 1}`)));
    }
  }
  for (const offer of data.offers?.data || data.offers || []) {
    if (offer.image) offer.image = await downloadAsset(offer.image, 'offers', String(offer.id));
  }
  for (const category of data.categories?.data || data.categories || []) {
    if (category.image) category.image = await downloadAsset(category.image, 'categories', String(category.id));
  }
  for (const slider of data.sliders?.data || data.sliders || []) {
    if (slider.image) slider.image = await downloadAsset(slider.image, 'sliders', String(slider.id));
  }
  for (const setting of data.settings || []) {
    if (/^(logo|footer_logo|favicon)$/i.test(setting.key) && setting.value) {
      setting.value = await downloadAsset(setting.value, 'settings', setting.key);
    }
  }

  // The API currently returns slider 31 as a tiny 69x100 placeholder. Reuse
  // the downloaded high-resolution offer banner for that same campaign.
  const highQualityOffer = (data.offers || []).find((offer) => offer.image)?.image;
  const lowQualitySlider = (data.sliders || []).find((slider) => String(slider.id) === '31');
  if (highQualityOffer && lowQualitySlider) lowQualitySlider.image = highQualityOffer;
};

const snapshot = {
  generated_at: new Date().toISOString(),
  source: API_BASE,
  products: [],
  categories: [],
  brands: [],
  offers: [],
  settings: [],
  sliders: [],
  topics: [],
  coupons: [],
  filters: {},
  countries: [],
  cities: [],
  shippingRates: [],
  pages: [],
  reviews: [],
  customers: [
    {
      id: 1,
      name: 'Local Customer',
      email: 'demo@mastergas.local',
      password: 'demo123',
      phone: '0790000000',
      country: 'JO',
    },
  ],
  admins: [
    {
      id: 1,
      name: 'Local Admin',
      email: 'admin@mastergas.local',
      password: 'admin123',
      role: 'super-admin',
      permissions: ['*'],
    },
  ],
};

for (const [name, endpoint] of Object.entries(endpointDefinitions)) {
  try {
    const body = await fetchJson(endpoint);
    snapshot[name] = name === 'settings' || name === 'filters' ? (body?.data ?? body) : extractList(body);
    console.log(`✓ ${name}: ${Array.isArray(snapshot[name]) ? snapshot[name].length : 'object'}`);
  } catch (error) {
    console.warn(`⚠ ${name}: ${error.message}; keeping an empty local collection`);
  }
}

await localizeAssets(snapshot);

const dataPath = path.join(projectRoot, 'src', 'data', 'localData.json');
await fs.writeFile(dataPath, `${JSON.stringify(snapshot, null, 2)}\n`);

const productsPath = path.join(projectRoot, 'products.json');
await fs.writeFile(productsPath, `${JSON.stringify({ status: 'success', total: snapshot.products.length, data: snapshot.products }, null, 2)}\n`);

console.log(`\nSaved ${dataPath}`);
console.log(`Saved ${productsPath}`);
