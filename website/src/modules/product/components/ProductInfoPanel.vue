<template>
          <div class="info-column">
            
            <!-- Brand & Title Block -->
            <div class="brand-and-title">
              <!-- image-actions-bar -->
              <div class="image-actions-bar">
                <span v-if="localized(product.category, 'name')" class="category-name">{{ localized(product.category, 'name') }}</span>
                <span v-if="localized(product.category, 'name')" class="v-line v-line-sm"></span>
                <span class="origin-badge">{{ locale === 'ar' ? 'إيطالي الصنع' : 'Made in Italy' }}</span>
                <button class="share-action-btn" @click.stop="emit('open-share')" type="button" :title="locale === 'ar' ? 'مشاركة المنتج' : 'Share product'">
                  <span class="share-icon-box"><span class="share-icon-inset"><img :src="shareIcon" alt="" class="share-icon-svg" /></span></span>
                  <span>{{ locale === 'ar' ? 'مشاركة' : 'Share' }}</span>
                </button>
              </div>

              <!-- Product Title -->
              <h1 v-if="localized(product, 'name')" class="main-title">{{ localized(product, 'name') }}</h1>

              <!-- Rating & Model Row -->
              <div class="model-rating-bar">
                <div class="rating-group">
                  <div class="stars-cluster">
                    <img v-for="i in 5" :key="'h-star-'+i" :src="i <= Math.round(computedAverageRating) ? starFilledIcon : starEmptyIcon" alt="" class="star-icon" />
                  </div>
                  <span class="rating-val">{{ Number(computedAverageRating).toFixed(1) }}</span>
                  <span class="rating-count">({{ locale === 'ar' ? `${computedRatingCount} تقييم` : `${computedRatingCount} reviews` }})</span>
                </div>
                <span v-if="product.sku || product.model_number" class="v-line"></span>
                <span v-if="product.sku || product.model_number" class="model-code">{{ locale === 'ar' ? 'الموديل' : 'Model' }}: {{ product.sku || product.model_number }}</span>
              </div>
            </div>

            <!-- Divider Line -->
            <div class="section-divider"></div>

            <!-- Price Block + Stock status -->
            <div v-if="currentPrice !== null" class="price-status-bar">
              <div class="price-group">
                <div class="price-unit" dir="ltr">
                  <img v-if="showRiyalIcon" :src="priceRiyalIcon" :alt="$t('common.riyal')" class="riyal-svg" />
                  <span class="price-amount">{{ formatPrice(currentPrice) }}</span>
                  <span class="currency-code" v-if="!showRiyalIcon">{{ currency }}</span>
                </div>
                <div v-if="hasDiscount" class="price-before-discount" dir="ltr">
                  <span class="riyal-mask-sm" v-if="showRiyalIcon" :style="{ '--riyal-icon': `url(&quot;${riyalIcon}&quot;)` }" role="img" :aria-label="$t('common.riyal')"></span>
                  <span>{{ formatPrice(product.price) }}</span>
                </div>
                <span class="vat-tag">{{ locale === 'ar' ? 'شامل ضريبة القيمة المضافة' : 'Includes VAT' }}</span>
              </div>
              <div class="stock-pill" :class="isProductInStock ? 'is-in-stock' : 'is-out-stock'">
                <span class="stock-dot"></span>
                <span>{{ isProductInStock ? (locale === 'ar' ? 'متوفر في المخزون' : 'In Stock') : (locale === 'ar' ? 'غير متوفر' : 'Out of Stock') }}</span>
              </div>
            </div>

            <!-- Divider Line -->
            <div v-if="productFeatures.length > 0" class="section-divider"></div>

            <!-- Bullet Specs List (Checkmark circle on the Right, Text on the Left) -->
            <ul v-if="productFeatures.length > 0" class="bullet-specs-list">
              <li v-for="(feat, idx) in productFeatures" :key="idx" class="bullet-spec-item">
                <span class="check-circle-icon"><img :src="checkIcon" alt="" /></span>
                <span class="bullet-spec-text">{{ feat }}</span>
              </li>
            </ul>

            <!-- Divider Line -->
            <div v-if="colorOptions.length > 0 || selectableAttributes.length > 0" class="section-divider"></div>

            <!-- Color Picker -->
            <div class="color-picker-block" v-if="colorOptions.length > 0">
              <div class="color-picker-title">{{ locale === 'ar' ? 'اللون' : 'Color' }}: {{ selectedColorName }}</div>
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
              <div class="qty-control-box">
                <button type="button" class="qty-btn" @click="decreaseQuantity" :aria-label="$t('cart.decrease_qty')">−</button>
                <span class="qty-val">{{ quantity }}</span>
                <button type="button" class="qty-btn" @click="increaseQuantity" :aria-label="$t('cart.increase_qty')">+</button>
              </div>

              <button 
                type="button" 
                class="btn-add-to-cart" 
                :disabled="!isProductInStock"
                @click="handleAddToCart"
              >
                <span class="bag-icon-box"><span class="bag-icon-inset"><img :src="bagIcon" alt="" class="bag-svg" /></span></span>
                <span>{{ isProductInStock ? (locale === 'ar' ? 'أضف إلى السلة' : 'Add to Cart') : (locale === 'ar' ? 'غير متوفر' : 'Out of Stock') }}</span>
              </button>
            </div>

          </div>
</template>
<script setup>
import { computed, toRefs } from 'vue';
import shareIcon from '../../../assets/pd-share.svg';
import starFilledIcon from '../../../assets/pd-star-filled.svg';
import starEmptyIcon from '../../../assets/pd-star-empty.svg';
import checkIcon from '../../../assets/pd-check.svg';
import bagIcon from '../../../assets/pd-bag.svg';
import priceRiyalIcon from '../../../assets/pd-riyal.svg';
const props = defineProps({ product: { type: Object, required: true }, locale: { type: String, required: true }, localized: { type: Function, required: true }, computedRatingCount: { type: [Number, String], default: 0 }, computedAverageRating: { type: [Number, String], default: 0 }, formatPrice: { type: Function, required: true }, currentPrice: { type: [Number, String], default: 0 }, currency: { type: String, default: '' }, riyalIcon: { type: String, default: '' }, productFeatures: { type: Array, default: () => [] }, colorOptions: { type: Array, default: () => [] }, selectedColorName: { type: String, default: '' }, isLightColor: { type: Function, required: true }, selectableAttributes: { type: Array, default: () => [] }, selectedAttributes: { type: Object, default: () => ({}) }, isProductInStock: { type: Boolean, default: false }, quantity: { type: Number, default: 1 } });
const emit = defineEmits(['open-share', 'select-image', 'select-color', 'select-attribute', 'update:quantity', 'add-to-cart']);
const { product, locale, localized, computedRatingCount, computedAverageRating, formatPrice, currentPrice, currency, riyalIcon, productFeatures, colorOptions, selectedColorName, isLightColor, selectableAttributes, selectedAttributes, isProductInStock, quantity } = toRefs(props);
const showRiyalIcon = computed(() => locale.value === 'ar' || !currency.value || currency.value === 'SAR');
const hasDiscount =computed(() => Number(product.value?.price) > Number(currentPrice.value));
const increaseQuantity = () => emit('update:quantity', quantity.value + 1);
const decreaseQuantity = () => emit('update:quantity', quantity.value > 1 ? quantity.value - 1 : quantity.value);
const selectColor = (value) => emit('select-color', value);
const selectAttribute = (key, value) => emit('select-attribute', { key, value });
const handleAddToCart = () => emit('add-to-cart');
</script>
