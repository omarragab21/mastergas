/*
 * Live smoke test for the returns/settings contract from the Tijara Postman collection.
 * Run with no credentials for public settings + auth-guard checks:
 *   node scripts/test-returns-settings-api.mjs
 * Run authenticated checks when a real token is available:
 *   TIJARA_TOKEN='...' node scripts/test-returns-settings-api.mjs
 */

const baseUrl = process.env.TIJARA_BASE_URL || 'https://backend-tijara.be-kite.com/api';
const token = process.env.TIJARA_TOKEN || '';

const request = async (path, options = {}) => {
  const headers = {
    Accept: 'application/json',
    'Accept-Language': 'ar',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: response.status, body };
};

const result = [];
const check = async (name, path, expectedStatuses) => {
  try {
    const response = await request(path);
    const pass = expectedStatuses.includes(response.status);
    result.push({ name, pass, status: response.status, detail: response.body?.message || '' });
  } catch (error) {
    result.push({ name, pass: false, status: 'ERR', detail: error.message });
  }
};

await check('Public site settings', '/v1/site/settings', [200]);
await check(token ? 'Admin returns list (authenticated)' : 'Admin returns auth guard', '/v1/returns', token ? [200] : [401, 403, 500]);
await check(token ? 'Admin settings list (authenticated)' : 'Admin settings auth guard', '/v1/settings', token ? [200] : [401, 403, 500]);
await check(token ? 'Customer returns list (authenticated)' : 'Customer returns auth guard', '/v1/site/returns', token ? [200] : [401, 403, 500]);

for (const item of result) {
  console.log(`${item.pass ? 'PASS' : 'FAIL'} | ${item.status} | ${item.name}${item.detail ? ` | ${item.detail}` : ''}`);
}

if (result.some((item) => !item.pass)) process.exitCode = 1;
