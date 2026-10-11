<template>
        <!-- Main Products Column (Left in RTL) -->
        <main class="mockup-main-column">
          <!-- Selected Offer Spotlight Card -->
          <div class="mockup-offer-banner" v-if="currentOffer">
            <div class="banner-bg-img" :style="{ backgroundImage: `url(${currentOffer.image})` }"></div>
            <div class="banner-gradient-overlay"></div>
            <div class="banner-content">
              <span class="banner-badge-pill">
                {{ currentOffer.badgeText || (currentOffer.value ? (currentLang === 'ar' ? `خصم ${Math.round(currentOffer.value)}%` : `${Math.round(currentOffer.value)}% OFF`) : (currentLang === 'ar' ? 'عرض خاص' : 'Special Offer')) }}
              </span>
              <h2 class="banner-title">{{ localized(currentOffer, 'name') || currentOffer.name }}</h2>
              <p class="banner-desc">{{ localized(currentOffer, 'description') || currentOffer.description }}</p>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>{{ $t('common.loading') }}</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredProducts.length === 0" class="empty-results-box">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h3>{{ $t('products.no_products') }}</h3>
            <p>{{ currentLang === 'ar' ? 'لا توجد منتجات مطابقة لهذا العرض حالياً' : 'No products found matching this offer currently.' }}</p>
          </div>

          <!-- 3x3 Products Grid (280x420 standard cards) -->
          <div v-else class="mockup-products-grid">
            <product-card 
              v-for="product in paginatedProducts" 
              :key="product.id" 
              :product="product" 
              :offer="currentOffer"
              @click="emit('open-product', product)"
              @add-to-cart="emit('add-to-cart', product)"
            />
          </div>

          <!-- Bottom Pagination Bar -->
          <div class="mockup-pagination-row" v-if="filteredProducts.length > 0">
            <!-- Left in RTL: Counter -->
            <div class="pagination-info-text">
              {{ currentLang === 'ar' 
                ? `عرض 1-${paginatedProducts.length} من ${filteredProducts.length} منتج` 
                : `Showing 1-${paginatedProducts.length} of ${filteredProducts.length} products` 
              }}
            </div>

            <!-- Right in RTL: Numbered page controls -->
            <div class="pagination-buttons-group">
              <button class="pag-btn pag-arrow" :disabled="currentPage === 1" @click="emit('change-page', currentPage - 1)">
                <span>›</span>
              </button>
              <button 
                v-for="p in totalPages" 
                :key="p" 
                class="pag-btn pag-number" 
                :class="{ active: currentPage === p }" 
                @click="emit('change-page', p)"
              >
                {{ p }}
              </button>
              <button class="pag-btn pag-arrow" :disabled="currentPage >= totalPages" @click="emit('change-page', currentPage + 1)">
                <span>‹</span>
              </button>
            </div>
          </div>
        </main>
</template>
<script setup>
import ProductCard from '../../product/components/ProductCard.vue';

defineProps({
  currentLang: { type: String, required: true },
  localized: { type: Function, required: true },
  currentOffer: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  filteredProducts: { type: Array, default: () => [] },
  paginatedProducts: { type: Array, default: () => [] },
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
});
const emit = defineEmits(['open-product', 'add-to-cart', 'change-page']);
</script>
