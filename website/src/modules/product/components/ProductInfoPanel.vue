<template>
          <div class="info-column">
            
            <!-- Brand & Title Block -->
            <div class="brand-and-title">
              <!-- image-actions-bar -->
              <div class="image-actions-bar">
                <div class="category-origin-group">
                  <span v-if="localized(product.category, 'name')" class="category-name">{{ localized(product.category, 'name') }}</span>
                </div>
                <button class="share-action-btn" @click.stop="emit('open-share')" type="button" :title="locale === 'ar' ? 'مشاركة المنتج' : 'Share product'">
                  <span>{{ locale === 'ar' ? 'مشاركة' : 'Share' }}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="share-icon-svg">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                </button>
                <button
                  class="favorite-detail-btn"
                  :class="{ active: isFavorite }"
                  type="button"
                  @click.stop="toggleFavorite"
                  :title="isFavorite ? (locale === 'ar' ? 'إزالة من المفضلة' : 'Remove from wishlist') : (locale === 'ar' ? 'إضافة إلى المفضلة' : 'Add to wishlist')"
                  :aria-label="isFavorite ? (locale === 'ar' ? 'إزالة من المفضلة' : 'Remove from wishlist') : (locale === 'ar' ? 'إضافة إلى المفضلة' : 'Add to wishlist')"
                >
                  <i :class="isFavorite ? 'fas fa-heart' : 'far fa-heart'" aria-hidden="true"></i>
                  <span>{{ isFavorite ? (locale === 'ar' ? 'في المفضلة' : 'Saved') : (locale === 'ar' ? 'أضف للمفضلة' : 'Save') }}</span>
                </button>
              </div>

              <!-- Product Title -->
              <h1 v-if="localized(product, 'name')" class="main-title">{{ localized(product, 'name') }}</h1>

              <!-- Model & Rating Row -->
              <div class="model-rating-bar">
                <span v-if="product.sku || product.model_number" class="model-code">{{ locale === 'ar' ? 'الموديل' : 'Model' }}: {{ product.sku || product.model_number }}</span>
                <span class="v-line"></span>
                <div class="rating-group">
                  <span class="rating-count">({{ locale === 'ar' ? `${computedRatingCount} تقييم` : `${computedRatingCount} reviews` }})</span>
                  <span class="rating-val">{{ Number(computedAverageRating).toFixed(1) }}</span>
                  <div class="stars-cluster">
                    <i v-for="i in Math.floor(computedAverageRating)" :key="'h-star-'+i" class="fas fa-star filled-star"></i>
                    <i v-if="(computedAverageRating % 1) >= 0.15" class="fas fa-star-half-alt filled-star half-star-flipped"></i>
                    <i v-for="i in (5 - Math.floor(computedAverageRating) - ((computedAverageRating % 1) >= 0.15 ? 1 : 0))" :key="'h-empty-'+i" class="fas fa-star empty-star"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- Divider Line -->
            <div class="section-divider"></div>

            <!-- Price Block (Aligned to the Right, Stock Pill Removed) -->
            <div v-if="currentPrice !== null" class="price-status-bar">
              <div class="price-group">
                <div class="price-unit">
                  <span class="price-amount">{{ formatPrice(currentPrice) }}</span>
                  <span class="riyal-symbol" v-if="locale === 'ar'">
                    <img :src="riyalIcon" alt="ريال" class="riyal-svg" aria-hidden="true" />
                  </span>
                  <span class="currency-code" v-else>{{ currency }}</span>
                </div>
                <div v-if="hasDiscount" class="price-before-discount">
                  <span>{{ formatPrice(product.price) }}</span>
                  <span v-if="locale === 'ar'">{{ currency }}</span>
                </div>
                <span class="vat-tag">{{ locale === 'ar' ? 'شامل ضريبة القيمة المضافة' : 'Includes VAT' }}</span>
              </div>
            </div>

            <!-- Divider Line -->
            <div v-if="productFeatures.length > 0" class="section-divider"></div>

            <!-- Bullet Specs List (Checkmark circle on the Right, Text on the Left) -->
            <ul v-if="productFeatures.length > 0" class="bullet-specs-list">
              <li v-for="(feat, idx) in productFeatures" :key="idx" class="bullet-spec-item">
                <span class="check-circle-icon">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip_check_circle)">
                      <path d="M5.51866 12.3672C5.87333 12.7487 6.35924 13.2708 7.00033 13.2708L6.99976 13.2697C7.64084 13.2697 8.12675 12.7476 8.48142 12.3661C8.49209 12.3547 8.50264 12.3435 8.51308 12.3324C8.56544 12.2766 8.61489 12.2239 8.66109 12.1777C8.9825 11.8533 9.13942 11.788 9.59442 11.788C9.66277 11.788 9.73595 11.7902 9.81192 11.7924L9.82212 11.7927C10.2811 11.8067 10.9031 11.8257 11.3392 11.4368C11.3777 11.4094 11.4115 11.3756 11.4389 11.3371C11.8274 10.9001 11.8093 10.2754 11.7959 9.81401L11.7957 9.80617C11.7934 9.73253 11.7912 9.66117 11.7912 9.59469C11.7912 9.13911 11.8618 8.97577 12.2089 8.62752L12.2097 8.62671C12.8713 7.96861 13.2706 7.57146 13.2706 6.99886C13.2706 6.42621 12.8712 6.02897 12.2095 5.37076L12.2089 5.37014C12.0374 5.19981 11.7603 5.20041 11.59 5.37191C11.4197 5.54341 11.4202 5.82051 11.5917 5.99084C12.1202 6.51584 12.3956 6.79936 12.3956 6.99886C12.3956 7.19836 12.1202 7.48184 11.5906 8.00859C11.0802 8.52075 10.9162 8.90636 10.9162 9.59469C10.9162 9.6677 10.9184 9.746 10.9206 9.82762L10.921 9.84269C10.9303 10.181 10.9419 10.6003 10.7704 10.7706L10.7692 10.7718C10.5989 10.9416 10.1824 10.9287 9.84815 10.9182C9.76007 10.9153 9.67667 10.913 9.59442 10.913C8.90434 10.913 8.52632 11.0705 8.04098 11.5605C7.97565 11.6258 7.91033 11.6958 7.84092 11.7705L7.84013 11.7714C7.5952 12.0344 7.25964 12.3947 6.99976 12.3947C6.73959 12.3947 6.40356 12.0342 6.15857 11.7705C6.08973 11.6958 6.02382 11.6253 5.96024 11.5617C5.47315 11.0705 5.09515 10.913 4.40506 10.913C4.32281 10.913 4.23942 10.9153 4.15133 10.9182C3.8165 10.9293 3.40058 10.9416 3.22908 10.7713C3.05641 10.6009 3.06866 10.1786 3.07858 9.83965L3.07884 9.8301C3.08108 9.74833 3.08325 9.66938 3.08325 9.59526C3.08325 8.90693 2.91933 8.52131 2.40774 8.00739C1.87924 7.48239 1.60392 7.19893 1.60392 6.99943C1.60392 6.79993 1.87923 6.51644 2.40831 5.99027C2.87498 5.52361 3.08325 5.03418 3.08325 4.4036C3.08325 4.32935 3.08111 4.25026 3.07888 4.16792L3.07858 4.15682C3.06866 3.82024 3.05641 3.40144 3.22791 3.22935C3.39766 3.05669 3.8165 3.06949 4.1525 3.07999C4.24059 3.08291 4.32573 3.08523 4.40506 3.08523C5.03273 3.08523 5.52159 2.87643 5.99 2.40802C6.51675 1.87952 6.80084 1.6036 6.99976 1.6036C7.19867 1.6036 7.48273 1.87952 8.00948 2.40802C8.1804 2.57952 8.4575 2.57949 8.62842 2.40916C8.79933 2.23824 8.79992 1.96119 8.62959 1.79028C7.96984 1.12761 7.57141 0.728027 7.00033 0.728027C6.42954 0.728027 6.03124 1.12773 5.37269 1.78861L5.37166 1.78965C5.06541 2.0959 4.80349 2.20966 4.40566 2.20966C4.33731 2.20966 4.26466 2.2075 4.18926 2.20527L4.1799 2.20499C3.7004 2.19041 3.04357 2.17059 2.60724 2.61275C2.17098 3.05018 2.19014 3.70397 2.20414 4.18169L2.20443 4.19143C2.20667 4.26561 2.20882 4.33701 2.20882 4.4036C2.20882 4.80435 2.09509 5.06685 1.79117 5.37077L1.79035 5.37158C1.12876 6.02968 0.729492 6.42683 0.729492 6.99943C0.729492 7.57144 1.12852 7.96835 1.78715 8.62349L1.79 8.62633C2.13825 8.97633 2.20882 9.13968 2.20882 9.59526C2.20882 9.66177 2.20664 9.73316 2.20438 9.80683L2.20415 9.81458L2.20407 9.81737C2.19066 10.299 2.17233 10.957 2.61365 11.3931C3.05071 11.8284 3.70144 11.8084 4.17732 11.7939L4.17874 11.7938L4.18805 11.7935C4.26405 11.7913 4.33728 11.7891 4.40566 11.7891C4.86124 11.7891 5.01815 11.8545 5.34073 12.18C5.3944 12.2337 5.45508 12.2984 5.51866 12.3672Z" fill="currentColor"/>
                      <path d="M6.69101 7.89251C6.77326 7.97476 6.88408 8.02086 7.00017 8.02086L7.01185 8.02029C7.13201 8.01737 7.24517 7.96484 7.32567 7.87559L12.5757 2.04226C12.7373 1.86259 12.7227 1.5861 12.543 1.42452C12.3633 1.26294 12.0868 1.27755 11.9253 1.45722L6.98385 6.9475L5.26825 5.23197C5.09734 5.06105 4.82026 5.06105 4.64935 5.23197C4.47843 5.40288 4.47843 5.67993 4.64935 5.85085L6.69101 7.89251Z" fill="currentColor"/>
                    </g>
                    <defs>
                      <clipPath id="clip_check_circle">
                        <rect width="14" height="14" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                </span>
                <span class="bullet-spec-text">{{ feat }}</span>
              </li>
            </ul>

            <!-- Divider Line -->
            <div class="section-divider"></div>

            <!-- Color Picker -->
            <div class="color-picker-block" v-if="colorOptions.length > 0">
              <div class="color-swatches-wrap">
                <button 
                  v-for="c in colorOptions" 
                  :key="c.name"
                  type="button"
                  class="color-swatch-ring"
                  :class="{ active: selectedColorName === c.label }"
                  @click="selectColor(c.label)"
                  :title="`${c.label} — ${c.hex}`"
                  :aria-label="`${c.label} — ${c.hex}`"
                >
                  <span class="swatch-circle" :style="{ backgroundColor: c.hex }" :class="{ 'is-light': isLightColor(c.hex) }"></span>
                </button>
              </div>
            </div>

            <!-- Dynamic selectable attributes (Size, Capacity, etc.) -->
            <div
              v-for="attribute in selectableAttributes"
              :key="attribute.key"
              class="attribute-picker-block"
            >
              <div class="attribute-picker-title">
                <span class="ap-label">{{ attribute.label }}:</span>
                <span class="ap-val">{{ selectedAttributes[attribute.key] || attribute.options[0] }}</span>
              </div>
              <div class="attribute-options-wrap">
                <button
                  v-for="option in attribute.options"
                  :key="option"
                  type="button"
                  class="attribute-btn"
                  :class="{ active: selectedAttributes[attribute.key] === option }"
                  @click="selectAttribute(attribute.key, option)"
                >{{ option }}</button>
              </div>
            </div>

            <!-- Divider Line -->
            <div class="section-divider"></div>

            <!-- Purchase Actions: Quantity + Add to Cart -->
            <div class="purchase-actions-bar">
              <button 
                type="button" 
                class="btn-add-to-cart" 
                :disabled="!isProductInStock"
                @click="handleAddToCart"
              >
                <span>{{ isProductInStock ? (locale === 'ar' ? 'أضف إلى السلة' : 'Add to Cart') : (locale === 'ar' ? 'غير متوفر' : 'Out of Stock') }}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="bag-svg">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </button>

              <div class="qty-control-box">
                <button type="button" class="qty-btn" @click="increaseQuantity" aria-label="Increase quantity">+</button>
                <span class="qty-val">{{ quantity }}</span>
                <button type="button" class="qty-btn" @click="decreaseQuantity" aria-label="Decrease quantity">−</button>
              </div>
            </div>

          </div>
</template>
<script setup>
import { computed, toRefs } from 'vue';
const props = defineProps({ product: { type: Object, required: true }, locale: { type: String, required: true }, localized: { type: Function, required: true }, localizedValue: { type: Function, required: true }, computedRatingCount: { type: [Number, String], default: 0 }, computedAverageRating: { type: [Number, String], default: 0 }, formatPrice: { type: Function, required: true }, currentPrice: { type: [Number, String], default: 0 }, currency: { type: String, default: '' }, riyalIcon: { type: String, default: '' }, productFeatures: { type: Array, default: () => [] }, colorOptions: { type: Array, default: () => [] }, selectedColorName: { type: String, default: '' }, isLightColor: { type: Function, required: true }, selectableAttributes: { type: Array, default: () => [] }, selectedAttributes: { type: Object, default: () => ({}) }, isProductInStock: { type: Boolean, default: false }, quantity: { type: Number, default: 1 }, isFavorite: { type: Boolean, default: false } });
const emit = defineEmits(['open-share', 'toggle-favorite', 'select-image', 'select-color', 'select-attribute', 'update:quantity', 'add-to-cart']);
const { product, locale, localized, localizedValue, computedRatingCount, computedAverageRating, formatPrice, currentPrice, currency, riyalIcon, productFeatures, colorOptions, selectedColorName, isLightColor, selectableAttributes, selectedAttributes, isProductInStock, quantity, isFavorite } = toRefs(props);
const hasDiscount = computed(() => Number(product.value?.price) > Number(currentPrice.value));
const increaseQuantity = () => emit('update:quantity', quantity.value + 1);
const decreaseQuantity = () => emit('update:quantity', quantity.value > 1 ? quantity.value - 1 : quantity.value);
const selectColor = (value) => emit('select-color', value);
const selectAttribute = (key, value) => emit('select-attribute', { key, value });
const toggleFavorite = () => emit('toggle-favorite');
const handleAddToCart = () => emit('add-to-cart');
</script>
