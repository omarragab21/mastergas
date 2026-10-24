<template>
  <ul class="points-list" :dir="dir">
    <li v-for="(item, index) in items" :key="index" class="points-list-item">{{ item }}</li>
  </ul>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  dir: { type: String, default: 'auto' },
});
</script>

<style scoped>
.points-list { display: flex; flex-direction: column; gap: 12px; margin: 0; padding-block: 0; padding-inline: 21px 0; width: 100%; list-style: disc; }
.points-list-item { font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 14px; font-weight: 400; line-height: normal; color: #64748B; text-align: start; overflow-wrap: anywhere; }
.points-list-item::marker { color: #64748B; }
</style>
