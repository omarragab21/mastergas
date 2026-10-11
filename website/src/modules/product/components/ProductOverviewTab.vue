<template>
        <div class="tab-content overview-tab-content">
          <div class="overview-text">
            <h2 class="ov-title">{{ dynamicOverviewTitle }}</h2>
            <p class="ov-desc">{{ dynamicOverviewDesc }}</p>
            <div class="features-icons-grid">
              <div v-for="(feat, idx) in dynamicOverviewFeatures" :key="idx" class="feature-item">
                <span class="feat-ico">
                  <!-- SVG Icon based on index -->
                  <svg v-if="idx % 4 === 0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <svg v-else-if="idx % 4 === 1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                    <line x1="9" y1="21" x2="9" y2="9"/>
                  </svg>
                  <svg v-else-if="idx % 4 === 2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
                  </svg>
                </span>
                <span class="feat-txt">{{ feat }}</span>
              </div>
            </div>
          </div>
        </div>
</template>
<script setup>
import { toRefs } from 'vue';

const props = defineProps({
  dynamicOverviewTitle: { type: String, default: '' },
  dynamicOverviewDesc: { type: String, default: '' },
  dynamicOverviewFeatures: { type: Array, default: () => [] },
});
const { dynamicOverviewTitle, dynamicOverviewDesc, dynamicOverviewFeatures } = toRefs(props);
</script>
