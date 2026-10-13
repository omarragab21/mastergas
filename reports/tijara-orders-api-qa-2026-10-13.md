# Tijara Orders API — Full-Scenario QA Report (Red / Green)

Date: 2026-10-13  
Environment: `https://backend-tijara.be-kite.com/api/v1`  
Source collection: `~/Downloads/Tijara-New-App.postman_collection-13-10-2026.json` (folders `Site/orders` and `manage-order-page`)  
Account: `admin@mastergas.com` (role `super_admin`) — used both as the customer (`/site/orders`) and as the admin (`/orders`)  
Runner: [`scripts/qa-orders-api.mjs`](../scripts/qa-orders-api.mjs) · raw results: [`tijara-orders-api-qa-2026-10-13.json`](tijara-orders-api-qa-2026-10-13.json) · run id `QA-ORD-MV6GWIP4`

## Executive result

**119 checks: 73 🟢 GREEN · 24 🔴 RED · 22 🔵 INFO** (behaviour that works but needs a business/backend decision).

The order **happy path works and is safe to integrate**: create → list → show → `pending → paid_confirmed → processing → shipped → delivered`, pricing is computed server-side, coupons are enforced correctly (including under a race), and the API is fast (median ≈ 125 ms, p95 ≈ 290 ms).

The order **lifecycle rules are not enforced by the backend**. There is no state machine, no stock management, and no payment-method validation. Until the backend fixes these, the admin app must enforce them itself — that is the main input for the refactor.

| Area | Verdict |
|---|---|
| Create order, totals, tax (14% on subtotal − discount) | 🟢 |
| Client cannot tamper with prices / totals / status / discount | 🟢 |
| Coupons: min amount, cap, max uses, one per user, expired / inactive / future, parallel race | 🟢 |
| Field validation on items / quantity / address / shipping cost | 🟢 |
| Forward status flow + `shipped_at` / `delivered_at` | 🟢 |
| Status transition rules (backward, revive cancelled, skip steps) | 🔴 anything → anything |
| Stock / inventory | 🔴 never decremented, overselling allowed |
| `payment_method` validation | 🔴 optional and free-text |
| `paid_confirmed` ↔ `payment_status` consistency | 🔴 independent fields |
| Auth errors and error bodies | 🔴 500 instead of 401, stack traces leaked |

## Findings

### 🔴 HIGH-1 — No order state machine: any status can move to any status
`PATCH /orders/{id}` accepts every value of the enum from every state (S10–S13, S18–S19, S21–S28):

- `delivered → processing`, `delivered → cancelled`, `delivered → pending` — all HTTP 200.
- `cancelled → processing`, `cancelled → delivered` — a cancelled order can be revived and delivered.
- `pending → delivered` and `pending → shipped` skip payment and shipping entirely.
- After `delivered → pending` the order is `pending` but still carries `shipped_at` and `delivered_at` (S13). Jumping `pending → delivered` leaves `shipped_at = null` with `delivered_at` set (S22).
- Addresses can still be edited after delivery (U15).

Expected: `pending → paid_confirmed → processing → shipped → delivered`, `cancelled` only from pre-shipment states, `delivered` and `cancelled` terminal, illegal moves → HTTP 422.

### 🔴 HIGH-2 — No inventory management
Product `number` (stock) never changes: not on create, not on `paid_confirmed`, not on `delivered` (C06, S09, N02 — 16 orders per run, stock identical before and after). An order for **36 units of a product with 35 in stock returned HTTP 201** (V12). Cancelling therefore restores nothing (S15). The storefront will oversell.

### 🔴 HIGH-3 — Auth failures return HTTP 500 with a Laravel stack trace
Missing or invalid token on `GET/POST /site/orders`, `GET /orders`, `PATCH /orders/{id}` returns **500** with `exception`, `file` and `trace` (A02–A07). Same issue as yesterday's admin report — still open. The app cannot detect an expired session by status code; it has to match `message === "Unauthenticated."`. 404 and 405 responses have the right status code but also leak the trace and the model class name (C14, C15, U12, U13).

### 🔴 MEDIUM-4 — `payment_method` is not validated
`POST /site/orders` succeeds with `payment_method` missing (stored `null`, V15) or `"bitcoin"` (V16); `PATCH` also accepts `"bitcoin"` (U06). There is no enum, so the app must send a fixed set and the backend should publish it.

### 🔴 MEDIUM-5 — `status: paid_confirmed` does not mark the order as paid
After `paid_confirmed` the order still has `payment_status: "unpaid"`, `payment_time: null` (S02), and stays unpaid through `delivered` (S07). Payment is a separate field: `PATCH {"payment_status": "paid"}` works, sets `payment_time`, and accepts `transaction_id` (P01); allowed values are `unpaid`, `paid`, `refunded` (P03, P04). These fields are missing from the Postman collection. Going `paid → unpaid` leaves a stale `payment_time` (P05).

### 🔴 LOW-6 — Money fields are raw floats
Responses contain values such as `"subtotal": 876.8500000000000227…` (C05). The numbers are correct once rounded; the app must round to 2 decimals for display and never compare with `===`.

### 🔵 Decisions needed (works, but confirm the rule)
- **Shipping cost is supplied by the client** and trusted as-is, including `0` (T04). It should come from the city shipping rates on the server.
- **Coupon use is released when the order is cancelled** for the per-user check, but `used_count` is not decremented, so it keeps climbing (K07: cancel → reuse allowed → `used_count` 2 for one live order).
- **Same product on two lines** is stored as two lines, not merged (T05).
- **HTML is stored raw** in `notes` and addresses (T06) — render with text interpolation only, never `v-html`.
- **Admin list ignores `per_page`** (fixed at 20; customer list fixed at 10) (C17). `?status=` filter works (C18, C19).
- **Malformed JSON on PATCH** returns 200 as a no-op (U14). Empty PATCH body also 200 (U08).
- **Admin order `user` object** is only `id, name, email` — no phone (C10). The only contact data is the free-text address.

## Contract confirmed for integration

| Purpose | Request | Notes |
|---|---|---|
| Customer creates order | `POST /site/orders` | Required: `items[].product_id`, `items[].quantity` (integer ≥ 1), `shipping_address`, `billing_address`. Optional: `payment_method`, `coupon_code`, `notes` (≤ 1000 chars), `shipping_cost` (≥ 0). `discount`, prices, totals and status sent by the client are ignored. Returns **201**. |
| Customer list / show | `GET /site/orders`, `GET /site/orders/{id}` | 10 per page. |
| Admin list / show | `GET /orders?status=&page=`, `GET /orders/{id}` | 20 per page. `GET /orders/{id}` works but is not in the collection. |
| Admin update | `PATCH /orders/{id}` | `status`, `payment_status`, `transaction_id`, `payment_method`, `shipping_address`, `billing_address`, `notes`. `PUT` → 405. Money fields and `order_number` are immutable (U11). |
| Status enum | `pending`, `paid_confirmed`, `processing`, `shipped`, `delivered`, `cancelled` | Lowercase only; anything else → 422. |
| Payment enum | `unpaid`, `paid`, `refunded` | |
| Totals | `total = subtotal − discount + shipping_cost + tax_amount` | `tax_amount = 14% × (subtotal − discount)`; `unit_price` = product `final_price`. |
| Errors | 422 `{message, errors: {field: [..]}}` | Coupon errors come under `errors.coupon_code`. Unauthenticated = **500** + `message: "Unauthenticated."`. |

Current app gap: `admin/src/services/orderService.js` still calls the old `/frontend/orders` endpoints and has no status update call; `OrdersView.vue` uses a `completed` status that this API does not have and has no `paid_confirmed`.

## Not tested

- **`DELETE /orders/{id}`** — the route exists (the 405 response lists it) but it is destructive and was not called. The collection's "delete" request in `manage-order-page` points at `DELETE /products/5` by mistake.
- **Order ownership (IDOR)** — whether customer A can read customer B's order through `/site/orders/{id}`. Only one account was available.
- **Online payment callback** (PayTabs) and whether it sets `payment_status`.
- Product deactivated or price changed after the order was placed.

## Test data left on the backend

No data was deleted. Everything is tagged `QA-ORD` in notes/address:

- **Orders 5–37** (33 orders, all on user `admin@mastergas.com`), in mixed states.
- **Discount codes 4–13** (`QA-ORD-…`), all set to `is_active: false`.
- Product stock is unchanged (the API never decrements it).

## Re-running (red → green)

```bash
TIJARA_ADMIN_EMAIL=... TIJARA_ADMIN_PASSWORD=... node scripts/qa-orders-api.mjs reports/tijara-orders-api-qa-YYYY-MM-DD.json
```

The suite is deliberately outside `tests/*.test.js` so `npm test` never creates live orders. Each run creates 16 orders and 5 deactivated coupons. The 24 RED cases are the backend's to-do list; re-run after each backend fix until they turn green.

## All 119 cases

### Auth — 1 🟢 / 6 🔴 / 0 🔵

| ID | Scenario | Expected | Result | Actual |
|---|---|---|---|---|
| A01 | Admin login returns token | HTTP 200 + token | 🟢 | HTTP 200, role=super_admin |
| A02 | GET /site/orders without token | HTTP 401 — no stack trace | 🔴 | HTTP 500 [LEAKS exception/trace] Unauthenticated. |
| A03 | POST /site/orders without token | HTTP 401 — no stack trace | 🔴 | HTTP 500 [LEAKS exception/trace] Unauthenticated. |
| A04 | GET /orders without token | HTTP 401 — no stack trace | 🔴 | HTTP 500 [LEAKS exception/trace] Unauthenticated. |
| A05 | PATCH /orders/1 without token | HTTP 401 — no stack trace | 🔴 | HTTP 500 [LEAKS exception/trace] Unauthenticated. |
| A06 | GET /site/orders with invalid token | HTTP 401 — no stack trace | 🔴 | HTTP 500 [LEAKS exception/trace] Unauthenticated. |
| A07 | PATCH /orders/1 with invalid token | HTTP 401 — no stack trace | 🔴 | HTTP 500 [LEAKS exception/trace] Unauthenticated. |

### Create — 7 🟢 / 1 🔴 / 1 🔵

| ID | Scenario | Expected | Result | Actual |
|---|---|---|---|---|
| C01 | Create order with 1 item | HTTP 201 | 🟢 | HTTP 201 {"data":{"id":22,"order_number":"ORD-BVWVLULXED","status":"pending","payment_status":"unpaid","payment_method":"cash_on_delivery","transaction_id":null,"coupon_code":null,"discount_code":null,"subtotal":876.85…… |
| C02 | New order defaults | status=pending, payment_status=unpaid, order_number set | 🟢 | status=pending, payment_status=unpaid, order_number=ORD-BVWVLULXED |
| C03 | Subtotal uses server-side product final_price | subtotal=876.85 | 🟢 | subtotal=876.85, unit_price=876.85 |
| C04 | total = subtotal − discount + shipping + tax | arithmetic consistent | 🟢 | subtotal=876.85 discount=0 shipping=25 tax=122.76 (≈14%) total=1024.61 |
| C05 | Money fields are rounded to 2 decimals | e.g. 876.85 | 🔴 | raw float noise in JSON, e.g. "subtotal":876.85… |
| C12 | Multi-item order totals | HTTP 201, subtotal=2728.05, 2 items | 🟢 | HTTP 201, subtotal=2728.05, items=2, total=3134.98 |
| C13 | order_number unique per order | different numbers | 🟢 | ORD-BVWVLULXED vs ORD-TRQYWQQHTD |
| T05 | Same product on two lines | merged into qty 2 or 422 | 🔵 | HTTP 201, lines=2, qtys=1+1 |
| T07 | Accept-Language: ar returns Arabic product name | localized item.product.name | 🟢 | name=سخان مياه غاز فوري رقمي ماسترجاز 12 لتر أمان كامل ODS |

### Stock — 2 🟢 / 1 🔴 / 5 🔵

| ID | Scenario | Expected | Result | Actual |
|---|---|---|---|---|
| C06 | Stock is reserved/decremented when order is created | stock 40 → 39 | 🔵 | stock 40 → 40 |
| V12b | Stock never goes below zero after over-stock attempt | >= 0 | 🟢 | stock of 14 = 35 |
| S09 | Product stock decreases somewhere between create and delivered | below 40 (start of run) | 🔴 | product 16 stock 40 → 40 after 16 orders, one of them delivered |
| S15 | Cancel restores reserved stock | n/a — stock is never reserved (see C06/S09) | 🔵 | P16: 40 → 40, P14: 35 → 35 |
| S17 | Repeated cancel does not restore stock twice | unchanged | 🟢 | P16: 40 → 40, P14: 35 → 35 |
| S20 | Stock after reviving a cancelled order | no drift (revive should be rejected) | 🔵 | order status=delivered; P16: 40 → 40, P14: 35 → 35 |
| S25 | Stock after cancelling a shipped order | documented | 🔵 | P16: 40 → 40 |
| N02 | Net stock movement during run | for the record | 🔵 | P16: 40 → 40 \| P14: 35 → 35 \| P13: 20 → 20 \| P12: 30 → 30 \| P11: 25 → 25 |

### Read — 7 🟢 / 2 🔴 / 2 🔵

| ID | Scenario | Expected | Result | Actual |
|---|---|---|---|---|
| C07 | GET /site/orders/{id} returns the order with items | HTTP 200, same id, items[] | 🟢 | HTTP 200, items=1 |
| C08 | Order appears in customer list | present in /site/orders | 🟢 | total=18, per_page=10 |
| C09 | Order appears in admin list | present in /orders | 🟢 | total=18, per_page=20 |
| C10 | Admin list row exposes customer info | user/customer object (name, phone, email) | 🟢 | user keys: id,name,email (no phone/address on user object) |
| C11 | Admin GET /orders/{id} (not in Postman collection) | HTTP 200 with order | 🟢 | HTTP 200  |
| C14 | GET /site/orders/99999999 (missing) | HTTP 404 | 🔴 | HTTP 404 [LEAKS exception/trace] No query results for model [App\Models\Order] 99999999 |
| C15 | GET /site/orders/abc (non-numeric) | HTTP 404 | 🔴 | HTTP 404 [LEAKS exception/trace] No query results for model [App\Models\Order] abc |
| C16 | Admin list page=2 | honoured | 🔵 | HTTP 200, rows=0, statuses=[], per_page=20 |
| C17 | Admin list per_page=1 | honoured | 🔵 | HTTP 200, rows=19, statuses=[pending,cancelled,delivered], per_page=20 |
| C18 | Admin list status=pending | only matching statuses returned | 🟢 | HTTP 200, rows=15, statuses=[pending], per_page=20 |
| C19 | Admin list status=delivered | only matching statuses returned | 🟢 | HTTP 200, rows=2, statuses=[delivered], per_page=20 |

### Validation — 24 🟢 / 3 🔴 / 0 🔵

| ID | Scenario | Expected | Result | Actual |
|---|---|---|---|---|
| V01 | Empty body {} | HTTP 422 | 🟢 | HTTP 422 {"items":["The items field is required."],"shipping_address":["The shipping address field is required."],"billing_address":["The billing address field is required."]} |
| V02 | Missing items | HTTP 422 | 🟢 | HTTP 422 {"items":["The items field is required."]} |
| V03 | items = [] | HTTP 422 | 🟢 | HTTP 422 {"items":["The items field is required."]} |
| V04 | items is a string | HTTP 422 | 🟢 | HTTP 422 {"items":["The items field must be an array."]} |
| V05 | Item without product_id | HTTP 422 | 🟢 | HTTP 422 {"items.0.product_id":["The items.0.product_id field is required."]} |
| V06 | Item without quantity | HTTP 422 | 🟢 | HTTP 422 {"items.0.quantity":["The items.0.quantity field is required."]} |
| V07 | Non-existent product_id | HTTP 422 | 🟢 | HTTP 422 {"items.0.product_id":["The selected items.0.product_id is invalid."]} |
| V08 | quantity = 0 | HTTP 422 | 🟢 | HTTP 422 {"items.0.quantity":["The items.0.quantity field must be at least 1."]} |
| V09 | quantity = -3 | HTTP 422 | 🟢 | HTTP 422 {"items.0.quantity":["The items.0.quantity field must be at least 1."]} |
| V10 | quantity = 1.5 | HTTP 422 | 🟢 | HTTP 422 {"items.0.quantity":["The items.0.quantity field must be an integer."]} |
| V11 | quantity = "abc" | HTTP 422 | 🟢 | HTTP 422 {"items.0.quantity":["The items.0.quantity field must be an integer."]} |
| V12 | quantity above stock (36 of product 14) | HTTP 422 — insufficient stock | 🔴 | HTTP 201 {"data":{"id":24,"order_number":"ORD-FCFAI9AGEG","status":"pending","payment_status":"unpaid","payment_method":"cash_on_delivery","transaction_id":null,"coupon_code":null,"discount_code":null,"subtotal":35076.59…… |
| V13 | Missing shipping_address | HTTP 422 | 🟢 | HTTP 422 {"shipping_address":["The shipping address field is required."]} |
| V14 | Empty shipping_address "" | HTTP 422 | 🟢 | HTTP 422 {"shipping_address":["The shipping address field is required."]} |
| V15 | Missing payment_method | HTTP 422 | 🔴 | HTTP 201 {"data":{"id":25,"order_number":"ORD-YRF5TFR9DF","status":"pending","payment_status":"unpaid","payment_method":null,"transaction_id":null,"coupon_code":null,"discount_code":null,"subtotal":876.85…… |
| V16 | Unknown payment_method "bitcoin" | HTTP 422 | 🔴 | HTTP 201 {"data":{"id":26,"order_number":"ORD-FAHCW83RSH","status":"pending","payment_status":"unpaid","payment_method":"bitcoin","transaction_id":null,"coupon_code":null,"discount_code":null,"subtotal":876.85…… |
| V17 | Negative shipping_cost | HTTP 422 | 🟢 | HTTP 422 {"shipping_cost":["The shipping cost field must be at least 0."]} |
| V18 | shipping_cost as text | HTTP 422 | 🟢 | HTTP 422 {"shipping_cost":["The shipping cost field must be a number."]} |
| V20 | Unknown coupon_code | HTTP 422 | 🟢 | HTTP 422 {"coupon_code":["This coupon code is invalid or has expired."]} |
| V21 | Exhausted coupon SUMMER5250 (used_count = max_uses) | HTTP 422 | 🟢 | HTTP 422 {"coupon_code":["This coupon code has reached its maximum usage limit."]} |
| V22 | Malformed JSON body | HTTP 400/422 | 🟢 | HTTP 422 {"items":["The items field is required."],"shipping_address":["The shipping address field is required."],"billing_address":["The billing address field is required."]} |
| V23 | Notes longer than 10k chars | HTTP 422 — length limit | 🟢 | HTTP 422 {"notes":["The notes field must not be greater than 1000 characters."]} |
| K01 | Coupon below minimum_amount (subtotal 876.85 < 1000) | HTTP 422 — minimum not reached | 🟢 | HTTP 422 {"coupon_code":["The minimum order amount to use this coupon is 1000."]} |
| K11 | Coupon after max_uses reached | HTTP 422 — usage limit | 🟢 | HTTP 422 {"coupon_code":["This coupon code has reached its maximum usage limit."]} |
| K12 | Expired coupon | HTTP 422 — expired | 🟢 | HTTP 422 {"coupon_code":["This coupon code is invalid or has expired."]} |
| K13 | Inactive coupon | HTTP 422 — inactive | 🟢 | HTTP 422 {"coupon_code":["This coupon code is invalid or has expired."]} |
| K14 | Coupon not started yet | HTTP 422 — not started | 🟢 | HTTP 422 {"coupon_code":["This coupon code is invalid or has expired."]} |

### Tamper — 4 🟢 / 0 🔴 / 2 🔵

| ID | Scenario | Expected | Result | Actual |
|---|---|---|---|---|
| V19 | Client-supplied negative "discount": -50 | ignored (discount=0) or 422 | 🟢 | HTTP 201, discount=0, total=1024.61 |
| T01 | Client-supplied "discount": 500 without coupon | ignored (discount=0) or 422 | 🟢 | HTTP 201, discount=0, total=1024.61 (honest total 1024.61) |
| T02 | Client "discount" larger than subtotal | 422 or ignored; total never <= 0 | 🟢 | HTTP 201, discount=0, total=1024.61 |
| T03 | Client sends unit_price/total/status/payment_status/order_number | all ignored; server values used | 🟢 | HTTP 201, subtotal=876.85, status=pending, payment_status=unpaid, order_number=ORD-ZIXAJ8EAE8 |
| T04 | Client decides shipping_cost (sends 0) | server should compute shipping from city/rates | 🔵 | HTTP 201, shipping_cost=0 — client value is trusted as-is |
| T06 | HTML/script in notes & address | stored escaped/stripped, or UI must escape on render | 🔵 | HTTP 201, stored raw=true — admin UI must never use v-html for these |

### Coupon — 6 🟢 / 0 🔴 / 1 🔵

| ID | Scenario | Expected | Result | Actual |
|---|---|---|---|---|
| K02 | 10% coupon capped by max_discount=50 | HTTP 201, discount=50 (10% of 1753.7 = 175.37 → cap 50) | 🟢 | HTTP 201, discount=50, coupon_code=QA-ORD-MV6GWIP4-PCT, tax=238.52, total=1967.22  |
| K03 | Total arithmetic with coupon | total = subtotal − discount + shipping + tax | 🟢 | tax base: subtotal−discount ; tax=238.52 total=1967.22 |
| K04 | used_count increments after use | used_count = 1 | 🟢 | used_count=1 |
| K05 | Same user re-uses coupon (collection says one use per user) | HTTP 422 | 🟢 | HTTP 422, discount=undefined {"coupon_code":["You have already used this coupon code."]} |
| K06 | Re-use with the code typed in lowercase (bypass attempt) | HTTP 422 | 🟢 | HTTP 422, discount=undefined {"coupon_code":["You have already used this coupon code."]} |
| K07 | After cancelling the coupon order, same user uses the coupon again | business decision: allowed → used_count must drop on cancel | 🔵 | cancel HTTP 200; used_count after cancel=1; re-use HTTP 201, discount=50; used_count now 2 |
| K10 | Race: 2 parallel orders with a max_uses=1 coupon | exactly 1 gets the discount | 🟢 | statuses=201,422, discounted=1, discounts=30,, used_count=1 |

### Status — 8 🟢 / 7 🔴 / 8 🔵

| ID | Scenario | Expected | Result | Actual |
|---|---|---|---|---|
| S01 | pending → paid_confirmed | HTTP 200, status=paid_confirmed | 🟢 | HTTP 200, status=paid_confirmed  |
| S02 | paid_confirmed marks payment | payment_status=paid and payment_time set | 🔴 | payment_status=unpaid, payment_time=null |
| S03 | paid_confirmed → processing | HTTP 200, status=processing | 🟢 | HTTP 200, status=processing  |
| S04 | processing → shipped | HTTP 200, status=shipped | 🟢 | HTTP 200, status=shipped  |
| S05 | shipped sets shipped_at | shipped_at timestamp | 🟢 | shipped_at=2026-10-13T09:17:40+00:00 |
| S06 | shipped → delivered | HTTP 200, status=delivered | 🟢 | HTTP 200, status=delivered  |
| S07 | delivered sets delivered_at | delivered_at timestamp | 🟢 | delivered_at=2026-10-13T09:17:40+00:00, payment_status=unpaid |
| S08 | Customer endpoint reflects admin status change | site/orders/{id}.status = delivered | 🟢 | status=delivered |
| S10 | delivered → processing (backward) | rejected with HTTP 422/409 | 🔴 | HTTP 200, status=processing  |
| S11 | delivered → cancelled | rejected with HTTP 422/409 | 🔴 | HTTP 200, status=cancelled  |
| S12 | delivered → pending (reset) | rejected with HTTP 422/409 | 🔴 | HTTP 200, status=pending  |
| S13 | Timestamps after backward moves | delivered_at/shipped_at consistent with status | 🔴 | status=pending, shipped_at=2026-10-13T09:17:40+00:00, delivered_at=2026-10-13T09:17:40+00:00, payment_status=unpaid |
| S14 | pending → cancelled | HTTP 200, status=cancelled | 🟢 | HTTP 200, status=cancelled  |
| S16 | cancelled → cancelled (repeat) | rejected with HTTP 422/409 | 🔵 | HTTP 200, status=cancelled  |
| S18 | cancelled → processing (revive) | rejected with HTTP 422/409 | 🔴 | HTTP 200, status=processing  |
| S19 | cancelled → delivered | rejected with HTTP 422/409 | 🔴 | HTTP 200, status=delivered  |
| S21 | pending → delivered (skips payment/shipping) | rejected with HTTP 422/409 | 🔵 | HTTP 200, status=delivered  |
| S22 | Side-effects when jumping straight to delivered | shipped_at, delivered_at, payment set consistently | 🔵 | status=delivered, payment_status=unpaid, payment_time=null, shipped_at=null, delivered_at=2026-10-13T09:17:42+00:00 |
| S23 | pending → shipped (skips payment) | rejected with HTTP 422/409 | 🔵 | HTTP 200, status=shipped  |
| S24 | shipped → cancelled | rejected with HTTP 422/409 | 🔵 | HTTP 200, status=cancelled  |
| S26 | pending → processing (unpaid order) | rejected with HTTP 422/409 | 🔵 | HTTP 200, status=processing  |
| S27 | processing → pending (backward) | rejected with HTTP 422/409 | 🔵 | HTTP 200, status=pending  |
| S28 | same status twice (pending → pending) | rejected with HTTP 422/409 | 🔵 | HTTP 200, status=pending  |

### Update — 10 🟢 / 3 🔴 / 2 🔵

| ID | Scenario | Expected | Result | Actual |
|---|---|---|---|---|
| U01 | status = "refunded" (not in enum) | HTTP 422 | 🟢 | HTTP 422 {"status":["The selected status is invalid."]} |
| U02 | status = "SHIPPED" (uppercase) | HTTP 422 | 🟢 | HTTP 422 {"status":["The selected status is invalid."]} |
| U03 | status = "" (empty) | HTTP 422 | 🟢 | HTTP 422 {"status":["The selected status is invalid."]} |
| U04 | status = null | HTTP 422 | 🟢 | HTTP 422 {"status":["The selected status is invalid."]} |
| U05 | status = 123 | HTTP 422 | 🟢 | HTTP 422 {"status":["The selected status is invalid."]} |
| U06 | payment_method = "bitcoin" | HTTP 422 | 🔴 | HTTP 200 {"data":{"id":31,"order_number":"ORD-YNJA8WG1TV","status":"pending","payment_status":"unpaid","payment_method":"bitcoin","transaction_id":null,"coupon_code":null,"discount_code":null,"subtotal":876.85…… |
| U07 | shipping_address = "" | HTTP 422 | 🟢 | HTTP 422 {"shipping_address":["The shipping address field must be a string."]} |
| U08 | Empty PATCH body {} | HTTP 200 no-op or 422 | 🟢 | HTTP 200 {"data":{"id":31,"order_number":"ORD-YNJA8WG1TV","status":"pending","payment_status":"unpaid","payment_method":"bitcoin","transaction_id":null,"coupon_code":null,"discount_code":null,"subtotal":876.85…… |
| U09 | Update addresses, notes, payment_method | HTTP 200 and all four persisted | 🟢 | HTTP 200, ship=QA-ORD-MV6GWIP4 updated ship addr, bill=QA-ORD-MV6GWIP4 updated bill addr, notes=QA-ORD-MV6GWIP4 updated note, pm=credit_card  |
| U10 | Status untouched by a non-status PATCH | still pending | 🟢 | status=pending |
| U11 | PATCH cannot rewrite money fields / order_number | ignored or 422 | 🟢 | HTTP 200, total=999.61 (was 999.61), discount=0, order_number=ORD-YNJA8WG1TV |
| U12 | PUT /orders/{id} (collection uses PATCH) | HTTP 200/405 | 🔴 | HTTP 405 [LEAKS exception/trace] The PUT method is not supported for route api/v1/orders/31. Supported methods: GET, HEAD, PATCH, DELETE. |
| U13 | PATCH /orders/99999999 (missing) | HTTP 404 | 🔴 | HTTP 404 [LEAKS exception/trace] No query results for model [App\Models\Order] 99999999 |
| U14 | Malformed JSON on PATCH | HTTP 400/422 | 🔵 | HTTP 200 — silently treated as an empty update |
| U15 | Edit shipping_address after order is delivered | rejected (422/409) | 🔵 | HTTP 200, order status=pending |

### Payment — 3 🟢 / 1 🔴 / 1 🔵

| ID | Scenario | Expected | Result | Actual |
|---|---|---|---|---|
| P01 | PATCH payment_status=paid (+ transaction_id) | HTTP 200, payment_status=paid, payment_time set, transaction_id saved | 🟢 | HTTP 200, payment_status=paid, payment_time=2026-10-13T09:17:46+00:00, transaction_id=QA-ORD-MV6GWIP4-TX |
| P02 | Marking paid does not move order status | status stays pending (two independent fields) | 🔵 | status=pending |
| P03 | payment_status = "garbage" | HTTP 422 | 🟢 | HTTP 422 {"payment_status":["The selected payment status is invalid."]} |
| P04 | payment_status = refunded | HTTP 200 | 🟢 | HTTP 200, payment_status=refunded |
| P05 | paid → unpaid clears payment_time | payment_time=null | 🔴 | HTTP 200, payment_status=unpaid, payment_time=2026-10-13T09:17:46+00:00 (stale) |

### Perf — 1 🟢 / 0 🔴 / 0 🔵

| ID | Scenario | Expected | Result | Actual |
|---|---|---|---|---|
| N01 | Response time p95 | < 2000 ms | 🟢 | median=125 ms, p95=288 ms, max=658 ms over 105 calls |
