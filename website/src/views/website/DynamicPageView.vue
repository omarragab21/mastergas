<template>
  <div class="dynamic-page-view" v-if="page">
    <div class="page-hero">
      <div class="container hero-content">
        <h1 class="page-title fade-in-up">{{ getField(page, 'title') }}</h1>
      </div>
    </div>

    <div class="container page-body-container">
      <div class="page-card shadow-lg">
        <div class="page-inner-content content-rich" v-html="formattedContent"></div>
      </div>
    </div>
  </div>

  <div class="loading-state-fullscreen" v-else-if="loading">
     <div class="spinner"></div>
     <p>{{ t('common.loading') }}</p>
  </div>

  <div class="not-found-state" v-else>
     <div class="icon">🔍</div>
     <h2>{{ t('dynamic_page.not_found') }}</h2>
     <p>{{ t('dynamic_page.not_found_hint') }}</p>
     <router-link to="/" class="btn-home">{{ t('dynamic_page.back_home') }}</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import api from '../../config/axios';
import { settingsService } from '../../services/settingsService';
import { useLocalized } from '../../composables/useLocalized';
import { escapeHtml, sanitizeHtml } from '../../utils/sanitize';

const route = useRoute();
const { t } = useI18n();
const { localized, currentLang } = useLocalized();
const page = ref(null);
const loading = ref(true);

// Handles both title_i18n / title (JSON) and legacy title_ar / title_en fields
const getField = (item, field) => {
  if (!item) return '';
  const i18nResult = localized(item, field);
  if (i18nResult) return i18nResult;
  const lang = currentLang.value || 'ar';
  return item[`${field}_${lang}`] || item[`${field}_ar`] || item[`${field}_en`] || '';
};

const fetchPage = async () => {
  loading.value = true;
  page.value = null;
  try {
    const id = route.params.id;
    const slug = route.params.slug;

    // About page: served from settings keys (about_title_ar/en, about_content_ar/en)
    if (route.name === 'About' || slug === 'about') {
      const data = await settingsService.getSettings();
      const settingsObj = Array.isArray(data)
        ? data.reduce((acc, s) => { acc[s.key] = s.value; return acc; }, {})
        : data;
      page.value = {
        title_ar: settingsObj.about_title_ar || 'من نحن',
        title_en: settingsObj.about_title_en || 'About Us',
        content_ar: settingsObj.about_content_ar || '',
        content_en: settingsObj.about_content_en || '',
      };
      return;
    }

    let res;
    if (id) {
      // Try topics first (primary content system), fall back to legacy pages
      try {
        res = { data: await settingsService.getTopicBySlug(id) };
      } catch {
        res = await api.get(`/frontend/pages/${id}`);
      }
    } else {
      // Slug-based: try topics first, then pages
      try {
        res = { data: await settingsService.getTopicBySlug(slug) };
      } catch {
        res = await api.get(`/frontend/pages/${slug}`);
      }
    }
    page.value = res.data.data || res.data;
  } catch (err) {
    console.error('Failed to fetch page', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchPage);

watch(() => [route.params.slug, route.params.id], fetchPage);

const formattedContent = computed(() => {
  const content = getField(page.value, 'content');
  if (!content) return '';
  if (!content.includes('<p>') && !content.includes('<div>')) {
     return sanitizeHtml(content.split('\n').map(line => `<p>${escapeHtml(line)}</p>`).join(''));
  }
  return sanitizeHtml(content);
});

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};
</script>

<style scoped>
.dynamic-page-view {
  min-height: 80vh;
  background: #fdfcfd;
  padding-bottom: 5rem;
}

.page-hero {
  background: #000000;
  padding: 8rem 0 10rem;
  color: #fff;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.page-hero::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -10%;
  width: 120%;
  height: 200%;
  background: radial-gradient(circle, rgba(253, 185, 19, 0.1) 0%, transparent 70%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.page-title {
  font-size: 3.5rem;
  font-weight: 850;
  margin-bottom: 1.5rem;
  letter-spacing: -1px;
}

.page-meta {
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-weight: 600;
  opacity: 0.9;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

.page-body-container {
    margin-top: -6rem !important;
    position: relative;
    z-index: 10;
    max-width: 900px !important;
    margin: 0 auto;
}

.page-card {
  background: #fff;
  border-radius: 24px;
  padding: 4rem;
  border: 1px solid #f3f4f6;
}

.content-rich {
  font-size: 1.15rem;
  line-height: 1.8;
  color: #374151;
  text-align: justify;
}

.content-rich :deep(p) { margin-bottom: 1.5rem; }
.content-rich :deep(h2) { font-size: 1.8rem; font-weight: 800; color: #111827; margin: 2.5rem 0 1rem; }
.content-rich :deep(h3) { font-size: 1.4rem; font-weight: 700; color: #111827; margin: 2rem 0 1rem; }
.content-rich :deep(ul), .content-rich :deep(ol) { margin-bottom: 1.5rem; padding-right: 1.5rem; }
.content-rich :deep(li) { margin-bottom: 0.5rem; }

/* Loading & Empty States */
.loading-state-fullscreen, .not-found-state {
  height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top-color: #000000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.not-found-state .icon { font-size: 4rem; }
.not-found-state h2 { font-weight: 800; color: #111827; }
.not-found-state p { color: #6b7280; }

.btn-home {
  padding: 12px 30px;
  background: #000000;
  color: #fff;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 700;
  transition: 0.3s;
}

.btn-home:hover { background: #4a1936; transform: translateY(-2px); }

.ltr-text { direction: ltr; }

@media (max-width: 768px) {
  .page-hero { padding: 6rem 0 7rem; }
  .page-title { font-size: 1.8rem; }
  .page-card { padding: 1.25rem; border-radius: 16px; }
  .page-meta { flex-direction: column; gap: 1rem; }
  .container { padding: 0 12px; }
}

.fade-in-up {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
