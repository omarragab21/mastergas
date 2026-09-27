# Mastergas E-Commerce & CMS - Backend API Specification

This document provides the complete backend architecture, database schema, and RESTful API contract for the **Mastergas** e-commerce platform (Customer Storefront & Admin Dashboard).

---

## 1. System Architecture & Protocols

- **Base URL**: `https://backend-mastergas.be-kite.com/api` (or configured via `VITE_API_BASE_URL`)
- **Protocol**: HTTPS / RESTful JSON
- **Supported Languages**: Arabic (`ar`), English (`en`) passed via header:
  `Accept-Language: ar`
- **Default Format**:
  ```http
  Accept: application/json
  Content-Type: application/json
  ```
- **Multipart Uploads**: `multipart/form-data` for image and document uploads.

### Authentication & Dual Guards
1. **Customer Guard (`customer`)**:
   - Header: `Authorization: Bearer <c_token>`
   - Scopes: Public browsing, customer profile, address management, cart sync, order creation, wallet, returns, and reviews.
2. **Admin Guard (`admin`)**:
   - Header: `Authorization: Bearer <token>`
   - Scopes: Admin login, role-based access control (RBAC), full catalog CRUD, order lifecycle management, system settings, marketing, and activity logs.

---

## 2. Database Schema Overview

### 2.1 Identity & Access Control
- `admins`: `id`, `name`, `email`, `password`, `phone`, `avatar`, `role_id`, `is_active`, timestamps.
- `roles`: `id`, `name`, `display_name_ar`, `display_name_en`.
- `permissions`: `id`, `name`, `group`, `display_name_ar`, `display_name_en`.
- `role_has_permissions`: `role_id`, `permission_id`.
- `activity_logs`: `id`, `admin_id`, `action`, `module`, `record_id`, `details_json`, `ip_address`, `user_agent`, timestamps.

### 2.2 Customers & Financials
- `customers`: `id`, `name`, `email`, `phone`, `password`, `wallet_balance`, `is_active`, `notes`, timestamps.
- `customer_addresses`: `id`, `customer_id`, `country_id`, `city_id`, `address_line`, `building`, `floor`, `phone`, `is_default`, timestamps.
- `wallet_transactions`: `id`, `customer_id`, `amount`, `type` (`credit`/`debit`), `reference_type` (`order`/`refund`/`manual`), `reference_id`, `description_ar`, `description_en`, timestamps.
- `customer_notifications`: `id`, `customer_id`, `title_ar`, `title_en`, `body_ar`, `body_en`, `read_at`, `type`, timestamps.
- `wishlists`: `id`, `customer_id`, `product_id`, timestamps.

### 2.3 Product Catalog
- `categories`: `id`, `parent_id` (nullable), `name_ar`, `name_en`, `slug`, `image`, `banner`, `sort_order`, `is_active`, timestamps.
- `brands`: `id`, `name_ar`, `name_en`, `slug`, `logo`, `country_of_origin`, `website`, `is_active`, timestamps.
- `product_attributes`: `id`, `name_ar`, `name_en`, `type` (`select`, `color`, `text`), timestamps.
- `product_attribute_values`: `id`, `attribute_id`, `value_ar`, `value_en`, `color_code`, timestamps.
- `products`: `id`, `category_id`, `brand_id`, `name_ar`, `name_en`, `slug`, `sku`, `price`, `sale_price`, `stock_quantity`, `low_stock_threshold`, `total_sold`, `is_active`, `is_featured`, `is_new`, `warranty_years`, `short_description_ar`, `short_description_en`, `description_ar`, `description_en`, `main_image`, timestamps.
- `product_images`: `id`, `product_id`, `image_url`, `sort_order`.

### 2.4 Sales, Orders & Logistics
- `orders`: `id`, `order_number`, `customer_id`, `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `country_id`, `city_id`, `subtotal`, `discount_amount`, `tax_amount`, `shipping_cost`, `total_amount`, `payment_method` (`card`, `cod`, `wallet`), `payment_status` (`pending`, `paid`, `failed`, `refunded`), `order_status` (`pending`, `processing`, `shipped`, `delivered`, `cancelled`), `idempotency_key`, `coupon_code`, `tracking_number`, `notes`, `is_gift`, `gift_message`, timestamps.
- `order_items`: `id`, `order_id`, `product_id`, `product_name_ar`, `product_name_en`, `product_sku`, `unit_price`, `quantity`, `total_price`, `attributes_snapshot_json`.
- `order_status_history`: `id`, `order_id`, `admin_id`, `from_status`, `to_status`, `comment`, timestamps.
- `payments`: `id`, `order_id`, `gateway` (`paytabs`, `wallet`, `cod`), `transaction_reference`, `amount`, `currency`, `status`, `gateway_response_json`, timestamps.
- `returns`: `id`, `return_number`, `order_id`, `customer_id`, `reason`, `customer_note`, `status` (`pending`, `approved`, `rejected`, `refunded`), `refund_amount`, `admin_note`, `images_json`, timestamps.
- `countries`: `id`, `name_ar`, `name_en`, `code`, `phone_code`, `currency`, `is_active`.
- `cities`: `id`, `country_id`, `name_ar`, `name_en`, `is_active`.
- `city_shipping_rates`: `id`, `city_id`, `shipping_cost`, `free_shipping_threshold`, `estimated_delivery_days`, `is_active`.

### 2.5 Marketing & CMS
- `coupons`: `id`, `code`, `type` (`percentage`, `fixed`), `value`, `min_order_amount`, `max_discount`, `start_date`, `end_date`, `usage_limit`, `usage_per_user`, `is_active`.
- `offers`: `id`, `name_ar`, `name_en`, `type` (`percentage`, `fixed`), `value`, `start_date`, `end_date`, `applies_to` (`all`, `category`, `product`), `applied_ids_json`, `badge_text_ar`, `badge_text_en`, `is_active`.
- `sliders`: `id`, `title_ar`, `title_en`, `subtitle_ar`, `subtitle_en`, `desktop_image`, `mobile_image`, `cta_text_ar`, `cta_text_en`, `cta_url`, `sort_order`, `status`.
- `topics`: `id`, `title_ar`, `title_en`, `slug`, `category`, `image`, `content_ar`, `content_en`, `status`, `views_count`, timestamps.
- `dynamic_pages`: `id`, `slug`, `title_ar`, `title_en`, `content_ar`, `content_en`, `meta_title`, `meta_description`, `is_active`.
- `reviews`: `id`, `product_id`, `customer_id`, `customer_name`, `rating`, `comment`, `is_approved`, `admin_reply`, timestamps.
- `branches`: `id`, `name_ar`, `name_en`, `address_ar`, `address_en`, `phone`, `email`, `latitude`, `longitude`, `working_hours`, `is_active`.
- `contact_messages`: `id`, `name`, `email`, `phone`, `subject`, `message`, `is_read`, timestamps.
- `settings`: `key` (unique), `value`, `group`, `type`, timestamps.

---

## 3. Customer & Storefront API Reference (`/api/frontend`)

### 3.1 Authentication & Profile
- `POST /api/frontend/register`
  - Body: `{ name, email, phone, password }`
  - Response: `{ status: 'success', token: '...', customer: { ... } }`
- `POST /api/frontend/login`
  - Body: `{ email, password }`
  - Response: `{ status: 'success', token: '...', customer: { ... } }`
- `POST /api/frontend/logout`
  - Headers: `Authorization: Bearer <c_token>`
  - Response: `{ status: 'success', message: 'Logged out successfully' }`
- `GET /api/frontend/user`
  - Headers: `Authorization: Bearer <c_token>`
  - Response: `{ data: { id, name, email, phone, wallet_balance, ... } }`
- `PUT /api/frontend/profile`
  - Headers: `Authorization: Bearer <c_token>`
  - Body: `{ name, email, phone }`
- `POST /api/frontend/change-password`
  - Headers: `Authorization: Bearer <c_token>`
  - Body: `{ current_password, new_password, new_password_confirmation }`
- `GET /api/frontend/wallet`
  - Headers: `Authorization: Bearer <c_token>`
  - Response: `{ data: { balance: 150.00, transactions: [ ... ] } }`
- `GET /api/frontend/notifications`
  - Response: `{ data: [ { id, title, body, read_at, created_at } ] }`
- `PATCH /api/frontend/notifications/{id}/read`

### 3.2 Addresses & Geography
- `GET /api/frontend/countries`
  - Response: `{ data: [ { id: 1, name: 'السعودية', code: 'SA', phone_code: '+966', currency: 'SAR' } ] }`
- `GET /api/frontend/cities?country_id={country_id}`
  - Response: `{ data: [ { id: 1, name: 'الرياض', shipping_rate: { shipping_cost: 25.00, is_active: 1 } } ] }`
- `GET /api/frontend/cities/{id}/shipping-rate`
  - Response: `{ data: { city_id: 1, shipping_rate: { shipping_cost: 25.00, is_active: 1 } } }`
- `GET /api/frontend/addresses`
- `POST /api/frontend/addresses`
  - Body: `{ country_id, city_id, address, building, floor, phone, is_default }`
- `PUT /api/frontend/addresses/{id}`
- `DELETE /api/frontend/addresses/{id}`

### 3.3 Catalog & Shopping
- `GET /api/frontend/categories`
  - Response: `{ data: [ { id, name, slug, image, banner, children: [ ... ] } ] }`
- `GET /api/frontend/products`
  - Query Params: `category_id`, `brand_id`, `search`, `min_price`, `max_price`, `sort_by` (`price_asc`, `price_desc`, `newest`, `popular`), `page`, `per_page`
  - Response: `{ data: [ ... ], meta: { current_page, total, per_page, last_page } }`
- `GET /api/frontend/products/{id}`
  - Response: `{ data: { id, name, sku, price, sale_price, stock_quantity, description, images: [ ... ], attributes: [ ... ], reviews: [ ... ] } }`
- `GET /api/frontend/filters`
  - Response: `{ data: { price_range: { min, max }, brands: [ ... ], categories: [ ... ], attributes: [ ... ] } }`
- `GET /api/frontend/offers`
- `POST /api/frontend/wishlist/toggle`
  - Body: `{ product_id: 12 }`
- `GET /api/frontend/products/{id}/reviews`
- `POST /api/frontend/reviews`
  - Body: `{ product_id, rating, comment }`

### 3.4 Checkout & Orders
- `POST /api/frontend/coupons/validate`
  - Body: `{ code: 'WELCOME10', amount: 450.00 }`
  - Response: `{ valid: true, discount: 45.00, coupon: { code, type, value } }`
- `POST /api/frontend/orders`
  - Headers: `Idempotency-Key: <unique-key>`
  - Body:
    ```json
    {
      "customer_id": 5,
      "customer_name": "أحمد محمد",
      "customer_email": "ahmed@example.com",
      "customer_phone": "+966500000000",
      "shipping_address": "حي النرجس، شارع عثمان بن عفان، الرياض",
      "country_id": 1,
      "city_id": 1,
      "subtotal": 2400.00,
      "discount": 100.00,
      "tax_amount": 345.00,
      "shipping_cost": 0.00,
      "total_amount": 2645.00,
      "payment_method": "cod",
      "use_wallet": false,
      "wallet_amount": 0,
      "coupon_code": "SUMMER2026",
      "items": [
        { "product_id": 12, "quantity": 1, "unit_price": 2400.00, "attributes": null }
      ]
    }
    ```
  - Response: `{ status: 'success', data: { id: 1045, order_number: 'MG-2026-1045', total_amount: 2645.00, ... } }`
- `GET /api/frontend/orders/me`
- `GET /api/frontend/orders/{id}`
- `POST /api/frontend/paytabs/checkout`
  - Body: `{ checkout_attempt_id, cart_id, cart_amount, customer_name, customer_email, customer_phone, return_url, cancel_url, order_data }`
  - Response: `{ status: 'success', redirect_url: 'https://secure.paytabs.com/...' }`
- `POST /api/frontend/paytabs/callback`
  - Webhook listener for PayTabs IPN and transaction response validation.
- `GET /api/frontend/returns`
- `POST /api/frontend/returns`
  - Body: `{ order_id, reason, customer_note, images: [ ... ] }`

### 3.5 CMS & Settings
- `GET /api/frontend/settings`
  - Response: `{ data: { site_name, logo, footer_logo, phone, whatsapp, email, address, tax_rate, free_delivery_threshold, ... } }`
- `GET /api/frontend/sliders`
- `GET /api/frontend/branches`
- `GET /api/frontend/topics/{slug_or_id}`
- `GET /api/frontend/pages/{slug_or_id}`
- `POST /api/frontend/contact`
  - Body: `{ name, email, phone, subject, message }`

---

## 4. Admin Dashboard API Reference (`/api/dashboard`)

### 4.1 Admin Auth & RBAC
- `POST /api/v1/login`: `{ email, password }` -> `{ token, admin: { id, name, email, role, permissions: [ ... ] } }`
- `GET /api/dashboard/admins`
- `POST /api/dashboard/admins` (Multipart or JSON)
- `POST /api/dashboard/admins/{id}`
- `DELETE /api/dashboard/admins/{id}`
- `GET /api/dashboard/permissions`
- `POST /api/dashboard/permissions`
- `PUT /api/dashboard/permissions/{id}`
- `DELETE /api/dashboard/permissions/{id}`

### 4.2 Analytics & Logs
- `GET /api/dashboard/statistics`:
  ```json
  {
    "data": {
      "summary": {
        "total_products": 340,
        "products_change": 4.5,
        "total_customers": 1250,
        "customers_change": 12.0,
        "today_orders": 24,
        "today_orders_change": -2.1,
        "monthly_sales": 84500.00,
        "monthly_sales_change": 18.4
      },
      "sales_chart": [ ... ],
      "orders_status_distribution": { "pending": 8, "processing": 14, "delivered": 180, "cancelled": 3 }
    }
  }
  ```
- `GET /api/dashboard/activity-logs`
- `DELETE /api/dashboard/activity-logs/{id}`

### 4.3 Catalog Management
- `GET /api/dashboard/products`
- `POST /api/dashboard/products` (Multipart form data: images, name_ar, name_en, sku, price, category_id, attributes)
- `POST /api/dashboard/products/{id}`
- `DELETE /api/dashboard/products/{id}`
- `GET /api/dashboard/categories`
- `POST /api/dashboard/categories`
- `POST /api/dashboard/categories/{id}`
- `DELETE /api/dashboard/categories/{id}`
- `GET /api/dashboard/brands`
- `POST /api/dashboard/brands`
- `POST /api/dashboard/brands/{id}`
- `DELETE /api/dashboard/brands/{id}`
- `GET /api/dashboard/product-attributes`
- `POST /api/dashboard/product-attributes/{id}/values`
- `PUT /api/dashboard/product-attributes/{id}/values/{val_id}`
- `DELETE /api/dashboard/product-attributes/{id}/values/{val_id}`

### 4.4 Orders & Returns Management
- `GET /api/dashboard/orders`
- `GET /api/dashboard/orders/{id}`
- `PATCH /api/dashboard/orders/{id}/status`: `{ status: 'shipped', tracking_number: 'TRK-9921', comment: '...' }`
- `DELETE /api/dashboard/orders/{id}`
- `GET /api/dashboard/returns`
- `PATCH /api/dashboard/returns/{id}/status`: `{ status: 'refunded', refund_amount: 540.00, refund_to_wallet: true }`

### 4.5 Marketing & CMS
- `GET /api/dashboard/coupons`
- `POST /api/dashboard/coupons`
- `PUT /api/dashboard/coupons/{id}`
- `DELETE /api/dashboard/coupons/{id}`
- `GET /api/dashboard/offers`
- `POST /api/dashboard/offers`
- `PUT /api/dashboard/offers/{id}`
- `DELETE /api/dashboard/offers/{id}`
- `GET /api/dashboard/sliders`
- `POST /api/dashboard/sliders`
- `POST /api/dashboard/sliders/{id}`
- `DELETE /api/dashboard/sliders/{id}`
- `GET /api/dashboard/topics`
- `POST /api/dashboard/topics`
- `PUT /api/dashboard/topics/{id}`
- `DELETE /api/dashboard/topics/{id}`

### 4.6 Customers & Reviews
- `GET /api/dashboard/customers`
- `GET /api/dashboard/customers/{id}`
- `PUT /api/dashboard/customers/{id}`
- `DELETE /api/dashboard/customers/{id}`
- `GET /api/dashboard/reviews`
- `PATCH /api/dashboard/reviews/{id}/approve`
- `DELETE /api/dashboard/reviews/{id}`
- `GET /api/dashboard/contact-messages`
- `PATCH /api/dashboard/contact-messages/{id}/read`
- `DELETE /api/dashboard/contact-messages/{id}`

### 4.7 Regional & System Settings
- `GET /api/dashboard/countries`
- `POST /api/dashboard/countries`
- `PUT /api/dashboard/countries/{id}`
- `DELETE /api/dashboard/countries/{id}`
- `GET /api/dashboard/cities`
- `POST /api/dashboard/cities`
- `PUT /api/dashboard/cities/{id}`
- `DELETE /api/dashboard/cities/{id}`
- `GET /api/dashboard/city-shipping-rates`
- `PUT /api/dashboard/city-shipping-rates/{id}`
- `POST /api/dashboard/city-shipping-rates/bulk-update`
- `GET /api/dashboard/branches`
- `POST /api/dashboard/branches`
- `PUT /api/dashboard/branches/{id}`
- `DELETE /api/dashboard/branches/{id}`
- `GET /api/dashboard/settings`
- `POST /api/dashboard/settings` (Single key/value or file)
- `POST /api/dashboard/settings/multiple` (Batch `{ settings: [ { key, value } ] }`)

---

## 5. Security & Idempotency Rules

1. **Idempotency Enforcement**:
   - `Idempotency-Key` header is mandatory for all checkout and order placement endpoints.
   - Backend caches key-to-order bindings for 24 hours. Re-submission with the same key returns the existing order with HTTP `200 OK` or `409 Conflict` (including the existing order payload).
2. **Server-side Price & Stock Calculation**:
   - The server must never trust client-calculated totals. It re-computes item unit prices, active category/product offers, coupons, city shipping fees, and taxes from the database within an atomic transaction (`DB::transaction`).
3. **PayTabs Webhook Verification**:
   - Webhook signatures (`signature` header) must be verified against the PayTabs Server Key before any order status transition to `paid`.
