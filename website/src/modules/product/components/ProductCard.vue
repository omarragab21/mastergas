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

      <button
        type="button"
        class="product-favorite-btn"
        :class="{ active: isFavorite }"
        :aria-label="isFavorite ? (currentLang === 'ar' ? 'إزالة من المفضلة' : 'Remove from wishlist') : (currentLang === 'ar' ? 'إضافة إلى المفضلة' : 'Add to wishlist')"
        :title="isFavorite ? (currentLang === 'ar' ? 'إزالة من المفضلة' : 'Remove from wishlist') : (currentLang === 'ar' ? 'إضافة إلى المفضلة' : 'Add to wishlist')"
        @click.stop="toggleFavorite"
      >
        <i :class="isFavorite ? 'fas fa-heart' : 'far fa-heart'" aria-hidden="true"></i>
      </button>

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
import { useLocalized } from '../../../composables/useLocalized';
import { cartState } from '../../../store/cart';
import riyalIcon from '../../../assets/riyal.svg';

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
const isFavorite = computed(() => cartState.isInWishlist(props.product?.id));

const toggleFavorite = () => {
  cartState.toggleWishlist(props.product);
};

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

<style src="../styles/product-card.css" scoped></style>
