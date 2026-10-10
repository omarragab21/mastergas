<template>
  <div class="mastergas-terms" :class="{ 'is-en': !isRtl }" :dir="isRtl ? 'rtl' : 'ltr'">
    
    <!-- 1. Hero Banner matching Figma hero-banner -->
    <section class="hero-banner">
      <div class="hero-content">
        <!-- الشروط والأحكام / Terms & Conditions -->
        <h1 class="hero-title">
          {{ isRtl ? 'الشروط والأحكام' : 'Terms & Conditions' }}
        </h1>
        
        <!-- آخر تحديث / Last Updated Subtitle -->
        <p class="hero-subtitle">
          {{ isRtl
            ? 'آخر تحديث: مارس ٢٠٢٦ · يُرجى قراءة الشروط والأحكام التنظيمية بعناية قبل البدء في استخدام المتجر'
            : 'Last updated: March 2026 · Please read these regulatory terms and conditions carefully before using the store'
          }}
        </p>
      </div>
    </section>

    <!-- 2. Legal Content Container -->
    <main class="legal-content-container">
      <article class="legal-sheet">
        
        <!-- attention-alert-banner inside sheet -->
        <div class="attention-alert-banner">
          
          <div class="alert-info-group">
            <!-- alert-icon-wrapper -->
            <div class="alert-icon-wrapper" aria-hidden="true">
              <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg" class="notification-svg">
                <path d="M8.27856 0.374337C8.72367 0.0829559 9.26698 0 9.75 0C10.233 0 10.7763 0.0829559 11.2214 0.374337C11.7152 0.697591 12 1.22083 12 1.875C12 2.33918 11.8588 2.81938 11.6289 3.23431C14.7814 4.03651 17.1622 6.81135 17.3406 10.2016C17.3497 10.3741 17.3564 10.5393 17.3629 10.6985C17.3851 11.24 17.4044 11.7115 17.5025 12.1633C17.6198 12.7031 17.8367 13.1275 18.2779 13.4584C19.0472 14.0354 19.5 14.941 19.5 15.9027C19.5 17.284 18.4128 18.5 16.95 18.5H13.425C13.0775 20.2117 11.5642 21.5 9.75 21.5C7.93578 21.5 6.42247 20.2117 6.07501 18.5H2.55C1.08719 18.5 0 17.284 0 15.9027C0 14.941 0.452782 14.0354 1.22213 13.4584C1.66329 13.1275 1.88025 12.7031 1.99749 12.1633C2.09561 11.7115 2.1149 11.24 2.13705 10.6985C2.14356 10.5394 2.15032 10.3741 2.1594 10.2016C2.33784 6.81135 4.71857 4.03651 7.87108 3.23431C7.64125 2.81938 7.5 2.33918 7.5 1.875C7.5 1.22083 7.78476 0.697591 8.27856 0.374337ZM7.62803 18.5C7.93691 19.3739 8.77034 20 9.75 20C10.7297 20 11.5631 19.3739 11.872 18.5H7.62803ZM16.95 17C17.5236 17 18 16.5177 18 15.9027C18 15.4131 17.7695 14.9521 17.3779 14.6584C16.5718 14.0539 16.2074 13.2676 16.0367 12.4816C15.908 11.8891 15.8825 11.2442 15.8603 10.6842C15.8548 10.5436 15.8494 10.4081 15.8427 10.2804C15.6721 7.03999 12.9949 4.5 9.75 4.5C6.50507 4.5 3.82788 7.03999 3.65733 10.2804C3.65061 10.4082 3.64525 10.5435 3.63968 10.6842C3.61752 11.2442 3.59199 11.8891 3.46332 12.4816C3.29263 13.2676 2.9282 14.0539 2.12213 14.6584C1.73049 14.9521 1.5 15.4131 1.5 15.9027C1.5 16.5177 1.97641 17 2.55 17H16.95ZM10.2087 2.67575C10.0147 2.93683 9.83691 3 9.75 3C9.66309 3 9.48533 2.93683 9.29127 2.67575C9.10279 2.42217 9 2.10726 9 1.875C9 1.77106 9.0204 1.72026 9.03165 1.69888C9.0423 1.67864 9.05979 1.65574 9.10012 1.62934C9.1979 1.56533 9.40459 1.5 9.75 1.5C10.0954 1.5 10.3021 1.56533 10.3999 1.62934C10.4402 1.65574 10.4577 1.67864 10.4684 1.69888C10.4796 1.72026 10.5 1.77106 10.5 1.875C10.5 2.10726 10.3972 2.42217 10.2087 2.67575Z" fill-rule="evenodd" clip-rule="evenodd" fill="#E53333"/>
              </svg>
            </div>

            <!-- alert-text-stack -->
            <div class="alert-text-stack">
              <h2 class="alert-title">
                {{ isRtl ? 'تنبيه قانوني هام' : 'Important Legal Notice' }}
              </h2>
              <p class="alert-desc">
                {{ isRtl
                  ? 'تُعتبر هذه الشروط بمثابة اتفاقية قانونية ملزمة لجميع مستخدمي المنصة والمشترين من متجرنا.'
                  : 'These terms constitute a legally binding agreement for all platform users and buyers in our store.'
                }}
              </p>
            </div>
          </div>

        </div>

        <!-- 9 Legal Sections matching Figma specifications -->
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

          <!-- Divider Line (Rendered between sections 0 to 7, omitted after section 8) -->
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
    ? 'الشروط والأحكام | Mastergas الأجهزة الإيطالية الفاخرة'
    : 'Terms & Conditions | Mastergas Luxury Italian Appliances',
  description: isRtl.value
    ? 'تعرف على الشروط والأحكام التنظيمية لمتجر Mastergas للأجهزة المنزلية الإيطالية الفاخرة في المملكة العربية السعودية.'
    : 'Read the regulatory terms and conditions for Mastergas luxury Italian home appliances in Saudi Arabia.',
  keywords: 'الشروط والأحكام, شروط الاستخدام, ماستر غاز, Mastergas terms and conditions, سياسة المتجر'
});

const sections = [
  {
    id: 1,
    title_ar: '١. مقدمة الشروط والاستخدام',
    title_en: '1. Introduction & Terms of Use',
    text_ar: 'تحكم هذه الوثيقة علاقتكم التعاقدية واستخدامكم لمتجر Mastergas الإلكتروني. يُعد تصفحكم للمتجر أو الشراء منه بمثابة موافقة صريحة وكاملة على جميع البنود والأحكام المدرجة هنا دون قيد أو شرط.',
    text_en: 'This document governs your contractual relationship and use of the Mastergas online store. Browsing or purchasing from the store constitutes your express and full agreement to all terms and conditions set forth herein without reservation.'
  },
  {
    id: 2,
    title_ar: '٢. شروط الاستخدام والأهلية',
    title_en: '2. Eligibility & Terms of Use',
    text_ar: 'يُشترط لاستخدام المتجر وإتمام الطلبات أن تكون مؤهلاً لإبرام العقود القانونية وتتحمل كامل المسؤولية عن دقة وصحة البيانات الشخصية والمالية التي تقوم بإدخالها أثناء عمليات الشراء.',
    text_en: 'To use the store and place orders, you must be legally eligible to enter into binding contracts, and you assume full responsibility for the accuracy and veracity of all personal and financial data entered during purchases.'
  },
  {
    id: 3,
    title_ar: '٣. الحسابات وحماية البيانات',
    title_en: '3. Accounts & Data Security',
    text_ar: 'عند إنشاء حساب جديد على متجرنا، فأنت مسؤول تماماً عن الحفاظ على سرية معلومات الحساب وكلمة المرور الخاصة بك. تقع كامل المسؤولية القانونية عن جميع الأنشطة التي تتم تحت حسابك الشخصي على عاتقك.',
    text_en: 'When creating a new account on our store, you are solely responsible for maintaining the confidentiality of your account credentials and password. Full legal responsibility for all activities performed under your account rests with you.'
  },
  {
    id: 4,
    title_ar: '٤. الطلبات والمعاملات المالية',
    title_en: '4. Orders & Financial Transactions',
    text_ar: 'تخضع جميع طلبات الشراء للتحقق والقبول وتوافر كميات المخزون المطلوبة. نحتفظ بالحق الكامل في تعديل الأسعار، وتحديث المواصفات الفنية أو إلغاء أي طلب في حال وجود خطأ تقني في عرض السعر أو التفاصيل.',
    text_en: 'All purchase orders are subject to verification, acceptance, and stock availability. We reserve full rights to adjust pricing, update technical specifications, or cancel any order in the event of technical errors in displayed prices or details.'
  },
  {
    id: 5,
    title_ar: '٥. سياسة الشحن والتوصيل المتكامل',
    title_en: '5. Comprehensive Shipping & Delivery Policy',
    text_ar: 'نلتزم بشحن وتوصيل الأجهزة الإيطالية الفاخرة لكافة مناطق ومدن المملكة العربية السعودية بالتعاون مع أفضل مزودي الخدمات اللوجستية. نهدف دوماً إلى الالتزام التام بفترات الشحن المتوقعة وتوصيل الأجهزة بشكل آمن تماماً.',
    text_en: 'We are committed to shipping and delivering luxury Italian appliances to all regions and cities across Saudi Arabia in collaboration with premier logistics partners. We strive to adhere strictly to estimated delivery timelines and ensure safe transit.'
  },
  {
    id: 6,
    title_ar: '٦. الإرجاع والاستبدال الشامل',
    title_en: '6. Comprehensive Returns & Exchanges',
    text_ar: 'تخضع خدمات الاسترجاع والاستبدال للشروط المنصوص عليها في لائحة وزارة التجارة بالمملكة العربية السعودية. يُرجى مراجعة صفحة سياسة الاسترجاع الخاصة بالمنتجات للتعرف على الآلية والخطوات المتبعة وشروط استرجاع الأجهزة.',
    text_en: 'Returns and exchanges are governed by the regulations set forth by the Ministry of Commerce in Saudi Arabia. Please review our product returns policy page for details on procedures, timelines, and conditions.'
  },
  {
    id: 7,
    title_ar: '٧. حدود المسؤولية والضمانات',
    title_en: '7. Limitation of Liability & Warranties',
    text_ar: 'لا تضمن شركة إتقان السعودية أي أضرار ناتجة عن سوء الاستخدام أو التركيب الخاطئ للأجهزة من قبل فنيين غير معتمدين من قبلنا. تلتزم الشركة فقط ببنود الضمان الشامل المعتمد والمرفق مع الأجهزة الإيطالية عند الشراء.',
    text_en: 'Itqan Saudi Company does not warrant any damages resulting from misuse or incorrect appliance installation by technicians not authorized by us. The company is bound only by the approved comprehensive warranty terms supplied with appliances upon purchase.'
  },
  {
    id: 8,
    title_ar: '٨. التعديلات والتحديثات',
    title_en: '8. Amendments & Updates',
    text_ar: 'نحتفظ بالحق في تحديث وتعديل شروط الاستخدام هذه في أي وقت بناءً على المتطلبات التنظيمية أو التحديثات التجارية. يُنصح بمراجعة هذه الصفحة بشكل دوري للاطلاع على آخر التغييرات المعتمدة.',
    text_en: 'We reserve the right to update and amend these Terms of Use at any time in response to regulatory requirements or business updates. Users are advised to review this page periodically to stay informed of approved changes.'
  },
  {
    id: 9,
    title_ar: '٩. التواصل والدعم المباشر',
    title_en: '9. Contact & Direct Support',
    text_ar: 'للحصول على مزيد من الإيضاحات أو الدعم بخصوص الشروط والأحكام، يُسعدنا تواصلكم المباشر مع مكتبنا الرئيسي بمدينة الرياض أو التواصل الهاتفي المباشر عبر رقم خدمة العملاء المجاني: 8001240198.',
    text_en: 'For further inquiries or support regarding these terms and conditions, you are welcome to contact our headquarters in Riyadh directly or call our toll-free customer service line: 8001240198.'
  }
];
</script>

<style scoped>
/* ============================================================
   Page Base: mastergas-terms
   ============================================================ */
.mastergas-terms {
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
   Attention Alert Banner inside Legal Sheet
   ============================================================ */
.attention-alert-banner {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20px;
  gap: 16px;
  width: 100%;
  min-height: 86px;
  background: #FFF2F2;
  border: 1px solid #FEE2E2;
  border-radius: 6px;
}

.alert-info-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  width: 100%;
  min-width: 0;
}

/* alert-icon-wrapper */
.alert-icon-wrapper {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #FEE2E2;
  border-radius: 9999px;
  flex-shrink: 0;
}

.notification-svg {
  width: 20px;
  height: 22px;
  display: block;
}

/* alert-text-stack */
.alert-text-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #E53333;
  margin: 0;
}

.alert-desc {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #E53333;
  margin: 0;
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
[dir="rtl"] .alert-title,
[dir="rtl"] .alert-desc {
  text-align: right;
}

[dir="rtl"] .alert-text-stack {
  align-items: flex-start;
}

/* English (LTR) */
[dir="ltr"] .section-heading,
[dir="ltr"] .section-body,
[dir="ltr"] .alert-title,
[dir="ltr"] .alert-desc {
  text-align: left;
}

[dir="ltr"] .alert-text-stack {
  align-items: flex-start;
}

/* ============================================================
   Responsive Media Queries
   ============================================================ */
@media (max-width: 1024px) {
  .mastergas-terms {
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

  .attention-alert-banner {
    padding: 16px;
    gap: 12px;
  }

  .alert-info-group {
    align-items: flex-start;
    gap: 12px;
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
