<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="auth-modal-overlay" @click.self="closeModal">
      <div class="auth-modal-content" :dir="currentDir">
        <button class="close-btn" @click="closeModal" :style="isRtl ? 'left: 16px; right: auto;' : 'right: 16px; left: auto;'">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="modal-header">
          <div class="logo-wrapper">
            <img v-if="logo" :src="logo" :alt="siteName" class="modal-logo-img" />
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-bag">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <h2 class="title" style="font-weight: 800;">{{ t('auth.welcome') }}</h2>
          <p class="subtitle">{{ t('auth.welcome_subtitle') }}</p>
        </div>

        <div class="tabs">
          <button 
            class="tab-btn" 
            :class="{ active: currentTab === 'login' }"
            @click="currentTab = 'login'; clearMessages()"
          >
            {{ t('auth.login') }}
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: currentTab === 'register' }"
            @click="currentTab = 'register'; clearMessages()"
          >
            {{ t('auth.register') }}
          </button>
        </div>

        <!-- Custom Alerts -->
        <div v-if="globalSuccess" class="custom-alert success-alert" :dir="currentDir" role="status" aria-live="polite">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
          <span>{{ globalSuccess }}</span>
        </div>

        <div v-if="globalError" class="custom-alert error-alert" :dir="currentDir" role="alert" aria-live="assertive">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          <span>{{ globalError }}</span>
        </div>

        <!-- Login Form -->
        <form v-if="currentTab === 'login'" @submit.prevent="handleLogin" class="auth-form" :dir="currentDir" novalidate :aria-busy="loading">
          <div class="form-group">
            <label>{{ t('auth.email') }}</label>
            <div class="input-wrapper">
              <input type="email" v-model="loginForm.email" :placeholder="t('auth.email_placeholder')" autocomplete="email" :aria-invalid="Boolean(errors.loginEmail)" :aria-describedby="errors.loginEmail ? 'login-email-error' : undefined" />
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
            </div>
            <span v-if="errors.loginEmail" id="login-email-error" class="inline-error-msg">{{ errors.loginEmail }}</span>
          </div>

          <div class="form-group">
            <label>{{ t('auth.password') }}</label>
            <div class="input-wrapper">
              <input :type="showLoginPassword ? 'text' : 'password'" v-model="loginForm.password" :placeholder="t('auth.password_placeholder')" autocomplete="current-password" :aria-invalid="Boolean(errors.loginPassword)" :aria-describedby="errors.loginPassword ? 'login-password-error' : undefined" />
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <button type="button" class="eye-btn" @click="showLoginPassword = !showLoginPassword">
                <i :class="showLoginPassword ? 'far fa-eye-slash' : 'far fa-eye'"></i>
              </button>
            </div>
            <span v-if="errors.loginPassword" id="login-password-error" class="inline-error-msg">{{ errors.loginPassword }}</span>
          </div>

          <div class="forgot-password">
            <a href="#" @click.prevent="currentTab = 'forgot-password'">{{ t('auth.forgot_password') }}</a>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading" class="loading-content"><span class="button-spinner" aria-hidden="true"></span>{{ t('auth.loading') }}</span>
            <span v-else>{{ t('auth.submit_login') }}</span>
          </button>

          <div class="continue-browsing">
            <a href="#" @click.prevent="closeModal">{{ t('auth.continue_browsing') }}</a>
          </div>
        </form>

        <!-- Register Form -->
        <form v-else-if="currentTab === 'register'" @submit.prevent="handleRegister" class="auth-form" :dir="currentDir" novalidate :aria-busy="loading">
          <div class="form-group">
            <label>{{ t('auth.name') }}</label>
            <div class="input-wrapper">
              <input type="text" v-model="registerForm.name" :placeholder="t('auth.name_placeholder')" autocomplete="name" :aria-invalid="Boolean(errors.name)" />
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <span v-if="errors.name" class="inline-error-msg">{{ errors.name }}</span>
          </div>

          <div class="form-group">
            <label>{{ t('auth.email') }}</label>
            <div class="input-wrapper">
              <input type="email" v-model="registerForm.email" :placeholder="t('auth.email_placeholder')" autocomplete="email" :aria-invalid="Boolean(errors.email)" />
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
            </div>
            <span v-if="errors.email" class="inline-error-msg">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label>{{ t('auth.phone') }}</label>
            <div class="phone-input-wrapper">
              <!-- Country Dropdown Selector Box -->
              <div class="country-selector-box">
                <span class="country-dial-badge">{{ activeCountryObj.dialCode }}</span>
                <span class="country-flag-badge">{{ activeCountryObj.flag }}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                <select v-model="selectedCountry" class="native-country-select" :dir="currentDir" :aria-label="t('auth.country')">
                  <option 
                    v-for="c in filteredCountries"
                    :key="c.code" 
                    :value="c.code"
                  >
                    {{ c.dialCode }} {{ c.flag }} - {{ isRtl ? c.nameAr : c.nameEn }}
                  </option>
                </select>
              </div>

              <input v-model="countrySearch" type="search" class="country-search-input" :placeholder="t('auth.country_search')" :aria-label="t('auth.country_search')" autocomplete="off" />

              <!-- Phone Number Input -->
              <input 
                type="tel" 
                v-model="registerForm.phone" 
                class="phone-field"
                :placeholder="activeCountryObj.placeholder" 
                :maxlength="activeCountryObj.maxLength" 
                :aria-invalid="Boolean(errors.phone)"
                dir="ltr" 
              />
            </div>
            <span v-if="errors.phone" class="inline-error-msg">{{ errors.phone }}</span>
          </div>

          <div class="form-group">
            <label>{{ t('auth.password') }}</label>
            <div class="input-wrapper">
              <input :type="showRegisterPassword ? 'text' : 'password'" v-model="registerForm.password" :placeholder="t('auth.password_placeholder')" autocomplete="new-password" :aria-invalid="Boolean(errors.password)" />
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <button type="button" class="eye-btn" @click="showRegisterPassword = !showRegisterPassword">
                <i :class="showRegisterPassword ? 'far fa-eye-slash' : 'far fa-eye'"></i>
              </button>
            </div>
            <span v-if="errors.password" class="inline-error-msg">{{ errors.password }}</span>
            <span class="password-hint">{{ t('auth.password_hint') }}</span>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading" class="loading-content"><span class="button-spinner" aria-hidden="true"></span>{{ t('auth.loading') }}</span>
            <span v-else>{{ t('auth.submit_register') }}</span>
          </button>

          <div class="continue-browsing">
            <a href="#" @click.prevent="closeModal">{{ t('auth.continue_browsing') }}</a>
          </div>
        </form>

        <!-- Forgot Password Form -->
        <form v-else-if="currentTab === 'forgot-password'" @submit.prevent="handleForgotPassword" class="auth-form" :dir="currentDir">
          <div class="form-group">
            <label>{{ t('auth.email') }}</label>
            <div class="input-wrapper">
              <input type="email" v-model="forgotPasswordForm.email" :placeholder="t('auth.email_placeholder')" required />
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
            </div>
            <span v-if="errors.forgotEmail" class="inline-error-msg">{{ errors.forgotEmail }}</span>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? t('auth.loading') : t('auth.send_reset_link') }}
          </button>

          <div class="continue-browsing">
            <a href="#" @click.prevent="currentTab = 'login'">{{ t('auth.back_to_login') }}</a>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { authActions, authState } from '../store/auth'
import api from '../config/axios'
import { countries, findCountryByCode, validatePhoneByCountry } from '../data/countries'

const { t, locale } = useI18n()
const isRtl = computed(() => locale.value === 'ar')
const currentDir = computed(() => isRtl.value ? 'rtl' : 'ltr')

defineProps({
  logo: String,
  siteName: String
})

const isOpen = ref(false)
const currentTab = ref('login')
const loading = computed(() => authState.loading)
const globalError = ref('')
const globalSuccess = ref('')
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)

const selectedCountry = ref('JO')
const countrySearch = ref('')

const activeCountryObj = computed(() => {
  return findCountryByCode(selectedCountry.value)
})

const filteredCountries = computed(() => {
  const query = countrySearch.value.trim().toLowerCase()
  if (!query) return countries
  return countries.filter((country) => [
    country.code,
    country.dialCode,
    country.nameAr,
    country.nameEn,
  ].some((value) => String(value).toLowerCase().includes(query)))
})

const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  name: '',
  email: '',
  phone: '',
  password: '' 
})

const forgotPasswordForm = reactive({
  email: ''
})

const errors = reactive({
  loginEmail: '',
  loginPassword: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  forgotEmail: ''
})

const clearMessages = () => {
  globalError.value = ''
  globalSuccess.value = ''
  errors.loginEmail = ''
  errors.loginPassword = ''
  errors.name = ''
  errors.email = ''
  errors.phone = ''
  errors.password = ''
  errors.forgotEmail = ''
}

const validatePhone = (phone, country) => {
  return validatePhoneByCountry(phone, country, locale.value)
}

const validateLoginForm = () => {
  clearMessages();
  let isValid = true;
  
  if (!loginForm.email) {
    errors.loginEmail = t('auth.email_required');
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
    errors.loginEmail = t('auth.email_invalid');
    isValid = false;
  }
  
  if (!loginForm.password) {
    errors.loginPassword = t('auth.password_required');
    isValid = false;
  } else if (loginForm.password.length < 6) {
    errors.loginPassword = t('auth.password_min');
    isValid = false;
  }
  
  return isValid;
}

const validateRegisterForm = () => {
  clearMessages();
  let isValid = true;
  
  if (!registerForm.name) {
    errors.name = t('auth.name_required');
    isValid = false;
  } else if (registerForm.name.trim().length < 3) {
    errors.name = t('auth.name_min');
    isValid = false;
  }
  
  if (!registerForm.email) {
    errors.email = t('auth.email_required');
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
    errors.email = t('auth.email_invalid');
    isValid = false;
  }
  
  const phoneError = validatePhone(registerForm.phone, selectedCountry.value);
  if (phoneError) {
    errors.phone = phoneError;
    isValid = false;
  }
  
  if (!registerForm.password) {
    errors.password = t('auth.password_required');
    isValid = false;
  } else if (registerForm.password.length < 6) {
    errors.password = t('auth.password_min');
    isValid = false;
  }
  
  return isValid;
}

const validateForgotPasswordForm = () => {
  clearMessages();
  let isValid = true;
  
  if (!forgotPasswordForm.email) {
    errors.forgotEmail = t('auth.email_required');
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordForm.email)) {
    errors.forgotEmail = t('auth.email_invalid');
    isValid = false;
  }
  
  return isValid;
}

const openModal = () => {
  isOpen.value = true
  document.body.style.overflow = 'hidden' 
  clearMessages()
}

const closeModal = () => {
  isOpen.value = false
  currentTab.value = 'login'
  countrySearch.value = ''
  document.body.style.overflow = ''
}

const cleanAuthQuery = () => {
  if (typeof window === 'undefined') return
  const cleanUrl = `${window.location.pathname}${window.location.hash}`
  window.history.replaceState({}, document.title, cleanUrl || '/')
}

const getServerErrorMessage = (error, fallback) => {
  const response = error?.response?.data
  const fieldError = response?.errors && Object.values(response.errors).flat()[0]
  if (fieldError) return fieldError
  if (error?.response?.status === 401 || error?.response?.status === 422) {
    return fallback
  }
  return response?.message || fallback
}

const handleForgotPassword = async () => {
  if (!validateForgotPasswordForm()) {
    globalError.value = t('auth.please_fix_errors');
    return;
  }
  clearMessages()
  try {
    const res = await api.post('/frontend/forgot-password', forgotPasswordForm)
    globalSuccess.value = res.data.message || t('auth.reset_link_sent')
    forgotPasswordForm.email = ''
  } catch (error) {
    console.error(error)
    globalError.value = error.response?.data?.message || t('auth.reset_error')
  }
}

const handleLogin = async () => {
  if (!validateLoginForm()) {
    globalError.value = t('auth.please_fix_errors');
    return;
  }
  clearMessages()
  try {
    const res = await authActions.login(loginForm)
    globalSuccess.value = res.message || t('auth.login_success')
    setTimeout(() => {
      closeModal()
      cleanAuthQuery()
      window.location.reload()
    }, 1000)
  } catch (error) {
    console.error(error)
    globalError.value = getServerErrorMessage(error, t('auth.login_error'))
  }
}

const handleRegister = async () => {
  if (!validateRegisterForm()) {
    globalError.value = t('auth.please_fix_errors');
    return;
  }
  clearMessages()
  try {
    const res = await authActions.register(registerForm)
    globalSuccess.value = res.message || t('auth.login_success')
    setTimeout(() => {
      closeModal()
      cleanAuthQuery()
      window.location.reload()
    }, 1000)
  } catch (error) {
    console.error(error)
    globalError.value = getServerErrorMessage(error, t('auth.register_error'))
  }
}

defineExpose({
  openModal,
  closeModal
})
</script>

<style scoped>
.auth-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 999999 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
}

.auth-modal-content {
  background: #fff;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  border-radius: 16px;
  padding: 30px;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin: 20px;
  overflow-y: auto;
}

.close-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-header {
  text-align: center;
  margin-bottom: 25px;
}

.logo-wrapper {
  background: transparent;
  width: 140px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
}

.modal-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 5px;
}

.title {
  font-size: 24px;
  color: #111827;
  margin: 0 0 8px;
}

.subtitle {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.tabs {
  display: flex;
  background: #f9fafb;
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 25px;
  direction: rtl;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 15px;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #000000;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(135, 50, 96, 0.2);
}

.custom-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 700;
}

.success-alert {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.error-alert {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.form-group {
  margin-bottom: 20px;
  text-align: right;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: 14px 45px 14px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.2s;
  outline: none;
  text-align: right;
}

.input-wrapper .input-icon {
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
  z-index: 1;
}

.eye-btn {
  position: absolute;
  top: 50%;
  left: 15px;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  z-index: 2;
}

.phone-input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  height: 48px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  overflow: hidden;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.phone-input-wrapper:focus-within {
  border-color: #000000;
}

.country-selector-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 100%;
  padding: 0 10px;
  background: #f9fafb;
  border-left: 1px solid #e5e7eb;
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;
  box-sizing: border-box;
}

.country-search-input {
  width: 100%;
  margin-top: 8px;
  padding: 9px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
  color: #1f2937;
  font: inherit;
  font-size: 12px;
  outline: none;
  box-sizing: border-box;
}

.country-search-input:focus {
  border-color: #000;
  background: #fff;
}

.country-dial-badge {
  font-family: 'IBM Plex Sans Arabic', system-ui, -apple-system, sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #1f2937;
  direction: ltr;
  line-height: 1;
}

.country-flag-badge {
  font-size: 16px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
}

.chevron-icon {
  color: #6b7280;
  margin-right: 2px;
  flex-shrink: 0;
}

.native-country-select {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  border: none;
  margin: 0;
  padding: 0;
  appearance: none;
  -webkit-appearance: none;
  z-index: 10;
}

.native-country-select option {
  opacity: 1;
  background: #ffffff;
  color: #1f2937;
  padding: 10px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 14px;
  direction: rtl;
  text-align: right;
}

.phone-field {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 0 14px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  text-align: right;
  box-sizing: border-box;
}

.phone-field::placeholder {
  color: #9ca3af;
}

.inline-error-msg {
  color: #dc2626;
  font-size: 11px;
  margin-top: 4px;
  display: block;
  font-weight: 700;
  text-align: right;
}

.password-hint {
  display: block;
  margin-top: 6px;
  color: #6b7280;
  font-size: 11px;
  line-height: 1.5;
}

.phone-input-wrapper input {
  flex: 1;
  padding: 14px 16px;
  border: none;
  font-size: 14px;
  outline: none;
}

.phone-input-wrapper .input-icon {
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
  z-index: 1;
}

.forgot-password {
  text-align: right;
  margin-bottom: 20px;
}

.forgot-password a {
  color: #000000;
  font-size: 13px;
  text-decoration: none;
  font-weight: 500;
}

.forgot-password a:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  background: #000000;
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #4a1936;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.loading-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.button-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: #fff;
  border-radius: 50%;
  animation: auth-spin 0.7s linear infinite;
}

@keyframes auth-spin {
  to { transform: rotate(360deg); }
}

.continue-browsing {
  text-align: center;
  margin-top: 20px;
}

.continue-browsing a {
  color: #6b7280;
  font-size: 14px;
  text-decoration: none;
}

.continue-browsing a:hover {
  color: #374151;
  text-decoration: underline;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* LTR Layout Adjustments for English */
.auth-modal-content[dir="ltr"] .input-wrapper input {
  padding: 14px 14px 14px 45px;
  text-align: left;
}

.auth-modal-content[dir="ltr"] .input-wrapper .input-icon {
  right: auto;
  left: 15px;
}

.auth-modal-content[dir="ltr"] .eye-btn {
  left: auto;
  right: 15px;
}

.auth-modal-content[dir="ltr"] .inline-error-msg {
  text-align: left;
}

.auth-modal-content[dir="ltr"] .phone-field {
  text-align: left;
}

.auth-modal-content[dir="ltr"] .country-selector-box {
  border-left: none;
  border-right: 1px solid #e5e7eb;
}

.auth-modal-content[dir="ltr"] .forgot-password {
  text-align: left;
}
</style>
