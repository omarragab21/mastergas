<template>
    <section class="home-section categories-section container" :dir="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <div class="section-header-flex">
        <div class="section-title-wrap">
          <h2 class="section-title">{{ title || t('home.shop_by_category') }}</h2>
          <p class="section-subtitle">{{ t('home.discover_categories') }}</p>
        </div>
        <div class="section-nav-actions">
          <button class="nav-circle-btn" :class="{ 'is-hidden': !canPrev, 'is-active': activeDirection === 'prev' }" :disabled="!canPrev" @click="scrollCategoriesSlider('prev')" :aria-label="currentLang === 'ar' ? 'السابق' : 'Previous'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline :points="currentLang === 'ar' ? '9 18 15 12 9 6' : '15 18 9 12 15 6'"/>
            </svg>
          </button>
          <button class="nav-circle-btn" :class="{ 'is-hidden': !canNext, 'is-active': activeDirection === 'next' }" :disabled="!canNext" @click="scrollCategoriesSlider('next')" :aria-label="currentLang === 'ar' ? 'التالي' : 'Next'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline :points="currentLang === 'ar' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="category-cards-slider" ref="categoriesSliderRef">
        <template v-if="loading">
          <PortraitCardSkeleton v-for="n in 6" :key="`sk-${n}`" variant="category" />
        </template>
        <template v-else>
        <PortraitCard
          v-for="cat in categories"
          :key="cat.id"
          :to="cat.link"
          :image="cat.image"
          :title="cat.name"
          :count="cat.countText"
        />
        </template>
      </div>
    </section>
</template>
<script setup>
import { computed, ref, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSliderEdges } from '../../../composables/useSliderEdges';
import PortraitCardSkeleton from '../../../components/skeleton/PortraitCardSkeleton.vue';
import PortraitCard from '../../../components/PortraitCard.vue';

const props = defineProps({
  categories: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  title: { type: String, default: '' },
});
const { categories, title } = toRefs(props);
const { t, locale } = useI18n();
const currentLang = computed(() => locale.value);
const categoriesSliderRef = ref(null);
const { canPrev, canNext } = useSliderEdges(categoriesSliderRef);
const activeDirection = ref('next');

const scrollCategoriesSlider = (direction) => {
  if (!categoriesSliderRef.value) return;
  activeDirection.value = direction;
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
