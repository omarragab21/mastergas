<template>
  <div class="cart-page">
    <div class="container main-container">
      <div class="cart-title-section">
        <h1 class="page-title">{{ t('cart.title') }}</h1>
        <p class="page-subtitle">{{ t('cart.subtitle') }}</p>
      </div>

      <div class="cart-layout" :class="{ 'empty-layout': cartState.items.length === 0 }">
        <!-- Main Cart Items -->
        <div class="cart-main">
          <!-- Free Shipping Progress -->
          <div class="free-shipping-card" v-if="freeDeliveryThreshold && cartState.items.length > 0">
            <div class="card-body">
              <div class="icon-group">
                <span class="truck-icon"><i class="fas fa-truck"></i></span>
                <div class="text-content">
                  <h4 v-if="remainingForFree > 0">{{ t('cart.free_shipping') }}</h4>
                  <h4 v-else>{{ t('cart.got_free_shipping') }}</h4>
                  <p v-if="remainingForFree > 0">{{ t('cart.add_for_free_shipping', { amount: remainingForFree }) }} {{ currency }}</p>
                </div>
              </div>
              <div class="progress-container">
                <div class="progress-bar" :style="{ width: `${Math.min(100, (cartSubtotal / freeDeliveryThreshold) * 100)}%` }"></div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="cartState.items.length === 0" class="empty-cart">
            <i class="fas fa-shopping-basket"></i>
            <h3>{{ t('cart.empty') }}</h3>
            <p>{{ t('cart.empty_message') }}</p>
            <router-link to="/products" class="shop-now-btn">{{ t('home.shop_now') }}</router-link>
          </div>

          <!-- Items List -->
          <div v-else class="cart-items-list">
            <div v-for="item in cartState.items" :key="item.cart_item_key || item.id" class="cart-item">
              <div class="item-img-wrapper" @click="goToProduct(item)" style="cursor: pointer;">
                <img :src="getImageUrl(item.image)" :alt="localized(item, 'name')">
              </div>
              <div class="item-info">
                <h3 class="item-name" @click="goToProduct(item)" style="cursor: pointer;">{{ localized(item, 'name') }}</h3>
                
                <!-- Selected Attributes (Color & Size) -->
                <div v-if="getItemColor(item) || getItemSize(item)" class="cart-item-attributes">
                  <span v-if="getItemColor(item)" class="attr-pill color-pill">
                    <span class="attr-color-dot" :style="{ backgroundColor: getItemColorHex(item) }"></span>
                    <span>{{ getItemColor(item) }}</span>
                  </span>
                  <span v-if="getItemSize(item)" class="attr-pill size-pill">
                    <i class="fas fa-ruler-combined"></i>
                    <span>{{ getItemSize(item) }}</span>
                  </span>
                </div>

                <div class="item-controls">
                  <div class="quantity-picker">
                    <button @click="cartState.updateQuantity(item.cart_item_key || item.id, item.quantity - 1)" :disabled="item.quantity <= 1">-</button>
                    <span>{{ item.quantity }}</span>
                    <button @click="cartState.updateQuantity(item.cart_item_key || item.id, item.quantity + 1)">+</button>
                  </div>
                  <div class="item-price-info">
                    <span class="unit-price">{{ item.quantity }} × {{ getItemUnitPrice(item).toLocaleString('en-US') }}</span>
                    <span class="total-price">{{ getItemPriceWithDiscount(item).toLocaleString('en-US') }} {{ currency }}</span>
                  </div>
                </div>
                <button class="remove-btn" @click="cartState.removeFromCart(item.cart_item_key || item.id)">
                  <i class="far fa-trash-alt"></i>
                </button>
              </div>
            </div>
            
            <router-link to="/products" class="continue-shopping">
              <i class="fas fa-arrow-right"></i>
              {{ t('cart.continue_shopping') }}
            </router-link>
          </div>
        </div>

        <!-- Sidebar Summary -->
        <aside class="cart-sidebar" v-if="cartState.items.length > 0">
          <!-- Order Summary -->
          <div class="summary-card total-card">
            <h4 class="card-title">{{ t('checkout.order_summary') }}</h4>
            <div class="summary-rows">
              <div class="summary-row">
                <span>{{ t('cart.subtotal_items', { count: cartState.items.length }) }}</span>
                <span>{{ subtotalWithDiscount.toLocaleString('en-US') }} {{ currency }}</span>
              </div>
              <div class="summary-row shipping-row">
                <span>{{ t('checkout.shipping') }}</span>
                <span v-if="remainingForFree <= 0" class="free">{{ t('cart.free') }}</span>
                <span v-else>{{ shippingAmount.toLocaleString('en-US') }} {{ currency }}</span>
              </div>
              <div class="summary-row" v-if="taxAmount > 0">
                <span>{{ t('checkout.tax') || 'الضريبة' }} ({{ taxRate }}%)</span>
                <span>{{ taxAmount.toLocaleString('en-US') }} {{ currency }}</span>
              </div>
            </div>

            <div class="final-total">
              <span class="total-label">{{ t('checkout.total') }}</span>
              <div class="total-value-group">
                <span class="total-value">{{ grandTotal.toLocaleString('en-US') }} {{ currency }}</span>
              </div>
            </div>

            <div class="summary-actions">
              <router-link to="/checkout" class="checkout-btn">
                <span>{{ t('cart.checkout') }}</span>
                <i class="fas fa-arrow-left"></i>
              </router-link>
            </div>
            <p class="tax-note">{{ t('cart.tax_note') }}</p>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { cartState } from '../../store/cart';
import api from '../../config/axios';
import { useOffers } from '../../composables/useOffers';
import { useLocalized } from '../../composables/useLocalized';
import { useSettings } from '../../composables/useSettings';
import { colorMap } from '../../constants/colors';

const router = useRouter();
const { t } = useI18n();
const { localized } = useLocalized();
const { getActiveOfferForProduct, calculateDiscountFromOffer, calculatePriceWithOffer, fetchOffers } = useOffers();
const { currency, fetchSettings, getSetting } = useSettings();

// Calculate item price with offer discount
const getItemPriceWithDiscount = (item) => {
  const offer = getActiveOfferForProduct(item);
  if (offer) {
    const price = calculatePriceWithOffer(item, offer);
    return price * item.quantity;
  }
  // Use existing discount from cart item
  return (item.price * (1 - (item.discount/100 || 0))) * item.quantity;
};

// Calculate item unit price with discount
const getItemUnitPrice = (item) => {
  const offer = getActiveOfferForProduct(item);
  if (offer) {
    return calculatePriceWithOffer(item, offer);
  }
  // Use existing discount from cart item
  return item.price * (1 - (item.discount/100 || 0));
};

const getItemColor = (item) => {
  const attrs = item.selectedAttributes || item.attributes;
  if (!attrs) return null;
  const raw = attrs.color || attrs['اللون'] || attrs.Color;
  if (!raw) return null;
  if (typeof raw === 'string' && raw.includes('|')) {
    return raw.split('|')[0].trim();
  }
  return String(raw).trim();
};

const getItemColorHex = (item) => {
  const attrs = item.selectedAttributes || item.attributes;
  if (!attrs) return '#6b7280';
  const raw = attrs.color || attrs['اللون'] || attrs.Color;
  if (!raw) return '#6b7280';
  if (typeof raw === 'string' && raw.includes('|')) {
    return raw.split('|')[1].trim();
  }
  const str = String(raw).trim();
  if (str.startsWith('#')) return str;
  return colorMap[str.toLowerCase()] || colorMap[str] || '#6b7280';
};

const getItemSize = (item) => {
  const attrs = item.selectedAttributes || item.attributes;
  if (!attrs) return null;
  const raw = attrs.size || attrs['المقاس'] || attrs.Size || attrs['الحجم'] || attrs.dimension;
  return raw ? String(raw).trim() : null;
};

const couponCode = ref('');
const isGift = ref(false);
const freeDeliveryThreshold = computed(() => {
  const val = getSetting('free_delivery_threshold');
  return val !== null && val !== undefined && val !== '' ? Math.max(0, parseFloat(val) || 0) : 75;
});
const shippingCost = computed(() => {
  const val = getSetting('shipping_cost');
  return val !== null && val !== undefined && val !== '' ? Math.max(0, parseFloat(val) || 0) : 15;
});
const taxRate = computed(() => {
  const val = getSetting('tax_rate');
  return val !== null && val !== undefined && val !== '' ? Math.max(0, parseFloat(val) || 0) : 0;
});

const remainingForFree = computed(() => {
  const subtotalWithDiscount = cartState.items.reduce((sum, item) => {
    return sum + getItemPriceWithDiscount(item);
  }, 0);
  return Math.max(0, freeDeliveryThreshold.value - subtotalWithDiscount);
});

const subtotalWithDiscount = computed(() => {
  return cartState.items.reduce((sum, item) => {
    return sum + getItemPriceWithDiscount(item);
  }, 0);
});

const cartSubtotal = computed(() => subtotalWithDiscount.value);

const shippingAmount = computed(() => {
  if (subtotalWithDiscount.value <= 0) return 0;
  return subtotalWithDiscount.value >= freeDeliveryThreshold.value ? 0 : shippingCost.value;
});

const taxAmount = computed(() => {
  return Math.max(0, subtotalWithDiscount.value * (taxRate.value / 100));
});

const grandTotal = computed(() => {
  return subtotalWithDiscount.value + shippingAmount.value + taxAmount.value;
});

const getImageUrl = (path) => {
  if (!path) return '/placeholder-product.png';
  if (path.startsWith('http')) return path;
  const baseUrl = api.defaults.baseURL;
  return `${baseUrl.replace('/api', '')}/storage/${path}`;
};

const goToProduct = (product) => {
  router.push(`/product/${product.id}`);
};

// fetchSettings is imported from useSettings() composable (line 125)
const applyCoupon = () => {
  alert(`${couponCode.value}`);
};

onMounted(() => {
  cartState.refreshCartItems();
  fetchSettings();
  fetchOffers();
});
</script>

<style scoped>
.cart-page {
  padding: 140px 0 100px;
  background: #fdfcfd;
}

.main-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

.cart-title-section {
  margin-bottom: 40px;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 8px;
}

.page-subtitle {
  color: #6b7280;
  font-size: 16px;
}

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 40px;
}

.cart-layout.empty-layout {
  grid-template-columns: 1fr;
}

/* Main Content */
.free-shipping-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 30px;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.icon-group {
  display: flex;
  gap: 15px;
  align-items: center;
}

.truck-icon {
  width: 48px;
  height: 48px;
  background: #000000;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.text-content h4 {
  font-weight: 800;
  font-size: 17px;
  color: #111827;
  margin-bottom: 4px;
}

.text-content p {
  font-size: 14px;
  color: #4b5563;
}

.progress-container {
  height: 8px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #000000;
  transition: width 0.5s ease;
}

.cart-items-list {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  overflow: hidden;
}

.cart-item {
  display: flex;
  gap: 20px;
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
  position: relative;
}

.item-img-wrapper {
  width: 100px;
  height: 100px;
  background: #f9fafb;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-name {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  max-width: 80%;
}

.cart-item-attributes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 6px 0 12px 0;
}

.attr-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}

.attr-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.15);
  display: inline-block;
  flex-shrink: 0;
}

.size-pill i {
  font-size: 10px;
  color: #64748b;
}

.item-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quantity-picker {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f9fafb;
  padding: 6px 12px;
  border-radius: 8px;
}

.quantity-picker button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #9ca3af;
}

.quantity-picker span {
  font-weight: 700;
  width: 20px;
  text-align: center;
}

.item-price-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.unit-price {
  font-size: 12px;
  color: #9ca3af;
}

.total-price {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
}

.remove-btn {
  position: absolute;
  top: 24px;
  left: 24px;
  background: #fff;
  border: 1px solid #fee2e2;
  color: #ef4444;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.remove-btn:hover {
  background: #ef4444;
  color: #fff;
}

.continue-shopping {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 24px;
  color: #000000;
  font-weight: 700;
  text-decoration: none;
  font-size: 14px;
}

/* Sidebar Summary */
.summary-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  padding: 24px;
  margin-bottom: 24px;
}

.card-title {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 20px;
}

.coupon-input {
  display: flex;
  gap: 10px;
}

.coupon-input input {
  flex: 1;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
}

.coupon-input button {
  padding: 0 20px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.gift-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.gift-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.gift-icon {
  font-size: 20px;
}

.gift-title h4 {
  font-weight: 800;
  font-size: 18px;
}

.gift-desc {
  font-size: 12px;
  color: #9ca3af;
}

.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 25px;
  border-bottom: 1px solid #f3f4f6;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #6b7280;
}

.shipping-row .free {
  color: #10b981;
  font-weight: 700;
}

.final-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.total-label {
  font-size: 20px;
  font-weight: 800;
}

.total-value {
  font-size: 26px;
  font-weight: 900;
  color: #000000;
}

.checkout-btn {
  width: 100%;
  padding: 16px;
  background: #000000;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.checkout-btn:hover {
  background: #4a1936;
  box-shadow: 0 10px 25px rgba(135, 50, 96, 0.2);
}

.tax-note {
  text-align: center;
  margin-top: 15px;
  font-size: 12px;
  color: #9ca3af;
}

/* Toggle Switch Styling */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e5e7eb;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #000000;
}

input:focus + .slider {
  box-shadow: 0 0 1px #000000;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.empty-cart {
  text-align: center;
  padding: 80px 40px;
  background: #fff;
  border-radius: 16px;
  border: 1px dashed #e5e7eb;
}

.empty-cart i {
  font-size: 64px;
  color: #e5e7eb;
  margin-bottom: 20px;
}

.empty-cart h3 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 10px;
}

.empty-cart p {
  color: #9ca3af;
  margin-bottom: 30px;
}

.shop-now-btn {
  padding: 12px 30px;
  background: #000000;
  color: #fff;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 700;
}

@media (max-width: 1024px) {
  .cart-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .main-container { padding: 0 24px; }
}

@media (max-width: 640px) {
  .cart-page { padding: 100px 0 60px; }
  .main-container { padding: 0 12px; }
  .cart-title-section { margin-bottom: 24px; }
  .page-title { font-size: 24px; }
  .page-subtitle { font-size: 13px; }
  .cart-layout { gap: 16px; }

  .free-shipping-card { padding: 16px 14px; margin-bottom: 18px; border-radius: 14px; }
  .truck-icon { width: 40px; height: 40px; font-size: 16px; }
  .text-content h4 { font-size: 15px; }
  .text-content p { font-size: 12.5px; }

  .cart-item { padding: 14px 12px; gap: 12px; }
  .item-img-wrapper { width: 72px; height: 72px; border-radius: 10px; }
  .item-name { font-size: 14.5px; max-width: 75%; }
  .quantity-picker { gap: 8px; padding: 4px 10px; }
  .quantity-picker button { font-size: 17px; }
  .unit-price { font-size: 11px; }
  .total-price { font-size: 15px; }
  .remove-btn { top: 12px; left: 12px; width: 30px; height: 30px; font-size: 12px; }
  .continue-shopping { padding: 14px 12px; font-size: 13px; }

  .summary-card { padding: 16px 14px; margin-bottom: 16px; border-radius: 14px; }
  .card-title { font-size: 16px; margin-bottom: 14px; }
  .coupon-input input { padding: 10px; font-size: 13px; }
  .coupon-input button { padding: 0 14px; font-size: 13px; }
  .summary-rows { gap: 10px; margin-bottom: 16px; padding-bottom: 16px; }
  .summary-row { font-size: 13px; }
  .final-total { margin-bottom: 18px; }
  .total-label { font-size: 16px; }
  .total-value { font-size: 20px; }
  .checkout-btn { padding: 14px; font-size: 15px; }

  .gift-title h4 { font-size: 15px; }

  .empty-cart { padding: 50px 20px; }
  .empty-cart i { font-size: 48px; }
  .empty-cart h3 { font-size: 19px; }
}
</style>
