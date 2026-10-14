<template>
        <!-- Main Products Column (Left in RTL) -->
        <main class="mockup-main-column">
          <div v-if="dataNotice" class="catalog-data-notice" role="status">{{ dataNotice }}</div>
          <!-- Loading State: shimmer cards in the same grid -->
          <div v-if="loading" class="mockup-products-grid" role="status" aria-busy="true">
            <ProductCardSkeleton v-for="n in perPage" :key="`sk-${n}`" />
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
              @click="emit('open-product', product)"
              @add-to-cart="emit('add-to-cart', $event)"
            />
          </div>

          <!-- Bottom Pagination Bar -->
          <div class="mockup-pagination-row" v-if="!loading && products.length > 0">
            <!-- Left in RTL: Counter -->
            <div class="pagination-info-text">
              {{ currentLang === 'ar' 
                ? `عرض ${(currentPage - 1) * perPage + 1}-${Math.min(currentPage * perPage, totalProductsCount)} من ${totalProductsCount} منتج` 
                : `Showing ${(currentPage - 1) * perPage + 1}-${Math.min(currentPage * perPage, totalProductsCount)} of ${totalProductsCount} products` 
              }}
            </div>

            <!-- Right in RTL: Numbered page controls -->
            <div class="pagination-buttons-group" v-if="totalPages > 1">
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
              <button class="pag-btn pag-arrow" :disabled="totalPages <= currentPage" @click="emit('change-page', currentPage + 1)">
                <span>‹</span>
              </button>
            </div>
          </div>
        </main>
</template>
<script setup>
import ProductCard from './ProductCard.vue';
import ProductCardSkeleton from '../../../components/skeleton/ProductCardSkeleton.vue';
defineProps({ products: { type: Array, default: () => [] }, loading: { type: Boolean, default: false }, dataNotice: { type: String, default: '' }, currentLang: { type: String, required: true }, currentPage: { type: Number, default: 1 }, perPage: { type: Number, default: 9 }, totalProductsCount: { type: Number, default: 0 }, totalPages: { type: Number, default: 1 } });
const emit = defineEmits(['open-product', 'add-to-cart', 'change-page']);
</script>
