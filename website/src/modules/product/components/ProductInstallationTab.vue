<template>
  <div class="tab-content installation-tab-content">
    <ProductPointsList :items="items" :dir="locale === 'ar' ? 'rtl' : 'ltr'" />
  </div>
</template>

<script setup>
import ProductPointsList from './ProductPointsList.vue';

defineProps({
  locale: { type: String, required: true },
  items: { type: Array, default: () => [] },
});
</script>
