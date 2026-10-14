<template>
          <aside class="mockup-sidebar">
          <div class="sidebar-card">
            <!-- Sidebar Header -->
            <div class="sidebar-header">
              <span class="sidebar-title">{{ currentLang === 'ar' ? 'تصفية النتائج' : 'Filter Results' }}</span>
              <svg class="sidebar-funnel-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </div>

            <div class="sidebar-divider"></div>

            <!-- Categories Radio List -->
            <div class="sidebar-radio-list">
              <!-- Categories shimmer while /categories loads -->
              <template v-if="loading">
                <div v-for="n in 6" :key="`sk-${n}`" class="sk-sidebar-row" role="status" aria-busy="true">
                  <span class="sk-shimmer sk-line" :style="{ width: `${48 + (n % 3) * 14}%` }"></span>
                  <span class="sk-shimmer sk-line" style="width: 28px"></span>
                </div>
              </template>
              <template v-else>
              <!-- All categories option -->
              <label class="sidebar-radio-item" :class="{ active: selectedCategory === null }" @click="selectCategory(null)">
                <div class="radio-main-col">
                  <span class="custom-radio" :class="{ checked: selectedCategory === null }">
                    <span class="radio-inner-dot" v-if="selectedCategory === null"></span>
                  </span>
                  <span class="radio-title">{{ currentLang === 'ar' ? 'كافة التصنيفات' : 'All Categories' }}</span>
                </div>
                <span class="radio-counter">({{ totalAllCount }})</span>
              </label>

              <!-- Dynamic Categories from Database -->
              <label 
                v-for="cat in categories" 
                :key="cat.id" 
                class="sidebar-radio-item" 
                :class="{ active: selectedCategory === cat.id }"
                @click="selectCategory(cat.id)"
              >
                <div class="radio-main-col">
                  <span class="custom-radio" :class="{ checked: selectedCategory === cat.id }">
                    <span class="radio-inner-dot" v-if="selectedCategory === cat.id"></span>
                  </span>
                  <span class="radio-title">{{ localized(cat, 'name') }}</span>
                </div>
                <span class="radio-counter">({{ cat.products_count ?? 0 }})</span>
              </label>
              </template>
            </div>

            <div class="sidebar-divider"></div>

            <!-- Additional Options Checkboxes Section -->
            <div class="sidebar-section-heading">
              {{ currentLang === 'ar' ? 'خيارات إضافية' : 'Additional Options' }}
            </div>

            <div class="sidebar-checkbox-list">
              <!-- 1. In Stock -->
              <label class="sidebar-checkbox-item" @click="toggleInStock">
                <span class="custom-checkbox" :class="{ checked: inStockOnly }">
                  <svg v-if="inStockOnly" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span class="checkbox-text">{{ currentLang === 'ar' ? 'متوفر في المخزون' : 'In Stock' }}</span>
              </label>

              <!-- 2. Discounts & Offers -->
              <label class="sidebar-checkbox-item" @click="toggleDiscount">
                <span class="custom-checkbox" :class="{ checked: hasDiscountOnly }">
                  <svg v-if="hasDiscountOnly" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span class="checkbox-text">{{ currentLang === 'ar' ? 'عروض وتخفيضات' : 'Offers & Discounts' }}</span>
              </label>

              <!-- 3. Italian Made -->
              <label class="sidebar-checkbox-item" @click="toggleItalian">
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
const props = defineProps({ loading: { type: Boolean, default: false }, categories: { type: Array, default: () => [] }, selectedCategory: { type: [Number, String], default: null }, totalAllCount: { type: Number, default: 0 }, currentLang: { type: String, required: true }, inStockOnly: { type: Boolean, default: false }, hasDiscountOnly: { type: Boolean, default: false }, italianOnly: { type: Boolean, default: false }, localized: { type: Function, required: true }, selectCategory: { type: Function, required: true }, toggleInStock: { type: Function, required: true }, toggleDiscount: { type: Function, required: true }, toggleItalian: { type: Function, required: true } });
const { loading, categories, selectedCategory, totalAllCount, currentLang, inStockOnly, hasDiscountOnly, italianOnly, localized, selectCategory, toggleInStock, toggleDiscount, toggleItalian } = toRefs(props);
</script>
