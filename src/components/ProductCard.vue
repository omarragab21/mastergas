<template>
  <div
    class="product-card"
    :dir="currentLang === 'ar' ? 'rtl' : 'ltr'"
    role="link"
    tabindex="0"
    :aria-label="productName"
    @click="$emit('click', product)"
    @mouseenter="secondaryVisible = true"
    @focusin="secondaryVisible = true"
    @keydown.enter.prevent="$emit('click', product)"
    @keydown.space.prevent="$emit('click', product)"
  >
    <!-- 1. Top Image with rounded corners & internal card padding -->
    <div class="product-image-wrapper">
      <img 
        :src="getImageUrl(product.image, product.id)" 
        :alt="productName" 
        class="product-image primary-img" 
        loading="lazy" 
        decoding="async"
        width="480"
        height="480"
        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 280px"
        @load="handleImageLoad"
        @error="handleImageError($event, product)" 
      />
      <img 
        v-if="secondaryImageUrl && secondaryVisible"
        :src="secondaryImageUrl" 
        :alt="productName" 
        class="product-image secondary-img" 
        loading="lazy" 
        decoding="async"
        width="480"
        height="480"
        sizes="(max-width: 1024px) 45vw, 280px"
        @error="handleSecondaryImageError"
      />
      
      <!-- Badges -->
      <div class="product-badges">
        <span class="badge-new" v-if="isNewProduct">{{ currentLang === 'ar' ? 'جديد' : 'NEW' }}</span>
        <span class="badge-sale" v-if="discountPercentage > 0">-{{ Math.round(discountPercentage) }}%</span>
      </div>

      <!-- Multiple images indicator badge -->
      <div v-if="hasMultipleImages" class="card-images-count">
        <i class="fas fa-camera"></i>
        <span>{{ totalImagesCount }}</span>
      </div>

      <!-- Stock Warning -->
      <div class="product-overlay" v-if="product.stock > 0 && product.stock <= 5">
        <span class="stock-warning">{{ t('product.only_left', { count: product.stock }) }}</span>
      </div>
      <div class="product-overlay out-of-stock" v-else-if="product.stock === 0">
        <span class="stock-warning">{{ t('product.out_of_stock') }}</span>
      </div>
    </div>
    
    <!-- 2. Product Information -->
    <div class="product-info">
      <span class="origin-tag">{{ displayOrigin }}</span>
      
      <h3 class="product-name" :title="productName">{{ productName }}</h3>
      
      <!-- Meta Row: Specs and SKU with space-between -->
      <div class="product-meta-row">
        <span class="product-specs">{{ displaySpecs }}</span>
        <span class="product-sku">{{ displaySku }}</span>
      </div>

      <!-- Full-width Divider Line underneath -->
      <div class="product-divider"></div>

      <!-- Old Price directly under the border -->
      <div class="old-price-row" v-if="discountPercentage > 0">
        <span class="old-price">
          <span class="old-price-val">{{ formatPrice(product.price) }}</span>
          <svg width="10" height="12" viewBox="0 0 14 16" fill="currentColor" class="price-riyal-icon" aria-hidden="true">
            <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
            <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
          </svg>
        </span>
      </div>

      <!-- Bottom Row: New Price and Add to Cart on the exact same row level -->
      <div class="product-bottom-row">
        <div class="current-price-row">
          <span class="price-val">{{ formatPrice(currentPrice) }}</span>
          <img :src="riyalIcon" alt="ريال" class="currency-symbol-svg" aria-hidden="true" />
        </div>

        <button class="add-to-cart-btn" @click.stop="$emit('add-to-cart', product)" :aria-label="currentLang === 'ar' ? 'إضافة المنتج إلى السلة' : 'Add product to cart'">
          <svg class="cart-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"/>
            <path d="M10 14a2 2 0 0 0 4 0"/>
          </svg>
          <span class="btn-text">{{ currentLang === 'ar' ? 'أضف للسلة' : 'Add to Cart' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useOffers } from '../composables/useOffers';
import { useLocalized } from '../composables/useLocalized';
import riyalIcon from '../../assets/riyal.svg';

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  offer: {
    type: Object,
    required: false
  }
});

defineEmits(['click', 'add-to-cart']);

const { t } = useI18n();
const { currentLang, localized } = useLocalized();
const { getActiveOfferForProduct, calculateDiscountFromOffer, calculatePriceWithOffer } = useOffers();
const secondaryVisible = ref(false);

const productName = computed(() => {
  if (!props.product) return '';
  if (currentLang.value === 'ar') {
    return props.product.name_ar || localized(props.product, 'name') || props.product.name || '';
  }
  return props.product.name_en || localized(props.product, 'name') || props.product.name || '';
});

const displayOrigin = computed(() => {
  if (props.product?.origin) return props.product.origin;
  if (props.product?.country_of_origin) return props.product.country_of_origin;
  return currentLang.value === 'ar' ? 'إيطالي الصنع' : 'Made in Italy';
});

const displaySpecs = computed(() => {
  if (props.product?.specs && String(props.product.specs).trim() !== '') {
    return String(props.product.specs).trim();
  }
  if (props.product?.short_description && String(props.product.short_description).trim() !== '') {
    return String(props.product.short_description).trim();
  }
  return currentLang.value === 'ar' ? 'تحكم باللمس، حماية حرارية' : 'Touch control, heat protection';
});

const displaySku = computed(() => {
  if (props.product?.sku && String(props.product.sku).trim() !== '') {
    return String(props.product.sku).trim();
  }
  if (props.product?.model_number && String(props.product.model_number).trim() !== '') {
    return String(props.product.model_number).trim();
  }
  return props.product?.id ? `HC60${props.product.id}T` : 'HC604T';
});

onMounted(() => {
  if (typeof performance !== 'undefined' && typeof performance.mark === 'function' && !globalThis.__mastergasFirstCardRendered) {
    globalThis.__mastergasFirstCardRendered = true;
    performance.mark('mastergas:first-product-card-rendered');
  }
});

const isNewProduct = computed(() => {
  const value = props.product?.is_new ?? props.product?.new_arrival ?? props.product?.is_new_arrival;
  return value === true || value === 1 || value === '1' || value === 'true';
});

const activeOffer = computed(() => {
  if (!props.product) return null;
  if (props.offer) return props.offer;
  return getActiveOfferForProduct(props.product);
});

const discountPercentage = computed(() => {
  if (!props.product) return 0;
  const offer = activeOffer.value;
  if (offer) {
    return calculateDiscountFromOffer(props.product, offer);
  }
  const price = Number(props.product.price) || 0;
  const salePrice = Number(props.product.sale_price) || 0;
  if (price > 0 && salePrice > 0 && salePrice < price) return ((price - salePrice) / price) * 100;
  return Number(props.product.discount) || 0;
});

const currentPrice = computed(() => {
  if (!props.product) return 0;
  const offer = activeOffer.value;
  if (offer) {
    return calculatePriceWithOffer(props.product, offer);
  }
  const salePrice = Number(props.product.sale_price) || 0;
  const price = Number(props.product.price) || 0;
  if (salePrice > 0 && salePrice < price) return salePrice;
  const discount = discountPercentage.value;
  return price * (1 - (discount / 100));
});

const handleImageError = (event, product) => {
  if (product && product.id) {
    const localPath = `/catalog_images/prod_${product.id}.jpg`;
    if (!event.target.src.endsWith(localPath)) {
      event.target.src = localPath;
      return;
    }
  }
  event.target.src = '/images/home/product_ceramic_hob_60.png';
};

const handleSecondaryImageError = (event) => {
  event.target.remove();
};

const handleImageLoad = () => {
  if (typeof performance !== 'undefined' && typeof performance.mark === 'function' && !globalThis.__mastergasImagesLoaded) {
    globalThis.__mastergasImagesLoaded = true;
    performance.mark('mastergas:images-loaded');
  }
};

const getImageUrl = (path, id) => {
  const rawPath = typeof path === 'object' && path !== null
    ? (path.image_url || path.url || path.image || path.path || '')
    : path;
  if (rawPath && (String(rawPath).startsWith('/') || String(rawPath).startsWith('http'))) {
    return rawPath;
  }
  if (!rawPath) return id ? `/catalog_images/prod_${id}.jpg` : '/images/home/product_ceramic_hob_60.png';
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://backend-mastergas.be-kite.com/api';
  if (String(rawPath).includes('catalog_images')) return `/${String(rawPath).replace(/^\//, '')}`;
  return `${baseUrl.replace('/api', '')}/storage/${rawPath}`;
};

const hasMultipleImages = computed(() => {
  return Array.isArray(props.product?.images) && props.product.images.length > 1;
});

const totalImagesCount = computed(() => {
  if (Array.isArray(props.product?.images)) return props.product.images.length;
  return props.product?.image ? 1 : 0;
});

const secondaryImageUrl = computed(() => {
  if (Array.isArray(props.product?.images) && props.product.images.length > 1) {
    return getImageUrl(props.product.images[1], null);
  }
  return null;
});

const formatPrice = (price) => {
  const num = parseFloat(price) || 0;
  const hasDecimals = num % 1 !== 0;
  return num.toLocaleString('en-US', { 
    minimumFractionDigits: hasDecimals ? 2 : 0, 
    maximumFractionDigits: 2 
  });
};
</script>

<style scoped>
.product-card {
  width: 100%;
  max-width: 308px;
  height: 460px;
  flex: none;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 16px;
  transition: all 0.25s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
  border-color: #cbd5e1;
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  height: 240px;
  background: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
  display: block;
}

.product-image.secondary-img {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity 0.35s ease, transform 0.4s ease;
  pointer-events: none;
}

.product-card:hover .product-image {
  transform: scale(1.03);
}

.product-card:hover .product-image.secondary-img {
  opacity: 1;
  transform: scale(1.04);
}

.card-images-count {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(17, 24, 39, 0.75);
  backdrop-filter: blur(4px);
  color: #ffffff;
  padding: 2px 7px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;
}

.product-card[dir="ltr"] .card-images-count {
  right: auto;
  left: 8px;
}

.card-colors-row {
  margin-bottom: 12px;
}

.card-swatches {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.card-color-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 22px;
  padding: 2px 7px 2px 4px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #f8fafc;
  color: #334155;
  font-size: 10px;
  line-height: 1;
  white-space: nowrap;
}

.card-swatch-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid #ffffff;
  box-shadow: 0 0 0 1px #d1d5db;
  display: inline-block;
  flex-shrink: 0;
}

.card-color-label {
  max-width: 94px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-color-hex {
  color: #64748b;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 9px;
  direction: ltr;
}

.card-swatch-more {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

.product-badges {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: row;
  gap: 6px;
  z-index: 2;
}

.product-card[dir="ltr"] .product-badges {
  right: auto;
  left: 12px;
}

.badge-new {
  background: #10b981;
  color: #ffffff;
  padding: 4px 12px;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.2;
}

.badge-sale {
  background: #ef4444;
  color: #ffffff;
  padding: 4px 12px;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.2;
}

.product-overlay {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  background: rgba(239, 68, 68, 0.9);
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
}

.product-overlay.out-of-stock {
  background: rgba(17, 24, 39, 0.9);
}

.product-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-card[dir="rtl"] .product-info {
  text-align: right;
}

.product-card[dir="ltr"] .product-info {
  text-align: left;
}

.origin-tag {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 6px;
  display: block;
  line-height: 1.3;
}

.product-name {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 10px 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 46px;
}

.product-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.product-specs {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 12.5px;
  font-weight: 400;
  color: #64748b;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-sku {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  letter-spacing: 0.2px;
  white-space: nowrap;
  flex-shrink: 0;
}

.product-divider {
  width: 100%;
  height: 1px;
  background: #e2e8f0;
  margin-top: auto;
  margin-bottom: 6px;
}

.old-price-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.old-price {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 13px;
  color: #94a3b8;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.old-price-val {
  text-decoration: line-through;
}

.product-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.current-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.price-val {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  line-height: 1;
}

.currency-symbol {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #000000;
}

.currency-symbol-svg {
  width: 14px;
  height: 16px;
  display: block;
  flex: 0 0 14px;
}

.price-riyal-icon {
  width: 11px;
  height: 13px;
  display: block;
  flex: 0 0 11px;
}

.add-to-cart-btn {
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 9px 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.add-to-cart-btn:hover {
  background: #1f2937;
  transform: translateY(-1px);
}

.add-to-cart-btn:active {
  transform: scale(0.97);
}

.cart-icon {
  width: 16px;
  height: 16px;
  display: block;
}

.btn-text {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 13px;
  line-height: 100%;
  letter-spacing: 0%;
  white-space: nowrap;
  color: #ffffff;
}

/* List View Styles */
.product-card.list-view {
  flex-direction: row;
  height: auto;
  min-height: 200px;
}

.product-card.list-view .product-image-wrapper {
  width: 220px;
  height: auto;
  min-height: 180px;
  margin-bottom: 0;
  margin-inline-end: 18px;
}

.product-card.list-view .product-info {
  justify-content: space-between;
}

@media (max-width: 640px) {
  .product-card {
    padding: 12px;
    border-radius: 14px;
    width: 100%;
    height: 460px;
    flex-basis: 100%;
  }
  .product-image-wrapper {
    height: 180px;
    border-radius: 10px;
    margin-bottom: 12px;
  }
  .product-name {
    font-size: 15px;
    min-height: 40px;
  }
  .product-divider {
    margin-bottom: 6px;
  }
  .price-val {
    font-size: 18px;
  }
  .add-to-cart-btn {
    padding: 7px 11px;
    border-radius: 7px;
  }
  .btn-text {
    font-size: 12px;
  }
}
</style>
