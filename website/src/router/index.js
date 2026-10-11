import { createRouter, createWebHistory } from 'vue-router';
import WebsiteLayout from '../components/WebsiteLayout.vue';
import NotFoundView from '../views/NotFoundView.vue';
import { getCustomerToken } from '../utils/customerSession.js';
import { trackPageView } from '../utils/metaPixel.js';

const routes = [
  {
    path: '/',
    component: WebsiteLayout,
    children: [
      { path: '', name: 'Home', component: () => import('../modules/home/views/HomeView.vue') },
      { path: 'products', name: 'StoreProducts', component: () => import('../modules/product/views/ProductsView.vue') },
      { path: 'offers', name: 'Offers', component: () => import('../modules/offers/views/OffersView.vue') },
      { path: 'cart', name: 'Cart', component: () => import('../modules/cart/views/CartView.vue'), meta: { requiresCustomerAuth: true } },
      { path: 'wishlist', name: 'Wishlist', component: () => import('../modules/wishlist/views/WishlistView.vue'), meta: { requiresCustomerAuth: true } },
      { path: 'checkout', name: 'Checkout', component: () => import('../modules/checkout/views/CheckoutView.vue'), meta: { requiresCustomerAuth: true } },
      { path: 'payment/success', name: 'PaymentSuccess', component: () => import('../modules/payment/views/PaymentSuccessView.vue'), meta: { requiresCustomerAuth: true } },
      { path: 'payment/failure', name: 'PaymentFailure', component: () => import('../modules/payment/views/PaymentFailureView.vue'), meta: { requiresCustomerAuth: true } },
      { path: 'about', name: 'About', component: () => import('../modules/about/views/AboutView.vue') },
      { path: 'contact', name: 'Contact', component: () => import('../modules/contact/views/ContactView.vue') },
      { path: 'product/:id', name: 'ProductDetail', component: () => import('../modules/product/views/ProductDetailView.vue') },
      { path: 'profile', name: 'Profile', component: () => import('../modules/profile/views/ProfileView.vue'), meta: { requiresCustomerAuth: true } },
      { path: 'invoice/:id', name: 'Invoice', component: () => import('../modules/invoice/views/InvoiceView.vue'), meta: { requiresCustomerAuth: true } },
      { path: 'privacy-policy', name: 'PrivacyPolicy', component: () => import('../modules/privacy/views/PrivacyPolicyView.vue') },
      { path: 'privacy', name: 'Privacy', component: () => import('../modules/privacy/views/PrivacyPolicyView.vue') },
      { path: 'page/privacy', name: 'PagePrivacy', component: () => import('../modules/privacy/views/PrivacyPolicyView.vue') },
      { path: 'page/privacy-policy', name: 'PagePrivacyPolicy', component: () => import('../modules/privacy/views/PrivacyPolicyView.vue') },
      { path: 'terms', name: 'Terms', component: () => import('../modules/terms/views/TermsView.vue') },
      { path: 'terms-and-conditions', name: 'TermsAndConditions', component: () => import('../modules/terms/views/TermsView.vue') },
      { path: 'page/terms', name: 'PageTerms', component: () => import('../modules/terms/views/TermsView.vue') },
      { path: 'page/terms-and-conditions', name: 'PageTermsAndConditions', component: () => import('../modules/terms/views/TermsView.vue') },
      { path: 'page/:id', name: 'Page', component: () => import('../modules/dynamic/views/DynamicPageView.vue') },
      { path: ':slug', name: 'DynamicPage', component: () => import('../modules/dynamic/views/DynamicPageView.vue') },
    ],
  },
  { path: '/admin', name: 'WebsiteAdminBlocked', component: NotFoundView },
  { path: '/admin/:pathMatch(.*)*', name: 'WebsiteAdminBlockedChild', component: NotFoundView },
  { path: '/:pathMatch(.*)*', name: 'WebsiteNotFound', component: NotFoundView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0, behavior: 'smooth' };
  },
});

router.beforeEach((to, from, next) => {
  const requiresCustomerAuth = to.matched.some(record => record.meta.requiresCustomerAuth);
  if (requiresCustomerAuth && !getCustomerToken()) {
    next({ path: '/', query: { openAuth: 'true', redirect: to.fullPath } });
  } else {
    next();
  }
});

router.afterEach((to) => {
  trackPageView({
    page_path: to.fullPath,
    page_title: to.name ? String(to.name) : document.title,
  });
});

export default router;
