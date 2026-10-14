<template>
  <div class="product-main-section" role="status" aria-busy="true" :aria-label="label">
    <div class="container main-section-container">
      <div class="sk-detail-grid">
        <div class="sk-detail-gallery">
          <span class="sk-shimmer sk-main"></span>
          <div class="sk-thumbs">
            <span v-for="n in 4" :key="n" class="sk-shimmer sk-thumb"></span>
          </div>
        </div>
        <div class="sk-detail-info">
          <span class="sk-shimmer sk-line sk-pill" style="width: 120px"></span>
          <span class="sk-shimmer" style="width: 90%; height: 34px"></span>
          <span class="sk-shimmer" style="width: 60%; height: 34px"></span>
          <span class="sk-shimmer sk-line" style="width: 180px"></span>
          <span class="sk-shimmer" style="width: 200px; height: 40px; margin-top: 8px"></span>
          <span class="sk-shimmer sk-line" style="width: 100%"></span>
          <span class="sk-shimmer sk-line" style="width: 95%"></span>
          <span class="sk-shimmer sk-line" style="width: 70%"></span>
          <div style="display: flex; gap: 12px; margin-top: 8px">
            <span v-for="n in 3" :key="n" class="sk-shimmer sk-circle" style="width: 36px; height: 36px"></span>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 16px">
            <span class="sk-shimmer" style="width: 120px; height: 52px; border-radius: 10px"></span>
            <span class="sk-shimmer" style="flex: 1; height: 52px; border-radius: 10px"></span>
          </div>
        </div>
      </div>
      <div class="sk-detail-tabs">
        <span v-for="n in 4" :key="n" class="sk-shimmer sk-line" style="width: 90px; height: 20px"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const label = computed(() => (locale.value === 'ar' ? 'جاري التحميل' : 'Loading'));
</script>
