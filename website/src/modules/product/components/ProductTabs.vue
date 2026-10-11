<template>
  <div v-if="product" class="tabs-section">
    <div class="container tabs-container">
      <div class="tabs-header-nav">
        <button
          v-for="tab in tabOptions"
          :key="tab.id"
          class="tab-nav-btn"
          :class="{ active: activeTab === tab.id }"
          @click="emit('update:active-tab', tab.id)"
        >
          <span class="tab-label">{{ tab.label }}</span>
          <span v-if="activeTab === tab.id" class="tab-indicator"></span>
        </button>
      </div>

      <ProductOverviewTab
        v-if="activeTab === 'overview'"
        :dynamic-overview-title="dynamicOverviewTitle"
        :dynamic-overview-desc="dynamicOverviewDesc"
        :dynamic-overview-features="dynamicOverviewFeatures"
      />
      <ProductSpecificationsTab
        v-if="activeTab === 'specs'"
        :locale="locale"
        :spec-rows="specRows"
        :is-color-spec="isColorSpec"
        :get-spec-colors-list="getSpecColorsList"
      />
      <ProductInstallationTab v-if="activeTab === 'installation'" :locale="locale" />
      <ProductShippingTab v-if="activeTab === 'shipping'" :locale="locale" />
      <ProductReviewsTab
        v-if="activeTab === 'reviews'"
        :locale="locale"
        :computed-average-rating="computedAverageRating"
        :computed-rating-count="computedRatingCount"
        :get-rating-percentage="getRatingPercentage"
        :display-reviews="displayReviews"
        :format-date="formatDate"
        :handle-add-review-click="handleAddReviewClick"
      />
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue';
import ProductOverviewTab from './ProductOverviewTab.vue';
import ProductSpecificationsTab from './ProductSpecificationsTab.vue';
import ProductInstallationTab from './ProductInstallationTab.vue';
import ProductShippingTab from './ProductShippingTab.vue';
import ProductReviewsTab from './ProductReviewsTab.vue';

const props = defineProps({
  product: { type: Object, default: null },
  tabOptions: { type: Array, default: () => [] },
  activeTab: { type: String, default: 'overview' },
  locale: { type: String, required: true },
  dynamicOverviewTitle: { type: String, default: '' },
  dynamicOverviewDesc: { type: String, default: '' },
  dynamicOverviewFeatures: { type: Array, default: () => [] },
  specRows: { type: Array, default: () => [] },
  isColorSpec: { type: Function, required: true },
  getSpecColorsList: { type: Function, required: true },
  computedAverageRating: { type: [Number, String], default: 0 },
  computedRatingCount: { type: [Number, String], default: 0 },
  getRatingPercentage: { type: Function, required: true },
  displayReviews: { type: Array, default: () => [] },
  formatDate: { type: Function, required: true },
  handleAddReviewClick: { type: Function, required: true },
});

const emit = defineEmits(['update:active-tab']);
const {
  product,
  tabOptions,
  activeTab,
  locale,
  dynamicOverviewTitle,
  dynamicOverviewDesc,
  dynamicOverviewFeatures,
  specRows,
  isColorSpec,
  getSpecColorsList,
  computedAverageRating,
  computedRatingCount,
  getRatingPercentage,
  displayReviews,
  formatDate,
  handleAddReviewClick,
} = toRefs(props);
</script>

