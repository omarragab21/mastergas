<template>
  <div class="website-layout" :class="currentLang === 'ar' ? 'lang-ar' : 'lang-en'" :dir="currentLang === 'ar' ? 'rtl' : 'ltr'">
    <header class="fixed-header">
      <!-- Top Bar -->
      <div class="top-bar">
        <div class="container top-bar-container">
          <div class="top-bar-content">
            <!-- Welcome Message -->
            <div class="top-bar-item welcome-message">
              <span class="delivery-promo">
                <svg class="icon-3d" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="3" width="15" height="13" rx="2" ry="2"/>
                  <path d="M16 8h4l3 3v5h-7V8z"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                {{ $t('topbar.free_shipping') || 'شحن مجاني للطلبات فوق 50 دينار - توصيل سريع لجميع المناطق' }}
              </span>
            </div>

            <!-- Dynamic Coupon or Offer if exists -->
            <template v-if="latestCoupon && latestCoupon.code">
              <div class="top-bar-divider"></div>
              <div class="top-bar-item coupon-info">
                <span class="sparkle">✨</span>
                <span class="use-code-text">{{ $t('use_code') }}</span>
                <span class="coupon-code">{{ latestCoupon.code }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="navbar" :class="{ 'navbar-scrolled': isScrolled }">
        <div class="container nav-container">
          <!-- Logo (Right in RTL) -->
          <router-link to="/" class="logo" aria-label="Mastergas Home">
            <div class="logo-icon">
              <img :src="siteLogo || '/logo.png'" :alt="siteName || 'Mastergas'" class="site-logo-img">
            </div>
          </router-link>

          <!-- Main Links (Center in Desktop) -->
          <div class="nav-links desktop-only">
            <router-link to="/" active-class="active" exact-active-class="active">{{ $t('nav.home') }}</router-link>
            <router-link to="/products" active-class="active" exact-active-class="active">{{ $t('nav.products') }}</router-link>
            <router-link to="/offers" active-class="active" exact-active-class="active">{{ $t('nav.offers') }}</router-link>
            <router-link to="/about" active-class="active" exact-active-class="active">{{ $t('nav.about') }}</router-link>
            <router-link to="/contact" active-class="active" exact-active-class="active">{{ $t('nav.contact') }}</router-link>
          </div>

          <!-- Desktop specific Icons (Left in RTL) -->
          <div class="nav-icons desktop-only">
            <button class="lang-pill-btn" @click="toggleLanguage">
              {{ currentLang === 'ar' ? 'English' : 'العربية' }}
            </button>
            <span class="nav-v-divider"></span>

            <button class="icon-btn search-btn" @click="showSearchModal = true" title="البحث">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            <router-link to="/wishlist" class="icon-btn wishlist-btn" :class="{ 'has-items': wishlistCount > 0 }" title="المفضلة">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span class="badge" v-if="wishlistCount > 0">{{ wishlistCount }}</span>
            </router-link>
            
            <router-link to="/cart" class="icon-btn cart-btn" :class="{ 'has-items': cartCount > 0 }" title="سلة المشتريات">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>
              <span class="badge cart-badge-black" v-if="cartCount > 0">{{ cartCount }}</span>
            </router-link>
            
            <div class="user-dropdown-container" @mouseenter="isLoggedIn && (showUserDropdown = true)" @mouseleave="showUserDropdown = false">
              <button class="icon-btn user-btn" :title="isLoggedIn ? $t('profile.title') : $t('nav.login')" @click="handleUserClick">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
              <transition name="fade">
                <div v-if="isLoggedIn && showUserDropdown" class="user-dropdown-menu" @click.stop>
                  <div class="user-dropdown-header">
                    <p class="user-name">{{ authState.user?.name || authState.user?.full_name || $t('auth.customer') }}</p>
                    <p class="user-phone" dir="ltr" v-if="authState.user?.email || authState.user?.phone || currentUser?.phone">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      {{ authState.user?.email || authState.user?.phone || currentUser?.phone || '' }}
                    </p>
                  </div>
                  <div class="user-dropdown-body">
                    <router-link to="/profile" class="user-dropdown-item" @click="showUserDropdown = false">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      {{ $t('profile.title') }}
                    </router-link>
                    <router-link to="/wishlist" class="user-dropdown-item" @click="showUserDropdown = false">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      {{ $t('profile.wishlist') }}
                    </router-link>
                    <button class="user-dropdown-item logout" @click="handleLogout(); showUserDropdown = false">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                      {{ $t('profile.logout') }}
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>

        <!-- Mobile Side Actions (Left in RTL Mobile) -->
        <div class="nav-actions-left mobile-only">
          <!-- Cart, Search & Profile Icons -->
          <div class="nav-icons mobile-icons">
            <button class="icon-btn search-btn" @click="showSearchModal = true; isMobileMenuOpen = false">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            <router-link to="/cart" class="icon-btn cart-btn" @click="isMobileMenuOpen = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart w-6 h-6"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>
              <span class="badge" v-if="cartCount > 0">{{ cartCount }}</span>
            </router-link>
            <div class="user-dropdown-container">
              <button class="icon-btn user-btn" :title="isLoggedIn ? $t('profile.title') : $t('nav.login')" @click="handleUserClick">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
              <transition name="fade">
                <div v-if="isLoggedIn && showUserDropdown" class="user-dropdown-menu mobile-user-dropdown" @click.stop>
                  <div class="user-dropdown-header">
                    <p class="user-name">{{ authState.user?.name || authState.user?.full_name || $t('auth.customer') }}</p>
                    <p class="user-phone" dir="ltr" v-if="authState.user?.email || authState.user?.phone || currentUser?.phone">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      {{ authState.user?.email || authState.user?.phone || currentUser?.phone || '' }}
                    </p>
                  </div>
                  <div class="user-dropdown-body">
                    <router-link to="/profile" class="user-dropdown-item" @click="showUserDropdown = false">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      {{ $t('profile.title') }}
                    </router-link>
                    <router-link to="/profile?tab=wishlist" class="user-dropdown-item" @click="showUserDropdown = false">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      {{ $t('profile.wishlist') }}
                    </router-link>
                    <button class="user-dropdown-item logout" @click="handleLogout(); showUserDropdown = false">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                      {{ $t('profile.logout') }}
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <!-- Burger/Close Menu -->
          <button class="icon-btn menu-btn" @click="isMobileMenuOpen = !isMobileMenuOpen">
            <svg v-if="!isMobileMenuOpen" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Mobile Menu Overlay -->
        <transition name="slide-down">
          <div v-if="isMobileMenuOpen" class="mobile-menu-overlay">
            <div class="mobile-menu-inner">
              <div class="mobile-menu-links">
                <router-link to="/" class="mobile-link" :class="{ 'active': $route.path === '/' }" @click="isMobileMenuOpen = false">{{ $t('nav.home') }}</router-link>
                <router-link to="/products" class="mobile-link" :class="{ 'active': $route.path === '/products' }" @click="isMobileMenuOpen = false">{{ $t('nav.products') }}</router-link>
                <router-link to="/offers" class="mobile-link" :class="{ 'active': $route.path === '/offers' }" @click="isMobileMenuOpen = false">{{ $t('nav.offers') }}</router-link>
                <router-link to="/about" class="mobile-link" :class="{ 'active': $route.path === '/about' }" @click="isMobileMenuOpen = false">{{ $t('nav.about') }}</router-link>
                <router-link to="/contact" class="mobile-link" :class="{ 'active': $route.path === '/contact' }" @click="isMobileMenuOpen = false">{{ $t('nav.contact') }}</router-link>
              </div>
              
              <div class="mobile-menu-separator"></div>

              <div class="mobile-menu-footer">
                <div class="footer-item" @click="toggleLanguage">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                  <span>{{ currentLang === 'ar' ? 'English' : 'العربية' }}</span>
                </div>
                <button class="footer-item" @click="handleUserClick(); isMobileMenuOpen = false">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>{{ isLoggedIn ? $t('profile.title') : $t('nav.login') }}</span>
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </nav>
    </header>

    <main class="main-content">
      <router-view />
    </main>

    <!-- Global Components -->
    <add-to-cart-modal />
    <auth-modal ref="authModal" :logo="siteLogo" :site-name="siteName" />

    <!-- Search Modal -->
    <div class="search-modal-overlay" v-if="showSearchModal" @click.self="showSearchModal = false">
      <div class="search-modal-content">
        <div class="search-header">
          <h2>{{ $t('search.title') }}</h2>
          <button class="search-close-btn" @click="showSearchModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="search-input-wrapper">
          <input 
            type="text" 
            v-model="searchQuery" 
            :placeholder="$t('search.placeholder')"
            @keyup.enter="performSearch"
            ref="searchInput"
          />
          <button class="search-submit-btn" @click="performSearch">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>
        <div class="search-results" v-if="searchResults.length > 0">
          <div 
            v-for="product in searchResults" 
            :key="product.id" 
            class="search-result-item"
            @click="goToProduct(product.id)"
          >
            <div class="search-result-image" v-if="product.image">
              <img :src="product.image" :alt="product.name" />
            </div>
            <div class="search-result-info">
              <h4>{{ localized(product, 'name') }}</h4>
              <p class="search-result-price">{{ formatPrice(product.price * (1 - (product.discount/100 || 0))) }}</p>
            </div>
          </div>
        </div>
        <div class="search-no-results" v-if="searchQuery && searchResults.length === 0 && !searching">
          <p>{{ $t('search.no_results') }}</p>
        </div>
        <div class="search-loading" v-if="searching">
          <div class="spinner"></div>
        </div>
      </div>
    </div>

    <!-- Floating Action Buttons -->
    <a v-if="formatSocialUrl(socials.whatsapp, 'whatsapp')" :href="formatSocialUrl(socials.whatsapp, 'whatsapp')" target="_blank" rel="noopener noreferrer" class="whatsapp-float">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
         <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    </a>

    <!-- Footer -->
    <footer class="main-footer">
      <div class="container">
        <div class="footer-grid">
          <!-- Col 1: Store (Right in RTL) -->
          <div class="footer-col footer-col-store">
            <h4 class="footer-title">{{ currentLang === 'ar' ? 'المتجر' : 'Store' }}</h4>
            <ul class="footer-links">
              <li><router-link to="/products">{{ currentLang === 'ar' ? 'جميع الأجهزة' : 'All Appliances' }}</router-link></li>
              <li><router-link to="/products?category_id=53">{{ currentLang === 'ar' ? 'المواقد والفرن' : 'Cookers & Oven' }}</router-link></li>
              <li><router-link to="/products?category_id=57">{{ currentLang === 'ar' ? 'المواقد المسطحة' : 'Built-in Hobs' }}</router-link></li>
              <li><router-link to="/products?search=hood">{{ currentLang === 'ar' ? 'الشفاطات المدمجة' : 'Built-in Hoods' }}</router-link></li>
              <li><router-link to="/offers">{{ currentLang === 'ar' ? 'العروض الخاصة' : 'Special Offers' }}</router-link></li>
            </ul>
          </div>

          <!-- Col 2: Account (Middle Right in RTL) -->
          <div class="footer-col footer-col-account">
            <h4 class="footer-title">{{ currentLang === 'ar' ? 'حسابي' : 'My Account' }}</h4>
            <ul class="footer-links">
              <li>
                <a href="#" @click.prevent="isLoggedIn ? $router.push('/profile') : openAuthModal()">
                  {{ currentLang === 'ar' ? 'تسجيل الدخول' : 'Sign In' }}
                </a>
              </li>
              <li><router-link to="/profile?tab=orders">{{ currentLang === 'ar' ? 'طلباتي' : 'My Orders' }}</router-link></li>
              <li><router-link to="/profile?tab=addresses">{{ currentLang === 'ar' ? 'عناوين التوصيل' : 'Delivery Addresses' }}</router-link></li>
            </ul>
          </div>

          <!-- Col 3: Support (Middle Left in RTL) -->
          <div class="footer-col footer-col-support">
            <h4 class="footer-title">{{ currentLang === 'ar' ? 'الدعم' : 'Support' }}</h4>
            <ul class="footer-links">
              <li><router-link to="/contact">{{ currentLang === 'ar' ? 'الدعم الفني' : 'Technical Support' }}</router-link></li>
              <li><router-link to="/page/privacy">{{ currentLang === 'ar' ? 'سياسة الخصوصية والاستخدام' : 'Privacy & Terms' }}</router-link></li>
              <li><router-link to="/page/terms">{{ currentLang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions' }}</router-link></li>
            </ul>
          </div>

          <!-- Col 4: Brand Info & Payment (Far Left in RTL) -->
          <div class="footer-col brand-info footer-col-brand">
            <router-link to="/" class="footer-logo">
              <img src="/images/footer_logo_transparent.png" alt="MASTERgas" class="footer-brand-logo-img" />
            </router-link>
            <p class="footer-desc">
              {{ currentLang === 'ar' 
                  ? 'الرائد الأول في توفير الأجهزة المنزلية الإيطالية الفاخرة في المملكة العربية السعودية. جودة هندسية، أمان متكامل وأداء يدوم طويلاً.' 
                  : 'The premier provider of luxury Italian home appliances in Saudi Arabia. Engineered quality, integrated safety, and long-lasting performance.' }}
            </p>
            
            <div class="footer-social-wrap">
              <a :href="formatSocialUrl(socials.youtube, 'youtube') || 'https://youtube.com/'" target="_blank" rel="noopener noreferrer" class="social-circle-btn" aria-label="YouTube">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a :href="formatSocialUrl(socials.facebook, 'facebook') || 'https://facebook.com/'" target="_blank" rel="noopener noreferrer" class="social-circle-btn" aria-label="Facebook">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>

            <div class="footer-payment-wrap">
              <p class="payment-title">{{ currentLang === 'ar' ? 'طرق الدفع' : 'Payment Methods' }}</p>
              <div class="payment-badges-row">
                <span class="pay-card-badge pay-mada">
                  <span class="pay-text">mada</span>
                </span>
                <span class="pay-card-badge pay-visa">
                  <span class="pay-text">VISA</span>
                </span>
                <span class="pay-card-badge pay-mc">
                  <span class="pay-text">Mastercard</span>
                </span>
                <span class="pay-card-badge pay-apple">
                  <svg width="11" height="13" viewBox="0 0 170 170" fill="#000">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.66-7.79-11.89-14.24-5.35-8.15-9.61-17.58-12.78-28.29-3.17-10.7-4.77-20.98-4.77-30.82 0-14.78 3.73-26.69 11.19-35.73 7.46-9.04 16.71-13.68 27.75-13.91 5.35 0 11.15 1.41 17.41 4.22 6.26 2.81 10.02 4.31 11.29 4.5 2.05-.44 6.07-2.02 12.06-4.74 5.99-2.72 11.51-3.97 16.56-3.74 12.74.76 22.84 5.57 30.3 14.43-11.22 6.74-16.71 16.14-16.48 28.21.23 9.46 3.84 17.39 10.84 23.79 7 6.4 15.28 10.15 24.84 11.26-2.02 6.09-4.5 12.18-7.45 18.28zM119.22 33.15c0-7.39 2.65-14.18 7.95-20.37 5.3-6.19 11.95-10.18 19.95-11.98.22 1.3.33 2.45.33 3.44 0 7.28-2.83 14.28-8.49 21.01-5.66 6.74-12.56 10.5-20.7 11.28-.44-1.09-.67-2.22-.67-3.38z"/>
                  </svg>
                  <span class="pay-text">Pay</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="footer-divider"></div>

        <!-- Bottom Bar: Copyright on Right, Developer Tag on Left -->
        <div class="footer-bottom">
          <p class="copyright">
            {{ currentLang === 'ar' ? 'جميع الحقوق محفوظة .Mastergas 2026 ©' : 'All rights reserved .Mastergas 2026 ©' }}
          </p>
          <div class="developer-tag">
            {{ currentLang === 'ar' ? 'تم التصميم والتطوير بواسطة' : 'Designed & Developed by' }}
            <a href="https://be-kite.com/" target="_blank" rel="noopener noreferrer" class="bekite-link">bekite</a>
          </div>
        </div>
      </div>
    </footer>

    <!-- Cookie Consent Banner & Modal -->
    <CookieConsent ref="cookieConsent" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import api, { isCancelledRequest } from '../config/axios';
import { cartState } from '../store/cart';
import { authState, authActions } from '../store/auth';
import AddToCartModal from './AddToCartModal.vue';
import AuthModal from './AuthModal.vue';
import CookieConsent from './CookieConsent.vue';
import { useLocalized } from '../composables/useLocalized';
import { isOfferActive } from '../composables/useOffers';
import { settingsService } from '../services/settingsService';
import { productService } from '../services/productService';

const { locale } = useI18n();
const router = useRouter();
const route = useRoute();
const { localized, localizedValue } = useLocalized();
const isScrolled = ref(false);
const categories = ref([]);
const latestCoupon = ref(null);
const freeDeliveryThreshold = ref(null);
const siteName = ref('');
const siteLogo = ref('/logo.png');
const footerLogo = ref('/images/footer_logo_transparent.png');
const siteDescription = ref('');
const sitePhone = ref('');
const siteEmail = ref('');
const siteAddress = ref('');
const socials = reactive({
  facebook: '',
  instagram: '',
  twitter: '',
  x: '',
  linkedin: '',
  youtube: '',
  snapchat: '',
  tiktok: '',
  whatsapp: ''
});

const formatSocialUrl = (url, platform) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed === '#') return '';
  
  if (platform === 'whatsapp') {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    const cleanPhone = trimmed.replace(/[^0-9]/g, '');
    return cleanPhone ? `https://wa.me/${cleanPhone}` : '';
  }
  
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

const hasAnySocial = computed(() => {
  return !!(
    formatSocialUrl(socials.whatsapp, 'whatsapp') ||
    formatSocialUrl(socials.facebook, 'facebook') ||
    formatSocialUrl(socials.instagram, 'instagram') ||
    formatSocialUrl(socials.twitter || socials.x, 'x') ||
    formatSocialUrl(socials.linkedin, 'linkedin') ||
    formatSocialUrl(socials.youtube, 'youtube') ||
    formatSocialUrl(socials.snapchat, 'snapchat') ||
    formatSocialUrl(socials.tiktok, 'tiktok')
  );
});

const isMobileMenuOpen = ref(false);
const authModal = ref(null);
const showUserDropdown = ref(false);
const showSearchModal = ref(false);
const searchQuery = ref('');
const searchResults = ref([]);
const searching = ref(false);
const searchInput = ref(null);
let searchController = null;
let searchSequence = 0;

const isLoggedIn = computed(() => !!authState.token);
const currentUser = computed(() => authState.user);

const cartCount = computed(() => cartState.count);
const wishlistCount = computed(() => cartState.wishlistCount);

const currentLang = computed(() => locale.value);

const openAuthModal = () => {
  if (authModal.value && typeof authModal.value.openModal === 'function') {
    authModal.value.openModal();
  }
};

// Make openAuthModal globally accessible for wishlist and cart operations
window.openAuthModal = openAuthModal;

watch(() => route.fullPath, () => {
  isMobileMenuOpen.value = false;
  showUserDropdown.value = false;
});

const closeDropdownOnOutsideClick = (e) => {
  const container = document.querySelector('.user-dropdown-container');
  if (container && !container.contains(e.target)) {
    showUserDropdown.value = false;
  }
};

const handleUserClick = (e) => {
  if (e) e.stopPropagation();
  isMobileMenuOpen.value = false;
  if (isLoggedIn.value) {
    showUserDropdown.value = !showUserDropdown.value;
  } else {
    showUserDropdown.value = false;
    openAuthModal();
  }
};

const handleLogout = async () => {
  await authActions.logout();
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

const topics = ref([]);

const topicsByGroup = computed(() => {
  const groups = {
    customer_service: [],
    info: []
  };
  topics.value.forEach(t => {
    if (t.status !== 'published') return;
    if (t.category === 'سياسات' || t.category === 'طرق الدفع') {
      groups.customer_service.push(t);
    } else {
      groups.info.push(t);
    }
  });
  return groups;
});

const fetchData = async () => {
  try {
    const [settingsRes, couponsRes, offersRes, topicsRes] = await Promise.all([
      settingsService.getSettings(),
      api.get('/frontend/coupons'),
      productService.getOffers({ is_active: 1 }),
      settingsService.getTopics({ status: 'published' })
    ]);
    
    // Get settings
    const settings = settingsRes;
    if (Array.isArray(settings)) {
      const getVal = (key) => settings.find(s => s.key === key)?.value;
      
      const isIrisAsset = (val) => {
        if (!val) return false;
        const str = String(val).toLowerCase();
        return (
          str.includes('iris') ||
          str.includes('t3jcwn2n2rvkxvcva') ||
          str.includes('dobvpg934hatbpm5') ||
          str.includes('yugdc4mk4vmsf6el')
        );
      };

      freeDeliveryThreshold.value = getVal('free_delivery_threshold') || getVal('delivery_range');
      
      const rawSiteName = getVal('site_name');
      siteName.value = (rawSiteName && !isIrisAsset(rawSiteName)) ? rawSiteName : 'Mastergas';

      siteDescription.value = getVal('site_description');
      sitePhone.value = getVal('support_phone') || getVal('phone_number') || '';
      siteEmail.value = getVal('support_email') || getVal('email') || '';
      siteAddress.value = {
        ar: getVal('address_ar') || getVal('address'),
        en: getVal('address_en') || getVal('address')
      };

      socials.facebook = getVal('facebook');
      socials.instagram = getVal('instagram');
      socials.twitter = getVal('twitter') || getVal('x_twitter') || getVal('x_link');
      socials.x = getVal('x_twitter') || getVal('twitter') || getVal('x_link');
      socials.linkedin = getVal('linkedin');
      socials.youtube = getVal('youtube');
      socials.snapchat = getVal('snapchat');
      socials.tiktok = getVal('tiktok');
      socials.whatsapp = getVal('whatsapp');

      const faviconVal = getVal('favicon');
      const logoVal = getVal('logo');
      const footerLogoVal = getVal('footer_logo');
      
      if (logoVal && !isIrisAsset(logoVal)) {
        siteLogo.value = logoVal.startsWith('http') 
          ? logoVal 
          : `${api.defaults.baseURL.replace('/api', '')}/storage/${logoVal}`;
      } else {
        siteLogo.value = '/logo.png';
      }

      if (footerLogoVal && !isIrisAsset(footerLogoVal)) {
        footerLogo.value = footerLogoVal.startsWith('http') 
          ? footerLogoVal 
          : `${api.defaults.baseURL.replace('/api', '')}/storage/${footerLogoVal}`;
      } else {
        footerLogo.value = '/images/footer_logo_transparent.png';
      }

      // Update Favicon (Mastergas favicon, ignore legacy Iris)
      const finalFavicon = (faviconVal && !isIrisAsset(faviconVal))
        ? (faviconVal.startsWith('http') ? faviconVal : `${api.defaults.baseURL.replace('/api', '')}/storage/${faviconVal}`)
        : '/logo.png';

      const faviconLink = document.querySelector("link[rel~='icon']");
      if (faviconLink) {
        faviconLink.href = finalFavicon;
      }
    }

    // Get latest active & valid promo (from offers or coupons)
    const coupons = couponsRes?.data?.data || couponsRes?.data || [];
    const offers = offersRes || [];

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const validCoupons = (Array.isArray(coupons) ? coupons : []).filter(c => {
      if (c.is_valid === false || c.is_active === false || c.is_public === false) return false;
      if (c.end_date && todayStr > String(c.end_date).split('T')[0].trim()) return false;
      if (c.start_date && todayStr < String(c.start_date).split('T')[0].trim()) return false;
      return true;
    });

    const validOffers = (Array.isArray(offers) ? offers : []).filter(isOfferActive);

    const allPromos = [...validOffers, ...validCoupons];
    latestCoupon.value = allPromos.length > 0 ? allPromos[0] : null;

    // Topics
    topics.value = topicsRes || [];
  } catch (error) {
    console.warn('Top bar promo data unavailable from API, using clean default state:', error.message);
  }
};

const fetchUser = () => authActions.init();

const fetchCategories = async () => {
  try {
    const list = await productService.getCategories();
    categories.value = Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('Failed to fetch categories from API:', err);
    categories.value = [];
  }
};

const toggleLanguage = () => {
  const newLang = locale.value === 'ar' ? 'en' : 'ar';
  locale.value = newLang;
  localStorage.setItem('lang', newLang);
  document.documentElement.lang = newLang;
  document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  location.reload();
};

const performSearch = async () => {
  const query = searchQuery.value.trim();
  if (query.length < 2) {
    searchController?.abort();
    searchResults.value = [];
    return;
  }

  searchController?.abort();
  searchController = new AbortController();
  const controller = searchController;
  const sequence = ++searchSequence;

  searching.value = true;
  try {
    const result = await productService.getProducts(
      { search: query, per_page: 8, is_active: 1 },
      { signal: controller.signal, ttl: 45 * 1000 }
    );
    if (sequence === searchSequence && !controller.signal.aborted) searchResults.value = result.items;
  } catch (err) {
    if (isCancelledRequest(err) || controller.signal.aborted || sequence !== searchSequence) return;
    console.error('Search failed:', err);
    if (sequence === searchSequence) searchResults.value = [];
  } finally {
    if (sequence === searchSequence) searching.value = false;
  }
};

const goToProduct = (productId) => {
  showSearchModal.value = false;
  router.push(`/product/${productId}`);
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-JO', {
    style: 'currency',
    currency: 'JOD',
    minimumFractionDigits: 2
  }).format(price);
};

// Watch for search modal open to focus input
watch(showSearchModal, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      searchInput.value?.focus();
    }, 100);
  } else {
    searchQuery.value = '';
    searchResults.value = [];
  }
});

// Auto-search with debounce
let searchTimeout;
watch(searchQuery, (newValue) => {
  clearTimeout(searchTimeout);
  if (newValue.trim().length >= 2) {
    searchTimeout = setTimeout(() => {
      performSearch();
    }, 300);
  } else {
    searchController?.abort();
    searchResults.value = [];
    searching.value = false;
  }
});

onMounted(() => {
  fetchData();
  fetchCategories();
  authActions.init();
  window.addEventListener('scroll', handleScroll);
  document.addEventListener('click', closeDropdownOnOutsideClick);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('click', closeDropdownOnOutsideClick);
});
</script>

<style scoped>
.website-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  overflow-x: hidden;
}

.mastergas-text-logo {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.mastergas-text-logo .brand-name {
  font-size: 1.45rem;
  font-weight: 900;
  letter-spacing: 1.5px;
  color: #000000;
}

.mastergas-text-logo .brand-sub {
  font-size: 0.58rem;
  letter-spacing: 2px;
  color: #6b7280;
  font-weight: 700;
  margin-top: 3px;
}

.footer-text-logo .brand-name {
  color: #ffffff !important;
}

.footer-text-logo .brand-sub {
  color: #9ca3af !important;
}

.lang-pill-btn {
  background: transparent;
  border: 1px solid #e5e7eb;
  color: #111827;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.lang-pill-btn:hover {
  border-color: #111827;
  background: #f9fafb;
}

.nav-v-divider {
  width: 1px;
  height: 20px;
  background: #e5e7eb;
  margin: 0 0.35rem;
}

.cart-badge-black {
  background: #000000 !important;
  color: #ffffff !important;
}

.footer-payment-badges {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.pay-tag {
  background: #1f2937;
  color: #f3f4f6;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.website-layout.lang-en {
  direction: ltr;
  text-align: left;
}

.website-layout.lang-ar {
  direction: rtl;
  text-align: right;
}

.website-layout.lang-en .main-content {
  direction: ltr;
  text-align: left;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

@media (max-width: 1024px) {
  .main-content {
    padding-top: 100px;
  }
}

.delivery-promo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
}

.icon-3d {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  color: #fbbf24; /* Golden yellow */
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

/* Top Bar */
.top-bar {
  background: #000000;
  color: #fff;
  padding: 8px 10px !important;
  font-size: 11px !important;
  font-weight: 400 !important;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  text-align: center;
}

.top-bar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100% !important;
}

.top-bar-content {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  gap: 15px !important;
  width: auto !important;
}

.delivery-icon ,.sparkle{
  display: flex;
  justify-content: center;
  align-items: center;
}

.top-bar-item {
  display: flex;
  align-items: center;
  gap: 6px !important;
  font-size: 0.88rem;
  white-space: nowrap;
}

.top-bar-divider {
  width: 1px;
  height: 12px;
  background: rgba(255,255,255,0.2);
  margin: 0 5px;
}

.coupon-code {
  color: #fdb913;
  letter-spacing: 1px;
  font-weight: 700;
}

.text-bold {
  font-weight: 700;
}

.sparkle {
  font-size: 16px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding-left: 5% !important;
  padding-right: 5% !important;
}

/* Fixed Header */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}



/* Navbar */
.navbar {
  background: #fff;
  border-bottom: 1px solid #f3f4f6;
  padding: 8px 0;
  position: relative;
  z-index: 1000;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 5% !important;
  padding-right: 5% !important;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-icon {
  height: 32px;
  width: auto;
  min-width: unset;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.3s ease;
}

.navbar-scrolled .logo-icon {
  height: 28px;
  min-width: unset;
}

.site-logo-img {
  height: 26px;
  width: auto;
  max-width: 135px;
  object-fit: contain;
}

@media (max-width: 768px) {
  .logo-icon {
    height: 28px;
    width: auto;
    min-width: unset;
  }
  .site-logo-img {
    height: 24px;
    max-width: 120px;
  }
  .nav-container {
    padding: 0 15px !important;
  }
}

.nav-links {
  display: flex;
  gap: 25px;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 400;
  font-size: 15px;
  transition: all 0.2s;
  position: relative;
  padding: 5px 0;
}

.nav-links a:hover, .nav-links a.active {
  color: #000000;
}

.nav-links a.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  right: 0;
  width: 100%;
  height: 2.5px;
  background: #000000;
  border-radius: 2px;
}

/* Icons */
.nav-icons {
  display: flex;
  gap: 5px;
  align-items: center;
}

.icon-btn {
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  text-decoration: none;
}

.cart-btn .badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  min-width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #fff;
}

.icon-btn:hover {
  background: #f9fafb;
  color: #000000;
}

/* User Dropdown */
.user-dropdown-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 240px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.12);
  margin-top: 10px;
  z-index: 1010;
  padding: 10px;
  border: 1px solid #f3f4f6;
}

@media (max-width: 768px) {
  .mobile-user-dropdown {
    position: fixed;
    top: 70px;
    left: 15px;
    right: 15px;
    width: calc(100vw - 30px);
    max-width: 320px;
    transform: none !important;
    z-index: 999999 !important;
  }
}

.lang-ar .user-dropdown-menu {
  direction: rtl;
}

.lang-en .user-dropdown-menu {
  direction: ltr;
}

.user-dropdown-menu::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 12px;
  height: 12px;
  background: #fff;
  border-left: 1px solid #f3f4f6;
  border-top: 1px solid #f3f4f6;
}

.user-dropdown-header {
  padding: 10px;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 5px;
}

.lang-ar .user-dropdown-header {
  text-align: right;
}

.lang-en .user-dropdown-header {
  text-align: left;
}

.user-name {
  font-weight: 800;
  font-size: 16px;
  color: #111827;
  margin: 0 0 5px;
}

.user-phone {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  justify-content: flex-end;
}

.user-dropdown-body {
  display: flex;
  flex-direction: column;
}

.user-dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  color: #374151;
  text-decoration: none;
  font-size: 15px;
  font-weight: 700;
  transition: background 0.2s;
  background: none;
  border: none;
  cursor: pointer;
}

.lang-ar .user-dropdown-item {
  text-align: right;
}

.lang-en .user-dropdown-item {
  text-align: left;
}

.user-dropdown-item:hover {
  background: #f9fafb;
}

.user-dropdown-item svg {
  color: #6b7280;
}

.user-dropdown-item.logout {
  color: #dc2626;
  margin-top: 5px;
}

.user-dropdown-item.logout:hover {
  background: #fef2f2;
}

.user-dropdown-item.logout svg {
  color: #dc2626;
}

.icon-btn .badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ef4444;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  min-width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  z-index: 2;
}

/* Search Modal */
.search-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 100px;
  z-index: 2000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.search-modal-content {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 70vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.search-header h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

.search-close-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: #f3f4f6;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.search-close-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.search-input-wrapper {
  display: flex;
  gap: 0.5rem;
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.search-input-wrapper input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: 0.2s;
}

.search-input-wrapper input:focus {
  outline: none;
  border-color: #000000;
  box-shadow: 0 0 0 3px rgba(135, 50, 96, 0.1);
}

.search-submit-btn {
  width: 48px;
  border: none;
  border-radius: 10px;
  background: #000000;
  color: #fff;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-submit-btn:hover {
  background: #4a1936;
}

.search-results {
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
  border: 1px solid transparent;
}

.search-result-item:hover {
  background: #f9fafb;
  border-color: #f3f4f6;
}

.search-result-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
  flex-shrink: 0;
}

.search-result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.search-result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.search-result-info h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.search-result-price {
  font-size: 0.95rem;
  font-weight: 800;
  color: #000000;
  margin: 0;
}

.search-no-results {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

.search-loading {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top-color: #000000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.mobile-menu-separator{
  padding-top: 10px;
}
/* WhatsApp */
.whatsapp-float {
  position: fixed;
  bottom: 100px; /* Raised a bit */
  right: 25px;
  background: #25d366;
  color: #fff;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 30px rgba(37, 211, 102, 0.4);
  z-index: 2000;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@media (max-width: 768px) {
  .whatsapp-float {
    width: 48px;
    height: 48px;
    bottom: 20px;
    right: 15px;
  }
  .whatsapp-float svg {
    width: 20px;
    height: 20px;
  }
}

html[dir="rtl"] .whatsapp-float {
  right: auto;
  left: 30px;
}

.whatsapp-float:hover {
  transform: scale(1.1) rotate(5deg);
}

.content {
  flex: 1;
}

/* Main Footer Styles - Exact Mockup Replica */
.main-footer {
  background: #000000;
  color: #ffffff;
  padding: 42px 0 28px;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-family: 'IBM Plex Sans Arabic', sans-serif;
}

.main-footer .container {
  max-width: 1400px;
  margin: 0 auto;
  padding-left: 5% !important;
  padding-right: 5% !important;
  width: 100%;
}

.footer-grid {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: 32px;
  margin-bottom: 28px;
}

.footer-col {
  flex: 0 0 auto;
}

.lang-ar .footer-grid,
[dir="rtl"] .footer-grid {
  direction: rtl;
  text-align: right;
}

.lang-en .footer-grid,
[dir="ltr"] .footer-grid {
  direction: ltr;
  text-align: left;
}

/* Col 1, 2, 3: Store, Account, Support */
.footer-title {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 18px 0;
  line-height: 1.2;
}

.footer-title::after {
  display: none !important;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-links li {
  margin: 0;
  padding: 0;
}

.footer-links a {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  color: #8f94a0;
  text-decoration: none;
  font-size: 13px;
  font-weight: 400;
  transition: color 0.2s ease;
  display: inline-block;
  line-height: 1.4;
}

.footer-links a:hover {
  color: #ffffff;
}

/* Col 4: Brand Column (Left in RTL, Right in LTR) */
.footer-col-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: right;
}

[dir="rtl"] .footer-col-brand,
.lang-ar .footer-col-brand {
  align-items: flex-start;
  text-align: right;
}

.footer-logo {
  display: inline-block;
  margin-bottom: 14px;
  text-decoration: none;
}

.footer-brand-logo-img {
  height: 22px;
  max-width: 130px;
  width: auto;
  display: block;
}

.footer-desc {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  color: #8f94a0;
  line-height: 1.65;
  font-size: 12px;
  font-weight: 400;
  margin: 0 0 16px 0;
  max-width: 290px;
}

/* Social icons: circular dark buttons */
.footer-social-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.social-circle-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #141517;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  text-decoration: none;
  transition: all 0.2s ease;
}

.social-circle-btn:hover {
  background: #252830;
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Payment Methods */
.footer-payment-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-title {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #8f94a0;
  margin: 0;
  text-align: right;
}

.payment-badges-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pay-card-badge {
  background: #ffffff;
  height: 22px;
  padding: 0 8px;
  border-radius: 3.5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.pay-card-badge .pay-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 10.5px;
  font-weight: 700;
  color: #000000;
  letter-spacing: -0.2px;
  line-height: 1;
}

/* Divider Line */
.footer-divider {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin: 28px 0 20px 0;
}

/* Bottom Bar */
.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 11.5px;
  color: #64748b;
  padding: 0;
  border-top: none;
}

.copyright {
  margin: 0;
  color: #64748b;
  font-weight: 400;
}

.developer-tag {
  color: #64748b;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 400;
}

.bekite-link {
  color: #8f94a0;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.bekite-link:hover {
  color: #ffffff;
}

@media (max-width: 960px) {
  .footer-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
  .footer-col {
    flex: 1 1 auto;
  }
  .footer-col-brand {
    max-width: 100%;
  }
}

@media (max-width: 640px) {
  .footer-grid {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
/* Responsive Adjustments */
.mobile-only {
  display: none !important;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
  .mobile-only {
    display: flex !important;
  }

  .nav-container {
    justify-content: space-between !important;
    padding: 0 15px !important;
  }

  .logo {
    order: 0;
    gap: 8px;
  }

  .logo-text {
    font-size: 18px !important;
  }

  .logo-icon {
    width: auto;
    height: 40px;
  }

  .mobile-order-2 {
    order: 2 !important;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .nav-icons {
    gap: 5px;
  }

  /* Mobile Top Bar */
  .top-bar-content {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 0 !important;
    width: 100% !important;
    padding: 0 8px !important;
  }
  .top-bar-content::-webkit-scrollbar { display: none; }

  .top-bar-item {
    font-size: 0.68rem !important;
    white-space: nowrap;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 4px !important;
  }

  .top-bar-item svg {
    width: 12px !important;
    height: 12px !important;
  }

  .sparkle {
    font-size: 0.75rem !important;
  }

  .top-bar-divider {
    display: block !important;
    height: 10px !important;
    width: 1px !important;
    background: rgba(255,255,255,0.2) !important;
    margin: 0 10px !important;
  }

  @media (max-width: 360px) {
    .top-bar-item {
      font-size: 0.62rem !important;
    }
    .top-bar-item svg {
      width: 11px !important;
      height: 11px !important;
    }
    .top-bar-divider {
      margin: 0 6px !important;
    }
  }

  .coupon-info {
    display: flex; 
  }
  
  .logo-text {
    font-size: 16px !important;
  }


  /* Mobile Menu Styles */
  .mobile-menu-overlay {
    position: fixed;
    top: 100px; /* Adjusted to be right below the navbar */
    left: 0;
    width: 100%;
    height: calc(100vh - 100px);
    background: #fff;
    z-index: 9999999;
    padding: 10px 15px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .mobile-menu-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .mobile-menu-links {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 20px;
  }

  .mobile-link {
    text-decoration: none;
    color: #111827;
    font-size: 1.2rem;
    font-weight: 700;
    padding: 15px 20px;
    border-radius: 12px;
    transition: all 0.2s;
    border-bottom: 1px solid #f9fafb;
  }

  .mobile-link.active {
    background: #000000;
    color: #fff;
  }

  .mobile-menu-footer {
    margin-top: 30px;
    padding: 20px 0;
    display: flex;
    justify-content: space-around;
    align-items: center;
    border-top: 1px solid #f3f4f6;
  }

  .footer-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: #111827;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    background: none;
    border: none;
  }

  .footer-grid {
    display: flex;
    flex-direction: column;
    gap: 32px;
    margin-bottom: 32px;
  }

  .footer-col.brand-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .footer-title::after {
    right: 0;
    transform: none;
  }

  .social-links {
    justify-content: flex-start;
    gap: 12px;
    width: 100%;
  }

  .lang-en .social-links {
    justify-content: flex-start;
  }

  .social-links a {
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
  }

  .contact-list li {
    justify-content: flex-start;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  /* Transitions */
  .slide-down-enter-active, .slide-down-leave-active {
    transition: all 0.3s ease-out;
  }
  .slide-down-enter-from, .slide-down-leave-to {
    transform: translateY(-20px);
    opacity: 0;
  }
}

.social-section {
  margin-top: 10px;
}

.social-title {
  font-size: 14px;
  color: rgba(255,255,255,0.6);
  margin-bottom: 15px;
  font-weight: 600;
}

.contact-icon-wrapper {
  width: 32px;
  height: 32px;
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.contact-icon-wrapper i {
  margin-top: 0 !important;
  font-size: 14px !important;
}

.contact-list a {
  color: inherit;
  text-decoration: none;
}

</style>
