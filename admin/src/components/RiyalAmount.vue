<template>
  <span class="amount-with-currency">{{ formatted }}<img :src="riyalIcon" class="currency-icon" :alt="tx('ر.س', 'SAR')" /></span>
</template>

<script setup>
import { computed } from 'vue';
import riyalIcon from '../assets/riyal.svg';
import { useAdminText } from '../composables/useAdminText';

const props = defineProps({
  value: { type: [Number, String], default: 0 },
});

const { tx } = useAdminText();

const formatted = computed(() => (Number(props.value) || 0).toLocaleString('en-US', { maximumFractionDigits: 2 }));
</script>

<style scoped>
.amount-with-currency {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  direction: ltr;
  white-space: nowrap;
}

.currency-icon {
  display: inline-block;
  flex: 0 0 auto;
  width: 13px;
  height: 15px;
  object-fit: contain;
}
</style>
