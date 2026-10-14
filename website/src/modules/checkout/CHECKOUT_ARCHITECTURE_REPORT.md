# Checkout Module Architecture Report

## Scope

The checkout flow remains behaviorally unchanged. This module separates checkout state, API orchestration, reusable UI, and view-level flow coordination without changing the existing local-data testing mode.

## Module boundaries

```text
src/modules/checkout/
├── components/
│   └── CheckoutProgress.vue       # Step indicator UI
├── composables/
│   ├── useCheckoutCoupons.js       # Coupon validation and discount state
│   ├── useCheckoutData.js          # Address, location, settings, wallet data
│   └── useCheckoutTotals.js        # Totals, tax, shipping, wallet calculations
├── services/
│   └── checkoutService.js         # Checkout-specific API facade
├── store/
│   ├── checkoutDefaults.js        # Initial state and testing defaults
│   └── checkoutStore.js            # Pinia state for the checkout session
├── styles/
│   └── checkout.css                # Checkout-only stylesheet
├── views/
│   └── CheckoutView.vue             # Checkout page and flow orchestration
└── CHECKOUT_ARCHITECTURE_REPORT.md
```

`views/CheckoutView.vue` is now the flow orchestrator and is approximately 1,400 lines instead of carrying the original 4,000+ line template, logic, and stylesheet in one file. Its remaining template is intentionally kept together for now to preserve the existing Figma markup and event bindings while the state and side effects live in the module boundaries above.

## State management decision

Pinia is used for checkout state because it is the standard Vue 3 state-management solution and gives the flow one reactive source of truth. Cart and authentication remain in their existing stores. Derived values such as totals and review labels stay in composables/view logic so the store does not become a second business-logic layer.

## Service boundary

`checkoutService` owns checkout API orchestration and delegates to the existing `authService`, `couponService`, `orderService`, and `settingsService`. Components and the view should not add new direct API calls.

## Validation baseline

- Desktop viewport: checkout opened, required-field validation blocked incomplete address, address advanced to payment, payment advanced to review.
- Mobile viewport: same flow passed.
- Console errors: none observed.
- Page identity: `http://127.0.0.1:5173/checkout`, title `ماسترجاز | Mastergas`.
- Local catalog mode was removed; checkout now submits the Tijara Site order contract.

## Final verification

```text
npm --prefix website run typecheck  PASS
npm --prefix website run lint       PASS (warnings only; no errors)
npm --prefix website run build      PASS
npm --prefix website run test       PASS (3 unit + 1 E2E)
```

The targeted Playwright regression was also run after the refactor at desktop `1280x900` and mobile `390x844`. It verified address validation, address-to-payment navigation, payment-to-review navigation, page identity, summary rendering, and zero browser console errors.

## Logic preservation

The original checkout calculations, idempotency handling, PayTabs flow, address fallbacks, local-data behavior, and cart cleanup flow were retained. Direct checkout API calls were moved behind `checkoutService`; the existing `orderService`, `couponService`, `authService`, and `settingsService` remain the lower-level API layer.

The store is reset when the checkout route is unmounted, preserving the original view-scoped lifecycle while still providing a single reactive state source during the flow.

## Current module verification

- The route now lazy-loads `modules/checkout/views/CheckoutView.vue` directly.
- `npm run typecheck` — passed.
- `npm run lint` — passed with warnings only and no errors.
- `npm run build` — passed.
- Browser QA opened the authenticated Checkout flow with a test cart and observed zero console/page errors.
- Screenshot evidence: `/tmp/mastergas-modules-checkout.png`.
