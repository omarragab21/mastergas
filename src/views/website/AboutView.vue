<template>
  <div class="about-page" :dir="currentLang === 'ar' ? 'rtl' : 'ltr'">
    
    <!-- 1. Hero Banner Section -->
    <section class="about-hero-section">
      <div class="hero-bg-wrapper">
        <img 
          src="/images/about/hero_banner.jpg" 
          alt="Mastergas Luxury Kitchen" 
          class="hero-bg-image"
          loading="eager"
        />
        <div class="hero-dark-overlay"></div>
      </div>

      <div class="container hero-container">
        <div class="hero-text-content">
          <!-- Tagline with line -->
          <div class="hero-tagline-wrap animate-fade-down">
            <span class="tagline-dash"></span>
            <span class="tagline-text">
              {{ currentLang === 'ar' ? 'الجودة والابتكار في الطهي الحديث' : 'Quality & Innovation in Modern Cooking' }}
            </span>
          </div>

          <!-- Main Title -->
          <h1 class="hero-main-title animate-fade-up">
            {{ currentLang === 'ar' ? 'لماذا Mastergas؟' : 'Why Mastergas?' }}
          </h1>

          <!-- Subtitle -->
          <p class="hero-subtitle-desc animate-fade-up-delay">
            {{ currentLang === 'ar' 
              ? 'رحلة شغف بالتميز، نجمع بين عراقة الطهي الإيطالي وجودة لا تضاهى في منزلك.' 
              : 'A passionate journey of excellence, combining authentic Italian culinary heritage with unmatched quality in your home.' }}
          </p>
        </div>
      </div>
    </section>

    <!-- 2. Story Alternating Showcase Sections -->
    <div class="about-showcase-container">
      
      <!-- Section 1: عن Mastergas (Image Left, Text Right in RTL) -->
      <section class="showcase-row-section scroll-reveal" ref="sec1Ref">
        <div class="container">
          <div class="showcase-grid-layout">
            
            <!-- Image Column -->
            <div class="showcase-image-col">
              <div class="image-frame-card">
                <img 
                  src="/images/about/sec1_modern_kitchen.jpg" 
                  alt="عن Mastergas - مطبخ مودرن فاخر" 
                  class="showcase-visual-img"
                  loading="lazy"
                />
                <div class="image-glow-accent"></div>
              </div>
            </div>

            <!-- Text Column -->
            <div class="showcase-text-col">
              <div class="section-tag-row">
                <span class="tag-dash"></span>
                <span class="tag-label">{{ currentLang === 'ar' ? 'عن ماستر غاز' : 'About Mastergas' }}</span>
              </div>
              
              <h2 class="showcase-heading">
                {{ currentLang === 'ar' ? 'عن Mastergas' : 'About Mastergas' }}
              </h2>

              <div class="showcase-paragraphs">
                <p>
                  {{ currentLang === 'ar'
                    ? 'تأسست Mastergas لتكون رائدة في تقديم أحدث تقنيات أجهزة ومطابخ الطهي الإيطالية الفاخرة، حيث نجمع بين عراقة الحرفية الأوروبية وأعلى معايير الأمان والجودة العالمية.'
                    : 'Mastergas was founded to lead in providing cutting-edge luxury Italian culinary appliances, combining authentic European craftsmanship with the highest global safety and quality standards.' }}
                </p>
                <p>
                  {{ currentLang === 'ar'
                    ? 'نسعى دائماً لتلبية تطلعات واحتياجات عملائنا بتوفير حلول طهي متكاملة ومبتكرة، تمكنهم من الحصول على تجربة طهي استثنائية تدوم لسنوات طويلة.'
                    : 'We continuously strive to exceed our clients’ expectations by offering integrated, innovative cooking solutions that deliver an exceptional culinary experience built to last for years.' }}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- Section 2: الحرفية الإيطالية والتكنولوجيا المعاصرة (Image Right, Text Left in RTL) -->
      <section class="showcase-row-section showcase-reverse scroll-reveal" ref="sec2Ref">
        <div class="container">
          <div class="showcase-grid-layout layout-reversed">
            
            <!-- Image Column -->
            <div class="showcase-image-col">
              <div class="image-frame-card">
                <img 
                  src="/images/about/sec2_italian_cooker.jpg" 
                  alt="الحرفية الإيطالية والتكنولوجيا المعاصرة - موقد غاز إيطالي احترافي" 
                  class="showcase-visual-img"
                  loading="lazy"
                />
                <div class="image-glow-accent"></div>
              </div>
            </div>

            <!-- Text Column -->
            <div class="showcase-text-col">
              <div class="section-tag-row">
                <span class="tag-dash"></span>
                <span class="tag-label">{{ currentLang === 'ar' ? 'ريادة هندسية إيطالية' : 'Italian Engineering Leadership' }}</span>
              </div>
              
              <h2 class="showcase-heading">
                {{ currentLang === 'ar' ? 'الحرفية الإيطالية والتكنولوجيا المعاصرة' : 'Italian Craftsmanship & Contemporary Technology' }}
              </h2>

              <div class="showcase-paragraphs">
                <p>
                  {{ currentLang === 'ar'
                    ? 'نتميز بأننا نجمع بين عراقة الحرفية اليدوية والتكنولوجيا الصناعية المتقدمة لنقدم أجهزة طهي إيطالية متطورة تضمن أداءً لا يُضاهى وسهولة تامة في الاستخدام.'
                    : 'We uniquely blend traditional artisanal heritage with cutting-edge industrial technology to engineer sophisticated Italian cooking appliances offering unmatched performance and intuitive ease of use.' }}
                </p>
                <p>
                  {{ currentLang === 'ar'
                    ? 'تخضع منتجاتنا لأدق اختبارات الجودة والسلامة لتلائم استخدامات الطهي المكثف وتوفر كفاءة حرارية عالية مع الحفاظ على استهلاك اقتصادي للطاقة لسنوات عديدة.'
                    : 'Our products undergo rigorous quality and safety testing to withstand intensive culinary demands, delivering exceptional thermal efficiency and economical energy consumption over decades.' }}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- Section 3: مصمم لثقافتنا واحتياجاتنا المحلية (Image Left, Text Right in RTL) -->
      <section class="showcase-row-section scroll-reveal" ref="sec3Ref">
        <div class="container">
          <div class="showcase-grid-layout">
            
            <!-- Image Column -->
            <div class="showcase-image-col">
              <div class="image-frame-card">
                <img 
                  src="/images/about/sec3_villa_kitchen.jpg" 
                  alt="مصمم لثقافتنا واحتياجاتنا المحلية - مطبخ فلل عربي فاخر" 
                  class="showcase-visual-img"
                  loading="lazy"
                />
                <div class="image-glow-accent"></div>
              </div>
            </div>

            <!-- Text Column -->
            <div class="showcase-text-col">
              <div class="section-tag-row">
                <span class="tag-dash"></span>
                <span class="tag-label">{{ currentLang === 'ar' ? 'ملائم للمطبخ العربي والسعودي' : 'Tailored for Local Culinary Culture' }}</span>
              </div>
              
              <h2 class="showcase-heading">
                {{ currentLang === 'ar' ? 'مصمم لثقافتنا واحتياجاتنا المحلية' : 'Designed for Our Local Culture & Needs' }}
              </h2>

              <div class="showcase-paragraphs">
                <p>
                  {{ currentLang === 'ar'
                    ? 'صُممت أجهزة ماستر غاز لتلبي متطلبات الطهي العربي والسعودي، بتوفير شعلات قوية ذات كفاءة نارية فائقة تناسب الأواني الكبيرة وحفلات الضيافة العائلية بكل سلاسة.'
                    : 'Mastergas appliances are purposefully engineered for Arabian and Saudi culinary requirements, featuring powerful high-efficiency burners that handle large cookware and grand family banquets with total ease.' }}
                </p>
                <p>
                  {{ currentLang === 'ar'
                    ? 'مع الالتزام الكامل بأعلى معايير الهيئة السعودية للمواصفات والمقاييس والجودة (SASO)، لتضمن لمنزلك أعلى درجات الأمان وراحة البال مع ضمان شامل معتمد.'
                    : 'With full compliance to the rigorous standards of the Saudi Standards, Metrology and Quality Organization (SASO), ensuring maximum safety, absolute peace of mind, and certified warranty for your home.' }}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>

    <!-- 3. Values Section: قيمنا الراسخة -->
    <section class="values-section-wrap scroll-reveal" ref="valuesRef">
      <div class="container">
        
        <!-- Header -->
        <div class="values-section-header text-center">
          <h2 class="values-main-title">
            {{ currentLang === 'ar' ? 'قيمنا الراسخة' : 'Our Core Values' }}
          </h2>
          <p class="values-subtitle">
            {{ currentLang === 'ar' 
              ? 'المبادئ التي تقودنا في كل خطوة نقدمها لعملائنا' 
              : 'The core principles guiding every step of our commitment to our customers' }}
          </p>
        </div>

        <!-- 3 Feature Cards Grid -->
        <div class="values-cards-grid">
          
          <!-- Card 1: جودة بلا مساومة -->
          <div class="value-feature-card">
            <div class="value-icon-circle">
              <!-- Quality / Medallion SVG -->
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="6"></circle>
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
              </svg>
            </div>
            <h3 class="value-card-title">
              {{ currentLang === 'ar' ? 'جودة بلا مساومة' : 'Uncompromising Quality' }}
            </h3>
            <p class="value-card-desc">
              {{ currentLang === 'ar'
                ? 'نلتزم بأعلى معايير التصنيع الإيطالي مع استخدام أجود خامات الفولاذ المقاوم للصدأ والمكونات فائقة التحمل.'
                : 'We adhere to the highest Italian manufacturing benchmarks, utilizing premium surgical stainless steel and heavy-duty components.' }}
            </p>
          </div>

          <!-- Card 2: أمان لكل أسرة -->
          <div class="value-feature-card">
            <div class="value-icon-circle">
              <!-- Shield / Safety SVG -->
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
            </div>
            <h3 class="value-card-title">
              {{ currentLang === 'ar' ? 'أمان لكل أسرة' : 'Safety for Every Family' }}
            </h3>
            <p class="value-card-desc">
              {{ currentLang === 'ar'
                ? 'أنظمة أمان ذكية متطورة مع صمامات غلق فوري لضمان الحماية القصوى لك ولعائلتك في جميع الأوقات.'
                : 'Advanced intelligent safety systems with instant flame failure shutoff valves to ensure absolute peace of mind at all times.' }}
            </p>
          </div>

          <!-- Card 3: استدامة ومسؤولية -->
          <div class="value-feature-card">
            <div class="value-icon-circle">
              <!-- Leaf / Sustainability SVG -->
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
              </svg>
            </div>
            <h3 class="value-card-title">
              {{ currentLang === 'ar' ? 'استدامة ومسؤولية' : 'Sustainability & Responsibility' }}
            </h3>
            <p class="value-card-desc">
              {{ currentLang === 'ar'
                ? 'كفاءة بيئية عالية في استهلاك الغاز والطاقة، مع تصميمات تدوم طويلاً لتقليل الهدر وتعزيز الاستدامة.'
                : 'Eco-conscious energy and gas efficiency with durable longevity designed to minimize waste and promote sustainability.' }}
            </p>
          </div>

        </div>

      </div>
    </section>

    <!-- 4. Stats Section (Dark) -->
    <section class="stats-dark-section scroll-reveal" ref="statsRef">
      <div class="container">
        
        <!-- Header -->
        <div class="stats-header-wrap text-center">
          <h2 class="stats-main-heading">
            {{ currentLang === 'ar' ? 'أرقام تفخر بها جودتنا' : 'Numbers Behind Our Quality' }}
          </h2>
          <p class="stats-sub-heading">
            {{ currentLang === 'ar' 
              ? 'مسيرة حافلة بالإنجازات والريادة في السوق السعودي' 
              : 'A proud track record of distinction and trust in the Saudi market' }}
          </p>
        </div>

        <!-- Numbers Row -->
        <div class="stats-numbers-row">
          
          <!-- Stat 1: 100% -->
          <div class="stat-metric-block">
            <div class="stat-number-val font-en">100%</div>
            <div class="stat-label-text">
              {{ currentLang === 'ar' ? 'ضمان واطمئنان' : 'Certified Peace of Mind' }}
            </div>
          </div>

          <!-- Stat 2: +10 سنوات -->
          <div class="stat-metric-block">
            <div class="stat-number-val font-num">
              {{ currentLang === 'ar' ? '+10 سنوات' : '10+ Years' }}
            </div>
            <div class="stat-label-text">
              {{ currentLang === 'ar' ? 'خبرة التميز والريادة' : 'Years of Culinary Excellence' }}
            </div>
          </div>

          <!-- Stat 3: إيطالي -->
          <div class="stat-metric-block">
            <div class="stat-number-val">
              {{ currentLang === 'ar' ? 'إيطالي' : 'Italian' }}
            </div>
            <div class="stat-label-text">
              {{ currentLang === 'ar' ? 'تصميم وهندسة أصلية' : 'Authentic Italian Engineering' }}
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- 5. CTA Section: Mastergas — مصممة للحياة الواقعية -->
    <section class="cta-banner-section scroll-reveal" ref="ctaRef">
      <div class="container text-center">
        
        <h2 class="cta-title">
          {{ currentLang === 'ar' ? 'Mastergas — مصممة للحياة الواقعية' : 'Mastergas — Engineered for Real Life' }}
        </h2>
        
        <p class="cta-subtitle">
          {{ currentLang === 'ar' 
            ? 'ابدأ الآن في تصفح منتجاتنا واكتشف الحلول الإيطالية التي تناسب ذوق منزلك' 
            : 'Explore our collection now and discover Italian culinary solutions tailored to your home' }}
        </p>

        <div class="cta-button-wrap">
          <router-link to="/products" class="cta-black-btn">
            <span>{{ currentLang === 'ar' ? 'تسوق الآن' : 'Shop Now' }}</span>
            <svg class="cta-arrow-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7" v-if="currentLang !== 'ar'"></path>
              <path d="m12 19-7-7 7-7" v-else></path>
            </svg>
          </router-link>
        </div>

      </div>
    </section>

  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useLocalized } from '../../composables/useLocalized';
import { useSEO } from '../../composables/useSEO';

const { currentLang } = useLocalized();

// Dynamic SEO Tags
useSEO({
  title: 'لماذا Mastergas؟ - من نحن | عراقة الطهي الإيطالي الفاخر',
  description: 'تعرف على قصة Mastergas، الرائدة في تقديم أحدث تقنيات أجهزة ومطابخ الطهي الإيطالية المدمجة والفاخرة في المملكة العربية السعودية بمعايير SASO.',
  keywords: 'من نحن ماستر غاز, Mastergas, أجهزة مطبخ إيطالية, أفران بلت إن إيطالية, مسطحات غاز بالسعودية'
});

// Scroll Reveal Intersection Observer
const sec1Ref = ref(null);
const sec2Ref = ref(null);
const sec3Ref = ref(null);
const valuesRef = ref(null);
const statsRef = ref(null);
const ctaRef = ref(null);

let observer = null;

onMounted(() => {
  if (typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = [sec1Ref.value, sec2Ref.value, sec3Ref.value, valuesRef.value, statsRef.value, ctaRef.value];
    elements.forEach((el) => {
      if (el) observer.observe(el);
    });
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
/* Base View Styles */
.about-page {
  background-color: #ffffff;
  color: #111827;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 1. Hero Banner Section */
.about-hero-section {
  position: relative;
  width: 100%;
  height: 520px;
  overflow: hidden;
  display: flex;
  align-items: center;
  margin-top: 90px;
  background-color: #0b0f19;
}

.hero-bg-wrapper {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.hero-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 35%;
  animation: heroKenBurns 18s ease-out infinite alternate;
}

@keyframes heroKenBurns {
  0% { transform: scale(1); }
  100% { transform: scale(1.06); }
}

.hero-dark-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    270deg,
    rgba(0, 0, 0, 0.88) 0%,
    rgba(0, 0, 0, 0.65) 45%,
    rgba(0, 0, 0, 0.35) 100%
  );
}

.hero-container {
  position: relative;
  z-index: 3;
  width: 100%;
}

.hero-text-content {
  max-width: 650px;
}

.hero-tagline-wrap {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.tagline-dash {
  width: 36px;
  height: 2px;
  background-color: #ffffff;
  opacity: 0.9;
}

.tagline-text {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  letter-spacing: 0.2px;
}

.hero-main-title {
  font-size: 46px;
  font-weight: 800;
  color: #ffffff;
  margin: 8px 0 14px 0;
  letter-spacing: -0.5px;
  line-height: 1.18;
}

.hero-subtitle-desc {
  font-size: 16px;
  color: #e2e8f0;
  font-weight: 400;
  line-height: 1.7;
  margin: 0;
  opacity: 0.95;
}

/* Animations for Hero */
.animate-fade-down {
  animation: fadeInDown 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.animate-fade-up {
  animation: fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
}

.animate-fade-up-delay {
  animation: fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(22px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 2. Showcase Alternating Sections */
.about-showcase-container {
  padding: 80px 0 40px;
  background: #ffffff;
}

.showcase-row-section {
  padding: 60px 0;
}

.showcase-grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

/* Reversed Layout */
.layout-reversed .showcase-image-col {
  order: 2;
}

.layout-reversed .showcase-text-col {
  order: 1;
}

/* Image Card Styling */
.image-frame-card {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  aspect-ratio: 16 / 10;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease;
  background-color: #f1f5f9;
}

.image-frame-card:hover {
  transform: translateY(-6px) scale(1.015);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.12);
}

.showcase-visual-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.image-frame-card:hover .showcase-visual-img {
  transform: scale(1.05);
}

.image-glow-accent {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 18px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.15);
}

/* Text Column Styling */
.showcase-text-col {
  display: flex;
  flex-direction: column;
}

.section-tag-row {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.tag-dash {
  width: 26px;
  height: 2px;
  background-color: #2563eb;
}

.tag-label {
  font-size: 13.5px;
  font-weight: 600;
  color: #2563eb;
  letter-spacing: 0.2px;
}

.showcase-heading {
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.28;
  margin: 0 0 20px 0;
  letter-spacing: -0.4px;
}

.showcase-paragraphs {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.showcase-paragraphs p {
  font-size: 15.5px;
  color: #475569;
  line-height: 1.85;
  margin: 0;
  font-weight: 400;
}

/* 3. Values Section: قيمنا الراسخة */
.values-section-wrap {
  padding: 80px 0 100px;
  background: #f8fafc;
}

.values-section-header {
  margin-bottom: 50px;
}

.values-main-title {
  font-size: 34px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 12px 0;
  letter-spacing: -0.4px;
}

.values-subtitle {
  font-size: 15.5px;
  color: #64748b;
  margin: 0;
  font-weight: 400;
}

.values-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.value-feature-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 36px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.value-feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.value-icon-circle {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  transition: all 0.35s ease;
}

.value-feature-card:hover .value-icon-circle {
  background: #0f172a;
  color: #ffffff;
  transform: scale(1.1);
}

.value-card-title {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 14px 0;
}

.value-card-desc {
  font-size: 14.5px;
  color: #64748b;
  line-height: 1.75;
  margin: 0;
}

/* 4. Stats Section (Dark) */
.stats-dark-section {
  background-color: #000000;
  color: #ffffff;
  padding: 90px 0 100px;
}

.stats-header-wrap {
  margin-bottom: 60px;
}

.stats-main-heading {
  font-size: 34px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 12px 0;
  letter-spacing: -0.4px;
}

.stats-sub-heading {
  font-size: 15.5px;
  color: #94a3b8;
  margin: 0;
  font-weight: 400;
}

.stats-numbers-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  align-items: center;
  text-align: center;
}

.stat-metric-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.3s ease;
}

.stat-metric-block:hover {
  transform: translateY(-4px);
}

.stat-number-val {
  font-size: 54px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.5px;
  line-height: 1.1;
}

.font-num {
  font-family: inherit;
}

.font-en {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  direction: ltr;
}

.stat-label-text {
  font-size: 15px;
  color: #94a3b8;
  font-weight: 500;
}

/* 5. CTA Section */
.cta-banner-section {
  padding: 100px 0 120px;
  background-color: #ffffff;
}

.cta-title {
  font-size: 36px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 14px 0;
  letter-spacing: -0.4px;
}

.cta-subtitle {
  font-size: 16px;
  color: #64748b;
  margin: 0 auto 36px auto;
  max-width: 600px;
  line-height: 1.7;
}

.cta-button-wrap {
  display: flex;
  justify-content: center;
}

.cta-black-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 44px;
  background-color: #000000;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

.cta-black-btn:hover {
  background-color: #1f2937;
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.22);
}

.cta-arrow-svg {
  transition: transform 0.3s ease;
}

.cta-black-btn:hover .cta-arrow-svg {
  transform: translateX(-4px);
}

[dir="ltr"] .cta-black-btn:hover .cta-arrow-svg {
  transform: translateX(4px);
}

/* Scroll Reveal States */
.scroll-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.scroll-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Responsive Media Queries */
@media (max-width: 1024px) {
  .showcase-grid-layout {
    gap: 40px;
  }
  .hero-main-title {
    font-size: 38px;
  }
  .showcase-heading {
    font-size: 28px;
  }
  .stat-number-val {
    font-size: 44px;
  }
}

@media (max-width: 860px) {
  .about-hero-section {
    height: 420px;
    margin-top: 20px;
  }
  .showcase-grid-layout {
    grid-template-columns: 1fr;
    gap: 36px;
  }
  .layout-reversed .showcase-image-col {
    order: 1;
  }
  .layout-reversed .showcase-text-col {
    order: 2;
  }
  .values-cards-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .stats-numbers-row {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .stat-number-val {
    font-size: 46px;
  }
  .cta-title {
    font-size: 28px;
  }
}
</style>
