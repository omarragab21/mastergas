<template>
  <router-link :to="to" class="portrait-card" :class="`portrait-card--${variant}`" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <div class="portrait-card-image">
      <div class="portrait-card-bg" :style="{ backgroundImage: `url(${image || '/brand/mastergas-icon.png'})` }"></div>
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
import { useI18n } from 'vue-i18n';
import arrowIcon from '../assets/category-arrow.svg';

defineProps({
  to: { type: [String, Object], required: true },
  image: { type: String, default: '' },
  title: { type: String, default: '' },
  count: { type: String, default: '' },
  // 'category' (Figma node 4:501) and 'offer' (Figma node 289:2601) differ only in type scale
  variant: { type: String, default: 'category', validator: (v) => ['category', 'offer'].includes(v) },
});

const { locale } = useI18n();
</script>

<style src="./portrait-card.css"></style>
