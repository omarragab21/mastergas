<template>
        <!-- Sidebar Filters Card (Right in RTL) -->
        <aside class="mockup-sidebar">
          <div class="sidebar-card">
            <!-- Sidebar Header -->
            <div class="sidebar-header">
              <span class="sidebar-title">{{ currentLang === 'ar' ? 'تصفية العروض' : 'Filter Offers' }}</span>
              <svg class="sidebar-funnel-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </div>

            <div class="sidebar-divider"></div>

            <!-- Offers Radio List -->
            <div class="sidebar-radio-list">
              <!-- All offers option -->
              <label class="sidebar-radio-item" :class="{ active: selectedOfferId === null }" @click="selectOffer(null)">
                <div class="radio-main-col">
                  <span class="custom-radio" :class="{ checked: selectedOfferId === null }">
                    <span class="radio-inner-dot" v-if="selectedOfferId === null"></span>
                  </span>
                  <span class="radio-title">{{ currentLang === 'ar' ? 'كافة العروض' : 'All Offers' }}</span>
                </div>
                <span class="radio-counter">({{ allProducts.length }})</span>
              </label>

              <!-- Dynamic / PRO Offers -->
              <label 
                v-for="offer in offers" 
                :key="offer.id" 
                class="sidebar-radio-item" 
                :class="{ active: selectedOfferId === offer.id }"
                @click="selectOffer(offer.id)"
              >
                <div class="radio-main-col">
                  <span class="custom-radio" :class="{ checked: selectedOfferId === offer.id }">
                    <span class="radio-inner-dot" v-if="selectedOfferId === offer.id"></span>
                  </span>
                  <span class="radio-title">{{ localized(offer, 'name') || offer.name }}</span>
                </div>
                <span class="radio-counter">({{ getOfferCount(offer) }})</span>
              </label>
            </div>

            <div class="sidebar-divider"></div>

            <!-- Additional Options Checkboxes Section -->
            <div class="sidebar-section-heading">
              {{ currentLang === 'ar' ? 'خيارات إضافية' : 'Additional Options' }}
            </div>

            <div class="sidebar-checkbox-list">
              <!-- 1. In Stock -->
              <label class="sidebar-checkbox-item" @click="emit('toggle-in-stock')">
                <span class="custom-checkbox" :class="{ checked: inStockOnly }">
                  <svg v-if="inStockOnly" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span class="checkbox-text">{{ currentLang === 'ar' ? 'متوفر في المخزون' : 'In Stock' }}</span>
              </label>

              <!-- 2. Discounts & Offers -->
              <label class="sidebar-checkbox-item" @click="emit('toggle-discount')">
                <span class="custom-checkbox" :class="{ checked: hasDiscountOnly }">
                  <svg v-if="hasDiscountOnly" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span class="checkbox-text">{{ currentLang === 'ar' ? 'عروض وتخفيضات' : 'Offers & Discounts' }}</span>
              </label>

              <!-- 3. Italian Made -->
              <label class="sidebar-checkbox-item" @click="emit('toggle-italian')">
                <span class="custom-checkbox" :class="{ checked: italianOnly }">
                  <svg v-if="italianOnly" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span class="checkbox-text">{{ currentLang === 'ar' ? 'صناعة إيطالية' : 'Made in Italy' }}</span>
              </label>
            </div>
          </div>
        </aside>

</template>
<script setup>
import { toRefs } from 'vue';

const props = defineProps({
  currentLang: { type: String, required: true },
  selectedOfferId: { type: [Number, String], default: null },
  offers: { type: Array, default: () => [] },
  allProducts: { type: Array, default: () => [] },
  inStockOnly: { type: Boolean, default: false },
  hasDiscountOnly: { type: Boolean, default: false },
  italianOnly: { type: Boolean, default: false },
  localized: { type: Function, required: true },
  getOfferCount: { type: Function, required: true },
  selectOffer: { type: Function, required: true },
});
const emit = defineEmits(['toggle-in-stock', 'toggle-discount', 'toggle-italian']);
const { currentLang, selectedOfferId, offers, allProducts, inStockOnly, hasDiscountOnly, italianOnly, localized, getOfferCount, selectOffer } = toRefs(props);
</script>

