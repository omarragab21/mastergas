# Tijara Local Catalog Seed & Admin QA Report

Date: 2026-10-12  
Environment: local Admin app + Tijara Admin API v1  
Source: `admin/src/data/localData.json` and `admin/public/local-assets/`  
Authentication: admin session used for the run; credentials and token intentionally omitted.

## Executive result

The local catalog scenario completed successfully through a browser-backed write flow. The imported catalog is visible in the Admin views and is linked to the live Tijara records.

| Area | Result |
|---|---:|
| Categories synced with uploaded images | 10/10 |
| Local subcategories found | 0 |
| Product attributes created/synced | 13/13 |
| Attribute options created/synced | 100% of local option values |
| Products created | 6/6 |
| Product images uploaded | 18/18 |
| Product-to-category links | 6/6 |
| Product-to-attribute option links | 6/6 |
| Browser Admin smoke test | Passed |

## Created live records

### Categories

All ten local category images were uploaded from `/local-assets/categories/{id}.jpg`.

| Local ID | Tijara ID | Category |
|---:|---:|---|
| 51 | 12 | Gas Cylinders & Tanks |
| 52 | 13 | Gas Regulators & Valves |
| 53 | 14 | Gas Heaters & Stoves |
| 54 | 15 | Camping & Outdoor Gas Gear |
| 55 | 16 | Gas Hoses & Connectors |
| 56 | 17 | Gas Leak Detectors & Safety |
| 57 | 18 | Gas Stoves & Built-in Hobs |
| 58 | 19 | Gas Water Heaters & Geysers |
| 59 | 20 | Outdoor Gas Grills & BBQs |
| 60 | 21 | Gas Accessories & Spare Parts |

The local source contains no actual subcategory records: every category has `parent_id: null` and an empty `children` array. No artificial hierarchy was added.

### Products and category links

Each product received its three local image files, product descriptions, stock, price, Arabic/English names, and selected attribute option IDs.

| Local ID | Tijara ID | Tijara category ID | Image count | Discount conversion |
|---:|---:|---:|---:|---:|
| 25 | 11 | 18 | 3 | source amount converted to 35% |
| 26 | 12 | 18 | 3 | source amount converted to 35% |
| 27 | 13 | 18 | 3 | source amount converted to 35% |
| 28 | 14 | 18 | 3 | source amount converted to 35% |
| 29 | 15 | 20 | 3 | source amount converted to 35% |
| 30 | 16 | 19 | 3 | source amount converted to 35% |

The source file stores product discounts as monetary amounts, while the Tijara product endpoint accepts a percentage. The conversion was calculated as `discount / price * 100`, resulting in 35% for all six local products.

### Product attributes

The 13 local attribute groups were normalized into Admin attributes, including the `Colors` color-swatch attribute and select attributes for capacity, dimensions, origin, energy, safety, cooking, ignition, timer, voltage, and appearance. Every distinct local value was registered as an option, then the option IDs were sent with each product.

The API response was checked at the raw level. Where the API returns an English option name, the corresponding Arabic value is present in the option `translations`, so the bilingual value is preserved rather than dropped.

## QA performed

### Browser-backed API verification

- Logged in using the Admin flow through the local browser origin.
- Wrote through `/api/v1/categories`, `/api/v1/attributes`, `/api/v1/attributes/{id}/options`, and `/api/v1/products`.
- Uploaded category images through `image_file` and product images through indexed `images[]` fields.
- Re-read fresh API data after writes using `per_page=100`.
- Confirmed category image URLs are present for all ten categories.
- Confirmed all six products exist, contain three images, have the expected live category ID, and expose linked attribute options.
- The seed logic matches existing records by normalized names before creating, making a rerun safe from name-based duplicates.

### Admin UI smoke test

Routes tested after seeding:

- `/admin/categories`: 10 active categories rendered.
- `/admin/products`: 6 active products rendered and category filters populated.
- `/admin/attributes`: imported attribute groups and values rendered.
- `/admin/discounts`: discount view rendered with live API data.

Result: no blank pages, no framework error overlay, no browser console errors, and no failed network requests during the smoke run.

## Findings and remaining risks

1. No subcategories were available in the supplied local JSON, so there was nothing valid to link or create under a parent category.
2. The product source discount field is an amount, not a percentage; it was explicitly converted to the API's percentage contract.
3. The existing backend issue found in the earlier API QA remains separate from this import: invalid or missing bearer tokens can return HTTP 500 with a stack trace instead of a clean 401/403 response. This does not affect the successful authenticated seed run, but it should be fixed before production hardening.
4. The live discount-code endpoint does not currently persist product/category targeting fields reliably; this run did not create discount codes because the requested scenario was the local product/category/attribute catalog import.

## Final status

**PASS — local categories, attributes, products, images, and product/category/attribute relationships are present in Tijara and visible in the Admin project.**

## Follow-up category relink update — 2026-10-12

Because the Admin screen was reported as not showing the expected category relationship, all six products were explicitly updated again through browser-backed `PUT /api/v1/products/{id}` requests. The update payload included the canonical live `category_id`, while preserving product content, stock, price, discount, descriptions, and option IDs.

| Product API ID | Category ID sent | Category returned | Result |
|---:|---:|---|---|
| 11 | 18 | 18 — Gas Stoves & Built-in Hobs | PASS |
| 12 | 18 | 18 — Gas Stoves & Built-in Hobs | PASS |
| 13 | 18 | 18 — Gas Stoves & Built-in Hobs | PASS |
| 14 | 18 | 18 — Gas Stoves & Built-in Hobs | PASS |
| 15 | 20 | 20 — Outdoor Gas Grills & BBQs | PASS |
| 16 | 19 | 19 — Gas Water Heaters & Geysers | PASS |

Fresh API verification returned `allPassed: true`. The Admin Products page was then reloaded and visibly showed the Arabic product names under the correct Arabic category names. Browser console errors: 0. Failed requests: 0.

## Browser product-add evidence — 2026-10-12

A separate product was added from a Playwright browser context to prove the category value at creation time, not only after an update:

- Product API ID: `17`
- Product name: `Playwright Browser QA Category ID 18 1791804769766`
- Form select value at screenshot time: `category_id = 18`
- Selected category: `Gas Stoves & Built-in Hobs`
- Price: `249.99`
- Stock: `7`
- Discount: `10%`
- Uploaded images: `1`
- Create response: HTTP `201`
- Fresh GET verification: `category_id = 18`, category name `Gas Stoves & Built-in Hobs`

Screenshot evidence: `/tmp/mastergas-playwright-add-category-id.png`.
