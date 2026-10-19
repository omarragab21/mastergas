<template>
  <div v-if="modelValue" class="search-modal-overlay" @click.self="close">
    <div class="search-modal-content">
      <div class="search-header">
        <h2>{{ $t('search.title') }}</h2>
        <button class="search-close-btn" type="button" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="search-input-wrapper">
        <input
          ref="searchInput"
          v-model="query"
          type="text"
          :placeholder="$t('search.placeholder')"
          @keyup.enter="performSearch"
        />
        <button class="search-submit-btn" type="button" @click="performSearch">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      <div v-if="results.length > 0" class="search-results">
        <div
          v-for="product in results"
          :key="product.id"
          class="search-result-item"
          @click="goToProduct(product.id)"
        >
          <div class="search-result-image">
            <img :src="product.image || FALLBACK_IMAGE" :alt="localized(product, 'name')" @error="onImageError" />
          </div>
          <div class="search-result-info">
            <h4>{{ localized(product, 'name') }}</h4>
            <p class="search-result-price"><PriceText :value="product.price * (1 - (product.discount / 100 || 0))" :currency="currency" /></p>
          </div>
        </div>
      </div>

      <div v-if="query && results.length === 0 && !searching" class="search-no-results">
        <p>{{ $t('search.no_results') }}</p>
      </div>
      <div v-if="searching" class="search-loading">
        <div class="spinner"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSettings } from '../composables/useSettings';
import PriceText from './PriceText.vue';
import { useLocalized } from '../composables/useLocalized';
import { useProductSearch } from '../modules/product/composables/useProductSearch';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);
const router = useRouter();
const { localized } = useLocalized();
const searchInput = ref(null);
const { query, results, searching, performSearch, clearResults } = useProductSearch();

const close = () => {
  clearResults();
  emit('update:modelValue', false);
};

const goToProduct = (productId) => {
  close();
  router.push(`/product/${productId}`);
};

const FALLBACK_IMAGE = '/brand/mastergas-icon.png';
const onImageError = (event) => {
  if (!String(event.target.src).endsWith(FALLBACK_IMAGE)) event.target.src = FALLBACK_IMAGE;
};

const { currency } = useSettings();

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    nextTick(() => searchInput.value?.focus());
  } else {
    query.value = '';
    clearResults();
  }
});
</script>

<style>
.search-modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: flex-start; justify-content: center; padding-top: 100px; z-index: 2000; animation: fadeIn 0.2s ease-out; }
.search-modal-content { background: #fff; border-radius: 16px; width: 90%; max-width: 600px; max-height: 70vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2); animation: slideDown 0.3s ease-out; }
.search-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #f3f4f6; }
.search-header h2 { font-size: 1.5rem; font-weight: 800; color: #111827; margin: 0; }
.search-close-btn { width: 36px; height: 36px; border: none; border-radius: 8px; background: #f3f4f6; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #6b7280; }
.search-input-wrapper { display: flex; gap: 0.5rem; padding: 1.5rem; border-bottom: 1px solid #f3f4f6; }
.search-input-wrapper input { flex: 1; padding: 0.75rem 1rem; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 1rem; }
.search-input-wrapper input:focus { outline: none; border-color: #000; box-shadow: 0 0 0 3px rgba(135, 50, 96, 0.1); }
.search-submit-btn { width: 48px; border: none; border-radius: 10px; background: #000; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; }

.search-submit-btn:hover:not(:disabled) {
  background: var(--color-button-hover);
}
.search-results { padding: 1rem; max-height: 400px; overflow-y: auto; }
.search-result-item { display: flex; gap: 1rem; padding: 1rem; border-radius: 10px; cursor: pointer; border: 1px solid transparent; }
.search-result-item:hover { background: #f9fafb; border-color: #f3f4f6; }
.search-result-image { width: 60px; height: 60px; border-radius: 8px; overflow: hidden; background: #f3f4f6; flex-shrink: 0; }
.search-result-image img { width: 100%; height: 100%; object-fit: cover; }
.search-result-info { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.search-result-info h4 { font-size: 1rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem; }
.search-result-price { font-size: 0.95rem; font-weight: 800; color: #000; margin: 0; }
.search-no-results, .search-loading { padding: 2rem; text-align: center; color: #6b7280; }
.search-loading { display: flex; justify-content: center; align-items: center; }
.search-loading .spinner { width: 40px; height: 40px; border: 3px solid #f3f4f6; border-top-color: #000; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
