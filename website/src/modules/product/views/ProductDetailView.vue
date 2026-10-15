<template>
  <div class="product-detail-page mastergas-product-detail" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    
    <!-- 1. Breadcrumbs Section -->
    <div class="breadcrumb-section" v-if="product">
      <div class="container breadcrumb-container">
        <nav class="breadcrumb-flow" aria-label="breadcrumb">
          <router-link to="/" class="crumb-link">{{ t('nav.home') }}</router-link>
          <span class="crumb-separator" aria-hidden="true">
            <svg class="crumb-arrow-svg" width="4" height="7" viewBox="0 0 4 7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.59736 0.676858C3.51667 0.737802 3.2758 0.919755 3.13694 1.02812C2.85884 1.24516 2.48929 1.54171 2.12085 1.86161C1.75054 2.18313 1.38989 2.52089 1.12477 2.82095C0.991829 2.9714 0.890812 3.10357 0.825063 3.21264C0.763226 3.31521 0.750367 3.3758 0.750367 3.3758C0.750367 3.3758 0.763227 3.43462 0.825061 3.53719C0.890809 3.64625 0.991825 3.77842 1.12477 3.92888C1.38989 4.22893 1.75054 4.56669 2.12085 4.88821C2.4893 5.20811 2.85885 5.50467 3.13696 5.7217C3.27582 5.83007 3.51635 6.01177 3.59704 6.07271C3.7638 6.19553 3.79977 6.43053 3.67695 6.59729C3.55413 6.76405 3.31938 6.79968 3.15262 6.67686L3.15135 6.6759C3.06672 6.61198 2.81722 6.42353 2.67554 6.31296C2.39115 6.09103 2.0107 5.78581 1.62914 5.45453C1.24946 5.12487 0.860106 4.76204 0.562729 4.42548C0.41442 4.25763 0.281061 4.08748 0.182748 3.9244C0.0906402 3.77161 0 3.57816 0 3.37491C0 3.17165 0.0906433 2.97821 0.182751 2.82542C0.281064 2.66234 0.414422 2.49219 0.56273 2.32434C0.860105 1.98779 1.24945 1.62495 1.62914 1.29529C2.01068 0.964013 2.39113 0.658798 2.67552 0.436859C2.8173 0.326216 3.06681 0.137753 3.15127 0.0739647L3.15236 0.0731398C3.31912 -0.0496775 3.55411 -0.0142297 3.67692 0.152531C3.79974 0.319286 3.7641 0.554038 3.59736 0.676858Z" fill="#000000"/>
            </svg>
          </span>
          <router-link to="/products" class="crumb-link">{{ t('nav.products') }}</router-link>
          <span class="crumb-separator" aria-hidden="true">
            <svg class="crumb-arrow-svg" width="4" height="7" viewBox="0 0 4 7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.59736 0.676858C3.51667 0.737802 3.2758 0.919755 3.13694 1.02812C2.85884 1.24516 2.48929 1.54171 2.12085 1.86161C1.75054 2.18313 1.38989 2.52089 1.12477 2.82095C0.991829 2.9714 0.890812 3.10357 0.825063 3.21264C0.763226 3.31521 0.750367 3.3758 0.750367 3.3758C0.750367 3.3758 0.763227 3.43462 0.825061 3.53719C0.890809 3.64625 0.991825 3.77842 1.12477 3.92888C1.38989 4.22893 1.75054 4.56669 2.12085 4.88821C2.4893 5.20811 2.85885 5.50467 3.13696 5.7217C3.27582 5.83007 3.51635 6.01177 3.59704 6.07271C3.7638 6.19553 3.79977 6.43053 3.67695 6.59729C3.55413 6.76405 3.31938 6.79968 3.15262 6.67686L3.15135 6.6759C3.06672 6.61198 2.81722 6.42353 2.67554 6.31296C2.39115 6.09103 2.0107 5.78581 1.62914 5.45453C1.24946 5.12487 0.860106 4.76204 0.562729 4.42548C0.41442 4.25763 0.281061 4.08748 0.182748 3.9244C0.0906402 3.77161 0 3.57816 0 3.37491C0 3.17165 0.0906433 2.97821 0.182751 2.82542C0.281064 2.66234 0.414422 2.49219 0.56273 2.32434C0.860105 1.98779 1.24945 1.62495 1.62914 1.29529C2.01068 0.964013 2.39113 0.658798 2.67552 0.436859C2.8173 0.326216 3.06681 0.137753 3.15127 0.0739647L3.15236 0.0731398C3.31912 -0.0496775 3.55411 -0.0142297 3.67692 0.152531C3.79974 0.319286 3.7641 0.554038 3.59736 0.676858Z" fill="#000000"/>
            </svg>
          </span>
          <router-link :to="product.category_parent_id ? `/products?subcategory_id=${product.category_id}` : `/products?category_id=${product.category_id}`" class="crumb-link">
            {{ localized(product.category, 'name') || localizedValue(product.category) }}
          </router-link>
          <span class="crumb-separator" aria-hidden="true">
            <svg class="crumb-arrow-svg" width="4" height="7" viewBox="0 0 4 7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.59736 0.676858C3.51667 0.737802 3.2758 0.919755 3.13694 1.02812C2.85884 1.24516 2.48929 1.54171 2.12085 1.86161C1.75054 2.18313 1.38989 2.52089 1.12477 2.82095C0.991829 2.9714 0.890812 3.10357 0.825063 3.21264C0.763226 3.31521 0.750367 3.3758 0.750367 3.3758C0.750367 3.3758 0.763227 3.43462 0.825061 3.53719C0.890809 3.64625 0.991825 3.77842 1.12477 3.92888C1.38989 4.22893 1.75054 4.56669 2.12085 4.88821C2.4893 5.20811 2.85885 5.50467 3.13696 5.7217C3.27582 5.83007 3.51635 6.01177 3.59704 6.07271C3.7638 6.19553 3.79977 6.43053 3.67695 6.59729C3.55413 6.76405 3.31938 6.79968 3.15262 6.67686L3.15135 6.6759C3.06672 6.61198 2.81722 6.42353 2.67554 6.31296C2.39115 6.09103 2.0107 5.78581 1.62914 5.45453C1.24946 5.12487 0.860106 4.76204 0.562729 4.42548C0.41442 4.25763 0.281061 4.08748 0.182748 3.9244C0.0906402 3.77161 0 3.57816 0 3.37491C0 3.17165 0.0906433 2.97821 0.182751 2.82542C0.281064 2.66234 0.414422 2.49219 0.56273 2.32434C0.860105 1.98779 1.24945 1.62495 1.62914 1.29529C2.01068 0.964013 2.39113 0.658798 2.67552 0.436859C2.8173 0.326216 3.06681 0.137753 3.15127 0.0739647L3.15236 0.0731398C3.31912 -0.0496775 3.55411 -0.0142297 3.67692 0.152531C3.79974 0.319286 3.7641 0.554038 3.59736 0.676858Z" fill="#000000"/>
            </svg>
          </span>
          <span class="crumb-current">{{ localized(product, 'name') }}</span>
        </nav>
      </div>
    </div>

    <!-- Loading State -->
    <ProductDetailSkeleton v-if="loading" />

    <!-- 2. Product Main Section -->
    <div v-else-if="product" class="product-main-section">
      <div class="container main-section-container">
        
        <div class="product-grid-layout">
          
          <!-- Column 1 in RTL: Gallery Column (Right Side) -->
          <ProductGallery
            :product="product"
            :all-images="allImages"
            :current-image-index="currentImageIndex"
            :localized="localized"
            :handle-image-error="handleImageError"
            @open-lightbox="openLightbox"
            @select-image="currentImageIndex = $event"
          />

          <!-- Column 2 in RTL: Info Column (Left Side) -->
          <ProductInfoPanel
            :product="product"
            :locale="locale"
            :localized="localized"
            :localized-value="localizedValue"
            :computed-rating-count="computedRatingCount"
            :computed-average-rating="computedAverageRating"
            :format-price="formatPrice"
            :current-price="currentPrice"
            :currency="currency"
            :riyal-icon="riyalIcon"
            :product-features="productFeatures"
            :color-options="colorOptions"
            :selected-color-name="selectedColorName"
            :is-light-color="isLightColor"
            :selectable-attributes="selectableAttributes"
            :selected-attributes="selectedAttributes"
            :is-product-in-stock="isProductInStock"
            :quantity="quantity"
            :is-favorite="isFavorite"
            @open-share="showShareModal = true"
            @toggle-favorite="toggleFavorite"
            @select-color="selectColor"
            @select-attribute="selectAttribute($event.key, $event.value)"
            @update:quantity="quantity = $event"
            @add-to-cart="handleAddToCart"
          />
        </div>
      </div>
    </div>

    <!-- 3. Tabs Section (Full Width background #F8FAFC with borders) -->
      <ProductTabs
        :product="product"
        :tab-options="tabOptions"
        :active-tab="activeTab"
        :locale="locale"
        :dynamic-overview-title="dynamicOverviewTitle"
        :dynamic-overview-desc="dynamicOverviewDesc"
        :dynamic-overview-features="dynamicOverviewFeatures"
        :installation-items="installationItems"
        :shipping-items="shippingItems"
        :spec-rows="specRows"
        :is-color-spec="isColorSpec"
        :get-spec-colors-list="getSpecColorsList"
        :computed-average-rating="computedAverageRating"
        :computed-rating-count="computedRatingCount"
        :get-rating-percentage="getRatingPercentage"
        :display-reviews="displayReviews"
        :format-date="formatDate"
        :handle-add-review-click="handleAddReviewClick"
        @update:active-tab="activeTab = $event"
      />

    <!-- 4. Related Products Section -->
    <section class="related-products-section" v-if="relatedProducts.length > 0">
      <div class="container related-container">
        <div class="related-section-header">
          <h2 class="related-heading">{{ locale === 'ar' ? 'منتجات ذات صلة' : 'Related Products' }}</h2>
          <p class="related-subheading">{{ locale === 'ar' ? 'أجهزة مطابقة تكمل تصميم مطبخك الفاخر' : 'Compatible appliances to complete your luxury kitchen' }}</p>
        </div>
        <div class="related-products-grid">
          <product-card 
            v-for="p in relatedProducts" 
            :key="p.id" 
            :product="p" 
            @click="goToProduct(p)"
            @add-to-cart="addToCart"
          />
        </div>
      </div>
    </section>

    <!-- Lightbox Modal -->
    <ProductLightbox
      :visible="showLightbox"
      :all-images="allImages"
      :lightbox-index="lightboxIndex"
      :product="product"
      :handle-image-error="handleImageError"
      @close="closeLightbox"
      @next="nextLightbox"
      @prev="prevLightbox"
      @select="lightboxIndex = $event"
    />

    <ProductShareModal
      :visible="showShareModal"
      :link-copied="linkCopied"
      :share-to="shareTo"
      :copy-link="copyLink"
      @close="showShareModal = false"
    />

    <ProductReviewModal
      :visible="showAddReviewModal"
      :user="user"
      :review-form="reviewForm"
      :is-submitting-review="isSubmittingReview"
      :review-message="reviewMessage"
      :review-status="reviewStatus"
      :open-login-modal="openLoginModal"
      :submit-review="submitReview"
      @close="showAddReviewModal = false"
      @update-rating="reviewForm.rating = $event"
      @update-comment="reviewForm.comment = $event"
    />

  </div>
</template>

<script setup>
import { useProductDetail } from '../composables/useProductDetail';
import ProductGallery from '../components/ProductGallery.vue';
import ProductDetailSkeleton from '../../../components/skeleton/ProductDetailSkeleton.vue';
import ProductInfoPanel from '../components/ProductInfoPanel.vue';
import ProductTabs from '../components/ProductTabs.vue';
import ProductCard from '../components/ProductCard.vue';
import ProductLightbox from '../components/ProductLightbox.vue';
import ProductShareModal from '../components/ProductShareModal.vue';
import ProductReviewModal from '../components/ProductReviewModal.vue';
const { t, locale, product, relatedProducts, loading, localized, localizedValue, allImages, currentImageIndex, handleImageError, openLightbox, showLightbox, lightboxIndex, closeLightbox, nextLightbox, prevLightbox, showShareModal, linkCopied, shareTo, copyLink, user, reviewForm, isSubmittingReview, reviewMessage, reviewStatus, openLoginModal, submitReview, showAddReviewModal, tabOptions, activeTab, computedRatingCount, computedAverageRating, formatPrice, currentPrice, currency, riyalIcon, productFeatures, installationItems, shippingItems, colorOptions, selectedColorName, isLightColor, selectableAttributes, selectedAttributes, isProductInStock, isFavorite, toggleFavorite, selectColor, selectAttribute, quantity, handleAddToCart, addToCart, goToProduct, dynamicOverviewTitle, dynamicOverviewDesc, dynamicOverviewFeatures, specRows, isColorSpec, getSpecColorsList, getRatingPercentage, displayReviews, formatDate, handleAddReviewClick } = useProductDetail();
</script>

<style src="../styles/product-detail-layout.css"></style>
<style src="../styles/product-detail-tabs.css"></style>
<style src="../styles/product-detail-modals.css"></style>
