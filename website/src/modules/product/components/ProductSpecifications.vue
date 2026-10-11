<template>
  <div class="specs-card">
    <h3 class="specs-title">{{ locale === 'ar' ? 'المواصفات الفنية الكاملة' : 'Full Technical Specifications' }}</h3>
    <div class="specs-table-grid">
      <div v-for="(row, index) in rows" :key="index" class="spec-table-row">
        <ProductSpecificationCell
          :spec="row.col1"
          :is-color="isColorSpec(row.col1.label)"
          :colors="getSpecColorsList(row.col1.value)"
        />
        <ProductSpecificationCell
          v-if="row.col2"
          :spec="row.col2"
          :is-color="isColorSpec(row.col2.label)"
          :colors="getSpecColorsList(row.col2.value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import ProductSpecificationCell from './ProductSpecificationCell.vue';

defineProps({
  rows: { type: Array, required: true },
  locale: { type: String, default: 'ar' },
  isColorSpec: { type: Function, required: true },
  getSpecColorsList: { type: Function, required: true },
});
</script>

<style scoped>
.specs-card { box-sizing: border-box; background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px 32px; width: 100%; }
.specs-title { margin: 0 0 16px; font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 700; font-size: 18px; line-height: 27px; color: #000; }
.specs-table-grid { display: flex; flex-direction: column; width: 100%; }
.spec-table-row { display: grid; grid-template-columns: 1fr 1fr; column-gap: 48px; padding: 12px 0; border-bottom: 1px solid #E2E8F0; }
.spec-table-row:last-child { border-bottom: none; }
@media (max-width: 768px) { .spec-table-row { grid-template-columns: 1fr; gap: 12px; } }
</style>
