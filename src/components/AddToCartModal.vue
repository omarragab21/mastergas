<template>
  <transition name="toast-slide">
    <div
      v-if="cartState.showModal && product"
      class="cart-toast"
      :class="{ 'is-en': currentLang !== 'ar' }"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <!-- toast-header -->
      <div class="toast-header">
        <!-- close-btn -->
        <button
          type="button"
          class="close-btn"
          @click="closeToast"
          :aria-label="currentLang === 'ar' ? 'إغلاق' : 'Close'"
        >
          <!-- cancel-01 -->
          <svg class="cancel-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5 5.5L5.5 14.5M5.5 5.5L14.5 14.5" stroke="#94A3B8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- header-content -->
        <div class="header-content">
          <span class="header-title">{{ t('cart.added_to_cart') }}</span>
          <!-- success-icon -->
          <div class="success-icon">
            <!-- checkmark-circle-02 -->
            <svg class="check-svg" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" stroke="#FFFFFF" stroke-width="1.6"/>
              <path d="M6.8 10.2L8.9 12.3L13.2 8" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- product-details -->
      <div class="product-details">
        <!-- product-info -->
        <div class="product-info">
          <h4 class="product-name" :title="productName">{{ productName }}</h4>
          <!-- meta -->
          <div class="meta">
            <!-- price-unit -->
            <div class="price-unit">
              <!-- riyal symbol -->
              <svg class="riyal-symbol" width="13.69" height="15.3" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
                <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
              </svg>
              <!-- price -->
              <span class="price-value">{{ displayPrice }}</span>
            </div>
          </div>
        </div>

        <!-- product-thumbnail -->
        <div class="product-thumbnail">
          <img
            :src="productImage"
            :alt="productName"
            class="thumb-img"
            @error="handleImageError"
          />
        </div>
      </div>

      <!-- toast-actions -->
      <div class="toast-actions">
        <!-- view-cart-btn -->
        <button type="button" class="view-cart-btn" @click="goToCart">
          {{ t('cart.view_cart') }}
        </button>

        <!-- continue-shopping-btn -->
        <button type="button" class="continue-shopping-btn" @click="closeToast">
          {{ t('cart.continue_shopping') }}
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { cartState } from '../store/cart';
import { useLocalized } from '../composables/useLocalized';

const router = useRouter();
const { t } = useI18n();
const { currentLang, localized } = useLocalized();

const product = computed(() => cartState.lastAddedProduct);

const productName = computed(() => {
  if (!product.value) return '';
  return localized(product.value, 'name') || product.value.name_ar || product.value.name || '';
});

const getImageUrl = (path, id) => {
  if (!path) {
    return id ? `/catalog_images/prod_${id}.jpg` : '/images/home/product_ceramic_hob_60.png';
  }
  const rawPath = typeof path === 'object' && path !== null
    ? (path.image_url || path.url || path.image || path.path || '')
    : path;
  if (!rawPath) {
    return id ? `/catalog_images/prod_${id}.jpg` : '/images/home/product_ceramic_hob_60.png';
  }
  if (String(rawPath).startsWith('/') || String(rawPath).startsWith('http')) {
    return rawPath;
  }
  if (String(rawPath).includes('catalog_images')) {
    return `/${String(rawPath).replace(/^\//, '')}`;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://backend-mastergas.be-kite.com/api';
  return `${baseUrl.replace('/api', '')}/storage/${rawPath}`;
};

const productImage = computed(() => {
  if (!product.value) return '/images/home/product_ceramic_hob_60.png';
  const img = product.value.image || product.value.images?.[0] || product.value.thumbnail;
  return getImageUrl(img, product.value.id);
});

const handleImageError = (e) => {
  if (e?.target) {
    e.target.src = '/images/home/product_ceramic_hob_60.png';
  }
};

const displayPrice = computed(() => {
  if (!product.value) return '0';
  const price = Number(product.value.price) || 0;
  const discount = Number(product.value.discount) || 0;
  const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
  return Math.round(finalPrice).toLocaleString('en-US');
});

const closeToast = () => {
  if (typeof cartState.closeModal === 'function') {
    cartState.closeModal();
  } else {
    cartState.showModal = false;
  }
};

const goToCart = () => {
  closeToast();
  router.push('/cart');
};

const onMouseEnter = () => {
  if (cartState._modalTimer) {
    clearTimeout(cartState._modalTimer);
    cartState._modalTimer = null;
  }
};

const onMouseLeave = () => {
  if (cartState.showModal) {
    cartState._modalTimer = setTimeout(() => {
      cartState.showModal = false;
      cartState._modalTimer = null;
    }, 2500);
  }
};
</script>

<style scoped>
/* cart-toast */
.cart-toast {
  position: fixed;
  width: 420px;
  max-width: calc(100vw - 32px);
  min-height: 178px;
  left: 50%;
  top: 132px; /* Positioned right below the fixed header on desktop */
  transform: translateX(-50%);

  background: #F8FAFC;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  padding: 16px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;

  z-index: 100000;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  direction: ltr; /* Keeps Figma visual layout structure */
}

/* toast-header */
.toast-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 32px;
  box-sizing: border-box;
}

/* close-btn */
.close-btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #94A3B8;
  transition: background-color 0.2s, color 0.2s;
  flex-shrink: 0;
}

.close-btn:hover {
  background-color: #E2E8F0;
  color: #475569;
}

.cancel-icon {
  width: 20px;
  height: 20px;
}

/* header-content */
.header-content {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 0px;
  gap: 12px;
  height: 32px;
}

/* تمت الإضافة إلى السلة */
.header-title {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
  text-align: right;
  white-space: nowrap;
}

/* success-icon */
.success-icon {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  width: 32px;
  height: 32px;
  background: #10B981;
  border-radius: 9999px;
  flex-shrink: 0;
}

.check-svg {
  width: 20px;
  height: 20px;
}

/* product-details */
.product-details {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 16px;
  width: 100%;
  height: 53px;
  box-sizing: border-box;
}

/* product-info */
.product-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  padding: 0px;
  gap: 8px;
  flex: 1;
  min-width: 0;
  height: 53px;
}

/* فرن غاز بلت-إن 60 سم */
.product-name {
  width: 100%;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  text-align: right;
  color: #000000;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* meta */
.meta {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 21px;
}

/* price-unit */
.price-unit {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 0px;
  gap: 4px;
  height: 21px;
}

/* riyal */
.riyal-symbol {
  width: 13.69px;
  height: 15.3px;
  color: #000000;
  flex-shrink: 0;
}

/* 2,199 */
.price-value {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
}

/* product-thumbnail */
.product-thumbnail {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  width: 48px;
  height: 48px;
  border: 1px solid #000000;
  border-radius: 6px;
  overflow: hidden;
  background: #FFFFFF;
  flex-shrink: 0;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* toast-actions */
.toast-actions {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 0px;
  gap: 12px;
  width: 100%;
  height: 37px;
  box-sizing: border-box;
}

/* view-cart-btn */
.view-cart-btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  min-width: 97px;
  height: 37px;
  background: #000000;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  color: #FFFFFF;
  box-sizing: border-box;
  transition: background-color 0.2s, opacity 0.2s;
  white-space: nowrap;
}

.view-cart-btn:hover {
  background-color: #27272a;
}

.view-cart-btn:active {
  opacity: 0.9;
}

/* continue-shopping-btn */
.continue-shopping-btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  min-width: 110px;
  height: 37px;
  background: #F8FAFC;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  color: #64748B;
  box-sizing: border-box;
  transition: background-color 0.2s, color 0.2s;
  white-space: nowrap;
}

.continue-shopping-btn:hover {
  background-color: #E2E8F0;
  color: #334155;
}

.continue-shopping-btn:active {
  opacity: 0.9;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .cart-toast {
    top: 108px;
    width: calc(100vw - 32px);
    padding: 16px;
    box-sizing: border-box;
  }
}

@media (max-width: 375px) {
  .cart-toast {
    width: calc(100vw - 24px);
    padding: 14px;
    gap: 10px;
  }

  .header-title {
    font-size: 15px;
  }

  .product-name {
    font-size: 15px;
  }

  .toast-actions {
    gap: 8px;
  }

  .view-cart-btn,
  .continue-shopping-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
}

/* English adjustments if active */
.cart-toast.is-en .product-name {
  text-align: right; /* Keeps consistent design per Figma screenshot */
}

/* Transitions */
.toast-slide-enter-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-slide-leave-active {
  transition: opacity 0.22s ease-in, transform 0.22s ease-in;
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-24px);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-12px);
}
</style>
