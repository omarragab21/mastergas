<template>
        <div class="tab-content specs-tab-content">
          <div class="specs-card">
            <h3 class="specs-title">{{ locale === 'ar' ? 'المواصفات الفنية الكاملة' : 'Full Technical Specifications' }}</h3>
            <ProductSpecifications
              :rows="specRows"
              :locale="locale"
              :is-color-spec="isColorSpec"
              :get-spec-colors-list="getSpecColorsList"
            />
          </div>
        </div>
</template>
<script setup>
import { toRefs } from 'vue';
import ProductSpecifications from './ProductSpecifications.vue';

const props = defineProps({
  locale: { type: String, required: true },
  specRows: { type: Array, default: () => [] },
  isColorSpec: { type: Function, required: true },
  getSpecColorsList: { type: Function, required: true },
});
const { locale, specRows, isColorSpec, getSpecColorsList } = toRefs(props);
</script>
