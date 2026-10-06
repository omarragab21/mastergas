<template>
  <div class="cart-page" :class="{ 'is-ltr': !isRtl }">
    <!-- breadcrumb-flow -->
    <div class="breadcrumb-container">
      <nav class="breadcrumb-flow" aria-label="breadcrumb">
        <!-- crumb-0 (الرئيسية) -->
        <router-link to="/" class="crumb-link">
          {{ isRtl ? 'الرئيسية' : 'Home' }}
        </router-link>

        <!-- chevron-left -->
        <span class="crumb-separator" aria-hidden="true">
          <svg class="crumb-arrow-svg" width="4" height="7" viewBox="0 0 4 7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.59736 0.676858C3.51667 0.737802 3.2758 0.919755 3.13694 1.02812C2.85884 1.24516 2.48929 1.54171 2.12085 1.86161C1.75054 2.18313 1.38989 2.52089 1.12477 2.82095C0.991829 2.9714 0.890812 3.10357 0.825063 3.21264C0.763226 3.31521 0.750367 3.3758 0.750367 3.3758C0.750367 3.3758 0.763227 3.43462 0.825061 3.53719C0.890809 3.64625 0.991825 3.77842 1.12477 3.92888C1.38989 4.22893 1.75054 4.56669 2.12085 4.88821C2.4893 5.20811 2.85885 5.50467 3.13696 5.7217C3.27582 5.83007 3.51635 6.01177 3.59704 6.07271C3.7638 6.19553 3.79977 6.43053 3.67695 6.59729C3.55413 6.76405 3.31938 6.79968 3.15262 6.67686L3.15135 6.6759C3.06672 6.61198 2.81722 6.42353 2.67554 6.31296C2.39115 6.09103 2.0107 5.78581 1.62914 5.45453C1.24946 5.12487 0.860106 4.76204 0.562729 4.42548C0.41442 4.25763 0.281061 4.08748 0.182748 3.9244C0.0906402 3.77161 0 3.57816 0 3.37491C0 3.17165 0.0906433 2.97821 0.182751 2.82542C0.281064 2.66234 0.414422 2.49219 0.56273 2.32434C0.860105 1.98779 1.24945 1.62495 1.62914 1.29529C2.01068 0.964013 2.39113 0.658798 2.67552 0.436859C2.8173 0.326216 3.06681 0.137753 3.15127 0.0739647L3.15236 0.0731398C3.31912 -0.0496775 3.55411 -0.0142297 3.67692 0.152531C3.79974 0.319286 3.7641 0.554038 3.59736 0.676858Z" fill="#000000"/>
          </svg>
        </span>

        <!-- crumb-1 (سلة التسوق) -->
        <span class="crumb-current">
          {{ isRtl ? 'سلة التسوق' : tr('cart.title', 'Shopping Cart') }}
        </span>
      </nav>
    </div>

    <div class="main-content-layout" :class="{ 'empty-layout': cartState.items.length === 0 }">
      <!-- empty-state-card -->
      <div v-if="cartState.items.length === 0" class="empty-state-card">
        <!-- icon-container -->
        <div class="empty-icon-container">
          <svg class="empty-cart-icon-svg" width="37" height="38" viewBox="0 0 37 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M1.28143 0.875457C0.591075 0.875457 0.0314315 1.4351 0.0314315 2.12545C0.0314315 2.81581 0.591073 3.37546 1.28143 3.37546L2.89144 3.37545C3.91791 3.37545 4.77542 4.05172 5.00964 4.96186L9.9684 24.2311C10.1219 24.8276 9.99251 25.4632 9.60572 25.9642L8.37253 27.5615C8.23278 27.5487 8.0912 27.5421 7.9481 27.5421C5.41679 27.5421 3.36476 29.5941 3.36476 32.1255C3.36476 34.6568 5.41679 36.7088 7.9481 36.7088C10.0461 36.7088 11.8148 35.2992 12.3589 33.3755L21.8706 33.3755C22.4147 35.2992 24.1835 36.7088 26.2814 36.7088C28.8127 36.7088 30.8648 34.6568 30.8648 32.1255C30.8648 29.5941 28.8127 27.5421 26.2814 27.5421C24.1835 27.5421 22.4147 28.9517 21.8706 30.8755L12.3589 30.8755C12.0927 29.9344 11.5335 29.1164 10.7861 28.5262L11.5846 27.4919C11.7896 27.2263 11.9627 26.9421 12.1025 26.6448L25.9188 25.4935C28.1798 25.305 30.0001 24.954 31.2391 23.7486C32.4781 22.5433 32.8791 20.7333 33.1296 18.4784L34.067 10.0421L34.6148 10.0421C35.3051 10.0421 35.8648 9.48248 35.8648 8.79212C35.8648 8.10177 35.3051 7.54212 34.6148 7.54212L8.2551 7.54212L7.43075 4.33881C6.90124 2.28117 5.0139 0.875455 2.89143 0.875455L1.28143 0.875457ZM8.89845 10.0421L12.3895 23.6081C12.4318 23.7725 12.4646 23.9381 12.4879 24.104L25.7112 23.0021C27.9977 22.8116 28.9615 22.4765 29.4958 21.9567C30.0301 21.4369 30.3915 20.4827 30.6449 18.2023L31.5516 10.0421L8.89845 10.0421ZM7.9481 30.0421C6.79751 30.0421 5.86476 30.9749 5.86476 32.1255C5.86476 33.276 6.7975 34.2088 7.9481 34.2088C9.09869 34.2088 10.0314 33.276 10.0314 32.1255C10.0314 30.9749 9.09869 30.0421 7.9481 30.0421ZM26.2814 34.2088C25.1308 34.2088 24.1981 33.276 24.1981 32.1255C24.1981 30.9749 25.1308 30.0421 26.2814 30.0421C27.432 30.0421 28.3648 30.9749 28.3648 32.1255C28.3648 33.276 27.432 34.2088 26.2814 34.2088Z" fill="black"/>
          </svg>
        </div>

        <!-- text-container -->
        <div class="empty-text-container">
          <h3 class="empty-title">{{ isRtl ? 'سلة التسوق فارغة' : tr('cart.empty', 'Your shopping cart is empty') }}</h3>
          <p class="empty-subtitle">{{ isRtl ? 'لم تقم بإضافة أي منتجات إلى سلة التسوق بعد.' : tr('cart.empty_message_desc', 'You haven\'t added any products to your shopping cart yet.') }}</p>
        </div>

        <!-- actions-row -->
        <div class="empty-actions-row">
          <router-link to="/products" class="empty-btn-primary">
            {{ isRtl ? 'استكشف المنتجات' : tr('cart.explore_products', 'Explore Products') }}
          </router-link>
        </div>
      </div>

      <template v-else>
        <!-- Cart Items List Area (Right in RTL, Left in LTR) -->
        <div class="cart-list-area">
          <div class="cart-table-card">
            <template v-for="(item, index) in cartState.items" :key="item.cart_item_key || item.id">
              <div v-if="index > 0" class="cart-divider"></div>
              <div class="cart-item-row">
                <div class="row-content">
                  <!-- Remove Button (Circle with trash icon on far left in RTL) -->
                  <button
                    type="button"
                    class="remove-btn"
                    @click="cartState.removeFromCart(item.cart_item_key || item.id)"
                    :aria-label="tr('cart.delete_item', 'حذف المنتج')"
                  >
                    <svg class="delete-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"/>
                    </svg>
                  </button>

                  <!-- Item Line Total (Price + Riyal Symbol) -->
                  <div class="item-line-total">
                    <svg class="riyal-icon item-riyal" width="12.17" height="13.6" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
                      <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                      <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                    </svg>
                    <span class="price-val">{{ formatPrice(getItemPriceWithDiscount(item)) }}</span>
                  </div>

                  <!-- Quantity Selector (+, 1, −) -->
                  <div class="qty-selector">
                    <button
                      type="button"
                      class="qty-btn"
                      @click="cartState.updateQuantity(item.cart_item_key || item.id, item.quantity + 1)"
                      :aria-label="tr('cart.increase_qty', 'زيادة الكمية')"
                    >+</button>
                    <span class="qty-num">{{ item.quantity }}</span>
                    <button
                      type="button"
                      class="qty-btn"
                      @click="cartState.updateQuantity(item.cart_item_key || item.id, item.quantity - 1)"
                      :disabled="item.quantity <= 1"
                      :aria-label="tr('cart.decrease_qty', 'إنقاص الكمية')"
                    >−</button>
                  </div>

                  <!-- Item Details (Title, SKU, Features) -->
                  <div class="item-details" @click="goToProduct(item)">
                    <h3 class="item-title">{{ localized(item, 'name') }}</h3>
                    <p class="item-code" v-if="getItemSku(item)">{{ getItemSku(item) }}</p>
                    <p class="item-features" v-if="getItemSubtitle(item)">{{ getItemSubtitle(item) }}</p>
                  </div>

                  <!-- Product Thumbnail (80x80px on far right in RTL) -->
                  <div class="product-thumb" @click="goToProduct(item)">
                    <img :src="getImageUrl(item.image || item.images?.[0], item.id)" :alt="localized(item, 'name')" @error="onImageError($event, item)">
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Order Summary Card (Left in RTL, Right in LTR) -->
        <aside class="summary-card">
          <h4 class="summary-title">{{ tr('checkout.order_summary', 'ملخص الطلب') }}</h4>
          <div class="summary-divider"></div>

          <!-- Coupon Row -->
          <div class="coupon-container">
            <div class="coupon-row">
              <button type="button" class="btn-apply" @click="applyCoupon" :disabled="couponLoading">
                {{ couponLoading ? '...' : tr('cart.apply_coupon', 'تطبيق') }}
              </button>
              <input
                type="text"
                class="coupon-input-field"
                v-model="couponCode"
                :placeholder="tr('cart.coupon_placeholder', 'رمز الكوبون أو القسيمة')"
                @keyup.enter="applyCoupon"
              />
            </div>
            <p v-if="couponMessage" class="coupon-msg" :class="couponMessageType">{{ couponMessage }}</p>
          </div>

          <!-- Summary Rows -->
          <div class="summary-rows">
            <!-- Row Subtotal -->
            <div class="summary-row row-subtotal">
              <div class="price-unit">
                <svg class="riyal-icon summary-riyal" width="11.41" height="12.75" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
                  <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                  <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                </svg>
                <span class="price-val">{{ formatPrice(subtotalWithDiscount) }}</span>
              </div>
              <span class="summary-label">{{ tr('checkout.subtotal', 'المجموع الفرعي') }}</span>
            </div>

            <!-- Discount if applied -->
            <template v-if="discountAmount > 0">
              <div class="summary-row-divider"></div>
              <div class="summary-row row-discount">
                <div class="price-unit discount-unit">
                  <span class="minus-sign">-</span>
                  <svg class="riyal-icon summary-riyal" width="11.41" height="12.75" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
                    <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                    <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                  </svg>
                  <span class="price-val">{{ formatPrice(discountAmount) }}</span>
                </div>
                <span class="summary-label">{{ tr('checkout.discount', 'الخصم') }}</span>
              </div>
            </template>

            <div class="summary-row-divider"></div>

            <!-- Row VAT (15%) -->
            <div class="summary-row row-vat">
              <div class="price-unit">
                <svg class="riyal-icon summary-riyal" width="11.41" height="12.75" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
                  <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                  <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                </svg>
                <span class="price-val">{{ formatPrice(taxAmount) }}</span>
              </div>
              <span class="summary-label">{{ vatLabelText }}</span>
            </div>

            <div class="summary-row-divider"></div>

            <!-- Row Shipping -->
            <div class="summary-row row-shipping">
              <div class="price-unit">
                <svg class="riyal-icon summary-riyal" width="11.41" height="12.75" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
                  <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                  <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                </svg>
                <span class="price-val">{{ formatPrice(shippingAmount) }}</span>
              </div>
              <span class="summary-label">{{ tr('checkout.shipping_fees', 'رسوم الشحن والتوصيل') }}</span>
            </div>

            <div class="summary-row-divider"></div>

            <!-- Row Total -->
            <div class="summary-row row-total">
              <div class="price-unit total-price-unit">
                <svg class="riyal-icon total-riyal" width="16.73" height="18.7" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
                  <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                  <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                </svg>
                <span class="total-price-val">{{ formatPrice(grandTotal) }}</span>
              </div>
              <span class="total-label">{{ tr('checkout.total', 'الإجمالي') }}</span>
            </div>
          </div>

          <!-- Summary Actions -->
          <div class="summary-actions">
            <router-link to="/checkout" class="primary-button">
              {{ tr('cart.continue_order', 'متابعة الطلب') }}
            </router-link>
            <router-link to="/products" class="secondary-button">
              {{ tr('cart.continue_shopping', 'متابعة التسوق') }}
            </router-link>
          </div>
        </aside>
      </template>
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
import { useCartSummary } from '../../composables/useCartSummary';
import { couponService } from '../../services/couponService';
import { getCartItemSku, getCartItemSubtitle } from '../../domain/cart/cartItemPresentation';

const router = useRouter();
const { t, te, locale } = useI18n();
const { localized } = useLocalized();
const { getActiveOfferForProduct, calculatePriceWithOffer, fetchOffers } = useOffers();
const { fetchSettings, getSetting } = useSettings();

const isRtl = computed(() => {
  const current = locale.value || localStorage.getItem('lang') || 'ar';
  return current !== 'en';
});

// Robust translation helper with fallback
const tr = (key, fallback, params = {}) => {
  try {
    if (te && te(key)) {
      const res = t(key, params);
      if (res && res !== key) return res;
    }
  } catch (_) {}
  return fallback;
};

// Coupon state
const couponCode = ref('');
const couponLoading = ref(false);
const couponMessage = ref('');
const couponMessageType = ref('');
const appliedCoupon = ref(null);
const discountAmount = ref(0);

// Calculate item price with offer discount
const getItemPriceWithDiscount = (item) => {
  const offer = getActiveOfferForProduct(item);
  if (offer) {
    const price = calculatePriceWithOffer(item, offer);
    return price * item.quantity;
  }
  return (item.price * (1 - (item.discount / 100 || 0))) * item.quantity;
};

const getItemSku = getCartItemSku;
const getItemSubtitle = (item) => getCartItemSubtitle(item, { isEnglish: !isRtl.value });

const {
  taxRate,
  shippingCost,
  freeDeliveryThreshold,
  subtotalWithDiscount,
  shippingAmount,
  taxAmount,
  grandTotal,
  vatLabelText,
} = useCartSummary({
  items: cartState.items,
  getItemPrice: getItemPriceWithDiscount,
  getSetting,
  discountAmount,
  translate: tr,
});

// Format prices with standard thousands separators and decimals
const formatPrice = (price) => {
  const val = Number(price);
  if (isNaN(val)) return '0';
  return val.toLocaleString('en-US', {
    minimumFractionDigits: val % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2
  });
};

// Image URL handling
const getImageUrl = (path, id) => {
  const rawPath = typeof path === 'object' && path !== null
    ? (path.image_url || path.url || path.image || path.path || '')
    : path;
  if (rawPath && (String(rawPath).startsWith('/') || String(rawPath).startsWith('http'))) {
    return rawPath;
  }
  if (!rawPath) return id ? `/catalog_images/prod_${id}.jpg` : '/images/home/product_ceramic_hob_60.png';
  const baseUrl = (api.defaults?.baseURL || import.meta.env.VITE_API_BASE_URL || 'https://backend-mastergas.be-kite.com/api');
  if (String(rawPath).includes('catalog_images')) return `/${String(rawPath).replace(/^\//, '')}`;
  return `${baseUrl.replace('/api', '')}/storage/${rawPath}`;
};

const onImageError = (event, item) => {
  const target = event.target;
  if (!target) return;
  if (item?.id && !target.src.includes(`prod_${item.id}.jpg`)) {
    target.src = `/catalog_images/prod_${item.id}.jpg`;
  } else if (!target.src.includes('product_ceramic_hob_60.png')) {
    target.src = '/images/home/product_ceramic_hob_60.png';
  }
};

const goToProduct = (product) => {
  router.push(`/product/${product.id}`);
};

const applyCoupon = async () => {
  if (!couponCode.value || !couponCode.value.trim()) return;
  couponLoading.value = true;
  couponMessage.value = '';
  try {
    const d = await couponService.validate(couponCode.value, subtotalWithDiscount.value);
    if (d.success || d.valid || d.status === 'success' || (d.data && d.data.value)) {
      appliedCoupon.value = d.data || { code: couponCode.value };
      discountAmount.value = Number(d.discount || d.data?.value || 0);
      couponMessage.value = d.message || tr('cart.coupon_applied_success', 'تم تطبيق الكوبون بنجاح');
      couponMessageType.value = 'success';
    } else {
      appliedCoupon.value = null;
      discountAmount.value = 0;
      couponMessage.value = d.message || tr('cart.coupon_invalid', 'رمز الكوبون غير صالح');
      couponMessageType.value = 'error';
    }
  } catch (err) {
    appliedCoupon.value = null;
    discountAmount.value = 0;
    couponMessage.value = err.response?.data?.message || tr('cart.coupon_invalid', 'رمز الكوبون غير صالح');
    couponMessageType.value = 'error';
  } finally {
    couponLoading.value = false;
  }
};

onMounted(() => {
  cartState.refreshCartItems();
  fetchSettings();
  fetchOffers();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');

.cart-page {
  padding: 140px 0 80px;
  background: #FFFFFF;
  min-height: calc(100vh - 200px);
  direction: rtl;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  color: #000000;
}

/* breadcrumb-container */
.breadcrumb-container {
  max-width: 1440px;
  margin: 0 auto 24px;
  padding: 0 64px;
  box-sizing: border-box;
}

/* breadcrumb-flow */
.breadcrumb-flow {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 8px;
  width: fit-content;
  height: 21px;
}

/* crumb-0 */
.crumb-link {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #64748B;
  text-decoration: none;
  transition: color 0.2s ease;
}

.crumb-link:hover {
  color: #000000;
}

/* chevron-left */
.crumb-separator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.crumb-arrow-svg {
  width: 4px;
  height: 7px;
  display: block;
}

.cart-page.is-ltr .crumb-arrow-svg {
  transform: rotate(180deg);
}

/* crumb-1 */
.crumb-current {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
}

/* main-content-layout */
.main-content-layout {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0 64px 80px;
  gap: 32px;
  max-width: 1440px;
  margin: 0 auto;
  box-sizing: border-box;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  direction: rtl;
}

/* summary-card */
.summary-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 24px;
  gap: 20px;
  width: 400px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  flex-shrink: 0;
}

/* ملخص الطلب */
.summary-title {
  width: 100%;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
  line-height: 27px;
  text-align: right;
  color: #000000;
  margin: 0;
}

/* Line */
.summary-divider {
  box-sizing: border-box;
  width: 100%;
  height: 0px;
  border: none;
  border-top: 1px solid #E2E8F0;
  margin: 0;
}

/* coupon-container */
.coupon-container {
  display: flex;
  flex-direction: column;
  padding: 0px;
  gap: 8px;
  width: 100%;
}

/* coupon-row */
.coupon-row {
  direction: ltr;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 8px;
  width: 100%;
  height: 45px;
}

/* btn-apply */
.btn-apply {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 20px;
  width: 75px;
  height: 45px;
  background: #000000;
  border: none;
  border-radius: 8px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #FFFFFF;
  cursor: pointer;
  transition: opacity 0.2s;
  flex-shrink: 0;
}
.btn-apply:hover:not(:disabled) {
  opacity: 0.85;
}
.btn-apply:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* coupon-input-field */
.coupon-input-field {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  flex: 1;
  height: 45px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  direction: rtl;
  text-align: right;
  color: #000000;
  outline: none;
  transition: border-color 0.2s;
}
.coupon-input-field:focus {
  border-color: #000000;
}
.coupon-input-field::placeholder {
  color: #64748B;
}

.coupon-msg {
  font-size: 13px;
  margin: 0;
  text-align: right;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
}
.coupon-msg.success {
  color: #16a34a;
}
.coupon-msg.error {
  color: #dc2626;
}

/* summary-rows */
.summary-rows {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0px;
  gap: 12px;
  width: 100%;
}

.summary-row {
  direction: ltr;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 24px;
}

.summary-label {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #64748B;
  text-align: right;
}

.summary-row-divider {
  box-sizing: border-box;
  width: 100%;
  height: 0px;
  border: none;
  border-top: 1px solid #E2E8F0;
  margin: 0;
}

.price-unit {
  direction: ltr;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 4px;
}

.price-unit .price-val {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
}

.discount-unit .minus-sign {
  font-weight: 700;
  font-size: 16px;
  color: #dc2626;
}
.discount-unit .price-val {
  color: #dc2626;
}

.riyal-icon {
  display: inline-block;
  vertical-align: middle;
  color: #111827;
  flex-shrink: 0;
}

.summary-riyal {
  width: 11.41px;
  height: 12.75px;
}

/* row-total */
.row-total {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 36px;
  margin-top: 4px;
}

.total-label {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
  line-height: 27px;
  color: #000000;
}

.total-price-unit {
  direction: ltr;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 4px;
}

.total-riyal {
  width: 16.73px;
  height: 18.7px;
}

.total-price-val {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 36px;
  color: #000000;
}

/* summary-actions */
.summary-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0px;
  gap: 12px;
  width: 100%;
}

.primary-button {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px 24px;
  width: 100%;
  height: 56px;
  background: #000000;
  border-radius: 6px;
  border: none;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #FFFFFF;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s, background 0.2s;
}
.primary-button:hover {
  background: #1f2937;
}

.secondary-button {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px 24px;
  width: 100%;
  height: 56px;
  background: #FFFFFF;
  border: 1.5px solid #000000;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s;
}
.secondary-button:hover {
  background: #f8fafc;
}

/* cart-list-area */
.cart-list-area {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0px;
  gap: 24px;
  flex: 1;
}

/* cart-table-card */
.cart-table-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
}

/* cart-item-row */
.cart-item-row {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  padding: 0px;
  width: 100%;
}

.cart-divider {
  box-sizing: border-box;
  width: 100%;
  height: 0px;
  border: none;
  border-top: 1px solid #E2E8F0;
  margin: 0;
}

/* row-content */
.row-content {
  direction: ltr;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px 0px;
  gap: 16px;
  width: 100%;
}

/* remove-btn */
.remove-btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  width: 32px;
  height: 32px;
  background: #F1F5F9;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  color: #161616;
  transition: background 0.2s, color 0.2s;
  flex-shrink: 0;
}
.remove-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* item-line-total */
.item-line-total {
  direction: ltr;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 4px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
  flex-shrink: 0;
}
.item-riyal {
  width: 12.17px;
  height: 13.6px;
}

/* qty-selector */
.qty-selector {
  box-sizing: border-box;
  direction: ltr;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  gap: 8px;
  width: 69px;
  height: 32px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  flex-shrink: 0;
}
.qty-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10px;
  height: 24px;
  transition: opacity 0.2s;
}
.qty-btn:hover:not(:disabled) {
  opacity: 0.6;
}
.qty-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}
.qty-num {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  text-align: center;
  width: 12px;
}

/* item-details */
.item-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  direction: rtl;
  padding: 0px;
  gap: 6px;
  flex: 1;
  min-width: 0;
  cursor: pointer;
}
.item-title {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  text-align: right;
  color: #000000;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
.item-code {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  text-align: right;
  color: #64748B;
  margin: 0;
  width: 100%;
}
.item-features {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  text-align: right;
  color: #64748B;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

/* product-thumb */
.product-thumb {
  box-sizing: border-box;
  width: 80px;
  height: 80px;
  min-width: 80px;
  min-height: 80px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
}
.product-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}

/* empty-state-card */
.empty-state-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 48px;
  gap: 24px;
  width: 1312px;
  max-width: 100%;
  height: 331px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  margin: 0 auto;
  flex: none;
  order: 0;
  flex-grow: 1;
}

/* icon-container */
.empty-icon-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  width: 80px;
  height: 80px;
  background: #F1F5F9;
  border-radius: 9999px;
  flex: none;
  order: 0;
  flex-grow: 0;
}

.empty-cart-icon-svg {
  width: 37px;
  height: 38px;
}

/* text-container */
.empty-text-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  gap: 8px;
  width: 100%;
  max-width: 1216px;
  height: 62px;
  border-radius: 0px;
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;
}

/* سلة التسوق فارغة */
.empty-title {
  width: 100%;
  max-width: 1216px;
  height: 30px;
  margin: 0;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 30px;
  text-align: center;
  color: #000000;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
}

/* لم تقم بإضافة أي منتجات إلى سلة التسوق بعد. */
.empty-subtitle {
  width: 100%;
  max-width: 1216px;
  height: 24px;
  margin: 0;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  text-align: center;
  color: #64748B;
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;
}

/* actions-row */
.empty-actions-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  gap: 12px;
  width: 155px;
  height: 45px;
  border-radius: 0px;
  flex: none;
  order: 2;
  flex-grow: 0;
}

/* btn-primary */
.empty-btn-primary {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  width: 155px;
  height: 45px;
  background: #000000;
  border-radius: 8px;
  text-decoration: none;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #FFFFFF;
  text-align: center;
  transition: opacity 0.2s ease, transform 0.2s ease;
  flex: none;
  order: 0;
  flex-grow: 0;
}

.empty-btn-primary:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}

/* LTR Support for English */
.cart-page.is-ltr {
  direction: ltr;
}
.cart-page.is-ltr .main-content-layout {
  direction: ltr;
}
.cart-page.is-ltr .summary-title {
  text-align: left;
}
.cart-page.is-ltr .coupon-row {
  flex-direction: row-reverse;
}
.cart-page.is-ltr .coupon-input-field {
  direction: ltr;
  text-align: left;
}
.cart-page.is-ltr .coupon-msg {
  text-align: left;
}
.cart-page.is-ltr .summary-row {
  flex-direction: row-reverse;
}
.cart-page.is-ltr .summary-label,
.cart-page.is-ltr .total-label {
  text-align: left;
}
.cart-page.is-ltr .row-content {
  flex-direction: row-reverse;
}
.cart-page.is-ltr .item-details {
  direction: ltr;
  text-align: left;
  align-items: flex-start;
}
.cart-page.is-ltr .item-title,
.cart-page.is-ltr .item-code,
.cart-page.is-ltr .item-features {
  text-align: left;
}

/* Responsive */
@media (max-width: 1024px) {
  .breadcrumb-container {
    padding: 0 24px;
    margin-bottom: 20px;
  }
  .main-content-layout {
    flex-direction: column-reverse;
    padding: 0 24px 60px;
    gap: 24px;
  }
  .summary-card {
    width: 100%;
  }
  .cart-list-area {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .breadcrumb-container {
    padding: 0 16px;
    margin-bottom: 16px;
  }
  .main-content-layout {
    padding: 0 16px 40px;
  }
  .cart-table-card {
    padding: 16px;
  }
  .row-content {
    flex-wrap: wrap;
    gap: 12px;
  }
  .product-thumb {
    order: 0;
  }
  .item-details {
    order: 1;
    min-width: 180px;
  }
  .qty-selector {
    order: 2;
  }
  .item-line-total {
    order: 3;
    margin-right: auto;
  }
  .remove-btn {
    order: 4;
  }
  .empty-state-card {
    padding: 32px 16px;
    height: auto;
    min-height: 280px;
    gap: 16px;
  }
  .empty-text-container {
    height: auto;
  }
  .empty-title {
    font-size: 18px;
    line-height: 26px;
    height: auto;
  }
  .empty-subtitle {
    font-size: 14px;
    line-height: 20px;
    height: auto;
  }
}
</style>
