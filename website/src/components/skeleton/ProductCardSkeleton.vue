<template>
  <div class="sk-product-card" role="status" aria-busy="true" :aria-label="label">
    <span class="sk-shimmer sk-image"></span>
    <span class="sk-shimmer sk-line sk-pill" style="width: 34%"></span>
    <span class="sk-shimmer sk-line" style="width: 92%; height: 18px"></span>
    <span class="sk-shimmer sk-line" style="width: 64%; height: 18px"></span>
    <div class="sk-meta">
      <span class="sk-shimmer sk-line" style="width: 38%"></span>
      <span class="sk-shimmer sk-line" style="width: 24%"></span>
    </div>
    <span class="sk-divider"></span>
    <div class="sk-bottom">
      <span class="sk-shimmer" style="width: 90px; height: 24px"></span>
      <span class="sk-shimmer sk-circle" style="width: 40px; height: 40px"></span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const label = computed(() => (locale.value === 'ar' ? 'جاري التحميل' : 'Loading'));
</script>
