<template>
  <div>
    <!-- Bottom Cookie Banner -->
    <transition name="slide-up">
      <div v-if="showBanner && !showModal" class="cookie-banner-wrapper" :dir="isRtl ? 'rtl' : 'ltr'">
        <div class="cookie-banner">
          <div class="cookie-banner-content">
            <div class="cookie-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
                <path d="M8.5 8.5v.01"/>
                <path d="M16 15.5v.01"/>
                <path d="M12 12v.01"/>
                <path d="M11 17v.01"/>
                <path d="M7 13v.01"/>
              </svg>
            </div>
            <div class="cookie-text">
              <h4 class="cookie-title">{{ isRtl ? 'ملفات تعريف الارتباط وتجربتك' : 'Cookies & Your Experience' }}</h4>
              <p class="cookie-desc">
                {{ isRtl 
                  ? 'نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح لديك، وتخصيص المحتوى، وتحليل حركة المرور على موقع ماسترجاز بما يضمن لك أفضل تجربة تسوق.' 
                  : 'We use cookies to improve your browsing experience, personalize content, and analyze traffic on Mastergas to ensure the best shopping journey.' }}
                <router-link to="/page/privacy" class="cookie-link">{{ isRtl ? 'سياسة الخصوصية' : 'Privacy Policy' }}</router-link>
              </p>
            </div>
          </div>
          <div class="cookie-actions">
            <button class="cookie-btn cookie-btn-accept" @click="acceptAll">
              {{ isRtl ? 'قبول الكل' : 'Accept All' }}
            </button>
            <button class="cookie-btn cookie-btn-manage" @click="openModal">
              {{ isRtl ? 'تخصيص الخيارات' : 'Customize' }}
            </button>
            <button class="cookie-btn cookie-btn-reject" @click="rejectNonEssential">
              {{ isRtl ? 'الضرورية فقط' : 'Necessary Only' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Cookie Preferences Modal -->
    <transition name="fade">
      <div v-if="showModal" class="cookie-modal-backdrop" @click.self="showModal = false" :dir="isRtl ? 'rtl' : 'ltr'">
        <div class="cookie-modal-container">
          <div class="cookie-modal-header">
            <div class="modal-header-info">
              <div class="modal-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
                  <path d="M8.5 8.5v.01"/>
                  <path d="M16 15.5v.01"/>
                  <path d="M12 12v.01"/>
                </svg>
              </div>
              <div>
                <h3 class="modal-title">{{ isRtl ? 'إدارة تفضيلات ملفات تعريف الارتباط' : 'Cookie Preferences Manager' }}</h3>
                <p class="modal-subtitle">{{ isRtl ? 'يمكنك اختيار أنواع ملفات تعريف الارتباط التي تسمح بها في ماسترجاز.' : 'Select which cookie categories you choose to allow on Mastergas.' }}</p>
              </div>
            </div>
            <button class="modal-close-btn" @click="showModal = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="cookie-categories-list">
            <!-- 1. Strictly Necessary -->
            <div class="cookie-cat-item">
              <div class="cookie-cat-text">
                <div class="cookie-cat-title-row">
                  <span class="cookie-cat-title">{{ isRtl ? 'ملفات تعريف الارتباط الضرورية' : 'Strictly Necessary Cookies' }}</span>
                  <span class="cookie-badge required">{{ isRtl ? 'مفعل دائماً' : 'Always Active' }}</span>
                </div>
                <p class="cookie-cat-desc">
                  {{ isRtl 
                    ? 'هذه الملفات ضرورية لتمكين الوظائف الأساسية للمتجر، مثل تسجيل الدخول، وحفظ سلة المشتريات، وإتمام الدفع بأمان.' 
                    : 'Essential cookies required for core website features like authentication, cart persistence, and secure checkout.' }}
                </p>
              </div>
              <div class="cookie-switch disabled">
                <input type="checkbox" checked disabled id="cookie-nec" />
                <label for="cookie-nec" class="switch-slider"></label>
              </div>
            </div>

            <!-- 2. Preferences -->
            <div class="cookie-cat-item">
              <div class="cookie-cat-text">
                <div class="cookie-cat-title-row">
                  <span class="cookie-cat-title">{{ isRtl ? 'ملفات تفضيلات المستخدم' : 'Preferences Cookies' }}</span>
                  <span class="cookie-badge optional">{{ isRtl ? 'اختياري' : 'Optional' }}</span>
                </div>
                <p class="cookie-cat-desc">
                  {{ isRtl 
                    ? 'تتيح للموقع تذكر خياراتك المفضلة مثل اللغة المحددة، والعملة، وحفظ العنوان الافتراضي لتسهيل تصفحك مستقبلاً.' 
                    : 'Enables the website to remember your preferences like chosen language, currency, and default address for faster visits.' }}
                </p>
              </div>
              <div class="cookie-switch">
                <input type="checkbox" v-model="preferences.preferences" id="cookie-pref" />
                <label for="cookie-pref" class="switch-slider"></label>
              </div>
            </div>

            <!-- 3. Analytics -->
            <div class="cookie-cat-item">
              <div class="cookie-cat-text">
                <div class="cookie-cat-title-row">
                  <span class="cookie-cat-title">{{ isRtl ? 'ملفات الأداء والتحليلات' : 'Analytics & Performance Cookies' }}</span>
                  <span class="cookie-badge optional">{{ isRtl ? 'اختياري' : 'Optional' }}</span>
                </div>
                <p class="cookie-cat-desc">
                  {{ isRtl 
                    ? 'تساعدنا في فهم كيفية تفاعل الزوار مع صفحات الموقع، وقياس الأداء لتطوير تجربة التسوق وتقديم محتوى أفضل.' 
                    : 'Helps us analyze how visitors interact with the site, measure performance, and continually improve the shopping experience.' }}
                </p>
              </div>
              <div class="cookie-switch">
                <input type="checkbox" v-model="preferences.analytics" id="cookie-ana" />
                <label for="cookie-ana" class="switch-slider"></label>
              </div>
            </div>

            <!-- 4. Marketing -->
            <div class="cookie-cat-item">
              <div class="cookie-cat-text">
                <div class="cookie-cat-title-row">
                  <span class="cookie-cat-title">{{ isRtl ? 'ملفات التسويق والإعلانات' : 'Marketing & Advertising Cookies' }}</span>
                  <span class="cookie-badge optional">{{ isRtl ? 'اختياري' : 'Optional' }}</span>
                </div>
                <p class="cookie-cat-desc">
                  {{ isRtl 
                    ? 'تستخدم لتقديم عروض ترويجية وخصومات حصرية مخصصة تناسب اهتماماتك في الأجهزة الإيطالية ومواقد الغاز.' 
                    : 'Used to provide tailored promotional offers, discounts, and personalized deals relevant to your interests.' }}
                </p>
              </div>
              <div class="cookie-switch">
                <input type="checkbox" v-model="preferences.marketing" id="cookie-mkt" />
                <label for="cookie-mkt" class="switch-slider"></label>
              </div>
            </div>
          </div>

          <div class="cookie-modal-footer">
            <button class="cookie-btn cookie-btn-reject" @click="rejectNonEssential">
              {{ isRtl ? 'رفض غير الضرورية' : 'Reject Non-Essential' }}
            </button>
            <div class="modal-footer-right">
              <button class="cookie-btn cookie-btn-accept" @click="acceptAll">
                {{ isRtl ? 'قبول الكل' : 'Accept All' }}
              </button>
              <button class="cookie-btn cookie-btn-manage" @click="savePreferences">
                {{ isRtl ? 'حفظ خياراتي' : 'Save Preferences' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const isRtl = computed(() => locale.value === 'ar');

const showBanner = ref(false);
const showModal = ref(false);

const preferences = reactive({
  necessary: true,
  preferences: true,
  analytics: true,
  marketing: false
});

const COOKIE_STORAGE_KEY = 'mastergas_cookie_consent';

onMounted(() => {
  const saved = localStorage.getItem(COOKIE_STORAGE_KEY);
  if (!saved) {
    // Show banner after brief delay
    setTimeout(() => {
      showBanner.value = true;
    }, 800);
  } else {
    try {
      const parsed = JSON.parse(saved);
      preferences.preferences = !!parsed.preferences;
      preferences.analytics = !!parsed.analytics;
      preferences.marketing = !!parsed.marketing;
    } catch (e) {
      showBanner.value = true;
    }
  }
});

const acceptAll = () => {
  preferences.preferences = true;
  preferences.analytics = true;
  preferences.marketing = true;
  persistConsent();
};

const rejectNonEssential = () => {
  preferences.preferences = false;
  preferences.analytics = false;
  preferences.marketing = false;
  persistConsent();
};

const savePreferences = () => {
  persistConsent();
};

const persistConsent = () => {
  localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify({
    timestamp: new Date().toISOString(),
    necessary: true,
    preferences: preferences.preferences,
    analytics: preferences.analytics,
    marketing: preferences.marketing
  }));
  showBanner.value = false;
  showModal.value = false;
};

const openModal = () => {
  showModal.value = true;
};

defineExpose({
  openModal
});
</script>

<style scoped>
.cookie-banner-wrapper {
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  max-width: 1200px;
  margin: 0 auto;
  pointer-events: none;
}

.cookie-banner {
  pointer-events: auto;
  background: rgba(18, 18, 18, 0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 1.25rem 1.75rem;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  color: #fff;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
}

.cookie-banner-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex: 1;
}

.cookie-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.cookie-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  color: #ffffff;
}

.cookie-desc {
  font-size: 0.85rem;
  color: #9ca3af;
  margin: 0;
  line-height: 1.5;
}

.cookie-link {
  color: #ffffff;
  text-decoration: underline;
  margin-inline-start: 0.5rem;
  font-weight: 500;
}

.cookie-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.cookie-btn {
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.cookie-btn-accept {
  background: #ffffff;
  color: #000000;
  border: 1px solid #ffffff;
}

.cookie-btn-accept:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.cookie-btn-manage {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cookie-btn-manage:hover {
  background: rgba(255, 255, 255, 0.16);
}

.cookie-btn-reject {
  background: transparent;
  color: #9ca3af;
  border: 1px solid transparent;
}

.cookie-btn-reject:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
}

/* Modal */
.cookie-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
}

.cookie-modal-container {
  background: #ffffff;
  border-radius: 20px;
  max-width: 650px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalPop {
  0% { opacity: 0; transform: scale(0.95) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.cookie-modal-header {
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-icon {
  width: 42px;
  height: 42px;
  background: #f3f4f6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111827;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.2rem;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

.modal-close-btn {
  background: #f3f4f6;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: #e5e7eb;
  color: #000;
}

.cookie-categories-list {
  padding: 1.5rem 1.75rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.cookie-cat-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.1rem 1.25rem;
  border-radius: 12px;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  transition: border-color 0.2s;
}

.cookie-cat-item:hover {
  border-color: #e5e7eb;
}

.cookie-cat-text {
  flex: 1;
}

.cookie-cat-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
}

.cookie-cat-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
}

.cookie-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.6rem;
  border-radius: 20px;
}

.cookie-badge.required {
  background: #e5e7eb;
  color: #374151;
}

.cookie-badge.optional {
  background: #e0f2fe;
  color: #0284c7;
}

.cookie-cat-desc {
  font-size: 0.82rem;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

/* Switch Toggle */
.cookie-switch {
  position: relative;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.cookie-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #d1d5db;
  border-radius: 24px;
  transition: 0.25s;
}

.switch-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: 0.25s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

[dir="rtl"] .switch-slider:before {
  left: auto;
  right: 3px;
}

.cookie-switch input:checked + .switch-slider {
  background-color: #000000;
}

.cookie-switch input:checked + .switch-slider:before {
  transform: translateX(20px);
}

[dir="rtl"] .cookie-switch input:checked + .switch-slider:before {
  transform: translateX(-20px);
}

.cookie-switch.disabled {
  opacity: 0.6;
}

.cookie-switch.disabled .switch-slider {
  cursor: not-allowed;
}

.cookie-modal-footer {
  padding: 1.25rem 1.75rem;
  border-top: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: #f9fafb;
}

.modal-footer-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cookie-modal-footer .cookie-btn-accept {
  background: #000000;
  color: #ffffff;
  border: 1px solid #000000;
}

.cookie-modal-footer .cookie-btn-accept:hover {
  background: #262626;
}

.cookie-modal-footer .cookie-btn-manage {
  background: #ffffff;
  color: #111827;
  border: 1px solid #d1d5db;
}

.cookie-modal-footer .cookie-btn-manage:hover {
  background: #f3f4f6;
}

.cookie-modal-footer .cookie-btn-reject {
  color: #6b7280;
  border-color: transparent;
}

.cookie-modal-footer .cookie-btn-reject:hover {
  color: #ef4444;
}

/* Animations */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(40px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .cookie-banner {
    flex-direction: column;
    align-items: stretch;
    padding: 1.25rem;
    gap: 1rem;
  }
  .cookie-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .cookie-btn {
    flex: 1;
    text-align: center;
  }
  .cookie-modal-footer {
    flex-direction: column-reverse;
  }
  .modal-footer-right {
    width: 100%;
  }
  .modal-footer-right .cookie-btn {
    flex: 1;
  }
}
</style>
