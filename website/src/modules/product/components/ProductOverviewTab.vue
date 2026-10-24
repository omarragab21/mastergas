<template>
  <div class="tab-content overview-tab-content">
    <p class="overview-paragraph" :dir="locale === 'ar' ? 'rtl' : 'ltr'">{{ text }}</p>
  </div>
</template>
<script setup>
import { computed } from 'vue';

const props = defineProps({
  locale: { type: String, default: 'ar' },
  dynamicOverviewDesc: { type: String, default: '' },
});
const text = computed(() => String(props.dynamicOverviewDesc || '')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .join(' '));
</script>

<style scoped>
.overview-paragraph { margin: 0; width: 100%; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 16px; font-weight: 500; line-height: 1.6; color: #64748B; text-align: start; overflow-wrap: anywhere; }
</style>
