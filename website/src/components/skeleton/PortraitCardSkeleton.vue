<template>
  <span
    class="sk-shimmer sk-portrait-card"
    :class="variant === 'offer' ? 'sk-portrait-offer' : 'sk-portrait-category'"
    role="status"
    aria-busy="true"
  ></span>
</template>

<script setup>
defineProps({ variant: { type: String, default: 'category' } });
</script>
