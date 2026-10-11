# Website Feature Modules Report

## Scope

The requested Website pages are now isolated as independent feature modules. Their route URLs, templates, styles, API calls, auth guards, and existing fallback behavior were preserved.

## Modules

```text
src/modules/
├── about/views/AboutView.vue
├── cart/views/CartView.vue
├── contact/views/ContactView.vue
├── dynamic/views/DynamicPageView.vue
├── home/views/HomeView.vue
├── invoice/views/InvoiceView.vue
├── privacy/views/PrivacyPolicyView.vue
├── profile/views/ProfileView.vue
├── terms/views/TermsView.vue
└── wishlist/views/WishlistView.vue
```

Each module also exposes its view through a local `index.js` entry point.

## Routing changes

- `/` → `home`
- `/about` → `about`
- `/cart` → `cart`
- `/contact` → `contact`
- `/page/:id` and dynamic slugs → `dynamic`
- `/invoice/:id` → `invoice`
- `/privacy*` → `privacy`
- `/profile` → `profile`
- `/terms*` → `terms`
- `/wishlist` → `wishlist`

Product, Offers, Checkout, Payment, and Category routes continue using their existing feature modules.

## Preservation

- No UI redesign was made.
- Existing relative imports were adjusted only for the new module depth.
- Auth-protected routes remain protected.
- Local data behavior was not changed.

## Verification

- `npm run typecheck` — passed.
- `npm run lint` — passed with 48 warnings and no errors.
- `npm run build` — passed.
- `npx playwright test tests/e2e/smoke.spec.js --config=playwright.config.js` — passed.
- Direct Playwright browser smoke — passed across 11 checks, including public pages, protected pages with a local session, the Dynamic not-found state, and the unauthenticated Wishlist guard.
- Mobile viewport smoke — passed for Home, About, Contact, Cart, and Wishlist at 390×844 with no horizontal overflow.
