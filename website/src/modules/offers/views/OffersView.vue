<template>
  <div class="offers-page" :dir="currentLang === 'ar' ? 'rtl' : 'ltr'">
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
        <template v-if="currentOffer">
          <router-link to="/offers" @click.prevent="selectOffer(null)" class="crumb-link">
            {{ currentLang === 'ar' ? 'العروض والتخفيضات' : 'Offers & Discounts' }}
          </router-link>
          <span class="crumb-separator" aria-hidden="true">
            <svg class="crumb-arrow-svg" width="4" height="7" viewBox="0 0 4 7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.59736 0.676858C3.51667 0.737802 3.2758 0.919755 3.13694 1.02812C2.85884 1.24516 2.48929 1.54171 2.12085 1.86161C1.75054 2.18313 1.38989 2.52089 1.12477 2.82095C0.991829 2.9714 0.890812 3.10357 0.825063 3.21264C0.763226 3.31521 0.750367 3.3758 0.750367 3.3758C0.750367 3.3758 0.763227 3.43462 0.825061 3.53719C0.890809 3.64625 0.991825 3.77842 1.12477 3.92888C1.38989 4.22893 1.75054 4.56669 2.12085 4.88821C2.4893 5.20811 2.85885 5.50467 3.13696 5.7217C3.27582 5.83007 3.51635 6.01177 3.59704 6.07271C3.7638 6.19553 3.79977 6.43053 3.67695 6.59729C3.55413 6.76405 3.31938 6.79968 3.15262 6.67686L3.15135 6.6759C3.06672 6.61198 2.81722 6.42353 2.67554 6.31296C2.39115 6.09103 2.0107 5.78581 1.62914 5.45453C1.24946 5.12487 0.860106 4.76204 0.562729 4.42548C0.41442 4.25763 0.281061 4.08748 0.182748 3.9244C0.0906402 3.77161 0 3.57816 0 3.37491C0 3.17165 0.0906433 2.97821 0.182751 2.82542C0.281064 2.66234 0.414422 2.49219 0.56273 2.32434C0.860105 1.98779 1.24945 1.62495 1.62914 1.29529C2.01068 0.964013 2.39113 0.658798 2.67552 0.436859C2.8173 0.326216 3.06681 0.137753 3.15127 0.0739647L3.15236 0.0731398C3.31912 -0.0496775 3.55411 -0.0142297 3.67692 0.152531C3.79974 0.319286 3.7641 0.554038 3.59736 0.676858Z" fill="#000000"/>
            </svg>
          </span>
          <span class="crumb-current">{{ localized(currentOffer, 'name') || currentOffer.name }}</span>
        </template>
        <span v-else class="crumb-current">{{ currentLang === 'ar' ? 'العروض والتخفيضات' : 'Offers & Discounts' }}</span>
      </nav>

      <!-- Page Title Row -->
      <div class="mockup-title-row">
        <h1 class="mockup-page-title">
          {{ currentOffer ? (localized(currentOffer, 'name') || currentOffer.name) : (currentLang === 'ar' ? 'كافة العروض والتخفيضات' : 'All Offers & Discounts') }}
        </h1>
        <span class="mockup-count-badge">({{ filteredProducts.length }} {{ currentLang === 'ar' ? 'منتج' : 'products' }})</span>
      </div>
    </div>

    <!-- 2. Full-width Results & Sorting Bar (100% edge-to-edge) -->
    <div class="mockup-results-bar-fullwidth">
      <div class="container bar-inner-content">
        <!-- Right side (in RTL): Results Count -->
        <div class="mockup-results-count">
          {{ currentLang === 'ar' 
            ? `عرض ${paginatedProducts.length} من أصل ${filteredProducts.length} منتج متوفر` 
            : `Showing ${paginatedProducts.length} of ${filteredProducts.length} available products` 
          }}
        </div>

        <!-- Left side (in RTL): Sort Dropdown -->
        <div class="mockup-sort-group">
          <span class="mockup-sort-label">{{ currentLang === 'ar' ? 'ترتيب حسب:' : 'Sort by:' }}</span>
          <div class="mockup-sort-box">
            <select v-model="sortBy" class="mockup-sort-select">
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
        <OfferFiltersSidebar
          :current-lang="currentLang"
          :selected-offer-id="selectedOfferId"
          :offers="offers"
          :all-products="allProducts"
          :in-stock-only="inStockOnly"
          :has-discount-only="hasDiscountOnly"
          :italian-only="italianOnly"
          :localized="localized"
          :get-offer-count="getOfferCount"
          :select-offer="selectOffer"
          @toggle-in-stock="inStockOnly = !inStockOnly"
          @toggle-discount="hasDiscountOnly = !hasDiscountOnly"
          @toggle-italian="italianOnly = !italianOnly"
        />
        <OfferResultsGrid
          :current-lang="currentLang"
          :localized="localized"
          :current-offer="currentOffer"
          :loading="loading"
          :filtered-products="filteredProducts"
          :paginated-products="paginatedProducts"
          :current-page="currentPage"
          :total-pages="totalPages"
          @open-product="goToProduct"
          @add-to-cart="addOfferProductToCart"
          @change-page="changePage"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useSettings } from '../../../composables/useSettings';
import { useSEO } from '../../../composables/useSEO';
import OfferFiltersSidebar from '../components/OfferFiltersSidebar.vue';
import OfferResultsGrid from '../components/OfferResultsGrid.vue';
import { useOffersCatalog } from '../composables/useOffersCatalog';
import { cartState } from '../../../store/cart';

const { fetchSettings } = useSettings();
useSEO({
  title: 'العروض والتخفيضات الحصرية - متجر ماسترجاز Mastergas',
  description: 'استفد من أقوى العروض والتخفيضات الحصرية على أفران الغاز والمسطحات والشفاطات الإيطالية الفاخرة بأفضل الأسعار مع ضمان شامل.',
  keywords: 'عروض ماسترجاز, تخفيضات أفران غاز, خصومات بلت ان, عروض شوايات'
});

const {
  currentLang,
  localized,
  offers,
  allProducts,
  loading,
  selectedOfferId,
  currentPage,
  sortBy,
  inStockOnly,
  hasDiscountOnly,
  italianOnly,
  currentOffer,
  getOfferCount,
  filteredProducts,
  paginatedProducts,
  totalPages,
  selectOffer,
  goToProduct,
  changePage,
  resolveOfferFromQuery,
  fetchOffers,
  fetchProducts,
} = useOffersCatalog();

const addOfferProductToCart = (product) => {
  const offerId = Number(currentOffer.value?.id);
  cartState.addToCart(
    Number.isInteger(offerId) && offerId > 0
      ? { ...product, offer_id: offerId }
      : product
  );
};

onMounted(async () => {
  fetchSettings();
  resolveOfferFromQuery();
  try {
    await Promise.allSettled([fetchOffers(), fetchProducts()]);
  } finally {
    loading.value = false;
  }
  resolveOfferFromQuery();
});
</script>

<style src="../styles/offers.css"></style>
