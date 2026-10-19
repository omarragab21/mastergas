<template>
  <span class="price-text">
    <bdi class="price-num" dir="ltr">{{ amount }}</bdi>
    <span v-if="currency" class="price-currency">{{ currency }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue';
import { formatPrice } from '../utils/price';

const props = defineProps({
  value: { type: [Number, String], default: 0 },
  currency: { type: String, default: '' },
  fraction: { type: String, default: 'fixed' },
  negative: { type: Boolean, default: false },
});

const amount = computed(() => formatPrice(props.value, { fraction: props.fraction, negative: props.negative }));
</script>
