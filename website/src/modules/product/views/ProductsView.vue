<template>
  <div class="products-page" :dir="currentLang === 'ar' ? 'rtl' : 'ltr'">
    <!-- 1. Top Section: Breadcrumbs & Title (Container) -->
    <div class="container">
      <!-- Breadcrumbs -->
      <nav class="breadcrumb-flow" :aria-label="$t('common.breadcrumb')">
        <router-link to="/" class="crumb-link">{{ currentLang === 'ar' ? 'الرئيسية' : 'Home' }}</router-link>
        <span class="crumb-separator" aria-hidden="true">
          <svg class="crumb-arrow-svg" width="4" height="7" viewBox="0 0 4 7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.59736 0.676858C3.51667 0.737802 3.2758 0.919755 3.13694 1.02812C2.85884 1.24516 2.48929 1.54171 2.12085 1.86161C1.75054 2.18313 1.38989 2.52089 1.12477 2.82095C0.991829 2.9714 0.890812 3.10357 0.825063 3.21264C0.763226 3.31521 0.750367 3.3758 0.750367 3.3758C0.750367 3.3758 0.763227 3.43462 0.825061 3.53719C0.890809 3.64625 0.991825 3.77842 1.12477 3.92888C1.38989 4.22893 1.75054 4.56669 2.12085 4.88821C2.4893 5.20811 2.85885 5.50467 3.13696 5.7217C3.27582 5.83007 3.51635 6.01177 3.59704 6.07271C3.7638 6.19553 3.79977 6.43053 3.67695 6.59729C3.55413 6.76405 3.31938 6.79968 3.15262 6.67686L3.15135 6.6759C3.06672 6.61198 2.81722 6.42353 2.67554 6.31296C2.39115 6.09103 2.0107 5.78581 1.62914 5.45453C1.24946 5.12487 0.860106 4.76204 0.562729 4.42548C0.41442 4.25763 0.281061 4.08748 0.182748 3.9244C0.0906402 3.77161 0 3.57816 0 3.37491C0 3.17165 0.0906433 2.97821 0.182751 2.82542C0.281064 2.66234 0.414422 2.49219 0.56273 2.32434C0.860105 1.98779 1.24945 1.62495 1.62914 1.29529C2.01068 0.964013 2.39113 0.658798 2.67552 0.436859C2.8173 0.326216 3.06681 0.137753 3.15127 0.0739647L3.15236 0.0731398C3.31912 -0.0496775 3.55411 -0.0142297 3.67692 0.152531C3.79974 0.319286 3.7641 0.554038 3.59736 0.676858Z" fill="#000000"/>
          </svg>
        </span>
        <span class="crumb-current">{{ currentCategoryTitle || (currentLang === 'ar' ? 'المنتجات' : 'Products') }}</span>
      </nav>

      <!-- Page Title Row -->
      <div class="mockup-title-row">
        <h1 class="mockup-page-title">{{ currentCategoryTitle || (currentLang === 'ar' ? 'جميع منتجات' : 'All Products') }}</h1>
        <span v-if="loading && !products.length" class="sk-shimmer sk-line" style="width: 90px" role="status" aria-busy="true"></span>
        <span v-else class="mockup-count-badge">({{ totalProductsCount }} {{ currentLang === 'ar' ? 'منتج' : 'products' }})</span>
      </div>
    </div>

    <!-- 2. Full-width Results & Sorting Bar (100% edge-to-edge) -->
    <div class="mockup-results-bar-fullwidth">
      <div class="container bar-inner-content">
        <!-- Right side (in RTL): Results Count -->
 <div v-if="loading && !products.length" class="sk-shimmer sk-line" style="width: 200px" role="status" aria-busy="true"></div>
        <div v-else class="mockup-results-count">
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
        <ProductFiltersSidebar
          :loading="categoriesLoading"
          :categories="categories"
          :selected-category="selectedCategory"
          :total-all-count="totalAllCount"
          :current-lang="currentLang"
          :in-stock-only="inStockOnly"
          :has-discount-only="hasDiscountOnly"
          :italian-only="italianOnly"
          :localized="localized"
          :select-category="selectCategory"
          :toggle-in-stock="toggleInStock"
          :toggle-discount="toggleDiscount"
          :toggle-italian="toggleItalian"
        />
        <ProductResultsGrid
          :products="products"
          :loading="loading"
          :data-notice="dataNotice"
          :current-lang="currentLang"
          :current-page="currentPage"
          :per-page="perPage"
          :total-products-count="totalProductsCount"
          :total-pages="totalPages"
          @open-product="goToProduct"
          @add-to-cart="addProductToCart"
          @change-page="changePage"
        />
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { isCancelledRequest } from '../../../config/axios';
import ProductFiltersSidebar from '../components/ProductFiltersSidebar.vue';
import ProductResultsGrid from '../components/ProductResultsGrid.vue';
import { cartState } from '../../../store/cart';
import { useOffers } from '../composables/useOffers';
import { useLocalized } from '../../../composables/useLocalized';
import { useSEO } from '../../../composables/useSEO';
import { trackSearch } from '../../../utils/metaPixel';
import { productService } from '../services/productService';

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
const categoriesLoading = ref(true);
const dataNotice = ref('');
const totalCount = ref(0);
const allProductsCount = ref(0);
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
  return allProductsCount.value || totalCount.value || 0;
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

const addProductToCart = (product, quantity = 1, selectedAttributes = null) => {
  cartState.addToCart(product, quantity, selectedAttributes);
};

const changePage = (page) => {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  fetchProducts();
};

const fetchCategories = async () => {
  categoriesLoading.value = true;
  try {
    const list = await productService.getCategoriesWithProductCounts({ is_active: 1 });
    categories.value = Array.isArray(list) ? list : [];
    try {
      allProductsCount.value = await productService.getProductCount({ is_active: 1 });
    } catch (countError) {
      console.error('Failed to fetch all products count:', countError);
      allProductsCount.value = 0;
    }
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    categories.value = [];
  } finally {
    categoriesLoading.value = false;
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
    products.value = [];
    totalCount.value = 0;
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

<style src="../styles/products.css"></style>
