#!/usr/bin/env node
// Live QA for the inventory side-effects of the returns workflow.
// This intentionally creates QA orders and return requests; never run against
// production without approval. The created records are tagged with QA-RMA.
//
// Usage:
//   TIJARA_CUSTOMER_TOKEN='...' TIJARA_ADMIN_TOKEN='...' \
//   node scripts/qa-return-inventory.mjs [out.json]
//
// TIJARA_TOKEN can be used as a fallback for both roles.

import { writeFileSync } from 'node:fs'

const BASE = process.env.TIJARA_API_BASE || 'https://backend-tijara.be-kite.com/api/v1'
const FALLBACK_TOKEN = process.env.TIJARA_TOKEN || ''
let CUSTOMER_TOKEN = process.env.TIJARA_CUSTOMER_TOKEN || FALLBACK_TOKEN
let ADMIN_TOKEN = process.env.TIJARA_ADMIN_TOKEN || FALLBACK_TOKEN
const ADMIN_EMAIL = process.env.TIJARA_ADMIN_EMAIL || ''
const ADMIN_PASSWORD = process.env.TIJARA_ADMIN_PASSWORD || ''
const OUT = process.argv[2] || 'reports/tijara-return-inventory-qa.json'
const RUN = `QA-RMA-${Date.now().toString(36).toUpperCase()}`
const results = []
const created = { orders: [], returns: [] }

const brief = (value, max = 240) => {
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  return text && text.length > max ? `${text.slice(0, max)}…` : text
}

function record(id, title, expected, verdict, actual, extra = {}) {
  const row = { id, title, expected, verdict, actual, ...extra }
  results.push(row)
  console.log(`${verdict === 'PASS' ? '🟢' : verdict === 'FAIL' ? '🔴' : '🔵'} ${id} ${title} → ${actual}`)
  return row
}

async function api(method, path, { token = '', body } = {}) {
  const headers = { Accept: 'application/json', 'Accept-Language': 'ar' }
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const started = Date.now()
  try {
    const response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(45000),
    })
    const text = await response.text()
    let json = null
    try { json = JSON.parse(text) } catch { /* non-JSON response */ }
    return { status: response.status, json, text, ms: Date.now() - started }
  } catch (error) {
    return { status: 0, json: null, text: String(error), ms: Date.now() - started }
  }
}

async function loginAdmin() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_TOKEN) return null
  const form = new FormData()
  form.set('email', ADMIN_EMAIL)
  form.set('password', ADMIN_PASSWORD)
  try {
    const response = await fetch(`${BASE}/admin/login`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: form,
      signal: AbortSignal.timeout(45000),
    })
    const json = await response.json().catch(() => ({}))
    if (response.ok && json.token) {
      ADMIN_TOKEN = json.token
      if (!CUSTOMER_TOKEN) CUSTOMER_TOKEN = json.token
    }
    return { status: response.status, ok: response.ok && Boolean(json.token), role: json.user?.role }
  } catch (error) {
    return { status: 0, ok: false, error: String(error) }
  }
}

const dataOf = (response) => response.json?.data ?? response.json
const rowsOf = (response) => {
  const data = dataOf(response)
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

async function stockOf(productId) {
  const response = await api('GET', `/products/${productId}`, { token: ADMIN_TOKEN })
  const product = dataOf(response)
  const raw = product?.number ?? product?.stock_quantity ?? product?.stock ?? product?.quantity
  return { value: Number(raw), response, product }
}

function returnIdFrom(response, orderId) {
  const direct = dataOf(response)
  if (direct?.id) return direct.id
  const candidates = rowsOf(response)
  return candidates.find((item) => Number(item.order_id) === Number(orderId))?.id
}

async function findReturnId(orderId) {
  const adminList = await api('GET', '/returns', { token: ADMIN_TOKEN })
  const adminMatch = rowsOf(adminList).find((item) => Number(item.order_id) === Number(orderId))
  if (adminMatch?.id) return { id: adminMatch.id, response: adminList, source: 'admin list' }

  const siteList = await api('GET', '/site/returns', { token: CUSTOMER_TOKEN })
  const siteMatch = rowsOf(siteList).find((item) => Number(item.order_id) === Number(orderId))
  return { id: siteMatch?.id, response: siteList, source: 'site list' }
}

async function createOrder(productId, quantity, token) {
  const response = await api('POST', '/site/orders', {
    token,
    body: {
      shipping_address: `${RUN} QA address`,
      billing_address: `${RUN} QA address`,
      payment_method: 'cash_on_delivery',
      notes: `${RUN} automated inventory return QA`,
      items: [{ product_id: productId, quantity }],
    },
  })
  const order = dataOf(response)
  if (order?.id) created.orders.push(order.id)
  return { response, order }
}

async function makeReturn(order, orderItem, quantity) {
  const response = await api('POST', `/site/orders/${order.id}/returns`, {
    token: CUSTOMER_TOKEN,
    body: {
      reason: `${RUN} partial inventory return`,
      items: [{
        order_item_id: orderItem.id,
        quantity,
        condition: 'unopened',
        reason: `${RUN} QA item returned`,
      }],
    },
  })
  const returnId = returnIdFrom(response, order.id) || (await findReturnId(order.id)).id
  if (returnId) created.returns.push(returnId)
  return { response, returnId }
}

async function review(returnId, action, note) {
  return api('POST', `/returns/${returnId}/review`, {
    token: ADMIN_TOKEN,
    body: { action, admin_notes: note },
  })
}

async function main() {
  const login = await loginAdmin()
  if (login) record('AUTH-00', 'Admin login', 'HTTP 200 with token', login.ok ? 'PASS' : 'FAIL', `HTTP ${login.status}, role=${login.role || 'unknown'}`)
  if (!CUSTOMER_TOKEN || !ADMIN_TOKEN) {
    record('AUTH-01', 'Live inventory-return test has credentials', 'non-empty customer and admin tokens', 'BLOCKED', 'No token supplied')
    return 2
  }

  const productsResponse = await api('GET', '/products', { token: ADMIN_TOKEN })
  const products = rowsOf(productsResponse)
  const candidates = products
    .filter((product) => Number(product.number ?? product.stock_quantity ?? product.stock ?? product.quantity) >= 3)
    .sort((a, b) => Number(a.id) - Number(b.id))
  if (!candidates.length) {
    record('SETUP-01', 'Find a product with at least 3 units', 'one product', 'FAIL', `HTTP ${productsResponse.status}, rows=${products.length}`)
    return 1
  }
  const product = candidates[0]
  const orderQuantity = 2
  const returnQuantity = 1
  record('SETUP-02', 'Select QA product', 'stock >= 3', 'PASS', `product=${product.id}, name=${brief(product.name, 60)}`)

  // Scenario A: create order for two, return one, approve it.
  const beforeOrder = await stockOf(product.id)
  const createdOrder = await createOrder(product.id, orderQuantity, CUSTOMER_TOKEN)
  const order = createdOrder.order
  record('APP-01', 'Create order for 2 units', 'HTTP 201 with order id and item id', createdOrder.response.status === 201 && order?.id && order.items?.[0]?.id ? 'PASS' : 'FAIL', `HTTP ${createdOrder.response.status}, order=${order?.id ?? 'none'}`)
  if (!order?.id || !order.items?.[0]?.id) return 1

  const afterOrder = await stockOf(product.id)
  record('APP-02', 'Order decreases stock', `stock ${beforeOrder.value} → ${beforeOrder.value - orderQuantity}`, afterOrder.value === beforeOrder.value - orderQuantity ? 'PASS' : 'FAIL', `stock ${beforeOrder.value} → ${afterOrder.value}`)

  const delivered = await api('PATCH', `/orders/${order.id}`, { token: ADMIN_TOKEN, body: { status: 'delivered' } })
  record('APP-03', 'Move QA order to delivered', 'HTTP 200', delivered.status === 200 ? 'PASS' : 'INFO', `HTTP ${delivered.status}`)

  const submitted = await makeReturn(order, order.items[0], returnQuantity)
  record('APP-04', 'Submit partial return for 1 unit', 'HTTP 201/200 and return id', [200, 201].includes(submitted.response.status) && submitted.returnId ? 'PASS' : 'FAIL', `HTTP ${submitted.response.status}, return=${submitted.returnId ?? 'none'}`)
  if (!submitted.returnId) return 1

  const beforeApprove = await stockOf(product.id)
  const approved = await review(submitted.returnId, 'approve', `${RUN} approved and restocked`) 
  const afterApprove = await stockOf(product.id)
  record('APP-05', 'Approve return restores one unit', `stock ${beforeApprove.value} → ${beforeApprove.value + returnQuantity}`, approved.status >= 200 && approved.status < 300 && afterApprove.value === beforeApprove.value + returnQuantity ? 'PASS' : 'FAIL', `review HTTP ${approved.status}, stock ${beforeApprove.value} → ${afterApprove.value}`)

  const beforeRepeat = await stockOf(product.id)
  const repeated = await review(submitted.returnId, 'approve', `${RUN} repeated approval guard`)
  const afterRepeat = await stockOf(product.id)
  record('APP-06', 'Repeated approval does not restock twice', 'stock unchanged after second approval', afterRepeat.value === beforeRepeat.value ? 'PASS' : 'FAIL', `review HTTP ${repeated.status}, stock ${beforeRepeat.value} → ${afterRepeat.value}`)

  // Scenario B: reject a second return; rejecting must not add stock.
  const rejectedOrderResult = await createOrder(product.id, 1, CUSTOMER_TOKEN)
  const rejectedOrder = rejectedOrderResult.order
  if (!rejectedOrder?.id || !rejectedOrder.items?.[0]?.id) {
    record('REJ-01', 'Create reject-path order', 'HTTP 201 with order id and item id', 'FAIL', `HTTP ${rejectedOrderResult.response.status}`)
    return 1
  }
  const rejectedBefore = await stockOf(product.id)
  await api('PATCH', `/orders/${rejectedOrder.id}`, { token: ADMIN_TOKEN, body: { status: 'delivered' } })
  const rejectedSubmit = await makeReturn(rejectedOrder, rejectedOrder.items[0], 1)
  const rejectedReturn = rejectedSubmit.returnId
  if (!rejectedReturn) {
    record('REJ-02', 'Submit reject-path return', 'return id', 'FAIL', `HTTP ${rejectedSubmit.response.status}`)
    return 1
  }
  const rejectedReview = await review(rejectedReturn, 'reject', `${RUN} rejected; item condition failed`) 
  const rejectedAfter = await stockOf(product.id)
  record('REJ-03', 'Rejected return does not restore stock', `stock remains ${rejectedBefore.value}`, rejectedReview.status >= 200 && rejectedReview.status < 300 && rejectedAfter.value === rejectedBefore.value ? 'PASS' : 'FAIL', `review HTTP ${rejectedReview.status}, stock ${rejectedBefore.value} → ${rejectedAfter.value}`)

  return results.some((row) => row.verdict === 'FAIL') ? 1 : 0
}

let exitCode = 1
try {
  exitCode = await main()
} catch (error) {
  record('RUN-ERR', 'Inventory-return QA runner', 'no uncaught exception', 'FAIL', String(error?.stack || error))
  exitCode = 1
} finally {
  const summary = {
    run: RUN,
    base: BASE,
    at: new Date().toISOString(),
    pass: results.filter((row) => row.verdict === 'PASS').length,
    fail: results.filter((row) => row.verdict === 'FAIL').length,
    blocked: results.filter((row) => row.verdict === 'BLOCKED').length,
    info: results.filter((row) => row.verdict === 'INFO').length,
    created,
  }
  writeFileSync(OUT, JSON.stringify({ summary, results }, null, 2))
  console.log(`\n${JSON.stringify(summary)}`)
}
process.exitCode = exitCode
