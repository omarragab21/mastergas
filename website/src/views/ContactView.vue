<template>
  <div class="contact-page" :dir="currentLang === 'ar' ? 'rtl' : 'ltr'">
    <!-- 1. Hero Banner with High Quality Gemini Generated Image -->
    <section class="support-hero-banner">
      <div class="hero-bg" :style="{ backgroundImage: `url('/images/support/hero_banner.jpg')` }"></div>
      <div class="hero-overlay"></div>
      <div class="container hero-container">
        <div class="hero-content">
          <!-- Pre-title with horizontal line -->
          <div class="hero-subheading">
            <span class="subheading-line"></span>
            <span class="subheading-text">{{ currentLang === 'ar' ? 'خدمة العملاء والدعم' : 'Customer Service & Support' }}</span>
          </div>
          <!-- Main Title -->
          <h1 class="hero-title">{{ currentLang === 'ar' ? 'الدعم الفني' : 'Technical Support' }}</h1>
          <!-- Subtitle -->
          <p class="hero-desc">
            {{ currentLang === 'ar' 
              ? 'نحن هنا لمساعدتك في اختيار المنتج المناسب لاحتياجاتك وضمان تشغيله بأعلى كفاءة' 
              : 'We are here to help you choose the right product for your needs and ensure peak operating efficiency' 
            }}
          </p>
        </div>
      </div>
    </section>

    <!-- 2. Main Content: Send Message Form (Right in RTL) + Contact Information (Left in RTL) -->
    <section class="support-main-section">
      <div class="container">
        <div class="support-layout-grid">
          
          <!-- Column 1 (Right in RTL): Send Us a Message Form Card -->
          <div class="contact-form-col">
            <div class="form-box-card">
              <!-- Form Header -->
              <div class="form-box-header">
                <svg class="headset-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                </svg>
                <h3 class="form-box-title">{{ currentLang === 'ar' ? 'أرسل لنا رسالة' : 'Send Us a Message' }}</h3>
              </div>

              <!-- Alert Notifications -->
              <div v-if="successMsg" class="custom-alert success-alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{{ successMsg }}</span>
              </div>

              <div v-if="errorMsg" class="custom-alert error-alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{{ errorMsg }}</span>
              </div>

              <!-- Main Form -->
              <form @submit.prevent="handleSubmit" class="main-contact-form" novalidate>
                <!-- 1. الاسم -->
                <div class="form-group-item">
                  <label class="item-label">{{ currentLang === 'ar' ? 'الاسم' : 'Name' }}</label>
                  <input 
                    type="text" 
                    v-model="form.name" 
                    :placeholder="currentLang === 'ar' ? 'الاسم الكامل' : 'Full Name'" 
                    class="item-input"
                    :class="{ 'has-error': errors.name }"
                    autocomplete="name"
                    required
                  />
                  <span v-if="errors.name" class="inline-err-text">{{ errors.name }}</span>
                </div>

                <!-- 2. البريد الإلكتروني -->
                <div class="form-group-item">
                  <label class="item-label">{{ currentLang === 'ar' ? 'البريد الإلكتروني' : 'Email Address' }}</label>
                  <input 
                    type="email" 
                    v-model="form.email" 
                    placeholder="example@domain.com" 
                    class="item-input input-ltr"
                    :class="{ 'has-error': errors.email }"
                    autocomplete="email"
                    required
                  />
                  <span v-if="errors.email" class="inline-err-text">{{ errors.email }}</span>
                </div>

                <!-- 3. رقم الهاتف -->
                <div class="form-group-item">
                  <label class="item-label">{{ currentLang === 'ar' ? 'رقم الهاتف' : 'Phone Number' }}</label>
                  <input 
                    type="tel" 
                    v-model="form.phone" 
                    placeholder="050XXXXXXX" 
                    class="item-input input-ltr"
                    :class="{ 'has-error': errors.phone }"
                    autocomplete="tel"
                    required
                  />
                  <span v-if="errors.phone" class="inline-err-text">{{ errors.phone }}</span>
                </div>

                <!-- 4. نوع الدعم -->
                <div class="form-group-item">
                  <label class="item-label">{{ currentLang === 'ar' ? 'نوع الدعم' : 'Support Type' }}</label>
                  <div class="select-container">
                    <select v-model="form.subject" class="item-select" required>
                      <option value="استفسار عن منتج">{{ currentLang === 'ar' ? 'استفسار عن منتج' : 'Product Inquiry' }}</option>
                      <option value="طلب صيانة وتركيب">{{ currentLang === 'ar' ? 'طلب صيانة وتركيب' : 'Maintenance & Installation' }}</option>
                      <option value="استفسار عن طلب أو شحنة">{{ currentLang === 'ar' ? 'استفسار عن طلب أو شحنة' : 'Order or Shipment Inquiry' }}</option>
                      <option value="شكوى أو اقتراح">{{ currentLang === 'ar' ? 'شكوى أو اقتراح' : 'Complaint or Suggestion' }}</option>
                      <option value="أخرى">{{ currentLang === 'ar' ? 'أخرى' : 'Other' }}</option>
                    </select>
                    <svg class="select-arrow-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>

                <!-- 5. الرسالة -->
                <div class="form-group-item">
                  <label class="item-label">{{ currentLang === 'ar' ? 'الرسالة' : 'Message' }}</label>
                  <textarea 
                    v-model="form.message" 
                    rows="4" 
                    :placeholder="currentLang === 'ar' ? 'اكتب رسالتك أو استفسارك بالتفصيل هنا...' : 'Write your detailed message or inquiry here...'" 
                    class="item-textarea"
                    :class="{ 'has-error': errors.message }"
                    required
                  ></textarea>
                  <span v-if="errors.message" class="inline-err-text">{{ errors.message }}</span>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="submit-action-btn" :disabled="isSubmitting || cooldownRemaining > 0">
                  <span v-if="isSubmitting" class="btn-spinner"></span>
                  <span>{{ submitButtonLabel }}</span>
                </button>
              </form>
            </div>
          </div>

          <!-- Column 2 (Left in RTL): Direct Contact Information -->
          <div class="contact-info-col">
            <div class="info-header">
              <div class="info-title-row">
                <svg class="info-circle-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <h2 class="info-main-title">{{ currentLang === 'ar' ? 'معلومات الاتصال المباشر' : 'Direct Contact Information' }}</h2>
              </div>
              <p class="info-intro-text">
                {{ currentLang === 'ar' 
                  ? 'تواصل معنا مباشرة عبر أي من قنوات الاتصال المتاحة. فريق الدعم متاح لخدمتكم والإجابة على استفساراتكم على مدار الساعة.' 
                  : 'Contact us directly through any of the available channels. Our support team is available around the clock to assist you.' 
                }}
              </p>
            </div>

            <!-- Contact Cards Stack -->
            <div class="contact-cards-stack">
              <!-- Card 1: الرقم المجاني الموحد -->
              <a href="tel:8001240198" class="contact-detail-card">
                <div class="detail-text-wrap">
                  <span class="detail-label">{{ currentLang === 'ar' ? 'الرقم المجاني الموحد' : 'Toll-Free Number' }}</span>
                  <span class="detail-val font-num">8001240198</span>
                </div>
                <div class="detail-icon-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
              </a>

              <!-- Card 2: الدعم عبر البريد الإلكتروني -->
              <div class="contact-detail-card">
                <div class="detail-text-wrap">
                  <span class="detail-label">{{ currentLang === 'ar' ? 'الدعم عبر البريد الإلكتروني' : 'Email Support' }}</span>
                  <a href="mailto:info@mastergas.com.sa" class="detail-val-link">info@mastergas.com.sa</a>
                  <a href="mailto:info@saudietqaan.com.sa" class="detail-val-link">info@saudietqaan.com.sa</a>
                </div>
                <div class="detail-icon-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
              </div>

              <!-- Card 3: الموقع والمكتب الرئيسي -->
              <div class="contact-detail-card">
                <div class="detail-text-wrap">
                  <span class="detail-label">{{ currentLang === 'ar' ? 'الموقع والمكتب الرئيسي' : 'Location & Headquarters' }}</span>
                  <span class="detail-val">{{ currentLang === 'ar' ? 'المملكة العربية السعودية - الرياض' : 'Saudi Arabia - Riyadh' }}</span>
                  <span class="detail-sub">{{ currentLang === 'ar' ? 'مجمع صالات العرض لشركة إتقان السعودية' : 'Itqan Saudi Showroom Complex' }}</span>
                </div>
                <div class="detail-icon-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue';
import api from '../../config/axios';
import { useLocalized } from '../../composables/useLocalized';
import { useSEO } from '../../composables/useSEO';
import { escapeHtml } from '../../utils/sanitize';

const { currentLang } = useLocalized();

useSEO({
  title: 'الدعم الفني وخدمة العملاء - متجر ماسترجاز Mastergas',
  description: 'فريق الدعم الفني في ماسترجاز متاح لمساعدتكم في اختيار وتشغيل وصيانة أفران الغاز والمسطحات الإيطالية بأعلى كفاءة. تواصل معنا مباشرة.',
  keywords: 'دعم فني ماسترجاز, صيانة أفران غاز, رقم ماسترجاز, خدمة عملاء ماسترجاز'
});

const form = reactive({
  name: '',
  email: '',
  phone: '',
  subject: 'استفسار عن منتج',
  message: ''
});

const errors = reactive({
  name: '',
  email: '',
  phone: '',
  message: ''
});

const isSubmitting = ref(false);
const successMsg = ref('');
const errorMsg = ref('');
const cooldownRemaining = ref(0);
let cooldownTimer = null;

const submitButtonLabel = computed(() => {
  if (isSubmitting.value) {
    return currentLang.value === 'ar' ? 'جاري الإرسال...' : 'Sending...';
  }
  if (cooldownRemaining.value > 0) {
    return currentLang.value === 'ar' 
      ? `إرسال الرسالة (${cooldownRemaining.value} ث)` 
      : `Send Message (${cooldownRemaining.value}s)`;
  }
  return currentLang.value === 'ar' ? 'إرسال الرسالة' : 'Send Message';
});

const sanitize = (val) => escapeHtml(String(val ?? '').trim());

const validateForm = () => {
  errors.name = '';
  errors.email = '';
  errors.phone = '';
  errors.message = '';
  let valid = true;

  if (!form.name.trim()) {
    errors.name = currentLang.value === 'ar' ? 'الاسم مطلوب' : 'Name is required';
    valid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email.trim()) {
    errors.email = currentLang.value === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    valid = false;
  } else if (!emailRegex.test(form.email.trim())) {
    errors.email = currentLang.value === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format';
    valid = false;
  }

  if (!form.phone.trim()) {
    errors.phone = currentLang.value === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    valid = false;
  } else if (form.phone.trim().length < 8) {
    errors.phone = currentLang.value === 'ar' ? 'رقم الهاتف غير صحيح' : 'Invalid phone number';
    valid = false;
  }

  if (!form.message.trim()) {
    errors.message = currentLang.value === 'ar' ? 'الرسالة مطلوبة' : 'Message is required';
    valid = false;
  }

  return valid;
};

const startCooldown = (seconds = 30) => {
  cooldownRemaining.value = seconds;
  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    cooldownRemaining.value = Math.max(0, cooldownRemaining.value - 1);
    if (cooldownRemaining.value === 0) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  }, 1000);
};

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer);
});

const handleSubmit = async () => {
  successMsg.value = '';
  errorMsg.value = '';

  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = {
      name: sanitize(form.name),
      email: sanitize(form.email).toLowerCase(),
      phone: sanitize(form.phone),
      subject: sanitize(form.subject) || 'استفسار عن منتج',
      message: sanitize(form.message)
    };

    await api.post('/frontend/contact', payload);

    successMsg.value = currentLang.value === 'ar'
      ? 'تم استلام رسالتك بنجاح! سيتواصل معك فريق الدعم الفني في أقرب وقت.'
      : 'Your message has been received! Our support team will contact you shortly.';

    // Reset Form
    form.name = '';
    form.email = '';
    form.phone = '';
    form.subject = 'استفسار عن منتج';
    form.message = '';

    startCooldown(30);
  } catch (err) {
    console.error('Contact submission error', err);
    errorMsg.value = err.response?.data?.message || (
      currentLang.value === 'ar'
        ? 'حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى لاحقاً.'
        : 'An error occurred while sending your message. Please try again later.'
    );
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.contact-page {
  background-color: #ffffff;
  min-height: 100vh;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  color: #111827;
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 1. Hero Banner Section */
.support-hero-banner {
  position: relative;
  width: 100%;
  height: 480px;
  overflow: hidden;
  display: flex;
  align-items: center;
  margin-top: 90px;
  background-color: #0b0f19;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center 30%;
  filter: brightness(0.9);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(270deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.65) 45%, rgba(0, 0, 0, 0.2) 100%);
}

.hero-container {
  position: relative;
  z-index: 2;
  width: 100%;
}

.hero-content {
  max-width: 680px;
}

.hero-subheading {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.subheading-line {
  width: 38px;
  height: 1.5px;
  background-color: #ffffff;
  opacity: 0.9;
}

.subheading-text {
  font-size: 13.5px;
  font-weight: 500;
  color: #ffffff;
  letter-spacing: 0.2px;
}

.hero-title {
  font-size: 44px;
  font-weight: 800;
  color: #ffffff;
  margin: 4px 0 10px 0;
  letter-spacing: -0.5px;
  line-height: 1.15;
}

.hero-desc {
  font-size: 15px;
  color: #e2e8f0;
  font-weight: 400;
  line-height: 1.6;
  margin: 0;
  opacity: 0.95;
}

/* 2. Main Section */
.support-main-section {
  padding: 60px 0 100px;
  background: #ffffff;
}

.support-layout-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 36px;
  align-items: start;
}

/* Right Column: Contact Information */
.contact-info-col {
  display: flex;
  flex-direction: column;
}

.info-header {
  margin-bottom: 24px;
}

.info-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.info-circle-svg {
  stroke: #111827;
  flex-shrink: 0;
}

.info-main-title {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

.info-intro-text {
  font-size: 13px;
  color: #64748b;
  line-height: 1.65;
  margin: 0;
}

/* Stack of Cards */
.contact-cards-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-detail-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 20px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.contact-detail-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.detail-text-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.detail-label {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}

.detail-val {
  font-size: 17px;
  font-weight: 800;
  color: #111827;
}

.detail-val.font-num {
  font-size: 18px;
  letter-spacing: 0.5px;
}

.detail-val-link {
  font-size: 13.5px;
  font-weight: 700;
  color: #111827;
  text-decoration: none;
  direction: ltr;
  text-align: right;
  transition: color 0.15s;
}

.detail-val-link:hover {
  color: #2563eb;
}

.detail-sub {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 1px;
}

.detail-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #334155;
  transition: background 0.2s ease;
}

.contact-detail-card:hover .detail-icon-wrap {
  background: #f1f5f9;
  color: #000000;
}

/* Left Column: Form Box Card */
.contact-form-col {
  width: 100%;
}

.form-box-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 34px 38px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
}

.form-box-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.headset-svg {
  stroke: #111827;
  flex-shrink: 0;
}

.form-box-title {
  font-size: 21px;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

/* Alerts */
.custom-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 500;
  margin-bottom: 20px;
}

.success-alert {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.error-alert {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* Form Fields */
.main-contact-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-label {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}

.item-input {
  height: 46px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 16px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 13.5px;
  color: #111827;
  background: #ffffff;
  transition: all 0.2s ease;
  outline: none;
}

.item-input:focus {
  border-color: #000000;
}

.item-input.has-error,
.item-textarea.has-error {
  border-color: #ef4444;
  background-color: #fffaf0;
}

.input-ltr {
  direction: ltr;
  text-align: right;
}

[dir="ltr"] .input-ltr {
  text-align: left;
}

/* Select Container */
.select-container {
  position: relative;
  width: 100%;
}

.item-select {
  width: 100%;
  height: 46px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 16px;
  padding-inline-start: 36px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  color: #111827;
  background: #ffffff;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.item-select:focus {
  border-color: #000000;
}

.select-arrow-svg {
  position: absolute;
  inset-inline-start: 14px;
  top: 50%;
  transform: translateY(-50%);
  stroke: #64748b;
  pointer-events: none;
}

/* Textarea */
.item-textarea {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 13.5px;
  color: #111827;
  background: #ffffff;
  outline: none;
  resize: vertical;
  min-height: 110px;
  line-height: 1.6;
  transition: border-color 0.2s ease;
}

.item-textarea:focus {
  border-color: #000000;
}

.inline-err-text {
  font-size: 11.5px;
  color: #ef4444;
  font-weight: 500;
}

/* Submit Button */
.submit-action-btn {
  width: 100%;
  height: 48px;
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 6px;
}

.submit-action-btn:hover:not(:disabled) {
  background: #1f2937;
  transform: translateY(-1px);
}

.submit-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .support-hero-banner {
    height: 360px;
    margin-top: 20px;
  }
  .hero-title {
    font-size: 34px;
  }
  .support-layout-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .form-box-card {
    padding: 24px 20px;
  }
}
</style>
