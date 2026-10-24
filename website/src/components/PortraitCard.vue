<template>
  <router-link :to="to" class="portrait-card" :class="`portrait-card--${variant}`" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <div class="portrait-card-image">
      <img
        v-if="image && !imageFailed"
        :src="image"
        alt=""
        class="portrait-card-bg"
        loading="lazy"
        decoding="async"
        @error="imageFailed = true"
      />
      <!-- No image, or its file is gone: a vector placeholder (never a stretched low-res picture) -->
      <div v-else class="portrait-card-bg portrait-card-placeholder" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2.5" />
          <circle cx="8.5" cy="8.5" r="1.6" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </div>
      <div class="portrait-card-gradient"></div>
      <div class="portrait-card-title"><p dir="auto">{{ title }}</p></div>
      <div class="portrait-card-count"><p dir="auto">{{ count }}</p></div>
      <div class="portrait-card-arrow">
        <div class="portrait-card-arrow-icon">
          <div class="portrait-card-arrow-inset">
            <img :src="arrowIcon" alt="" class="portrait-card-arrow-img" />
          </div>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import arrowIcon from '../assets/category-arrow.svg';

const props = defineProps({
  to: { type: [String, Object], required: true },
  image: { type: String, default: '' },
  title: { type: String, default: '' },
  count: { type: String, default: '' },
  // 'category' (Figma node 4:501) and 'offer' (Figma node 289:2601) differ only in type scale
  variant: { type: String, default: 'category', validator: (v) => ['category', 'offer'].includes(v) },
});

const { locale } = useI18n();

const imageFailed = ref(false);
watch(() => props.image, () => { imageFailed.value = false; });
</script>

<style src="./portrait-card.css"></style>
