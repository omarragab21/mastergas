# Website Feature Modules Report

## Scope

The Website views were moved from the shared `src/views/website` area into dedicated feature modules under `website/src/modules`.

Moved views:

- `HomeView.vue` — now owned by `src/modules/home`
- `AboutView.vue` — now owned by `src/modules/about`
- `ContactView.vue` — now owned by `src/modules/contact`
- `ProductsView.vue`
- `ProductDetailView.vue` — now owned by `src/modules/product/views`
- `OffersView.vue` — now owned by `src/modules/offers/views`
- `CartView.vue` — now owned by `src/modules/cart`
- `WishlistView.vue` — now owned by `src/modules/wishlist`
- `CheckoutView.vue` — now owned by `src/modules/checkout/views`
- `ProfileView.vue` — now owned by `src/modules/profile`
- `InvoiceView.vue` — now owned by `src/modules/invoice`
- `PaymentSuccessView.vue` — now owned by `src/modules/payment/views`
- `PaymentFailureView.vue` — now owned by `src/modules/payment/views`
- `PrivacyPolicyView.vue` — now owned by `src/modules/privacy`
- `TermsView.vue` — now owned by `src/modules/terms`
- `DynamicPageView.vue` — now owned by `src/modules/dynamic`

The old `src/views/website` directory is no longer used and has been removed.

## Routing and parent layout

- Website routes now lazy-load feature views from their dedicated modules: `home`, `about`, `contact`, `cart`, `wishlist`, `profile`, `invoice`, `privacy`, `terms`, `dynamic`, `product`, `offers`, `checkout`, and `payment`.
- `WebsiteLayout.vue` remains the parent layout and continues to render the nested Website route through its router outlet.
- The Website `/admin` route remains blocked by the existing routing guard and does not open the Admin application.
- Admin remains a separate Vue application on its own port and route tree.

## Logic preservation

- View contents and business behavior were copied without changing the existing Website flow.
- Relative imports were adjusted only for the new module locations; runtime behavior and visual markup were preserved.
- Catalog and order data now come from the authenticated Tijara Site API; the old local snapshot was removed.
- The Product Details view now handles an unknown product ID safely instead of reading `category_id` from `null`.
- Home category rendering is now composed through `src/modules/category`, including its carousel, service, composable, and styles.
- Development payment logging no longer sends requests to a missing `__terminal_log` endpoint by default. A custom endpoint can be enabled with `VITE_TERMINAL_LOG_ENDPOINT` or `window.__MASTERGAS_TERMINAL_LOG_ENDPOINT__`.

## Verification

- `npm --prefix website run typecheck` — passed.
- `npm --prefix website run lint` — passed with 48 existing warnings and no errors.
- `npm --prefix website run build` — passed.
- `npm --prefix website run test:unit` — passed: 3 checkout pricing tests.
- `npx playwright test tests/e2e/smoke.spec.js --config=playwright.config.js` — passed: Website/Admin routing smoke test.
- Browser smoke test — passed: 11 checks covering Home, About, Contact, Privacy, Terms, Dynamic not-found handling, Cart, Profile, Wishlist, Invoice, and the unauthenticated Wishlist guard.
- Browser checks covered HTTP 200 responses, rendered body content, no page errors, no console errors, and no 5xx responses for the tested flows.
- Mobile viewport smoke test — passed: Home, About, Contact, Cart, and Wishlist rendered without runtime errors or horizontal overflow at 390×844.
- Desktop screenshots were captured for the Home and Profile routes under `/tmp/mastergas-feature-modules-home.png` and `/tmp/mastergas-feature-modules-profile.png`.

## Legacy test note

The legacy repository-level `tests/aboutViewQA.test.js` still targets the separate root `src/views/website/AboutView.vue` path, so it is not a reliable assertion for the active Website app. The active routes now resolve from the feature modules listed above and are covered by the targeted Website checks.
