const EMAIL = process.env.MASTERGAS_ADMIN_EMAIL;
const PASSWORD = process.env.MASTERGAS_ADMIN_PASSWORD;
if (!EMAIL || !PASSWORD) {
  throw new Error('Set MASTERGAS_ADMIN_EMAIL and MASTERGAS_ADMIN_PASSWORD before running this script.');
}

async function run() {
  const loginRes = await fetch('https://backend-mastergas.be-kite.com/api/v1/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  const { token } = await loginRes.json();
  const headers = { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' };

  const cRes = await fetch('https://backend-mastergas.be-kite.com/api/dashboard/categories', { headers });
  const cats = (await cRes.json()).data || [];

  const pRes = await fetch('https://backend-mastergas.be-kite.com/api/dashboard/products?per_page=50', { headers });
  const prods = (await pRes.json()).data || [];

  console.log('--- 10 CATEGORIES ---');
  cats.forEach(c => {
    console.log(`- ID ${c.id}: ${c.name} | Image: ${c.image}`);
  });

  console.log('\n--- 30 PRODUCTS ---');
  prods.forEach(p => {
    const img = Array.isArray(p.images) ? p.images[0] : (p.image || 'N/A');
    console.log(`- ID ${p.id}: ${p.name} (Cat: ${p.category_id}) | Image: ${img}`);
  });
}
run();
