<template>
  <div class="home-view" :dir="currentLang === 'ar' ? 'rtl' : 'ltr'">
    <!-- 1. Hero Section (Home Banner Multi-Slide Carousel) -->
    <div 
      class="hero-banner-wrapper"
      @mouseenter="stopHeroAutoplay"
      @mouseleave="startHeroAutoplay"
    >
      <section class="hero-section">
        <!-- Background Slides Carousel -->
        <transition-group :name="heroTransitionName" tag="div" class="hero-slides-wrapper">
          <div 
            v-for="(slide, idx) in displayHeroSlides" 
            :key="slide.id"
            v-show="currentHeroIndex === idx"
            class="hero-slide-item"
          >
            <div class="hero-bg" :style="{ backgroundImage: `url(${slide.image})` }"></div>
            <div class="hero-overlay"></div>
            
            <div class="hero-container">
              <div class="hero-content">
                <span class="hero-tag">
                  <span class="tag-dot"></span>
                  {{ slide.tag }}
                </span>
                <h1 class="hero-title">
                  {{ slide.title }}
                  <template v-if="slide.title_sub">
                    <br>
                    <span class="hero-title-sub">{{ slide.title_sub }}</span>
                  </template>
                </h1>
                <p class="hero-desc">{{ slide.description }}</p>
                <div class="hero-actions">
                  <router-link :to="slide.link" class="hero-btn-white">
                    {{ slide.button_text }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </transition-group>

        <!-- Carousel Navigation Controls (Arrows) -->
        <template v-if="displayHeroSlides.length > 1">
          <!-- Right Arrow ("يلف يمين") -->
          <button 
            type="button"
            class="hero-nav-arrow hero-arrow-right" 
            @click="currentLang === 'ar' ? nextHeroSlide() : prevHeroSlide()" 
            :aria-label="currentLang === 'ar' ? 'التالي' : 'Next'"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>

          <!-- Left Arrow -->
          <button 
            type="button"
            class="hero-nav-arrow hero-arrow-left" 
            @click="currentLang === 'ar' ? prevHeroSlide() : nextHeroSlide()" 
            :aria-label="currentLang === 'ar' ? 'السابق' : 'Previous'"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <!-- Indicators / Dots -->
          <div class="hero-indicators">
            <button
              v-for="(slide, idx) in displayHeroSlides"
              :key="idx"
              type="button"
              class="hero-dot"
              :class="{ active: currentHeroIndex === idx }"
              @click="goToHeroSlide(idx)"
              :aria-label="`Slide ${idx + 1}`"
            ></button>
          </div>
        </template>
      </section>
    </div>

    <!-- 2. Trust Bar (Features directly below Hero) -->
    <section class="trust-bar-section">
      <div class="container trust-bar-container">
        <div class="trust-item" v-for="(feat, idx) in trustFeatures" :key="idx">
          <div class="trust-icon-box">
            <!-- elements.svg: Shield with check -->
            <svg v-if="feat.id === 'warranty'" width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.2077 7.75241C14.5656 7.62565 14.753 7.23275 14.6262 6.87483C14.4995 6.51692 14.1066 6.32954 13.7486 6.4563C12.9832 6.7274 12.2392 7.24977 11.5736 7.83356C10.9008 8.4236 10.269 9.1112 9.72965 9.7577C9.24367 10.3403 8.8259 10.8977 8.51332 11.3347C8.19873 10.9071 7.88635 10.6197 7.5991 10.4282C7.57552 10.4124 7.55205 10.3963 7.52839 10.3801C7.31963 10.237 7.09581 10.0835 6.64756 10.0835C6.26786 10.0835 5.95733 10.3913 5.95733 10.771C5.95733 11.1354 6.24085 11.4336 6.59935 11.457C6.60269 11.4578 6.60743 11.459 6.61351 11.4607C6.64605 11.47 6.72426 11.4975 6.83639 11.5722C7.05932 11.7208 7.44569 12.0767 7.86324 12.9118C7.97405 13.1334 8.19555 13.2783 8.443 13.291C8.69041 13.3036 8.92565 13.182 9.05854 12.9729C9.14019 12.8503 9.3825 12.4867 9.53523 12.2704C9.84118 11.8369 10.2747 11.2508 10.7855 10.6385C11.2976 10.0246 11.8791 9.39449 12.4802 8.86734C13.0884 8.33394 13.679 7.93964 14.2077 7.75241Z" fill="currentColor"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M9.39317 0C7.852 0 6.59907 0.520611 5.50628 1.08675C5.17605 1.25784 4.86927 1.42707 4.57611 1.58879C3.85887 1.98445 3.22318 2.33512 2.52508 2.55786L2.50178 2.56529C2.09176 2.69611 1.75186 2.80455 1.49434 2.90546C1.25196 3.00044 0.963896 3.1306 0.759513 3.35774C0.575922 3.56178 0.481604 3.79085 0.419068 4.00995C0.362299 4.20886 0.318832 4.45006 0.272279 4.7084L0.267222 4.73646C-0.867557 11.03 1.61385 16.9923 7.67343 19.3122L7.7036 19.3238C8.2992 19.5519 8.70769 19.7083 9.39618 19.7083C10.0847 19.7083 10.4931 19.5519 11.0887 19.3238L11.1189 19.3122C17.1783 16.9921 19.6572 11.0297 18.5221 4.73642L18.5171 4.70831C18.4705 4.44995 18.427 4.20871 18.3702 4.00981C18.3077 3.79068 18.2133 3.56159 18.0297 3.35754C17.8253 3.13041 17.5372 3.00029 17.2948 2.90534C17.0373 2.80447 16.6974 2.69609 16.2875 2.56535L16.2641 2.55791C15.5656 2.33515 14.9294 1.9844 14.2116 1.58867C13.9184 1.42698 13.6114 1.25778 13.2811 1.08674C12.1878 0.520622 10.9343 0 9.39317 0ZM2.94303 3.8678C3.77891 3.6011 4.59326 3.1518 5.35436 2.73188C5.62293 2.5837 5.88488 2.43918 6.13879 2.30764C7.15771 1.77976 8.1772 1.375 9.39317 1.375C10.6092 1.375 11.6293 1.77982 12.6489 2.30777C12.9029 2.43932 13.165 2.58383 13.4337 2.73199C14.1953 3.15193 15.0102 3.60123 15.8464 3.8679C16.2856 4.00797 16.5824 4.10299 16.7933 4.18562C16.9322 4.24 16.9925 4.27437 17.012 4.28579C17.0192 4.30042 17.0319 4.33063 17.048 4.38725C17.0837 4.51203 17.1155 4.68433 17.169 4.98048C18.2149 10.7796 15.9326 15.9967 10.6272 18.0281C10.0182 18.2613 9.81821 18.3333 9.39617 18.3333C8.97412 18.3333 8.7741 18.2613 8.16507 18.0281C2.85909 15.9967 0.574818 10.7793 1.6204 4.98045C1.67379 4.68435 1.70566 4.51209 1.74127 4.38733C1.75742 4.33073 1.77005 4.30052 1.77732 4.28589C1.79676 4.27448 1.85713 4.2401 1.99601 4.18568C2.20695 4.10302 2.50381 4.00794 2.94303 3.8678Z" fill="currentColor"/>
            </svg>

            <!-- checkmark-badge-01.svg: Star/seal badge with check -->
            <svg v-else-if="feat.id === 'quality'" width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.31897 13.6566C9.44547 13.8573 9.66548 13.9783 9.90106 13.9783L9.90196 13.9792C9.90838 13.9792 9.9148 13.979 9.92123 13.9788C9.92766 13.9785 9.93408 13.9783 9.9405 13.9783C10.1907 13.9636 10.4135 13.8151 10.5216 13.5896C10.5363 13.5566 12.1011 10.3428 14.0692 9.31799C14.4065 9.14199 14.5367 8.72673 14.3616 8.39031C14.1856 8.05298 13.7703 7.92282 13.4339 8.0979C11.7793 8.95865 10.4501 10.9221 9.7718 12.0854C9.20163 11.5556 8.61588 11.2329 8.58013 11.2136C8.24647 11.0321 7.83033 11.1559 7.64883 11.4886C7.46733 11.8214 7.58925 12.2385 7.922 12.4209C7.92223 12.421 7.92306 12.4215 7.92446 12.4223C7.97853 12.4529 8.88563 12.9668 9.31897 13.6566Z" fill="currentColor"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M8.67453 19.4335C9.23185 20.033 9.99447 20.8533 11.0009 20.8533C12.0073 20.8533 12.7699 20.033 13.3273 19.4335L13.3434 19.4162C13.4383 19.3144 13.5281 19.218 13.6088 19.1373C14.1157 18.6313 14.3623 18.5287 15.0782 18.5287C15.1837 18.5287 15.2968 18.5321 15.4136 18.5356L15.4256 18.536C16.1764 18.558 17.204 18.5873 17.8933 17.9044C18.5881 17.2151 18.5588 16.1801 18.5368 15.4248L18.5364 15.4124C18.5329 15.2958 18.5295 15.1828 18.5295 15.0774C18.5295 14.3615 18.6395 14.1067 19.1867 13.5594C20.262 12.4851 20.8542 11.892 20.8542 11C20.8542 10.1082 20.262 9.51603 19.1869 8.44088C18.6405 7.89363 18.5295 7.63863 18.5295 6.92271C18.5295 6.81735 18.5329 6.70434 18.5364 6.58773L18.5368 6.57533C18.5588 5.81908 18.5881 4.78508 17.8933 4.09483C17.2053 3.41327 16.1814 3.44203 15.431 3.46311L15.4265 3.46323L15.4092 3.46375C15.2936 3.46724 15.183 3.47057 15.0782 3.47057C14.4512 3.47057 14.0396 3.29275 13.5602 2.81333C12.4859 1.73808 11.8928 1.14587 11.0009 1.14587C10.109 1.14587 9.51688 1.73802 8.44174 2.81316C7.96232 3.29258 7.55056 3.47057 6.92356 3.47057C6.81799 3.47057 6.70651 3.46719 6.59074 3.46368L6.57614 3.46323C5.81989 3.44123 4.78589 3.4119 4.09564 4.10673C3.41272 4.79607 3.44204 5.82367 3.46404 6.5735L3.46456 6.59083C3.46805 6.70646 3.47138 6.81704 3.47138 6.92181C3.47138 7.54881 3.29356 7.9604 2.81414 8.43982C1.73889 9.51415 1.14673 10.1072 1.14673 10.9991C1.14673 11.8911 1.73889 12.4832 2.81413 13.5585C3.36047 14.1057 3.47138 14.3606 3.47138 15.0765C3.47138 15.1819 3.46795 15.2951 3.46441 15.4118L3.46404 15.4239C3.44204 16.1792 3.41273 17.2142 4.10848 17.9044C4.79782 18.5873 5.82539 18.558 6.57614 18.536L6.58824 18.5356C6.70496 18.5321 6.81812 18.5287 6.92356 18.5287C7.63948 18.5287 7.88696 18.6304 8.39296 19.1364C8.47821 19.2216 8.5737 19.3244 8.67453 19.4335ZM9.36464 18.1638C8.5983 17.3993 8.00523 17.1537 6.92356 17.1537L6.92173 17.1527C6.80434 17.1527 6.67928 17.1561 6.54987 17.1596L6.53488 17.1601C6.00413 17.1756 5.34507 17.194 5.07465 16.9263C4.80332 16.6559 4.82162 15.9941 4.83721 15.4615L4.83761 15.4467C4.84114 15.3172 4.84455 15.1921 4.84455 15.0746C4.84455 13.993 4.57231 13.3742 3.78398 12.585L3.77319 12.5742C2.99131 11.7914 2.51989 11.3194 2.51989 10.9973C2.51989 10.6737 2.99559 10.198 3.78384 9.4098C4.51718 8.67738 4.84455 7.90906 4.84455 6.91998C4.84455 6.8024 4.84118 6.67809 4.83768 6.54868L4.83721 6.53129C4.82162 6.00237 4.8024 5.34332 5.07098 5.0729C5.3414 4.80157 6.00323 4.81987 6.53582 4.83546L6.55075 4.83586C6.68018 4.83939 6.80522 4.8428 6.92262 4.8428C7.91079 4.8428 8.67897 4.51556 9.4123 3.78223C10.2006 2.9939 10.6764 2.51814 11 2.51814C11.3236 2.51814 11.7993 2.99384 12.5875 3.78209C13.3199 4.51543 14.0882 4.8428 15.0773 4.8428C15.1949 4.8428 15.3191 4.83943 15.4485 4.83593L15.466 4.83546C15.9949 4.81987 16.654 4.80065 16.9244 5.06923C17.1957 5.33965 17.1774 6.00148 17.1618 6.53407L17.1614 6.54919C17.1579 6.67855 17.1545 6.80352 17.1545 6.92087C17.1545 8.00254 17.4267 8.6213 18.2151 9.41056L18.2255 9.42103C19.0076 10.204 19.4792 10.6761 19.4792 10.9982C19.4792 11.3218 19.0181 11.7838 18.2151 12.5859C17.4121 13.388 17.1545 13.993 17.1545 15.0756C17.1545 15.1929 17.1579 15.3179 17.1614 15.4473L17.1618 15.4624C17.1774 15.9941 17.1967 16.6559 16.9244 16.9263C16.654 17.1949 15.994 17.1756 15.4641 17.1601L15.449 17.1596C15.3196 17.1561 15.1947 17.1527 15.0773 17.1527C13.9957 17.1527 13.4025 17.3984 12.6362 18.1638C12.5395 18.2606 12.4419 18.3654 12.339 18.4761L12.3162 18.5006C11.9316 18.9137 11.4066 19.4774 11.0009 19.4774C10.5939 19.4774 10.0668 18.9109 9.6818 18.4966C9.66634 18.4801 9.651 18.4637 9.63577 18.4474C9.54268 18.348 9.45366 18.2528 9.36464 18.1638Z" fill="currentColor"/>
            </svg>

            <!-- security-lock.svg: Shield with lock -->
            <svg v-else-if="feat.id === 'payment'" width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M8.7082 8.02821V8.94344C7.82489 9.22743 7.34618 9.973 7.21363 10.5032C7.16968 10.679 7.14652 10.916 7.13199 11.1392C7.1165 11.3771 7.10797 11.6515 7.10514 11.9279C7.09953 12.4744 7.11587 13.0669 7.15251 13.4333L7.15803 13.4885L7.17232 13.5421C7.47024 14.6593 8.25702 15.1613 9.00813 15.3145L9.04612 15.3223L9.08473 15.3257C9.53087 15.3654 11.096 15.3599 11.9343 15.357L11.936 15.357C12.0995 15.3564 12.2352 15.356 12.3295 15.3559C12.8498 15.3648 13.3856 15.2735 13.8487 14.9679C14.3253 14.6533 14.6413 14.1673 14.813 13.5489L14.8228 13.5139L14.8287 13.478C14.8666 13.2508 14.8931 12.6611 14.8965 12.1041C14.8983 11.8139 14.8939 11.5108 14.8797 11.2405C14.8662 10.9844 14.8418 10.7102 14.7901 10.5032L14.7838 10.4782L14.7757 10.4537C14.492 9.59715 13.8989 9.14514 13.3062 8.94947V8.02821C13.3062 6.7585 12.2769 5.72921 11.0072 5.72921C9.7375 5.72921 8.7082 6.7585 8.7082 8.02821ZM11.0072 7.10421C10.4969 7.10421 10.0832 7.5179 10.0832 8.02821V8.82743H11.9312V8.02821C11.9312 7.5179 11.5175 7.10421 11.0072 7.10421ZM9.4756 10.2024C8.87558 10.2024 8.60075 10.624 8.54758 10.8367C8.53652 10.8809 8.51843 11.0082 8.50409 11.2285C8.49071 11.434 8.48273 11.6821 8.48007 11.942C8.47501 12.4352 8.48935 12.9364 8.51535 13.2389C8.59338 13.499 8.70952 13.6539 8.82268 13.7523C8.93898 13.8535 9.08249 13.9209 9.24623 13.9593C9.6719 13.989 11.0404 13.9847 11.8706 13.982C12.0592 13.9814 12.22 13.9809 12.3356 13.9809L12.3485 13.9811C12.706 13.9878 12.9376 13.9218 13.0913 13.8203C13.2282 13.7299 13.3739 13.5652 13.4767 13.2209C13.4939 13.0729 13.5183 12.6215 13.5216 12.0957C13.5232 11.8222 13.519 11.5478 13.5066 11.3128C13.4947 11.0876 13.477 10.9361 13.4611 10.8588C13.2811 10.3516 12.8838 10.2024 12.5556 10.2024H9.4756Z" fill="currentColor"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M10.9982 1.14587C9.45708 1.14587 8.20414 1.66648 7.11135 2.23262C6.78112 2.40371 6.47433 2.57294 6.18118 2.73466C5.46393 3.13032 4.82825 3.48099 4.13014 3.70373L4.10674 3.7112C3.69677 3.842 3.35691 3.95043 3.09941 4.05134C2.85703 4.14632 2.56896 4.27647 2.36458 4.50362C2.18099 4.70766 2.08667 4.93672 2.02414 5.15583C1.96737 5.35473 1.9239 5.59593 1.87735 5.85427L1.87229 5.88233C0.73751 12.1759 3.21892 18.1382 9.27851 20.4581L9.30881 20.4697C9.90435 20.6978 10.3128 20.8542 11.0013 20.8542C11.6898 20.8542 12.0983 20.6977 12.694 20.4696L12.7239 20.4581C18.7833 18.138 21.2623 12.1756 20.1272 5.8823L20.1222 5.85423C20.0756 5.59584 20.0321 5.3546 19.9753 5.15568C19.9127 4.93656 19.8184 4.70748 19.6348 4.50344C19.4304 4.27628 19.1423 4.14616 18.8999 4.05121C18.6424 3.95034 18.3025 3.84196 17.8925 3.71122L17.8692 3.70378C17.1707 3.48103 16.5345 3.13027 15.8167 2.73454C15.5234 2.57286 15.2165 2.40365 14.8862 2.23262C13.7929 1.6665 12.5394 1.14587 10.9982 1.14587ZM4.5481 5.01367C5.38397 4.74697 6.19833 4.29767 6.95943 3.87775C7.228 3.72958 7.48994 3.58506 7.74386 3.45351C8.76279 2.92563 9.78228 2.52087 10.9982 2.52087C12.2143 2.52087 13.2343 2.92569 14.2539 3.45364C14.508 3.58519 14.7701 3.7297 15.0388 3.87787C15.8004 4.29782 16.6152 4.74711 17.4514 5.01378C17.8906 5.15384 18.1875 5.24887 18.3984 5.3315C18.5372 5.38588 18.5976 5.42025 18.6171 5.43166C18.6243 5.44629 18.637 5.47651 18.6531 5.53313C18.6887 5.65792 18.7206 5.83021 18.7741 6.12635C19.82 11.9254 17.5377 17.1426 12.2323 19.174C11.6234 19.4072 11.4233 19.4792 11.0013 19.4792C10.5792 19.4792 10.3792 19.4072 9.77014 19.174C4.46417 17.1426 2.17988 11.9252 3.22547 6.12632C3.27886 5.83022 3.31073 5.65796 3.34634 5.53321C3.36249 5.4766 3.37512 5.4464 3.38239 5.43177C3.40183 5.42035 3.4622 5.38597 3.60108 5.33155C3.81202 5.24889 4.10888 5.15381 4.5481 5.01367ZM3.38746 5.42248C3.38873 5.42098 3.38933 5.42002 3.38931 5.41991C3.3893 5.41985 3.38908 5.42008 3.38865 5.42068C3.38835 5.4211 3.38795 5.42169 3.38746 5.42248Z" fill="currentColor"/>
            </svg>

            <!-- truck-delivery.svg: Delivery truck -->
            <svg v-else-if="feat.id === 'delivery'" width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M11.179 4.45501C10.8944 4.36255 10.5189 4.35407 9.44167 4.35407L1.83334 4.35407C1.45364 4.35407 1.14584 4.04626 1.14584 3.66657C1.14584 3.28687 1.45364 2.97907 1.83334 2.97907L9.56909 2.97904C10.4692 2.97868 11.0842 2.97844 11.6039 3.14731C12.4619 3.4261 13.168 4.02785 13.5819 4.81234L14.9952 4.81234C15.6333 4.81232 16.1628 4.81231 16.5989 4.85635C17.0581 4.90272 17.4694 5.00198 17.8576 5.23384C18.2458 5.46571 18.5282 5.78076 18.7867 6.16314C19.0322 6.52621 19.2833 6.99246 19.5858 7.55423L20.7667 9.74741C20.7942 9.79647 20.8159 9.84925 20.8308 9.9048C20.8478 9.96799 20.8554 10.0324 20.8542 10.0961L20.8542 11.9658C20.8542 13.0042 20.8542 13.8528 20.7641 14.5228C20.67 15.223 20.4662 15.8302 19.9816 16.3148C19.4636 16.8328 18.802 17.0326 18.028 17.1173C17.7526 18.211 16.7625 19.0207 15.5833 19.0207C14.4295 19.0207 13.4567 18.2454 13.1574 17.1874L8.84259 17.1874C8.54331 18.2454 7.57052 19.0207 6.41667 19.0207C5.23748 19.0207 4.2474 18.211 3.97201 17.1173C3.19802 17.0326 2.53638 16.8328 2.01841 16.3148C1.37596 15.6724 1.22302 14.8089 1.17194 13.7841C1.15304 13.4049 1.44514 13.0822 1.82436 13.0633C2.20359 13.0444 2.52633 13.3364 2.54524 13.7157C2.59438 14.7016 2.74054 15.0924 2.99069 15.3426C3.18183 15.5337 3.45513 15.6641 4.01334 15.7369C4.3366 14.7176 5.29037 13.979 6.41667 13.979C7.57057 13.979 8.54339 14.7543 8.84263 15.8124L13.1574 15.8124C13.4566 14.7543 14.4294 13.979 15.5833 13.979C16.7096 13.979 17.6634 14.7176 17.9867 15.7369C18.5449 15.6641 18.8182 15.5337 19.0093 15.3426C19.1959 15.156 19.3277 14.8874 19.4014 14.3395C19.4777 13.7719 19.4792 13.0163 19.4792 11.9166V10.7707L15.7508 10.7708C15.1744 10.7712 14.7284 10.7716 14.346 10.6474C13.5786 10.398 12.9769 9.79632 12.7275 9.02888C12.6033 8.6465 12.6037 8.20047 12.6041 7.62408L12.6042 7.51657C12.6042 6.43935 12.5957 6.0638 12.5032 5.77922C12.2992 5.15132 11.8069 4.65903 11.179 4.45501ZM19.0157 9.39574L18.3913 8.23616C18.0685 7.63676 17.8498 7.2322 17.6477 6.93336C17.4543 6.64739 17.3072 6.50667 17.1525 6.4143C16.9979 6.32193 16.8042 6.25907 16.4607 6.22439C16.1018 6.18815 15.6419 6.18734 14.9611 6.18734H13.9557C13.9795 6.52841 13.9794 6.92004 13.9792 7.38914L13.9792 7.51657C13.9792 8.25255 13.9877 8.45749 14.0352 8.60398C14.1486 8.95282 14.4221 9.22631 14.7709 9.33965C14.9174 9.38725 15.1224 9.39574 15.8583 9.39574H19.0157ZM5.27084 16.4998C5.27084 15.867 5.78384 15.354 6.41667 15.354C7.0495 15.354 7.5625 15.867 7.5625 16.4998C7.5625 17.1327 7.0495 17.6457 6.41667 17.6457C5.78384 17.6457 5.27084 17.1327 5.27084 16.4998ZM14.4375 16.4998C14.4375 15.867 14.9505 15.354 15.5833 15.354C16.2162 15.354 16.7292 15.867 16.7292 16.4998C16.7292 17.1327 16.2162 17.6457 15.5833 17.6457C14.9505 17.6457 14.4375 17.1327 14.4375 16.4998Z" fill="currentColor"/>
              <path d="M1.83334 6.64567C1.45364 6.64567 1.14584 6.95347 1.14584 7.33317C1.14584 7.71287 1.45364 8.02067 1.83334 8.02067L7.33334 8.02067C7.71303 8.02067 8.02084 7.71287 8.02084 7.33317C8.02084 6.95347 7.71303 6.64567 7.33334 6.64567L1.83334 6.64567Z" fill="currentColor"/>
              <path d="M1.14584 10.0832C1.14584 9.70347 1.45364 9.39567 1.83334 9.39567H5.5C5.8797 9.39567 6.1875 9.70347 6.1875 10.0832C6.1875 10.4629 5.8797 10.7707 5.5 10.7707H1.83334C1.45364 10.7707 1.14584 10.4629 1.14584 10.0832Z" fill="currentColor"/>
            </svg>

            <!-- customer-service-01.svg: Headset -->
            <svg v-else-if="feat.id === 'service'" width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M11 2.52087C7.24051 2.52087 4.35418 5.16927 4.35418 8.25004V8.49356C4.47278 8.47823 4.599 8.47461 4.73333 8.48547C5.06121 8.51198 5.37423 8.65524 5.70686 8.80746L5.78398 8.8427L5.84392 8.86992C6.09389 8.98326 6.33876 9.09429 6.53408 9.26414C7.10505 9.76069 7.10451 10.4161 7.1042 10.795V14.872C7.10451 15.251 7.10505 15.9064 6.53408 16.403C6.33893 16.5727 6.09432 16.6836 5.84458 16.7969L5.78398 16.8244L5.70694 16.8596C5.37455 17.0117 5.06099 17.1551 4.73333 17.1817C3.77538 17.2591 3.23878 16.6057 2.92353 16.2218L2.89778 16.1905C2.81787 16.0934 2.71949 15.9794 2.61326 15.8563C2.41904 15.6312 2.19855 15.3757 2.01672 15.1378C1.71638 14.7447 1.41541 14.2737 1.26591 13.7265C1.10582 13.1405 1.10582 12.5267 1.26591 11.9406C1.37439 11.5435 1.57067 11.1931 1.82978 10.8252C2.08052 10.4693 2.41827 10.059 2.83587 9.55182L2.8537 9.53016C2.8707 9.50952 2.8885 9.48761 2.90714 9.46467C2.92975 9.43684 2.95403 9.40695 2.97918 9.37649V8.25004C2.97918 4.24315 6.65933 1.14587 11 1.14587C15.3407 1.14587 19.0208 4.24315 19.0208 8.25004V9.37185C19.0396 9.39547 19.0575 9.41822 19.0739 9.43905L19.0763 9.44205C19.1062 9.47997 19.1313 9.51174 19.1463 9.52999L19.1633 9.55057C19.5813 10.0583 19.9193 10.4688 20.1703 10.825C20.4293 11.1929 20.6257 11.5433 20.7341 11.9404C20.8942 12.5265 20.8942 13.1403 20.7341 13.7263C20.5846 14.2735 20.2837 14.7445 19.9833 15.1376C19.8015 15.3756 19.581 15.631 19.3868 15.8561C19.2805 15.9792 19.1822 16.0932 19.1023 16.1903L19.0494 16.2546C19.0384 16.268 19.0275 16.2814 19.0165 16.2947C18.9813 17.313 18.7303 18.1496 18.2686 18.8175C17.7686 19.5407 17.0661 20.0012 16.283 20.2948C14.7905 20.8545 12.8539 20.8544 11.0865 20.8542H11C10.6203 20.8542 10.3125 20.5464 10.3125 20.1667C10.3125 19.787 10.6203 19.4792 11 19.4792C12.8762 19.4792 14.5672 19.4698 15.8003 19.0073C16.3923 18.7854 16.8356 18.4723 17.1376 18.0355C17.2948 17.8082 17.4257 17.53 17.5153 17.185C17.4326 17.1893 17.3495 17.1882 17.2667 17.1815C16.9392 17.1549 16.6264 17.0119 16.294 16.8599L16.216 16.8242L16.1563 16.7973C15.8298 16.6515 15.2142 16.3765 14.9797 15.6825C14.8945 15.43 14.8951 15.1602 14.8958 14.9092L14.8959 14.8459V10.8207L14.8958 10.7576C14.8951 10.5065 14.8945 10.2366 14.9797 9.98429C15.2142 9.29029 15.8298 9.01525 16.1563 8.86939C16.1774 8.85991 16.1974 8.85099 16.216 8.84252L16.293 8.80732C16.6257 8.65508 16.9388 8.51181 17.2667 8.48529C17.3933 8.47505 17.5204 8.47777 17.6458 8.4932V8.25004C17.6458 5.16927 14.7595 2.52087 11 2.52087ZM17.7672 10.0152C17.7112 9.95604 17.6728 9.92689 17.6467 9.91224C17.5711 9.86979 17.4761 9.84784 17.3775 9.85582C17.3229 9.86024 17.2473 9.88372 16.786 10.0938C16.5845 10.1856 16.4714 10.2384 16.3842 10.3016C16.3177 10.3498 16.2962 10.3836 16.2826 10.4237C16.2815 10.4286 16.2781 10.4466 16.2755 10.489C16.2711 10.5599 16.2709 10.6542 16.2709 10.8207V14.8459C16.2709 15.0126 16.2711 15.1069 16.2755 15.1777C16.2781 15.2201 16.2815 15.2382 16.2826 15.243C16.2962 15.2832 16.3177 15.3169 16.3842 15.3651C16.4714 15.4284 16.5845 15.4812 16.786 15.5729C17.2473 15.783 17.3229 15.8065 17.3775 15.8109C17.4761 15.8189 17.5711 15.797 17.6467 15.7545C17.6814 15.735 17.7282 15.6959 18.0408 15.3163C18.1651 15.1651 18.2813 15.0312 18.3933 14.9021L18.4005 14.8938C18.5681 14.7004 18.7267 14.5174 18.8908 14.3028C19.1475 13.9667 19.3265 13.6614 19.4077 13.3639C19.503 13.0151 19.503 12.6516 19.4077 12.3028C19.358 12.1208 19.259 11.9191 19.0462 11.617C18.8285 11.3079 18.5237 10.9371 18.0848 10.4039C18.022 10.3277 17.9808 10.2746 17.9449 10.2282C17.9189 10.1946 17.8956 10.1646 17.8687 10.1318C17.8307 10.0969 17.7966 10.0578 17.7672 10.0152ZM4.34594 9.94022C4.22346 10.0319 4.10851 10.1694 3.91522 10.4041C3.47629 10.9372 3.1715 11.3081 2.95388 11.6171C2.74105 11.9193 2.64203 12.1209 2.5923 12.303C2.49703 12.6518 2.49703 13.0153 2.5923 13.3641C2.67356 13.6616 2.85249 13.9669 3.10926 14.303C3.2741 14.5186 3.43349 14.7024 3.60202 14.8968L3.60279 14.8977C3.71598 15.0282 3.83343 15.1636 3.9593 15.3165C4.13804 15.5336 4.24948 15.6586 4.36018 15.7374C4.44216 15.7957 4.51137 15.8201 4.62249 15.8111C4.67712 15.8067 4.75274 15.7832 5.21404 15.5731C5.56567 15.413 5.60805 15.386 5.63177 15.3654C5.67282 15.3297 5.68961 15.3002 5.70332 15.2448C5.72352 15.1629 5.72918 15.0543 5.72918 14.8461V10.8209C5.72918 10.6128 5.72352 10.5041 5.70332 10.4224C5.68961 10.3669 5.67282 10.3374 5.63177 10.3017C5.60805 10.281 5.56567 10.2541 5.21404 10.094C4.75274 9.8839 4.67712 9.86041 4.62249 9.85599C4.50886 9.84681 4.43637 9.87256 4.34594 9.94022Z" fill="currentColor"/>
            </svg>
          </div>
          <span class="trust-title">{{ feat.title }}</span>
        </div>
      </div>
    </section>

    <!-- 3. Shop by Category (تسوق حسب التصنيف) -->
    <section class="home-section categories-section container">
      <div class="section-header-flex">
        <div class="section-title-wrap">
          <h2 class="section-title">{{ t('home.shop_by_category') }}</h2>
          <p class="section-subtitle">{{ t('home.discover_categories') }}</p>
        </div>
        <div class="section-nav-actions">
          <button class="nav-circle-btn" @click="scrollSlider(categoriesSliderRef, 'right')" aria-label="Previous">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
          <button class="nav-circle-btn" @click="scrollSlider(categoriesSliderRef, 'left')" aria-label="Next">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="category-cards-slider" ref="categoriesSliderRef">
        <router-link 
          v-for="cat in displayCategories" 
          :key="cat.id" 
          :to="cat.link"
          class="category-portrait-card"
        >
          <div class="card-bg-image" :style="{ backgroundImage: `url(${cat.image}), url(/catalog_images/cat_${cat.id}.jpg), url(/images/home/cat_cookers.png)` }"></div>
          <div class="card-gradient-overlay"></div>
          <div class="card-bottom-content">
            <span class="card-count">{{ cat.countText }}</span>
            <div class="card-title-row">
              <h3 class="card-title">{{ cat.name }}</h3>
              <div class="card-circle-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </section>

    <!-- 4. Featured Products (منتجات مميزة) -->
    <section class="home-section featured-products-section container">
      <div class="section-header-flex">
        <div class="section-title-wrap">
          <h2 class="section-title">{{ t('home.featured_products') }}</h2>
          <p class="section-subtitle">{{ t('home.featured_products_subtitle') }}</p>
        </div>
        <router-link to="/products" class="view-all-link">
          <span>{{ t('home.view_all') }}</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline :points="currentLang === 'ar' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'"/>
          </svg>
        </router-link>
      </div>

      <div class="products-grid-four">
        <product-card 
          v-for="product in displayFeaturedProducts" 
          :key="product.id" 
          :product="product" 
          @click="goToProduct(product)" 
          @add-to-cart="addToCart(product)" 
        />
      </div>
    </section>

    <!-- 5. Special Offers (العروض المميزة) -->
    <section class="home-section offers-section container">
      <div class="section-header-flex">
        <div class="section-title-wrap">
          <h2 class="section-title">{{ t('home.featured_offers') }}</h2>
          <p class="section-subtitle">{{ t('home.featured_offers_subtitle') }}</p>
        </div>
        <div class="section-nav-actions">
          <button class="nav-circle-btn" @click="scrollSlider(offersSliderRef, 'right')" aria-label="Previous">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
          <button class="nav-circle-btn" @click="scrollSlider(offersSliderRef, 'left')" aria-label="Next">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="offers-cards-slider" ref="offersSliderRef">
        <router-link 
          v-for="offer in displayOffers" 
          :key="offer.id" 
          :to="offer.link"
          class="offer-portrait-card"
        >
          <div class="card-bg-image" :style="{ backgroundImage: `url(${offer.image}), url(/catalog_images/prod_${offer.id || 173}_0.jpg), url(/images/home/offer_clearance_pro.jpg)` }"></div>
          <div class="card-gradient-overlay"></div>
          <div class="card-bottom-content">
            <span class="card-count">{{ offer.badgeText }}</span>
            <div class="card-title-row">
              <h3 class="card-title">{{ offer.title }}</h3>
              <div class="card-circle-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </section>

    <!-- 6. New Arrivals (وصل حديثاً) -->
    <section class="home-section new-arrivals-section container">
      <div class="section-header-flex">
        <div class="section-title-wrap">
          <h2 class="section-title">{{ t('home.new_arrivals') }}</h2>
          <p class="section-subtitle">{{ t('home.new_arrivals_subtitle') }}</p>
        </div>
        <router-link to="/products?sort_by=created_at&sort_direction=desc" class="view-all-link">
          <span>{{ t('home.view_all') }}</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline :points="currentLang === 'ar' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'"/>
          </svg>
        </router-link>
      </div>

      <div class="products-grid-four">
        <product-card 
          v-for="product in displayNewArrivals" 
          :key="product.id" 
          :product="product" 
          @click="goToProduct(product)" 
          @add-to-cart="addToCart(product)" 
        />
      </div>
    </section>

    <!-- 7. Why Mastergas (لماذا Mastergas؟) -->
    <section class="why-mastergas-section">
      <div class="container">
        <div class="why-header-center">
          <h2 class="section-title">{{ t('home.why_mastergas') }}</h2>
          <p class="section-subtitle">{{ t('home.why_mastergas_subtitle') }}</p>
        </div>

        <div class="why-cards-row">
          <div class="why-card-item" v-for="(item, idx) in whyItems" :key="idx">
            <div class="why-icon-circle">
              <span class="why-icon-inner" v-html="item.svg"></span>
            </div>
            <h3 class="why-card-title">{{ item.title }}</h3>
            <p class="why-card-desc">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { cartState } from '../../store/cart';
import { useLocalized } from '../../composables/useLocalized';
import { useSettings } from '../../composables/useSettings';
import { useOffers } from '../../composables/useOffers';
import { useSEO } from '../../composables/useSEO';
import ProductCard from '../../components/ProductCard.vue';
import { products as fallbackProducts, categories as fallbackCategories, offers as fallbackOffers } from '../../data/catalogData';
import { productService } from '../../services/productService';
import { settingsService } from '../../services/settingsService';

const router = useRouter();
const { t, locale } = useI18n();
const { localized } = useLocalized();
const { currency, fetchSettings } = useSettings();
const { fetchOffers: fetchSharedOffers } = useOffers();
const currentLang = computed(() => locale.value);

useSEO({
  title: 'ماسترجاز (Mastergas) - أجهزة مطبخ بمعايير إيطالية فاخرة',
  description: 'تسوق أفضل مواقد الغاز الإيطالية، أفران البلت إن، وشفاطات المطابخ الفاخرة بأعلى معايير الأمان والجودة وضمان شامل معتمد.',
  keywords: 'ماسترجاز, أجهزة مطبخ, مواقد غاز, أفران بلت إن, شفاطات إيطالية, ميكروويف بلت إن, Mastergas, أجهزة إيطالية'
});

const categoriesSliderRef = ref(null);
const offersSliderRef = ref(null);

const rawProducts = ref([]);
const rawCategories = ref([]);
const rawOffers = ref([]);
const rawSliders = ref([]);
const currentHeroIndex = ref(0);
const heroAutoplayTimer = ref(null);
const heroTransitionName = ref('slide-right');

const backendOrigin = (import.meta.env.VITE_API_BASE_URL || 'https://backend-mastergas.be-kite.com/api')
  .replace(/\/api\/?$/, '');

const normalizeSliderImage = (value) => {
  if (!value) return defaultHeroSlide.image;
  return normalizeStorageImage(value, defaultHeroSlide.image);
};

const normalizeStorageImage = (value, fallback = value) => {
  if (!value) return fallback;
  const raw = String(value);
  if (raw.startsWith('/storage/')) return `${backendOrigin}/public${raw}`;
  if (raw.includes('/storage/') && !raw.includes('/public/storage/')) {
    return raw.replace('/storage/', '/public/storage/');
  }
  return raw;
};

const defaultHeroSlide = {
  id: 0,
  tag: 'أجهزة طهي متطورة',
  tag_en: 'Advanced Cooking Appliances',
  title: 'أجهزة مطبخ',
  title_sub: 'بمعايير إيطالية فاخرة',
  title_en: 'Kitchen Appliances',
  title_sub_en: 'With Italian Standards',
  description: 'تصميم عصري وموثوقية لا تضاهى - صنعت لتلبي أعلى المعايير الفندقية والمنزلية مع أمان كامل',
  description_en: 'Modern design - unmatched reliability - crafted to meet the highest hospitality and home standards',
  image: '/images/home/hero_pristine.png',
  link: '/products',
  button_text: 'استكشف التشكيلة',
  button_text_en: 'Explore Collection'
};

const displayHeroSlides = computed(() => {
  if (rawSliders.value && rawSliders.value.length > 0) {
    const isAr = currentLang.value === 'ar';
    return rawSliders.value.map((s, idx) => {
      const title = isAr
        ? (s.title_i18n?.ar || localized(s, 'title') || s.title || '')
        : (s.title_i18n?.en || s.title_en || localized(s, 'title') || s.title || '');
      const desc = isAr
        ? (s.description_i18n?.ar || localized(s, 'description') || s.description || '')
        : (s.description_i18n?.en || s.description_en || localized(s, 'description') || s.description || '');
      const btnText = isAr
        ? (s.button_text_i18n?.ar || s.button_text || 'استكشف التشكيلة')
        : (s.button_text_i18n?.en || s.button_text_en || 'Explore Collection');

      return {
        id: s.id || idx,
        tag: isAr ? 'معايير إيطالية فاخرة' : 'Luxury Italian Standards',
        title: title,
        title_sub: '',
        description: desc,
        image: normalizeSliderImage(s.image),
        link: s.link || '/products',
        button_text: btnText
      };
    });
  }
  return [{
    ...defaultHeroSlide,
    tag: currentLang.value === 'ar' ? defaultHeroSlide.tag : defaultHeroSlide.tag_en,
    title: currentLang.value === 'ar' ? defaultHeroSlide.title : defaultHeroSlide.title_en,
    title_sub: currentLang.value === 'ar' ? defaultHeroSlide.title_sub : defaultHeroSlide.title_sub_en,
    description: currentLang.value === 'ar' ? defaultHeroSlide.description : defaultHeroSlide.description_en,
    button_text: currentLang.value === 'ar' ? defaultHeroSlide.button_text : defaultHeroSlide.button_text_en
  }];
});

const nextHeroSlide = () => {
  heroTransitionName.value = 'slide-right';
  if (currentHeroIndex.value >= displayHeroSlides.value.length - 1) {
    currentHeroIndex.value = 0;
  } else {
    currentHeroIndex.value++;
  }
};

const prevHeroSlide = () => {
  heroTransitionName.value = 'slide-left';
  if (currentHeroIndex.value <= 0) {
    currentHeroIndex.value = displayHeroSlides.value.length - 1;
  } else {
    currentHeroIndex.value--;
  }
};

const goToHeroSlide = (idx) => {
  heroTransitionName.value = idx > currentHeroIndex.value ? 'slide-right' : 'slide-left';
  currentHeroIndex.value = idx;
};

const startHeroAutoplay = () => {
  stopHeroAutoplay();
  if (displayHeroSlides.value.length > 1) {
    heroAutoplayTimer.value = setInterval(() => {
      nextHeroSlide();
    }, 4500);
  }
};

const stopHeroAutoplay = () => {
  if (heroAutoplayTimer.value) {
    clearInterval(heroAutoplayTimer.value);
    heroAutoplayTimer.value = null;
  }
};

// 1. Trust features below hero (matching exact order and text in mockup)
const trustFeatures = computed(() => {
  if (currentLang.value === 'en') {
    return [
      { id: 'warranty', title: 'Comprehensive Warranty' },
      { id: 'quality', title: 'Global Quality' },
      { id: 'payment', title: 'Secure Payment' },
      { id: 'delivery', title: 'Fast Delivery' },
      { id: 'service', title: 'After-Sales Service' }
    ];
  }
  return [
    { id: 'warranty', title: 'ضمان شامل' },
    { id: 'quality', title: 'جودة عالمية' },
    { id: 'payment', title: 'دفع آمن' },
    { id: 'delivery', title: 'توصيل سريع' },
    { id: 'service', title: 'خدمة ما بعد البيع' }
  ];
});

// Dynamic Categories fetched from API (/frontend/categories)
const displayCategories = computed(() => {
  if (!rawCategories.value.length) return [];
  return rawCategories.value.map(cat => {
    const isAr = currentLang.value === 'ar';
    const name = isAr 
      ? (cat.name_i18n?.ar || localized(cat, 'name') || cat.name)
      : (cat.name_i18n?.en || cat.name_en || localized(cat, 'name') || cat.name);
    const count = cat.products_count !== undefined ? cat.products_count : 0;
    const countText = isAr ? `${count} منتجات` : `${count} Products`;
    return {
      id: cat.id,
      name,
      countText,
      image: cat.image || '/images/home/cat_cookers.png',
      link: `/products?category_id=${cat.id}`
    };
  });
});

// Dynamic Special Offers (from /frontend/offers)
const displayOffers = computed(() => {
  if (!rawOffers.value.length) return [];
  return rawOffers.value.map(offer => {
    const isAr = currentLang.value === 'ar';
    const title = isAr
      ? (offer.name_i18n?.ar || localized(offer, 'name') || offer.name)
      : (offer.name_i18n?.en || offer.name_en || localized(offer, 'name') || offer.name);
    let badgeText = isAr ? 'عرض خاص' : 'Special Offer';
    if (offer.type === 'percentage' && offer.value) {
      badgeText = isAr ? `خصم ${Math.round(offer.value)}%` : `${Math.round(offer.value)}% OFF`;
    } else if (offer.value) {
      badgeText = isAr ? `خصم ${Math.round(offer.value)} دينار` : `Save ${Math.round(offer.value)}`;
    }
    return {
      id: offer.id,
      title,
      badgeText,
      image: normalizeStorageImage(offer.image, '/images/home/offer_clearance_pro.jpg'),
      link: `/offers?offer=${offer.id}`
    };
  });
});

const displayFeaturedProducts = computed(() => {
  return rawProducts.value.slice(0, 4);
});

const displayNewArrivals = computed(() => {
  return rawProducts.value.slice(4, 8);
});

// 4. Why Mastergas items matching the mockup exactly
const whyItems = computed(() => {
  if (currentLang.value === 'en') {
    return [
      {
        svg: `<svg width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.82 18.4874H12.33C14.82 18.4874 16.07 18.4874 17.2 17.8374C17.31 17.7774 17.42 17.7074 17.52 17.6374C18.5849 16.9108 19.1348 15.7287 20.1258 13.5979L20.14 13.5674C21.31 11.0574 21.89 9.79737 21.24 8.61736C21.16 8.48736 21.08 8.35737 20.98 8.23737C20.15 7.19737 18.74 7.19737 15.93 7.19737H15.53C15.09 7.19737 14.64 7.19737 14.54 7.15737C14.49 7.12737 14.45 7.07737 14.44 7.04737C14.4316 6.95515 14.5216 6.65911 14.6216 6.33012C14.6409 6.26669 14.6606 6.20203 14.68 6.13737L14.95 5.27737C14.9676 5.2171 14.9833 5.16377 14.9974 5.11579C15.0395 4.97271 15.0676 4.87724 15.09 4.78737C15.38 3.60737 15.19 2.37737 14.56 1.33737C14.5095 1.24487 14.445 1.15237 14.3305 0.988518C14.3089 0.957517 14.2855 0.923962 14.26 0.887369C14.16 0.737369 14.1 0.657368 14.05 0.597368C13.4 -0.132632 12.28 -0.202635 11.55 0.437365C11.5136 0.466498 11.4718 0.511548 11.3939 0.595692C11.3648 0.627078 11.3307 0.663902 11.29 0.707369L7.20001 5.23737L7.16278 5.2785C6.13744 6.41119 5.61631 6.98688 5.31 7.77737C5.28865 7.83246 5.26877 7.88765 5.25026 7.94316C4.58663 7.34885 3.71028 6.9873 2.75 6.9873C1.23 6.9873 0 8.2173 0 9.7373V15.7373C0 17.2573 1.23 18.4873 2.75 18.4873C3.97632 18.4873 5.06576 17.8977 5.7501 16.9866C5.85734 17.1392 5.97991 17.2823 6.12 17.4174C7.23 18.4874 8.76001 18.4874 11.82 18.4874ZM5 10.7373C5 9.4973 3.99 8.4873 2.75 8.4873C2.06 8.4873 1.5 9.04731 1.5 9.7373V15.7373C1.5 16.4273 2.06 16.9873 2.75 16.9873C3.99 16.9873 5 15.9773 5 14.7373V10.7373ZM12.54 1.55737C12.59 1.50737 12.65 1.48737 12.72 1.48737L12.73 1.46737C12.8 1.46737 12.88 1.49737 12.93 1.55737C12.9534 1.58079 12.9768 1.61639 13.0145 1.67369C13.0251 1.6898 13.0368 1.70762 13.05 1.72737C13.0958 1.79609 13.1343 1.8517 13.1672 1.8992C13.2205 1.97609 13.2591 2.03173 13.29 2.08737C13.72 2.78737 13.84 3.61737 13.65 4.40737C13.6385 4.46503 13.6203 4.5227 13.5955 4.60147C13.5772 4.65929 13.5554 4.72847 13.53 4.81737L13.26 5.68736L13.2532 5.70967C13.0075 6.51556 12.8714 6.96192 13.02 7.45737C13.14 7.84737 13.41 8.19737 13.76 8.41737C14.19 8.68736 14.67 8.68736 15.55 8.68736H15.95C18.13 8.68736 19.45 8.68737 19.83 9.16737C19.87 9.21737 19.91 9.27737 19.94 9.33737C20.2149 9.84793 19.6993 10.9658 18.8381 12.833L18.79 12.9374C18.7683 12.9837 18.747 13.0295 18.7258 13.0748C17.8486 14.9537 17.4026 15.9091 16.68 16.3974C16.61 16.4474 16.53 16.4974 16.46 16.5374C15.68 16.9874 14.56 16.9874 12.3401 16.9874H11.83C9.17002 16.9874 7.83998 16.9874 7.16998 16.3374C6.53998 15.7174 6.51001 14.5874 6.51001 11.8574V10.8874C6.51001 9.52787 6.51001 8.83727 6.71997 8.30737C6.92997 7.76737 7.39001 7.25737 8.32001 6.22737L12.44 1.66737C12.4706 1.63674 12.4937 1.60986 12.5117 1.58904C12.523 1.57587 12.5322 1.56512 12.54 1.55737Z" fill="currentColor"/></svg>`,
        title: 'Italian Quality',
        description: 'Reliable Italian design and engineering with precise international standards.'
      },
      {
        svg: `<svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8639 4.53991L13.0814 5.04704C13.2237 5.37871 13.3037 5.56147 13.3794 5.68918C13.4386 5.78888 13.4667 5.80487 13.4807 5.81279L13.482 5.81355C13.5069 5.82781 13.568 5.85657 13.7605 5.87413C13.9642 5.89271 14.234 5.89343 14.6609 5.89343H14.7501C15.1643 5.89343 15.5001 6.22922 15.5001 6.64343C15.5001 7.05765 15.1643 7.39343 14.7501 7.39343L14.6295 7.39343C14.2433 7.39345 13.9043 7.39347 13.6242 7.36793C13.3255 7.34068 13.0237 7.27983 12.7359 7.11485C12.4368 6.94334 12.2411 6.71036 12.0893 6.45443C12.0104 6.32133 11.9364 6.16928 11.8636 6.00764L10.9714 8.87793C10.9172 9.0529 10.8536 9.25799 10.7773 9.41526C10.7039 9.56676 10.4743 9.97703 9.95652 9.99899C9.45224 10.0204 9.18499 9.64808 9.09598 9.50956C9.00139 9.36236 8.91248 9.16636 8.83519 8.99596L8.4833 8.22142C8.33631 7.89791 8.25366 7.71942 8.17642 7.59465C8.11547 7.49619 8.08684 7.48018 8.07213 7.47195L8.07104 7.47133C8.04576 7.45712 7.98501 7.42921 7.79608 7.41218C7.59598 7.39414 7.33123 7.39343 6.91191 7.39343H6.75012C6.33591 7.39343 6.00012 7.05765 6.00012 6.64343C6.00012 6.22922 6.33591 5.89343 6.75012 5.89343L6.94287 5.89343C7.32206 5.89341 7.6552 5.8934 7.93074 5.91824C8.22492 5.94475 8.52187 6.00394 8.80632 6.16391C9.10168 6.33001 9.29764 6.55606 9.45182 6.80511C9.58042 7.01286 9.69779 7.26823 9.81842 7.53373L10.7185 4.63819C10.7745 4.45748 10.8392 4.24875 10.9161 4.08933C10.9875 3.9412 11.2187 3.51886 11.7457 3.50037C12.2611 3.48228 12.5251 3.87247 12.6094 4.01045C12.7019 4.16164 12.7881 4.36298 12.8639 4.53991Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.69812 1.05769e-06H14.8021C15.7006 -2.72069e-05 16.4498 -5.07757e-05 17.0446 0.0799145C17.6724 0.164319 18.2392 0.34999 18.6947 0.80546C19.1501 1.26093 19.3358 1.82773 19.4202 2.45552C19.5002 3.05031 19.5002 3.79953 19.5001 4.69801V12.6489L19.9116 13.408C20.6378 14.7475 21.1267 15.8137 21.3527 16.6986C21.5847 17.6076 21.5574 18.3995 21.1632 19.1156C20.7224 19.9161 19.9349 20.2282 19.0517 20.3665C18.198 20.5001 17.0597 20.5 15.6632 20.5H5.8369C4.44041 20.5 3.30202 20.5001 2.44838 20.3665C1.56509 20.2282 0.777617 19.9161 0.336874 19.1156C-0.0573747 18.3995 -0.0847232 17.6077 0.147312 16.6987C0.372796 15.8153 0.860335 14.7514 1.58433 13.4153L2.00012 12.6063L2.00012 4.698C2.00009 3.79952 2.00007 3.0503 2.08004 2.45552C2.16444 1.82773 2.35011 1.26093 2.80558 0.80546C3.26105 0.34999 3.82785 0.164319 4.45565 0.0799145C5.05042 -5.07757e-05 5.79966 -2.72069e-05 6.69812 1.05769e-06ZM3.50012 12H18.0001V4.75C18.0001 3.78599 17.9985 3.13843 17.9336 2.6554C17.8715 2.19393 17.7643 1.99644 17.634 1.86612C17.5037 1.7358 17.3062 1.62858 16.8447 1.56654C16.3617 1.5016 15.7141 1.5 14.7501 1.5H6.75012C5.78611 1.5 5.13855 1.5016 4.65552 1.56654C4.19405 1.62858 3.99656 1.7358 3.86624 1.86612C3.73592 1.99644 3.6287 2.19393 3.56666 2.6554C3.50172 3.13843 3.50012 3.78599 3.50012 4.75V12ZM2.91468 14.1083L3.22732 13.5H18.2553L18.593 14.1229C19.3097 15.4449 19.7219 16.3748 19.8993 17.0697C20.0705 17.7405 20.0033 18.1121 19.8491 18.3921C19.7414 18.5877 19.5276 18.7737 18.8197 18.8845C18.0959 18.9978 17.0761 19 15.5954 19H5.90463C4.42389 19 3.40412 18.9978 2.68031 18.8845C1.97239 18.7737 1.75859 18.5877 1.65088 18.3921C1.49669 18.1121 1.42948 17.7405 1.60071 17.0697C1.77808 16.3748 2.19027 15.4449 2.90697 14.1229L2.91468 14.1083Z" fill="currentColor"/></svg>`,
        title: 'Superior Performance',
        description: 'Engineering technologies ensuring optimal energy efficiency with maximum performance.'
      },
      {
        svg: `<svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.10389 10.3837C8.68967 10.3837 8.35389 10.7195 8.35389 11.1337C8.35389 11.5479 8.68967 11.8837 9.10389 11.8837L13.1039 11.8837C13.5181 11.8837 13.8539 11.5479 13.8539 11.1337C13.8539 10.7195 13.5181 10.3837 13.1039 10.3837L9.10389 10.3837Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M14.6457 0.383696L7.56247 0.383696C6.62839 0.383681 5.86715 0.38367 5.24729 0.451073C4.60002 0.521457 4.03792 0.670866 3.52396 1.01351C3.00999 1.35615 2.65589 1.81754 2.34197 2.38795C2.04134 2.93421 1.74857 3.63689 1.38932 4.49913L0.420739 6.82372C0.380816 6.91156 0.357338 7.00846 0.354238 7.11049C0.354004 7.11809 0.353886 7.12568 0.353886 7.13325L0.353886 12.6209C0.353869 14.5915 0.353856 16.1496 0.523791 17.3684C0.698814 18.6237 1.06684 19.6294 1.88503 20.4183C2.6994 21.2036 3.73099 21.5535 5.01959 21.7206C6.27806 21.8837 7.88926 21.8837 9.9377 21.8837L12.2701 21.8837C14.3185 21.8837 15.9297 21.8837 17.1882 21.7206C18.4768 21.5535 19.5084 21.2036 20.3227 20.4183C21.1409 19.6294 21.509 18.6237 21.684 17.3684C21.8539 16.1496 21.8539 14.5915 21.8539 12.6209L21.8539 7.15756C21.8568 7.06637 21.8431 6.97335 21.8109 6.88285C21.8059 6.86878 21.8005 6.85491 21.7947 6.84124L20.8188 4.49907C20.4596 3.6369 20.1668 2.93417 19.8662 2.38795C19.5523 1.81754 19.1982 1.35615 18.6842 1.01351C18.1702 0.670867 17.6081 0.521457 16.9609 0.451072C16.341 0.383669 15.5798 0.383682 14.6457 0.383696ZM7.60408 1.8837L10.3539 1.8837L10.3539 6.3837L2.22908 6.3837L2.75793 5.11447C3.13707 4.20454 3.39937 3.57766 3.6561 3.11118C3.90398 2.66076 4.11419 2.42279 4.35601 2.26158C4.59782 2.10037 4.89833 1.99786 5.40944 1.94228C5.93879 1.88472 6.61832 1.8837 7.60408 1.8837ZM11.8539 1.8837L11.8539 6.3837L19.9791 6.3837L19.4502 5.11447C19.0711 4.20454 18.8088 3.57767 18.5521 3.11118C18.3042 2.66076 18.094 2.42279 17.8522 2.26158C17.6103 2.10038 17.3098 1.99786 16.7987 1.94228C16.2694 1.88472 15.5898 1.8837 14.6041 1.8837L11.8539 1.8837ZM1.85389 7.8837L20.3539 7.8837L20.3539 12.5623C20.3539 14.6045 20.3522 16.058 20.1984 17.1613C20.0479 18.2401 19.7651 18.8723 19.2815 19.3386C18.7942 19.8085 18.1273 20.0863 16.9953 20.233C15.8445 20.3822 14.3306 20.3837 12.215 20.3837L9.99278 20.3837C7.87718 20.3837 6.36327 20.3822 5.21244 20.233C4.08047 20.0863 3.41361 19.8085 2.92624 19.3386C2.44268 18.8723 2.15983 18.2401 2.00942 17.1613C1.8556 16.058 1.85389 14.6045 1.85389 12.5623L1.85389 7.8837Z" fill="currentColor"/></svg>`,
        title: 'Modern Design',
        description: 'Architectural design lines enhancing the aesthetics of modern and luxurious kitchens.'
      },
      {
        svg: `<svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.74887 7.508V8.50644C6.78526 8.81624 6.26303 9.62959 6.11843 10.208C6.07049 10.3998 6.04523 10.6583 6.02937 10.9018C6.01247 11.1613 6.00317 11.4607 6.00008 11.7622C5.99396 12.3584 6.01178 13.0047 6.05176 13.4045L6.05778 13.4647L6.07336 13.5231C6.39837 14.7419 7.25668 15.2895 8.07607 15.4567L8.11751 15.4652L8.15963 15.4689C8.64633 15.5122 10.3537 15.5062 11.2683 15.503L11.2702 15.503C11.4485 15.5024 11.5966 15.5019 11.6994 15.5019C12.267 15.5116 12.8515 15.412 13.3567 15.0786C13.8766 14.7354 14.2213 14.2051 14.4087 13.5306L14.4193 13.4924L14.4258 13.4532C14.4671 13.2053 14.4961 12.5621 14.4998 11.9545C14.5017 11.6378 14.497 11.3072 14.4814 11.0123C14.4667 10.7329 14.4401 10.4338 14.3836 10.208L14.3768 10.1807L14.368 10.154C14.0584 9.21957 13.4114 8.72647 12.7649 8.51301V7.508C12.7649 6.12287 11.642 5 10.2569 5C8.87174 5 7.74887 6.12287 7.74887 7.508ZM10.2569 6.5C9.70017 6.5 9.24887 6.9513 9.24887 7.508V8.37988H11.2649V7.508C11.2649 6.9513 10.8136 6.5 10.2569 6.5ZM8.58604 9.87988C7.93147 9.87988 7.63166 10.3397 7.57364 10.5718C7.56159 10.62 7.54185 10.759 7.5262 10.9992C7.5116 11.2234 7.50291 11.494 7.5 11.7776C7.49448 12.3156 7.51012 12.8623 7.53849 13.1924C7.62362 13.4761 7.75031 13.6451 7.87375 13.7525C8.00063 13.8629 8.15718 13.9364 8.33582 13.9782C8.80018 14.0106 10.2931 14.0059 11.1988 14.0031C11.4045 14.0024 11.5799 14.0019 11.706 14.0019L11.7201 14.002C12.1101 14.0093 12.3627 13.9373 12.5304 13.8267C12.6798 13.7281 12.8387 13.5484 12.9508 13.1727C12.9696 13.0113 12.9963 12.5189 12.9998 11.9453C13.0016 11.6469 12.997 11.3475 12.9835 11.0912C12.9705 10.8455 12.9512 10.6802 12.9339 10.596C12.7375 10.0426 12.304 9.87988 11.946 9.87988H8.58604Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10.2471 0C8.56583 0 7.19899 0.567939 6.00686 1.18555C5.6466 1.37219 5.31193 1.5568 4.99212 1.73322C4.20967 2.16485 3.5162 2.5474 2.75463 2.79039L2.72909 2.79854C2.28186 2.94123 1.9111 3.05952 1.63019 3.16959C1.36578 3.27321 1.05152 3.41519 0.828558 3.663C0.62828 3.88559 0.525388 4.13547 0.457167 4.3745C0.395237 4.59148 0.347818 4.85461 0.297033 5.13643L0.291515 5.16704C-0.946427 12.0327 1.76057 18.537 8.37103 21.0679L8.40408 21.0806C9.05376 21.3294 9.49933 21.5 10.2504 21.5C11.0015 21.5 11.4472 21.3293 12.097 21.0804L12.1297 21.0679C18.7399 18.5368 21.4442 12.0325 20.206 5.16701L20.2005 5.13639C20.1496 4.85451 20.1022 4.59134 20.0403 4.37433C19.972 4.13529 19.8691 3.88539 19.6688 3.66279C19.4458 3.41499 19.1315 3.27304 18.8671 3.16946C18.5862 3.05942 18.2154 2.94118 17.7681 2.79856L17.7427 2.79045C16.9807 2.54744 16.2866 2.16479 15.5036 1.73309C15.1836 1.55671 14.8488 1.37212 14.4885 1.18554C13.2958 0.567953 11.9284 0 10.2471 0ZM3.21058 4.21941C4.12244 3.92847 5.01083 3.43833 5.84112 2.98023C6.13411 2.81859 6.41987 2.66093 6.69686 2.51742C7.80842 1.94156 8.92059 1.5 10.2471 1.5C11.5737 1.5 12.6865 1.94162 13.7988 2.51757C14.0759 2.66108 14.3618 2.81872 14.655 2.98035C15.4858 3.43848 16.3747 3.92862 17.2869 4.21953C17.7661 4.37233 18.0899 4.476 18.32 4.56613C18.4715 4.62546 18.5373 4.66295 18.5585 4.6754C18.5665 4.69137 18.5802 4.72433 18.5979 4.7861C18.6367 4.92223 18.6715 5.11018 18.7298 5.43325C19.8708 11.7595 17.3811 17.451 11.5933 19.6671C10.929 19.9214 10.7108 20 10.2504 20C9.78992 20 9.57177 19.9214 8.90735 19.6671C3.11902 17.451 0.627072 11.7593 1.76771 5.43322C1.82595 5.1102 1.86072 4.92228 1.89957 4.78618C1.91719 4.72443 1.93096 4.69148 1.9389 4.67552C1.96011 4.66307 2.02596 4.62556 2.17746 4.5662C2.40759 4.47602 2.73143 4.37229 3.21058 4.21941ZM1.94443 4.66539C1.94581 4.66375 1.94647 4.66271 1.94645 4.66259C1.94644 4.66252 1.94619 4.66278 1.94572 4.66342C1.9454 4.66388 1.94497 4.66452 1.94443 4.66539Z" fill="currentColor"/></svg>`,
        title: 'Safety First',
        description: 'Advanced smart safety systems ensuring the protection of your family and home.'
      },
      {
        svg: `<svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.4993 8.45717C15.8897 8.31889 16.0942 7.89027 15.9559 7.49982C15.8176 7.10937 15.389 6.90495 14.9985 7.04323C14.1635 7.33899 13.3519 7.90884 12.6257 8.5457C11.8917 9.18938 11.2025 9.93949 10.6142 10.6448C10.084 11.2803 9.62825 11.8884 9.28726 12.3651C8.94407 11.8987 8.60329 11.5851 8.28993 11.3762C8.2642 11.359 8.2386 11.3415 8.21279 11.3238C7.98505 11.1676 7.74088 11.0002 7.25188 11.0002C6.83767 11.0002 6.4989 11.336 6.4989 11.7502C6.4989 12.1477 6.80821 12.4731 7.19929 12.4986C7.20293 12.4994 7.2081 12.5007 7.21474 12.5026C7.25024 12.5127 7.33555 12.5427 7.45788 12.6242C7.70107 12.7864 8.12257 13.1746 8.57808 14.0856C8.69897 14.3274 8.9406 14.4854 9.21055 14.4992C9.48045 14.513 9.73708 14.3803 9.88204 14.1522C9.97112 14.0185 10.2355 13.6219 10.4021 13.3858C10.7358 12.913 11.2087 12.2736 11.766 11.6056C12.3247 10.9359 12.959 10.2485 13.6147 9.67346C14.2782 9.09157 14.9226 8.66142 15.4993 8.45717Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10.2471 0C8.56582 0 7.19898 0.567939 6.00685 1.18555C5.6466 1.37219 5.31193 1.5568 4.99212 1.73322C4.20967 2.16485 3.51619 2.5474 2.75463 2.79039L2.72921 2.7985C2.28192 2.94121 1.91112 3.05951 1.63019 3.1696C1.36577 3.27321 1.05152 3.4152 0.82856 3.66299C0.628279 3.88558 0.525386 4.13547 0.457166 4.3745C0.395235 4.59148 0.347817 4.85462 0.297032 5.13644L0.291515 5.16705C-0.946426 12.0327 1.76057 18.537 8.37102 21.0679L8.40392 21.0805C9.05368 21.3293 9.4993 21.5 10.2504 21.5C11.0015 21.5 11.4471 21.3293 12.0968 21.0805L12.1297 21.0679C18.7399 18.5369 21.4442 12.0324 20.206 5.167L20.2004 5.13634C20.1496 4.8545 20.1022 4.59132 20.0402 4.37433C19.972 4.13529 19.8691 3.88537 19.6687 3.66278C19.4458 3.41499 19.1315 3.27304 18.8671 3.16946C18.5862 3.05942 18.2154 2.94119 17.7682 2.79857L17.7427 2.79044C16.9807 2.54744 16.2866 2.1648 15.5036 1.7331C15.1837 1.55671 14.8489 1.37213 14.4885 1.18554C13.2958 0.567951 11.9284 0 10.2471 0ZM3.21058 4.21941C4.12244 3.92847 5.01083 3.43833 5.84112 2.98023C6.13411 2.81859 6.41986 2.66093 6.69686 2.51742C7.80842 1.94156 8.92059 1.5 10.2471 1.5C11.5737 1.5 12.6865 1.94162 13.7988 2.51757C14.0759 2.66107 14.3618 2.81872 14.655 2.98035C15.4858 3.43847 16.3747 3.92862 17.2869 4.21953C17.7661 4.37233 18.0899 4.47599 18.32 4.56613C18.4714 4.62546 18.5373 4.66295 18.5585 4.6754C18.5664 4.69136 18.5802 4.72432 18.5979 4.78609C18.6367 4.92222 18.6715 5.11018 18.7298 5.43325C19.8708 11.7595 17.3811 17.451 11.5933 19.667C10.929 19.9214 10.7108 20 10.2504 20C9.78995 20 9.57175 19.9214 8.90735 19.6671C3.11901 17.4509 0.627074 11.7593 1.76771 5.43322C1.82595 5.1102 1.86072 4.92228 1.89957 4.78618C1.91719 4.72443 1.93096 4.69148 1.93889 4.67552C1.96011 4.66307 2.02596 4.62556 2.17746 4.5662C2.40758 4.47602 2.73143 4.37229 3.21058 4.21941Z" fill="currentColor"/></svg>`,
        title: 'Comprehensive Warranty',
        description: 'Genuine, extended warranty on all appliances with original spare parts availability.'
      }
    ];
  }
  return [
    {
      svg: `<svg width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.82 18.4874H12.33C14.82 18.4874 16.07 18.4874 17.2 17.8374C17.31 17.7774 17.42 17.7074 17.52 17.6374C18.5849 16.9108 19.1348 15.7287 20.1258 13.5979L20.14 13.5674C21.31 11.0574 21.89 9.79737 21.24 8.61736C21.16 8.48736 21.08 8.35737 20.98 8.23737C20.15 7.19737 18.74 7.19737 15.93 7.19737H15.53C15.09 7.19737 14.64 7.19737 14.54 7.15737C14.49 7.12737 14.45 7.07737 14.44 7.04737C14.4316 6.95515 14.5216 6.65911 14.6216 6.33012C14.6409 6.26669 14.6606 6.20203 14.68 6.13737L14.95 5.27737C14.9676 5.2171 14.9833 5.16377 14.9974 5.11579C15.0395 4.97271 15.0676 4.87724 15.09 4.78737C15.38 3.60737 15.19 2.37737 14.56 1.33737C14.5095 1.24487 14.445 1.15237 14.3305 0.988518C14.3089 0.957517 14.2855 0.923962 14.26 0.887369C14.16 0.737369 14.1 0.657368 14.05 0.597368C13.4 -0.132632 12.28 -0.202635 11.55 0.437365C11.5136 0.466498 11.4718 0.511548 11.3939 0.595692C11.3648 0.627078 11.3307 0.663902 11.29 0.707369L7.20001 5.23737L7.16278 5.2785C6.13744 6.41119 5.61631 6.98688 5.31 7.77737C5.28865 7.83246 5.26877 7.88765 5.25026 7.94316C4.58663 7.34885 3.71028 6.9873 2.75 6.9873C1.23 6.9873 0 8.2173 0 9.7373V15.7373C0 17.2573 1.23 18.4873 2.75 18.4873C3.97632 18.4874 5.06576 17.8977 5.7501 16.9866C5.85734 17.1392 5.97991 17.2823 6.12 17.4174C7.23 18.4874 8.76001 18.4874 11.82 18.4874ZM5 10.7373C5 9.4973 3.99 8.4873 2.75 8.4873C2.06 8.4873 1.5 9.04731 1.5 9.7373V15.7373C1.5 16.4273 2.06 16.9873 2.75 16.9873C3.99 16.9873 5 15.9773 5 14.7373V10.7373ZM12.54 1.55737C12.59 1.50737 12.65 1.48737 12.72 1.48737L12.73 1.46737C12.8 1.46737 12.88 1.49737 12.93 1.55737C12.9534 1.58079 12.9768 1.61639 13.0145 1.67369C13.0251 1.6898 13.0368 1.70762 13.05 1.72737C13.0958 1.79609 13.1343 1.8517 13.1672 1.8992C13.2205 1.97609 13.2591 2.03173 13.29 2.08737C13.72 2.78737 13.84 3.61737 13.65 4.40737C13.6385 4.46503 13.6203 4.5227 13.5955 4.60147C13.5772 4.65929 13.5554 4.72847 13.53 4.81737L13.26 5.68736L13.2532 5.70967C13.0075 6.51556 12.8714 6.96192 13.02 7.45737C13.14 7.84737 13.41 8.19737 13.76 8.41737C14.19 8.68736 14.67 8.68736 15.55 8.68736H15.95C18.13 8.68736 19.45 8.68737 19.83 9.16737C19.87 9.21737 19.91 9.27737 19.94 9.33737C20.2149 9.84793 19.6993 10.9658 18.8381 12.833L18.79 12.9374C18.7683 12.9837 18.747 13.0295 18.7258 13.0748C17.8486 14.9537 17.4026 15.9091 16.68 16.3974C16.61 16.4474 16.53 16.4974 16.46 16.5374C15.68 16.9874 14.56 16.9874 12.3401 16.9874H11.83C9.17002 16.9874 7.83998 16.9874 7.16998 16.3374C6.53998 15.7174 6.51001 14.5874 6.51001 11.8574V10.8874C6.51001 9.52787 6.51001 8.83727 6.71997 8.30737C6.92997 7.76737 7.39001 7.25737 8.32001 6.22737L12.44 1.66737C12.4706 1.63674 12.4937 1.60986 12.5117 1.58904C12.523 1.57587 12.5322 1.56512 12.54 1.55737Z" fill="currentColor"/></svg>`,
      title: 'الجودة الإيطالية',
      description: 'تصميم وهندسة إيطالية موثوقة بمعايير عالمية دقيقة.'
    },
    {
      svg: `<svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8639 4.53991L13.0814 5.04704C13.2237 5.37871 13.3037 5.56147 13.3794 5.68918C13.4386 5.78888 13.4667 5.80487 13.4807 5.81279L13.482 5.81355C13.5069 5.82781 13.568 5.85657 13.7605 5.87413C13.9642 5.89271 14.234 5.89343 14.6609 5.89343H14.7501C15.1643 5.89343 15.5001 6.22922 15.5001 6.64343C15.5001 7.05765 15.1643 7.39343 14.7501 7.39343L14.6295 7.39343C14.2433 7.39345 13.9043 7.39347 13.6242 7.36793C13.3255 7.34068 13.0237 7.27983 12.7359 7.11485C12.4368 6.94334 12.2411 6.71036 12.0893 6.45443C12.0104 6.32133 11.9364 6.16928 11.8636 6.00764L10.9714 8.87793C10.9172 9.0529 10.8536 9.25799 10.7773 9.41526C10.7039 9.56676 10.4743 9.97703 9.95652 9.99899C9.45224 10.0204 9.18499 9.64808 9.09598 9.50956C9.00139 9.36236 8.91248 9.16636 8.83519 8.99596L8.4833 8.22142C8.33631 7.89791 8.25366 7.71942 8.17642 7.59465C8.11547 7.49619 8.08684 7.48018 8.07213 7.47195L8.07104 7.47133C8.04576 7.45712 7.98501 7.42921 7.79608 7.41218C7.59598 7.39414 7.33123 7.39343 6.91191 7.39343H6.75012C6.33591 7.39343 6.00012 7.05765 6.00012 6.64343C6.00012 6.22922 6.33591 5.89343 6.75012 5.89343L6.94287 5.89343C7.32206 5.89341 7.6552 5.8934 7.93074 5.91824C8.22492 5.94475 8.52187 6.00394 8.80632 6.16391C9.10168 6.33001 9.29764 6.55606 9.45182 6.80511C9.58042 7.01286 9.69779 7.26823 9.81842 7.53373L10.7185 4.63819C10.7745 4.45748 10.8392 4.24875 10.9161 4.08933C10.9875 3.9412 11.2187 3.51886 11.7457 3.50037C12.2611 3.48228 12.5251 3.87247 12.6094 4.01045C12.7019 4.16164 12.7881 4.36298 12.8639 4.53991Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.69812 1.05769e-06H14.8021C15.7006 -2.72069e-05 16.4498 -5.07757e-05 17.0446 0.0799145C17.6724 0.164319 18.2392 0.34999 18.6947 0.80546C19.1501 1.26093 19.3358 1.82773 19.4202 2.45552C19.5002 3.05031 19.5002 3.79953 19.5001 4.69801V12.6489L19.9116 13.408C20.6378 14.7475 21.1267 15.8137 21.3527 16.6986C21.5847 17.6076 21.5574 18.3995 21.1632 19.1156C20.7224 19.9161 19.9349 20.2282 19.0517 20.3665C18.198 20.5001 17.0597 20.5 15.6632 20.5H5.8369C4.44041 20.5 3.30202 20.5001 2.44838 20.3665C1.56509 20.2282 0.777617 19.9161 0.336874 19.1156C-0.0573747 18.3995 -0.0847232 17.6077 0.147312 16.6987C0.372796 15.8153 0.860335 14.7514 1.58433 13.4153L2.00012 12.6063L2.00012 4.698C2.00009 3.79952 2.00007 3.0503 2.08004 2.45552C2.16444 1.82773 2.35011 1.26093 2.80558 0.80546C3.26105 0.34999 3.82785 0.164319 4.45565 0.0799145C5.05042 -5.07757e-05 5.79966 -2.72069e-05 6.69812 1.05769e-06ZM3.50012 12H18.0001V4.75C18.0001 3.78599 17.9985 3.13843 17.9336 2.6554C17.8715 2.19393 17.7643 1.99644 17.634 1.86612C17.5037 1.62858 17.3062 1.62858 16.8447 1.56654C16.3617 1.5016 15.7141 1.5 14.7501 1.5H6.75012C5.78611 1.5 5.13855 1.5016 4.65552 1.56654C4.19405 1.62858 3.99656 1.7358 3.86624 1.86612C3.73592 1.99644 3.6287 2.19393 3.56666 2.6554C3.50172 3.13843 3.50012 3.78599 3.50012 4.75V12ZM2.91468 14.1083L3.22732 13.5H18.2553L18.593 14.1229C19.3097 15.4449 19.7219 16.3748 19.8993 17.0697C20.0705 17.7405 20.0033 18.1121 19.8491 18.3921C19.7414 18.5877 19.5276 18.7737 18.8197 18.8845C18.0959 18.9978 17.0761 19 15.5954 19H5.90463C4.42389 19 3.40412 18.9978 2.68031 18.8845C1.97239 18.7737 1.75859 18.5877 1.65088 18.3921C1.49669 18.1121 1.42948 17.7405 1.60071 17.0697C1.77808 16.3748 2.19027 15.4449 2.90697 14.1229L2.91468 14.1083Z" fill="currentColor"/></svg>`,
      title: 'الأداء المتفوق',
      description: 'تقنيات هندسية تضمن استهلاكاً مثالياً للطاقة بأقوى أداء ممكن.'
    },
    {
      svg: `<svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.10389 10.3837C8.68967 10.3837 8.35389 10.7195 8.35389 11.1337C8.35389 11.5479 8.68967 11.8837 9.10389 11.8837L13.1039 11.8837C13.5181 11.8837 13.8539 11.5479 13.8539 11.1337C13.8539 10.7195 13.5181 10.3837 13.1039 10.3837L9.10389 10.3837Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M14.6457 0.383696L7.56247 0.383696C6.62839 0.383681 5.86715 0.38367 5.24729 0.451073C4.60002 0.521457 4.03792 0.670866 3.52396 1.01351C3.00999 1.35615 2.65589 1.81754 2.34197 2.38795C2.04134 2.93421 1.74857 3.63689 1.38932 4.49913L0.420739 6.82372C0.380816 6.91156 0.357338 7.00846 0.354238 7.11049C0.354004 7.11809 0.353886 7.12568 0.353886 7.13325L0.353886 12.6209C0.353869 14.5915 0.353856 16.1496 0.523791 17.3684C0.698814 18.6237 1.06684 19.6294 1.88503 20.4183C2.6994 21.2036 3.73099 21.5535 5.01959 21.7206C6.27806 21.8837 7.88926 21.8837 9.9377 21.8837L12.2701 21.8837C14.3185 21.8837 15.9297 21.8837 17.1882 21.7206C18.4768 21.5535 19.5084 21.2036 20.3227 20.4183C21.1409 19.6294 21.509 18.6237 21.684 17.3684C21.8539 16.1496 21.8539 14.5915 21.8539 12.6209L21.8539 7.15756C21.8568 7.06637 21.8431 6.97335 21.8109 6.88285C21.8059 6.86878 21.8005 6.85491 21.7947 6.84124L20.8188 4.49907C20.4596 3.6369 20.1668 2.93417 19.8662 2.38795C19.5523 1.81754 19.1982 1.35615 18.6842 1.01351C18.1702 0.670867 17.6081 0.521457 16.9609 0.451072C16.341 0.383669 15.5798 0.383682 14.6457 0.383696ZM7.60408 1.8837L10.3539 1.8837L10.3539 6.3837L2.22908 6.3837L2.75793 5.11447C3.13707 4.20454 3.39937 3.57766 3.6561 3.11118C3.90398 2.66076 4.11419 2.42279 4.35601 2.26158C4.59782 2.10037 4.89833 1.99786 5.40944 1.94228C5.93879 1.88472 6.61832 1.8837 7.60408 1.8837ZM11.8539 1.8837L11.8539 6.3837L19.9791 6.3837L19.4502 5.11447C19.0711 4.20454 18.8088 3.57767 18.5521 3.11118C18.3042 2.66076 18.094 2.42279 17.8522 2.26158C17.6103 2.10038 17.3098 1.99786 16.7987 1.94228C16.2694 1.88472 15.5898 1.8837 14.6041 1.8837L11.8539 1.8837ZM1.85389 7.8837L20.3539 7.8837L20.3539 12.5623C20.3539 14.6045 20.3522 16.058 20.1984 17.1613C20.0479 18.2401 19.7651 18.8723 19.2815 19.3386C18.7942 19.8085 18.1273 20.0863 16.9953 20.233C15.8445 20.3822 14.3306 20.3837 12.215 20.3837L9.99278 20.3837C7.87718 20.3837 6.36327 20.3822 5.21244 20.233C4.08047 20.0863 3.41361 19.8085 2.92624 19.3386C2.44268 18.8723 2.15983 18.2401 2.00942 17.1613C1.8556 16.058 1.85389 14.6045 1.85389 12.5623L1.85389 7.8837Z" fill="currentColor"/></svg>`,
      title: 'التصميم العصري',
      description: 'خطوط تصميم معمارية أنيقة تعزز جمالية المطابخ الحديثة والفاخرة.'
    },
    {
      svg: `<svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.74887 7.508V8.50644C6.78526 8.81624 6.26303 9.62959 6.11843 10.208C6.07049 10.3998 6.04523 10.6583 6.02937 10.9018C6.01247 11.1613 6.00317 11.4607 6.00008 11.7622C5.99396 12.3584 6.01178 13.0047 6.05176 13.4045L6.05778 13.4647L6.07336 13.5231C6.39837 14.7419 7.25668 15.2895 8.07607 15.4567L8.11751 15.4652L8.15963 15.4689C8.64633 15.5122 10.3537 15.5062 11.2683 15.503L11.2702 15.503C11.4485 15.5024 11.5966 15.5019 11.6994 15.5019C12.267 15.5116 12.8515 15.412 13.3567 15.0786C13.8766 14.7354 14.2213 14.2051 14.4087 13.5306L14.4193 13.4924L14.4258 13.4532C14.4671 13.2053 14.4961 12.5621 14.4998 11.9545C14.5017 11.6378 14.497 11.3072 14.4814 11.0123C14.4667 10.7329 14.4401 10.4338 14.3836 10.208L14.3768 10.1807L14.368 10.154C14.0584 9.21957 13.4114 8.72647 12.7649 8.51301V7.508C12.7649 6.12287 11.642 5 10.2569 5C8.87174 5 7.74887 6.12287 7.74887 7.508ZM10.2569 6.5C9.70017 6.5 9.24887 6.9513 9.24887 7.508V8.37988H11.2649V7.508C11.2649 6.9513 10.8136 6.5 10.2569 6.5ZM8.58604 9.87988C7.93147 9.87988 7.63166 10.3397 7.57364 10.5718C7.56159 10.62 7.54185 10.759 7.5262 10.9992C7.5116 11.2234 7.50291 11.494 7.5 11.7776C7.49448 12.3156 7.51012 12.8623 7.53849 13.1924C7.62362 13.4761 7.75031 13.6451 7.87375 13.7525C8.00063 13.8629 8.15718 13.9364 8.33582 13.9782C8.80018 14.0106 10.2931 14.0059 11.1988 14.0031C11.4045 14.0024 11.5799 14.0019 11.706 14.0019L11.7201 14.002C12.1101 14.0093 12.3627 13.9373 12.5304 13.8267C12.6798 13.7281 12.8387 13.5484 12.9508 13.1727C12.9696 13.0113 12.9963 12.5189 12.9998 11.9453C13.0016 11.6469 12.997 11.3475 12.9835 11.0912C12.9705 10.8455 12.9512 10.6802 12.9339 10.596C12.7375 10.0426 12.304 9.87988 11.946 9.87988H8.58604Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10.2471 0C8.56583 0 7.19899 0.567939 6.00686 1.18555C5.6466 1.37219 5.31193 1.5568 4.99212 1.73322C4.20967 2.16485 3.5162 2.5474 2.75463 2.79039L2.72909 2.79854C2.28186 2.94123 1.9111 3.05952 1.63019 3.16959C1.36578 3.27321 1.05152 3.41519 0.828558 3.663C0.62828 3.88559 0.525388 4.13547 0.457167 4.3745C0.395237 4.59148 0.347818 4.85461 0.297033 5.13643L0.291515 5.16704C-0.946427 12.0327 1.76057 18.537 8.37103 21.0679L8.40408 21.0806C9.05376 21.3294 9.49933 21.5 10.2504 21.5C11.0015 21.5 11.4472 21.3293 12.097 21.0804L12.1297 21.0679C18.7399 18.5368 21.4442 12.0325 20.206 5.16701L20.2005 5.13639C20.1496 4.85451 20.1022 4.59134 20.0403 4.37433C19.972 4.13529 19.8691 3.88539 19.6688 3.66279C19.4458 3.41499 19.1315 3.27304 18.8671 3.16946C18.5862 3.05942 18.2154 2.94118 17.7681 2.79856L17.7427 2.79045C16.9807 2.54744 16.2866 2.16479 15.5036 1.73309C15.1836 1.55671 14.8488 1.37212 14.4885 1.18554C13.2958 0.567953 11.9284 0 10.2471 0ZM3.21058 4.21941C4.12244 3.92847 5.01083 3.43833 5.84112 2.98023C6.13411 2.81859 6.41987 2.66093 6.69686 2.51742C7.80842 1.94156 8.92059 1.5 10.2471 1.5C11.5737 1.5 12.6865 1.94162 13.7988 2.51757C14.0759 2.66108 14.3618 2.81872 14.655 2.98035C15.4858 3.43848 16.3747 3.92862 17.2869 4.21953C17.7661 4.37233 18.0899 4.476 18.32 4.56613C18.4715 4.62546 18.5373 4.66295 18.5585 4.6754C18.5665 4.69137 18.5802 4.72433 18.5979 4.7861C18.6367 4.92223 18.6715 5.11018 18.7298 5.43325C19.8708 11.7595 17.3811 17.451 11.5933 19.6671C10.929 19.9214 10.7108 20 10.2504 20C9.78992 20 9.57177 19.9214 8.90735 19.6671C3.11902 17.451 0.627072 11.7593 1.76771 5.43322C1.82595 5.1102 1.86072 4.92228 1.89957 4.78618C1.91719 4.72443 1.93096 4.69148 1.9389 4.67552C1.96011 4.66307 2.02596 4.62556 2.17746 4.5662C2.40759 4.47602 2.73143 4.37229 3.21058 4.21941ZM1.94443 4.66539C1.94581 4.66375 1.94647 4.66271 1.94645 4.66259C1.94644 4.66252 1.94619 4.66278 1.94572 4.66342C1.9454 4.66388 1.94497 4.66452 1.94443 4.66539Z" fill="currentColor"/></svg>`,
      title: 'الأمان أولاً',
      description: 'أنظمة أمان ذكية متطورة تضمن سلامة عائلتك ومنزلك أثناء الاستخدام.'
    },
    {
      svg: `<svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.4993 8.45717C15.8897 8.31889 16.0942 7.89027 15.9559 7.49982C15.8176 7.10937 15.389 6.90495 14.9985 7.04323C14.1635 7.33899 13.3519 7.90884 12.6257 8.5457C11.8917 9.18938 11.2025 9.93949 10.6142 10.6448C10.084 11.2803 9.62825 11.8884 9.28726 12.3651C8.94407 11.8987 8.60329 11.5851 8.28993 11.3762C8.2642 11.359 8.2386 11.3415 8.21279 11.3238C7.98505 11.1676 7.74088 11.0002 7.25188 11.0002C6.83767 11.0002 6.4989 11.336 6.4989 11.7502C6.4989 12.1477 6.80821 12.4731 7.19929 12.4986C7.20293 12.4994 7.2081 12.5007 7.21474 12.5026C7.25024 12.5127 7.33555 12.5427 7.45788 12.6242C7.70107 12.7864 8.12257 13.1746 8.57808 14.0856C8.69897 14.3274 8.9406 14.4854 9.21055 14.4992C9.48045 14.513 9.73708 14.3803 9.88204 14.1522C9.97112 14.0185 10.2355 13.6219 10.4021 13.3858C10.7358 12.913 11.2087 12.2736 11.766 11.6056C12.3247 10.9359 12.959 10.2485 13.6147 9.67346C14.2782 9.09157 14.9226 8.66142 15.4993 8.45717Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10.2471 0C8.56582 0 7.19898 0.567939 6.00685 1.18555C5.6466 1.37219 5.31193 1.5568 4.99212 1.73322C4.20967 2.16485 3.51619 2.5474 2.75463 2.79039L2.72921 2.7985C2.28192 2.94121 1.91112 3.05951 1.63019 3.1696C1.36577 3.27321 1.05152 3.4152 0.82856 3.66299C0.628279 3.88558 0.525386 4.13547 0.457166 4.3745C0.395235 4.59148 0.347817 4.85462 0.297032 5.13644L0.291515 5.16705C-0.946426 12.0327 1.76057 18.537 8.37102 21.0679L8.40392 21.0805C9.05368 21.3293 9.4993 21.5 10.2504 21.5C11.0015 21.5 11.4471 21.3293 12.0968 21.0805L12.1297 21.0679C18.7399 18.5369 21.4442 12.0324 20.206 5.167L20.2004 5.13634C20.1496 4.8545 20.1022 4.59132 20.0402 4.37433C19.972 4.13529 19.8691 3.88537 19.6687 3.66278C19.4458 3.41499 19.1315 3.27304 18.8671 3.16946C18.5862 3.05942 18.2154 2.94119 17.7682 2.79857L17.7427 2.79044C16.9807 2.54744 16.2866 2.1648 15.5036 1.7331C15.1837 1.55671 14.8489 1.37213 14.4885 1.18554C13.2958 0.567951 11.9284 0 10.2471 0ZM3.21058 4.21941C4.12244 3.92847 5.01083 3.43833 5.84112 2.98023C6.13411 2.81859 6.41986 2.66093 6.69686 2.51742C7.80842 1.94156 8.92059 1.5 10.2471 1.5C11.5737 1.5 12.6865 1.94162 13.7988 2.51757C14.0759 2.66107 14.3618 2.81872 14.655 2.98035C15.4858 3.43847 16.3747 3.92862 17.2869 4.21953C17.7661 4.37233 18.0899 4.47599 18.32 4.56613C18.4714 4.62546 18.5373 4.66295 18.5585 4.6754C18.5664 4.69136 18.5802 4.72432 18.5979 4.78609C18.6367 4.92222 18.6715 5.11018 18.7298 5.43325C19.8708 11.7595 17.3811 17.451 11.5933 19.667C10.929 19.9214 10.7108 20 10.2504 20C9.78995 20 9.57175 19.9214 8.90735 19.6671C3.11901 17.4509 0.627074 11.7593 1.76771 5.43322C1.82595 5.1102 1.86072 4.92228 1.89957 4.78618C1.91719 4.72443 1.93096 4.69148 1.93889 4.67552C1.96011 4.66307 2.02596 4.62556 2.17746 4.5662C2.40758 4.47602 2.73143 4.37229 3.21058 4.21941Z" fill="currentColor"/></svg>`,
      title: 'ضمان شامل',
      description: 'ضمان حقيقي وممتد على جميع الأجهزة مع توفر قطع الغيار الأصلية.'
    }
  ];
});

const scrollSlider = (sliderElement, direction) => {
  if (!sliderElement) return;
  const isRtl = currentLang.value === 'ar';
  const scrollAmount = sliderElement.clientWidth * 0.75;
  if (isRtl) {
    const sign = direction === 'right' ? 1 : -1;
    sliderElement.scrollBy({
      left: sign * scrollAmount,
      behavior: 'smooth'
    });
  } else {
    const sign = direction === 'left' ? -1 : 1;
    sliderElement.scrollBy({
      left: sign * scrollAmount,
      behavior: 'smooth'
    });
  }
};

const goToProduct = (product) => {
  if (product && product.id) {
    router.push(`/product/${product.id}`);
  }
};

const addToCart = (product) => {
  if (product) {
    cartState.addToCart(product);
  }
};

const fetchSliders = async () => {
  try {
    const list = await settingsService.getSliders({ is_active: 1 });
    if (Array.isArray(list) && list.length > 0) {
      rawSliders.value = list.filter(s => s.status === 'active' || s.is_active !== 0);
      startHeroAutoplay();
    } else {
      rawSliders.value = [];
    }
  } catch (err) {
    console.error('Failed to fetch sliders from API:', err);
    rawSliders.value = [];
  }
};

const fetchCategories = async () => {
  try {
    const list = await productService.getCategories({ is_active: 1 });
    if (Array.isArray(list) && list.length > 0) {
      rawCategories.value = list;
    } else {
      rawCategories.value = fallbackCategories;
    }
  } catch (err) {
    console.error('Failed to fetch categories from API:', err);
    rawCategories.value = fallbackCategories;
  }
};

const fetchOffers = async () => {
  try {
    const list = await productService.getOffers({ is_active: 1 });
    if (Array.isArray(list) && list.length > 0) {
      rawOffers.value = list;
    } else {
      rawOffers.value = fallbackOffers;
    }
  } catch (err) {
    console.error('Failed to fetch offers from API:', err);
    rawOffers.value = fallbackOffers;
  }
};

const fetchProducts = async () => {
  try {
    const result = await productService.getProducts({ per_page: 20, is_active: 1 });
    const list = result.items;
    if (Array.isArray(list) && list.length > 0) {
      rawProducts.value = list;
    } else {
      rawProducts.value = fallbackProducts;
    }
  } catch (err) {
    console.error('Failed to fetch products from API:', err);
    rawProducts.value = fallbackProducts;
  }
};

onMounted(() => {
  fetchSettings();
  fetchSliders();
  fetchCategories();
  fetchOffers();
  fetchSharedOffers();
  fetchProducts();
  startHeroAutoplay();
});

onUnmounted(() => {
  stopHeroAutoplay();
});
</script>

<style scoped>
.home-view {
  width: 100%;
  background: #ffffff;
  color: #111827;
  overflow-x: hidden;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 1. Hero Section */
.hero-banner-wrapper {
  width: 100%;
  background: #0d0e11;
  display: flex;
  justify-content: center;
}

.hero-section {
  position: relative;
  width: 100%;
  max-width: 1440px;
  height: 600px;
  min-height: 600px;
  margin: 0 auto;
  border-radius: 0;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: #0d0e11;
  box-sizing: border-box;
}

.hero-slides-wrapper {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-slide-item {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 16px 36px;
  box-sizing: border-box;
}

/* Slide Right & Left transitions */
.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  transition: opacity 0.65s cubic-bezier(0.25, 1, 0.5, 1), transform 0.65s cubic-bezier(0.25, 1, 0.5, 1);
}

/* In RTL: "يلف يمين" (advancing rightwards in RTL natural flow) */
.home-view[dir="rtl"] .slide-right-enter-from {
  opacity: 0;
  transform: translateX(-48px);
}
.home-view[dir="rtl"] .slide-right-leave-to {
  opacity: 0;
  transform: translateX(48px);
}
.home-view[dir="rtl"] .slide-left-enter-from {
  opacity: 0;
  transform: translateX(48px);
}
.home-view[dir="rtl"] .slide-left-leave-to {
  opacity: 0;
  transform: translateX(-48px);
}

/* In LTR */
.home-view[dir="ltr"] .slide-right-enter-from {
  opacity: 0;
  transform: translateX(48px);
}
.home-view[dir="ltr"] .slide-right-leave-to {
  opacity: 0;
  transform: translateX(-48px);
}
.home-view[dir="ltr"] .slide-left-enter-from {
  opacity: 0;
  transform: translateX(-48px);
}
.home-view[dir="ltr"] .slide-left-leave-to {
  opacity: 0;
  transform: translateX(48px);
}

/* Navigation arrows */
.hero-nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(13, 14, 17, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
}

.hero-nav-arrow:hover {
  background: rgba(255, 255, 255, 0.95);
  color: #111827;
  border-color: #ffffff;
  transform: translateY(-50%) scale(1.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
}

.hero-arrow-right {
  right: 28px;
}

.hero-arrow-left {
  left: 28px;
}

/* Carousel Indicators (Dots) */
.hero-indicators {
  position: absolute;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(13, 14, 17, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.hero-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
}

.hero-dot.active {
  width: 24px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.75);
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transform: scale(1.02);
  filter: brightness(0.92);
  transition: transform 6s ease-out;
}

.hero-slide-item:hover .hero-bg {
  transform: scale(1.05);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 50%, rgba(13, 14, 17, 0.45) 0%, rgba(13, 14, 17, 0.85) 100%);
}

.home-view[dir="rtl"] .hero-overlay {
  background: linear-gradient(270deg, rgba(13, 14, 17, 0.88) 0%, rgba(13, 14, 17, 0.6) 45%, rgba(13, 14, 17, 0.25) 100%);
}

.home-view[dir="ltr"] .hero-overlay {
  background: linear-gradient(90deg, rgba(13, 14, 17, 0.88) 0%, rgba(13, 14, 17, 0.6) 45%, rgba(13, 14, 17, 0.25) 100%);
}

.hero-container {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.home-view[dir="rtl"] .hero-container {
  justify-content: flex-start; /* Starts on right in RTL */
}

.hero-content {
  max-width: 580px;
  padding: 0;
  color: #ffffff;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 16px;
  letter-spacing: 0.5px;
}

.tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffffff;
  display: inline-block;
}

.hero-title {
  font-size: 44px;
  font-weight: 800;
  line-height: 1.25;
  color: #ffffff;
  margin-bottom: 18px;
  letter-spacing: -0.5px;
}

.hero-title-sub {
  font-weight: 700;
  color: #ffffff;
}

.hero-desc {
  font-size: 15.5px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.82);
  margin-bottom: 28px;
  font-weight: 400;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hero-btn-white {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  color: #111827;
  font-size: 15px;
  font-weight: 700;
  padding: 13px 32px;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.25s ease;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}

.hero-btn-white:hover {
  background: #f3f4f6;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
}

/* 2. Trust Bar */
.trust-bar-section {
  background: #f8fafc;
  border-bottom: 1px solid #eef2f6;
  padding: 12px 0;
  margin-top: 0;
}

.trust-bar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 52px;
  flex-wrap: wrap;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #262626;
  font-size: 13.5px;
  font-weight: 500;
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.trust-icon-box {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1a1a1a;
  flex-shrink: 0;
}

.trust-icon-box svg {
  width: 100%;
  height: 100%;
  display: block;
}

.trust-title {
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: #262626;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .trust-bar-container {
    gap: 28px;
  }
}

@media (max-width: 640px) {
  .trust-bar-container {
    gap: 14px 20px;
    justify-content: center;
  }
  .trust-item {
    font-size: 12.5px;
  }
}

/* Common Section Headers */
.home-section {
  padding: 32px 0 24px;
}

.home-section.categories-section {
  padding-top: 22px;
}

.section-header-flex {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 6px 0;
  letter-spacing: -0.3px;
}

.section-subtitle {
  font-size: 13.5px;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  font-weight: 600;
  color: #111827;
  text-decoration: none;
  transition: opacity 0.2s;
}

.view-all-link:hover {
  opacity: 0.75;
}

.section-nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-circle-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #111827;
  color: #ffffff;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-circle-btn:hover {
  background: #000000;
  transform: scale(1.06);
}

/* 3. Category Portrait Cards */
.category-cards-slider {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 8px;
}

.category-cards-slider::-webkit-scrollbar,
.offers-cards-slider::-webkit-scrollbar {
  display: none;
}

.category-portrait-card {
  position: relative;
  width: 236px;
  height: 340px;
  flex: 0 0 236px;
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 18px 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: #111827;
}

.category-portrait-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.16);
}

/* 3.1 Special Offers Slider & Cards (العروض المميزة) */
.offers-cards-slider {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding: 4px 2px 16px;
}

.offer-portrait-card {
  position: relative;
  width: 280px;
  height: 420px;
  flex: 0 0 280px;
  border-radius: 0;
  overflow: hidden;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 24px 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: #111827;
  opacity: 1;
  transform: rotate(0deg);
}

.offer-portrait-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.24);
}

.card-bg-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
}

.category-portrait-card:hover .card-bg-image,
.offer-portrait-card:hover .card-bg-image {
  transform: scale(1.06);
}

.card-gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.88) 100%);
}

.card-bottom-content {
  position: relative;
  z-index: 2;
  color: #ffffff;
}

.card-count {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  display: block;
  margin-bottom: 4px;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-title {
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.25;
}

.card-circle-arrow {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
  transition: transform 0.2s ease, background 0.2s ease;
}

.home-view[dir="rtl"] .card-circle-arrow svg {
  transform: rotate(180deg);
}

.category-portrait-card:hover .card-circle-arrow,
.offer-portrait-card:hover .card-circle-arrow {
  background: #ffffff;
  color: #111827;
  transform: scale(1.08);
}

/* 4. Products Grid 4 Columns */
.products-grid-four {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* 7. Why Mastergas Section */
.why-mastergas-section {
  background-color: #f8fafc;
  padding: 64px 0 80px;
}

.why-header-center {
  text-align: center;
  margin-bottom: 48px;
}

.why-header-center .section-title {
  font-size: 32px;
  font-weight: 800;
  color: #000000;
  margin-bottom: 12px;
  letter-spacing: -0.01em;
}

.why-header-center .section-subtitle {
  font-size: 15px;
  color: #64748b;
  margin: 0 auto;
  font-weight: 400;
  line-height: 1.6;
}

.why-cards-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.why-card-item {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 26px 20px 28px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: start;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.why-card-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px -4px rgba(15, 23, 42, 0.07);
  border-color: #cbd5e1;
}

.why-icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
  color: #000000;
  flex-shrink: 0;
}

.why-icon-inner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.why-icon-inner svg {
  display: block;
  color: #000000;
}

.why-card-title {
  font-size: 16.5px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 10px 0;
  line-height: 1.35;
}

.why-card-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.65;
  margin: 0;
  font-weight: 400;
}

.home-view[dir="rtl"] .why-card-item {
  align-items: flex-start;
  text-align: right;
}

.home-view[dir="ltr"] .why-card-item {
  align-items: flex-start;
  text-align: left;
}

/* Responsive Media Queries */
@media (max-width: 1024px) {
  .category-cards-slider,
  .offers-cards-slider {
    grid-template-columns: repeat(3, 240px);
    gap: 14px;
    padding-bottom: 12px;
  }

  .products-grid-four {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .why-cards-row {
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    height: auto;
    min-height: 480px;
    padding: 24px 16px;
  }

  .hero-title {
    font-size: 34px;
  }

  .hero-desc {
    font-size: 14px;
  }

  .trust-bar-container {
    justify-content: flex-start;
    overflow-x: auto;
    flex-wrap: nowrap;
    scrollbar-width: none;
    padding-bottom: 6px;
  }

  .trust-bar-container::-webkit-scrollbar {
    display: none;
  }

  .trust-item {
    flex-shrink: 0;
  }

  .category-cards-slider {
    grid-template-columns: repeat(5, 190px);
    gap: 12px;
  }

  .category-portrait-card {
    height: 290px;
  }

  .offers-cards-slider {
    gap: 16px;
  }

  .offer-portrait-card {
    width: 280px;
    height: 420px;
    flex: 0 0 280px;
    border-radius: 0;
  }

  .products-grid-four {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .why-cards-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 28px;
  }

  .why-cards-row {
    grid-template-columns: 1fr;
  }

  .offers-cards-slider {
    gap: 12px;
  }

  .offer-portrait-card {
    width: 260px;
    height: 390px;
    flex: 0 0 260px;
    border-radius: 0;
    padding: 20px 16px;
  }
}

@media (max-width: 360px) {
  .offer-portrait-card {
    width: 240px;
    height: 360px;
    flex: 0 0 240px;
    border-radius: 0;
    padding: 16px 14px;
  }
}
</style>
