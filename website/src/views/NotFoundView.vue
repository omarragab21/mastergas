<template>
  <section class="not-found" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <div class="not-found-icon">
      <img :src="alertIcon" alt="" width="36" height="34" />
    </div>
    <div class="not-found-text">
      <h1>{{ t('common.not_found_title') }}</h1>
      <p>{{ t('common.not_found_desc') }}</p>
    </div>
    <div class="not-found-actions">
      <router-link to="/" class="btn-primary">{{ t('common.back_home') }}</router-link>
      <router-link to="/products" class="btn-secondary">{{ t('common.explore_products') }}</router-link>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import alertIcon from '../assets/icons/alert-01.svg';

const { t, locale } = useI18n();
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding: 120px 64px;
  background: var(--color-background-secondary, #f8fafc);
  text-align: center;
}

.not-found-icon {
  display: grid;
  place-items: center;
  width: 80px;
  height: 80px;
  border: 1px solid var(--color-border-default, #e2e8f0);
  border-radius: 9999px;
  background: var(--color-surface-primary, #fff);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.03);
}

.not-found-text {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 640px;
}

.not-found-text h1 {
  margin: 0;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text-primary, #000);
}

.not-found-text p {
  margin: 0;
  font-size: 18px;
  line-height: 1.6;
  color: var(--color-text-secondary, #64748b);
}

.not-found-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}

.btn-primary,
.btn-secondary {
  padding: 16px 32px;
  border: 1px solid var(--color-border-strong, #000);
  border-radius: 6px;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  transition: opacity 0.2s ease, background-color 0.2s ease;
}

.btn-primary {
  background: #000;
  color: #fff;
}

.btn-secondary {
  background: transparent;
  color: #000;
}

.btn-primary:hover { opacity: 0.85; }
.btn-secondary:hover { background: rgba(0, 0, 0, 0.04); }

@media (max-width: 768px) {
  .not-found { gap: 28px; padding: 64px 24px; }
  .not-found-text h1 { font-size: 32px; }
  .not-found-text p { font-size: 16px; }
}
</style>
