// Re-exports the framework packages as the website app resolves them, so Node tests that mount
// website views share one Vue / vue-router / vue-i18n / pinia instance with those views.
export { createRenderer } from 'vue';
export { createI18n } from 'vue-i18n';
export { createMemoryHistory, createRouter } from 'vue-router';
export { createPinia, setActivePinia } from 'pinia';
