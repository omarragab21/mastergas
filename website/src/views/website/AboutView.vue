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
          <!-- Tagline with line (in RTL: text on right, dash on left) -->
          <div class="hero-tagline-wrap">
            <span class="tagline-text">
              {{ currentLang === 'ar' ? 'الجودة والابتكار في الطهي الحديث' : 'Quality & Innovation in Modern Cooking' }}
            </span>
            <span class="tagline-dash"></span>
          </div>

          <!-- Main Title -->
          <h1 class="hero-main-title">
            {{ currentLang === 'ar' ? 'لماذا Mastergas؟' : 'Why Mastergas?' }}
          </h1>

          <!-- Subtitle -->
          <p class="hero-subtitle-desc">
            {{ currentLang === 'ar' 
              ? 'رحلة شغف بالتميز، نجمع بين عراقة الطهي الإيطالي وجودة لا تضاهى في منزلك' 
              : 'A passionate journey of excellence, combining authentic Italian culinary heritage with unmatched quality in your home.' }}
          </p>
        </div>
      </div>
    </section>

    <!-- 2. Story Alternating Showcase Sections -->
    <div class="about-showcase-container">
      
      <!-- Section 1: عن Mastergas (Text Right, Image Left in RTL) -->
      <section class="showcase-section bg-white">
        <div class="container">
          <div class="showcase-grid-layout">
            
            <!-- Text Column (Column 1 = Right in RTL) -->
            <div class="showcase-text-col">
              <div class="section-tag-row">
                <span class="tag-dot"></span>
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

            <!-- Image Column (Column 2 = Left in RTL) -->
            <div class="showcase-image-col">
              <div class="image-frame-card">
                <img 
                  src="/images/about/sec1_modern_kitchen.jpg" 
                  alt="عن Mastergas - مطبخ مودرن فاخر" 
                  class="showcase-visual-img"
                  loading="lazy"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- Section 2: الحرفية الإيطالية والتكنولوجيا المعاصرة (Image Right, Text Left in RTL) -->
      <section class="showcase-section bg-light-gray">
        <div class="container">
          <div class="showcase-grid-layout layout-reversed">
            
            <!-- Image Column (Column 1 = Right in RTL) -->
            <div class="showcase-image-col">
              <div class="image-frame-card">
                <img 
                  src="/images/about/sec2_italian_cooker.jpg" 
                  alt="الحرفية الإيطالية والتكنولوجيا المعاصرة - موقد غاز إيطالي احترافي" 
                  class="showcase-visual-img"
                  loading="lazy"
                />
              </div>
            </div>

            <!-- Text Column (Column 2 = Left in RTL) -->
            <div class="showcase-text-col">
              <div class="section-tag-row">
                <span class="tag-dot"></span>
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

      <!-- Section 3: مصمم لثقافتنا واحتياجاتنا المحلية (Text Right, Image Left in RTL) -->
      <section class="showcase-section bg-white">
        <div class="container">
          <div class="showcase-grid-layout">
            
            <!-- Text Column (Column 1 = Right in RTL) -->
            <div class="showcase-text-col">
              <div class="section-tag-row">
                <span class="tag-dot"></span>
                <span class="tag-label">{{ currentLang === 'ar' ? 'التزامنا تجاه البيوت السعودية' : 'Our Commitment to Saudi Homes' }}</span>
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

            <!-- Image Column (Column 2 = Left in RTL) -->
            <div class="showcase-image-col">
              <div class="image-frame-card">
                <img 
                  src="/images/about/sec3_villa_kitchen.jpg" 
                  alt="مصمم لثقافتنا واحتياجاتنا المحلية - مطبخ فلل عربي فاخر" 
                  class="showcase-visual-img"
                  loading="lazy"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>

    <!-- 3. Values Section: قيمنا الراسخة -->
    <section class="values-section-wrap">
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

        <!-- 3 Feature Cards Grid (In RTL: Card 1 Right, Card 2 Center, Card 3 Left) -->
        <div class="values-cards-grid">
          
          <!-- Card 1: جودة بلا مساومة -->
          <div class="value-feature-card">
            <div class="value-card-icon">
              <!-- checkmark-badge-01 SVG -->
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.31897 13.6566C9.44547 13.8573 9.66548 13.9783 9.90106 13.9783L9.90196 13.9792C9.90838 13.9792 9.9148 13.979 9.92123 13.9788C9.92766 13.9785 9.93408 13.9783 9.9405 13.9783C10.1907 13.9636 10.4135 13.8151 10.5216 13.5896C10.5363 13.5566 12.1011 10.3428 14.0692 9.31799C14.4065 9.14199 14.5367 8.72673 14.3616 8.39031C14.1856 8.05298 13.7703 7.92282 13.4339 8.0979C11.7793 8.95865 10.4501 10.9221 9.7718 12.0854C9.20163 11.5556 8.61588 11.2329 8.58013 11.2136C8.24647 11.0321 7.83033 11.1559 7.64883 11.4886C7.46733 11.8214 7.58925 12.2385 7.922 12.4209C7.92223 12.421 7.92306 12.4215 7.92446 12.4223C7.97853 12.4529 8.88563 12.9668 9.31897 13.6566Z" fill="currentColor"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M8.67453 19.4335C9.23185 20.033 9.99447 20.8533 11.0009 20.8533C12.0073 20.8533 12.7699 20.033 13.3273 19.4335L13.3434 19.4162C13.4383 19.3144 13.5281 19.218 13.6088 19.1373C14.1157 18.6313 14.3623 18.5287 15.0782 18.5287C15.1837 18.5287 15.2968 18.5321 15.4136 18.5356L15.4256 18.536C16.1764 18.558 17.204 18.5873 17.8933 17.9044C18.5881 17.2151 18.5588 16.1801 18.5368 15.4248L18.5364 15.4124C18.5329 15.2958 18.5295 15.1828 18.5295 15.0774C18.5295 14.3615 18.6395 14.1067 19.1867 13.5594C20.262 12.4851 20.8542 11.892 20.8542 11C20.8542 10.1082 20.262 9.51603 19.1869 8.44088C18.6405 7.89363 18.5295 7.63863 18.5295 6.92271C18.5295 6.81735 18.5329 6.70434 18.5364 6.58773L18.5368 6.57533C18.5588 5.81908 18.5881 4.78508 17.8933 4.09483C17.2053 3.41327 16.1814 3.44203 15.431 3.46311L15.4265 3.46323L15.4092 3.46375C15.2936 3.46724 15.183 3.47057 15.0782 3.47057C14.4512 3.47057 14.0396 3.29275 13.5602 2.81333C12.4859 1.73808 11.8928 1.14587 11.0009 1.14587C10.109 1.14587 9.51688 1.73802 8.44174 2.81316C7.96232 3.29258 7.55056 3.47057 6.92356 3.47057C6.81799 3.47057 6.70651 3.46719 6.59074 3.46368L6.57614 3.46323C5.81989 3.44123 4.78589 3.4119 4.09564 4.10673C3.41272 4.79607 3.44204 5.82367 3.46404 6.5735L3.46456 6.59083C3.46805 6.70646 3.47138 6.81704 3.47138 6.92181C3.47138 7.54881 3.29356 7.9604 2.81414 8.43982C1.73889 9.51415 1.14673 10.1072 1.14673 10.9991C1.14673 11.8911 1.73889 12.4832 2.81413 13.5585C3.36047 14.1057 3.47138 14.3606 3.47138 15.0765C3.47138 15.1819 3.46795 15.2951 3.46441 15.4118L3.46404 15.4239C3.44204 16.1792 3.41273 17.2142 4.10848 17.9044C4.79782 18.5873 5.82539 18.558 6.57614 18.536L6.58824 18.5356C6.70496 18.5321 6.81812 18.5287 6.92356 18.5287C7.63948 18.5287 7.88696 18.6304 8.39296 19.1364C8.47821 19.2216 8.5737 19.3244 8.67453 19.4335ZM9.36464 18.1638C8.5983 17.3993 8.00523 17.1537 6.92356 17.1537L6.92173 17.1527C6.80434 17.1527 6.67928 17.1561 6.54987 17.1596L6.53488 17.1601C6.00413 17.1756 5.34507 17.194 5.07465 16.9263C4.80332 16.6559 4.82162 15.9941 4.83721 15.4615L4.83761 15.4467C4.84114 15.3172 4.84455 15.1921 4.84455 15.0746C4.84455 13.993 4.57231 13.3742 3.78398 12.585L3.77319 12.5742C2.99131 11.7914 2.51989 11.3194 2.51989 10.9973C2.51989 10.6737 2.99559 10.198 3.78384 9.4098C4.51718 8.67738 4.84455 7.90906 4.84455 6.91998C4.84455 6.8024 4.84118 6.67809 4.83768 6.54868L4.83721 6.53129C4.82162 6.00237 4.8024 5.34332 5.07098 5.0729C5.3414 4.80157 6.00323 4.81987 6.53582 4.83546L6.55075 4.83586C6.68018 4.83939 6.80522 4.8428 6.92262 4.8428C7.91079 4.8428 8.67897 4.51556 9.4123 3.78223C10.2006 2.9939 10.6764 2.51814 11 2.51814C11.3236 2.51814 11.7993 2.99384 12.5875 3.78209C13.3199 4.51543 14.0882 4.8428 15.0773 4.8428C15.1949 4.8428 15.3191 4.83943 15.4485 4.83593L15.466 4.83546C15.9949 4.81987 16.654 4.80065 16.9244 5.06923C17.1957 5.33965 17.1774 6.00148 17.1618 6.53407L17.1614 6.54919C17.1579 6.67855 17.1545 6.80352 17.1545 6.92087C17.1545 8.00254 17.4267 8.6213 18.2151 9.41056L18.2255 9.42103C19.0076 10.204 19.4792 10.6761 19.4792 10.9982C19.4792 11.3218 19.0181 11.7838 18.2151 12.5859C17.4121 13.388 17.1545 13.993 17.1545 15.0756C17.1545 15.1929 17.1579 15.3179 17.1614 15.4473L17.1618 15.4624C17.1774 15.9941 17.1967 16.6559 16.9244 16.9263C16.654 17.1949 15.994 17.1756 15.4641 17.1601L15.449 17.1596C15.3196 17.1561 15.1947 17.1527 15.0773 17.1527C13.9957 17.1527 13.4025 17.3984 12.6362 18.1638C12.5395 18.2606 12.4419 18.3654 12.339 18.4761L12.3162 18.5006C11.9316 18.9137 11.4066 19.4774 11.0009 19.4774C10.5939 19.4774 10.0668 18.9109 9.6818 18.4966C9.66634 18.4801 9.651 18.4637 9.63577 18.4474C9.54268 18.348 9.45366 18.2528 9.36464 18.1638Z" fill="currentColor"/>
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
            <div class="value-card-icon">
              <!-- elements.svg (shield) SVG -->
              <svg width="22" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.4993 8.45717C15.8897 8.31889 16.0942 7.89027 15.9559 7.49982C15.8176 7.10937 15.389 6.90495 14.9985 7.04323C14.1635 7.33899 13.3519 7.90884 12.6257 8.5457C11.8917 9.18938 11.2025 9.93949 10.6142 10.6448C10.084 11.2803 9.62825 11.8884 9.28726 12.3651C8.94407 11.8987 8.60329 11.5851 8.28993 11.3762C8.2642 11.359 8.2386 11.3415 8.21279 11.3238C7.98505 11.1676 7.74088 11.0002 7.25188 11.0002C6.83767 11.0002 6.4989 11.336 6.4989 11.7502C6.4989 12.1477 6.80821 12.4731 7.19929 12.4986C7.20293 12.4994 7.2081 12.5007 7.21474 12.5026C7.25024 12.5127 7.33555 12.5427 7.45788 12.6242C7.70107 12.7864 8.12257 13.1746 8.57808 14.0856C8.69897 14.3274 8.9406 14.4854 9.21055 14.4992C9.48045 14.513 9.73708 14.3803 9.88204 14.1522C9.97112 14.0185 10.2355 13.6219 10.4021 13.3858C10.7358 12.913 11.2087 12.2736 11.766 11.6056C12.3247 10.9359 12.959 10.2485 13.6147 9.67346C14.2782 9.09157 14.9226 8.66142 15.4993 8.45717Z" fill="currentColor"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M10.2471 0C8.56582 0 7.19898 0.567939 6.00685 1.18555C5.6466 1.37219 5.31193 1.5568 4.99212 1.73322C4.20967 2.16485 3.51619 2.5474 2.75463 2.79039L2.72921 2.7985C2.28192 2.94121 1.91112 3.05951 1.63019 3.1696C1.36577 3.27321 1.05152 3.4152 0.82856 3.66299C0.628279 3.88558 0.525386 4.13547 0.457166 4.3745C0.395235 4.59148 0.347817 4.85462 0.297032 5.13644L0.291515 5.16705C-0.946426 12.0327 1.76057 18.537 8.37102 21.0679L8.40392 21.0805C9.05368 21.3293 9.4993 21.5 10.2504 21.5C11.0015 21.5 11.4471 21.3293 12.0968 21.0805L12.1297 21.0679C18.7399 18.5369 21.4442 12.0324 20.206 5.167L20.2004 5.13634C20.1496 4.8545 20.1022 4.59132 20.0402 4.37433C19.972 4.13529 19.8691 3.88537 19.6687 3.66278C19.4458 3.41499 19.1315 3.27304 18.8671 3.16946C18.5862 3.05942 18.2154 2.94119 17.7682 2.79857L17.7427 2.79044C16.9807 2.54744 16.2866 2.1648 15.5036 1.7331C15.1837 1.55671 14.8489 1.37213 14.4885 1.18554C13.2958 0.567951 11.9284 0 10.2471 0ZM3.21058 4.21941C4.12244 3.92847 5.01083 3.43833 5.84112 2.98023C6.13411 2.81859 6.41986 2.66093 6.69686 2.51742C7.80842 1.94156 8.92059 1.5 10.2471 1.5C11.5737 1.5 12.6865 1.94162 13.7988 2.51757C14.0759 2.66107 14.3618 2.81872 14.655 2.98035C15.4858 3.43847 16.3747 3.92862 17.2869 4.21953C17.7661 4.37233 18.0899 4.47599 18.32 4.56613C18.4714 4.62546 18.5373 4.66295 18.5585 4.6754C18.5664 4.69136 18.5802 4.72432 18.5979 4.78609C18.6367 4.92222 18.6715 5.11018 18.7298 5.43325C19.8708 11.7595 17.3811 17.451 11.5933 19.667C10.929 19.9214 10.7108 20 10.2504 20C9.78995 20 9.57175 19.9214 8.90735 19.6671C3.11901 17.4509 0.627074 11.7593 1.76771 5.43322C1.82595 5.1102 1.86072 4.92228 1.89957 4.78618C1.91719 4.72443 1.93096 4.69148 1.93889 4.67552C1.96011 4.66307 2.02596 4.62556 2.17746 4.5662C2.40758 4.47602 2.73143 4.37229 3.21058 4.21941Z" fill="currentColor"/>
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
            <div class="value-card-icon">
              <!-- elements-1.svg (lock/safety) SVG -->
              <svg width="22" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.74887 7.508V8.50644C6.78526 8.81624 6.26303 9.62959 6.11843 10.208C6.07049 10.3998 6.04523 10.6583 6.02937 10.9018C6.01247 11.1613 6.00317 11.4607 6.00008 11.7622C5.99396 12.3584 6.01178 13.0047 6.05176 13.4045L6.05778 13.4647L6.07336 13.5231C6.39837 14.7419 7.25668 15.2895 8.07607 15.4567L8.11751 15.4652L8.15963 15.4689C8.64633 15.5122 10.3537 15.5062 11.2683 15.503L11.2702 15.503C11.4485 15.5024 11.5966 15.5019 11.6994 15.5019C12.267 15.5116 12.8515 15.412 13.3567 15.0786C13.8766 14.7354 14.2213 14.2051 14.4087 13.5306L14.4193 13.4924L14.4258 13.4532C14.4671 13.2053 14.4961 12.5621 14.4998 11.9545C14.5017 11.6378 14.497 11.3072 14.4814 11.0123C14.4667 10.7329 14.4401 10.4338 14.3836 10.208L14.3768 10.1807L14.368 10.154C14.0584 9.21957 13.4114 8.72647 12.7649 8.51301V7.508C12.7649 6.12287 11.642 5 10.2569 5C8.87174 5 7.74887 6.12287 7.74887 7.508ZM10.2569 6.5C9.70017 6.5 9.24887 6.9513 9.24887 7.508V8.37988H11.2649V7.508C11.2649 6.9513 10.8136 6.5 10.2569 6.5ZM8.58604 9.87988C7.93147 9.87988 7.63166 10.3397 7.57364 10.5718C7.56159 10.62 7.54185 10.759 7.5262 10.9992C7.5116 11.2234 7.50291 11.494 7.5 11.7776C7.49448 12.3156 7.51012 12.8623 7.53849 13.1924C7.62362 13.4761 7.75031 13.6451 7.87375 13.7525C8.00063 13.8629 8.15718 13.9364 8.33582 13.9782C8.80018 14.0106 10.2931 14.0059 11.1988 14.0031C11.4045 14.0024 11.5799 14.0019 11.706 14.0019L11.7201 14.002C12.1101 14.0093 12.3627 13.9373 12.5304 13.8267C12.6798 13.7281 12.8387 13.5484 12.9508 13.1727C12.9696 13.0113 12.9963 12.5189 12.9998 11.9453C13.0016 11.6469 12.997 11.3475 12.9835 11.0912C12.9705 10.8455 12.9512 10.6802 12.9339 10.596C12.7375 10.0426 12.304 9.87988 11.946 9.87988H8.58604Z" fill="currentColor"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M10.2471 0C8.56583 0 7.19899 0.567939 6.00686 1.18555C5.6466 1.37219 5.31193 1.5568 4.99212 1.73322C4.20967 2.16485 3.5162 2.5474 2.75463 2.79039L2.72909 2.79854C2.28186 2.94123 1.9111 3.05952 1.63019 3.16959C1.36578 3.27321 1.05152 3.41519 0.828558 3.663C0.62828 3.88559 0.525388 4.13547 0.457167 4.3745C0.395237 4.59148 0.347818 4.85461 0.297033 5.13643L0.291515 5.16704C-0.946427 12.0327 1.76057 18.537 8.37103 21.0679L8.40408 21.0806C9.05376 21.3294 9.49933 21.5 10.2504 21.5C11.0015 21.5 11.4472 21.3293 12.097 21.0804L12.1297 21.0679C18.7399 18.5368 21.4442 12.0325 20.206 5.16701L20.2005 5.13639C20.1496 4.85451 20.1022 4.59134 20.0403 4.37433C19.972 4.13529 19.8691 3.88539 19.6688 3.66279C19.4458 3.41499 19.1315 3.27304 18.8671 3.16946C18.5862 3.05942 18.2154 2.94118 17.7681 2.79856L17.7427 2.79045C16.9807 2.54744 16.2866 2.16479 15.5036 1.73309C15.1836 1.55671 14.8488 1.37212 14.4885 1.18554C13.2958 0.567953 11.9284 0 10.2471 0ZM3.21058 4.21941C4.12244 3.92847 5.01083 3.43833 5.84112 2.98023C6.13411 2.81859 6.41987 2.66093 6.69686 2.51742C7.80842 1.94156 8.92059 1.5 10.2471 1.5C11.5737 1.5 12.6865 1.94162 13.7988 2.51757C14.0759 2.66108 14.3618 2.81872 14.655 2.98035C15.4858 3.43848 16.3747 3.92862 17.2869 4.21953C17.7661 4.37233 18.0899 4.476 18.32 4.56613C18.4715 4.62546 18.5373 4.66295 18.5585 4.6754C18.5665 4.69137 18.5802 4.72433 18.5979 4.7861C18.6367 4.92223 18.6715 5.11018 18.7298 5.43325C19.8708 11.7595 17.3811 17.451 11.5933 19.6671C10.929 19.9214 10.7108 20 10.2504 20C9.78992 20 9.57177 19.9214 8.90735 19.6671C3.11902 17.451 0.627072 11.7593 1.76771 5.43322C1.82595 5.1102 1.86072 4.92228 1.89957 4.78618C1.91719 4.72443 1.93096 4.69148 1.9389 4.67552C1.96011 4.66307 2.02596 4.62556 2.17746 4.5662C2.40759 4.47602 2.73143 4.37229 3.21058 4.21941ZM1.94443 4.66539C1.94581 4.66375 1.94647 4.66271 1.94645 4.66259C1.94644 4.66252 1.94619 4.66278 1.94572 4.66342C1.9454 4.66388 1.94497 4.66452 1.94443 4.66539Z" fill="currentColor"/>
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
    <section class="stats-dark-section">
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

        <!-- Numbers Row (RTL: 100% on right, +10 سنوات center, إيطالي on left) -->
        <div class="stats-numbers-row">
          
          <!-- Stat 1: 100% -->
          <div class="stat-metric-block">
            <div class="stat-number-val font-num">100%</div>
            <div class="stat-label-text">
              {{ currentLang === 'ar' ? 'ضمان شامل معتمد' : 'Certified Peace of Mind' }}
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
    <section class="cta-banner-section">
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
            {{ currentLang === 'ar' ? 'تسوق الآن' : 'Shop Now' }}
          </router-link>
        </div>

      </div>
    </section>

  </div>
</template>

<script setup>
import { useLocalized } from '../../composables/useLocalized';
import { useSEO } from '../../composables/useSEO';

const { currentLang } = useLocalized();

// Dynamic SEO Tags
useSEO({
  title: 'لماذا Mastergas؟ - من نحن | عراقة الطهي الإيطالي الفاخر',
  description: 'تعرف على قصة Mastergas، الرائدة في تقديم أحدث تقنيات أجهزة ومطابخ الطهي الإيطالية المدمجة والفاخرة في المملكة العربية السعودية بمعايير SASO.',
  keywords: 'من نحن ماستر غاز, Mastergas, أجهزة مطبخ إيطالية, أفران بلت إن إيطالية, مسطحات غاز بالسعودية'
});
</script>

<style scoped>
/* Base View Styles matching Figma mastergas-about-us */
.about-page {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  position: relative;
  width: 100%;
  min-height: 100vh;
  background-color: #FFFFFF;
  color: #111827;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  overflow-x: hidden;
  margin: 0;
  box-sizing: border-box;
}

/* Container conforming to 1440px desktop frame with 64px padding */
.container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 64px;
  box-sizing: border-box;
}

/* 1. Hero Banner Section */
.about-hero-section {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
  display: flex;
  align-items: center;
  margin-top: 120px; /* Offset for 40px top-bar + 80px navbar */
  background-color: #0B0F19;
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
  object-position: center 38%;
}

.hero-dark-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    270deg,
    rgba(0, 0, 0, 0.90) 0%,
    rgba(0, 0, 0, 0.65) 45%,
    rgba(0, 0, 0, 0.30) 100%
  );
}

[dir="ltr"] .hero-dark-overlay {
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.90) 0%,
    rgba(0, 0, 0, 0.65) 45%,
    rgba(0, 0, 0, 0.30) 100%
  );
}

.hero-container {
  position: relative;
  z-index: 3;
  width: 100%;
}

.hero-text-content {
  max-width: 620px;
}

.hero-tagline-wrap {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.tagline-text {
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  letter-spacing: 0.2px;
}

.tagline-dash {
  width: 36px;
  height: 2px;
  background-color: #FFFFFF;
  opacity: 0.85;
}

.hero-main-title {
  font-size: 44px;
  font-weight: 800;
  color: #FFFFFF;
  margin: 0 0 16px 0;
  line-height: 1.22;
  letter-spacing: -0.4px;
}

.hero-subtitle-desc {
  font-size: 16px;
  color: #E2E8F0;
  font-weight: 400;
  line-height: 1.75;
  margin: 0;
  opacity: 0.95;
}

/* 2. Showcase Alternating Sections */
.about-showcase-container {
  width: 100%;
  background: #FFFFFF;
}

.showcase-section {
  width: 100%;
  padding: 80px 0;
}

.bg-white {
  background-color: #FFFFFF;
}

.bg-light-gray {
  background-color: #F8FAFC;
}

.showcase-grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}

/* Image Card Styling */
.image-frame-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
  aspect-ratio: 16 / 10;
  background-color: #F1F5F9;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
}

.image-frame-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.1);
}

.showcase-visual-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Text Column Styling */
.showcase-text-col {
  display: flex;
  flex-direction: column;
}

.section-tag-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.tag-dot {
  width: 6px;
  height: 6px;
  background: #000000;
  border-radius: 4px;
  flex: none;
  flex-grow: 0;
}

.tag-label {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #64748B;
  flex: none;
  flex-grow: 0;
}

.showcase-heading {
  font-size: 32px;
  font-weight: 800;
  color: #0F172A;
  line-height: 1.28;
  margin: 0 0 18px 0;
  letter-spacing: -0.3px;
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
  width: 100%;
  padding: 88px 0 96px;
  background-color: #F8FAFC;
}

.values-section-header {
  margin-bottom: 48px;
}

.values-main-title {
  font-size: 32px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 10px 0;
  letter-spacing: -0.4px;
}

.values-subtitle {
  font-size: 15px;
  color: #64748B;
  margin: 0;
  font-weight: 400;
}

.values-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.value-feature-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: right;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease;
}

[dir="ltr"] .value-feature-card {
  text-align: left;
}

.value-feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.07);
  border-color: #CBD5E1;
}

.value-card-icon {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  color: #000000;
}

.value-card-title {
  font-size: 18px;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 10px 0;
}

.value-card-desc {
  font-size: 14.5px;
  color: #64748B;
  line-height: 1.75;
  margin: 0;
}

/* 4. Stats Section (Dark) */
.stats-dark-section {
  width: 100%;
  background-color: #000000;
  color: #FFFFFF;
  padding: 88px 0 96px;
}

.stats-header-wrap {
  margin-bottom: 56px;
}

.stats-main-heading {
  font-size: 32px;
  font-weight: 800;
  color: #FFFFFF;
  margin: 0 0 10px 0;
  letter-spacing: -0.4px;
}

.stats-sub-heading {
  font-size: 15px;
  color: #94A3B8;
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
  gap: 8px;
  align-items: center;
}

.stat-number-val {
  font-size: 52px;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: -0.5px;
  line-height: 1.1;
}

.font-num {
  font-family: inherit;
}

.stat-label-text {
  font-size: 15px;
  color: #94A3B8;
  font-weight: 500;
}

/* 5. CTA Section */
.cta-banner-section {
  width: 100%;
  padding: 88px 0 100px;
  background-color: #FFFFFF;
}

.cta-title {
  font-size: 32px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 12px 0;
  letter-spacing: -0.4px;
}

.cta-subtitle {
  font-size: 15.5px;
  color: #64748B;
  margin: 0 auto 32px auto;
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
  justify-content: center;
  padding: 12px 40px;
  background-color: #000000;
  color: #FFFFFF;
  font-size: 15px;
  font-weight: 700;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.cta-black-btn:hover {
  background-color: #1F2937;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
}

/* Responsive Media Queries */
@media (max-width: 1024px) {
  .container {
    padding: 0 32px;
  }
  .showcase-grid-layout {
    gap: 40px;
  }
  .hero-main-title {
    font-size: 36px;
  }
  .showcase-heading {
    font-size: 28px;
  }
  .stat-number-val {
    font-size: 42px;
  }
}

@media (max-width: 768px) {
  .about-hero-section {
    height: auto;
    min-height: 380px;
    padding: 60px 0;
    margin-top: 100px;
  }
  .container {
    padding: 0 20px;
  }
  .showcase-section {
    padding: 50px 0;
  }
  .showcase-grid-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  /* On mobile: text column always comes first, followed by image */
  .showcase-grid-layout .showcase-text-col {
    order: 1;
  }
  .showcase-grid-layout .showcase-image-col {
    order: 2;
  }
  .showcase-heading {
    font-size: 24px;
    margin-bottom: 14px;
  }
  .values-section-wrap {
    padding: 60px 0;
  }
  .values-cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .stats-dark-section {
    padding: 60px 0;
  }
  .stats-numbers-row {
    grid-template-columns: 1fr;
    gap: 36px;
  }
  .stat-number-val {
    font-size: 44px;
  }
  .cta-banner-section {
    padding: 60px 0 70px;
  }
  .cta-title {
    font-size: 24px;
  }
}
</style>
