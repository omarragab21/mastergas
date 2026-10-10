import { createRouter, createWebHistory } from 'vue-router';
import WebsiteLayout from '../components/WebsiteLayout.vue';
import HomeView from '../views/website/HomeView.vue';
import NotFoundView from '../views/NotFoundView.vue';
import { getCustomerToken } from '../utils/customerSession.js';
import { trackPageView } from '../utils/metaPixel.js';
import { setRouter } from '../config/axios.js';

const routes = [
  {
    path: '/',
    component: WebsiteLayout,
    children: [
      { path: '', name: 'Home', component: HomeView },
      { path: 'products', name: 'StoreProducts', component: () => import('../views/website/ProductsView.vue') },
      { path: 'offers', name: 'Offers', component: () => import('../views/website/OffersView.vue') },
      { path: 'cart', name: 'Cart', component: () => import('../views/website/CartView.vue'), meta: { requiresCustomerAuth: true } },
      { path: 'wishlist', name: 'Wishlist', component: () => import('../views/website/WishlistView.vue'), meta: { requiresCustomerAuth: true } },
      { path: 'checkout', name: 'Checkout', component: () => import('../views/website/CheckoutView.vue'), meta: { requiresCustomerAuth: true } },
      { path: 'payment/success', name: 'PaymentSuccess', component: () => import('../views/website/PaymentSuccessView.vue'), meta: { requiresCustomerAuth: true } },
      { path: 'payment/failure', name: 'PaymentFailure', component: () => import('../views/website/PaymentFailureView.vue'), meta: { requiresCustomerAuth: true } },
      { path: 'about', name: 'About', component: () => import('../views/website/AboutView.vue') },
      { path: 'contact', name: 'Contact', component: () => import('../views/website/ContactView.vue') },
      { path: 'product/:id', name: 'ProductDetail', component: () => import('../views/website/ProductDetailView.vue') },
      { path: 'profile', name: 'Profile', component: () => import('../views/website/ProfileView.vue'), meta: { requiresCustomerAuth: true } },
      { path: 'invoice/:id', name: 'Invoice', component: () => import('../views/website/InvoiceView.vue'), meta: { requiresCustomerAuth: true } },
      { path: 'privacy-policy', name: 'PrivacyPolicy', component: () => import('../views/website/PrivacyPolicyView.vue') },
      { path: 'privacy', name: 'Privacy', component: () => import('../views/website/PrivacyPolicyView.vue') },
      { path: 'page/privacy', name: 'PagePrivacy', component: () => import('../views/website/PrivacyPolicyView.vue') },
      { path: 'page/privacy-policy', name: 'PagePrivacyPolicy', component: () => import('../views/website/PrivacyPolicyView.vue') },
      { path: 'terms', name: 'Terms', component: () => import('../views/website/TermsView.vue') },
      { path: 'terms-and-conditions', name: 'TermsAndConditions', component: () => import('../views/website/TermsView.vue') },
      { path: 'page/terms', name: 'PageTerms', component: () => import('../views/website/TermsView.vue') },
      { path: 'page/terms-and-conditions', name: 'PageTermsAndConditions', component: () => import('../views/website/TermsView.vue') },
      { path: 'page/:id', name: 'Page', component: () => import('../views/website/DynamicPageView.vue') },
      { path: ':slug', name: 'DynamicPage', component: () => import('../views/website/DynamicPageView.vue') },
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

setRouter(router);
if (typeof window !== 'undefined') window.__appRouter = router;

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
