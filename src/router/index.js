import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import AppLayout from '../components/AppLayout.vue';
import WebsiteLayout from '../components/WebsiteLayout.vue';
import HomeView from '../views/website/HomeView.vue';
import { getCustomerToken } from '../utils/customerSession.js';

const routes = [
  // Website Routes
  {
    path: '/',
    component: WebsiteLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: HomeView,
      },
      {
        path: 'products',
        name: 'StoreProducts',
        component: () => import('../views/website/ProductsView.vue'),
      },
      {
        path: 'offers',
        name: 'Offers',
        component: () => import('../views/website/OffersView.vue'),
      },
      {
        path: 'cart',
        name: 'Cart',
        component: () => import('../views/website/CartView.vue'),
      },
      {
        path: 'wishlist',
        name: 'Wishlist',
        component: () => import('../views/website/WishlistView.vue'),
      },
      {
        path: 'checkout',
        name: 'Checkout',
        component: () => import('../views/website/CheckoutView.vue'),
      },
      {
        path: 'payment/success',
        name: 'PaymentSuccess',
        component: () => import('../views/website/PaymentSuccessView.vue'),
      },
      {
        path: 'payment/failure',
        name: 'PaymentFailure',
        component: () => import('../views/website/PaymentFailureView.vue'),
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('../views/website/AboutView.vue'),
      },
      {
        path: 'contact',
        name: 'Contact',
        component: () => import('../views/website/ContactView.vue'),
      },
      {
        path: 'product/:id',
        name: 'ProductDetail',
        component: () => import('../views/website/ProductDetailView.vue'),
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/website/ProfileView.vue'),
        meta: { requiresCustomerAuth: true },
      },
      {
        path: 'invoice/:id',
        name: 'Invoice',
        component: () => import('../views/website/InvoiceView.vue'),
        meta: { requiresCustomerAuth: true },
      },
      {
        path: 'page/:id',
        name: 'Page',
        component: () => import('../views/website/DynamicPageView.vue'),
      },
      {
        path: ':slug',
        name: 'DynamicPage',
        component: () => import('../views/website/DynamicPageView.vue'),
      },
    ],
  },
  
  // Admin Login
  {
    path: '/admin/login',
    name: 'Login',
    component: LoginView,
  },

  // Admin Dashboard Routes
  {
    path: '/admin',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/DashboardView.vue'),
      },
      { path: 'categories', name: 'Categories', component: () => import('../views/CategoriesView.vue') },
      { path: 'brands', name: 'Brands', component: () => import('../views/BrandsView.vue') },

      { path: 'attributes', name: 'Attributes', component: () => import('../views/AttributesView.vue') },
      { path: 'products', name: 'Products', component: () => import('../views/ProductsView.vue') },
      { path: 'data-feeds', name: 'DataFeeds', component: () => import('../views/DataFeedsView.vue') },
      { path: 'orders', name: 'Orders', component: () => import('../views/OrdersView.vue') },
      { path: 'returns', name: 'Returns', component: () => import('../views/ReturnsView.vue') },
      { path: 'dynamic-pages', name: 'DynamicPages', component: () => import('../views/DynamicPagesView.vue') },
      { path: 'reviews', name: 'Reviews', component: () => import('../views/ReviewsView.vue') },
      { path: 'customers', name: 'Customers', component: () => import('../views/CustomersView.vue') },
      { path: 'coupons', name: 'Coupons', component: () => import('../views/CouponsView.vue') },
      { path: 'discounts', name: 'Discounts', component: () => import('../views/DiscountsView.vue') },
      { path: 'payments', name: 'Payments', component: () => import('../views/PaymentsView.vue') },
      { path: 'collector', name: 'Collector', component: () => import('../views/DeliveryManagementView.vue') },
      { path: 'driver-notifications', name: 'DriverNotifications', component: () => import('../views/DashboardView.vue') },
      { path: 'messages', name: 'Messages', component: () => import('../views/MessagesView.vue') },
      { path: 'admins', name: 'Admins', component: () => import('../views/AdminsView.vue') },
      { path: 'sliders', name: 'Sliders', component: () => import('../views/SlidersView.vue') },
      { path: 'branches', name: 'Branches', component: () => import('../views/BranchesView.vue') },
      { path: 'topics', name: 'Topics', component: () => import('../views/TopicsView.vue') },
      { path: 'permissions', name: 'Permissions', component: () => import('../views/PermissionsView.vue') },
      { path: 'accounts', name: 'Accounts', component: () => import('../views/AccountsView.vue') },
      { path: 'countries', name: 'Countries', component: () => import('../views/CountriesView.vue') },
      { path: 'cities', name: 'Cities', component: () => import('../views/CitiesView.vue') },
      { path: 'city-shipping-rates', name: 'CityShippingRates', component: () => import('../views/CityShippingRatesView.vue') },
      { path: 'articles', name: 'Articles', component: () => import('../views/DashboardView.vue') },
      { path: 'activity-log', name: 'ActivityLog', component: () => import('../views/ActivityLogsView.vue') },
      { path: 'settings', name: 'Settings', component: () => import('../views/SettingsView.vue') },
    ],
  },

  // Catch-all for undefined routes - redirect to Home
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, behavior: 'smooth' };
    }
  }
});

import { trackPageView } from '../utils/metaPixel';
import { setRouter } from '../config/axios';

setRouter(router);
if (typeof window !== 'undefined') {
  window.__appRouter = router;
}

// Auth Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const customerToken = getCustomerToken();
  const isAdminPath = to.path.startsWith('/admin');

  if (to.meta.requiresCustomerAuth && !customerToken) {
    next({ path: '/', query: { openAuth: 'true' } });
  } else if (isAdminPath && to.meta.requiresAuth && !token && to.name !== 'Login') {
    next('/admin/login');
  } else if (to.name === 'Login' && token) {
    next('/admin/dashboard');
  } else {
    next();
  }
});

// Meta Pixel Automatic PageView Tracking Guard for all screens
router.afterEach((to, from) => {
  trackPageView({
    page_path: to.fullPath,
    page_title: to.name ? String(to.name) : document.title,
  });
});

export default router;
