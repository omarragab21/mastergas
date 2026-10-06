<template>
  <transition name="pop-in">
    <div v-if="cartState.showModal" class="add-to-cart-modal">
      <div class="modal-content" :dir="currentLang === 'ar' ? 'rtl' : 'ltr'">
        <!-- Close Button -->
        <button class="close-btn" @click="cartState.showModal = false">
          <i class="fas fa-times"></i>
        </button>

        <div class="modal-body">
          <div class="success-header">
            <span class="check-icon"><i class="fas fa-check"></i></span>
            <span class="success-text">{{ t('cart.added_to_cart') }}</span>
          </div>

          <div class="product-summary" v-if="product">
            <img :src="getImageUrl(product.image || product.images?.[0], product.id)" :alt="productName" class="modal-product-img" @error="$event.target.src = '/images/home/product_ceramic_hob_60.png'">
            <div class="product-details">
              <h4 class="product-name">{{ productName }}</h4>
              <p class="product-price">{{ (product.price * (1 - (product.discount/100 || 0))).toLocaleString('en-US') }} {{ t('currency') }}</p>
            </div>
          </div>

          <button class="view-cart-btn" @click="goToCart">
            <i class="fas fa-shopping-bag"></i>
            <span>{{ t('cart.view_cart') }}</span>
          </button>
        </div>
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
const product = computed(() => cartState.lastAddedProduct);
const { t } = useI18n();
const { currentLang, localized } = useLocalized();
const productName = computed(() => localized(product.value, 'name'));

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

const goToCart = () => {
  cartState.showModal = false;
  router.push('/cart');
};
</script>

<style scoped>
.add-to-cart-modal {
  position: fixed;
  top: 100px; /* Account for navbar */
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  width: 320px;
}

.modal-content {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.15);
  border: 1px solid #f3f4f6;
  padding: 24px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 15px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 14px;
}

.modal-content[dir="rtl"] .close-btn {
  left: 15px;
}

.modal-content[dir="ltr"] .close-btn {
  right: 15px;
}

.success-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.check-icon {
  width: 24px;
  height: 24px;
  background: #10b981;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.success-text {
  font-weight: 700;
  color: #111827;
  font-size: 16px;
}

.product-summary {
  display: flex;
  gap: 15px;
  margin-bottom: 24px;
  padding: 12px;
  background: #fdfcfd;
  border-radius: 12px;
}

.modal-product-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.product-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-name {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-size: 13px;
  color: #000000;
  font-weight: 800;
}

.view-cart-btn {
  width: 100%;
  padding: 12px;
  background: #000000;
  color: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s;
}

.view-cart-btn:hover {
  background: #4a1936;
  box-shadow: 0 5px 15px rgba(135, 50, 96, 0.2);
}

/* Animations */
.pop-in-enter-active {
  transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
}

.pop-in-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.pop-in-leave-active {
  transition: all 0.3s ease;
}

.pop-in-leave-to {
  opacity: 0;
  transform: translateX(-50%) scale(0.9);
}
</style>
