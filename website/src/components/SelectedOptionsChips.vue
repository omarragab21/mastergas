<template>
  <ul v-if="options.length" class="selected-options" :class="{ compact }" :aria-label="label">
    <li v-for="option in options" :key="option.id" class="option-chip">
      <span v-if="option.hex" class="option-swatch" :class="{ 'is-light': isLight(option.hex) }" :style="{ backgroundColor: option.hex }" aria-hidden="true"></span>
      <span v-if="option.group" class="option-group">{{ option.group }}:</span>
      <span class="option-name">{{ option.name }}</span>
    </li>
  </ul>
</template>

<script setup>
// Chosen product options (color, size, energy type…) under a cart line or an
// order item. `options`: [{ id, group, name, hex }] already in the page language.
defineProps({
  options: { type: Array, default: () => [] },
  compact: { type: Boolean, default: false },
  label: { type: String, default: '' },
});

const isLight = (hex) => {
  const value = String(hex || '').replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(value)) return false;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.75;
};
</script>

<style scoped>
.selected-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}
.option-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 100%;
  padding: 4px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #f9fafb;
  color: #111827;
  font-size: 12px;
  line-height: 1.4;
  white-space: nowrap;
}
.option-swatch {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
}
.option-swatch.is-light { box-shadow: inset 0 0 0 1px #d1d5db; }
.option-group { color: #6b7280; font-weight: 500; }
.option-name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; }
.compact { gap: 4px; margin-top: 4px; }
.compact .option-chip { padding: 2px 8px; font-size: 11px; }
.compact .option-swatch { width: 10px; height: 10px; }
</style>
