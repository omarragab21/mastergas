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
        <span class="badge-sale" v-else-if="discountPercentage > 0">-{{ Math.round(discountPercentage) }}%</span>
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

      <!-- Available Colors Preview -->
      <div v-if="productColors.length > 0" class="card-colors-row">
        <div class="card-swatches">
          <span 
            v-for="(c, idx) in productColors.slice(0, 5)" 
            :key="idx" 
            class="card-swatch-dot" 
            :style="{ backgroundColor: c.hex }"
            :title="c.name"
          ></span>
          <span v-if="productColors.length > 5" class="card-swatch-more">+{{ productColors.length - 5 }}</span>
        </div>
      </div>

      <!-- Full-width Divider Line underneath -->
      <div class="product-divider"></div>

      <!-- Bottom Row: Price on the right, Add to Cart button on the left -->
      <div class="product-bottom-row">
        <div class="price-box">
          <span class="old-price" v-if="discountPercentage > 0">
            {{ formatPrice(product.price) }}
          </span>
          <div class="current-price-row">
            <span class="price-val">{{ formatPrice(currentPrice) }}</span>
            <span class="currency-symbol" v-if="currentLang === 'ar'">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="currency-symbol-svg">
                <path d="M14 4v9"/>
                <path d="M18 4v6.5a2.5 2.5 0 0 1-2.5 2.5H14"/>
                <path d="M5 7h13"/>
                <path d="M5 10.5h13"/>
                <path d="M15 18h4.5"/>
              </svg>
            </span>
            <span class="currency-symbol text-cur" v-else>{{ currency }}</span>
          </div>
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
import { useSettings } from '../composables/useSettings';
import { colorMap, getPresetColorHex as resolveColorHex } from '../constants/colors';

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
const { currency } = useSettings();
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

const productColors = computed(() => {
  if (!props.product) return [];
  if (Array.isArray(props.product.color_options) && props.product.color_options.length > 0) {
    return props.product.color_options.map(c => {
      if (typeof c === 'object' && c !== null) {
        return { name: c.name || c.label || '', hex: c.hex || c.color || resolveColorHex(c.name || '') };
      }
      const str = String(c);
      if (str.includes('|')) {
        const [lbl, hx] = str.split('|');
        return { name: lbl.trim(), hex: hx.trim() };
      }
      return { name: str.trim(), hex: resolveColorHex(str.trim()) };
    });
  }
  const attrs = props.product.attributes;
  if (attrs && typeof attrs === 'object') {
    const rawColor = attrs.color || attrs['اللون'] || attrs.Color || attrs['الالوان'];
    if (Array.isArray(rawColor) && rawColor.length > 0) {
      return rawColor.map(c => {
        if (typeof c === 'object' && c !== null) {
          return { name: c.name || c.label || '', hex: c.hex || c.color || resolveColorHex(c.name || '') };
        }
        const str = String(c);
        if (str.includes('|')) {
          const [lbl, hx] = str.split('|');
          return { name: lbl.trim(), hex: hx.trim() };
        }
        return { name: str.trim(), hex: resolveColorHex(str.trim()) };
      });
    }
  }
  return [];
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
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 16px;
  transition: all 0.25s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
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
  border-radius: 12px;
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
  align-items: center;
  gap: 6px;
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
  flex-direction: column;
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
  font-size: 13.5px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 6px;
  display: block;
  line-height: 1.3;
}

.product-name {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 10px 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 48px;
}

.product-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
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
  margin-bottom: 24px;
}

.product-bottom-row {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.price-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.old-price {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 13px;
  color: #94a3b8;
  text-decoration: line-through;
  margin-bottom: 2px;
  line-height: 1;
}

.current-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.price-val {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 21px;
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
  width: 15px;
  height: 15px;
  display: block;
  stroke: #000000;
}

.text-cur {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  color: #000000;
}

.add-to-cart-btn {
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 9px 15px;
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
  font-size: 12px;
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
    margin-bottom: 16px;
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
