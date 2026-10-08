<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="auth-modal-overlay" @click.self="closeModal">
      <div class="auth-modal-content" :class="{ 'success-modal-shell': resetSuccess }" :dir="currentDir">
        <template v-if="resetSuccess">
          <section class="reset-success-state" role="status" aria-live="polite">
            <div class="checkmark-circle" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M8.5 16.5L13.5 21.5L24 10.5" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="reset-success-copy">
              <h2>{{ t('auth.reset_success_title') }}</h2>
              <p>{{ t('auth.reset_success_message') }}</p>
            </div>
            <button type="button" class="reset-success-btn" @click="closeModal">
              {{ t('cart.continue_shopping') }}
            </button>
          </section>
        </template>
        <template v-else>
        <div v-if="currentTab !== 'forgot-password'" class="modal-header">
          <div class="modal-header-text">
            <h2 class="title" style="font-weight: 800;">{{ t('auth.welcome') }}</h2>
            <p class="subtitle">{{ t('auth.welcome_subtitle') }}</p>
          </div>
          <button class="close-btn" @click="closeModal" type="button" :aria-label="t('common.close') || 'Close'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div v-if="currentTab !== 'forgot-password'" class="tabs">
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
              <button type="button" class="eye-btn" @click="showLoginPassword = !showLoginPassword" :aria-label="showLoginPassword ? t('auth.hide_password') || 'Hide password' : t('auth.show_password') || 'Show password'">
                <transition name="eye-anim" mode="out-in">
                  <svg v-if="showLoginPassword" key="open" width="20" height="20" viewBox="0 0 20 20" fill="none" class="eye-svg eye-open-svg" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 10C3.5 5.5 6.5 3.5 10 3.5C13.5 3.5 16.5 5.5 18 10C16.5 14.5 13.5 16.5 10 16.5C6.5 16.5 3.5 14.5 2 10Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="eye-contour" />
                    <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5" class="eye-iris" />
                    <circle cx="10" cy="10" r="1.3" fill="currentColor" class="eye-pupil" />
                  </svg>
                  <svg v-else key="closed" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="eye-svg eye-closed-svg" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.57943 11.571C5.44335 11.0866 4.45814 10.4145 3.65023 9.73485L2.10996 11.2751C1.9883 11.3968 1.82831 11.4585 1.66831 11.4585H1.66742C1.50742 11.4585 1.34743 11.3976 1.22577 11.2751C0.981602 11.031 0.981602 10.6352 1.22577 10.391L2.7285 8.88828C1.75823 7.91822 1.20211 7.09769 1.14624 7.01356C0.954573 6.72606 1.032 6.33853 1.3195 6.14686C1.607 5.9552 1.99453 6.0327 2.1862 6.3202C2.21786 6.36687 5.40118 11.0419 9.99951 11.0419C14.5978 11.0419 17.7812 6.36689 17.8129 6.31939C18.0046 6.03272 18.3929 5.9552 18.6795 6.14686C18.9662 6.33853 19.0437 6.72608 18.8529 7.01275C18.797 7.09684 18.2413 7.9167 17.2718 8.88622L18.7766 10.391C19.0208 10.6352 19.0208 11.031 18.7766 11.2751C18.655 11.3968 18.495 11.4585 18.335 11.4585H18.3341C18.1741 11.4585 18.0141 11.3976 17.8924 11.2751L16.3502 9.73289C15.5425 10.4125 14.5574 11.0847 13.4215 11.5694L14.2868 13.0116C14.4643 13.3074 14.3684 13.6916 14.0726 13.8691C13.9718 13.9291 13.861 13.9583 13.7518 13.9583C13.5393 13.9583 13.3326 13.85 13.2151 13.655L12.2164 11.9904C11.5208 12.1801 10.7803 12.2911 9.99951 12.2911C9.21947 12.2911 8.47965 12.1811 7.78474 11.9917L6.78681 13.655C6.66931 13.85 6.4626 13.9583 6.2501 13.9583C6.14094 13.9583 6.03014 13.9299 5.9293 13.8691C5.63347 13.6916 5.53761 13.3074 5.71511 13.0116L6.57943 11.571Z" />
                  </svg>
                </transition>
              </button>
            </div>
            <span v-if="errors.loginPassword" id="login-password-error" class="inline-error-msg">{{ errors.loginPassword }}</span>
          </div>

          <div class="login-options-row">
            <label class="remember-me-label">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="remember-me-checkbox"
                :aria-label="t('auth.remember_me')"
              />
              <span>{{ t('auth.remember_me') }}</span>
            </label>
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
                    v-for="c in countries"
                    :key="c.code" 
                    :value="c.code"
                  >
                    {{ c.dialCode }} {{ c.flag }} - {{ isRtl ? c.nameAr : c.nameEn }}
                  </option>
                </select>
              </div>

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
              <button type="button" class="eye-btn" @click="showRegisterPassword = !showRegisterPassword" :aria-label="showRegisterPassword ? t('auth.hide_password') || 'Hide password' : t('auth.show_password') || 'Show password'">
                <transition name="eye-anim" mode="out-in">
                  <svg v-if="showRegisterPassword" key="open" width="20" height="20" viewBox="0 0 20 20" fill="none" class="eye-svg eye-open-svg" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 10C3.5 5.5 6.5 3.5 10 3.5C13.5 3.5 16.5 5.5 18 10C16.5 14.5 13.5 16.5 10 16.5C6.5 16.5 3.5 14.5 2 10Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="eye-contour" />
                    <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5" class="eye-iris" />
                    <circle cx="10" cy="10" r="1.3" fill="currentColor" class="eye-pupil" />
                  </svg>
                  <svg v-else key="closed" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="eye-svg eye-closed-svg" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.57943 11.571C5.44335 11.0866 4.45814 10.4145 3.65023 9.73485L2.10996 11.2751C1.9883 11.3968 1.82831 11.4585 1.66831 11.4585H1.66742C1.50742 11.4585 1.34743 11.3976 1.22577 11.2751C0.981602 11.031 0.981602 10.6352 1.22577 10.391L2.7285 8.88828C1.75823 7.91822 1.20211 7.09769 1.14624 7.01356C0.954573 6.72606 1.032 6.33853 1.3195 6.14686C1.607 5.9552 1.99453 6.0327 2.1862 6.3202C2.21786 6.36687 5.40118 11.0419 9.99951 11.0419C14.5978 11.0419 17.7812 6.36689 17.8129 6.31939C18.0046 6.03272 18.3929 5.9552 18.6795 6.14686C18.9662 6.33853 19.0437 6.72608 18.8529 7.01275C18.797 7.09684 18.2413 7.9167 17.2718 8.88622L18.7766 10.391C19.0208 10.6352 19.0208 11.031 18.7766 11.2751C18.655 11.3968 18.495 11.4585 18.335 11.4585H18.3341C18.1741 11.4585 18.0141 11.3976 17.8924 11.2751L16.3502 9.73289C15.5425 10.4125 14.5574 11.0847 13.4215 11.5694L14.2868 13.0116C14.4643 13.3074 14.3684 13.6916 14.0726 13.8691C13.9718 13.9291 13.861 13.9583 13.7518 13.9583C13.5393 13.9583 13.3326 13.85 13.2151 13.655L12.2164 11.9904C11.5208 12.1801 10.7803 12.2911 9.99951 12.2911C9.21947 12.2911 8.47965 12.1811 7.78474 11.9917L6.78681 13.655C6.66931 13.85 6.4626 13.9583 6.2501 13.9583C6.14094 13.9583 6.03014 13.9299 5.9293 13.8691C5.63347 13.6916 5.53761 13.3074 5.71511 13.0116L6.57943 11.571Z" />
                  </svg>
                </transition>
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
          <div class="forgot-password-header">
            <h2>{{ t('auth.forgot_title') }}</h2>
            <p>{{ t('auth.forgot_subtitle') }}</p>
          </div>
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
        </template>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { authActions, authState } from '../store/auth'
import api from '../config/axios'
import { countries, findCountryByCode, validatePhoneByCountry } from '../data/countries'

const { t, locale } = useI18n()
const route = useRoute()
const isRtl = computed(() => locale.value === 'ar')
const currentDir = computed(() => isRtl.value ? 'rtl' : 'ltr')

const emit = defineEmits(['close'])

defineProps({
  logo: String,
  siteName: String
})

const isOpen = ref(false)
const currentTab = ref('login')
const loading = computed(() => authState.loading)
const globalError = ref('')
const globalSuccess = ref('')
const resetSuccess = ref(false)
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const rememberMe = ref(typeof localStorage !== 'undefined' && localStorage.getItem('c_remember') === 'true')

const selectedCountry = ref('JO')

const activeCountryObj = computed(() => {
  return findCountryByCode(selectedCountry.value)
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
  resetSuccess.value = false
  rememberMe.value = typeof localStorage !== 'undefined' && localStorage.getItem('c_remember') === 'true'
  document.body.style.overflow = 'hidden' 
  clearMessages()
}

const closeModal = () => {
  isOpen.value = false
  currentTab.value = 'login'
  resetSuccess.value = false
  document.body.style.overflow = ''
  emit('close')
}

const getPostAuthRedirect = () => {
  const redirect = route.query.redirect
  if (typeof redirect !== 'string' || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return ''
  }
  return redirect
}

const finishAuthentication = () => {
  const redirect = getPostAuthRedirect()
  closeModal()

  if (redirect) {
    window.location.assign(redirect)
    return
  }

  cleanAuthQuery()
  window.location.reload()
}

const cleanAuthQuery = () => {
  if (typeof window === 'undefined') return
  const cleanUrlObject = new URL(window.location.href)
  cleanUrlObject.searchParams.delete('openAuth')
  cleanUrlObject.searchParams.delete('redirect')
  const cleanUrl = cleanUrlObject.pathname + cleanUrlObject.search + cleanUrlObject.hash
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

const logUnexpectedAuthError = (error) => {
  const status = error?.response?.status
  if (![401, 422].includes(status)) console.error(error)
}

const handleForgotPassword = async () => {
  if (!validateForgotPasswordForm()) {
    globalError.value = t('auth.please_fix_errors');
    return;
  }
  clearMessages()
  try {
    await api.post('/frontend/forgot-password', forgotPasswordForm)
    globalSuccess.value = ''
    resetSuccess.value = true
    forgotPasswordForm.email = ''
  } catch (error) {
    logUnexpectedAuthError(error)
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
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('c_remember', String(rememberMe.value))
    }
    const res = await authActions.login(loginForm, { remember: rememberMe.value })
    globalSuccess.value = res.message || t('auth.login_success')
    setTimeout(() => {
      finishAuthentication()
    }, 1000)
  } catch (error) {
    logUnexpectedAuthError(error)
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
      finishAuthentication()
    }, 1000)
  } catch (error) {
    logUnexpectedAuthError(error)
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
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: none;
  z-index: 999999 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
}

.auth-modal-content {
  background: #fff;
  width: 100%;
  max-width: 460px;
  max-height: calc(100vh - 32px);
  border-radius: 8px;
  padding: 20px 22px;
  position: relative;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.18);
  margin: 16px;
  overflow-y: auto;
}

.auth-modal-content.success-modal-shell {
  width: 480px;
  max-width: calc(100vw - 32px);
  height: 287px;
  max-height: calc(100vh - 32px);
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.101961);
}

.reset-success-state {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
}

.checkmark-circle {
  width: 64px;
  height: 64px;
  flex: 0 0 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #10b981;
  border-radius: 24px;
}

.reset-success-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-top: -2px;
}

.reset-success-copy h2 {
  margin: 0;
  color: #000000;
  font-size: 20px;
  line-height: 30px;
  font-weight: 700;
}

.reset-success-copy p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 21px;
}

.reset-success-btn {
  width: 100%;
  height: 48px;
  margin-top: auto;
  border: 0;
  border-radius: 6px;
  background: #000000;
  color: #ffffff;
  font: inherit;
  font-size: 16px;
  line-height: 24px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
}

.reset-success-btn:hover {
  background: #161616;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 15px;
}

.modal-header-text {
  flex: 1;
  text-align: right;
}

.auth-modal-content[dir="ltr"] .modal-header-text {
  text-align: left;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-top: 2px;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.title {
  font-size: 20px;
  line-height: 1.3;
  color: #111827;
  margin: 0 0 4px;
}

.subtitle {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
}

.tabs {
  display: flex;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0;
  padding: 0;
  margin-bottom: 16px;
  direction: rtl;
}

.tab-btn {
  flex: 1;
  padding: 12px 0;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 15px;
  font-weight: 700;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #000000;
  color: #ffffff;
  box-shadow: none;
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

.forgot-password-header {
  margin-bottom: 24px;
  text-align: right;
}

.forgot-password-header h2 {
  margin: 0 0 6px;
  color: #000000;
  font-size: 24px;
  line-height: 36px;
  font-weight: 800;
}

.forgot-password-header p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 21px;
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
  padding: 13px 45px 13px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  outline: none;
  text-align: right;
}

.input-wrapper input:focus,
.country-search-input:focus,
.phone-input-wrapper:focus-within {
  border-color: #000000;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.06);
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
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  transition: color 0.2s, transform 0.15s ease;
  z-index: 2;
}

.eye-btn:hover {
  color: #111827;
}

.eye-btn:active {
  transform: translateY(-50%) scale(0.9);
}

.eye-svg {
  width: 20px;
  height: 20px;
  display: block;
}

/* Eye Opening Animation */
.eye-open-svg {
  transform-origin: 10px 10px;
  animation: eye-open-pop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.eye-open-svg .eye-contour {
  transform-origin: 10px 10px;
  animation: eye-lid-open 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.eye-open-svg .eye-iris,
.eye-open-svg .eye-pupil {
  transform-origin: 10px 10px;
  animation: eye-pupil-reveal 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* Eye Closing Animation */
.eye-closed-svg {
  transform-origin: 10px 10px;
  animation: eye-lid-close 0.28s cubic-bezier(0.34, 1.3, 0.64, 1) forwards;
}

@keyframes eye-open-pop {
  0% {
    transform: scaleY(0.2) scaleX(0.85);
    opacity: 0.3;
  }
  65% {
    transform: scaleY(1.1) scaleX(1.02);
    opacity: 1;
  }
  100% {
    transform: scaleY(1) scaleX(1);
    opacity: 1;
  }
}

@keyframes eye-lid-open {
  0% {
    transform: scaleY(0.15);
  }
  65% {
    transform: scaleY(1.12);
  }
  100% {
    transform: scaleY(1);
  }
}

@keyframes eye-pupil-reveal {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(0.4);
    opacity: 0.5;
  }
  75% {
    transform: scale(1.18);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes eye-lid-close {
  0% {
    transform: scaleY(0.2) translateY(-2px);
    opacity: 0.3;
  }
  60% {
    transform: scaleY(1.12) translateY(1px);
    opacity: 1;
  }
  100% {
    transform: scaleY(1) translateY(0);
    opacity: 1;
  }
}

/* Vue Eye Transition */
.eye-anim-enter-active {
  transition: opacity 0.15s ease-out;
}
.eye-anim-leave-active {
  transition: opacity 0.1s ease-in;
}
.eye-anim-enter-from,
.eye-anim-leave-to {
  opacity: 0;
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

.login-options-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: -4px;
  margin-bottom: 4px;
}

.remember-me-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
}

.remember-me-checkbox {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: #000000;
  cursor: pointer;
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
  padding: 12px 16px;
  min-height: 48px;
  border-radius: 6px;
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

.auth-modal-content[dir="ltr"] .forgot-password-header {
  text-align: left;
}

@media (max-width: 520px) {
  .auth-modal-content.success-modal-shell {
    height: 287px;
    padding: 24px;
  }

  .reset-success-copy p {
    max-width: 280px;
  }
}
</style>
