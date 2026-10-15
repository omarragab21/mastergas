<template>
  <div class="tab-content installation-tab-content">
    <h2 class="pane-headline">{{ locale === 'ar' ? 'دليل التركيب' : 'Installation Guide' }}</h2>
    <div class="guide-block">
      <ul class="guide-items-list">
        <li v-for="(item, index) in items" :key="index">
          <span class="item-bullet-icon" aria-hidden="true">✓</span>
          <span class="item-text">{{ item }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue';

const props = defineProps({
  locale: { type: String, required: true },
  items: { type: Array, default: () => [] },
});

const { locale, items } = toRefs(props);
</script>
