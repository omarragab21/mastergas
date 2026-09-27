import { createApp } from 'vue'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './style.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { useTheme } from './composables/useTheme'

if (typeof performance !== 'undefined' && typeof performance.mark === 'function') {
  performance.mark('mastergas:app-start');
}

const { initTheme } = useTheme();
initTheme();

// Apply language and dir on startup
// Ensure Arabic is always the default language
let lang = localStorage.getItem('lang');
if (!lang || (lang !== 'ar' && lang !== 'en')) {
  lang = 'ar';
  localStorage.setItem('lang', 'ar');
}
document.documentElement.lang = lang;
document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

const app = createApp(App)
app.use(i18n)
app.use(router)
app.mount('#app')

const markInteractive = () => {
  if (typeof performance !== 'undefined' && typeof performance.mark === 'function') {
    performance.mark('mastergas:page-interactive');
  }
};
if (typeof requestIdleCallback === 'function') requestIdleCallback(markInteractive);
else setTimeout(markInteractive, 0);
