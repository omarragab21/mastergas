# Tijara Admin API — Senior QA Report

Date: 2026-10-12  
Environment: `https://backend-tijara.be-kite.com/api/v1`  
Source collection: `/Users/omarragab/Downloads/Tijara-New-App.postman_collection.json`

## Executive result

The core Admin CRUD flows for Categories, Sub-categories, Discount Codes, Products, and Attributes/Options are working on the happy path. Validation, duplicate-code protection, 404 handling for missing records, multipart image upload, and CRUD persistence were exercised.

The environment is **not ready for production integration** because protected endpoints return HTTP 500 instead of HTTP 401 for missing, invalid, and revoked tokens, and the response exposes Laravel exception details, server file paths, and stack traces.

## Scope and coverage

- Admin login, customer login compatibility, invalid credentials, logout, and post-logout access.
- `users`: list, validation, and attempted CRUD.
- `categories`: list, create parent, create sub-category with `parent_id`, show, update, image upload, delete, invalid parent validation.
- `discount_codes`: list, create, show, update, delete, duplicate code, invalid type, negative value, value over 100, malformed/empty payloads.
- `products`: list, create, show, update, delete, multipart image upload, negative price, discount over 100, computed discount price persistence.
- `attributes`: list, create, show, update, delete, invalid type, options create/update/delete, empty-options behavior.
- Missing resource IDs and unauthenticated/invalid-token access.

Test data used unique temporary prefixes and was deleted after the run. Final scans confirmed no leftover records with the test prefixes.

## Findings

### HIGH — Protected routes return 500 and leak internal details

Observed on `/users`, `/categories`, `/discount_codes`, `/products`, and `/attributes` for:

- no `Authorization` header;
- invalid bearer token;
- the token after successful logout.

Actual response: HTTP `500`, body message `Unauthenticated.`, with `exception`, `file`, and `trace` fields. Expected response: HTTP `401` with a minimal JSON error body and no internal paths or stack trace.

Recommended fix: configure the authentication exception handler/API middleware to return a consistent 401 JSON response, disable debug details on the deployed environment, and add regression tests for missing, malformed, invalid, and revoked tokens.

### HIGH — `POST /users` depends on a missing database table

The collection payload is incomplete: the API also requires `name_en`, `name_ar`, `billing_cycle`, and `package_id`. When these were supplied, the endpoint returned HTTP `500` with:

`SQLSTATE[42S02]: Base table or view not found: ... table tijara-new-database.packages doesn't exist`

Recommended fix: create/run the `packages` migration and seed valid package records, or remove/replace the package dependency. Update the Postman request with all required fields.

### MEDIUM — Attribute creation accepts an empty options array

`POST /attributes` with valid type/names and `options: []` returned HTTP `201`. If every product attribute must have at least one option, add `min:1` validation. If empty attributes are valid, document that behavior in the contract.

### MEDIUM — Product discount value `0` is rejected

`PUT /products/{id}` with `discount_percentage=0` returned HTTP `422` (`must be at least 1`). The current API accepts values from 1 to 99. Confirm the business rule: if zero means “remove discount”, the update contract should allow `0` or `null`.

## Positive results

- Admin login with the supplied credentials: HTTP `200` and token issued.
- Invalid login credentials: HTTP `422` with validation message.
- Category parent/sub-category CRUD: passed.
- Category image upload: passed.
- Discount CRUD and duplicate-code validation: passed.
- Attribute and option CRUD: passed.
- Product CRUD and image upload: passed.
- Missing IDs return HTTP `404`.
- Validation errors generally return HTTP `422` with field-level errors.
- Logout invalidates the token logically; the post-logout request was rejected, but exposed the 500/trace issue above.

## Postman collection quality issues

- `base_url`, `version`, and `token` variables are empty.
- The sample `admin Login` email is `yes@team`, not the supplied admin account.
- Login/register requests contain reused or conflicting sample data.
- Several requests use hard-coded IDs (`1`, `2`, `3`, `5`, `6`, `10`), making runs order-dependent and unsafe against shared data.
- File parts reference `postman-cloud://` assets that are not available from the local collection file.
- The product request contains a field name with a trailing newline: `Gas Stoves & Built-in Hobs\n`.
- `shipping_info_en[1]` appears twice in the product payload.
- The built-in Postman test scripts are commented out for login/admin login.
- The collection does not include negative/security cases or cleanup scripts.

## Release recommendation

Do not connect the Admin project to this API until the two HIGH findings are fixed and regression-tested. Afterward, rerun the collection with dynamic IDs, environment variables, executable assertions, and teardown requests.
