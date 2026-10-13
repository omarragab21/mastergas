#!/usr/bin/env node
// Live contract/QA suite for the Tijara Orders API (site + admin).
// WARNING: hits the real backend and creates orders. Never wire into `npm test`.
//
// Usage:
//   TIJARA_ADMIN_EMAIL=... TIJARA_ADMIN_PASSWORD=... node scripts/qa-orders-api.mjs [out.json]
// Optional: TIJARA_API_BASE (default https://backend-tijara.be-kite.com/api/v1)

import { writeFileSync } from 'node:fs'

const BASE = process.env.TIJARA_API_BASE || 'https://backend-tijara.be-kite.com/api/v1'
const EMAIL = process.env.TIJARA_ADMIN_EMAIL
const PASSWORD = process.env.TIJARA_ADMIN_PASSWORD
const OUT = process.argv[2] || 'reports/tijara-orders-api-qa.json'
const RUN = `QA-ORD-${Date.now().toString(36).toUpperCase()}`
const VALID_STATUSES = ['pending', 'paid_confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

if (!EMAIL || !PASSWORD) {
  console.error('Set TIJARA_ADMIN_EMAIL and TIJARA_ADMIN_PASSWORD')
  process.exit(2)
}

let token = ''
const results = []
const createdOrders = []
const createdCoupons = []

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100
const near = (a, b, eps = 0.011) => Math.abs(Number(a) - Number(b)) <= eps
const brief = (v, max = 260) => {
  const s = typeof v === 'string' ? v : JSON.stringify(v)
  return s && s.length > max ? `${s.slice(0, max)}…` : s
}

async function api(method, path, { body, auth = true, rawBody, lang = 'en', bearer } = {}) {
  const headers = { Accept: 'application/json', 'Accept-Language': lang }
  if (body !== undefined || rawBody !== undefined) headers['Content-Type'] = 'application/json'
  if (bearer !== undefined) headers.Authorization = `Bearer ${bearer}`
  else if (auth) headers.Authorization = `Bearer ${token}`
  const started = Date.now()
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: rawBody !== undefined ? rawBody : body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(45000),
    })
  } catch (error) {
    return { status: 0, json: null, text: String(error), ms: Date.now() - started }
  }
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch { /* non-JSON body */ }
  return { status: res.status, json, text, ms: Date.now() - started }
}

// verdict: GREEN (as expected), RED (defect), INFO (behaviour to confirm with business/backend)
function record(id, group, title, expected, verdict, actual, res) {
  const row = { id, group, title, expected, verdict, actual, http: res?.status ?? null, ms: res?.ms ?? null }
  results.push(row)
  const mark = verdict === 'GREEN' ? '🟢' : verdict === 'RED' ? '🔴' : '🔵'
  console.log(`${mark} ${id} ${title} → ${actual}`)
  return row
}

const leaks = (res) => Boolean(res.json && (res.json.trace || res.json.exception || res.json.file))
const errText = (res) => brief(res.json?.errors || res.json?.message || res.text, 220)

/** Expect a specific HTTP status (or one of). */
function expectStatus(id, group, title, res, want, extra = '') {
  const wants = Array.isArray(want) ? want : [want]
  const ok = wants.includes(res.status)
  const leak = leaks(res) ? ' [LEAKS exception/trace]' : ''
  record(id, group, title, `HTTP ${wants.join('/')}${extra ? ` — ${extra}` : ''}`,
    ok && !leak ? 'GREEN' : 'RED', `HTTP ${res.status}${leak} ${errText(res)}`, res)
  return ok
}

const stockOf = async (productId) => (await api('GET', `/products/${productId}`)).json?.data?.number
const orderPayload = (items, extra = {}) => ({
  shipping_address: `${RUN} test address, Amman, Jordan`,
  billing_address: `${RUN} test address, Amman, Jordan`,
  payment_method: 'cash_on_delivery',
  notes: `${RUN} automated QA order — safe to delete`,
  shipping_cost: 25,
  items,
  ...extra,
})

async function createOrder(items, extra = {}) {
  const res = await api('POST', '/site/orders', { body: orderPayload(items, extra) })
  const order = res.json?.data
  if ([200, 201].includes(res.status) && order?.id) createdOrders.push(order.id)
  return { res, order }
}

const patchOrder = (id, body) => api('PATCH', `/orders/${id}`, { body })
const siteOrder = async (id) => (await api('GET', `/site/orders/${id}`)).json?.data

async function main() {
  // ───────────────────────── 0. Auth ─────────────────────────
  const form = new FormData()
  form.set('email', EMAIL)
  form.set('password', PASSWORD)
  const loginRes = await fetch(`${BASE}/admin/login`, { method: 'POST', headers: { Accept: 'application/json' }, body: form })
  const login = await loginRes.json().catch(() => ({}))
  token = login.token || ''
  record('A01', 'Auth', 'Admin login returns token', 'HTTP 200 + token', token ? 'GREEN' : 'RED', `HTTP ${loginRes.status}, role=${login.user?.role}`, { status: loginRes.status })
  if (!token) return

  for (const [id, method, path, body] of [
    ['A02', 'GET', '/site/orders'], ['A03', 'POST', '/site/orders', orderPayload([{ product_id: 16, quantity: 1 }])],
    ['A04', 'GET', '/orders'], ['A05', 'PATCH', '/orders/1', { status: 'shipped' }],
  ]) {
    expectStatus(id, 'Auth', `${method} ${path} without token`, await api(method, path, { body, auth: false }), 401, 'no stack trace')
  }
  expectStatus('A06', 'Auth', 'GET /site/orders with invalid token', await api('GET', '/site/orders', { bearer: 'invalid-token-xyz' }), 401, 'no stack trace')
  expectStatus('A07', 'Auth', 'PATCH /orders/1 with invalid token', await api('PATCH', '/orders/1', { body: { status: 'cancelled' }, bearer: '0|invalid' }), 401, 'no stack trace')

  // ───────────────────────── 1. Catalog baseline ─────────────────────────
  const products = (await api('GET', '/products')).json?.data || []
  const active = products.filter((p) => p.is_active && p.number > 5).sort((a, b) => a.final_price - b.final_price)
  if (active.length < 2) { record('B00', 'Setup', 'Need 2 active products in stock', '>=2', 'RED', `found ${active.length}`); return }
  const [P1, P2] = active
  const stockStart = Object.fromEntries(await Promise.all(active.map(async (p) => [p.id, await stockOf(p.id)])))
  console.log('Products in play:', P1.id, P1.final_price, 'stock', stockStart[P1.id], '|', P2.id, P2.final_price, 'stock', stockStart[P2.id])

  // ───────────────────────── 2. Create — happy path ─────────────────────────
  const c1 = await createOrder([{ product_id: P1.id, quantity: 1 }])
  expectStatus('C01', 'Create', 'Create order with 1 item', c1.res, 201)
  const o1 = c1.order
  if (!o1) { record('C01x', 'Create', 'Order body returned', 'data.id', 'RED', errText(c1.res), c1.res); return }

  record('C02', 'Create', 'New order defaults', 'status=pending, payment_status=unpaid, order_number set',
    o1.status === 'pending' && o1.payment_status === 'unpaid' && /^ORD-/.test(o1.order_number || '') ? 'GREEN' : 'RED',
    `status=${o1.status}, payment_status=${o1.payment_status}, order_number=${o1.order_number}`, c1.res)

  const sub1 = round2(P1.final_price)
  const taxRate = o1.subtotal ? round2(o1.tax_amount / o1.subtotal * 100) : null
  record('C03', 'Create', 'Subtotal uses server-side product final_price', `subtotal=${sub1}`,
    near(o1.subtotal, sub1) ? 'GREEN' : 'RED', `subtotal=${round2(o1.subtotal)}, unit_price=${round2(o1.items?.[0]?.unit_price)}`, c1.res)
  record('C04', 'Create', 'total = subtotal − discount + shipping + tax', 'arithmetic consistent',
    near(o1.total_amount, o1.subtotal - o1.discount + o1.shipping_cost + o1.tax_amount, 0.02) ? 'GREEN' : 'RED',
    `subtotal=${round2(o1.subtotal)} discount=${o1.discount} shipping=${o1.shipping_cost} tax=${round2(o1.tax_amount)} (≈${taxRate}%) total=${round2(o1.total_amount)}`, c1.res)
  const floatNoise = /\d\.\d{6,}/.test(c1.res.text.slice(0, 600))
  record('C05', 'Create', 'Money fields are rounded to 2 decimals', 'e.g. 876.85', floatNoise ? 'RED' : 'GREEN',
    floatNoise ? `raw float noise in JSON, e.g. ${c1.res.text.match(/"subtotal":[\d.]+/)?.[0]}` : 'clean', c1.res)

  const stockAfterCreate = await stockOf(P1.id)
  record('C06', 'Stock', 'Stock is reserved/decremented when order is created', `stock ${stockStart[P1.id]} → ${stockStart[P1.id] - 1}`,
    stockAfterCreate === stockStart[P1.id] - 1 ? 'GREEN' : 'INFO', `stock ${stockStart[P1.id]} → ${stockAfterCreate}`)

  const show1 = await api('GET', `/site/orders/${o1.id}`)
  record('C07', 'Read', 'GET /site/orders/{id} returns the order with items', 'HTTP 200, same id, items[]',
    show1.status === 200 && show1.json?.data?.id === o1.id && show1.json.data.items?.length === 1 ? 'GREEN' : 'RED',
    `HTTP ${show1.status}, items=${show1.json?.data?.items?.length}`, show1)
  const siteList = await api('GET', '/site/orders')
  record('C08', 'Read', 'Order appears in customer list', 'present in /site/orders',
    siteList.json?.data?.some((o) => o.id === o1.id) ? 'GREEN' : 'RED', `total=${siteList.json?.meta?.total}, per_page=${siteList.json?.meta?.per_page}`, siteList)
  const adminList = await api('GET', '/orders')
  const adminRow = adminList.json?.data?.find((o) => o.id === o1.id)
  record('C09', 'Read', 'Order appears in admin list', 'present in /orders',
    adminRow ? 'GREEN' : 'RED', `total=${adminList.json?.meta?.total}, per_page=${adminList.json?.meta?.per_page}`, adminList)
  record('C10', 'Read', 'Admin list row exposes customer info', 'user/customer object (name, phone, email)',
    adminRow && (adminRow.user || adminRow.customer) ? 'GREEN' : 'RED', `user keys: ${Object.keys(adminRow?.user || adminRow?.customer || {}).join(',') || 'none'} (no phone/address on user object)`, adminList)
  const adminShow = await api('GET', `/orders/${o1.id}`)
  record('C11', 'Read', 'Admin GET /orders/{id} (not in Postman collection)', 'HTTP 200 with order',
    adminShow.status === 200 && adminShow.json?.data?.id === o1.id ? 'GREEN' : 'RED', `HTTP ${adminShow.status} ${adminShow.status === 200 ? '' : errText(adminShow)}`, adminShow)

  const c2 = await createOrder([{ product_id: P1.id, quantity: 2 }, { product_id: P2.id, quantity: 1 }])
  const sub2 = round2(P1.final_price * 2 + P2.final_price)
  record('C12', 'Create', 'Multi-item order totals', `HTTP 201, subtotal=${sub2}, 2 items`,
    c2.res.status === 201 && near(c2.order?.subtotal, sub2, 0.02) && c2.order?.items?.length === 2 ? 'GREEN' : 'RED',
    `HTTP ${c2.res.status}, subtotal=${round2(c2.order?.subtotal)}, items=${c2.order?.items?.length}, total=${round2(c2.order?.total_amount)}`, c2.res)
  record('C13', 'Create', 'order_number unique per order', 'different numbers',
    c2.order && c2.order.order_number !== o1.order_number ? 'GREEN' : 'RED', `${o1.order_number} vs ${c2.order?.order_number}`)

  expectStatus('C14', 'Read', 'GET /site/orders/99999999 (missing)', await api('GET', '/site/orders/99999999'), 404)
  expectStatus('C15', 'Read', 'GET /site/orders/abc (non-numeric)', await api('GET', '/site/orders/abc'), 404)

  for (const [id, q, label] of [['C16', '?page=2', 'page=2'], ['C17', '?per_page=1', 'per_page=1'], ['C18', '?status=pending', 'status=pending'], ['C19', '?status=delivered', 'status=delivered']]) {
    const r = await api('GET', `/orders${q}`)
    const d = r.json?.data || []
    let verdict = 'INFO'
    if (label.startsWith('status=')) verdict = d.every((o) => o.status === label.split('=')[1]) ? 'GREEN' : 'RED'
    if (label === 'per_page=1') verdict = d.length === 1 ? 'GREEN' : 'INFO'
    record(id, 'Read', `Admin list ${label}`, label.startsWith('status=') ? 'only matching statuses returned' : 'honoured',
      r.status === 200 ? verdict : 'RED', `HTTP ${r.status}, rows=${d.length}, statuses=[${[...new Set(d.map((o) => o.status))].join(',')}], per_page=${r.json?.meta?.per_page}`, r)
  }

  // ───────────────────────── 3. Create — validation ─────────────────────────
  const bad = async (id, title, body, want = 422, extra) => {
    const res = await api('POST', '/site/orders', { body })
    if ([200, 201].includes(res.status) && res.json?.data?.id) createdOrders.push(res.json.data.id)
    expectStatus(id, 'Validation', title, res, want, extra)
    return res
  }
  const one = [{ product_id: P1.id, quantity: 1 }]
  await bad('V01', 'Empty body {}', {})
  await bad('V02', 'Missing items', orderPayload(undefined))
  await bad('V03', 'items = []', orderPayload([]))
  await bad('V04', 'items is a string', orderPayload('nope'))
  await bad('V05', 'Item without product_id', orderPayload([{ quantity: 1 }]))
  await bad('V06', 'Item without quantity', orderPayload([{ product_id: P1.id }]))
  await bad('V07', 'Non-existent product_id', orderPayload([{ product_id: 99999999, quantity: 1 }]))
  await bad('V08', 'quantity = 0', orderPayload([{ product_id: P1.id, quantity: 0 }]))
  await bad('V09', 'quantity = -3', orderPayload([{ product_id: P1.id, quantity: -3 }]))
  await bad('V10', 'quantity = 1.5', orderPayload([{ product_id: P1.id, quantity: 1.5 }]))
  await bad('V11', 'quantity = "abc"', orderPayload([{ product_id: P1.id, quantity: 'abc' }]))
  const overStock = (await stockOf(P2.id)) + 1
  await bad('V12', `quantity above stock (${overStock} of product ${P2.id})`, orderPayload([{ product_id: P2.id, quantity: overStock }]), 422, 'insufficient stock')
  record('V12b', 'Stock', 'Stock never goes below zero after over-stock attempt', '>= 0', (await stockOf(P2.id)) >= 0 ? 'GREEN' : 'RED', `stock of ${P2.id} = ${await stockOf(P2.id)}`)
  await bad('V13', 'Missing shipping_address', orderPayload(one, { shipping_address: undefined }))
  await bad('V14', 'Empty shipping_address ""', orderPayload(one, { shipping_address: '' }))
  await bad('V15', 'Missing payment_method', orderPayload(one, { payment_method: undefined }))
  await bad('V16', 'Unknown payment_method "bitcoin"', orderPayload(one, { payment_method: 'bitcoin' }))
  await bad('V17', 'Negative shipping_cost', orderPayload(one, { shipping_cost: -100 }))
  await bad('V18', 'shipping_cost as text', orderPayload(one, { shipping_cost: 'free' }))
  const v19 = await createOrder(one, { discount: -50 })
  record('V19', 'Tamper', 'Client-supplied negative "discount": -50', 'ignored (discount=0) or 422',
    v19.res.status === 422 || Number(v19.order?.discount) === 0 ? 'GREEN' : 'RED', `HTTP ${v19.res.status}, discount=${v19.order?.discount}, total=${round2(v19.order?.total_amount)}`, v19.res)
  await bad('V20', 'Unknown coupon_code', orderPayload(one, { coupon_code: 'NOPE-NOT-A-CODE' }))
  await bad('V21', 'Exhausted coupon SUMMER5250 (used_count = max_uses)', orderPayload([{ product_id: P1.id, quantity: 1 }], { coupon_code: 'SUMMER5250' }))
  expectStatus('V22', 'Validation', 'Malformed JSON body', await api('POST', '/site/orders', { rawBody: '{"items": [' }), [400, 422])
  await bad('V23', 'Notes longer than 10k chars', orderPayload(one, { notes: `${RUN} ${'x'.repeat(10050)}` }), 422, 'length limit')

  // Trust boundary: client-supplied money/status must be ignored or rejected.
  const t1 = await createOrder(one, { discount: 500 })
  record('T01', 'Tamper', 'Client-supplied "discount": 500 without coupon', 'ignored (discount=0) or 422',
    t1.res.status === 422 || (t1.order && Number(t1.order.discount) === 0) ? 'GREEN' : 'RED',
    `HTTP ${t1.res.status}, discount=${t1.order?.discount}, total=${round2(t1.order?.total_amount)} (honest total ${round2(o1.total_amount)})`, t1.res)
  const t2 = await createOrder(one, { discount: 999999 })
  record('T02', 'Tamper', 'Client "discount" larger than subtotal', '422 or ignored; total never <= 0',
    t2.res.status === 422 || (t2.order && Number(t2.order.discount) === 0) ? 'GREEN' : 'RED',
    `HTTP ${t2.res.status}, discount=${t2.order?.discount}, total=${round2(t2.order?.total_amount)}`, t2.res)
  const t3 = await createOrder([{ product_id: P1.id, quantity: 1, unit_price: 1, price: 1, total_price: 1 }],
    { total_amount: 1, subtotal: 1, tax_amount: 0, status: 'delivered', payment_status: 'paid', order_number: 'ORD-HACKED', user_id: 1 })
  record('T03', 'Tamper', 'Client sends unit_price/total/status/payment_status/order_number', 'all ignored; server values used',
    t3.order && near(t3.order.subtotal, sub1) && t3.order.status === 'pending' && t3.order.payment_status === 'unpaid' && t3.order.order_number !== 'ORD-HACKED' ? 'GREEN' : 'RED',
    `HTTP ${t3.res.status}, subtotal=${round2(t3.order?.subtotal)}, status=${t3.order?.status}, payment_status=${t3.order?.payment_status}, order_number=${t3.order?.order_number}`, t3.res)
  const t4 = await createOrder(one, { shipping_cost: 0 })
  record('T04', 'Tamper', 'Client decides shipping_cost (sends 0)', 'server should compute shipping from city/rates',
    t4.order && Number(t4.order.shipping_cost) === 0 ? 'INFO' : 'GREEN', `HTTP ${t4.res.status}, shipping_cost=${t4.order?.shipping_cost} — client value is trusted as-is`, t4.res)
  const t5 = await createOrder([{ product_id: P1.id, quantity: 1 }, { product_id: P1.id, quantity: 1 }])
  record('T05', 'Create', 'Same product on two lines', 'merged into qty 2 or 422',
    t5.res.status === 422 || (t5.order?.items?.length === 1 && t5.order.items[0].quantity === 2) ? 'GREEN' : 'INFO',
    `HTTP ${t5.res.status}, lines=${t5.order?.items?.length}, qtys=${t5.order?.items?.map((i) => i.quantity).join('+')}`, t5.res)
  const xss = '<script>alert(1)</script><img src=x onerror=alert(2)>'
  const t6 = await createOrder(one, { notes: `${RUN} ${xss}`, shipping_address: `${RUN} ${xss}` })
  record('T06', 'Tamper', 'HTML/script in notes & address', 'stored escaped/stripped, or UI must escape on render',
    t6.order?.notes?.includes('<script>') ? 'INFO' : 'GREEN', `HTTP ${t6.res.status}, stored raw=${Boolean(t6.order?.notes?.includes('<script>'))} — admin UI must never use v-html for these`, t6.res)
  const t7 = await api('POST', '/site/orders', { body: orderPayload(one), lang: 'ar' })
  if (t7.json?.data?.id) createdOrders.push(t7.json.data.id)
  record('T07', 'Create', 'Accept-Language: ar returns Arabic product name', 'localized item.product.name',
    /[؀-ۿ]/.test(t7.json?.data?.items?.[0]?.product?.name || '') ? 'GREEN' : 'INFO', `name=${brief(t7.json?.data?.items?.[0]?.product?.name, 60)}`, t7)

  // ───────────────────────── 4. Coupons ─────────────────────────
  const mkCoupon = async (suffix, over = {}) => {
    const code = `${RUN}-${suffix}`.replace(/[^A-Z0-9-]/g, '')
    const res = await api('POST', '/discount_codes', { body: {
      code, type: 'percentage', value: 10, minimum_amount: 1000, max_discount: 50, max_uses: 5,
      start_date: '2026-10-01 00:00:00', end_date: '2026-12-31 23:59:59', is_active: true, is_public: false,
      name_en: `${RUN} QA coupon`, description_en: 'Automated QA — safe to delete', name_ar: `${RUN} كوبون اختبار`, description_ar: 'اختبار آلي', ...over,
    } })
    if (res.json?.data?.id) createdCoupons.push(res.json.data.id)
    return { code, id: res.json?.data?.id, res }
  }
  const usedCount = async (id) => (await api('GET', `/discount_codes/${id}`)).json?.data?.used_count

  const cpA = await mkCoupon('PCT')
  if (!cpA.id) {
    record('K00', 'Coupon', 'Create QA percentage coupon', 'HTTP 201', 'RED', `HTTP ${cpA.res.status} ${errText(cpA.res)}`, cpA.res)
  } else {
    await bad('K01', `Coupon below minimum_amount (subtotal ${sub1} < 1000)`, orderPayload(one, { coupon_code: cpA.code }), 422, 'minimum not reached')
    const two = [{ product_id: P1.id, quantity: 2 }]
    const k2 = await createOrder(two, { coupon_code: cpA.code })
    const subK = round2(P1.final_price * 2)
    record('K02', 'Coupon', '10% coupon capped by max_discount=50', `HTTP 201, discount=50 (10% of ${subK} = ${round2(subK * 0.1)} → cap 50)`,
      k2.res.status === 201 && near(k2.order?.discount, 50) ? 'GREEN' : 'RED',
      `HTTP ${k2.res.status}, discount=${k2.order?.discount}, coupon_code=${k2.order?.coupon_code}, tax=${round2(k2.order?.tax_amount)}, total=${round2(k2.order?.total_amount)} ${k2.order ? '' : errText(k2.res)}`, k2.res)
    if (k2.order) {
      const o = k2.order
      record('K03', 'Coupon', 'Total arithmetic with coupon', 'total = subtotal − discount + shipping + tax',
        near(o.total_amount, o.subtotal - o.discount + o.shipping_cost + o.tax_amount, 0.02) ? 'GREEN' : 'RED',
        `tax base: ${near(o.tax_amount, (o.subtotal - o.discount) * 0.14, 0.02) ? 'subtotal−discount' : near(o.tax_amount, o.subtotal * 0.14, 0.02) ? 'subtotal (before discount)' : 'other'} ; tax=${round2(o.tax_amount)} total=${round2(o.total_amount)}`, k2.res)
      record('K04', 'Coupon', 'used_count increments after use', 'used_count = 1', (await usedCount(cpA.id)) === 1 ? 'GREEN' : 'RED', `used_count=${await usedCount(cpA.id)}`)
      const k5 = await createOrder(two, { coupon_code: cpA.code })
      record('K05', 'Coupon', 'Same user re-uses coupon (collection says one use per user)', 'HTTP 422',
        k5.res.status === 422 ? 'GREEN' : 'RED', `HTTP ${k5.res.status}, discount=${k5.order?.discount} ${errText(k5.res)}`, k5.res)
      const k6 = await createOrder(two, { coupon_code: cpA.code.toLowerCase() })
      record('K06', 'Coupon', 'Re-use with the code typed in lowercase (bypass attempt)', 'HTTP 422',
        k6.res.status === 422 ? 'GREEN' : 'RED', `HTTP ${k6.res.status}, discount=${k6.order?.discount} ${errText(k6.res)}`, k6.res)
      const cancel = await patchOrder(o.id, { status: 'cancelled' })
      const afterCancel = await usedCount(cpA.id)
      const k7 = await createOrder(two, { coupon_code: cpA.code })
      record('K07', 'Coupon', 'After cancelling the coupon order, same user uses the coupon again', 'business decision: allowed → used_count must drop on cancel',
        'INFO', `cancel HTTP ${cancel.status}; used_count after cancel=${afterCancel}; re-use HTTP ${k7.res.status}, discount=${k7.order?.discount}; used_count now ${await usedCount(cpA.id)}`, k7.res)
    }
  }

  let cpB = await mkCoupon('FIX', { type: 'fixed', value: 30, minimum_amount: 0, max_discount: null, max_uses: 1 })
  if (!cpB.id) {
    record('K09', 'Coupon', 'Create fixed-amount coupon (type "fixed")', 'HTTP 201', 'INFO', `HTTP ${cpB.res.status} ${errText(cpB.res)}`, cpB.res)
    cpB = await mkCoupon('ONE', { minimum_amount: 0, max_uses: 1 })
  }
  if (cpB.id) {
    const race = await Promise.all([createOrder(one, { coupon_code: cpB.code }), createOrder(one, { coupon_code: cpB.code })])
    const wins = race.filter((r) => r.res.status === 201 && Number(r.order?.discount) > 0).length
    record('K10', 'Coupon', 'Race: 2 parallel orders with a max_uses=1 coupon', 'exactly 1 gets the discount',
      wins === 1 ? 'GREEN' : 'RED', `statuses=${race.map((r) => r.res.status).join(',')}, discounted=${wins}, discounts=${race.map((r) => r.order?.discount).join(',')}, used_count=${await usedCount(cpB.id)}`, race[0].res)
    await bad('K11', 'Coupon after max_uses reached', orderPayload(one, { coupon_code: cpB.code }), 422, 'usage limit')
  }
  const cpC = await mkCoupon('EXP', { minimum_amount: 0, start_date: '2026-01-01 00:00:00', end_date: '2026-02-01 00:00:00' })
  if (cpC.id) await bad('K12', 'Expired coupon', orderPayload(one, { coupon_code: cpC.code }), 422, 'expired')
  else record('K12', 'Coupon', 'Create expired coupon for test', 'HTTP 201', 'INFO', `HTTP ${cpC.res.status} ${errText(cpC.res)}`, cpC.res)
  const cpD = await mkCoupon('OFF', { minimum_amount: 0, is_active: false })
  if (cpD.id) await bad('K13', 'Inactive coupon', orderPayload(one, { coupon_code: cpD.code }), 422, 'inactive')
  const cpE = await mkCoupon('FUT', { minimum_amount: 0, start_date: '2027-01-01 00:00:00', end_date: '2027-02-01 00:00:00' })
  if (cpE.id) await bad('K14', 'Coupon not started yet', orderPayload(one, { coupon_code: cpE.code }), 422, 'not started')

  // ───────────────────────── 5. Status lifecycle (admin) ─────────────────────────
  const step = async (id, title, orderId, status, wantOk, verdictIfAccepted = 'RED') => {
    const res = await patchOrder(orderId, { status })
    const now = res.json?.data?.status
    const accepted = res.status === 200 && now === status
    let verdict
    if (wantOk) verdict = accepted && !leaks(res) ? 'GREEN' : 'RED'
    else verdict = !accepted && [409, 422].includes(res.status) && !leaks(res) ? 'GREEN' : accepted ? verdictIfAccepted : 'RED'
    record(id, 'Status', title, wantOk ? `HTTP 200, status=${status}` : 'rejected with HTTP 422/409', verdict,
      `HTTP ${res.status}, status=${now ?? (await siteOrder(orderId))?.status} ${res.status === 200 ? '' : errText(res)}`, res)
    return res
  }

  // 5a. Full happy flow on o1
  const s1 = await step('S01', 'pending → paid_confirmed', o1.id, 'paid_confirmed', true)
  const d1 = s1.json?.data || {}
  record('S02', 'Status', 'paid_confirmed marks payment', 'payment_status=paid and payment_time set',
    d1.payment_status === 'paid' && d1.payment_time ? 'GREEN' : 'RED', `payment_status=${d1.payment_status}, payment_time=${d1.payment_time}`, s1)
  await step('S03', 'paid_confirmed → processing', o1.id, 'processing', true)
  const s4 = await step('S04', 'processing → shipped', o1.id, 'shipped', true)
  record('S05', 'Status', 'shipped sets shipped_at', 'shipped_at timestamp', s4.json?.data?.shipped_at ? 'GREEN' : 'RED', `shipped_at=${s4.json?.data?.shipped_at}`, s4)
  const s6 = await step('S06', 'shipped → delivered', o1.id, 'delivered', true)
  const d6 = s6.json?.data || {}
  record('S07', 'Status', 'delivered sets delivered_at', 'delivered_at timestamp', d6.delivered_at ? 'GREEN' : 'RED', `delivered_at=${d6.delivered_at}, payment_status=${d6.payment_status}`, s6)
  const cust = await siteOrder(o1.id)
  record('S08', 'Status', 'Customer endpoint reflects admin status change', 'site/orders/{id}.status = delivered',
    cust?.status === 'delivered' ? 'GREEN' : 'RED', `status=${cust?.status}`)
  const stockDelivered = await stockOf(P1.id)
  record('S09', 'Stock', 'Product stock decreases somewhere between create and delivered', `below ${stockStart[P1.id]} (start of run)`,
    stockDelivered < stockStart[P1.id] ? 'GREEN' : 'RED', `product ${P1.id} stock ${stockStart[P1.id]} → ${stockDelivered} after ${createdOrders.length} orders, one of them delivered`)

  // 5b. Terminal state must be immutable
  await step('S10', 'delivered → processing (backward)', o1.id, 'processing', false)
  await step('S11', 'delivered → cancelled', o1.id, 'cancelled', false)
  await step('S12', 'delivered → pending (reset)', o1.id, 'pending', false)
  const afterBack = await siteOrder(o1.id)
  record('S13', 'Status', 'Timestamps after backward moves', 'delivered_at/shipped_at consistent with status',
    afterBack?.status === 'delivered' || (!afterBack?.delivered_at) ? 'GREEN' : 'RED',
    `status=${afterBack?.status}, shipped_at=${afterBack?.shipped_at}, delivered_at=${afterBack?.delivered_at}, payment_status=${afterBack?.payment_status}`)

  // 5c. Cancel flow + stock restore on c2 (P1 x2 + P2 x1)
  if (c2.order) {
    const before = { a: await stockOf(P1.id), b: await stockOf(P2.id) }
    await step('S14', 'pending → cancelled', c2.order.id, 'cancelled', true)
    const after = { a: await stockOf(P1.id), b: await stockOf(P2.id) }
    const reserved = stockAfterCreate < stockStart[P1.id]
    record('S15', 'Stock', 'Cancel restores reserved stock', reserved ? `P${P1.id} +2, P${P2.id} +1` : 'n/a — stock is never reserved (see C06/S09)',
      !reserved ? 'INFO' : after.a === before.a + 2 && after.b === before.b + 1 ? 'GREEN' : 'RED', `P${P1.id}: ${before.a} → ${after.a}, P${P2.id}: ${before.b} → ${after.b}`)
    await step('S16', 'cancelled → cancelled (repeat)', c2.order.id, 'cancelled', false, 'INFO')
    const again = { a: await stockOf(P1.id), b: await stockOf(P2.id) }
    record('S17', 'Stock', 'Repeated cancel does not restore stock twice', 'unchanged',
      again.a === after.a && again.b === after.b ? 'GREEN' : 'RED', `P${P1.id}: ${after.a} → ${again.a}, P${P2.id}: ${after.b} → ${again.b}`)
    await step('S18', 'cancelled → processing (revive)', c2.order.id, 'processing', false)
    await step('S19', 'cancelled → delivered', c2.order.id, 'delivered', false)
    const revived = { a: await stockOf(P1.id), b: await stockOf(P2.id) }
    record('S20', 'Stock', 'Stock after reviving a cancelled order', 'no drift (revive should be rejected)',
      'INFO', `order status=${(await siteOrder(c2.order.id))?.status}; P${P1.id}: ${again.a} → ${revived.a}, P${P2.id}: ${again.b} → ${revived.b}`)
  }

  // 5d. Skipping steps
  if (t1.order) {
    const r = await step('S21', 'pending → delivered (skips payment/shipping)', t1.order.id, 'delivered', false, 'INFO')
    const d = r.json?.data || {}
    record('S22', 'Status', 'Side-effects when jumping straight to delivered', 'shipped_at, delivered_at, payment set consistently',
      'INFO', `status=${d.status}, payment_status=${d.payment_status}, payment_time=${d.payment_time}, shipped_at=${d.shipped_at}, delivered_at=${d.delivered_at}`, r)
  }
  if (t2.order) {
    await step('S23', 'pending → shipped (skips payment)', t2.order.id, 'shipped', false, 'INFO')
    const before = await stockOf(P1.id)
    await step('S24', 'shipped → cancelled', t2.order.id, 'cancelled', false, 'INFO')
    record('S25', 'Stock', 'Stock after cancelling a shipped order', 'documented', 'INFO', `P${P1.id}: ${before} → ${await stockOf(P1.id)}`)
  }
  if (t3.order) {
    await step('S26', 'pending → processing (unpaid order)', t3.order.id, 'processing', false, 'INFO')
    await step('S27', 'processing → pending (backward)', t3.order.id, 'pending', false, 'INFO')
    await step('S28', 'same status twice (pending → pending)', t3.order.id, 'pending', false, 'INFO')
  }

  // 5e. PATCH validation + field updates on t4
  if (t4.order) {
    const id = t4.order.id
    const inv = async (cid, title, body, want = 422) => expectStatus(cid, 'Update', title, await patchOrder(id, body), want)
    await inv('U01', 'status = "refunded" (not in enum)', { status: 'refunded' })
    await inv('U02', 'status = "SHIPPED" (uppercase)', { status: 'SHIPPED' })
    await inv('U03', 'status = "" (empty)', { status: '' })
    await inv('U04', 'status = null', { status: null })
    await inv('U05', 'status = 123', { status: 123 })
    await inv('U06', 'payment_method = "bitcoin"', { payment_method: 'bitcoin' })
    await inv('U07', 'shipping_address = ""', { shipping_address: '' })
    const empty = await patchOrder(id, {})
    record('U08', 'Update', 'Empty PATCH body {}', 'HTTP 200 no-op or 422', [200, 422].includes(empty.status) && !leaks(empty) ? 'GREEN' : 'RED', `HTTP ${empty.status} ${errText(empty)}`, empty)
    const upd = await patchOrder(id, { shipping_address: `${RUN} updated ship addr`, billing_address: `${RUN} updated bill addr`, notes: `${RUN} updated note`, payment_method: 'credit_card' })
    const u = upd.json?.data || {}
    record('U09', 'Update', 'Update addresses, notes, payment_method', 'HTTP 200 and all four persisted',
      upd.status === 200 && u.shipping_address?.includes('updated ship') && u.billing_address?.includes('updated bill') && u.notes?.includes('updated note') && u.payment_method === 'credit_card' ? 'GREEN' : 'RED',
      `HTTP ${upd.status}, ship=${brief(u.shipping_address, 40)}, bill=${brief(u.billing_address, 40)}, notes=${brief(u.notes, 40)}, pm=${u.payment_method} ${upd.status === 200 ? '' : errText(upd)}`, upd)
    record('U10', 'Update', 'Status untouched by a non-status PATCH', 'still pending', u.status === 'pending' ? 'GREEN' : 'RED', `status=${u.status}`, upd)
    const tam = await patchOrder(id, { total_amount: 1, subtotal: 1, discount: 99999, tax_amount: 0, order_number: 'ORD-HACKED', user_id: 1 })
    const tm = (await siteOrder(id)) || {}
    record('U11', 'Update', 'PATCH cannot rewrite money fields / order_number', 'ignored or 422',
      near(tm.total_amount, t4.order.total_amount) && Number(tm.discount) === 0 && tm.order_number === t4.order.order_number ? 'GREEN' : 'RED',
      `HTTP ${tam.status}, total=${round2(tm.total_amount)} (was ${round2(t4.order.total_amount)}), discount=${tm.discount}, order_number=${tm.order_number}`, tam)

    const pay = await patchOrder(id, { payment_status: 'paid', transaction_id: `${RUN}-TX` })
    const pd = pay.json?.data || {}
    record('P01', 'Payment', 'PATCH payment_status=paid (+ transaction_id)', 'HTTP 200, payment_status=paid, payment_time set, transaction_id saved',
      pay.status === 200 && pd.payment_status === 'paid' && pd.payment_time && pd.transaction_id === `${RUN}-TX` ? 'GREEN' : 'RED',
      `HTTP ${pay.status}, payment_status=${pd.payment_status}, payment_time=${pd.payment_time}, transaction_id=${pd.transaction_id}`, pay)
    record('P02', 'Payment', 'Marking paid does not move order status', 'status stays pending (two independent fields)', 'INFO', `status=${pd.status}`, pay)
    expectStatus('P03', 'Payment', 'payment_status = "garbage"', await patchOrder(id, { payment_status: 'garbage' }), 422)
    const ref = await patchOrder(id, { payment_status: 'refunded' })
    record('P04', 'Payment', 'payment_status = refunded', 'HTTP 200', ref.status === 200 && ref.json?.data?.payment_status === 'refunded' ? 'GREEN' : 'INFO', `HTTP ${ref.status}, payment_status=${ref.json?.data?.payment_status}`, ref)
    const unp = await patchOrder(id, { payment_status: 'unpaid' })
    record('P05', 'Payment', 'paid → unpaid clears payment_time', 'payment_time=null', unp.json?.data?.payment_time == null ? 'GREEN' : 'RED',
      `HTTP ${unp.status}, payment_status=${unp.json?.data?.payment_status}, payment_time=${unp.json?.data?.payment_time} (stale)`, unp)
    expectStatus('U12', 'Update', 'PUT /orders/{id} (collection uses PATCH)', await api('PUT', `/orders/${id}`, { body: { notes: `${RUN} via PUT` } }), [200, 405])
  }
  expectStatus('U13', 'Update', 'PATCH /orders/99999999 (missing)', await patchOrder(99999999, { status: 'shipped' }), 404)
  const mal = await api('PATCH', `/orders/${o1.id}`, { rawBody: '{"status":' })
  record('U14', 'Update', 'Malformed JSON on PATCH', 'HTTP 400/422', [400, 422].includes(mal.status) ? 'GREEN' : 'INFO', `HTTP ${mal.status} — silently treated as an empty update`, mal)
  const late = await patchOrder(o1.id, { shipping_address: `${RUN} changed after delivery` })
  record('U15', 'Update', 'Edit shipping_address after order is delivered', 'rejected (422/409)',
    [409, 422].includes(late.status) ? 'GREEN' : 'INFO', `HTTP ${late.status}, order status=${late.json?.data?.status}`, late)

  // ───────────────────────── 6. Non-functional ─────────────────────────
  const timed = results.filter((r) => r.ms != null).map((r) => r.ms).sort((a, b) => a - b)
  const p95 = timed[Math.floor(timed.length * 0.95)]
  record('N01', 'Perf', 'Response time p95', '< 2000 ms', p95 < 2000 ? 'GREEN' : 'INFO', `median=${timed[Math.floor(timed.length / 2)]} ms, p95=${p95} ms, max=${timed.at(-1)} ms over ${timed.length} calls`)
  record('N02', 'Stock', 'Net stock movement during run', 'for the record', 'INFO',
    (await Promise.all(active.map(async (p) => `P${p.id}: ${stockStart[p.id]} → ${await stockOf(p.id)}`))).join(' | '))
}

async function teardown() {
  // Non-destructive cleanup: QA coupons are deactivated, orders are left in place (listed in the output).
  for (const id of createdCoupons) await api('PUT', `/discount_codes/${id}`, { body: { is_active: false } })
}

try {
  await main()
} catch (error) {
  record('X99', 'Runner', 'Suite crashed', 'no exception', 'RED', String(error?.stack || error))
} finally {
  await teardown().catch(() => {})
  const count = (v) => results.filter((r) => r.verdict === v).length
  const summary = { run: RUN, base: BASE, at: new Date().toISOString(), total: results.length, green: count('GREEN'), red: count('RED'), info: count('INFO'), createdOrders, createdCoupons, validStatuses: VALID_STATUSES }
  writeFileSync(OUT, JSON.stringify({ summary, results }, null, 2))
  console.log('\n', JSON.stringify(summary))
}
