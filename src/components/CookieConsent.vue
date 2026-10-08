<template>
  <div>
    <!-- Bottom Cookie Consent Banner -->
    <transition name="slide-up">
      <div
        v-if="showBanner && !showModal"
        class="mastergas-cookie-consent"
        :class="{ 'is-en': !isRtl }"
      >
        <!-- consent-actions (Left side) -->
        <div class="consent-actions">
          <!-- btn-manage -->
          <button type="button" class="btn-manage" @click="openModal">
            {{ isRtl ? 'إدارة التفضيلات' : 'Manage Preferences' }}
          </button>

          <!-- btn-reject -->
          <button type="button" class="btn-reject" @click="rejectNonEssential">
            {{ isRtl ? 'رفض' : 'Reject' }}
          </button>

          <!-- btn-accept-all -->
          <button type="button" class="btn-accept-all" @click="acceptAll">
            {{ isRtl ? 'السماح' : 'Allow' }}
          </button>
        </div>

        <!-- consent-text-side (Right side) -->
        <div class="consent-text-side" :dir="isRtl ? 'rtl' : 'ltr'">
          <!-- cookie icon -->
          <div class="cookie-icon-wrapper" aria-hidden="true">
            <svg class="cookie-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
              <path d="M8.5 8.5v.01"/>
              <path d="M16 15.5v.01"/>
              <path d="M12 12v.01"/>
              <path d="M11 17v.01"/>
              <path d="M7 13v.01"/>
            </svg>
          </div>

          <p class="consent-message">
            {{ isRtl
              ? 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك على الموقع وتوفير ميزات مخصصة ومحتوى ملائم.'
              : 'We use cookies to improve your experience on our website and provide personalized features and relevant content.'
            }}
          </p>
        </div>
      </div>
    </transition>

    <!-- Cookie Preferences Modal -->
    <transition name="fade">
      <div
        v-if="showModal"
        class="cookie-modal-backdrop"
        @click.self="showModal = false"
      >
        <div
          class="mastergas-cookie-preferences"
          :class="{ 'is-en': !isRtl }"
        >
          <!-- modal-header -->
          <div class="modal-header" :dir="isRtl ? 'rtl' : 'ltr'">
            <!-- Title Row with Icon -->
            <div class="modal-title-row">
              <div class="cookie-icon-wrapper" aria-hidden="true">
                <svg class="cookie-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
                  <path d="M8.5 8.5v.01"/>
                  <path d="M16 15.5v.01"/>
                  <path d="M12 12v.01"/>
                  <path d="M11 17v.01"/>
                  <path d="M7 13v.01"/>
                </svg>
              </div>
              <h3 class="modal-title">
                {{ isRtl ? 'إدارة تفضيلات ملفات تعريف الارتباط' : 'Cookie Preferences Management' }}
              </h3>
            </div>

            <p class="modal-description">
              {{ isRtl
                ? 'نحن نستخدم ملفات تعريف الارتباط لضمان تشغيل موقعنا بكفاءة، وتقديم محتوى وإعلانات مخصصة تناسب تفضيلاتك. يمكنك اختيار الفئات التي ترغب في تفعيلها أدناه.'
                : 'We use cookies to ensure our website runs efficiently and deliver customized content and advertisements suited to your preferences. You can select which categories you wish to enable below.'
              }}
            </p>
          </div>

          <!-- modal-body -->
          <div class="modal-body">
            <!-- Row 1: الضرورية (Required) -->
            <div class="category-row">
              <div class="toggle-wrapper">
                <button
                  type="button"
                  class="cookie-toggle disabled"
                  aria-label="ضرورية"
                  disabled
                >
                  <span class="cookie-toggle-thumb"></span>
                </button>
              </div>

              <div class="text-wrapper" :dir="isRtl ? 'rtl' : 'ltr'">
                <div class="cat-title-row">
                  <span class="cat-title">{{ isRtl ? 'ملفات تعريف الارتباط الضرورية' : 'Strictly Necessary Cookies' }}</span>
                  <span class="required-badge">{{ isRtl ? 'إجباري' : 'Required' }}</span>
                </div>
                <p class="cat-desc">
                  {{ isRtl
                    ? 'مطلوبة لعمل الموقع بشكل صحيح وآمن، مثل ميزات تسجيل الدخول وإضافة المنتجات إلى السلة.'
                    : 'Required for the website to function safely and properly, such as login and cart capabilities.'
                  }}
                </p>
              </div>
            </div>

            <!-- Row 2: التفضيلات (Preferences) -->
            <div class="category-row">
              <div class="toggle-wrapper">
                <button
                  type="button"
                  class="cookie-toggle"
                  :class="{ active: preferences.preferences }"
                  @click="preferences.preferences = !preferences.preferences"
                  :aria-pressed="preferences.preferences"
                >
                  <span class="cookie-toggle-thumb"></span>
                </button>
              </div>

              <div class="text-wrapper" :dir="isRtl ? 'rtl' : 'ltr'">
                <div class="cat-title-row">
                  <span class="cat-title">{{ isRtl ? 'ملفات تعريف الارتباط للتفضيلات' : 'Preferences Cookies' }}</span>
                </div>
                <p class="cat-desc">
                  {{ isRtl
                    ? 'تسمح للموقع بتذكر خياراتك السابقة (مثل اللغة المفضلة أو المنطقة) لتقديم تجربة مخصصة.'
                    : 'Allows the site to remember previous choices (such as preferred language or region) for a customized experience.'
                  }}
                </p>
              </div>
            </div>

            <!-- Row 3: التحليلات (Analytics) -->
            <div class="category-row">
              <div class="toggle-wrapper">
                <button
                  type="button"
                  class="cookie-toggle"
                  :class="{ active: preferences.analytics }"
                  @click="preferences.analytics = !preferences.analytics"
                  :aria-pressed="preferences.analytics"
                >
                  <span class="cookie-toggle-thumb"></span>
                </button>
              </div>

              <div class="text-wrapper" :dir="isRtl ? 'rtl' : 'ltr'">
                <div class="cat-title-row">
                  <span class="cat-title">{{ isRtl ? 'ملفات تعريف الارتباط للتحليلات' : 'Analytics Cookies' }}</span>
                </div>
                <p class="cat-desc">
                  {{ isRtl
                    ? 'تساعدنا في فهم كيفية تفاعل الزوار مع الموقع، وتحديد الصفحات الأكثر زيارة لتحسين الأداء.'
                    : 'Helps us understand how visitors interact with the site and identify top pages to improve performance.'
                  }}
                </p>
              </div>
            </div>

            <!-- Row 4: التسويق (Marketing) -->
            <div class="category-row">
              <div class="toggle-wrapper">
                <button
                  type="button"
                  class="cookie-toggle"
                  :class="{ active: preferences.marketing }"
                  @click="preferences.marketing = !preferences.marketing"
                  :aria-pressed="preferences.marketing"
                >
                  <span class="cookie-toggle-thumb"></span>
                </button>
              </div>

              <div class="text-wrapper" :dir="isRtl ? 'rtl' : 'ltr'">
                <div class="cat-title-row">
                  <span class="cat-title">{{ isRtl ? 'ملفات تعريف الارتباط للتسويق' : 'Marketing Cookies' }}</span>
                </div>
                <p class="cat-desc">
                  {{ isRtl
                    ? 'تُستخدم لتتبع الزوار عبر المواقع الإلكترونية بهدف عرض إعلانات مخصصة ومهمة للمستخدم.'
                    : 'Used to track visitors across websites in order to display relevant, personalized ads.'
                  }}
                </p>
              </div>
            </div>
          </div>

          <!-- modal-footer -->
          <div class="modal-footer">
            <!-- btn-allow-all (Left) -->
            <button type="button" class="btn-allow-all" @click="acceptAll">
              {{ isRtl ? 'السماح للجميع' : 'Allow All' }}
            </button>

            <!-- btn-save-preferences (Right) -->
            <button type="button" class="btn-save-preferences" @click="savePreferences">
              {{ isRtl ? 'حفظ التفضيلات' : 'Save Preferences' }}
            </button>
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
  preferences: true, // Matches Figma initial demo state
  analytics: false,
  marketing: false
});

const COOKIE_STORAGE_KEY = 'mastergas_cookie_consent';

onMounted(() => {
  const saved = localStorage.getItem(COOKIE_STORAGE_KEY);
  if (!saved) {
    setTimeout(() => {
      showBanner.value = true;
    }, 600);
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

  if (typeof window !== 'undefined') {
    window.openCookiePreferences = openModal;
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
/* ============================================================
   Part 1: mastergas-cookie-consent (Bottom Banner)
   ============================================================ */
.mastergas-cookie-consent {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px 64px;

  position: fixed;
  width: 100%;
  min-height: 90px;
  left: 0px;
  bottom: 0px;

  background: #FFFFFF;
  border-top: 1px solid #E2E8F0;
  box-shadow: 0px -8px 24px rgba(0, 0, 0, 0.0784314);
  z-index: 99999;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  direction: ltr; /* Keeps [Actions (left)] and [Message + Cookie (right)] */
}

/* consent-actions */
.consent-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 16px;
  height: 45px;
  flex-shrink: 0;
}

/* btn-manage */
.btn-manage {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  min-width: 110px;
  height: 37px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #64748B;
  transition: color 0.2s;
  white-space: nowrap;
}

.btn-manage:hover {
  color: #111827;
}

/* btn-reject */
.btn-reject {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  min-width: 78px;
  height: 45px;
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-reject:hover {
  background: #F8FAFC;
}

/* btn-accept-all */
.btn-accept-all {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  min-width: 89px;
  height: 45px;
  background: #111827;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #FFFFFF;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.btn-accept-all:hover {
  background: #000000;
}

/* consent-text-side */
.consent-text-side {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 0px;
  gap: 16px;
  flex: 1;
}

.consent-message {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  text-align: right;
  color: #000000;
  margin: 0;
}

.cookie-icon-wrapper {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #111827;
}

.cookie-svg {
  width: 24px;
  height: 24px;
}

/* ============================================================
   Part 2: mastergas-cookie-preferences (Modal)
   ============================================================ */
.cookie-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.501961);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 100001;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}

.mastergas-cookie-preferences {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 32px;
  gap: 24px;

  width: 580px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 40px);
  overflow-y: auto;

  background: #FFFFFF;
  box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.14902);
  border-radius: 16px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  direction: ltr; /* Keeps [Toggle (left)] and [Text (right)] */
}

/* modal-header */
.modal-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 12px;
  width: 100%;
}

.modal-title-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  padding: 0px;
  gap: 8px;
  width: 100%;
}

.modal-title {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 30px;
  text-align: right;
  color: #000000;
  margin: 0;
}

.modal-description {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  text-align: right;
  color: #64748B;
  margin: 0;
  width: 100%;
}

/* modal-body */
.modal-body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  width: 100%;
}

.category-row {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0px;
  width: 100%;
  border-bottom: 1px solid #E2E8F0;
  gap: 16px;
}

.category-row:last-child {
  border-bottom: none;
}

/* toggle-wrapper */
.toggle-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0px;
  flex-shrink: 0;
}

/* Toggle Switch Component */
.cookie-toggle {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 9999px;
  background: #CBD5E1;
  border: none;
  padding: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.25s ease;
  flex-shrink: 0;
}

.cookie-toggle.active {
  background: #111827;
}

.cookie-toggle.disabled {
  background: #E2E8F0;
  cursor: not-allowed;
  opacity: 0.7;
}

.cookie-toggle-thumb {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #FFFFFF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translateX(0);
}

.cookie-toggle.active .cookie-toggle-thumb {
  transform: translateX(20px);
}

/* text-wrapper */
.text-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.cat-title-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  padding: 0px;
  gap: 8px;
  width: 100%;
}

.required-badge {
  box-sizing: border-box;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: #64748B;
  white-space: nowrap;
}

.cat-title {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  text-align: right;
  color: #000000;
  white-space: nowrap;
}

.cat-desc {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  text-align: right;
  color: #64748B;
  margin: 0;
  width: 100%;
}

/* modal-footer */
.modal-footer {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0px 0px;
  width: 100%;
  gap: 16px;
}

/* btn-allow-all */
.btn-allow-all {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  min-width: 132px;
  height: 45px;
  background: transparent;
  border: 1.5px solid #000000;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-allow-all:hover {
  background: #F8FAFC;
}

/* btn-save-preferences */
.btn-save-preferences {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  min-width: 137px;
  height: 45px;
  background: #111827;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #FFFFFF;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.btn-save-preferences:hover {
  background: #000000;
}

/* ============================================================
   Mobile Responsiveness
   ============================================================ */
@media (max-width: 900px) {
  .mastergas-cookie-consent {
    padding: 16px 24px;
    flex-direction: column-reverse;
    align-items: stretch;
    gap: 16px;
  }

  .consent-text-side {
    justify-content: flex-start;
  }

  .consent-actions {
    justify-content: space-between;
    width: 100%;
    height: auto;
  }
}

@media (max-width: 640px) {
  .mastergas-cookie-consent {
    padding: 16px 16px;
    gap: 14px;
  }

  .consent-message {
    font-size: 14px;
    line-height: 20px;
  }

  .consent-actions {
    gap: 8px;
  }

  .btn-manage {
    min-width: auto;
    padding: 8px 6px;
    font-size: 13px;
  }

  .btn-reject,
  .btn-accept-all {
    min-width: auto;
    flex: 1;
    padding: 10px 14px;
    height: 42px;
    font-size: 13px;
  }

  .mastergas-cookie-preferences {
    padding: 20px 16px;
    gap: 16px;
    border-radius: 12px;
  }

  .modal-title {
    font-size: 17px;
    line-height: 26px;
  }

  .modal-description {
    font-size: 13px;
    line-height: 19px;
  }

  .cat-title {
    font-size: 14px;
  }

  .cat-desc {
    font-size: 13px;
    line-height: 19px;
  }

  .modal-footer {
    gap: 10px;
  }

  .btn-allow-all,
  .btn-save-preferences {
    min-width: auto;
    flex: 1;
    padding: 10px 12px;
    height: 42px;
    font-size: 13px;
  }
}

/* Transitions */
.slide-up-enter-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
}

.slide-up-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
