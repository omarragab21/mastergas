<template>
  <div class="mastergas-privacy-policy" :class="{ 'is-en': !isRtl }" :dir="isRtl ? 'rtl' : 'ltr'">
    
    <!-- 1. Hero Banner matching Figma hero-banner -->
    <section class="hero-banner">
      <div class="hero-content">
        <!-- سياسة الخصوصية / Privacy Policy -->
        <h1 class="hero-title">
          {{ isRtl ? 'سياسة الخصوصية' : 'Privacy Policy' }}
        </h1>
        
        <!-- آخر تحديث / Last Updated -->
        <p class="hero-subtitle">
          {{ isRtl
            ? 'آخر تحديث: مارس ٢٠٢٦ · نلتزم بحماية خصوصيتك وضمان تجربة تسوق آمنة وموثوقة'
            : 'Last updated: March 2026 · Committed to protecting your privacy and ensuring a secure shopping experience'
          }}
        </p>
      </div>
    </section>

    <!-- 2. Legal Content Container -->
    <main class="legal-content-container">
      <article class="legal-sheet">
        
        <!-- Cookie Notice Banner inside sheet -->
        <div class="cookie-notice-banner" @click="handleCookieBannerClick">
          
          <!-- In RTL: Toggle controls on the left, Content on the right -->
          <!-- In LTR: Content on the left, Toggle controls on the right -->
          
          <div class="cookie-info-group">
            <!-- cookie-icon-wrapper -->
            <div class="cookie-icon-wrapper" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="cookie-svg">
                <path d="M12.0078 12C12.0078 12.5523 11.5601 13 11.0078 13H10.9988C10.4465 13 9.99883 12.5523 9.99883 12C9.99883 11.4477 10.4465 11 10.9988 11H11.0078C11.5601 11 12.0078 11.4477 12.0078 12Z" fill="#0284C7"/>
                <path d="M6.00781 11C6.5601 11 7.00781 10.5523 7.00781 10C7.00781 9.44772 6.5601 9 6.00781 9H5.99883C5.44655 9 4.99883 9.44771 4.99883 10C4.99883 10.5523 5.44655 11 5.99883 11H6.00781Z" fill="#0284C7"/>
                <path d="M13.0078 18C13.0078 18.5523 12.5601 19 12.0078 19H11.9988C11.4465 19 10.9988 18.5523 10.9988 18C10.9988 17.4477 11.4465 17 11.9988 17H12.0078C12.5601 17 13.0078 17.4477 13.0078 18Z" fill="#0284C7"/>
                <path d="M10.5303 6.53033C10.8232 6.23744 10.8232 5.76256 10.5303 5.46967C10.2374 5.17678 9.76256 5.17678 9.46967 5.46967L8.46967 6.46967C8.17678 6.76256 8.17678 7.23744 8.46967 7.53033C8.76256 7.82322 9.23744 7.82322 9.53033 7.53033L10.5303 6.53033Z" fill="#0284C7"/>
                <path d="M17.5303 13.4697C17.8232 13.7626 17.8232 14.2374 17.5303 14.5303L16.5303 15.5303C16.2374 15.8232 15.7626 15.8232 15.4697 15.5303C15.1768 15.2374 15.1768 14.7626 15.4697 14.4697L16.4697 13.4697C16.7626 13.1768 17.2374 13.1768 17.5303 13.4697Z" fill="#0284C7"/>
                <path d="M6.46967 15.5303C6.17678 15.2374 6.17678 14.7626 6.46967 14.4697C6.76256 14.1768 7.23744 14.1768 7.53033 14.4697L8.53033 15.4697C8.82322 15.7626 8.82322 16.2374 8.53033 16.5303C8.23744 16.8232 7.76256 16.8232 7.46967 16.5303L6.46967 15.5303Z" fill="#0284C7"/>
                <path d="M1.25 11.9948C1.25 5.5515 7.11552 0.654539 13.2648 1.3088C13.8307 1.36902 14.521 1.52056 14.8066 2.19161C14.9258 2.47191 14.9317 2.76118 14.9209 2.98365C14.9112 3.18446 14.8814 3.41445 14.8524 3.63868L14.8417 3.72158C14.7392 4.51981 15.0212 5.25479 15.4683 5.60253C15.5662 5.67876 15.6837 5.7718 15.7806 5.87294C15.8843 5.98108 16.0146 6.1486 16.0691 6.38711C16.1232 6.62356 16.0797 6.8293 16.0367 6.96751C15.9961 7.09792 15.9346 7.23215 15.8832 7.34244C15.7363 7.65819 15.7848 8.06348 16.0648 8.44723C16.3455 8.8319 16.7964 9.0967 17.2663 9.11624C17.4339 9.12321 17.6136 9.13132 17.7723 9.15598C17.9389 9.18185 18.1468 9.23436 18.3448 9.37199C18.548 9.51314 18.6715 9.69525 18.7548 9.86022C18.8324 10.014 18.8929 10.1903 18.9469 10.3573C19.1659 11.0345 19.7623 11.4865 20.4395 11.6051C20.5486 11.6243 20.6696 11.6437 20.7904 11.6631C20.9695 11.6918 21.1483 11.7205 21.2881 11.7481C21.5353 11.797 21.8434 11.8725 22.1101 12.0445C22.4204 12.2445 22.6273 12.5417 22.7091 12.9208C22.7812 13.2553 22.7496 13.6232 22.6785 13.9982C21.7343 18.9835 17.3368 22.75 12.0579 22.75C6.09259 22.75 1.25 17.9385 1.25 11.9948ZM13.1061 2.80038C7.79762 2.23558 2.75 6.48779 2.75 11.9948C2.75 17.1026 6.91358 21.25 12.0579 21.25C16.6082 21.25 20.3932 18.0039 21.2047 13.7191C21.2489 13.4858 21.2531 13.3526 21.2486 13.2838L21.2388 13.2804L21.2245 13.2755C21.1711 13.258 21.0985 13.2397 20.997 13.2196C20.8699 13.1945 20.7485 13.1753 20.604 13.1524C20.4843 13.1335 20.3486 13.1121 20.1807 13.0826C19.0369 12.8823 17.9337 12.0991 17.5197 10.8189C17.4925 10.7349 17.4713 10.6736 17.4545 10.6285C17.3963 10.6238 17.3172 10.6197 17.204 10.6149C16.2248 10.5742 15.3707 10.0407 14.8531 9.3314C14.3428 8.63199 14.0994 7.66677 14.504 6.75214C13.5685 5.99417 13.2043 4.69567 13.3539 3.53059L13.3635 3.45615C13.3947 3.21369 13.4161 3.04769 13.4227 2.91099C13.4238 2.88887 13.4243 2.86963 13.4244 2.85302C13.3606 2.8363 13.2599 2.81674 13.1061 2.80038Z" fill-rule="evenodd" clip-rule="evenodd" fill="#0284C7"/>
              </svg>
            </div>

            <!-- cookie-text-stack -->
            <div class="cookie-text-stack">
              <h2 class="cookie-notice-title">
                {{ isRtl ? 'ملفات تعريف الارتباط وتفضيلات التتبع' : 'Cookies & Tracking Preferences' }}
              </h2>
              <p class="cookie-notice-desc">
                {{ isRtl
                  ? 'نستخدم ملفات تعريف الارتباط لتحسين أداء التصفح وتقديم تجربة شخصية تليق باختياراتك.'
                  : 'We use cookies to enhance browsing performance and deliver a personalized experience tailored to your choices.'
                }}
              </p>
            </div>
          </div>

          <!-- toggle-controls -->
          <div class="toggle-controls">
            <span class="toggle-status-text">
              {{ isRtl ? 'مُفعّل' : 'Enabled' }}
            </span>
            <div class="toggle-pill active" role="switch" aria-checked="true" :title="isRtl ? 'إدارة التفضيلات' : 'Manage Preferences'">
              <span class="toggle-thumb"></span>
            </div>
          </div>

        </div>

        <!-- 7 Legal Sections matching Figma specifications -->
        <section
          v-for="(section, idx) in sections"
          :key="section.id"
          class="legal-section"
          :class="`legal-section-${idx}`"
        >
          <!-- heading-row -->
          <div class="heading-row">
            <h3 class="section-heading">
              {{ isRtl ? section.title_ar : section.title_en }}
            </h3>
          </div>

          <!-- Section Body Text -->
          <p class="section-body">
            {{ isRtl ? section.text_ar : section.text_en }}
          </p>

          <!-- Divider Line (Rendered between sections 0 to 5, omitted after section 6) -->
          <div v-if="idx < sections.length - 1" class="section-divider-line"></div>
        </section>

      </article>
    </main>

  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useLocalized } from '../../composables/useLocalized';
import { useSEO } from '../../composables/useSEO';

const { currentLang } = useLocalized();
const isRtl = computed(() => currentLang.value === 'ar');

// Dynamic SEO tags
useSEO({
  title: isRtl.value
    ? 'سياسة الخصوصية | Mastergas الأجهزة الإيطالية الفاخرة'
    : 'Privacy Policy | Mastergas Luxury Italian Appliances',
  description: isRtl.value
    ? 'تعرف على سياسة الخصوصية وحماية البيانات الشخصية في متجر Mastergas للأجهزة المنزلية الإيطالية الفاخرة في المملكة العربية السعودية.'
    : 'Learn about the privacy policy and personal data protection at Mastergas luxury Italian home appliances in Saudi Arabia.',
  keywords: 'سياسة الخصوصية, حماية البيانات, ماستر غاز, Mastergas privacy policy, شروط الاستخدام'
});

const handleCookieBannerClick = () => {
  if (typeof window !== 'undefined' && typeof window.openCookiePreferences === 'function') {
    window.openCookiePreferences();
  }
};

const sections = [
  {
    id: 1,
    title_ar: '١. مقدمة',
    title_en: '1. Introduction',
    text_ar: 'أهلاً بكم في متجر Mastergas. نحن نولي اهتماماً فائقاً لحماية سرية وأمن بياناتكم الشخصية. توضح وثيقة سياسة الخصوصية هذه كيفية جمع واستخدام وحماية البيانات والمعلومات الشخصية التي تقدمونها عند زيارة موقعنا الإلكتروني أو الشراء منه.',
    text_en: 'Welcome to Mastergas store. We place the utmost importance on protecting the confidentiality and security of your personal data. This Privacy Policy document explains how we collect, use, and protect the personal data and information you provide when visiting or purchasing from our website.'
  },
  {
    id: 2,
    title_ar: '٢. جمع المعلومات الشخصية',
    title_en: '2. Collection of Personal Information',
    text_ar: 'نقوم بجمع بعض المعلومات الضرورية لإتمام عمليات الشراء وتقديم تجربة تسوق أفضل. تشمل هذه المعلومات الاسم بالكامل، عنوان البريد الإلكتروني، رقم الهاتف، عنوان التوصيل، بالإضافة إلى تفاصيل الدفع المشفرة التي تضمن حمايتها بشكل كامل.',
    text_en: 'We collect essential information required to fulfill purchase transactions and deliver a superior shopping experience. This includes full name, email address, phone number, delivery address, and encrypted payment details to ensure comprehensive protection.'
  },
  {
    id: 3,
    title_ar: '٣. استخدام المعلومات',
    title_en: '3. Use of Information',
    text_ar: 'نستخدم البيانات المجمعة لأغراض أساسية تشمل: معالجة وتنفيذ طلبات الشراء، تحديثكم بحالة الشحنات، تقديم الدعم الفني وخدمات ما بعد البيع، بالإضافة إلى إرسال العروض والتحديثات الحصرية بناءً على تفضيلاتكم الشخصية.',
    text_en: 'We use collected data for primary purposes including: processing and fulfilling orders, updating you on shipment status, providing technical support and after-sales service, and delivering exclusive offers and updates tailored to your personal preferences.'
  },
  {
    id: 4,
    title_ar: '٤. مشاركة المعلومات',
    title_en: '4. Sharing of Information',
    text_ar: 'تلتزم شركة إتقان السعودية (Mastergas) بعدم بيع أو تأجير أو مشاركة بياناتكم الشخصية مع أي طرف ثالث لأغراض تسويقية. يتم مشاركة البيانات فقط مع شركاء العمل المعتمدين لتنفيذ الطلبات، مثل شركات الشحن والتوصيل وبوابات الدفع الإلكتروني المعتمدة.',
    text_en: 'Itqan Saudi Company (Mastergas) is committed not to sell, rent, or share your personal data with any third party for marketing purposes. Data is only shared with authorized partners to fulfill orders, such as shipping carriers and certified electronic payment gateways.'
  },
  {
    id: 5,
    title_ar: '٥. أمان المعلومات والملفات',
    title_en: '5. Security of Information & Files',
    text_ar: 'نحن نطبق أعلى المعايير الهندسية والأمنية الإلكترونية لحماية معلوماتكم من الوصول غير المصرح به أو التعديل أو الإفشاء. يتم حماية تفاصيل الدفع والمعاملات المالية باستخدام بروتوكولات التشفير العالمية الأكثر أماناً وقوة.',
    text_en: 'We implement the highest engineering and cybersecurity standards to safeguard your information against unauthorized access, alteration, or disclosure. Payment details and financial transactions are protected using world-class, rigorous encryption protocols.'
  },
  {
    id: 6,
    title_ar: '٦. حقوق المستخدم',
    title_en: '6. User Rights',
    text_ar: 'بصفتكم عميلاً مسجلاً، لديكم كامل الحق في الوصول إلى بياناتكم الشخصية المسجلة لدينا، أو تعديلها، أو تحديثها في أي وقت من خلال لوحة التحكم الخاصة بحسابكم. كما يمكنك طلب حذف الحساب أو إلغاء الاشتراك في القوائم البريدية المخصصة للعروض.',
    text_en: 'As a registered customer, you have full rights to access, modify, or update your registered personal data at any time through your account dashboard. You may also request account deletion or unsubscribe from promotional mailing lists.'
  },
  {
    id: 7,
    title_ar: '٧. التواصل معنا',
    title_en: '7. Contact Us',
    text_ar: 'إذا كانت لديكم أي استفسارات أو ملاحظات بخصوص سياسة الخصوصية الخاصة بنا، يمكنكم التواصل مع فريق الدعم الفني المخصص عبر البريد الإلكتروني الموحد: info@mastergas.com.sa أو من خلال الرقم المجاني الموحد لخدمة العملاء: 8001240198.',
    text_en: 'If you have any questions or feedback regarding our privacy policy, you can contact our dedicated support team via unified email: info@mastergas.com.sa or via the toll-free customer service number: 8001240198.'
  }
];
</script>

<style scoped>
/* ============================================================
   Page Base: mastergas-privacy-policy
   ============================================================ */
.mastergas-privacy-policy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  position: relative;
  width: 100%;
  min-height: 100vh;
  background-color: #F8FAFC;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  box-sizing: border-box;
  margin-top: 120px; /* Offset for 40px announcement bar + 80px navbar */
}

/* ============================================================
   1. Hero Banner
   ============================================================ */
.hero-banner {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 64px 24px;
  width: 100%;
  min-height: 240px;
  
  /* Photorealistic luxury kitchen background with dark overlay */
  background: 
    linear-gradient(0deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
    url('/images/about/hero_banner.jpg') center / cover no-repeat;
  background-color: #0F172A;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0px;
  gap: 16px;
  width: 100%;
  max-width: 800px;
  text-align: center;
}

.hero-title {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 48px;
  line-height: 72px;
  text-align: center;
  color: #FFFFFF;
  margin: 0;
  letter-spacing: -0.5px;
}

.hero-subtitle {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  text-align: center;
  color: #FFFFFF;
  opacity: 0.8;
  margin: 0;
}

/* ============================================================
   2. Legal Content Container
   ============================================================ */
.legal-content-container {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 64px;
  width: 100%;
  background-color: #F8FAFC;
}

/* legal-sheet card */
.legal-sheet {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 48px;
  gap: 40px;
  width: 100%;
  max-width: 960px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.0196078);
  border-radius: 8px;
}

/* ============================================================
   Cookie Notice Banner inside Legal Sheet
   ============================================================ */
.cookie-notice-banner {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  gap: 16px;
  width: 100%;
  min-height: 86px;
  background: #F0F9FF;
  border: 1px solid #F0F9FF;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cookie-notice-banner:hover {
  background: #E0F2FE;
  border-color: #BAE6FD;
}

.cookie-info-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

/* cookie-icon-wrapper */
.cookie-icon-wrapper {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #F0F9FF;
  border-radius: 9999px;
  flex-shrink: 0;
}

.cookie-svg {
  width: 24px;
  height: 24px;
  display: block;
}

/* cookie-text-stack */
.cookie-text-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.cookie-notice-title {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #0284C7;
  margin: 0;
}

.cookie-notice-desc {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #0284C7;
  margin: 0;
}

/* toggle-controls */
.toggle-controls {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  height: 24px;
  flex-shrink: 0;
}

.toggle-status-text {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  color: #0284C7;
  user-select: none;
}

/* Pill Toggle Switch */
.toggle-pill {
  box-sizing: border-box;
  position: relative;
  width: 44px;
  height: 24px;
  background: #0284C7;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  transition: background-color 0.2s ease;
}

.toggle-thumb {
  display: block;
  width: 20px;
  height: 20px;
  background: #FFFFFF;
  border-radius: 9999px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translateX(0);
}

/* When in RTL mode, the thumb shifts in RTL space */
[dir="rtl"] .toggle-pill.active .toggle-thumb {
  transform: translateX(-20px);
}

[dir="ltr"] .toggle-pill.active .toggle-thumb {
  transform: translateX(20px);
}

/* ============================================================
   3. Legal Sections
   ============================================================ */
.legal-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 16px;
  width: 100%;
}

.heading-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  width: 100%;
  min-height: 36px;
}

.section-heading {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 36px;
  color: #000000;
  margin: 0;
  width: 100%;
}

.section-body {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #64748B;
  margin: 0;
  width: 100%;
}

.section-divider-line {
  box-sizing: border-box;
  width: 100%;
  height: 1px;
  background-color: #E2E8F0;
  border: none;
  margin-top: 24px;
}

/* ============================================================
   Direction & Alignment: Arabic vs English
   ============================================================ */
/* Arabic (RTL) */
[dir="rtl"] .section-heading,
[dir="rtl"] .section-body,
[dir="rtl"] .cookie-notice-title,
[dir="rtl"] .cookie-notice-desc {
  text-align: right;
}

[dir="rtl"] .cookie-text-stack {
  align-items: flex-start;
}

/* English (LTR) */
[dir="ltr"] .section-heading,
[dir="ltr"] .section-body,
[dir="ltr"] .cookie-notice-title,
[dir="ltr"] .cookie-notice-desc {
  text-align: left;
}

[dir="ltr"] .cookie-text-stack {
  align-items: flex-start;
}

/* ============================================================
   Responsive Media Queries
   ============================================================ */
@media (max-width: 1024px) {
  .mastergas-privacy-policy {
    margin-top: 0px;
  }

  .legal-content-container {
    padding: 48px 24px;
  }

  .legal-sheet {
    padding: 32px 24px;
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .hero-banner {
    padding: 48px 16px;
    min-height: 200px;
  }

  .hero-title {
    font-size: 32px;
    line-height: 48px;
  }

  .hero-subtitle {
    font-size: 14px;
    line-height: 22px;
  }

  .legal-content-container {
    padding: 24px 16px;
  }

  .legal-sheet {
    padding: 24px 16px;
    gap: 28px;
    border-radius: 8px;
  }

  .cookie-notice-banner {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    gap: 16px;
  }

  .cookie-info-group {
    width: 100%;
    align-items: flex-start;
  }

  .toggle-controls {
    width: 100%;
    justify-content: space-between;
    padding-top: 8px;
    border-top: 1px dashed rgba(2, 132, 199, 0.2);
  }

  .section-heading {
    font-size: 20px;
    line-height: 30px;
  }

  .section-body {
    font-size: 14.5px;
    line-height: 23px;
  }

  .section-divider-line {
    margin-top: 16px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 28px;
    line-height: 42px;
  }

  .legal-content-container {
    padding: 16px 12px;
  }

  .legal-sheet {
    padding: 20px 14px;
    gap: 24px;
  }
}
</style>
