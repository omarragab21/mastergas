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
    <div class="product-image-wrapper" :class="{ 'img-loading': !imageSettled }">
      <img 
        :src="getImageUrl(product.image, product.id)" 
        :alt="productName" 
        ref="primaryImg"
        class="product-image primary-img" 
        loading="lazy" 
        decoding="async"
        width="480"
        height="480"
        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 280px"
        @load="handleImageLoad"
        @error="handleImageSettledError($event, product)" 
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
        <span class="badge-sale" dir="ltr" v-if="discountPercentage > 0">-{{ Math.round(discountPercentage) }}%</span>
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
      
      <h3 class="product-name" dir="auto" :title="productName">{{ productName }}</h3>
      
      <!-- Meta Row: Specs and model -->
      <div class="product-meta-row">
        <span class="product-specs" dir="auto">{{ displaySpecs }}</span>
        <span class="product-sku">{{ displaySku }}</span>
      </div>

      <div class="product-divider"></div>

      <!-- Discount area keeps its height even when there is no discount -->
      <div class="discount-area">
        <div class="old-price" v-if="discountPercentage > 0" dir="ltr">
          <img :src="oldRiyalIcon" alt="" class="old-price-riyal" aria-hidden="true" />
          <span class="old-price-val">{{ formatPrice(product.price) }}</span>
        </div>
      </div>

      <!-- Price and Add to Cart -->
      <div class="product-bottom-row">
        <div class="current-price-row" dir="ltr">
          <img :src="priceRiyalIcon" alt="" class="currency-symbol-svg" aria-hidden="true" />
          <span class="price-val">{{ formatPrice(currentPrice) }}</span>
        </div>

        <button class="add-to-cart-btn" @click.stop="$emit('add-to-cart', product)" :aria-label="currentLang === 'ar' ? 'إضافة المنتج إلى السلة' : 'Add product to cart'">
          <span class="cart-icon-box"><span class="cart-icon-inset"><img :src="bagIcon" alt="" class="cart-icon" /></span></span>
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
import priceRiyalIcon from '../../../assets/card-riyal.svg';
import { formatPrice } from '../../../utils/price';
import oldRiyalIcon from '../../../assets/card-riyal-old.svg';
import bagIcon from '../../../assets/card-bag.svg';

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
const imageSettled = ref(false);
const primaryImg = ref(null);
onMounted(() => {
  // A cached image can finish before Vue attaches @load.
  if (primaryImg.value?.complete && primaryImg.value.naturalWidth > 0) imageSettled.value = true;
});
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

const handleImageError = (event) => {
  event.target.src = '/brand/mastergas-icon.png';
};

// Keep the shimmer until the image (or its broken-image placeholder) has settled.
const handleImageSettledError = (event, productRef) => {
  if (String(event.target.src).endsWith('/brand/mastergas-icon.png')) {
    imageSettled.value = true;
    return;
  }
  handleImageError(event, productRef);
};

const handleSecondaryImageError = (event) => {
  event.target.remove();
};

const handleImageLoad = () => {
  imageSettled.value = true;
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
  if (!rawPath) return '/brand/mastergas-icon.png';
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://backend-tijara.be-kite.com/api';
  return `${baseUrl.replace('/api', '')}/storage/${rawPath}`;
};

const secondaryImageUrl = computed(() => {
  if (Array.isArray(props.product?.images) && props.product.images.length > 1) {
    return getImageUrl(props.product.images[1], null);
  }
  return null;
});

</script>

<style src="../styles/product-card.css" scoped></style>
