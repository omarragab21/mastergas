<template>
  <main class="min-h-screen grid place-items-center bg-white px-6 text-center" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <section>
      <p class="text-sm font-semibold text-gray-500">404</p>
      <h1 class="mt-3 text-2xl font-bold text-gray-900">{{ t('common.not_found_title') }}</h1>
      <p class="mt-2 text-gray-600">{{ t('common.not_found_desc') }}</p>
      <router-link to="/" class="mt-6 inline-flex rounded-lg bg-gray-900 px-5 py-3 text-white">
        {{ t('common.back_home') }}
      </router-link>
    </section>
  </main>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();
</script>
