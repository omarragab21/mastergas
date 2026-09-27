<template>
  <div class="products-page" :dir="currentLang === 'ar' ? 'rtl' : 'ltr'">
    <!-- 1. Top Section: Breadcrumbs & Title (Container) -->
    <div class="container">
      <!-- Breadcrumbs -->
      <nav class="mockup-breadcrumbs">
        <router-link to="/">{{ currentLang === 'ar' ? 'الرئيسية' : 'Home' }}</router-link>
        <span class="mockup-sep">›</span>
        <span class="mockup-current">{{ currentLang === 'ar' ? 'المنتجات' : 'Products' }}</span>
      </nav>

      <!-- Page Title Row -->
      <div class="mockup-title-row">
        <h1 class="mockup-page-title">{{ currentCategoryTitle || (currentLang === 'ar' ? 'جميع منتجات' : 'All Products') }}</h1>
        <span class="mockup-count-badge">({{ totalProductsCount }} {{ currentLang === 'ar' ? 'منتج' : 'products' }})</span>
      </div>
    </div>

    <!-- 2. Full-width Results & Sorting Bar (100% edge-to-edge) -->
    <div class="mockup-results-bar-fullwidth">
      <div class="container bar-inner-content">
        <!-- Right side (in RTL): Results Count -->
        <div class="mockup-results-count">
          {{ currentLang === 'ar' 
            ? `عرض ${products.length} من أصل ${totalProductsCount} منتج متوفر` 
            : `Showing ${products.length} of ${totalProductsCount} available products` 
          }}
        </div>

        <!-- Left side (in RTL): Sort Dropdown -->
        <div class="mockup-sort-group">
          <span class="mockup-sort-label">{{ currentLang === 'ar' ? 'ترتيب حسب:' : 'Sort by:' }}</span>
          <div class="mockup-sort-box">
            <select v-model="sortBy" class="mockup-sort-select" @change="changeSort">
              <option value="relevant">{{ currentLang === 'ar' ? 'الأكثر ملائمة' : 'Most Relevant' }}</option>
              <option value="price_asc">{{ currentLang === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High' }}</option>
              <option value="price_desc">{{ currentLang === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low' }}</option>
              <option value="newest">{{ currentLang === 'ar' ? 'الأحدث' : 'Newest' }}</option>
            </select>
            <svg class="mockup-sort-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Content Layout: Sidebar + Grid (Container) -->
    <div class="container">
      <div class="mockup-content-layout">
        <!-- Sidebar Filters Card (Right in RTL) -->
        <aside class="mockup-sidebar">
          <div class="sidebar-card">
            <!-- Sidebar Header -->
            <div class="sidebar-header">
              <span class="sidebar-title">{{ currentLang === 'ar' ? 'تصفية النتائج' : 'Filter Results' }}</span>
              <svg class="sidebar-funnel-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </div>

            <div class="sidebar-divider"></div>

            <!-- Categories Radio List -->
            <div class="sidebar-radio-list">
              <!-- All categories option -->
              <label class="sidebar-radio-item" :class="{ active: selectedCategory === null }" @click="selectCategory(null)">
                <div class="radio-main-col">
                  <span class="custom-radio" :class="{ checked: selectedCategory === null }">
                    <span class="radio-inner-dot" v-if="selectedCategory === null"></span>
                  </span>
                  <span class="radio-title">{{ currentLang === 'ar' ? 'كافة التصنيفات' : 'All Categories' }}</span>
                </div>
                <span class="radio-counter">({{ totalAllCount }})</span>
              </label>

              <!-- Dynamic Categories from Database -->
              <label 
                v-for="cat in categories" 
                :key="cat.id" 
                class="sidebar-radio-item" 
                :class="{ active: selectedCategory === cat.id }"
                @click="selectCategory(cat.id)"
              >
                <div class="radio-main-col">
                  <span class="custom-radio" :class="{ checked: selectedCategory === cat.id }">
                    <span class="radio-inner-dot" v-if="selectedCategory === cat.id"></span>
                  </span>
                  <span class="radio-title">{{ localized(cat, 'name') }}</span>
                </div>
                <span class="radio-counter">({{ cat.products_count ?? 0 }})</span>
              </label>
            </div>

            <div class="sidebar-divider"></div>

            <!-- Additional Options Checkboxes Section -->
            <div class="sidebar-section-heading">
              {{ currentLang === 'ar' ? 'خيارات إضافية' : 'Additional Options' }}
            </div>

            <div class="sidebar-checkbox-list">
              <!-- 1. In Stock -->
              <label class="sidebar-checkbox-item" @click="toggleInStock">
                <span class="custom-checkbox" :class="{ checked: inStockOnly }">
                  <svg v-if="inStockOnly" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span class="checkbox-text">{{ currentLang === 'ar' ? 'متوفر في المخزون' : 'In Stock' }}</span>
              </label>

              <!-- 2. Discounts & Offers -->
              <label class="sidebar-checkbox-item" @click="toggleDiscount">
                <span class="custom-checkbox" :class="{ checked: hasDiscountOnly }">
                  <svg v-if="hasDiscountOnly" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span class="checkbox-text">{{ currentLang === 'ar' ? 'عروض وتخفيضات' : 'Offers & Discounts' }}</span>
              </label>

              <!-- 3. Italian Made -->
              <label class="sidebar-checkbox-item" @click="toggleItalian">
                <span class="custom-checkbox" :class="{ checked: italianOnly }">
                  <svg v-if="italianOnly" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span class="checkbox-text">{{ currentLang === 'ar' ? 'صناعة إيطالية' : 'Made in Italy' }}</span>
              </label>
            </div>
          </div>
        </aside>

        <!-- Main Products Column (Left in RTL) -->
        <main class="mockup-main-column">
          <div v-if="dataNotice" class="catalog-data-notice" role="status">{{ dataNotice }}</div>
          <!-- Loading State -->
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>{{ $t('common.loading') }}</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="products.length === 0" class="empty-results-box">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h3>{{ $t('products.no_products') }}</h3>
            <p>{{ $t('products.no_products_hint') }}</p>
          </div>

          <!-- 3x3 Products Grid -->
          <div v-else class="mockup-products-grid">
            <product-card 
              v-for="product in products" 
              :key="product.id" 
              :product="product" 
              @click="goToProduct(product)"
              @add-to-cart="cartState.addToCart(product)"
            />
          </div>

          <!-- Bottom Pagination Bar -->
          <div class="mockup-pagination-row" v-if="products.length > 0">
            <!-- Left in RTL: Counter -->
            <div class="pagination-info-text">
              {{ currentLang === 'ar' 
                ? `عرض ${(currentPage - 1) * perPage + 1}-${Math.min(currentPage * perPage, totalProductsCount)} من ${totalProductsCount} منتج` 
                : `Showing ${(currentPage - 1) * perPage + 1}-${Math.min(currentPage * perPage, totalProductsCount)} of ${totalProductsCount} products` 
              }}
            </div>

            <!-- Right in RTL: Numbered page controls -->
            <div class="pagination-buttons-group" v-if="totalPages > 1">
              <button class="pag-btn pag-arrow" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
                <span>›</span>
              </button>
              <button 
                v-for="p in totalPages" 
                :key="p" 
                class="pag-btn pag-number" 
                :class="{ active: currentPage === p }" 
                @click="changePage(p)"
              >
                {{ p }}
              </button>
              <button class="pag-btn pag-arrow" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
                <span>‹</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { isCancelledRequest } from '../../config/axios';
import ProductCard from '../../components/ProductCard.vue';
import { cartState } from '../../store/cart';
import { useOffers } from '../../composables/useOffers';
import { useLocalized } from '../../composables/useLocalized';
import { useSEO } from '../../composables/useSEO';
import { trackSearch } from '../../utils/metaPixel';
import { productService } from '../../services/productService';
import { products as fallbackProducts, categories as fallbackCategories } from '../../data/catalogData';

const router = useRouter();
const route = useRoute();

const { localized, currentLang } = useLocalized();
const { fetchOffers } = useOffers();

useSEO({
  title: 'كافة المنتجات والأجهزة الإيطالية - متجر ماسترجاز Mastergas',
  description: 'تصفح تشكيلة فاخرة من أفران ومواقد الغاز والمسطحات والشفاطات الإيطالية الأصلية 100% مع ضمان سنتين وتوصيل لكافة مدن المملكة العربية السعودية.',
  keywords: 'أفران غاز إيطالية, مواقد بلت إن, مسطح غاز, شفاط مطبخ, ماسترجاز السعودية'
});

// State
const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const dataNotice = ref('');
const totalCount = ref(0);
const totalPages = ref(1);
const currentPage = ref(1);
const perPage = ref(9);
const sortBy = ref('relevant');

// Filters
const selectedCategory = ref(null);
const inStockOnly = ref(false);
const hasDiscountOnly = ref(false);
const italianOnly = ref(false);

const totalAllCount = computed(() => {
  if (categories.value && categories.value.length) {
    const categoryTotal = categories.value.reduce((acc, c) => acc + (Number(c.products_count) || 0), 0);
    return categoryTotal || totalCount.value || 0;
  }
  return totalCount.value || 0;
});

const totalProductsCount = computed(() => {
  return totalCount.value || 0;
});

const currentCategoryTitle = computed(() => {
  if (selectedCategory.value) {
    const cat = categories.value.find(c => c.id === selectedCategory.value);
    if (cat) return localized(cat, 'name');
  }
  return null;
});

const selectCategory = (catId) => {
  selectedCategory.value = catId;
  currentPage.value = 1;
  fetchProducts();
};

const toggleInStock = () => {
  inStockOnly.value = !inStockOnly.value;
  currentPage.value = 1;
  fetchProducts();
};

const toggleDiscount = () => {
  hasDiscountOnly.value = !hasDiscountOnly.value;
  currentPage.value = 1;
  fetchProducts();
};

const toggleItalian = () => {
  italianOnly.value = !italianOnly.value;
  currentPage.value = 1;
  fetchProducts();
};

const changeSort = () => {
  currentPage.value = 1;
  fetchProducts();
};

const goToProduct = (product) => {
  router.push(`/product/${product.id}`);
};

const changePage = (page) => {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  fetchProducts();
};

const fetchCategories = async () => {
  try {
    const list = await productService.getCategories();
    categories.value = Array.isArray(list) && list.length > 0 ? list : fallbackCategories;
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    categories.value = fallbackCategories;
  }
};

let requestController = null;
let requestSequence = 0;

const fetchProducts = async () => {
  requestController?.abort();
  const controller = new AbortController();
  requestController = controller;
  const sequence = ++requestSequence;
  loading.value = true;
  dataNotice.value = '';

  try {
    const rawSearch = String(route.query.search || route.query.q || route.query.keyword || '').trim();
    if (rawSearch.length === 1) {
      products.value = [];
      totalCount.value = 0;
      totalPages.value = 1;
      loading.value = false;
      return;
    }
    const params = {
      page: currentPage.value,
      per_page: perPage.value,
      category_id: selectedCategory.value || undefined,
      sort_by: sortBy.value,
      in_stock: inStockOnly.value ? 1 : 0,
      has_discount: hasDiscountOnly.value ? 1 : undefined,
      has_offer: hasDiscountOnly.value ? 1 : undefined,
      origin: italianOnly.value ? 'Italy' : undefined,
      is_active: 1
    };

    if (rawSearch.length >= 2) params.search = rawSearch;

    const result = await productService.getProducts(params, { signal: controller.signal });
    if (sequence !== requestSequence || controller.signal.aborted) return;
    products.value = result.items;
    totalCount.value = result.total;
    totalPages.value = Math.max(1, result.last_page || 1);
    currentPage.value = result.current_page || currentPage.value;
    if (result.stale) {
      dataNotice.value = currentLang.value === 'ar'
        ? 'تعذر تحديث الكتالوج. نعرض آخر بيانات ناجحة.'
        : 'The catalog could not be refreshed. Showing the last successful data.';
    }

    if (rawSearch.length >= 2) {
      trackSearch(rawSearch);
    }
  } catch (err) {
    if (isCancelledRequest(err) || controller.signal.aborted || sequence !== requestSequence) return;
    console.error('Failed to fetch products:', err);
    products.value = fallbackProducts;
    totalCount.value = fallbackProducts.length;
    totalPages.value = 1;
    dataNotice.value = currentLang.value === 'ar'
      ? 'تعذر تحميل المنتجات. تحقق من الاتصال وحاول مرة أخرى.'
      : 'Products could not be loaded. Check your connection and try again.';
  } finally {
    if (sequence === requestSequence) loading.value = false;
  }
};

let routeSearchTimeout = null;
watch(() => [route.query.category_id, route.query.search, route.query.q, route.query.keyword, route.query.page, route.query.sort_by], () => {
  selectedCategory.value = route.query.category_id ? parseInt(route.query.category_id, 10) : null;
  currentPage.value = route.query.page ? Math.max(1, parseInt(route.query.page, 10) || 1) : 1;
  sortBy.value = route.query.sort_by || 'relevant';
  clearTimeout(routeSearchTimeout);
  const hasSearchQuery = Boolean(route.query.search || route.query.q || route.query.keyword);
  routeSearchTimeout = setTimeout(fetchProducts, hasSearchQuery ? 300 : 0);
}, { immediate: true });

onMounted(async () => {
  if (route.query.category_id) {
    selectedCategory.value = parseInt(route.query.category_id, 10);
  }
  await Promise.allSettled([fetchCategories(), fetchOffers()]);
});

onUnmounted(() => {
  requestController?.abort();
  clearTimeout(routeSearchTimeout);
});
</script>

<style scoped>
.products-page {
  padding-top: 145px;
  padding-bottom: 80px;
  background-color: #ffffff;
  min-height: 100vh;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 1. Breadcrumbs */
.mockup-breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: #94a3b8;
  margin-bottom: 14px;
}

.mockup-breadcrumbs a {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.15s ease;
}

.mockup-breadcrumbs a:hover {
  color: #111827;
}

.mockup-sep {
  color: #cbd5e1;
  font-size: 13px;
}

.mockup-current {
  color: #475569;
  font-weight: 500;
}

/* 2. Page Title Row */
.mockup-title-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 20px;
}

.mockup-page-title {
  font-size: 26px;
  font-weight: 800;
  color: #111827;
  margin: 0;
  letter-spacing: -0.3px;
}

.mockup-count-badge {
  font-size: 15px;
  font-weight: 500;
  color: #64748b;
}

/* 3. Full-width Results & Sorting Bar */
.mockup-results-bar-fullwidth {
  width: 100%;
  background-color: #f8fafc;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 26px;
}

.bar-inner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 11px;
  padding-bottom: 11px;
}

.mockup-results-count {
  font-size: 13px;
  color: #64748b;
  font-weight: 400;
}

.mockup-sort-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mockup-sort-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 400;
}

.mockup-sort-box {
  position: relative;
  display: inline-flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 5px 12px;
  transition: border-color 0.2s;
}

.mockup-sort-box:hover {
  border-color: #cbd5e1;
}

.mockup-sort-select {
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 12.5px;
  font-weight: 500;
  color: #111827;
  cursor: pointer;
  padding-inline-end: 18px;
}

.mockup-sort-chevron {
  position: absolute;
  inset-inline-end: 8px;
  pointer-events: none;
  stroke: #64748b;
}

/* 4. Two-Column Content Layout */
.mockup-content-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
  align-items: start;
}

/* Sidebar Filters */
.mockup-sidebar {
  width: 100%;
}

.sidebar-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.sidebar-funnel-icon {
  stroke: #111827;
}

.sidebar-divider {
  height: 1px;
  background-color: #f1f5f9;
  margin: 16px 0;
}

/* Radio List */
.sidebar-radio-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-radio-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
}

.radio-main-col {
  display: flex;
  align-items: center;
  gap: 10px;
}

.custom-radio {
  width: 17px;
  height: 17px;
  border-radius: 50%;
  border: 1.5px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  background: #ffffff;
}

.custom-radio.checked {
  border-color: #000000;
  border-width: 2px;
}

.radio-inner-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #000000;
}

.radio-title {
  font-size: 13.5px;
  color: #334155;
  font-weight: 500;
  transition: color 0.15s ease;
}

.sidebar-radio-item.active .radio-title {
  font-weight: 700;
  color: #000000;
}

.radio-counter {
  font-size: 12.5px;
  color: #94a3b8;
  font-weight: 400;
}

/* Additional Options Heading */
.sidebar-section-heading {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 14px;
}

/* Checkbox List */
.sidebar-checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-checkbox-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.custom-checkbox {
  width: 17px;
  height: 17px;
  border: 1.5px solid #cbd5e1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: #ffffff;
  flex-shrink: 0;
}

.custom-checkbox.checked {
  background: #000000;
  border-color: #000000;
  color: #ffffff;
}

.checkbox-text {
  font-size: 13.5px;
  color: #334155;
  font-weight: 500;
}

/* Main Products Area */
.mockup-main-column {
  display: flex;
  flex-direction: column;
}

.catalog-data-notice {
  margin-bottom: 16px;
  padding: 10px 14px;
  border: 1px solid #fde68a;
  border-radius: 8px;
  background: #fffbeb;
  color: #92400e;
  font-size: 13px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 16px;
  color: #64748b;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #f1f5f9;
  border-top-color: #111827;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-results-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
  text-align: center;
  color: #64748b;
  gap: 10px;
}

.mockup-products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* Bottom Pagination Row */
.mockup-pagination-row {
  margin-top: 36px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination-info-text {
  font-size: 13px;
  color: #64748b;
  font-weight: 400;
}

.pagination-buttons-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pag-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
}

.pag-btn:hover:not(:disabled) {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.pag-btn.active {
  background: #000000;
  color: #ffffff;
  border-color: #000000;
  font-weight: 700;
}

.pag-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pag-arrow {
  font-size: 16px;
  line-height: 1;
  color: #64748b;
}

.pag-ellipsis {
  padding: 0 4px;
  color: #94a3b8;
  font-size: 13px;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .products-page {
    padding-top: 25px;
  }
  .mockup-content-layout {
    grid-template-columns: 1fr;
  }
  .mockup-products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .mockup-products-grid {
    grid-template-columns: 1fr;
  }
  .bar-inner-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .mockup-pagination-row {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }
}
</style>
