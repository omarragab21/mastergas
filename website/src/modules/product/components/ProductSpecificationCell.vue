<template>
  <div class="spec-cell-pair">
    <span class="sc-label">{{ spec.label }}</span>
    <div v-if="isColor" class="spec-color-val">
      <span v-for="(color, index) in colors" :key="index" class="spec-color-item">
        <span class="spec-color-circle" :style="{ backgroundColor: color.hex }"></span>
        <span class="sc-value">{{ color.label }}</span>
      </span>
    </div>
    <span v-else class="sc-value">{{ spec.value }}</span>
  </div>
</template>

<script setup>
defineProps({
  spec: { type: Object, required: true },
  isColor: { type: Boolean, default: false },
  colors: { type: Array, default: () => [] },
});
</script>

<style scoped>
.spec-cell-pair { display: flex; flex-direction: row; justify-content: space-between; align-items: center; width: 100%; }
.sc-label { font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 700; font-size: 14px; line-height: 21px; color: #64748B; }
.sc-value { font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 400; font-size: 14px; line-height: 21px; color: #000; }
.spec-color-val { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.spec-color-item { display: inline-flex; align-items: center; gap: 8px; }
.spec-color-circle { width: 16px; height: 16px; border-radius: 50%; border: 1px solid rgba(0, 0, 0, 0.15); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); display: inline-block; flex-shrink: 0; }
</style>
