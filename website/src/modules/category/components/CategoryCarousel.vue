<template>
    <section class="home-section categories-section container" :dir="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <div class="section-header-flex">
        <div class="section-title-wrap">
          <h2 class="section-title">{{ t('home.shop_by_category') }}</h2>
          <p class="section-subtitle">{{ t('home.discover_categories') }}</p>
        </div>
        <div class="section-nav-actions">
          <button class="nav-circle-btn" @click="scrollCategoriesSlider('prev')" :aria-label="currentLang === 'ar' ? 'السابق' : 'Previous'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline :points="currentLang === 'ar' ? '9 18 15 12 9 6' : '15 18 9 12 15 6'"/>
            </svg>
          </button>
          <button class="nav-circle-btn" @click="scrollCategoriesSlider('next')" :aria-label="currentLang === 'ar' ? 'التالي' : 'Next'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline :points="currentLang === 'ar' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="category-cards-slider" ref="categoriesSliderRef">
        <router-link 
          v-for="cat in categories" 
          :key="cat.id" 
          :to="cat.link"
          class="category-portrait-card"
        >
          <div class="card-bg-image" :style="{ backgroundImage: `url(${cat.image}), url(/catalog_images/cat_${cat.id}.jpg), url(/images/home/cat_cookers.png)` }"></div>
          <div class="card-gradient-overlay"></div>
          <div class="card-bottom-content">
            <span class="card-count">{{ cat.countText }}</span>
            <div class="card-title-row">
              <h3 class="card-title">{{ cat.name }}</h3>
              <div class="card-circle-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </section>
</template>
<script setup>
import { computed, ref, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  categories: { type: Array, default: () => [] },
});
const { categories } = toRefs(props);
const { t, locale } = useI18n();
const currentLang = computed(() => locale.value);
const categoriesSliderRef = ref(null);

const scrollCategoriesSlider = (direction) => {
  if (!categoriesSliderRef.value) return;
  const isRtl = currentLang.value === 'ar';
  const scrollAmount = categoriesSliderRef.value.clientWidth * 0.75;
  let sign = 1;
  if (isRtl) {
    sign = direction === 'next' ? -1 : 1;
  } else {
    sign = direction === 'next' ? 1 : -1;
  }
  categoriesSliderRef.value.scrollBy({ left: sign * scrollAmount, behavior: 'smooth' });
};
</script>
<style src="../styles/category.css"></style>
