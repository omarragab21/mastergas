<template>
  <div class="wishlist-page">
    <div class="container main-container">
      <div class="account-layout">
        <!-- Sidebar Menu -->
        <aside class="account-sidebar">
          <div class="sidebar-inner">
            <nav class="sidebar-nav">
              <template v-if="isLoggedIn">
                <router-link to="/profile?tab=info" class="nav-item">
                  <i class="far fa-user"></i>
                  <span>{{ t('profile.personal_info') }}</span>
                </router-link>
                <router-link to="/profile?tab=addresses" class="nav-item">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>{{ t('profile.addresses') }}</span>
                </router-link>
                <router-link to="/profile?tab=orders" class="nav-item">
                  <i class="fas fa-shopping-bag"></i>
                  <span>{{ t('profile.orders') }}</span>
                </router-link>
              </template>
              <router-link to="/wishlist" class="nav-item active">
                <i class="far fa-heart"></i>
                <span>{{ t('profile.wishlist') }}</span>
                <span class="count-badge" v-if="cartState.wishlist.length > 0">{{ cartState.wishlist.length }}</span>
              </router-link>
            </nav>
            <div class="sidebar-footer" v-if="isLoggedIn">
              <button class="logout-btn" @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i>
                <span>{{ t('profile.logout') }}</span>
              </button>
            </div>
            <div class="sidebar-guest-msg" v-else>
              <p>{{ t('wishlist.login_prompt') }}</p>
            </div>
          </div>
        </aside>

        <!-- Main Wishlist Content -->
        <div class="wishlist-main">
          <header class="wishlist-header">
            <h1 class="page-title">{{ t('profile.wishlist') }} <span class="count">({{ cartState.wishlist.length }})</span></h1>
          </header>

          <div v-if="cartState.wishlist.length === 0" class="empty-wishlist">
            <div class="empty-icon-container">
              <i class="far fa-heart empty-heart-icon" aria-hidden="true"></i>
            </div>
            <div class="empty-text-container">
              <h3 class="empty-title">{{ t('wishlist.empty_title') }}</h3>
              <p class="empty-subtitle">{{ t('wishlist.empty_desc') }}</p>
            </div>
            <router-link to="/products" class="empty-btn-primary">{{ t('home.shop_now') }}</router-link>
          </div>

          <div v-else class="wishlist-list">
            <div v-for="item in cartState.wishlist" :key="item.id" class="wishlist-item">
              <div class="item-visual" @click="goToProduct(item)" style="cursor: pointer;">
                <img :src="getImageUrl(item.image || item.images?.[0], item.id)" :alt="localized(item, 'name')" @error="onImageError">
                <div class="discount-label" v-if="item.discount > 0">
                  -{{ Math.round(item.discount) }}%
                </div>
              </div>
              
              <div class="item-details">
                <div class="item-text">
                  <h3 class="item-name" @click="goToProduct(item)" style="cursor: pointer;">{{ localized(item, 'name') }}</h3>
                  <p class="item-desc">{{ localized(item, 'description') || t('wishlist.default_desc') }}</p>
                  <div class="item-status">
                    <span class="status-tag in-stock" v-if="item.quantity > 0">{{ t('product.in_stock') }}</span>
                    <span class="status-tag out-of-stock" v-else>{{ t('product.out_of_stock') }}</span>
                  </div>
                </div>

                <div class="item-price-actions">
                  <div class="price-box">
                    <span class="current-price">
                      <span>{{ formatPrice(item.sale_price || (item.price * (1 - (item.discount / 100 || 0)))) }}</span>
                      <img :src="riyalIcon" alt="" class="currency-symbol-svg" aria-hidden="true" />
                    </span>
                    <span class="old-price" v-if="item.discount > 0">
                      <span>{{ formatPrice(item.price) }}</span>
                      <img :src="riyalIcon" alt="" class="currency-symbol-svg is-muted" aria-hidden="true" />
                    </span>
                  </div>
                  
                  <div class="action-btns">
                    <button class="cart-btn" @click="cartState.addToCart(item)" :disabled="item.quantity <= 0">
                      <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button class="remove-btn" @click="cartState.toggleWishlist(item)">
                      <i class="far fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useSettings } from '../../../composables/useSettings';
import { cartState } from '../../../store/cart';
import { authState, authActions } from '../../../store/auth';
import { useLocalized } from '../../../composables/useLocalized';
import riyalIcon from '../../../assets/riyal.svg';
import { formatPrice } from '../../../utils/price';

const router = useRouter();
const { t } = useI18n();
const { fetchSettings } = useSettings();
const { localized } = useLocalized();
const isLoggedIn = computed(() => !!authState.token);

const getImageUrl = (path, id) => {
  const rawPath = typeof path === 'object' && path !== null
    ? (path.image_url || path.url || path.image || path.path || path.image_path || '')
    : path;
  if (rawPath && (String(rawPath).startsWith('/') || String(rawPath).startsWith('http'))) {
    return rawPath;
  }
  if (!rawPath) return '/brand/mastergas-icon.png';
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://backend-tijara.be-kite.com/api';
  return `${baseUrl.replace('/api', '')}/storage/${rawPath}`;
};


const goToProduct = (product) => {
  router.push(`/product/${product.id}`);
};

const onImageError = (event) => {
  if (!String(event.target.src).endsWith('/brand/mastergas-icon.png')) {
    event.target.src = '/brand/mastergas-icon.png';
  }
};

onMounted(() => {
  fetchSettings();
  cartState.hydrateWishlist();
});

const handleLogout = () => {
  authActions.logout();
};
</script>

<style scoped>
.main-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

.wishlist-page {
  padding: 140px 0 100px;
  background: #fdfcfd;
}

.account-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
  align-items: start;
}

/* Sidebar Menu */
.account-sidebar {
  position: sticky;
  top: 100px;
}

.sidebar-inner {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #f3f4f6;
  padding: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 14px 18px;
  border-radius: 12px;
  color: #6b7280;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s;
  position: relative;
}

.nav-item i {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.nav-item:hover {
  background: #fdfcfd;
  color: #000000;
}

.nav-item.active {
  background: #000000;
  color: #fff;
}

.count-badge {
  background: #fff;
  color: #000000;
  font-size: 11px;
  font-weight: 800;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: auto;
}

.count-badge.danger {
  background: #fee2e2;
  color: #ef4444;
}

.sidebar-footer {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f3f4f6;
}

.logout-btn {
  width: 100%;
  background: none;
  border: none;
  padding: 14px 18px;
  color: #ef4444;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  border-radius: 12px;
}

.logout-btn:hover {
  background: #fef2f2;
}

/* Main Wishlist */
.wishlist-main {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #f3f4f6;
  padding: 30px;
  min-height: 600px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}

.wishlist-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f3f4f6;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
}

.page-title .count {
  color: #9ca3af;
  font-weight: 400;
  font-size: 18px;
}

.wishlist-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.wishlist-item {
  display: flex;
  gap: 25px;
  padding: 20px;
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 16px;
  transition: all 0.3s;
}

.wishlist-item:hover {
  border-color: rgba(0,0,0,0.15);
  box-shadow: 0 10px 25px rgba(0,0,0,0.03);
}

.item-visual {
  width: 120px;
  height: 120px;
  background: #f9fafb;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.item-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discount-label {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #f43f5e;
  color: #fff;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.item-details {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.item-text {
  flex: 1;
  padding-left: 20px;
}

.item-name {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 5px;
}

.item-desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.status-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 20px;
}

.in-stock {
  background: #ecfdf5;
  color: #10b981;
}

.out-of-stock {
  background: #fef2f2;
  color: #ef4444;
}

.item-price-actions {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  min-width: 120px;
}

.price-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.current-price {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 20px;
  font-weight: 800;
  color: #000000;
}

.old-price {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #9ca3af;
}

.old-price > span {
  text-decoration: line-through;
}

/* Same riyal SVG as the product card */
.currency-symbol-svg {
  width: 14px;
  height: 16px;
  display: block;
  flex: 0 0 14px;
}

.currency-symbol-svg.is-muted {
  width: 11px;
  height: 13px;
  flex-basis: 11px;
  opacity: 0.45;
}

.action-btns {
  display: flex;
  gap: 10px;
}

.action-btns button {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btns .cart-btn {
  background: #fff;
  border: 1px solid #f3f4f6;
  color: #000000;
}

.action-btns .cart-btn:hover:not(:disabled) {
  background: var(--color-button-hover);
  color: #fff;
}

.action-btns .remove-btn {
  background: #fff;
  border: 1px solid #fee2e2;
  color: #ef4444;
}

.action-btns .remove-btn:hover {
  background: #ef4444;
  color: #fff;
}

/* Empty state: same design as the empty cart (grey circle, text, black button) */
.empty-wishlist {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 64px 24px;
  text-align: center;
}

.empty-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  background: #F1F5F9;
  border-radius: 9999px;
  flex: none;
}

/* Outline heart (Font Awesome regular), black, nothing inside */
.empty-heart-icon {
  font-size: 36px;
  line-height: 1;
  color: #000000;
}

.empty-text-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 520px;
}

.empty-title {
  margin: 0;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-weight: 500;
  font-size: 20px;
  line-height: 30px;
  color: #000000;
}

.empty-subtitle {
  margin: 0;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #64748B;
}

.empty-btn-primary {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 155px;
  height: 45px;
  padding: 12px 24px;
  background: #000000;
  border-radius: 8px;
  text-decoration: none;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #FFFFFF;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.empty-btn-primary:hover {
  background: var(--color-button-hover);
  transform: translateY(-1px);
}

.sidebar-guest-msg {
  margin-top: 15px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 12px;
  text-align: center;
}

.sidebar-guest-msg p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .wishlist-page {
    padding: 24px 0 60px;
  }
  .main-container {
    padding: 0 24px;
  }
}

@media (max-width: 768px) {
  .wishlist-page {
    padding: 24px 0 60px;
  }
  .main-container {
    padding: 0 16px;
  }
  .account-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .account-sidebar {
    display: none;
  }
  .page-title {
    font-size: 22px;
  }
  .wishlist-main {
    padding: 16px;
    min-height: 0;
    border-radius: 16px;
  }
  .empty-wishlist {
    gap: 16px;
    padding: 40px 8px;
  }
  .empty-title {
    font-size: 18px;
    line-height: 26px;
  }
  .empty-subtitle {
    font-size: 14px;
    line-height: 20px;
  }
  .wishlist-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
  }
  .wishlist-item {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }
  .item-details {
    flex-direction: column;
    gap: 12px;
  }
  .item-text {
    padding-left: 0;
  }
  .item-name {
    font-size: 16px;
  }
  .item-visual {
    width: 100%;
    height: 180px;
  }
  .item-price-actions {
    flex-direction: row;
    width: 100%;
    margin-top: 12px;
  }
}
</style>
