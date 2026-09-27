<template>
  <div class="login-page">
    <!-- القسم الأيسر: نموذج تسجيل الدخول -->
    <div class="login-left">
      <div class="login-form-wrapper">
        <!-- العنوان -->
        <div class="login-header">
          <h2 class="login-title">مرحباً بك في تجارة</h2>
          <p class="login-subtitle">أدخل بيانات الاعتماد للوصول إلى لوحة التحكم</p>
        </div>

        <!-- نموذج تسجيل الدخول -->
        <form @submit.prevent="handleLogin" class="login-form" novalidate>
          <!-- البريد الإلكتروني -->
          <div class="form-group">
            <label for="email" class="form-label">البريد الإلكتروني</label>
            <div class="input-wrapper">
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                placeholder="admin@example.com"
                class="form-input"
                :class="{ 'input-error': errors.email }"
                autocomplete="email"
              />
              <span class="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
            </div>
            <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
          </div>

          <!-- كلمة المرور -->
          <div class="form-group">
            <label for="password" class="form-label">كلمة المرور</label>
            <div class="input-wrapper">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="أدخل كلمة المرور"
                class="form-input"
                :class="{ 'input-error': errors.password }"
                autocomplete="current-password"
              />
              <span class="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <svg v-if="!showPassword" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
          </div>

          <!-- تذكرني ونسيت كلمة المرور -->
          <div class="form-row">
            <label class="remember-label">
              <input
                type="checkbox"
                v-model="form.remember"
                class="remember-checkbox"
              />
              <span class="checkmark"></span>
              <span>تذكرني</span>
            </label>
            <a href="#" class="forgot-link">نسيت كلمة المرور؟</a>
          </div>

          <!-- رسالة الخطأ العامة -->
          <div v-if="error" class="error-alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ error }}
          </div>

          <!-- زر تسجيل الدخول -->
          <button
            type="submit"
            class="login-btn"
            :disabled="loading"
          >
            <span v-if="!loading" class="btn-content">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              <span>تسجيل الدخول إلى لوحة التحكم</span>
            </span>
            <span v-else class="btn-loading">
              <span class="spinner"></span>
              جاري تسجيل الدخول...
            </span>
          </button>
        </form>
      </div>

      <!-- Footer -->
      <div class="login-footer">
        <p>جميع الحقوق محفوظة © Tijara {{ currentYear }}</p>
      </div>
    </div>

    <!-- القسم الأيمن: لوحة العلامة التجارية -->
    <div class="login-right">
      <!-- اللوجو -->
      <div class="brand-logo">
        <img src="/logo.png" alt="تجارة" class="brand-logo-img" />
        <span>لوحة الإدارة</span>
      </div>

      <!-- المحتوى الرئيسي -->
      <div class="brand-content">
        <h1 class="brand-title">
          إدارة منصة<br />التجارة الإلكترونية
        </h1>
        <p class="brand-desc">
          الوصول إلى لوحة التحكم لمتابعة المنتجات، وإدارة المشتريات وتتبع المبيعات وخدمة عملائك.
        </p>
      </div>

      <!-- زخرفة دوائر في الخلفية -->
      <div class="brand-decoration">
        <div class="deco-circle deco-circle-1"></div>
        <div class="deco-circle deco-circle-2"></div>
        <div class="deco-circle deco-circle-3"></div>
      </div>

      <!-- Footer للقسم الأيمن -->
      <div class="brand-footer">
        <p>جميع الحقوق محفوظة © Tijara {{ currentYear }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import api from '../config/axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const form = ref({
  email: '',
  password: '',
  remember: false,
});

const loading = ref(false);
const error = ref('');
const errors = ref({});
const showPassword = ref(false);

const currentYear = computed(() => new Date().getFullYear());

import { onMounted } from 'vue';

const updateFaviconFromSettings = async () => {
    try {
        const res = await api.get('/dashboard/settings');
        const logoEntry = res.data.data.find(s => s.key === 'logo');
        if (logoEntry && logoEntry.value && logoEntry.value !== '[]') {
            let link = document.querySelector("link[rel*='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = logoEntry.value;
        }
    } catch (err) {
        console.error('Failed to update favicon', err);
    }
};

onMounted(updateFaviconFromSettings);

// استرجاع الإيميل المحفوظ إن وجد
const savedEmail = localStorage.getItem('remembered_email');
if (savedEmail) {
  form.value.email = savedEmail;
  form.value.remember = true;
}

const validate = () => {
  errors.value = {};

  if (!form.value.email) {
    errors.value.email = 'البريد الإلكتروني مطلوب';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'البريد الإلكتروني غير صحيح';
  }

  if (!form.value.password) {
    errors.value.password = 'كلمة المرور مطلوبة';
  } else if (form.value.password.length < 6) {
    errors.value.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
  }

  return Object.keys(errors.value).length === 0;
};

const handleLogin = async () => {
  error.value = '';

  if (!validate()) return;

  loading.value = true;

  try {
    const response = await api.post('/v1/login', {
      email: form.value.email,
      password: form.value.password,
    });

    // حفظ الـ token والمعلومات
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('admin', JSON.stringify(response.data.admin));

    if (form.value.remember) {
      localStorage.setItem('remembered_email', form.value.email);
    } else {
      localStorage.removeItem('remembered_email');
    }

    // الانتقال للوحة التحكم
    router.push('/admin/dashboard');
  } catch (err) {
    error.value = err.response?.data?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* ===== تخطيط الصفحة الرئيسي ===== */
.login-page {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  direction: ltr; /* LTR على الحاوية لترتيب الأعمدة: نموذج يسار، براند يمين */
  font-family: 'IBM Plex Sans Arabic', sans-serif;
}

/* ===== القسم الأيسر (النموذج) ===== */
.login-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--bg-main);
  padding: 3rem;
  position: relative;
  min-height: 100vh;
  direction: rtl; /* RTL داخل النموذج */
}

.login-form-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 380px;
  margin: auto;
  width: 100%;
}

/* ===== رأس صفحة تسجيل الدخول ===== */
.login-header {
  text-align: right;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 1.55rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.4rem;
  letter-spacing: -0.3px;
}

.login-subtitle {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.5;
}

/* ===== النموذج ===== */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-main);
  text-align: right;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 0.65rem 2.4rem 0.65rem 2.4rem;
  border: 1.5px solid var(--input-border);
  border-radius: 7px;
  font-size: 0.82rem;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  color: var(--text-main);
  background: var(--input-bg);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  direction: ltr;
  text-align: right;
  outline: none;
}

.form-input::placeholder {
  color: #9ca3af;
  direction: ltr;
  text-align: right;
}

.form-input:focus {
  border-color: #873260;
  box-shadow: 0 0 0 3px rgba(139, 34, 82, 0.1);
}

.form-input.input-error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-icon {
  position: absolute;
  right: 0.75rem;
  color: #9ca3af;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.toggle-password {
  position: absolute;
  left: 0.75rem;
  color: #9ca3af;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #873260;
}

.error-msg {
  font-size: 0.72rem;
  color: #ef4444;
  text-align: right;
}

/* ===== صف تذكرني + نسيت كلمة المرور ===== */
.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.2rem;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  font-size: 0.78rem;
  color: var(--text-muted);
  user-select: none;
}

.remember-checkbox {
  width: 14px;
  height: 14px;
  accent-color: #873260;
  cursor: pointer;
}

.forgot-link {
  font-size: 0.78rem;
  color: #873260;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #6E1A41;
  text-decoration: underline;
}

/* ===== رسالة الخطأ العامة ===== */
.error-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.6rem 0.8rem;
  border-radius: 7px;
  font-size: 0.78rem;
}

/* ===== زر تسجيل الدخول ===== */
.login-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #873260;
  color: #ffffff;
  border: none;
  border-radius: 7px;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-top: 0.5rem;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none;
}

.login-btn:hover:not(:disabled) {
  background: #6E1A41;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(139, 34, 82, 0.35);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-icon {
  flex-shrink: 0;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== فوتر القسم الأيسر ===== */
.login-footer {
  text-align: center;
  font-size: 0.72rem;
  color: #9ca3af;
  padding-top: 1rem;
}

/* ===== القسم الأيمن (البراندينج) ===== */
.login-right {
  width: 42%;
  background: #873260;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2rem 2.5rem;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  direction: rtl; /* RTL داخل القسم الملوّن */
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-start; /* في RTL flex-start = يمين */
}

.brand-logo span {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.brand-logo-img {
  height: 52px;
  width: auto;
  object-fit: contain;
  opacity: 0.95;
}

/* المحتوى الرئيسي للبراند */
.brand-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start; /* في RTL: flex-start = يمين ✓ */
  text-align: right;
  position: relative;
  z-index: 2;
}

.brand-title {
  font-size: 2.4rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.35;
  margin-bottom: 1rem;
  letter-spacing: -0.5px;
  text-align: right;
}

.brand-desc {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.75;
  max-width: 320px;
  text-align: right;
}

/* زخارف الدوائر */
.brand-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.deco-circle-1 {
  width: 350px;
  height: 350px;
  top: -80px;
  left: -120px;
  background: rgba(255, 255, 255, 0.03);
}

.deco-circle-2 {
  width: 200px;
  height: 200px;
  bottom: 80px;
  right: -60px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.deco-circle-3 {
  width: 120px;
  height: 120px;
  top: 40%;
  left: 20%;
  background: rgba(255, 255, 255, 0.03);
}

/* فوتر القسم الأيمن */
.brand-footer {
  text-align: center;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  position: relative;
  z-index: 2;
}

/* فوتر القسم الأيسر */
.login-footer {
  text-align: center;
  font-size: 0.72rem;
  color: #9ca3af;
  padding-top: 1rem;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .login-page {
    flex-direction: column;
  }

  .login-right {
    display: none;
  }

  .login-left {
    padding: 2rem 1.5rem;
    min-height: 100vh;
  }

  .login-form-wrapper {
    margin: auto;
  }
}
</style>
