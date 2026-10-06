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
            <div class="heart-icon">❤️</div>
            <h3>{{ t('wishlist.empty_title') }}</h3>
            <p>{{ t('wishlist.empty_desc') }}</p>
            <router-link to="/products" class="shop-btn">{{ t('home.shop_now') }}</router-link>
          </div>

          <div v-else class="wishlist-list">
            <div v-for="item in cartState.wishlist" :key="item.id" class="wishlist-item">
              <div class="item-visual" @click="goToProduct(item)" style="cursor: pointer;">
                <img :src="getImageUrl(item.image || item.images?.[0], item.id)" :alt="localized(item, 'name')" @error="$event.target.src = '/images/home/product_ceramic_hob_60.png'">
                <div class="discount-label" v-if="item.discount > 0">
                  -{{ Math.round((item.discount / item.price) * 100) }}%
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
                    <span class="current-price">{{ (item.price * (1 - (item.discount/100 || 0))).toLocaleString('en-US') }} {{ currency }}</span>
                    <span class="old-price" v-if="item.discount > 0">{{ item.price.toLocaleString('en-US') }} {{ currency }}</span>
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
import { useSettings } from '../../composables/useSettings';
import { cartState } from '../../store/cart';
import { authState, authActions } from '../../store/auth';
import { useLocalized } from '../../composables/useLocalized';

const router = useRouter();
const { t } = useI18n();
const { currency, fetchSettings } = useSettings();
const { localized } = useLocalized();
const isLoggedIn = computed(() => !!authState.token);

const getImageUrl = (path, id) => {
  const rawPath = typeof path === 'object' && path !== null
    ? (path.image_url || path.url || path.image || path.path || path.image_path || '')
    : path;
  if (rawPath && (String(rawPath).startsWith('/') || String(rawPath).startsWith('http'))) {
    return rawPath;
  }
  if (!rawPath) return id ? `/catalog_images/prod_${id}.jpg` : '/images/home/product_ceramic_hob_60.png';
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://backend-mastergas.be-kite.com/api';
  if (String(rawPath).includes('catalog_images')) return `/${String(rawPath).replace(/^\//, '')}`;
  return `${baseUrl.replace('/api', '')}/storage/${rawPath}`;
};

const goToProduct = (product) => {
  router.push(`/product/${product.id}`);
};

onMounted(() => {
  fetchSettings();
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
  font-size: 20px;
  font-weight: 800;
  color: #000000;
}

.old-price {
  font-size: 13px;
  color: #9ca3af;
  text-decoration: line-through;
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
  background: #000000;
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

.empty-wishlist {
  text-align: center;
  padding: 100px 20px;
}

.heart-icon {
  font-size: 80px;
  margin-bottom: 25px;
}

.empty-wishlist h3 {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 10px;
}

.empty-wishlist p {
  color: #9ca3af;
  margin-bottom: 30px;
}

.shop-btn {
  padding: 14px 40px;
  background: #000000;
  color: #fff;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 700;
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

@media (max-width: 768px) {
  .wishlist-page {
    padding: 100px 0 60px;
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
  .wishlist-item {
    flex-direction: column;
    gap: 12px;
    padding: 14px;
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
