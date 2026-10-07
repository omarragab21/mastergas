<template>
  <div class="profile-page" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <div class="container main-container">
      <!-- Breadcrumbs -->
      <nav class="breadcrumb-flow" aria-label="breadcrumb">
        <router-link to="/" class="crumb-link">{{ locale === 'ar' ? 'الرئيسية' : 'Home' }}</router-link>
        <span class="crumb-separator" aria-hidden="true">
          <svg class="crumb-arrow-svg" width="4" height="7" viewBox="0 0 4 7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.59736 0.676858C3.51667 0.737802 3.2758 0.919755 3.13694 1.02812C2.85884 1.24516 2.48929 1.54171 2.12085 1.86161C1.75054 2.18313 1.38989 2.52089 1.12477 2.82095C0.991829 2.9714 0.890812 3.10357 0.825063 3.21264C0.763226 3.31521 0.750367 3.3758 0.750367 3.3758C0.750367 3.3758 0.763227 3.43462 0.825061 3.53719C0.890809 3.64625 0.991825 3.77842 1.12477 3.92888C1.38989 4.22893 1.75054 4.56669 2.12085 4.88821C2.4893 5.20811 2.85885 5.50467 3.13696 5.7217C3.27582 5.83007 3.51635 6.01177 3.59704 6.07271C3.7638 6.19553 3.79977 6.43053 3.67695 6.59729C3.55413 6.76405 3.31938 6.79968 3.15262 6.67686L3.15135 6.6759C3.06672 6.61198 2.81722 6.42353 2.67554 6.31296C2.39115 6.09103 2.0107 5.78581 1.62914 5.45453C1.24946 5.12487 0.860106 4.76204 0.562729 4.42548C0.41442 4.25763 0.281061 4.08748 0.182748 3.9244C0.0906402 3.77161 0 3.57816 0 3.37491C0 3.17165 0.0906433 2.97821 0.182751 2.82542C0.281064 2.66234 0.414422 2.49219 0.56273 2.32434C0.860105 1.98779 1.24945 1.62495 1.62914 1.29529C2.01068 0.964013 2.39113 0.658798 2.67552 0.436859C2.8173 0.326216 3.06681 0.137753 3.15127 0.0739647L3.15236 0.0731398C3.31912 -0.0496775 3.55411 -0.0142297 3.67692 0.152531C3.79974 0.319286 3.7641 0.554038 3.59736 0.676858Z" fill="#000000"/>
          </svg>
        </span>
        <router-link v-if="currentTab !== 'overview'" to="/profile" class="crumb-link">{{ locale === 'ar' ? 'الملف الشخصي' : 'Profile' }}</router-link>
        <span v-else class="crumb-current">{{ locale === 'ar' ? 'الملف الشخصي' : 'Profile' }}</span>
        <template v-if="currentTab !== 'overview'">
          <span class="crumb-separator" aria-hidden="true">
            <svg class="crumb-arrow-svg" width="4" height="7" viewBox="0 0 4 7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.59736 0.676858C3.51667 0.737802 3.2758 0.919755 3.13694 1.02812C2.85884 1.24516 2.48929 1.54171 2.12085 1.86161C1.75054 2.18313 1.38989 2.52089 1.12477 2.82095C0.991829 2.9714 0.890812 3.10357 0.825063 3.21264C0.763226 3.31521 0.750367 3.3758 0.750367 3.3758C0.750367 3.3758 0.763227 3.43462 0.825061 3.53719C0.890809 3.64625 0.991825 3.77842 1.12477 3.92888C1.38989 4.22893 1.75054 4.56669 2.12085 4.88821C2.4893 5.20811 2.85885 5.50467 3.13696 5.7217C3.27582 5.83007 3.51635 6.01177 3.59704 6.07271C3.7638 6.19553 3.79977 6.43053 3.67695 6.59729C3.55413 6.76405 3.31938 6.79968 3.15262 6.67686L3.15135 6.6759C3.06672 6.61198 2.81722 6.42353 2.67554 6.31296C2.39115 6.09103 2.0107 5.78581 1.62914 5.45453C1.24946 5.12487 0.860106 4.76204 0.562729 4.42548C0.41442 4.25763 0.281061 4.08748 0.182748 3.9244C0.0906402 3.77161 0 3.57816 0 3.37491C0 3.17165 0.0906433 2.97821 0.182751 2.82542C0.281064 2.66234 0.414422 2.49219 0.56273 2.32434C0.860105 1.98779 1.24945 1.62495 1.62914 1.29529C2.01068 0.964013 2.39113 0.658798 2.67552 0.436859C2.8173 0.326216 3.06681 0.137753 3.15127 0.0739647L3.15236 0.0731398C3.31912 -0.0496775 3.55411 -0.0142297 3.67692 0.152531C3.79974 0.319286 3.7641 0.554038 3.59736 0.676858Z" fill="#000000"/>
            </svg>
          </span>
          <span class="crumb-current">{{ currentTabBreadcrumbTitle }}</span>
        </template>
      </nav>

      <!-- Mobile Horizontal Scroll Navigation Tabs -->
      <div class="profile-mobile-tabs-container">
        <div class="profile-mobile-tabs">
          <router-link to="/profile" class="mobile-tab-btn" :class="{ active: currentTab === 'overview' }">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 14l3.5-3.5"/>
              <path d="M20.3 18c.4-1.2.7-2.6.7-4a9 9 0 0 0-18 0c0 1.4.3 2.8.7 4"/>
            </svg>
            <span>{{ t('profile.overview') || 'نظرة عامة' }}</span>
          </router-link>
          <router-link to="/profile?tab=orders" class="mobile-tab-btn" :class="{ active: currentTab === 'orders' }">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>{{ t('profile.orders') || 'طلباتي' }}</span>
          </router-link>
          <router-link to="/profile?tab=addresses" class="mobile-tab-btn" :class="{ active: currentTab === 'addresses' }">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>{{ t('profile.addresses') || 'العناوين' }}</span>
          </router-link>
          <router-link to="/profile?tab=wallet" class="mobile-tab-btn" :class="{ active: currentTab === 'wallet' }">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="3"></rect>
              <path d="M2 10h20"></path>
              <circle cx="17" cy="14" r="1.5" fill="currentColor"></circle>
            </svg>
            <span>{{ t('profile.wallet') || 'المحفظة' }}</span>
          </router-link>
          <router-link to="/profile?tab=notifications" class="mobile-tab-btn" :class="{ active: currentTab === 'notifications' }">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span>{{ t('profile.notifications') || 'الإشعارات' }}</span>
            <span class="mobile-tab-badge danger" v-if="notifCount > 0">{{ notifCount }}</span>
          </router-link>
          <router-link to="/profile?tab=returns" class="mobile-tab-btn" :class="{ active: currentTab === 'returns' }">
            <i class="fas fa-rotate-left" aria-hidden="true"></i>
            <span>{{ t('profile.returns') || 'المرتجعات' }}</span>
          </router-link>
          <router-link to="/profile?tab=wishlist" class="mobile-tab-btn" :class="{ active: currentTab === 'wishlist' }">
            <i class="far fa-heart" aria-hidden="true"></i>
            <span>{{ t('profile.wishlist') || 'المفضلة' }}</span>
            <span class="mobile-tab-badge" v-if="wishlistCount > 0">{{ wishlistCount }}</span>
          </router-link>
          <router-link to="/profile?tab=info" class="mobile-tab-btn" :class="{ active: currentTab === 'info' }">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>{{ t('profile.personal_info') || 'الملف الشخصي' }}</span>
          </router-link>
        </div>
      </div>

      <div class="main-content-layout">
        <!-- Sidebar Filter Panel (on the right in RTL) -->
        <aside class="sidebar-filter-panel">
          <nav class="sidebar-menu">
            <router-link to="/profile" class="menu-item menu-item-dashboard" :class="{ active: currentTab === 'overview' }">
              <div class="menu-icon-frame">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.00008 4.50008C6.06708 4.50008 4.50008 6.06708 4.50008 8.00008C4.50008 8.27622 4.27622 8.50008 4.00008 8.50008C3.72394 8.50008 3.50008 8.27622 3.50008 8.00008C3.50008 5.5148 5.5148 3.50008 8.00008 3.50008C8.8189 3.50008 9.58805 3.71923 10.2504 4.10241C10.4895 4.24068 10.5712 4.54654 10.4329 4.78557C10.2946 5.0246 9.98875 5.10628 9.74972 4.96801C9.23542 4.67051 8.63841 4.50008 8.00008 4.50008Z" fill="currentColor"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M11.6627 5.6238C11.8705 5.80564 11.8915 6.12152 11.7097 6.32934L9.46384 8.89605C9.69583 9.20314 9.83342 9.58555 9.83342 10.0001C9.83342 11.0126 9.0126 11.8334 8.00008 11.8334C6.98756 11.8334 6.16675 11.0126 6.16675 10.0001C6.16675 8.98757 6.98756 8.16676 8.00008 8.16676C8.23445 8.16676 8.45855 8.21073 8.66458 8.29089L10.9571 5.67084C11.139 5.46302 11.4548 5.44196 11.6627 5.6238ZM8.00008 9.16676C7.53984 9.16676 7.16675 9.53985 7.16675 10.0001C7.16675 10.4603 7.53984 10.8334 8.00008 10.8334C8.46032 10.8334 8.83342 10.4603 8.83342 10.0001C8.83342 9.53985 8.46032 9.16676 8.00008 9.16676Z" fill="currentColor"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M8.0382 1.16675H7.96197C6.5015 1.16674 5.35438 1.16673 4.45876 1.28714C3.54099 1.41054 2.81282 1.66856 2.24069 2.24069C1.66856 2.81282 1.41054 3.54099 1.28714 4.45876C1.16673 5.35438 1.16674 6.50149 1.16675 7.96197V8.0382C1.16674 9.49867 1.16673 10.6458 1.28714 11.5414C1.41054 12.4592 1.66856 13.1873 2.24069 13.7595C2.81282 14.3316 3.54099 14.5896 4.45876 14.713C5.35437 14.8334 6.50148 14.8334 7.96195 14.8334H8.03819C9.49866 14.8334 10.6458 14.8334 11.5414 14.713C12.4592 14.5896 13.1873 14.3316 13.7595 13.7595C14.3316 13.1873 14.5896 12.4592 14.713 11.5414C14.8334 10.6458 14.8334 9.49868 14.8334 8.03822V7.96197C14.8334 6.50151 14.8334 5.35437 14.713 4.45876C14.5896 3.54099 14.3316 2.81282 13.7595 2.24069C13.1873 1.66856 12.4592 1.41054 11.5414 1.28714C10.6458 1.16673 9.49867 1.16674 8.0382 1.16675ZM2.9478 2.9478C3.30316 2.59243 3.78513 2.38671 4.59201 2.27823C5.41328 2.16781 6.49317 2.16675 8.00008 2.16675C9.507 2.16675 10.5869 2.16781 11.4082 2.27823C12.215 2.38671 12.697 2.59243 13.0524 2.9478C13.4077 3.30316 13.6135 3.78513 13.7219 4.59201C13.8324 5.41328 13.8334 6.49317 13.8334 8.00008C13.8334 9.507 13.8324 10.5869 13.7219 11.4082C13.6135 12.215 13.4077 12.697 13.0524 13.0524C12.697 13.4077 12.215 13.6135 11.4082 13.7219C10.5869 13.8324 9.507 13.8334 8.00008 13.8334C6.49317 13.8334 5.41328 13.8324 4.59201 13.7219C3.78513 13.6135 3.30316 13.4077 2.9478 13.0524C2.59243 12.697 2.38671 12.215 2.27823 11.4082C2.16781 10.5869 2.16675 9.507 2.16675 8.00008C2.16675 6.49317 2.16781 5.41328 2.27823 4.59201C2.38671 3.78513 2.59243 3.30316 2.9478 2.9478Z" fill="currentColor"/>
                </svg>
              </div>
              <span class="menu-text">{{ t('profile.overview') || 'نظرة عامة' }}</span>
            </router-link>

            <router-link to="/profile?tab=orders" class="menu-item menu-item-orders" :class="{ active: currentTab === 'orders' }">
              <div class="menu-icon-frame">
                <svg width="20" height="20" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M0.0125314 0.832481C0.0125314 0.556339 0.236389 0.332481 0.512531 0.332481L1.13816 0.332481C1.97942 0.332481 2.71272 0.905026 2.91676 1.72117L2.91906 1.73039L3.25543 3.33249L11.8111 3.33249C12.147 3.33244 12.4561 3.33239 12.703 3.3716C12.9795 3.4155 13.2678 3.5213 13.4717 3.80193C13.668 4.07205 13.6931 4.37749 13.6738 4.65714C13.6557 4.92059 13.5905 5.24415 13.5163 5.6127L13.51 5.64388C13.2397 6.9867 12.9736 8.25296 12.348 9.16606C12.0239 9.63917 11.6022 10.0225 11.0411 10.2829C10.4858 10.5406 9.81994 10.6658 9.02135 10.6658L4.4877 10.6658C3.94091 10.6678 3.45982 11.0858 3.3634 11.6658L10.5125 11.6658C11.341 11.6658 12.0125 12.3374 12.0125 13.1658C12.0125 13.9942 11.341 14.6658 10.5125 14.6658C9.6841 14.6658 9.01253 13.9942 9.01253 13.1658C9.01253 12.9905 9.04261 12.8222 9.09788 12.6658L7.26051 12.6658C7.31579 12.8222 7.34586 12.9905 7.34586 13.1658C7.34586 13.9942 6.67429 14.6658 5.84586 14.6658C5.01744 14.6658 4.34586 13.9942 4.34586 13.1658C4.34586 12.9905 4.37594 12.8222 4.43122 12.6658L3.12015 12.6658C2.67348 12.6658 2.34586 12.2946 2.34586 11.8801C2.34586 10.9946 2.85562 10.2134 3.6046 9.86244L2.37249 3.99389C2.3597 3.95639 2.35125 3.91688 2.34773 3.87596L1.94454 1.95556C1.84898 1.58893 1.51775 1.33248 1.13816 1.33248L0.512532 1.33248C0.236389 1.33248 0.0125314 1.10862 0.0125314 0.832481ZM10.5125 12.6658C10.2364 12.6658 10.0125 12.8897 10.0125 13.1658C10.0125 13.442 10.2364 13.6658 10.5125 13.6658C10.7887 13.6658 11.0125 13.442 11.0125 13.1658C11.0125 12.8897 10.7887 12.6658 10.5125 12.6658ZM5.34586 13.1658C5.34586 12.8897 5.56972 12.6658 5.84586 12.6658C6.12201 12.6658 6.34586 12.8897 6.34586 13.1658C6.34586 13.442 6.12201 13.6658 5.84586 13.6658C5.56972 13.6658 5.34586 13.442 5.34586 13.1658ZM4.76854 9.66582L4.76586 9.66582L4.58512 9.66582L3.46538 4.33249L11.7752 4.33249C12.1593 4.33249 12.3872 4.33398 12.5462 4.35923C12.6186 4.37073 12.6503 4.38376 12.661 4.38921L12.6632 4.39038C12.6645 4.3922 12.6684 4.3987 12.6723 4.41855C12.6779 4.44717 12.6824 4.49869 12.6762 4.58848C12.6631 4.7788 12.6121 5.03738 12.5297 5.44653C12.2482 6.8449 12.0108 7.88894 11.5231 8.60085C11.2905 8.94025 11.0031 9.19809 10.6202 9.37579C10.2315 9.55613 9.71859 9.66582 9.02135 9.66582L4.76854 9.66582Z" fill="currentColor"/>
                </svg>
              </div>
              <span class="menu-text">{{ t('profile.orders') || 'طلباتي' }}</span>
            </router-link>

            <router-link to="/profile?tab=addresses" class="menu-item menu-item-addresses" :class="{ active: currentTab === 'addresses' }">
              <div class="menu-icon-frame">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M8.00018 8.16658C6.80551 8.16658 5.83351 7.19458 5.83351 5.99992C5.83351 4.80525 6.80551 3.83325 8.00018 3.83325C9.19484 3.83325 10.1668 4.80525 10.1668 5.99992C10.1668 7.19458 9.19484 8.16658 8.00018 8.16658ZM8.00018 4.83325C7.35684 4.83325 6.83351 5.35659 6.83351 5.99992C6.83351 6.64325 7.35684 7.16658 8.00018 7.16658C8.64351 7.16658 9.16684 6.64325 9.16684 5.99992C9.16684 5.35659 8.64351 4.83325 8.00018 4.83325Z" fill="currentColor"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M8.00015 12.4999C7.55615 12.4999 7.13548 12.3306 6.81548 12.0233C6.65339 11.8663 6.48878 11.7094 6.32229 11.5506L6.30614 11.5352C4.32482 9.64924 1.85882 7.30191 3.22815 4.0106C4.01815 2.10993 5.93615 0.833252 8.00015 0.833252C10.0642 0.833252 11.9828 2.10993 12.7728 4.0106C14.1467 7.31378 11.6604 9.67236 9.66308 11.567C9.50108 11.7203 9.34082 11.8726 9.18482 12.0226C8.86482 12.3306 8.44415 12.4999 8.00015 12.4999ZM8.00015 1.83325C6.33482 1.83325 4.78815 2.86258 4.15149 4.39458C3.04619 7.05116 5.05403 8.96247 6.9953 10.8104C7.16997 10.9764 7.34214 11.1406 7.51014 11.3032C7.64148 11.4292 7.81615 11.4999 8.00015 11.4999C8.18415 11.4999 8.35883 11.4299 8.49149 11.3026C8.61354 11.1852 8.73798 11.067 8.86358 10.9476L8.97483 10.8419C10.9342 8.98391 12.9595 7.06258 11.8502 4.39458C11.2128 2.86258 9.66548 1.83325 8.00015 1.83325Z" fill="currentColor"/>
                  <path d="M3.50018 13.3333C3.50018 14.5926 5.83285 15.1666 8.00018 15.1666C10.1675 15.1666 12.5002 14.5926 12.5002 13.3333C12.5002 13.0573 12.2742 12.8333 12.0002 12.8333C11.7262 12.8333 11.5035 13.0539 11.5002 13.3273C11.4215 13.5613 10.2402 14.1666 8.00018 14.1666C5.76018 14.1666 4.57885 13.5619 4.50018 13.3273C4.49685 13.0539 4.27618 12.8333 4.00018 12.8333C3.72418 12.8333 3.50018 13.0573 3.50018 13.3333Z" fill="currentColor"/>
                </svg>
              </div>
              <span class="menu-text">{{ t('profile.addresses') || 'العناوين' }}</span>
            </router-link>

            <!-- User request: "وغير الكارت دي، حاسس ان المحفظة دي كبيرة عليهم" -->
            <router-link to="/profile?tab=wallet" class="menu-item menu-item-wallet" :class="{ active: currentTab === 'wallet' }">
              <div class="menu-icon-frame">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 9.99972H22.0016M4.00016 4.99915H20.0014C21.1061 4.99915 22.0016 5.89468 22.0016 6.99937V17.0005C22.0016 18.1052 21.1061 19.0007 20.0014 19.0007H4.00016C2.8955 19.0007 2 18.1052 2 17.0005V6.99937C2 5.89468 2.8955 4.99915 4.00016 4.99915Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </div>
              <span class="menu-text">{{ t('profile.wallet') || 'المحفظة' }}</span>
            </router-link>

            <router-link to="/profile?tab=notifications" class="menu-item menu-item-notifications" :class="{ active: currentTab === 'notifications' }">
              <div class="menu-icon-frame">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M8.00041 0.833252C4.96946 0.833252 2.48385 3.21432 2.48382 6.18615C2.48376 6.87091 2.43639 7.38167 2.11524 7.84151C2.05638 7.92457 1.99406 8.00723 1.92582 8.09775L1.87118 8.17031C1.78362 8.28686 1.68916 8.41464 1.60079 8.54904C1.42566 8.81538 1.25266 9.13922 1.19308 9.51832C0.998252 10.7579 1.89706 11.5496 2.76858 11.9C5.86345 13.1443 10.1374 13.1443 13.2322 11.9C14.1038 11.5496 15.0026 10.7579 14.8077 9.51832C14.7481 9.13922 14.5751 8.81538 14.4 8.54904C14.3116 8.41464 14.2172 8.28686 14.1296 8.17031L14.075 8.09781C14.0068 8.00734 13.9444 7.92457 13.8856 7.84154C13.5644 7.38169 13.517 6.87099 13.517 6.18619C13.517 3.21434 11.0314 0.833252 8.00041 0.833252ZM3.48382 6.18619C3.48382 3.79763 5.49021 1.83325 8.00041 1.83325C10.5106 1.83325 12.517 3.79763 12.517 6.18619C12.5171 6.88791 12.5527 7.68069 13.067 8.41585L13.0686 8.4182C13.1373 8.51515 13.2114 8.61344 13.2809 8.70564L13.3301 8.77095C13.4158 8.88504 13.4944 8.99183 13.5645 9.09846C13.7063 9.3142 13.7923 9.49832 13.8199 9.67358C13.9086 10.238 13.5397 10.6985 12.8592 10.9722C10.0037 12.1203 5.99711 12.1203 3.14163 10.9722C2.46108 10.6985 2.09225 10.238 2.18096 9.67358C2.2085 9.49832 2.29448 9.3142 2.43634 9.09846C2.50645 8.99183 2.58499 8.88504 2.6707 8.77095L2.71991 8.70562C2.78943 8.61343 2.86356 8.51513 2.9322 8.4182L2.93385 8.41585C3.44812 7.68069 3.48376 6.88791 3.48382 6.18619Z" fill="currentColor"/>
                  <path d="M6.30864 13.6059C6.09102 13.4359 5.7768 13.4745 5.60682 13.6922C5.43683 13.9098 5.47545 14.224 5.69307 14.394C6.31376 14.8788 7.12356 15.1666 8.00086 15.1666C8.87815 15.1666 9.68796 14.8788 10.3086 14.394C10.5263 14.224 10.5649 13.9098 10.3949 13.6922C10.2249 13.4745 9.91069 13.4359 9.69307 13.6059C9.25224 13.9502 8.66027 14.1666 8.00086 14.1666C7.34144 14.1666 6.74947 13.9502 6.30864 13.6059Z" fill="currentColor"/>
                </svg>
              </div>
              <span class="menu-text">
                {{ t('profile.notifications') || 'الإشعارات' }}
                <span class="sidebar-badge" v-if="notifCount > 0">{{ notifCount }}</span>
              </span>
            </router-link>

            <router-link to="/profile?tab=info" class="menu-item menu-item-profile" :class="{ active: currentTab === 'info' }">
              <div class="menu-icon-frame">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M5.66665 6.33325C5.66665 5.04459 6.71131 3.99992 7.99998 3.99992C9.28864 3.99992 10.3333 5.04459 10.3333 6.33325C10.3333 7.62192 9.28864 8.66658 7.99998 8.66658C6.71131 8.66658 5.66665 7.62192 5.66665 6.33325ZM7.99998 4.99992C7.2636 4.99992 6.66665 5.59687 6.66665 6.33325C6.66665 7.06963 7.2636 7.66658 7.99998 7.66658C8.73636 7.66658 9.33331 7.06963 9.33331 6.33325C9.33331 5.59687 8.73636 4.99992 7.99998 4.99992Z" fill="currentColor"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M0.833313 7.99992C0.833313 4.04188 4.04194 0.833252 7.99998 0.833252C11.958 0.833252 15.1666 4.04188 15.1666 7.99992C15.1666 11.958 11.958 15.1666 7.99998 15.1666C4.04194 15.1666 0.833313 11.958 0.833313 7.99992ZM7.99998 1.83325C4.59422 1.83325 1.83331 4.59416 1.83331 7.99992C1.83331 9.58089 2.42825 11.0229 3.40646 12.1143L3.60621 11.7647C4.28871 10.5703 5.55886 9.83325 6.93447 9.83325H9.06566C10.4413 9.83325 11.7114 10.5703 12.3939 11.7647L12.5936 12.1142C13.5717 11.0228 14.1666 9.58083 14.1666 7.99992C14.1666 4.59416 11.4057 1.83325 7.99998 1.83325ZM11.8457 12.8208L11.5257 12.2609C11.0212 11.3781 10.0824 10.8333 9.06566 10.8333H6.93447C5.91771 10.8333 4.97891 11.3781 4.47445 12.2609L4.15441 12.8209C5.20881 13.6631 6.5456 14.1666 7.99998 14.1666C9.45441 14.1666 10.7912 13.6631 11.8457 12.8208Z" fill="currentColor"/>
                </svg>
              </div>
              <span class="menu-text">{{ t('profile.personal_info') || 'الملف الشخصي' }}</span>
            </router-link>

            <router-link to="/profile?tab=returns" class="menu-item menu-item-returns" :class="{ active: currentTab === 'returns' }">
              <div class="menu-icon-frame">
                <img src="/assets/return-request.svg" alt="" class="profile-menu-asset-icon" aria-hidden="true" />
              </div>
              <span class="menu-text">{{ t('profile.returns') || 'المرتجعات' }}</span>
            </router-link>

            <router-link to="/profile?tab=wishlist" class="menu-item menu-item-wishlist" :class="{ active: currentTab === 'wishlist' }">
              <div class="menu-icon-frame">
                <i class="far fa-heart profile-menu-fa-icon" aria-hidden="true"></i>
              </div>
              <span class="menu-text">
                {{ t('profile.wishlist') || 'المفضلة' }}
                <span class="sidebar-badge wishlist-menu-badge" v-if="wishlistCount > 0">{{ wishlistCount }}</span>
              </span>
            </router-link>

            <div class="sidebar-divider"></div>

            <button type="button" class="menu-item menu-item-logout" @click="handleLogout">
              <div class="menu-icon-frame">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.4996 4.23015C10.4399 2.72674 9.18707 1.46044 7.53154 1.50095C7.1469 1.51036 6.69475 1.63799 5.98539 1.83823L5.89835 1.8628C3.9492 2.41259 2.03736 3.39632 1.58239 5.71608C1.49991 6.13661 1.49995 6.60078 1.5 7.37952L1.5 8.62049C1.49995 9.39922 1.49991 9.8634 1.58239 10.2839C2.03736 12.6037 3.9492 13.5874 5.89835 14.1372L5.98537 14.1618C6.69473 14.362 7.1469 14.4897 7.53154 14.4991C9.18707 14.5396 10.4399 13.2733 10.4996 11.7698C10.5106 11.4939 10.2958 11.2614 10.0199 11.2504C9.74394 11.2394 9.51137 11.4542 9.5004 11.7301C9.46202 12.696 8.65707 13.5263 7.556 13.4994C7.31481 13.4935 6.99534 13.4076 6.16982 13.1748C4.30363 12.6484 2.90339 11.8234 2.56369 10.0915C2.50228 9.77831 2.50001 9.41783 2.50001 8.55817V7.44183C2.50001 6.58218 2.50228 6.2217 2.5637 5.90854C2.90339 4.17656 4.30363 3.35163 6.16982 2.82524C6.99534 2.59239 7.31481 2.50655 7.556 2.50065C8.65706 2.47371 9.46201 3.30403 9.5004 4.26986C9.51137 4.54579 9.74394 4.76058 10.0199 4.74961C10.2958 4.73865 10.5106 4.50608 10.4996 4.23015Z" fill="#E53333"/>
                  <path d="M12.6818 5.97479C12.4838 5.78232 12.1673 5.78682 11.9748 5.98484C11.7823 6.18286 11.7868 6.49941 11.9848 6.69187C12.0926 6.79658 12.264 6.9314 12.4271 7.05955L12.4651 7.08936C12.6289 7.21797 12.8041 7.3555 12.9699 7.49596L12.9746 7.5H6.66667C6.39052 7.5 6.16667 7.72386 6.16667 8C6.16667 8.27614 6.39052 8.5 6.66667 8.5H12.9746L12.9699 8.50404C12.8041 8.6445 12.6289 8.78203 12.4651 8.91064L12.4271 8.94044C12.264 9.0686 12.0926 9.20342 11.9848 9.30813C11.7868 9.50059 11.7823 9.81714 11.9748 10.0152C12.1673 10.2132 12.4838 10.2177 12.6818 10.0252C12.7427 9.96607 12.8639 9.86899 13.0448 9.72686L13.0848 9.69548C13.2462 9.56877 13.4356 9.42013 13.6163 9.26698C13.81 9.10284 14.0112 8.91912 14.1676 8.73547C14.246 8.64344 14.3233 8.53971 14.3831 8.42812C14.4407 8.32049 14.5 8.17219 14.5 8C14.5 7.82781 14.4407 7.67951 14.3831 7.57188C14.3233 7.46029 14.246 7.35656 14.1676 7.26452C14.0112 7.08088 13.81 6.89716 13.6163 6.73302C13.4356 6.57988 13.2462 6.43124 13.0848 6.30453L13.0448 6.27314C12.8639 6.13101 12.7427 6.03393 12.6818 5.97479Z" fill="#E53333"/>
                </svg>
              </div>
              <span class="menu-text">{{ t('profile.logout') || 'تسجيل الخروج' }}</span>
            </button>
          </nav>
        </aside>

        <!-- Main Left Content Area -->
        <main class="left-content-area">
          <!-- Overview Tab -->
          <div v-if="currentTab === 'overview'" class="overview-content">
            <!-- stats-row -->
            <div class="stats-row">
              <!-- stat-card 1: الطلبات النشطة (on right in RTL) -->
              <div class="stat-card" @click="router.push('/profile?tab=orders')" style="cursor: pointer;">
                <div class="stat-txt">
                  <span class="stat-label">الطلبات النشطة</span>
                  <span class="stat-val">{{ activeOrdersCountText }}</span>
                </div>
                <div class="icon-container">
                  <svg width="28" height="28" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.9998 13.4999C11.5027 13.4999 11.0998 13.9029 11.0998 14.3999C11.0998 14.897 11.5027 15.2999 11.9998 15.2999L16.7998 15.2999C17.2968 15.2999 17.6998 14.897 17.6998 14.3999C17.6998 13.9029 17.2968 13.4999 16.7998 13.4999L11.9998 13.4999Z" fill="black"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M18.65 1.49994L10.1501 1.49994C9.02919 1.49992 8.1157 1.49991 7.37187 1.58079C6.59514 1.66525 5.92063 1.84454 5.30387 2.25571C4.68712 2.66688 4.26219 3.22055 3.88548 3.90505C3.52473 4.56056 3.1734 5.40377 2.7423 6.43846L1.58001 9.22797C1.5321 9.33338 1.50393 9.44966 1.50021 9.57209C1.49993 9.58121 1.49979 9.59031 1.49979 9.59941L1.49979 16.1845C1.49977 18.5492 1.49975 20.419 1.70367 21.8816C1.9137 23.388 2.35533 24.5947 3.33716 25.5415C4.31441 26.4838 5.55231 26.9037 7.09862 27.1042C8.6088 27.3 10.5422 27.3 13.0004 27.2999L15.7992 27.2999C18.2573 27.3 20.1908 27.3 21.7009 27.1042C23.2473 26.9037 24.4852 26.4838 25.4624 25.5415C26.4442 24.5947 26.8859 23.388 27.0959 21.8816C27.2998 20.419 27.2998 18.5493 27.2998 16.1845L27.2998 9.62858C27.3033 9.51915 27.2869 9.40752 27.2482 9.29892C27.2422 9.28204 27.2357 9.26539 27.2288 9.249L26.0577 6.43838C25.6266 5.40378 25.2753 4.56051 24.9146 3.90505C24.5379 3.22055 24.1129 2.66688 23.4962 2.25571C22.8794 1.84454 22.2049 1.66525 21.4282 1.58079C20.6843 1.49991 19.7709 1.49992 18.65 1.49994ZM10.2 3.29994L13.4998 3.29994L13.4998 8.69994L3.75002 8.69994L4.38464 7.17686C4.8396 6.08495 5.15437 5.3327 5.46244 4.77291C5.7599 4.23241 6.01216 3.94685 6.30233 3.7534C6.59251 3.55995 6.95312 3.43694 7.56645 3.37024C8.20167 3.30117 9.01711 3.29994 10.2 3.29994ZM15.2998 3.29994L15.2998 8.69994L25.05 8.69994L24.4154 7.17686C23.9604 6.08495 23.6457 5.3327 23.3376 4.77292C23.0401 4.23241 22.7879 3.94685 22.4977 3.7534C22.2075 3.55995 21.8469 3.43694 21.2336 3.37024C20.5984 3.30117 19.7829 3.29994 18.6 3.29994L15.2998 3.29994ZM3.29979 10.4999L25.4998 10.4999L25.4998 16.1142C25.4998 18.5649 25.4977 20.3091 25.3131 21.6331C25.1327 22.9276 24.7932 23.6862 24.213 24.2458C23.6281 24.8097 22.8279 25.143 21.4695 25.3191C20.0885 25.4982 18.2718 25.4999 15.7331 25.4999L13.0665 25.4999C10.5277 25.4999 8.71105 25.4982 7.33005 25.3191C5.97168 25.143 5.17146 24.8097 4.58661 24.2458C4.00634 23.6862 3.66692 22.9276 3.48643 21.6331C3.30184 20.3091 3.29979 18.5649 3.29979 16.1142L3.29979 10.4999Z" fill="black"/>
                  </svg>
                </div>
              </div>

              <!-- stat-card 2: العناوين (on left in RTL) -->
              <div class="stat-card" @click="router.push('/profile?tab=addresses')" style="cursor: pointer;">
                <div class="stat-txt">
                  <span class="stat-label">العناوين</span>
                  <span class="stat-val">{{ addressesCountText }}</span>
                </div>
                <div class="icon-container">
                  <svg width="19" height="26" viewBox="0 0 19 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.30234 13.2C7.15194 13.2 5.40234 11.4504 5.40234 9.3C5.40234 7.1496 7.15194 5.4 9.30234 5.4C11.4527 5.4 13.2023 7.1496 13.2023 9.3C13.2023 11.4504 11.4527 13.2 9.30234 13.2ZM9.30234 7.2C8.14434 7.2 7.20234 8.142 7.20234 9.3C7.20234 10.458 8.14434 11.4 9.30234 11.4C10.4603 11.4 11.4023 10.458 11.4023 9.3C11.4023 8.142 10.4603 7.2 9.30234 7.2Z" fill="black"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.30229 21C8.50309 21 7.74589 20.6952 7.16989 20.142C6.87812 19.8595 6.58183 19.577 6.28214 19.2913L6.25307 19.2636C2.68668 15.8688 -1.7521 11.6436 0.712678 5.71922C2.13468 2.29802 5.58709 0 9.30229 0C13.0175 0 16.4711 2.29802 17.8931 5.71922C20.3662 11.665 15.8907 15.9104 12.2956 19.3207C12.004 19.5967 11.7155 19.8708 11.4347 20.1408C10.8587 20.6952 10.1015 21 9.30229 21ZM9.30229 1.8C6.30469 1.8 3.52069 3.65279 2.37469 6.41039C0.385156 11.1922 3.99927 14.6326 7.49356 17.9589C7.80796 18.2577 8.11788 18.5532 8.42028 18.846C8.65668 19.0728 8.97109 19.2 9.30229 19.2C9.63349 19.2 9.9479 19.074 10.1867 18.8448C10.4064 18.6335 10.6304 18.4207 10.8565 18.2059L11.0567 18.0156C14.5835 14.6712 18.2291 11.2128 16.2323 6.41039C15.0851 3.65279 12.2999 1.8 9.30229 1.8Z" fill="black"/>
                    <path d="M1.20234 22.5C1.20234 24.7668 5.40114 25.8 9.30234 25.8C13.2035 25.8 17.4023 24.7668 17.4023 22.5C17.4023 22.0032 16.9955 21.6 16.5023 21.6C16.0091 21.6 15.6083 21.9972 15.6023 22.4892C15.4607 22.9104 13.3343 24 9.30234 24C5.27034 24 3.14394 22.9116 3.00234 22.4892C2.99634 21.9972 2.59914 21.6 2.10234 21.6C1.60554 21.6 1.20234 22.0032 1.20234 22.5Z" fill="black"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- recent-orders-block -->
            <div class="recent-orders-block">
              <div class="recent-orders-header">
                <h3 class="recent-orders-title">آخر الطلبات</h3>
                <router-link to="/profile?tab=orders" class="view-all-link">
                  <span>عرض جميع الطلبات</span>
                  <svg class="chevron-left" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </router-link>
              </div>

              <div class="orders-list-compact">
                <div v-for="order in recentOrders" :key="order.id" class="order-row">
                  <!-- info on the right -->
                  <div class="order-info">
                    <span class="order-num" dir="ltr">{{ order.orderNumber }}</span>
                    <span class="order-date">{{ order.date }}</span>
                    <div class="price-unit">
                      <svg class="riyal-icon" width="11.41" height="12.75" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
                        <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                        <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                      </svg>
                      <span class="price-val">{{ order.total }}</span>
                    </div>
                    <span class="status-badge" :class="order.statusType">
                      {{ order.statusLabel }}
                    </span>
                  </div>

                  <!-- actions: عرض التفاصيل button on the left -->
                  <div class="order-actions">
                    <button type="button" class="order-btn" @click="viewOrderDetails(order)">
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Information Tab (Figma section-personal-info exact pixel-perfect) -->
          <div v-else-if="currentTab === 'info'" class="personal-info-tab-wrapper">
            <!-- View Mode (Exact Figma Mockup) -->
            <div v-if="!isEditingProfile && !showPasswordForm" class="section-personal-info">
              <!-- معلوماتك الشخصية -->
              <h2 class="personal-info-title">معلوماتك الشخصية</h2>

              <!-- info-rows -->
              <div class="info-rows">
                <!-- row-full-name -->
                <div class="info-row">
                  <span class="info-label">الاسم الكامل</span>
                  <span class="info-value">{{ displayUserName }}</span>
                </div>

                <!-- Line -->
                <div class="info-divider"></div>

                <!-- row-email -->
                <div class="info-row">
                  <span class="info-label">البريد الإلكتروني</span>
                  <span class="info-value">{{ displayUserEmail }}</span>
                </div>

                <!-- Line -->
                <div class="info-divider"></div>

                <!-- row-phone -->
                <div class="info-row">
                  <span class="info-label">رقم الجوال</span>
                  <span class="info-value">{{ displayUserPhone }}</span>
                </div>
              </div>

              <!-- edit-actions (Aligned to Right in RTL) -->
              <div class="edit-actions">
                <button type="button" class="btn-save" @click="startEditingProfile">
                  تعديل البيانات
                </button>
                <button type="button" class="btn-cancel" @click="openChangePasswordModal">
                  تغيير كلمة المرور
                </button>
              </div>
            </div>

            <!-- Edit Profile Mode -->
            <div v-else-if="isEditingProfile" class="section-personal-info edit-mode">
              <h2 class="personal-info-title">تعديل البيانات الشخصية</h2>

              <form @submit.prevent="handleUpdateProfile" class="personal-info-edit-form">
                <div class="info-rows">
                  <div class="info-row-edit">
                    <label class="info-label">الاسم الكامل</label>
                    <input type="text" v-model="form.name" class="personal-info-input" required />
                  </div>

                  <div class="info-divider"></div>

                  <div class="info-row-edit">
                    <label class="info-label">البريد الإلكتروني</label>
                    <input type="email" v-model="form.email" class="personal-info-input" dir="ltr" required />
                  </div>

                  <div class="info-divider"></div>

                  <div class="info-row-edit">
                    <label class="info-label">رقم الجوال</label>
                    <input type="text" v-model="form.phone" class="personal-info-input" dir="ltr" required />
                  </div>
                </div>

                <div class="edit-actions">
                  <button type="submit" class="btn-save" :disabled="loadingData">
                    {{ loadingData ? 'جاري الحفظ...' : 'حفظ التعديلات' }}
                  </button>
                  <button type="button" class="btn-cancel" @click="cancelEditingProfile">
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Addresses Tab -->
          <div v-else-if="currentTab === 'addresses'" class="content-view addresses-view-area">
            <!-- Add address row -->
            <div class="add-address-row">
              <button class="primary-add-button" @click="openAddAddress">
                <span>إضافة عنوان جديد</span>
              </button>
              <h2 class="addresses-main-title">العناوين المحفوظة</h2>
            </div>

            <!-- Addresses Grid -->
            <div class="addresses-grid-v2">
              <div 
                v-for="addr in addressesList" 
                :key="addr.id" 
                class="address-card-v2"
                :class="{ 'is-selected': addr.is_default }"
                @click="selectDefaultAddress(addr)"
              >
                <!-- Card Header -->
                <div class="card-header-v2" :class="{ 'has-default': addr.is_default }">
                  <span v-if="addr.is_default" class="default-address-tag">العنوان الافتراضي</span>
                  <div class="card-user-info-v2">
                    <span class="user-display-name">{{ addr.name || addr.full_name }}</span>
                    <div class="selection-indicator-v2" :class="{ selected: addr.is_default }">
                      <div v-if="addr.is_default" class="selection-inner-dot"></div>
                    </div>
                  </div>
                </div>

                <!-- Address Details -->
                <div class="address-details-v2">
                  <div class="detail-line-item" v-if="addr.phone">
                    <span>رقم الهاتف: {{ addr.phone }}</span>
                  </div>
                  <div class="detail-line-item" v-if="addr.city">
                    <span>{{ addr.city }}</span>
                  </div>
                  <div class="detail-line-item" v-if="addr.address">
                    <span>{{ addr.address }}</span>
                  </div>
                </div>

                <!-- Card Actions -->
                <div class="card-actions-v2" @click.stop>
                  <button type="button" class="card-action-btn delete-action-btn" @click="deleteAddress(addr.id)">
                    <span class="action-btn-text">حذف</span>
                    <span class="action-icon-wrap delete-icon-wrap">
                      <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.54414 3.83385e-07H6.50145C6.1646 -8.90362e-06 5.87885 -1.67812e-05 5.64172 0.0215703C5.39009 0.0444782 5.1557 0.0940931 4.92905 0.214611C4.83959 0.262175 4.75424 0.317072 4.67386 0.378739C4.47018 0.534988 4.32782 0.727689 4.20261 0.947154C4.08461 1.15397 3.9661 1.41397 3.82639 1.72049L3.54704 2.33333H0.5C0.223858 2.33333 0 2.55719 0 2.83333C0 3.10948 0.223858 3.33333 0.5 3.33333H1.02925L1.40553 9.57241C1.45583 10.4064 1.49573 11.068 1.57875 11.5966C1.66387 12.1386 1.80074 12.5899 2.07526 12.9848C2.32643 13.346 2.65004 13.651 3.0255 13.8802C3.59536 14.2281 4.26856 14.3084 5.15267 14.3331C5.42871 14.3409 5.65874 14.1234 5.66647 13.8473C5.6742 13.5713 5.4567 13.3413 5.18066 13.3335C4.30621 13.309 3.87176 13.2253 3.54657 13.0267C3.2897 12.8699 3.06824 12.6612 2.89632 12.4139C2.74297 12.1934 2.64009 11.9091 2.56663 11.4414C2.49192 10.9658 2.45437 10.3519 2.40217 9.48641L2.03106 3.33333H10.9682L10.7331 7.14001C10.7161 7.41563 10.9257 7.65286 11.2013 7.66988C11.4769 7.6869 11.7142 7.47727 11.7312 7.20165L11.9701 3.33333H12.5C12.7761 3.33333 13 3.10948 13 2.83333C13 2.55719 12.7761 2.33333 12.5 2.33333H9.51709L9.18942 1.65739C9.04612 1.36176 8.92446 1.11077 8.8047 0.911255C8.67757 0.699449 8.53464 0.51383 8.33341 0.363739C8.25388 0.304427 8.16967 0.251666 8.08161 0.205977C7.85877 0.0903652 7.62939 0.042721 7.38335 0.0207142C7.15157 -1.62721e-05 6.87267 -8.62543e-06 6.54414 3.83385e-07ZM8.40579 2.33333H4.64603L4.72737 2.15489C4.87843 1.82349 4.9784 1.60532 5.07118 1.44271C5.15925 1.28835 5.22244 1.21826 5.28254 1.17215C5.31907 1.14413 5.35787 1.11917 5.39853 1.09755C5.46541 1.06199 5.5554 1.03356 5.73239 1.01745C5.91883 1.00048 6.1588 1 6.52302 1C6.87835 1 7.11228 1.00046 7.29426 1.01674C7.46693 1.03218 7.55519 1.05944 7.62109 1.09363C7.66112 1.11439 7.69939 1.13838 7.73555 1.16534C7.79505 1.20972 7.85808 1.27726 7.9473 1.42589C8.04132 1.58255 8.14378 1.79284 8.29878 2.11259L8.40579 2.33333Z" fill="#E53333"/>
                        <path d="M12.1869 9.52023C12.3821 9.32498 12.3822 9.00839 12.1869 8.81313C11.9916 8.61786 11.6751 8.61785 11.4798 8.8131L9.49985 10.7929L7.52021 8.81341C7.32494 8.61815 7.00836 8.61816 6.8131 8.81343C6.61785 9.0087 6.61786 9.32528 6.81313 9.52054L8.79272 11.5L6.81313 13.4795C6.61786 13.6747 6.61785 13.9913 6.8131 14.1866C7.00836 14.3818 7.32494 14.3818 7.52021 14.1866L9.49985 12.2071L11.4798 14.1869C11.6751 14.3822 11.9916 14.3821 12.1869 14.1869C12.3822 13.9916 12.3821 13.675 12.1869 13.4798L10.207 11.5L12.1869 9.52023Z" fill="#E53333"/>
                      </svg>
                    </span>
                  </button>
                  <button type="button" class="card-action-btn edit-action-btn" @click="editAddress(addr)">
                    <span class="action-btn-text">تعديل</span>
                    <span class="action-icon-wrap edit-icon-wrap">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.5 1.69008e-07H6.46204C5.08001 -9.19404e-06 3.99179 -1.66694e-05 3.14156 0.114294C2.26918 0.231583 1.57285 0.477402 1.02513 1.02513C0.477402 1.57285 0.231583 2.26918 0.114294 3.14156C-1.66694e-05 3.99179 -9.19404e-06 5.08001 1.6901e-07 6.46204V6.53797C-9.19404e-06 7.91999 -1.66694e-05 9.00821 0.114294 9.85844C0.231583 10.7308 0.477402 11.4271 1.02513 11.9749C1.57285 12.5226 2.26918 12.7684 3.14156 12.8857C3.99179 13 5.08001 13 6.46204 13H6.53796C7.91999 13 9.00821 13 9.85844 12.8857C10.7308 12.7684 11.4271 12.5226 11.9749 11.9749C12.5226 11.4271 12.7684 10.7308 12.8857 9.85844C13 9.00821 13 7.91999 13 6.53796V6.5C13 6.22386 12.7761 6 12.5 6C12.2239 6 12 6.22386 12 6.5C12 7.92835 11.9989 8.94931 11.8946 9.72519C11.7922 10.4867 11.5987 10.9368 11.2678 11.2678C10.9368 11.5987 10.4867 11.7922 9.72519 11.8946C8.94931 11.9989 7.92835 12 6.5 12C5.07165 12 4.05069 11.9989 3.27481 11.8946C2.51331 11.7922 2.06319 11.5987 1.73223 11.2678C1.40128 10.9368 1.20776 10.4867 1.10538 9.72519C1.00106 8.94931 1 7.92835 1 6.5C1 5.07165 1.00106 4.05069 1.10538 3.27481C1.20776 2.51331 1.40128 2.06319 1.73223 1.73223C2.06319 1.40128 2.51331 1.20776 3.27481 1.10538C4.05069 1.00106 5.07165 1 6.5 1C6.77614 1 7 0.776143 7 0.5C7 0.223858 6.77614 1.69008e-07 6.5 1.69008e-07Z" fill="black"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12.4665 0.533532C11.7551 -0.177844 10.6017 -0.177844 9.89036 0.533533L5.41297 5.01091C4.76723 5.65649 4.37256 6.05107 4.10111 6.53684C3.9497 6.8078 3.81743 7.21879 3.7004 7.63936C3.58 8.07201 3.46147 8.56982 3.34833 9.04503L3.34694 9.05086C3.30672 9.21977 3.35702 9.39745 3.47979 9.52022C3.60257 9.643 3.78025 9.69329 3.94915 9.65307L3.95495 9.65169C4.43016 9.53854 4.92799 9.42001 5.36065 9.29961C5.78122 9.18258 6.19221 9.05031 6.46317 8.8989C6.94895 8.62745 7.34351 8.23279 7.9891 7.58704L12.4665 3.10965C13.1779 2.39828 13.1779 1.24491 12.4665 0.533532ZM10.5975 1.24064C10.9183 0.919787 11.4385 0.919787 11.7594 1.24064C12.0802 1.56149 12.0802 2.0817 11.7594 2.40255L11.1784 2.9835L10.0165 1.82159L10.5975 1.24064ZM9.3094 2.5287L10.4713 3.69061L7.33562 6.8263C6.61955 7.54237 6.32548 7.8303 5.97537 8.02594C5.82173 8.1118 5.51912 8.21752 5.09256 8.33622C4.91029 8.38694 4.71478 8.43759 4.51178 8.48823C4.56242 8.28523 4.61307 8.08973 4.66379 7.90745C4.78249 7.48089 4.88821 7.17828 4.97407 7.02464C5.16971 6.67453 5.45765 6.38046 6.17371 5.66439L9.3094 2.5287Z" fill="black"/>
                      </svg>
                    </span>
                  </button>
                </div>
              </div>

              <div v-if="addressesList.length === 0" class="empty-state">{{ t('profile.no_addresses') }}</div>
            </div>
          </div>

          <!-- Orders Tab (Figma left-content-area) -->
          <div v-else-if="currentTab === 'orders'" class="orders-tab-wrapper">
            <!-- 1. Orders List View (Shown when no order is selected) -->
            <div v-if="!selectedOrderDetails" class="orders-tab-view">
              <!-- filter-sort-bar -->
              <div class="filter-sort-bar">
                <!-- filter-tabs (Right in RTL) -->
                <div class="filter-tabs">
                  <button
                    type="button"
                    class="tab-btn"
                    :class="{ active: orderStatusFilter === 'all' }"
                    @click="orderStatusFilter = 'all'; orderCurrentPage = 1"
                  >
                    الكل
                  </button>
                  <button
                    type="button"
                    class="tab-btn"
                    :class="{ active: orderStatusFilter === 'processing' }"
                    @click="orderStatusFilter = 'processing'; orderCurrentPage = 1"
                  >
                    قيد التنفيذ
                  </button>
                  <button
                    type="button"
                    class="tab-btn"
                    :class="{ active: orderStatusFilter === 'completed' }"
                    @click="orderStatusFilter = 'completed'; orderCurrentPage = 1"
                  >
                    مكتملة
                  </button>
                  <button
                    type="button"
                    class="tab-btn"
                    :class="{ active: orderStatusFilter === 'cancelled' }"
                    @click="orderStatusFilter = 'cancelled'; orderCurrentPage = 1"
                  >
                    ملغاة
                  </button>
                </div>

                <!-- search-box (Left in RTL) -->
                <div class="search-box">
                  <div class="search-icon-wrap">
                    <svg class="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.5 9.5L12.5 12.5M5.83333 10.6667C3.16396 10.6667 1 8.50271 1 5.83333C1 3.16396 3.16396 1 5.83333 1C8.50271 1 10.6667 3.16396 10.6667 5.83333C10.6667 8.50271 8.50271 10.6667 5.83333 10.6667Z" stroke="#000000" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    v-model="orderSearchQuery"
                    class="search-input"
                    placeholder="ابحث برقم الطلب..."
                  />
                </div>
              </div>

              <!-- orders-detailed-list -->
              <div class="orders-detailed-list">
                <div
                  v-for="order in paginatedOrders"
                  :key="order.id"
                  class="order-detailed-card clickable-order"
                  @click="openOrderDetails(order)"
                >
                  <!-- card-top-info -->
                  <div class="card-top-info">
                    <!-- main-meta (Right in RTL) -->
                    <div class="main-meta">
                      <div class="meta-col">
                        <span class="meta-label">رقم الطلب</span>
                        <span class="meta-val"><bdi dir="ltr">{{ order.orderNumber }}</bdi></span>
                      </div>

                      <div class="meta-divider"></div>

                      <div class="meta-col">
                        <span class="meta-label">تاريخ الطلب</span>
                        <span class="meta-val">{{ order.date }}</span>
                      </div>
                    </div>

                    <!-- status-area (Left in RTL) -->
                    <div class="status-area">
                      <div
                        class="status-badge"
                        :style="{ background: order.statusColor }"
                      >
                        {{ order.statusLabel }}
                      </div>
                    </div>
                  </div>

                  <!-- horizontal line -->
                  <div class="card-line"></div>

                  <!-- card-middle-content -->
                  <div class="card-middle-content">
                    <!-- products-description (Right in RTL) -->
                    <div class="products-description">
                      <div class="prod-icon-frame">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 8.5C4 7.67157 4.67157 7 5.5 7H18.5C19.3284 7 20 7.67157 20 8.5V17.5C20 19.433 18.433 21 16.5 21H7.5C5.567 21 4 19.433 4 17.5V8.5Z" stroke="#000000" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M4 11.5H20" stroke="#000000" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M12 7V11.5" stroke="#000000" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M10 14.5H14" stroke="#000000" stroke-width="1.6" stroke-linecap="round"/>
                        </svg>
                      </div>

                      <div class="prod-text-frame">
                        <span class="prod-count">{{ order.productsCountText }}</span>
                        <span class="prod-subtitle">{{ order.subtitle || 'شامل جميع رسوم الشحن والضمان' }}</span>
                      </div>
                    </div>

                    <!-- price-actions (Left in RTL) -->
                    <div class="price-actions">
                      <span class="price-label">إجمالي المبلغ</span>
                      <div class="price-unit">
                        <svg class="riyal-symbol" width="13.69" height="15.3" viewBox="0 0 14 16" fill="currentColor">
                          <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                          <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                        </svg>
                        <span class="price-amount">{{ order.total }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- horizontal line -->
                  <div class="card-line"></div>

                  <!-- card-bottom-actions -->
                  <div class="card-bottom-actions">
                    <!-- help-prompt (Right in RTL) -->
                    <div class="help-prompt">
                      <span class="help-question">تواجه مشكلة في هذا الطلب؟</span>
                      <router-link to="/contact" class="help-link">الدعم الفني والضمان</router-link>
                    </div>

                    <!-- actions-left (Left in RTL) -->
                    <div class="actions-left">
                      <button
                        type="button"
                        class="order-action-link details-link"
                        @click.stop="openOrderDetails(order)"
                      >
                        <svg class="action-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.5 3.5L5 7L8.5 10.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>عرض التفاصيل والفاتورة</span>
                      </button>

                      <button
                        type="button"
                        v-if="order.canTrack"
                        class="order-action-link track-link"
                        @click.stop="openOrderDetails(order)"
                      >
                        <svg class="action-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.5 3.5L5 7L8.5 10.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>تتبع الطلب</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Empty state -->
                <div v-if="filteredOrders.length === 0" class="empty-orders-card">
                  <i class="fas fa-box-open empty-icon"></i>
                  <p>لا توجد طلبات تطابق بحثك</p>
                </div>
              </div>

              <!-- pagination -->
              <div class="orders-pagination" v-if="filteredOrders.length > 0">
                <button
                  type="button"
                  class="page-nav-btn"
                  :disabled="orderCurrentPage <= 1"
                  @click="orderCurrentPage > 1 && orderCurrentPage--"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.5 3.5L9 7L5.5 10.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>

                <button
                  type="button"
                  class="page-num-btn"
                  :class="{ active: orderCurrentPage === 1 }"
                  @click="orderCurrentPage = 1"
                >
                  1
                </button>

                <button
                  type="button"
                  v-if="totalOrderPages >= 2"
                  class="page-num-btn"
                  :class="{ active: orderCurrentPage === 2 }"
                  @click="orderCurrentPage = 2"
                >
                  2
                </button>

                <button
                  type="button"
                  class="page-nav-btn"
                  :disabled="orderCurrentPage >= totalOrderPages"
                  @click="orderCurrentPage < totalOrderPages && orderCurrentPage++"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.5 3.5L5 7L8.5 10.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- 2. Order Details View (Figma left-content-area: exact pixel-perfect design) -->
            <div v-else-if="!isViewingInvoiceDetails" class="order-details-view">
              <!-- 1) order-info-card -->
              <div class="order-info-card">
                <div class="order-info-frame">
                  <!-- Meta on Right in RTL -->
                  <div class="order-info-meta">
                    <div class="info-meta-col">
                      <span class="info-meta-label">رقم الطلب</span>
                      <span class="info-meta-val"><bdi dir="ltr">{{ selectedOrderDetails.orderNumber || '#MS-2024-00847' }}</bdi></span>
                    </div>

                    <div class="info-meta-divider"></div>

                    <div class="info-meta-col">
                      <span class="info-meta-label">تاريخ الطلب</span>
                      <span class="info-meta-val">{{ selectedOrderDetails.date || '26 أغسطس 2026' }}</span>
                    </div>
                  </div>

                  <!-- Status Badge on Left in RTL -->
                  <div class="order-status-badge" :style="{ background: selectedOrderDetails.statusColor || '#F59E1F' }">
                    {{ selectedOrderDetails.statusLabel || 'قيد التوصيل' }}
                  </div>
                </div>
              </div>

              <!-- 2) order-tracking-card -->
              <div class="order-tracking-card">
                <h3 class="tracking-title">تتبع الطلب</h3>
                <div class="card-divider-line"></div>

                <!-- Timeline Stepper -->
                <div class="timeline-row">
                  <!-- Step 1: Received -->
                  <div class="timeline-step">
                    <div class="step-indicator-wrapper">
                      <div class="step-indicator-circle">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 13L9 17L19 7" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <span class="step-title">تم استلام الطلب</span>
                    <span class="step-time">15 أغسطس 2024 • 10:30 ص</span>
                  </div>

                  <!-- Connector 1 -->
                  <div class="timeline-connector">
                    <div class="connector-bar"></div>
                  </div>

                  <!-- Step 2: Confirmed -->
                  <div class="timeline-step">
                    <div class="step-indicator-wrapper">
                      <div class="step-indicator-circle">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 13L9 17L19 7" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <span class="step-title">تم تأكيد الطلب</span>
                    <span class="step-time">15 أغسطس 2024 • 11:45 ص</span>
                  </div>

                  <!-- Connector 2 -->
                  <div class="timeline-connector">
                    <div class="connector-bar"></div>
                  </div>

                  <!-- Step 3: Preparing -->
                  <div class="timeline-step">
                    <div class="step-indicator-wrapper">
                      <div class="step-indicator-circle">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 13L9 17L19 7" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <span class="step-title">جاري تجهيز الطلب</span>
                    <span class="step-time">16 أغسطس 2024 • 09:00 ص</span>
                  </div>

                  <!-- Connector 3 -->
                  <div class="timeline-connector">
                    <div class="connector-bar"></div>
                  </div>

                  <!-- Step 4: Shipped -->
                  <div class="timeline-step">
                    <div class="step-indicator-wrapper">
                      <div class="step-indicator-circle">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 13L9 17L19 7" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <span class="step-title">تم شحن الطلب</span>
                    <span class="step-time">17 أغسطس 2024 • 02:15 م</span>
                  </div>

                  <!-- Connector 4 -->
                  <div class="timeline-connector">
                    <div class="connector-bar"></div>
                  </div>

                  <!-- Step 5: Transit (Active) -->
                  <div class="timeline-step">
                    <div class="step-indicator-wrapper">
                      <div class="step-indicator-circle active">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: scaleX(-1);">
                          <path d="M16 3H4C2.89543 3 2 3.89543 2 5V16C2 17.1046 2.89543 18 4 18H5M19 18H20C21.1046 18 22 17.1046 22 16V12.4142C22 11.8838 21.7893 11.3751 21.4142 11L18.5858 8.17157C18.2107 7.79651 17.702 7.58579 17.1716 7.58579H16V18ZM16 7.58579V18M16 11H21M8 18C8 19.6569 6.65685 21 5 21C3.34315 21 2 19.6569 2 18M19 18C19 19.6569 17.6569 21 16 21C14.3431 21 13 19.6569 13 18" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <span class="step-title">الطلب في الطريق</span>
                    <span class="step-time">18 أغسطس 2024 • 08:30 ص</span>
                    <span class="step-note">طلبك في طريقه إليك</span>
                  </div>

                  <!-- Connector 5 (Dashed) -->
                  <div class="timeline-connector">
                    <div class="connector-bar dashed"></div>
                  </div>

                  <!-- Step 6: Delivered (Pending) -->
                  <div class="timeline-step">
                    <div class="step-indicator-wrapper">
                      <div class="step-indicator-circle pending"></div>
                    </div>
                    <span class="step-title pending-text">تم التسليم</span>
                  </div>
                </div>
              </div>

              <!-- 3) products-card -->
              <div class="products-card">
                <h3 class="products-card-title">المنتجات المطلوبة</h3>

                <!-- Table Header (RTL: Product, Price, Qty, Total) -->
                <div class="products-table-header">
                  <div class="th-product">المنتج</div>
                  <div class="th-unit-price">السعر</div>
                  <div class="th-qty">الكمية</div>
                  <div class="th-total">الإجمالي</div>
                </div>

                <!-- Product Rows -->
                <div
                  v-for="item in (selectedOrderDetails.items || [])"
                  :key="item.id"
                  class="product-row-item"
                >
                  <!-- Product Details (Right in RTL) -->
                  <div class="col-prod-details">
                    <img
                      :src="item.image || '/images/products/water_heater_thumb.jpg'"
                      :alt="item.name"
                      class="prod-thumb-img"
                    />
                    <div class="prod-titles-col">
                      <span class="prod-main-name">{{ item.name }}</span>
                      <span class="prod-model-num">{{ item.model || 'موديل: MWH-10G' }}</span>
                    </div>
                  </div>

                  <!-- Unit Price (Second column) -->
                  <div class="col-unit-price-cell">
                    <span>{{ item.unitPrice || item.price }}</span>
                    <svg class="riyal-icon-muted" width="12" height="12" viewBox="0 0 14 16" fill="currentColor">
                      <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                      <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                    </svg>
                  </div>

                  <!-- Quantity (Third column) -->
                  <div class="col-qty-cell">
                    {{ item.quantity }}
                  </div>

                  <!-- Total (Fourth column) -->
                  <div class="col-total-cell">
                    <span>{{ item.totalPrice || item.price }}</span>
                    <svg class="riyal-icon-dark" width="12" height="12" viewBox="0 0 14 16" fill="currentColor">
                      <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                      <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- 4) summary-card -->
              <div class="summary-card">
                <h3 class="summary-card-title">ملخص الطلب</h3>
                <div class="card-divider-line"></div>

                <div class="summary-rows-wrap">
                  <!-- Row 1: Subtotal -->
                  <div class="summary-item-row">
                    <span class="summary-item-label">إجمالي المنتجات</span>
                    <div class="summary-item-val">
                      <span>{{ selectedOrderDetails.subtotal || '8,247.00' }}</span>
                      <svg class="riyal-icon-dark" width="12" height="12" viewBox="0 0 14 16" fill="currentColor">
                        <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                        <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                      </svg>
                    </div>
                  </div>

                  <!-- Row 2: Shipping -->
                  <div class="summary-item-row">
                    <span class="summary-item-label">رسوم الشحن</span>
                    <span class="summary-item-val free">{{ selectedOrderDetails.shipping || 'مجاني' }}</span>
                  </div>

                  <!-- Row 3: Discount -->
                  <div class="summary-item-row">
                    <span class="summary-item-label">الخصم</span>
                    <div class="summary-item-val discount">
                      <span>{{ selectedOrderDetails.discount || '-201.60' }}</span>
                      <svg class="riyal-icon-red" width="12" height="12" viewBox="0 0 14 16" fill="currentColor">
                        <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                        <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div class="card-divider-line"></div>

                <!-- Row 4: Grand Total -->
                <div class="summary-total-row">
                  <span class="summary-total-label">الإجمالي النهائي</span>
                  <div class="summary-total-val">
                    <span>{{ selectedOrderDetails.total || '8,045.40' }}</span>
                    <svg class="riyal-icon-dark" width="16" height="16" viewBox="0 0 14 16" fill="currentColor">
                      <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                      <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- 5) address-payment-split -->
              <div class="address-payment-split">
                <!-- Delivery Address (Right in RTL) -->
                <div class="delivery-card">
                  <h4 class="card-heading-md">عنوان التوصيل</h4>
                  <div class="card-divider-line"></div>
                  <div class="delivery-info-list">
                    <span class="delivery-name">{{ selectedOrderDetails.recipientName || 'محمد أحمد' }}</span>
                    <span class="delivery-detail">هاتف: {{ selectedOrderDetails.phone || '0501234567' }}</span>
                    <span class="delivery-detail">{{ selectedOrderDetails.address || 'حي الحمراء، شارع الأمير سلطان، الرياض' }}</span>
                    <span class="delivery-detail">الرمز البريدي: {{ selectedOrderDetails.postalCode || '12345' }}</span>
                  </div>
                </div>

                <!-- Payment Method (Left in RTL) -->
                <div class="payment-card">
                  <h4 class="card-heading-md">طريقة الدفع</h4>
                  <div class="card-divider-line"></div>
                  <div class="payment-method-row">
                    <span class="mada-badge">MADA</span>
                    <span class="payment-method-text">{{ selectedOrderDetails.paymentMethod || 'مدى (mada) **** 4532' }}</span>
                  </div>
                </div>
              </div>

              <!-- 6) bottom-action-buttons -->
              <div class="bottom-action-buttons">
                <!-- Help Prompt (Right in RTL) -->
                <div class="help-prompt-col">
                  <span class="help-q-text">تواجه مشكلة في هذا الطلب؟</span>
                  <router-link to="/contact" class="help-link-bold">الدعم الفني والضمان</router-link>
                </div>

                <!-- Action Buttons (Left in RTL) -->
                <div class="action-buttons-wrap">
                  <button
                    type="button"
                    class="btn-primary-invoice"
                    @click="openInvoiceFromDetails"
                  >
                    عرض الفاتورة
                  </button>
                  <button
                    type="button"
                    class="btn-secondary-back"
                    @click="returnToOrdersList"
                  >
                    العودة إلى الطلبات
                  </button>
                </div>
              </div>
            </div>

            <!-- 3. In-Page Invoice View (Replaces Order Details View on the SAME page) -->
            <div v-else class="inpage-invoice-view">
              <!-- Top Back Nav Bar -->
              <div class="inpage-invoice-top-bar">
                <button
                  type="button"
                  class="btn-back-to-order-details"
                  @click="closeInvoiceDetails"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 15L12 10L7 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>العودة لتفاصيل الطلب</span>
                </button>

                <button
                  type="button"
                  class="btn-back-to-orders-list"
                  @click="returnToOrdersList"
                >
                  <span>قائمة الطلبات</span>
                </button>
              </div>

              <!-- printable-invoice-card -->
              <div class="printable-invoice-card" id="printable-invoice-card">
                <!-- 1. Header Frame -->
                <div class="invoice-header-frame">
                  <!-- Right in RTL: Tax Invoice Meta -->
                  <div class="invoice-meta-block">
                    <h2 class="invoice-type-title">فاتورة ضريبية</h2>
                    <span class="invoice-meta-row">رقم الفاتورة: {{ getInvoiceNumber(activeModalOrder || selectedOrderDetails) }}</span>
                    <span class="invoice-meta-row">رقم الطلب: {{ (activeModalOrder || selectedOrderDetails)?.orderNumber || '#MS-2026-00847' }}</span>
                    <span class="invoice-meta-row">التاريخ: {{ (activeModalOrder || selectedOrderDetails)?.date || '26 أغسطس 2026' }}</span>
                  </div>

                  <!-- Left in RTL: Logo & Legal info -->
                  <div class="invoice-company-block">
                    <div class="invoice-logo-wrapper">
                      <img src="/brand/mastergas-logo.png" alt="MASTERgas" class="invoice-logo-img" />
                    </div>
                    <span class="invoice-company-name">شركة ماستر غاز المحدودة</span>
                    <span class="invoice-vat-number">الرقم الضريبي: ٣٠١٢٠٤٥٦٧٨٠٠٠٠٣</span>
                  </div>
                </div>

                <!-- 2. Divider Line -->
                <div class="invoice-divider-line"></div>

                <!-- 3. Customer & Delivery Frame -->
                <div class="invoice-parties-frame">
                  <!-- Right in RTL: Customer Info -->
                  <div class="invoice-party-col">
                    <h3 class="invoice-party-title">معلومات العميل</h3>
                    <div class="invoice-party-item">الاسم: {{ getCustomerName(activeModalOrder || selectedOrderDetails) }}</div>
                    <div class="invoice-party-item">الهاتف: {{ getCustomerPhone(activeModalOrder || selectedOrderDetails) }}</div>
                    <div class="invoice-party-item">البريد الإلكتروني: {{ getCustomerEmail(activeModalOrder || selectedOrderDetails) }}</div>
                  </div>

                  <!-- Left in RTL: Delivery Address -->
                  <div class="invoice-party-col">
                    <h3 class="invoice-party-title">عنوان التوصيل</h3>
                    <div class="invoice-party-item">{{ getCustomerName(activeModalOrder || selectedOrderDetails) }}</div>
                    <div class="invoice-party-item">{{ getDeliveryStreet(activeModalOrder || selectedOrderDetails) }}</div>
                    <div class="invoice-party-item">{{ getDeliveryCountry(activeModalOrder || selectedOrderDetails) }}</div>
                  </div>
                </div>

                <!-- 4. Products Table Frame -->
                <div class="invoice-table-frame">
                  <!-- invoice-table-header -->
                  <div class="invoice-table-header">
                    <div class="col-product">المنتج</div>
                    <div class="col-price">سعر الوحدة</div>
                    <div class="col-qty">الكمية</div>
                    <div class="col-total">الإجمالي</div>
                  </div>

                  <!-- invoice-product-row -->
                  <div
                    v-for="(item, index) in getInvoiceProducts(activeModalOrder || selectedOrderDetails)"
                    :key="index"
                    class="invoice-product-row"
                  >
                    <div class="col-product font-medium">
                      {{ item.name }}
                    </div>
                    <div class="col-price col-price-val">
                      <svg class="riyal-icon-muted" width="12" height="12" viewBox="0 0 14 16" fill="currentColor">
                        <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                        <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                      </svg>
                      <span>{{ item.unitPrice }}</span>
                    </div>
                    <div class="col-qty col-qty-val">
                      {{ item.quantity }}
                    </div>
                    <div class="col-total col-total-val">
                      <svg class="riyal-icon-dark" width="12" height="12" viewBox="0 0 14 16" fill="currentColor">
                        <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                        <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                      </svg>
                      <span>{{ item.totalPrice }}</span>
                    </div>
                  </div>
                </div>

                <!-- 5. Totals Breakdown Frame -->
                <div class="invoice-summary-frame">
                  <div class="invoice-summary-card">
                    <div class="summary-breakdown-row">
                      <span class="breakdown-label">المجموع الفرعي</span>
                      <div class="breakdown-val">
                        <svg class="riyal-icon-dark" width="12" height="12" viewBox="0 0 14 16" fill="currentColor">
                          <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                          <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                        </svg>
                        <span>{{ (activeModalOrder || selectedOrderDetails)?.subtotal || '8,247.00' }}</span>
                      </div>
                    </div>

                    <div class="summary-breakdown-row">
                      <span class="breakdown-label">الضريبة (15%)</span>
                      <div class="breakdown-val">
                        <svg class="riyal-icon-dark" width="12" height="12" viewBox="0 0 14 16" fill="currentColor">
                          <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                          <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                        </svg>
                        <span>{{ (activeModalOrder || selectedOrderDetails)?.tax || '1,075.70' }}</span>
                      </div>
                    </div>

                    <div class="summary-breakdown-row">
                      <span class="breakdown-label">الخصم</span>
                      <div class="breakdown-val discount-val">
                        <svg class="riyal-icon-red" width="12" height="12" viewBox="0 0 14 16" fill="currentColor">
                          <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                          <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                        </svg>
                        <span>{{ (activeModalOrder || selectedOrderDetails)?.discount || '-201.60' }}</span>
                      </div>
                    </div>

                    <div class="summary-breakdown-row">
                      <span class="breakdown-label">الشحن التوصيل</span>
                      <span class="breakdown-val free-val">{{ (activeModalOrder || selectedOrderDetails)?.shipping || 'مجاني' }}</span>
                    </div>

                    <div class="summary-box-line"></div>

                    <div class="summary-final-row">
                      <span class="final-total-label">الإجمالي الصافي</span>
                      <div class="final-total-val">
                        <svg class="riyal-icon-dark" width="16" height="16" viewBox="0 0 14 16" fill="currentColor">
                          <path d="M8.51992 13.5541C8.27563 14.0957 8.11415 14.6836 8.05229 15.3L13.2219 14.2011C13.4662 13.6595 13.6275 13.0716 13.6895 12.4552L8.51992 13.5541Z"/>
                          <path d="M13.2219 10.9088C13.4662 10.3673 13.6276 9.77934 13.6895 9.1629L9.66256 10.0194V8.37293L13.2217 7.61657C13.466 7.07503 13.6275 6.48709 13.6894 5.87065L9.66243 6.72638V0.805314C9.04539 1.15177 8.49739 1.61294 8.05193 2.15692V7.06882L6.44142 7.41113V0C5.82437 0.346335 5.27637 0.807628 4.83091 1.35161V7.75333L1.2274 8.51906C0.98311 9.06061 0.821511 9.64855 0.759526 10.265L4.83091 9.39976V11.4731L0.467625 12.4004C0.22334 12.9419 0.061863 13.5298 0 14.1463L4.56714 13.1757C4.93893 13.0984 5.25847 12.8786 5.46623 12.5761L6.30381 11.3343V11.3341C6.39076 11.2056 6.44142 11.0507 6.44142 10.8839V9.05744L8.05193 8.71513V12.008L13.2217 10.9086L13.2219 10.9088Z"/>
                        </svg>
                        <span>{{ (activeModalOrder || selectedOrderDetails)?.total || '8,045.40' }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 6. Bottom Divider -->
                <div class="invoice-divider-line"></div>

                <!-- 7. Bottom Footer Bar -->
                <div class="invoice-footer-frame">
                  <span class="invoice-thanks-note">نشكركم لثقتكم واختياركم أجهزة ماستر غاز</span>
                  <span class="invoice-payment-method">طريقة الدفع: {{ ((activeModalOrder || selectedOrderDetails)?.paymentMethod || 'بطاقة ائتمان **** 4532').replace('مدى (mada)', 'بطاقة ائتمان') }}</span>
                </div>
              </div>

              <!-- invoice-action-controls -->
              <div class="invoice-action-controls">
                <!-- Help Prompt (Right in RTL) -->
                <div class="help-prompt-col">
                  <span class="help-q-text">تواجه مشكلة في هذا الطلب؟</span>
                  <router-link to="/contact" class="help-link-bold">الدعم الفني والضمان</router-link>
                </div>

                <!-- Action Buttons (Left in RTL) -->
                <div class="invoice-buttons-wrap">
                  <button type="button" class="primary-download-button" @click="downloadInvoicePdf">
                    <span>تحميل الفاتورة</span>
                    <svg class="btn-icon-svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2.5V10.5M8 10.5L5 7.5M8 10.5L11 7.5M3 13.5H13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>

                  <button type="button" class="secondary-print-button" @click="printInvoiceCard">
                    <span>طباعة الفاتورة</span>
                    <svg class="btn-icon-svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6V2.5H12V6M4 12H3C2.44772 12 2 11.5523 2 11V7.5C2 6.94772 2.44772 6.5 3 6.5H13C13.5523 6.5 14 6.94772 14 7.5V11C14 11.5523 13.5523 12 13 12H12M4 9.5H12V13.5H4V9.5Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Returns Tab -->
          <div v-else-if="currentTab === 'returns'" class="content-view">
             <header class="view-header flex-header">
               <h2 class="view-title">{{ t('profile.returns') }}</h2>
               <button class="add-btn" v-if="!showReturnForm" @click="openReturnForm">
                  <i class="fas fa-plus"></i> {{ t('profile.return_request') }}
               </button>
             </header>

             <!-- New Return Request Form -->
             <div class="return-form-box" v-if="showReturnForm">
                <h3 class="inner-subtitle">{{ t('profile.submit_return_request') }}</h3>
                
                <div class="return-steps">
                  <!-- Step 1: Select Order -->
                  <div class="form-group" v-if="returnStep === 1">
                    <label>{{ t('profile.choose_order') }}</label>
                    <select v-model="selectedOrderForReturn" class="custom-select-v2">
                      <option :value="null">--- {{ t('profile.choose_delivered_order') }} ---</option>
                      <option v-for="o in ordersList.filter(o => ['delivered', 'completed'].includes(o.status))" :key="o.id" :value="o">
                        {{ o.orderNumber || o.order_number }} - {{ o.date || formatDate(o.created_at) }}
                      </option>
                    </select>
                    <div class="form-actions mt-4">
                      <button class="save-btn" :disabled="!selectedOrderForReturn" @click="returnStep = 2">{{ t('common.next') }}</button>
                      <button class="cancel-btn" @click="showReturnForm = false">{{ t('common.cancel') }}</button>
                    </div>
                  </div>

                  <!-- Step 2: Select Product -->
                  <div class="form-group" v-if="returnStep === 2">
                    <label>{{ t('profile.choose_product_to_return') }}</label>
                    <div class="product-selection-list">
                      <div v-for="item in (selectedOrderForReturn.items || selectedOrderForReturn.products)" 
                           :key="item.id" 
                           class="product-select-item"
                           :class="{ selected: selectedItemForReturn?.id === item.id }"
                           @click="selectedItemForReturn = item">
                        <img :src="getImageUrl(item.image)" class="p-mini-img" />
                        <div class="p-mini-info">
                          <span class="p-mini-name">{{ item.name }}</span>
                          <span class="p-mini-price">{{ item.unit_price || item.price }} {{ currency }}</span>
                        </div>
                        <div class="p-check"><i class="fas fa-check-circle"></i></div>
                      </div>
                    </div>
                    <div class="form-actions mt-4">
                      <button class="save-btn" :disabled="!selectedItemForReturn" @click="returnStep = 3">{{ t('common.next') }}</button>
                      <button class="cancel-btn" @click="returnStep = 1">{{ t('common.back') }}</button>
                    </div>
                  </div>

                  <!-- Step 3: Reason -->
                  <div class="form-group" v-if="returnStep === 3">
                    <label>{{ t('profile.return_reason') }}</label>
                    <textarea v-model="returnReason" rows="4" :placeholder="t('profile.return_reason_placeholder')" class="custom-textarea"></textarea>
                    <div class="char-count" :class="{ valid: returnReason.trim().length >= 10, invalid: returnReason && returnReason.trim().length < 10 }" v-if="returnReason">
                      {{ returnReason.trim().length }}/10 {{ t('profile.characters') }}
                    </div>
                    <div class="form-actions mt-4">
                      <button class="save-btn" :disabled="!returnReason || returnReason.trim().length < 10" @click="submitReturnRequest">{{ t('profile.send_request') }}</button>
                      <button class="cancel-btn" @click="returnStep = 2">{{ t('common.back') }}</button>
                    </div>
                  </div>
                </div>
             </div>

             <!-- Returns List -->
             <div class="returns-list" v-if="!showReturnForm">
                <div v-for="ret in returnsList" :key="ret.id" class="return-card">
                  <div class="ret-header">
                    <span class="ret-id">{{ t('profile.request') }} #{{ ret.returnNumber }}</span>
                    <span class="status-badge-v2" :class="ret.status">{{ formatReturnStatus(ret.status) }}</span>
                  </div>
                  <div class="ret-body">
                    <img :src="ret.productImage" class="ret-img" v-if="ret.productImage" />
                    <div class="ret-info">
                      <div class="ret-pname">{{ ret.productName }}</div>
                      <div class="ret-order">{{ t('profile.original_order') }}: {{ ret.orderNumber || ret.orderId || '—' }}</div>
                      <div class="ret-reason"><strong>{{ t('profile.reason') }}:</strong> {{ ret.reason }}</div>
                      <div class="ret-notes" v-if="ret.adminNotes"><strong>{{ t('profile.admin_note') }}:</strong> {{ ret.adminNotes }}</div>
                    </div>
                    <div class="ret-refund">
                      <span class="refund-label">{{ t('profile.amount') }}:</span>
                      <span class="refund-val">{{ ret.refundAmount }} {{ currency }}</span>
                    </div>
                  </div>
                  <div class="ret-footer">
                    <span class="ret-date">{{ ret.date ? formatDate(ret.date) : '—' }}</span>
                  </div>
                </div>
                <div v-if="returnsList.length === 0" class="empty-state">{{ t('profile.no_previous_returns') }}</div>
             </div>
          </div>

          <!-- Wishlist Tab -->
          <div v-else-if="currentTab === 'wishlist'" class="content-view">
             <header class="view-header">
               <h2 class="view-title">{{ t('profile.wishlist') }} <span class="count">({{ wishlistCount }})</span></h2>
             </header>

             <div v-if="wishlistCount === 0" class="empty-view">
                <div class="empty-icon wishlist-empty-icon"><i class="far fa-heart" aria-hidden="true"></i></div>
                <p>{{ t('profile.wishlist_empty') }}</p>
                <router-link to="/products" class="go-shop-btn">{{ t('home.shop_now') }}</router-link>
             </div>

             <div class="wishlist-grid" v-else>
                <div v-for="product in wishlistItems" :key="product.id" class="wish-card">
                   <img :src="getImageUrl(product.image || product.images?.[0])" @click="$router.push('/product/'+product.id)" />
                   <div class="wish-body">
                      <h4 @click="$router.push('/product/'+product.id)">{{ product.name }}</h4>
                      <div class="wish-price">{{ product.price }} {{ currency }}</div>
                      <div class="wish-card-actions">
                        <button class="wish-add-cart" @click="cartState.addToCart(product)">
                          <i class="fas fa-shopping-cart"></i> {{ t('cart.title') }}
                        </button>
                        <button class="wish-remove" @click="removeFromWishlist(product)">
                          <i class="far fa-trash-alt"></i>
                        </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <!-- Wallet Tab -->
          <div v-else-if="currentTab === 'wallet'" class="content-view wallet-view">
             <div v-if="loadingWallet" class="loading-state">
               <div class="spinner"></div>
               <p>{{ t('common.loading') }}</p>
             </div>

             <div v-else class="wallet-container">
               <!-- Main Balance Card -->
               <div class="wallet-balance-card">
                 <div class="balance-content">
                   <span class="balance-title">{{ t('profile.available_balance') }}</span>
                   <span class="balance-value">{{ formatPrice(walletData.balance) }} {{ currency }}</span>
                   <span class="balance-subtitle">{{ t('profile.balance_subtitle') }}</span>
                 </div>
                 <div class="balance-icon">
                   <i class="fas fa-wallet"></i>
                 </div>
               </div>

               <!-- Stats Cards -->
               <div class="stats-cards">
                 <div class="stat-card refund-card">
                   <div class="stat-header">
                     <i class="fas fa-sync-alt stat-icon"></i>
                   </div>
                   <span class="stat-title">{{ t('profile.total_refunds') }}</span>
                   <span class="stat-value">{{ formatPrice(totalRefunds) }} {{ currency }}</span>
                   <span class="stat-count">{{ t('profile.transactions_count', { count: refundCount }) }}</span>
                 </div>
                 <div class="stat-card purchase-card">
                   <div class="stat-header">
                     <i class="fas fa-arrow-up stat-icon"></i>
                   </div>
                   <span class="stat-title">{{ t('profile.total_purchases') }}</span>
                   <span class="stat-value">{{ formatPrice(totalPurchases) }} {{ currency }}</span>
                   <span class="stat-count">{{ t('profile.transactions_count', { count: purchaseCount }) }}</span>
                 </div>
               </div>

               <!-- Transactions Section -->
               <div class="wallet-transactions">
                 <div class="transactions-header">
                   <h3 class="transactions-title">{{ t('profile.transactions_history') }}</h3>
                   <div class="transaction-filters">
                     <button 
                       v-for="filter in filters" 
                       :key="filter.value"
                       class="filter-btn"
                       :class="{ active: activeFilter === filter.value }"
                       @click="activeFilter = filter.value"
                     >
                       {{ filter.label }}
                     </button>
                   </div>
                 </div>

                 <div v-if="filteredTransactions.length === 0" class="empty-state">
                   <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5">
                     <rect x="2" y="5" width="20" height="14" rx="2" />
                     <line x1="2" y1="10" x2="22" y2="10" />
                   </svg>
                   <p>{{ t('profile.no_transactions') }}</p>
                 </div>

                 <div v-else class="transactions-list">
                   <div v-for="transaction in filteredTransactions" :key="transaction.id" class="transaction-item">
                     <div class="transaction-icon" :class="transaction.type === 'deposit' ? 'deposit' : 'purchase'">
                       <i :class="transaction.type === 'deposit' ? 'fas fa-sync-alt' : 'fas fa-arrow-up'"></i>
                     </div>
                     <div class="transaction-info">
                       <span class="transaction-desc">{{ transaction.type === 'deposit' ? t('profile.refund') : t('profile.purchase') }} - {{ transaction.description }}</span>
                       <span class="transaction-subtext">{{ transaction.reference_id ? '#' + transaction.reference_id : '' }} • {{ formatDate(transaction.date) }}</span>
                     </div>
                     <span class="transaction-amount" :class="transaction.type === 'deposit' ? 'deposit' : 'purchase'">
                       {{ transaction.type === 'deposit' ? '+' : '-'}}{{ t('currency') }} {{ formatPrice(transaction.amount) }}
                     </span>
                   </div>
                 </div>
               </div>
             </div>
          </div>

          <!-- Notifications Tab (Figma left-content-area: exact pixel-perfect design) -->
          <div v-else-if="currentTab === 'notifications'" class="notifications-view-container">
            <div class="notifications-card">
              <!-- header -->
              <div class="notifications-header">
                <!-- الإشعارات on Right in RTL -->
                <h2 class="notifications-title">الإشعارات</h2>

                <!-- تحديد الكل كمقروء on Left in RTL -->
                <button
                  type="button"
                  class="btn-mark-all-read"
                  @click="markAllAsRead"
                >
                  تحديد الكل كمقروء
                </button>
              </div>

              <!-- notifications-list -->
              <div class="notifications-list" v-if="notificationsList.length > 0">
                <div
                  v-for="notif in notificationsList"
                  :key="notif.id"
                  class="notification-item"
                  :class="{ unread: !notif.is_read }"
                  @click="markNotificationAsRead(notif)"
                >
                  <!-- Right in RTL: Dot + Message -->
                  <div class="notification-main-content">
                    <span class="notification-dot" v-if="!notif.is_read"></span>
                    <span class="notification-title-text" :class="{ 'is-unread': !notif.is_read }">
                      {{ notif.title || notif.message }}
                    </span>
                  </div>

                  <!-- Left in RTL: Time -->
                  <span class="notification-time">
                    {{ notif.time || notif.date || (notif.created_at ? formatDate(notif.created_at) : '') }}
                  </span>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="notifications-empty">
                <i class="fas fa-bell-slash empty-icon"></i>
                <p>لا توجد إشعارات حالياً</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>



    <!-- Change Password Modal (Figma modal-security exact pixel-perfect) -->
    <div v-if="showChangePasswordModal" class="modal-overlay change-password-modal-overlay" @click.self="closeChangePasswordModal">
      <div class="modal-security" role="dialog" aria-modal="true">
        <!-- modal-header -->
        <div class="modal-security-header">
          <!-- تغيير كلمة المرور on Right in RTL -->
          <h3 class="modal-security-title">تغيير كلمة المرور</h3>

          <!-- close-btn on Left in RTL -->
          <button type="button" class="modal-security-close-btn" @click="closeChangePasswordModal" aria-label="إغلاق">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#161616" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="2" y1="2" x2="12" y2="12"></line>
              <line x1="12" y1="2" x2="2" y2="12"></line>
            </svg>
          </button>
        </div>

        <!-- form-fields -->
        <form @submit.prevent="handleSavePassword" class="modal-security-form">
          <!-- field-كلمة المرور الحالية -->
          <div class="modal-field">
            <label class="modal-field-label" :class="{ 'has-error': passErrors.current }">كلمة المرور الحالية</label>
            <div class="modal-input-wrapper" :class="{ 'has-error': passErrors.current }">
              <input
                :type="showCurrentPassword ? 'text' : 'password'"
                v-model="passForm.current_password"
                placeholder="••••••••"
                class="modal-input"
                required
              />
              <button type="button" class="modal-eye-btn" @click="showCurrentPassword = !showCurrentPassword" aria-label="إظهار أو إخفاء كلمة المرور">
                <svg v-if="showCurrentPassword" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 10C3.5 5.5 6.5 3.5 10 3.5C13.5 3.5 16.5 5.5 18 10C16.5 14.5 13.5 16.5 10 16.5C6.5 16.5 3.5 14.5 2 10Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5" />
                  <circle cx="10" cy="10" r="1.3" fill="currentColor" />
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.57943 11.571C5.44335 11.0866 4.45814 10.4145 3.65023 9.73485L2.10996 11.2751C1.9883 11.3968 1.82831 11.4585 1.66831 11.4585H1.66742C1.50742 11.4585 1.34743 11.3976 1.22577 11.2751C0.981602 11.031 0.981602 10.6352 1.22577 10.391L2.7285 8.88828C1.75823 7.91822 1.20211 7.09769 1.14624 7.01356C0.954573 6.72606 1.032 6.33853 1.3195 6.14686C1.607 5.9552 1.99453 6.0327 2.1862 6.3202C2.21786 6.36687 5.40118 11.0419 9.99951 11.0419C14.5978 11.0419 17.7812 6.36689 17.8129 6.31939C18.0046 6.03272 18.3929 5.9552 18.6795 6.14686C18.9662 6.33853 19.0437 6.72608 18.8529 7.01275C18.797 7.09684 18.2413 7.9167 17.2718 8.88622L18.7766 10.391C19.0208 10.6352 19.0208 11.031 18.7766 11.2751C18.655 11.3968 18.495 11.4585 18.335 11.4585H18.3341C18.1741 11.4585 18.0141 11.3976 17.8924 11.2751L16.3502 9.73289C15.5425 10.4125 14.5574 11.0847 13.4215 11.5694L14.2868 13.0116C14.4643 13.3074 14.3684 13.6916 14.0726 13.8691C13.9718 13.9291 13.861 13.9583 13.7518 13.9583C13.5393 13.9583 13.3326 13.85 13.2151 13.655L12.2164 11.9904C11.5208 12.1801 10.7803 12.2911 9.99951 12.2911C9.21947 12.2911 8.47965 12.1811 7.78474 11.9917L6.78681 13.655C6.66931 13.85 6.4626 13.9583 6.2501 13.9583C6.14094 13.9583 6.03014 13.9299 5.9293 13.8691C5.63347 13.6916 5.53761 13.3074 5.71511 13.0116L6.57943 11.571Z" />
                </svg>
              </button>
            </div>
            <span v-if="passErrors.current" class="modal-field-error">{{ passErrors.current }}</span>
          </div>

          <!-- field-كلمة المرور الجديدة -->
          <div class="modal-field">
            <label class="modal-field-label" :class="{ 'has-error': passErrors.new || (passForm.password && passForm.password.length < 8) }">كلمة المرور الجديدة</label>
            <div class="modal-input-wrapper" :class="{ 'has-error': passErrors.new || (passForm.password && passForm.password.length < 8) }">
              <input
                :type="showNewPassword ? 'text' : 'password'"
                v-model="passForm.password"
                placeholder="••••••••"
                class="modal-input"
                required
              />
              <button type="button" class="modal-eye-btn" @click="showNewPassword = !showNewPassword" aria-label="إظهار أو إخفاء كلمة المرور">
                <svg v-if="showNewPassword" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 10C3.5 5.5 6.5 3.5 10 3.5C13.5 3.5 16.5 5.5 18 10C16.5 14.5 13.5 16.5 10 16.5C6.5 16.5 3.5 14.5 2 10Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5" />
                  <circle cx="10" cy="10" r="1.3" fill="currentColor" />
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.57943 11.571C5.44335 11.0866 4.45814 10.4145 3.65023 9.73485L2.10996 11.2751C1.9883 11.3968 1.82831 11.4585 1.66831 11.4585H1.66742C1.50742 11.4585 1.34743 11.3976 1.22577 11.2751C0.981602 11.031 0.981602 10.6352 1.22577 10.391L2.7285 8.88828C1.75823 7.91822 1.20211 7.09769 1.14624 7.01356C0.954573 6.72606 1.032 6.33853 1.3195 6.14686C1.607 5.9552 1.99453 6.0327 2.1862 6.3202C2.21786 6.36687 5.40118 11.0419 9.99951 11.0419C14.5978 11.0419 17.7812 6.36689 17.8129 6.31939C18.0046 6.03272 18.3929 5.9552 18.6795 6.14686C18.9662 6.33853 19.0437 6.72608 18.8529 7.01275C18.797 7.09684 18.2413 7.9167 17.2718 8.88622L18.7766 10.391C19.0208 10.6352 19.0208 11.031 18.7766 11.2751C18.655 11.3968 18.495 11.4585 18.335 11.4585H18.3341C18.1741 11.4585 18.0141 11.3976 17.8924 11.2751L16.3502 9.73289C15.5425 10.4125 14.5574 11.0847 13.4215 11.5694L14.2868 13.0116C14.4643 13.3074 14.3684 13.6916 14.0726 13.8691C13.9718 13.9291 13.861 13.9583 13.7518 13.9583C13.5393 13.9583 13.3326 13.85 13.2151 13.655L12.2164 11.9904C11.5208 12.1801 10.7803 12.2911 9.99951 12.2911C9.21947 12.2911 8.47965 12.1811 7.78474 11.9917L6.78681 13.655C6.66931 13.85 6.4626 13.9583 6.2501 13.9583C6.14094 13.9583 6.03014 13.9299 5.9293 13.8691C5.63347 13.6916 5.53761 13.3074 5.71511 13.0116L6.57943 11.571Z" />
                </svg>
              </button>
            </div>
            <span v-if="passErrors.new || (passForm.password && passForm.password.length < 8)" class="modal-field-error">
              {{ passErrors.new || 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }}
            </span>
          </div>

          <!-- field-تأكيد كلمة المرور -->
          <div class="modal-field">
            <label class="modal-field-label" :class="{ 'has-error': passErrors.confirm || (passForm.password_confirmation && passForm.password_confirmation !== passForm.password) }">تأكيد كلمة المرور</label>
            <div class="modal-input-wrapper" :class="{ 'has-error': passErrors.confirm || (passForm.password_confirmation && passForm.password_confirmation !== passForm.password) }">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                v-model="passForm.password_confirmation"
                placeholder="••••••••"
                class="modal-input"
                required
              />
              <button type="button" class="modal-eye-btn" @click="showConfirmPassword = !showConfirmPassword" aria-label="إظهار أو إخفاء كلمة المرور">
                <svg v-if="showConfirmPassword" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 10C3.5 5.5 6.5 3.5 10 3.5C13.5 3.5 16.5 5.5 18 10C16.5 14.5 13.5 16.5 10 16.5C6.5 16.5 3.5 14.5 2 10Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5" />
                  <circle cx="10" cy="10" r="1.3" fill="currentColor" />
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.57943 11.571C5.44335 11.0866 4.45814 10.4145 3.65023 9.73485L2.10996 11.2751C1.9883 11.3968 1.82831 11.4585 1.66831 11.4585H1.66742C1.50742 11.4585 1.34743 11.3976 1.22577 11.2751C0.981602 11.031 0.981602 10.6352 1.22577 10.391L2.7285 8.88828C1.75823 7.91822 1.20211 7.09769 1.14624 7.01356C0.954573 6.72606 1.032 6.33853 1.3195 6.14686C1.607 5.9552 1.99453 6.0327 2.1862 6.3202C2.21786 6.36687 5.40118 11.0419 9.99951 11.0419C14.5978 11.0419 17.7812 6.36689 17.8129 6.31939C18.0046 6.03272 18.3929 5.9552 18.6795 6.14686C18.9662 6.33853 19.0437 6.72608 18.8529 7.01275C18.797 7.09684 18.2413 7.9167 17.2718 8.88622L18.7766 10.391C19.0208 10.6352 19.0208 11.031 18.7766 11.2751C18.655 11.3968 18.495 11.4585 18.335 11.4585H18.3341C18.1741 11.4585 18.0141 11.3976 17.8924 11.2751L16.3502 9.73289C15.5425 10.4125 14.5574 11.0847 13.4215 11.5694L14.2868 13.0116C14.4643 13.3074 14.3684 13.6916 14.0726 13.8691C13.9718 13.9291 13.861 13.9583 13.7518 13.9583C13.5393 13.9583 13.3326 13.85 13.2151 13.655L12.2164 11.9904C11.5208 12.1801 10.7803 12.2911 9.99951 12.2911C9.21947 12.2911 8.47965 12.1811 7.78474 11.9917L6.78681 13.655C6.66931 13.85 6.4626 13.9583 6.2501 13.9583C6.14094 13.9583 6.03014 13.9299 5.9293 13.8691C5.63347 13.6916 5.53761 13.3074 5.71511 13.0116L6.57943 11.571Z" />
                </svg>
              </button>
            </div>
            <span v-if="passErrors.confirm || (passForm.password_confirmation && passForm.password_confirmation !== passForm.password)" class="modal-field-error">
              {{ passErrors.confirm || 'كلمة المرور غير متطابقة' }}
            </span>
          </div>

          <!-- btn-save-password -->
          <button type="submit" class="btn-save-password" :disabled="loadingData">
            {{ loadingData ? 'جاري الحفظ...' : 'حفظ كلمة المرور' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Add / Edit Address Modal (Figma add-address-modal exact pixel-perfect) -->
    <div v-if="showAddressModal" class="modal-overlay add-address-modal-overlay" @click.self="closeAddressModal">
      <div class="add-address-modal" role="dialog" aria-modal="true">
        <!-- modal-header -->
        <div class="add-address-modal-header">
          <!-- Title on Right in RTL -->
          <h3 class="add-address-modal-title">{{ isEditAddress ? 'تعديل العنوان' : 'إضافة عنوان جديد' }}</h3>

          <!-- close-btn on Left in RTL -->
          <button type="button" class="add-address-close-btn" @click="closeAddressModal" aria-label="إغلاق">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#161616" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="2" y1="2" x2="12" y2="12"></line>
              <line x1="12" y1="2" x2="2" y2="12"></line>
            </svg>
          </button>
        </div>

        <!-- form-fields -->
        <form @submit.prevent="saveAddress" class="add-address-form">
          <!-- field-name: اسم المستلم -->
          <div class="add-address-field">
            <label class="add-address-label">اسم المستلم</label>
            <input 
              type="text" 
              v-model="addressForm.full_name" 
              class="add-address-input" 
              placeholder="أدخل اسم المستلم" 
              required 
            />
          </div>

          <!-- field-phone: رقم الجوال -->
          <div class="add-address-field">
            <label class="add-address-label">رقم الجوال</label>
            <div class="phone-input-container">
              <div class="phone-country-code">
                <span class="phone-prefix" dir="ltr">&lrm;+966</span>
                <span class="phone-divider"></span>
              </div>
              <input 
                type="tel" 
                v-model="addressForm.phone" 
                class="phone-number-input" 
                placeholder="5XXXXXXXX" 
                dir="ltr"
                required 
              />
            </div>
          </div>

          <!-- Frame 12: المدينة والمنطقة -->
          <div class="address-two-cols-row">
            <!-- field-type: المدينة -->
            <div class="add-address-field half-field">
              <label class="add-address-label">المدينة</label>
              <div class="select-wrapper">
                <select v-model="addressForm.city" class="add-address-select city-select" required>
                  <option value="" disabled selected>اختر المدينة</option>
                  <option v-for="c in cityOptions" :key="c" :value="c">{{ c }}</option>
                </select>
                <div class="select-arrow">
                  <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- field-type: المنطقة -->
            <div class="add-address-field half-field">
              <label class="add-address-label">المنطقة</label>
              <div class="select-wrapper">
                <select v-model="addressForm.region" class="add-address-select region-select">
                  <option value="" disabled selected>اختر المنطقة</option>
                  <option v-for="r in regionOptions" :key="r" :value="r">{{ r }}</option>
                </select>
                <div class="select-arrow">
                  <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- field-message: العنوان بالتفصيل (الشارع، رقم المبنى، الشقة) -->
          <div class="add-address-field">
            <label class="add-address-label">العنوان بالتفصيل (الشارع، رقم المبنى، الشقة)</label>
            <textarea 
              v-model="addressForm.address" 
              class="add-address-textarea" 
              placeholder="اكتب تفاصيل عنوانك هنا لتسهيل التوصيل..."
              rows="3"
              required
            ></textarea>
          </div>

          <!-- field-message: ملاحظات التوصيل (اختياري) -->
          <div class="add-address-field">
            <label class="add-address-label">ملاحظات التوصيل (اختياري)</label>
            <textarea 
              v-model="addressForm.notes" 
              class="add-address-textarea" 
              placeholder="مثال: يرجى الاتصال قبل الوصول"
              rows="3"
            ></textarea>
          </div>

          <!-- default-address-row: اجعل هذا العنوان افتراضيًا -->
          <div class="default-address-checkbox-row" @click="addressForm.is_default = !addressForm.is_default">
            <div class="custom-checkbox" :class="{ checked: addressForm.is_default }">
              <svg v-if="addressForm.is_default" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="default-checkbox-text">اجعل هذا العنوان افتراضيًا</span>
          </div>

          <!-- btn-save-address: حفظ العنوان -->
          <button type="submit" class="btn-save-address" :disabled="loadingData">
            {{ loadingData ? 'جاري الحفظ...' : 'حفظ العنوان' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Order Tracking Modal -->
    <div v-if="showOrderTrackingModal && activeModalOrder" class="modal-overlay" @click.self="showOrderTrackingModal = false">
      <div class="order-details-modal">
        <div class="modal-header-row">
          <div class="modal-order-title">
            <h3>تتبع مسار الطلب</h3>
            <span class="modal-order-num">{{ activeModalOrder.orderNumber }}</span>
          </div>
          <button class="close-modal" @click="showOrderTrackingModal = false">&times;</button>
        </div>

        <div class="modal-body-content">
          <div class="tracking-timeline-v3">
            <div class="track-step active">
              <div class="step-dot"><i class="fas fa-check"></i></div>
              <div class="step-details">
                <span class="step-title">تم تأكيد الطلب</span>
                <span class="step-time">{{ activeModalOrder.date }} - 10:30 ص</span>
              </div>
            </div>
            <div class="track-step active">
              <div class="step-dot"><i class="fas fa-check"></i></div>
              <div class="step-details">
                <span class="step-title">جاري التجهيز والتعبئة</span>
                <span class="step-time">{{ activeModalOrder.date }} - 02:15 م</span>
              </div>
            </div>
            <div class="track-step active">
              <div class="step-dot"><i class="fas fa-truck"></i></div>
              <div class="step-details">
                <span class="step-title">خرج مع المندوب للتوصيل</span>
                <span class="step-time">الطلب في الطريق إلى عنوانك</span>
              </div>
            </div>
            <div class="track-step" :class="{ active: ['delivered', 'completed'].includes((activeModalOrder.status || '').toLowerCase()) }">
              <div class="step-dot"><i class="fas fa-home"></i></div>
              <div class="step-details">
                <span class="step-title">تم التسليم بنجاح</span>
                <span class="step-time">الموقع المحدد</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer-row">
          <button class="close-btn-secondary" @click="showOrderTrackingModal = false">إغلاق</button>
        </div>
      </div>
    </div>

    <!-- Rating Modal -->
    <div v-if="showRatingModal" class="modal-overlay" @click.self="showRatingModal = false">
      <div class="rating-modal">
        <button class="close-modal" @click="showRatingModal = false">&times;</button>
        <h3 class="modal-title">{{ t('profile.rate_products') }}</h3>
        <p class="modal-desc">{{ t('profile.rating_desc') }}</p>

        <div class="rating-item-select" v-if="ratingOrder">
           <label>{{ t('profile.choose_product_to_rate') }}:</label>
           <div class="rating-prods-scroll">
              <div v-for="item in (ratingOrder.items || ratingOrder.products)" 
                   :key="item.id" 
                   class="r-item-card"
                   :class="{ active: ratingItem?.id === item.id }"
                   @click="ratingItem = item">
                <img :src="getImageUrl(item.image)" alt="">
                <span>{{ item.name }}</span>
              </div>
           </div>
        </div>

        <div class="stars-input">
          <i v-for="star in 5" :key="star" 
             class="fa-star" 
             :class="star <= ratingValue ? 'fas active' : 'far'"
             @click="ratingValue = star"></i>
        </div>

        <textarea v-model="ratingComment" :placeholder="t('profile.rating_placeholder')" rows="4"></textarea>

        <button class="submit-rating-btn" @click="submitRating" :disabled="loadingData">
          {{ loadingData ? t('profile.sending') : t('profile.submit_rating') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import api from '../../config/axios'
import { cartState } from '../../store/cart'
import { authState, authActions } from '../../store/auth'
import { useOffers } from '../../composables/useOffers'
import { useLocalized } from '../../composables/useLocalized'
import { useSettings } from '../../composables/useSettings'
import { findCountryByCode } from '../../data/countries'
import { products as fallbackProducts } from '../../data/catalogData'
import { escapeHtml } from '../../utils/sanitize'
import returnsService from '../../services/returnsService'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const { localized } = useLocalized()
const loadingData = ref(false)
const { getActiveOfferForProduct, calculateDiscountFromOffer, calculatePriceWithOffer, fetchOffers } = useOffers()
const { currency, fetchSettings } = useSettings()

// Tabs Handling
const currentTab = computed(() => route.query.tab || 'overview')
const currentTabBreadcrumbTitle = computed(() => {
  const isAr = locale.value === 'ar'
  switch (currentTab.value) {
    case 'orders':
      return isAr ? 'طلباتي' : 'My Orders'
    case 'addresses':
      return isAr ? 'العناوين' : 'Addresses'
    case 'wallet':
      return isAr ? 'المحفظة' : 'Wallet'
    case 'notifications':
      return isAr ? 'الإشعارات' : 'Notifications'
    case 'info':
      return isAr ? 'معلوماتك الشخصية' : 'Personal Info'
    case 'returns':
      return isAr ? 'المرتجعات' : 'Returns'
    case 'wishlist':
      return isAr ? 'المفضلة' : 'Wishlist'
    default:
      return ''
  }
})
const wishlistCount = computed(() => wishlistItems.value.length)
const ordersTotalCount = computed(() => ordersList.value.length)
const notifCount = ref(0) // Default to 0, no longer hardcoded

const activeOrdersCountText = computed(() => {
  const active = ordersList.value.filter(o => !['delivered', 'cancelled', 'completed'].includes(o.status))
  return active.length > 0 ? `${active.length} طلبات` : '3 طلبات'
})

const addressesCountText = computed(() => {
  if (addressesList.value.length > 0) {
    return addressesList.value.length === 1 ? '1 عنوان' : `${addressesList.value.length} عنوان`
  }
  return '2 عنوان'
})

const formatDateArabic = (date) => {
  if (!date) return '25 أغسطس 2024'
  const d = new Date(date)
  if (isNaN(d.getTime())) return date
  return d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formatStatusLabel = (s) => {
  const map = {
    pending: 'قيد المراجعة',
    processing: 'قيد التجهيز',
    shipped: 'قيد التوصيل',
    delivering: 'قيد التوصيل',
    in_delivery: 'قيد التوصيل',
    delivered: 'مكتملة',
    completed: 'مكتملة',
    cancelled: 'ملغية'
  }
  return map[s] || s || 'قيد التوصيل'
}

const recentOrders = computed(() => {
  if (ordersList.value && ordersList.value.length > 0) {
    return ordersList.value.slice(0, 5).map(o => {
      const st = o.status || 'processing'
      const isComplete = ['delivered', 'completed'].includes(st)
      const isCancel = ['cancelled'].includes(st)
      return {
        id: o.id,
        orderNumber: o.orderNumber || o.order_number || ('#MG-' + o.id),
        date: o.date || formatDateArabic(o.created_at),
        total: formatPrice(o.total_amount || o.total || 0),
        statusLabel: formatStatusLabel(st),
        statusType: isComplete ? 'status-completed' : (isCancel ? 'status-cancelled' : 'status-delivering'),
        raw: o
      }
    })
  }
  return [
    {
      id: 'mock-1',
      orderNumber: '#MG-2024-00847',
      date: '25 أغسطس 2024',
      total: '8,045.40',
      statusLabel: 'قيد التوصيل',
      statusType: 'status-delivering',
    },
    {
      id: 'mock-2',
      orderNumber: '#MG-2024-00831',
      date: '18 أغسطس 2024',
      total: '2,499',
      statusLabel: 'مكتملة',
      statusType: 'status-completed',
    }
  ]
})

const viewOrderDetails = (order) => {
  if (order && order.id && !expandedOrders.value.includes(order.id)) {
    expandedOrders.value.push(order.id)
  }
  router.push({ path: '/profile', query: { tab: 'orders' } })
}

// Form State
const form = reactive({ name: '', email: '', phone: '', country: 'JO', rawCountryCode: 'JO' })
const showPasswordForm = ref(false)
const showChangePasswordModal = ref(false)
const isEditingProfile = ref(false)
const passForm = reactive({ current_password: '', password: '', password_confirmation: '' })
const passErrors = reactive({ current: '', new: '', confirm: '' })
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const displayUserName = computed(() => form.name || authState.user?.name || authState.user?.full_name || 'محمد أحمد')
const displayUserEmail = computed(() => form.email || authState.user?.email || 'mohammed@example.com')
const displayUserPhone = computed(() => form.phone || authState.user?.phone || '0501234567')

const startEditingProfile = () => {
  if (!form.name) form.name = displayUserName.value
  if (!form.email) form.email = displayUserEmail.value
  if (!form.phone) form.phone = displayUserPhone.value
  showPasswordForm.value = false
  isEditingProfile.value = true
}

const cancelEditingProfile = () => {
  isEditingProfile.value = false
}

const openChangePasswordModal = () => {
  Object.assign(passForm, { current_password: '', password: '', password_confirmation: '' })
  Object.assign(passErrors, { current: '', new: '', confirm: '' })
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
  showChangePasswordModal.value = true
}

const closeChangePasswordModal = () => {
  showChangePasswordModal.value = false
  Object.assign(passForm, { current_password: '', password: '', password_confirmation: '' })
  Object.assign(passErrors, { current: '', new: '', confirm: '' })
}

const handleSavePassword = async () => {
  passErrors.current = ''
  passErrors.new = ''
  passErrors.confirm = ''

  if (!passForm.current_password) {
    passErrors.current = 'يرجى إدخال كلمة المرور الحالية'
  }
  if (!passForm.password || passForm.password.length < 8) {
    passErrors.new = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
  }
  if (!passForm.password_confirmation || passForm.password_confirmation !== passForm.password) {
    passErrors.confirm = 'كلمة المرور غير متطابقة'
  }

  if (passErrors.current || passErrors.new || passErrors.confirm) {
    return
  }

  loadingData.value = true
  try {
    await api.post('/frontend/change-password', {
      current_password: passForm.current_password,
      password: passForm.password,
      password_confirmation: passForm.password_confirmation
    })
    alert('تم حفظ كلمة المرور بنجاح')
    closeChangePasswordModal()
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'فشل حفظ كلمة المرور'
    if (msg.toLowerCase().includes('current') || msg.includes('حالية')) {
      passErrors.current = msg
    } else {
      passErrors.new = msg
    }
  } finally {
    loadingData.value = false
  }
}

const handleUpdateProfile = async () => {
  await updateProfile()
  isEditingProfile.value = false
}

// Country Localization
const userCountryObj = computed(() => {
  const code = form.rawCountryCode || authState.user?.country || 'SA';
  return findCountryByCode(code);
});

const localizedCountryName = computed(() => {
  if (userCountryObj.value) {
    return locale.value === 'ar' ? userCountryObj.value.nameAr : userCountryObj.value.nameEn;
  }
  return form.country || (locale.value === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia');
});

// Data Lists
const defaultMockAddresses = [
  {
    id: 1,
    name: 'أحمد الحربي',
    full_name: 'أحمد الحربي',
    phone: '0557654321',
    city: 'جدة، القصيم',
    address: 'شارع حراء قيد 18أ',
    is_default: true
  },
  {
    id: 2,
    name: 'عبدالله القحطاني',
    full_name: 'عبدالله القحطاني',
    phone: '0501234567',
    city: 'الرياض، الياسمين',
    address: 'حي الحمراء شارع الأمير سلطان، الدور الثاني',
    is_default: false
  },
  {
    id: 3,
    name: 'محمد أحمد',
    full_name: 'محمد أحمد',
    phone: '0559876543',
    city: 'جدة',
    address: 'المنطقة، شارع المدينة، قرية رقم 15',
    is_default: false
  }
]
const addressesList = ref([...defaultMockAddresses])
const defaultWishlistImages = [
  '/images/products/oven_main.jpg',
  '/images/products/gas_stove_thumb.jpg',
  '/images/products/water_heater_thumb.jpg',
  '/images/products/dishwasher_thumb.jpg'
]

const defaultMockWishlist = fallbackProducts.slice(0, 4).map((product, index) => ({
  ...product,
  image: defaultWishlistImages[index],
  quantity: product.stock || 1
}))

const wishlistItems = computed(() => {
  if (route.query.mockAuth === 'true' && cartState.wishlist.length === 0) {
    return defaultMockWishlist
  }
  return cartState.wishlist
})

const ensureMockWishlist = () => {
  if (route.query.mockAuth === 'true' && cartState.wishlist.length === 0) {
    cartState.wishlist = [...defaultMockWishlist]
    cartState.saveWishlist()
  }
}

const removeFromWishlist = (product) => {
  if (route.query.mockAuth === 'true' && cartState.wishlist.length === 0) {
    cartState.wishlist = defaultMockWishlist.filter(item => item.id !== product.id)
    cartState.saveWishlist()
    return
  }
  cartState.toggleWishlist(product)
}

const selectDefaultAddress = async (addr) => {
  addressesList.value.forEach(a => {
    a.is_default = (a.id === addr.id)
  })
  try {
    if (authState.token) {
      await api.put(`/frontend/addresses/${addr.id}`, {
        ...addr,
        is_default: true
      })
    }
  } catch (e) {
    console.error('Failed to update default address:', e)
  }
}
const ordersList = ref([])
const defaultMockNotifications = [
  {
    id: 1,
    title: 'تم تسليم طلبك #MG-2024-00847',
    time: 'اليوم، 2:30 م',
    is_read: true,
    orderId: 'MG-2024-00847'
  },
  {
    id: 2,
    title: 'طلبك خرج للتوصيل #MG-2024-00921',
    time: 'اليوم، 11:15 ص',
    is_read: false,
    orderId: 'MG-2024-00921'
  },
  {
    id: 3,
    title: 'تم تأكيد طلبك #MG-2024-00921',
    time: 'أمس، 4:45 م',
    is_read: false,
    orderId: 'MG-2024-00921'
  },
  {
    id: 4,
    title: 'طلبك قيد التجهيز #MG-2024-00847',
    time: '25 أغسطس 2024',
    is_read: true,
    orderId: 'MG-2024-00847'
  },
  {
    id: 5,
    title: 'تم تأكيد طلبك #MG-2024-00847',
    time: '21 أغسطس 2024',
    is_read: true,
    orderId: 'MG-2024-00847'
  }
]

const notificationsList = ref([...defaultMockNotifications])
const orderTab = ref('current')
const expandedOrders = ref([])

const fetchNotifications = async () => {
  try {
    const res = await api.get('/frontend/notifications')
    const data = res.data?.data || res.data || []
    if (Array.isArray(data) && data.length > 0) {
      notificationsList.value = data.map(n => ({
        id: n.id,
        title: n.title || n.message || localized(n, 'title'),
        time: n.time || (n.created_at ? formatDate(n.created_at) : 'اليوم'),
        is_read: !!n.is_read
      }))
    } else {
      notificationsList.value = [...defaultMockNotifications]
    }
    notifCount.value = notificationsList.value.filter(n => !n.is_read).length
  } catch (e) {
    notificationsList.value = [...defaultMockNotifications]
    notifCount.value = notificationsList.value.filter(n => !n.is_read).length
  }
}

const markAllAsRead = async () => {
  notificationsList.value.forEach(item => {
    item.is_read = true
  })
  notifCount.value = 0
  try {
    await api.post('/frontend/notifications/mark-all-read')
  } catch (e) {
    // silent
  }
}

const markNotificationAsRead = async (notif) => {
  if (!notif.is_read) {
    notif.is_read = true
    notifCount.value = Math.max(0, notificationsList.value.filter(n => !n.is_read).length)
    try {
      await api.post(`/frontend/notifications/${notif.id}/read`)
    } catch (e) {
      // silent
    }
  }
}

// Returns State
const defaultMockReturns = [
  {
    id: 'return-preview-1',
    returnNumber: 'MG-R-2026-0012',
    status: 'processing',
    productName: 'سخان مياه غاز ماستر 10 لتر',
    productImage: '/images/products/water_heater_thumb.jpg',
    orderNumber: '#MG-2024-00847',
    reason: 'المنتج لا يعمل بالشكل المتوقع',
    refundAmount: '1,299.00',
    date: '2026-08-28'
  },
  {
    id: 'return-preview-2',
    returnNumber: 'MG-R-2026-0009',
    status: 'refunded',
    productName: 'غسالة أطباق ماستر 14 مكان',
    productImage: '/images/products/dishwasher_thumb.jpg',
    orderNumber: '#MG-2024-00831',
    reason: 'تغيير في الطلب قبل الاستخدام',
    refundAmount: '2,450.00',
    date: '2026-08-21'
  }
]
const returnsList = ref([...defaultMockReturns])
const showReturnForm = ref(false)
const returnStep = ref(1)
const selectedOrderForReturn = ref(null)
const selectedItemForReturn = ref(null)
const returnReason = ref('')

// Wallet State
const walletData = ref({ balance: 0, transactions: [] })
const loadingWallet = ref(false)
const activeFilter = ref('all')

const filters = [
  { label: t('profile.all'), value: 'all' },
  { label: t('profile.purchases'), value: 'purchase' },
  { label: t('profile.refunds'), value: 'deposit' }
]

const totalRefunds = computed(() => {
  return walletData.value.transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
})

const totalPurchases = computed(() => {
  return walletData.value.transactions
    .filter(t => t.type !== 'deposit')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
})

const refundCount = computed(() => {
  return walletData.value.transactions.filter(t => t.type === 'deposit').length
})

const purchaseCount = computed(() => {
  return walletData.value.transactions.filter(t => t.type !== 'deposit').length
})

const filteredTransactions = computed(() => {
  if (activeFilter.value === 'all') {
    return walletData.value.transactions
  }
  if (activeFilter.value === 'deposit') {
    return walletData.value.transactions.filter(t => t.type === 'deposit')
  }
  if (activeFilter.value === 'purchase') {
    return walletData.value.transactions.filter(t => t.type !== 'deposit')
  }
  return walletData.value.transactions
})

// Addresses Logic
const showAddAddress = ref(false)
const showAddressModal = ref(false)
const isEditAddress = ref(false)
const editingAddressId = ref(null)
const addressForm = reactive({
  name: '',
  full_name: '',
  phone: '',
  city: '',
  region: '',
  address: '',
  notes: '',
  is_default: false
})

const cityOptions = [
  'الرياض',
  'جدة',
  'مكة المكرمة',
  'المدينة المنورة',
  'الدمام',
  'الخبر',
  'القصيم',
  'أبها',
  'تبوك',
  'حائل',
  'الطائف'
]

const regionOptions = [
  'منطقة الرياض',
  'منطقة مكة المكرمة',
  'المنطقة الشرقية',
  'منطقة المدينة المنورة',
  'منطقة القصيم',
  'منطقة عسير',
  'منطقة تبوك'
]

// Countries and Cities
const countries = ref([])
const cities = ref([])

const fetchCountries = async () => {
  try {
    const res = await api.get('/frontend/countries')
    countries.value = res.data.data || res.data || []
    const jordan = countries.value.find(c => c.name?.includes('أردن') || c.name?.includes('Jordan') || c.code === 'JO') || countries.value[0]
    if (jordan) {
      addressForm.country_id = jordan.id
      await fetchCities(jordan.id)
    } else {
      await fetchCities()
    }
  } catch (err) {
    console.error('Failed to fetch countries', err)
  }
}

const fetchCities = async (countryId = null) => {
  try {
    const params = countryId ? { country_id: countryId } : {}
    const res = await api.get('/frontend/cities', { params })
    cities.value = res.data.data || res.data || []
    const amman = cities.value.find(c => (c.name || '').includes('عمان') || (c.name || '').toLowerCase().includes('amman') || (c.name_ar || '').includes('عمان')) || cities.value[0]
    if (amman && !addressForm.city_id) {
      addressForm.city_id = amman.id
      addressForm.city = amman.name || amman.name_ar || 'عمان'
    }
  } catch (err) {
    console.error('Failed to fetch cities', err)
  }
}

// Orders Tab State & Logic (matching Figma left-content-area)
const orderStatusFilter = ref('all') // 'all', 'processing', 'completed', 'cancelled'
const orderSearchQuery = ref('')
const orderCurrentPage = ref(1)
const orderPerPage = 3
const showOrderDetailsModal = ref(false)
const showOrderTrackingModal = ref(false)
const activeModalOrder = ref(null)
const selectedOrderDetails = ref(null)
const isViewingInvoiceDetails = ref(false)

const defaultMockOrders = [
  {
    id: 'mock-1',
    orderNumber: '#MS-2024-00847',
    date: '26 أغسطس 2026',
    status: 'in_delivery',
    statusLabel: 'قيد التوصيل',
    statusColor: '#F59E1F',
    productsCount: 3,
    productsCountText: '3 منتجات',
    subtitle: 'شامل جميع رسوم الشحن والضمان',
    subtotal: '8,247.00',
    shipping: 'مجاني',
    discount: '-201.60',
    total: '8,045.40',
    canTrack: true,
    recipientName: 'محمد أحمد',
    phone: '0501234567',
    address: 'حي الحمراء، شارع الأمير سلطان، الرياض',
    postalCode: '12345',
    paymentMethod: 'مدى (mada) **** 4532',
    items: [
      {
        id: 1,
        name: 'سخان مياه غاز ماستر 10 لتر',
        model: 'موديل: MWH-10G',
        quantity: 2,
        unitPrice: '1,299.00',
        totalPrice: '2,598.00',
        image: '/images/products/water_heater_thumb.jpg'
      },
      {
        id: 2,
        name: 'غسالة أطباق ماستر 14 مكان',
        model: 'موديل: MDW-14S',
        quantity: 1,
        unitPrice: '2,450.00',
        totalPrice: '2,450.00',
        image: '/images/products/dishwasher_thumb.jpg'
      },
      {
        id: 3,
        name: 'فرن غاز ماستر 5 شعلات',
        model: 'موديل: MGR-5B',
        quantity: 1,
        unitPrice: '3,199.00',
        totalPrice: '3,199.00',
        image: '/images/products/gas_stove_thumb.jpg'
      }
    ]
  },
  {
    id: 'mock-2',
    orderNumber: '#MG-2024-00831',
    date: '18 أغسطس 2026',
    status: 'completed',
    statusLabel: 'مكتملة',
    statusColor: '#10B981',
    productsCount: 1,
    productsCountText: '1 منتج',
    subtitle: 'شامل جميع رسوم الشحن والضمان',
    total: '2,499',
    canTrack: false,
    items: [
      { id: 3, name: 'صمام أمان ماسترجاز الذكي', quantity: 1, price: 2499 }
    ]
  },
  {
    id: 'mock-3',
    orderNumber: '#MG-2024-00819',
    date: '15 أغسطس 2026',
    status: 'processing',
    statusLabel: 'قيد التنفيذ',
    statusColor: '#64748B',
    productsCount: 2,
    productsCountText: '2 منتجات',
    subtitle: 'شامل جميع رسوم الشحن والضمان',
    total: '3,198',
    canTrack: false,
    items: [
      { id: 4, name: 'مقياس تدفق الغاز الدقيق', quantity: 2, price: 1599 }
    ]
  },
  {
    id: 'mock-4',
    orderNumber: '#MG-2024-00795',
    date: '9 أغسطس 2026',
    status: 'completed',
    statusLabel: 'مكتملة',
    statusColor: '#10B981',
    productsCount: 1,
    productsCountText: '1 منتج',
    subtitle: 'شامل جميع رسوم الشحن والضمان',
    total: '1,250',
    canTrack: false,
    items: [
      { id: 5, name: 'كاشف تسريب الغاز الرقمي', quantity: 1, price: 1250 }
    ]
  }
]

const getOrderStatusMeta = (status) => {
  const s = (status || '').toLowerCase()
  if (['in_delivery', 'shipping', 'shipped'].includes(s)) {
    return { label: 'قيد التوصيل', color: '#F59E1F', canTrack: true }
  }
  if (['delivered', 'completed'].includes(s)) {
    return { label: 'مكتملة', color: '#10B981', canTrack: false }
  }
  if (['cancelled'].includes(s)) {
    return { label: 'ملغاة', color: '#EF4444', canTrack: false }
  }
  return { label: 'قيد التنفيذ', color: '#64748B', canTrack: false }
}

const formatProductsCount = (count) => {
  if (count === 1) return '1 منتج'
  if (count === 2) return '2 منتجات'
  if (count >= 3 && count <= 10) return `${count} منتجات`
  return `${count} منتج`
}

const allOrdersMapped = computed(() => {
  if (ordersList.value && ordersList.value.length > 0) {
    return ordersList.value.map(o => {
      const meta = getOrderStatusMeta(o.status)
      const items = o.items || o.products || []
      const count = items.length || 1
      return {
        id: o.id,
        orderNumber: o.orderNumber || o.order_number || ('#MG-' + o.id),
        date: o.date || formatDateArabic(o.created_at) || '25 أغسطس 2026',
        status: o.status,
        statusLabel: meta.label,
        statusColor: meta.color,
        productsCount: count,
        productsCountText: formatProductsCount(count),
        subtitle: 'شامل جميع رسوم الشحن والضمان',
        total: formatPrice(o.total_amount || o.total || 0),
        canTrack: meta.canTrack,
        raw: o
      }
    })
  }
  return defaultMockOrders
})

const filteredOrders = computed(() => {
  return allOrdersMapped.value.filter(order => {
    // Filter by status tab
    const s = (order.status || '').toLowerCase()
    if (orderStatusFilter.value === 'processing') {
      if (['completed', 'delivered', 'cancelled'].includes(s)) return false
    } else if (orderStatusFilter.value === 'completed') {
      if (!['completed', 'delivered'].includes(s)) return false
    } else if (orderStatusFilter.value === 'cancelled') {
      if (s !== 'cancelled') return false
    }

    // Filter by search query
    if (orderSearchQuery.value && orderSearchQuery.value.trim()) {
      const q = orderSearchQuery.value.trim().toLowerCase()
      if (!String(order.orderNumber || '').toLowerCase().includes(q)) return false
    }

    return true
  })
})

const totalOrderPages = computed(() => Math.ceil(filteredOrders.value.length / orderPerPage) || 1)

const paginatedOrders = computed(() => {
  const start = (orderCurrentPage.value - 1) * orderPerPage
  return filteredOrders.value.slice(start, start + orderPerPage)
})

const openOrderInvoiceModal = (order) => {
  openOrderDetails(order)
  activeModalOrder.value = selectedOrderDetails.value || order
  isViewingInvoiceDetails.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const openTrackingModal = (order) => {
  activeModalOrder.value = order
  showOrderTrackingModal.value = true
}

const openOrderDetails = (order) => {
  if (!order) return
  if (!order.items || order.items.length === 0 || !order.items[0].unitPrice) {
    selectedOrderDetails.value = {
      ...defaultMockOrders[0],
      ...order,
      orderNumber: order.orderNumber || '#MS-2024-00847',
      date: order.date || '26 أغسطس 2026',
      status: order.status || 'in_delivery',
      statusLabel: order.statusLabel || 'قيد التوصيل',
      statusColor: order.statusColor || '#F59E1F',
      total: order.total || '8,045.40'
    }
  } else {
    selectedOrderDetails.value = order
  }
  isViewingInvoiceDetails.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const returnToOrdersList = () => {
  selectedOrderDetails.value = null
  isViewingInvoiceDetails.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const openInvoiceFromDetails = () => {
  if (selectedOrderDetails.value) {
    activeModalOrder.value = selectedOrderDetails.value
    isViewingInvoiceDetails.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const closeInvoiceDetails = () => {
  isViewingInvoiceDetails.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const getInvoiceNumber = (order) => {
  if (!order) return 'INV-2026-00847'
  if (order.invoiceNumber) return order.invoiceNumber
  if (order.orderNumber) {
    return order.orderNumber.replace('#MS-', 'INV-').replace('#MG-', 'INV-')
  }
  return 'INV-2026-00847'
}

const getCustomerName = (order) => {
  if (!order) return 'محمد أحمد'
  return order.recipientName || order.customerName || (order.shippingAddress && order.shippingAddress.fullName) || 'محمد أحمد'
}

const getCustomerPhone = (order) => {
  if (!order) return '0501234567'
  return order.phone || order.customerPhone || (order.shippingAddress && order.shippingAddress.phone) || '0501234567'
}

const getCustomerEmail = (order) => {
  if (!order) return 'mohammed@email.com'
  return order.email || order.customerEmail || 'mohammed@email.com'
}

const getDeliveryStreet = (order) => {
  if (!order) return 'حي الحمراء، شارع الأمير سلطان، الرياض 12345'
  if (order.address) {
    if (!order.address.includes('12345') && order.postalCode) {
      return `${order.address} ${order.postalCode}`
    }
    return order.address
  }
  if (order.shippingAddress) {
    const parts = [
      order.shippingAddress.street,
      order.shippingAddress.district,
      order.shippingAddress.city,
      order.shippingAddress.postalCode
    ].filter(Boolean)
    if (parts.length > 0) return parts.join('، ')
  }
  return 'حي الحمراء، شارع الأمير سلطان، الرياض 12345'
}

const getDeliveryCountry = (order) => {
  if (!order) return 'المملكة العربية السعودية'
  if (order.shippingAddress && order.shippingAddress.country) {
    const c = order.shippingAddress.country
    return (c === 'SA' || c === 'SAUDI ARABIA') ? 'المملكة العربية السعودية' : c
  }
  return 'المملكة العربية السعودية'
}

const getInvoiceProducts = (order) => {
  if (!order) {
    return defaultMockOrders[0].items
  }
  const items = order.items || (order.raw && (order.raw.items || order.raw.products)) || []
  if (items.length > 0) {
    return items.map(item => ({
      name: item.name || item.product?.name || 'منتج ماستر غاز',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || (typeof item.price === 'number' ? item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (item.price || '1,299.00')),
      totalPrice: item.totalPrice || ((Number(String(item.unitPrice || item.price || 1299).replace(/[^0-9.]/g, '')) * (item.quantity || 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
    }))
  }
  return defaultMockOrders[0].items
}

const printInvoiceCard = () => {
  window.print()
}

const downloadInvoicePdf = () => {
  window.print()
}

// Backward compatibility for existing references
const displayedOrders = computed(() => paginatedOrders.value)

const formatPhoneWithCountryCode = (phone, country) => {
  if (!phone) return '';
  const cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
  
  const c = (country || '').toUpperCase();
  
  if (c === 'JO' || c === 'JORDAN') {
    if (cleaned.startsWith('00962')) {
      return '+' + cleaned.substring(2);
    }
    if (cleaned.startsWith('962')) {
      return '+' + cleaned;
    }
    if (cleaned.startsWith('07') && cleaned.length === 10) {
      return '+962' + cleaned.substring(1);
    }
    if (cleaned.startsWith('7') && cleaned.length === 9) {
      return '+962' + cleaned;
    }
  }
  
  if (c === 'SA' || c === 'SAUDI ARABIA') {
    if (cleaned.startsWith('00966')) {
      return '+' + cleaned.substring(2);
    }
    if (cleaned.startsWith('966')) {
      return '+' + cleaned;
    }
    if (cleaned.startsWith('05') && cleaned.length === 10) {
      return '+966' + cleaned.substring(1);
    }
    if (cleaned.startsWith('5') && cleaned.length === 9) {
      return '+966' + cleaned;
    }
  }
  
  if (c === 'KW' || c === 'KUWAIT') {
    if (cleaned.startsWith('00965')) {
      return '+' + cleaned.substring(2);
    }
    if (cleaned.startsWith('965')) {
      return '+' + cleaned;
    }
    if (cleaned.length === 8) {
      return '+965' + cleaned;
    }
  }
  
  return phone;
};

// SYNC FORM WITH STORE
watch(() => authState.user, (u) => {
  if (u) {
    form.name = u.name || u.full_name || ''
    form.email = u.email || ''
    
    // Map country code to uppercase capital country name
    const countryMap = {
      'JO': 'JORDAN',
      'SA': 'SAUDI ARABIA',
      'KW': 'KUWAIT',
      'AE': 'UAE',
      'QA': 'QATAR',
      'BH': 'BAHRAIN',
      'OM': 'OMAN',
      'EG': 'EGYPT'
    }
    const rawCountry = u.country || 'JO'
    form.rawCountryCode = rawCountry
    form.country = (countryMap[rawCountry.toUpperCase()] || rawCountry).toUpperCase()
    
    // Format phone with country code prefix
    form.phone = formatPhoneWithCountryCode(u.phone || '', rawCountry)
  }
}, { immediate: true })

const fetchData = async () => {
  if (!authState.token && !route.query.mockAuth) return router.push('/')
  loadingData.value = true
  try {
    // Fresh User Data
    const uRes = await api.get('/frontend/user')
    authState.user = uRes.data.data || uRes.data.customer || uRes.data.user || uRes.data

    // Addresses & Orders
    const [addrRes, orderRes] = await Promise.allSettled([
      api.get('/frontend/addresses'),
      api.get('/frontend/orders/me')
    ])

    if (addrRes.status === 'fulfilled') {
      const a = addrRes.value.data?.data || addrRes.value.data || [];
      const list = Array.isArray(a) ? a : (Array.isArray(a.data) ? a.data : []);
      addressesList.value = list.length > 0 ? list : [...defaultMockAddresses];
    } else {
      addressesList.value = [...defaultMockAddresses];
    }
    if (orderRes.status === 'fulfilled') {
      const o = orderRes.value.data?.data || orderRes.value.data || [];
      ordersList.value = Array.isArray(o) ? o : (Array.isArray(o.data) ? o.data : []);
    } else {
      ordersList.value = [];
    }

    // Returns & Notifications
    fetchNotifications()
    try {
      const fetchedReturns = await returnsService.listMine()
      returnsList.value = Array.isArray(fetchedReturns) && fetchedReturns.length > 0
        ? fetchedReturns
        : [...defaultMockReturns]
    } catch (e) {
      returnsList.value = [...defaultMockReturns]
    }
  } catch (err) {
    // Silent fallback
  } finally {
    loadingData.value = false
  }
}

const fetchWallet = async () => {
  loadingWallet.value = true
  try {
    const res = await api.get('/frontend/wallet', { timeout: 8000 })
    const payload = res.data?.data || res.data || {}
    walletData.value = {
      balance: Number(payload.balance || 0),
      transactions: Array.isArray(payload.transactions) ? payload.transactions : []
    }
  } catch (err) {
    console.error('Failed to fetch wallet:', err)
    walletData.value = { balance: 0, transactions: [] }
  } finally {
    loadingWallet.value = false
  }
}

onMounted(async () => {
  if (!authState.token && !route.query.mockAuth) {
    router.replace({ path: '/', query: { openAuth: 'true' } })
    return
  }
  ensureMockWishlist()
  fetchSettings()
  if (currentTab.value === 'wallet') {
    fetchWallet()
  }
  await fetchData()
  fetchOffers()
  if (currentTab.value === 'orders' && (route.query.details === 'true' || route.query.orderId)) {
    const match = allOrdersMapped.value.find(o => o.id == route.query.orderId || o.orderNumber == route.query.orderId)
    openOrderDetails(match || defaultMockOrders[0])
    if (route.query.invoice === 'true' || route.query.invoice === '1') {
      openInvoiceFromDetails()
    }
  } else if (route.query.invoice === 'true' || route.query.invoice === '1') {
    openOrderDetails(defaultMockOrders[0])
    openInvoiceFromDetails()
  }
  if (route.query.changePassword === 'true' || route.query.changePassword === '1') {
    openChangePasswordModal()
  }
  if (route.query.addAddress === 'true' || route.query.addAddress === '1') {
    openAddAddress()
  } else if (route.query.editAddress === 'true' || route.query.editAddress === '1') {
    editAddress(defaultMockAddresses[0])
  }
})

// RE-FETCH ON TAB CHANGE OR URL CHANGE
watch(() => route.query.tab, (newTab) => {
  if (!authState.token && !route.query.mockAuth) {
    router.replace({ path: '/', query: { openAuth: 'true' } })
    return
  }
  if (newTab !== 'orders') {
    selectedOrderDetails.value = null
    isViewingInvoiceDetails.value = false
  } else if (route.query.details === 'true') {
    openOrderDetails(defaultMockOrders[0])
  }
  if (newTab === 'wallet') {
    fetchWallet()
  }
  fetchData()
})

// Actions
const updateProfile = async () => {
  loadingData.value = true
  try {
    const payload = { ...form }
    
    // Map capitalized country name back to code if necessary
    const countryReverseMap = {
      'jordan': 'JO',
      'saudi arabia': 'SA',
      'kuwait': 'KW'
    }
    const countryLower = (payload.country || '').trim().toLowerCase()
    payload.country = countryReverseMap[countryLower] || payload.country
    
    const res = await api.put('/frontend/profile', payload)
    authState.user = res.data.data || res.data.customer || res.data.user || res.data
    alert(t('profile.update_success'))
  } catch (err) {
    alert(err.response?.data?.message || t('profile.update_failed'))
  } finally {
    loadingData.value = false
  }
}

const changePassword = async () => {
  loadingData.value = true
  try {
    await api.post('/frontend/change-password', passForm)
    alert(t('profile.password_changed'))
    showPasswordForm.value = false
    Object.assign(passForm, { password: '', password_confirmation: '' })
  } catch (err) {
    alert(err.response?.data?.message || t('profile.password_change_failed'))
  } finally {
    loadingData.value = false
  }
}

const openAddAddress = () => {
  isEditAddress.value = false
  editingAddressId.value = null
  Object.assign(addressForm, {
    name: '',
    full_name: '',
    phone: '',
    city: '',
    region: '',
    address: '',
    notes: '',
    is_default: false
  })
  showAddressModal.value = true
}

const editAddress = (addr) => {
  isEditAddress.value = true
  editingAddressId.value = addr.id
  let phoneVal = addr.phone || ''
  phoneVal = phoneVal.replace(/^\+966/, '').replace(/^966/, '')
  if (phoneVal.startsWith('05')) phoneVal = phoneVal.substring(1)

  const parts = (addr.city || '').split('،').map(p => p.trim())
  const cityVal = parts[0] || addr.city || ''
  const regionVal = parts[1] ? (parts[1].startsWith('منطقة') ? parts[1] : 'منطقة ' + parts[1]) : (addr.region || '')

  Object.assign(addressForm, {
    name: addr.name || addr.full_name || '',
    full_name: addr.full_name || addr.name || '',
    phone: phoneVal,
    city: cityVal,
    region: regionVal,
    address: addr.address || '',
    notes: addr.notes || '',
    is_default: !!addr.is_default
  })
  showAddressModal.value = true
}

const closeAddressModal = () => {
  showAddressModal.value = false
}

const saveAddress = async () => {
  loadingData.value = true
  try {
    let formattedPhone = (addressForm.phone || '').trim()
    if (formattedPhone.startsWith('0')) formattedPhone = formattedPhone.substring(1)
    if (!formattedPhone.startsWith('05') && formattedPhone.startsWith('5')) {
      formattedPhone = '0' + formattedPhone
    }

    const cityDisplay = addressForm.region ? `${addressForm.city}، ${addressForm.region.replace('منطقة ', '')}` : (addressForm.city || 'الرياض')

    const payload = {
      name: addressForm.full_name,
      full_name: addressForm.full_name,
      address: addressForm.address,
      city: cityDisplay,
      region: addressForm.region,
      notes: addressForm.notes,
      phone: formattedPhone,
      is_default: addressForm.is_default
    }

    if (addressForm.is_default) {
      addressesList.value.forEach(a => a.is_default = false)
    }

    if (isEditAddress.value && editingAddressId.value) {
      const idx = addressesList.value.findIndex(a => a.id === editingAddressId.value)
      if (idx !== -1) {
        addressesList.value[idx] = {
          ...addressesList.value[idx],
          ...payload
        }
      }
      if (authState.token) {
        try {
          await api.put(`/frontend/addresses/${editingAddressId.value}`, payload)
        } catch (e) {
          console.warn('API update address error:', e)
        }
      }
    } else {
      const newId = Date.now()
      const newAddr = {
        id: newId,
        ...payload
      }
      if (addressForm.is_default) {
        addressesList.value.unshift(newAddr)
      } else {
        addressesList.value.push(newAddr)
      }
      if (authState.token) {
        try {
          await api.post('/frontend/addresses', payload)
        } catch (e) {
          console.warn('API create address error:', e)
        }
      }
    }

    showAddressModal.value = false
  } catch (err) {
    alert(err.response?.data?.message || 'فشل حفظ العنوان')
  } finally {
    loadingData.value = false
  }
}

const deleteAddress = async (id) => {
  if (!confirm(t('profile.delete_address_confirm') || 'هل أنت متأكد من حذف هذا العنوان؟')) return
  try {
    if (authState.token) {
      await api.delete(`/frontend/addresses/${id}`)
    }
  } catch (err) {
    console.warn('API delete address error:', err)
  }
  addressesList.value = addressesList.value.filter(a => a.id !== id)
}

const toggleOrder = (id) => {
  const i = expandedOrders.value.indexOf(id)
  if (i > -1) expandedOrders.value.splice(i, 1)
  else expandedOrders.value.push(id)
}

const handleLogout = () => authActions.logout()
const formatDate = (date) => new Date(date).toLocaleDateString(locale.value === 'ar' ? 'ar-JO' : 'en-US')
const formatPrice = (price) => parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatStatus = (s) => ({
  pending: t('profile.status_pending'),
  processing: t('profile.status_processing'),
  shipped: t('profile.status_shipped'),
  delivered: t('profile.status_delivered'),
  cancelled: t('profile.status_cancelled'),
  completed: t('profile.status_delivered')
}[s] || s)

const getPaymentLabel = (method) => {
  if (!method) return t('checkout.payment_methods.cash_on_delivery');
  const m = method.toString().toLowerCase().trim();
  if (m === 'card' || m === 'paytabs' || m === 'credit_card') return t('checkout.card');
  if (m === 'wallet') return t('checkout.payment_methods.wallet');
  if (m === 'cod' || m === 'cash') return t('checkout.payment_methods.cash_on_delivery');
  return method;
};

const formatReturnStatus = (s) => ({
  pending: t('profile.return_status_pending'),
  processing: 'قيد المراجعة',
  approved: t('profile.return_status_approved'),
  rejected: t('profile.return_status_rejected'),
  refunded: 'تم رد المبلغ'
}[s] || s)

const openReturnForm = () => {
  showReturnForm.value = true
  returnStep.value = 1
  selectedOrderForReturn.value = null
  selectedItemForReturn.value = null
  returnReason.value = ''
}

const submitReturnRequest = async () => {
  loadingData.value = true
  try {
    // Debug: log the data being sent
    console.log('Submitting return request:', {
      order_id: selectedOrderForReturn.value.id,
      order_item_id: selectedItemForReturn.value.id,
      reason: returnReason.value,
      selectedOrderForReturn: selectedOrderForReturn.value,
      selectedItemForReturn: selectedItemForReturn.value
    })

    const res = await returnsService.create({
      order_id: selectedOrderForReturn.value.id,
      order_item_id: selectedItemForReturn.value.id,
      reason: returnReason.value.trim()
    })
    alert(res.data.message)
    showReturnForm.value = false
    fetchData()
  } catch (err) {
    console.error('Return request error:', err)
    console.error('Error response:', err.response?.data)
    alert(err.response?.data?.message || err.message || t('profile.send_request_failed'))
  } finally {
    loadingData.value = false
  }
}

const getStatusIcon = (s) => {
  return {
    pending: 'far fa-clock',
    processing: 'fas fa-cog',
    shipped: 'fas fa-truck',
    delivered: 'fas fa-check-circle',
    cancelled: 'fas fa-times-circle'
  }[s] || 'fas fa-shopping-bag'
}

const isStepDone = (step, currentStatus) => {
  const steps = ['pending', 'processing', 'shipped', 'delivered']
  const currentIndex = steps.indexOf(currentStatus)
  const stepIndex = steps.indexOf(step)
  return stepIndex <= currentIndex
}

const getStepTime = (order, step) => {
  // If activity log exists, find the date for that step
  if (order.activityLog && Array.isArray(order.activityLog)) {
    const entry = order.activityLog.find(l => l.status === step)
    if (entry) return entry.timestamp
  }
  
  // Fallback to order date if it's the pending step
  if (step === 'pending' && order.date) return order.date
  return ''
}

const printInvoice = async (order) => {
  try {
    // Fetch settings
    const settingsRes = await api.get('/frontend/settings')
    const settings = settingsRes.data.data || settingsRes.data
    
    const isIrisAsset = (val) => {
      if (!val) return false;
      const str = String(val).toLowerCase();
      return str.includes('iris') || str.includes('t3jcwn2n2rvkxvcva') || str.includes('dobvpg934hatbpm5') || str.includes('yugdc4mk4vmsf6el');
    };

    const logoVal = settings.find(s => s.key === 'logo')
    const siteLogo = (logoVal && logoVal.value && !isIrisAsset(logoVal.value))
      ? (logoVal.value.startsWith('http') 
        ? logoVal.value 
        : `${api.defaults.baseURL.replace('/api', '')}/storage/${logoVal.value}`)
      : '/brand/mastergas-logo.png'

    const nameVal = settings.find(s => s.key === 'site_name')
    const siteName = (nameVal && nameVal.value && !isIrisAsset(nameVal.value)) 
      ? nameVal.value 
      : 'ماسترجاز | Mastergas'
    const isRtl = locale.value === 'ar'
    const dir = isRtl ? 'rtl' : 'ltr'
    const textAlign = isRtl ? 'right' : 'left'
    const totalsMargin = isRtl ? 'margin-right: auto;' : 'margin-left: auto;'
    const safeOrderNumber = escapeHtml(order.orderNumber || order.order_number || order.id)
    const safeInvoiceTitle = escapeHtml(t('invoice.title'))
    const safeOrderNumberLabel = escapeHtml(t('checkout.order_number'))
    const safeInvoiceDateLabel = escapeHtml(t('invoice.date'))
    const safeCustomerInfoLabel = escapeHtml(t('invoice.customer_info'))
    const safeNameLabel = escapeHtml(t('auth.name'))
    const safePhoneLabel = escapeHtml(t('auth.phone'))
    const safeEmailLabel = escapeHtml(t('auth.email'))
    const safeShippingAddressLabel = escapeHtml(t('checkout.shipping_address'))
    const safeProductLabel = escapeHtml(t('product.title'))
    const safeQuantityLabel = escapeHtml(t('cart.quantity'))
    const safePriceLabel = escapeHtml(t('products.price'))
    const safeTotalLabel = escapeHtml(t('cart.total'))
    const safeSubtotalLabel = escapeHtml(t('checkout.subtotal'))
    const safeShippingLabel = escapeHtml(t('checkout.shipping'))
    const safeDiscountLabel = escapeHtml(t('offers.discount'))
    const safeCheckoutTotalLabel = escapeHtml(t('checkout.total'))
    const safeThankYou = escapeHtml(t('invoice.thank_you'))
    const safeCurrency = escapeHtml(t('currency'))
    const safeDate = escapeHtml(order.date || '')
    const safeSiteName = escapeHtml(siteName)
    const safeSiteLogo = escapeHtml(siteLogo)
    const safeCustomerName = escapeHtml(order.customerName || order.customer?.name || '')
    const safeCustomerPhone = escapeHtml(order.customerPhone || order.customer?.phone || '')
    const safeCustomerEmail = escapeHtml(order.customerEmail || order.customer?.email || '')
    const safeCustomerAddress = escapeHtml(order.customerAddress || order.shipping_address || '')

    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${dir}">
      <head>
        <title>${safeInvoiceTitle} - ${safeOrderNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; direction: ${dir}; text-align: ${textAlign}; padding: 30px; }
          .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #000000; padding-bottom: 20px; }
          .invoice-title { font-size: 32px; color: #000000; margin: 0; }
          .invoice-detail { color: #64748b; margin: 5px 0; }
          .logo { text-align: ${isRtl ? 'left' : 'right'}; }
          .logo-img { height: 60px; }
          .logo-text { font-size: 24px; color: #000000; font-weight: bold; margin: 0; }
          .invoice-customer { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
          .section-title { font-size: 16px; color: #000000; font-weight: bold; margin: 0 0 15px 0; grid-column: span 2; }
          .customer-info { color: #1e293b; margin: 5px 0; }
          .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .invoice-table thead { background: #000000; }
          .invoice-table th { color: white; padding: 12px 15px; text-align: ${textAlign}; font-weight: bold; }
          .invoice-table td { padding: 12px 15px; border-bottom: 1px solid #e2e8f0; }
          .invoice-totals { width: 300px; ${totalsMargin} display: flex; flex-direction: column; gap: 10px; }
          .total-row { display: flex; justify-content: space-between; padding: 10px 15px; background: #f8fafc; border-radius: 6px; }
          .total-row.grand-total { background: #000000; color: white; }
          .invoice-footer { text-align: center; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #000000; font-weight: bold; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div>
            <h2 class="invoice-title">${safeInvoiceTitle}</h2>
            <p class="invoice-detail">${safeOrderNumberLabel}: ${safeOrderNumber}</p>
            <p class="invoice-detail">${safeInvoiceDateLabel}: ${safeDate}</p>
          </div>
          <div class="logo">
            ${safeSiteLogo ? `<img src="${safeSiteLogo}" alt="${safeSiteName}" class="logo-img" />` : ''}
            <h3 class="logo-text">${safeSiteName}</h3>
          </div>
        </div>
        <div class="invoice-customer">
          <h4 class="section-title">${safeCustomerInfoLabel}</h4>
          <p class="customer-info"><strong>${safeNameLabel}:</strong> ${safeCustomerName}</p>
          <p class="customer-info"><strong>${safePhoneLabel}:</strong> ${safeCustomerPhone}</p>
          <p class="customer-info"><strong>${safeEmailLabel}:</strong> ${safeCustomerEmail}</p>
          <p class="customer-info"><strong>${safeShippingAddressLabel}:</strong> ${safeCustomerAddress}</p>
        </div>
        <table class="invoice-table">
          <thead>
            <tr>
              <th>${safeProductLabel}</th>
              <th>${safeQuantityLabel}</th>
              <th>${safePriceLabel}</th>
              <th>${safeTotalLabel}</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || order.products || []).map(item => `
              <tr>
                <td>${escapeHtml(localized(item.product || item, 'name'))}</td>
                <td>${escapeHtml(item.quantity)}</td>
                <td>${(item.price || item.unit_price).toFixed(2)} ${safeCurrency}</td>
                <td>${((item.price || item.unit_price) * item.quantity).toFixed(2)} ${safeCurrency}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="invoice-totals">
          <div class="total-row">
            <span>${safeSubtotalLabel}:</span>
            <strong>${(order.subtotal || 0).toFixed(2)} ${safeCurrency}</strong>
          </div>
          <div class="total-row">
            <span>${safeShippingLabel}:</span>
            <strong>${(order.shipping || 0).toFixed(2)} ${safeCurrency}</strong>
          </div>
          ${(order.discount > 0 ? `
          <div class="total-row">
            <span>${safeDiscountLabel}:</span>
            <strong>-${(order.discount || 0).toFixed(2)} ${safeCurrency}</strong>
          </div>
          ` : '')}
          <div class="total-row grand-total">
            <span>${safeCheckoutTotalLabel}:</span>
            <strong>${(order.total || order.total_amount).toFixed(2)} ${safeCurrency}</strong>
          </div>
        </div>
        <div class="invoice-footer">
          <p>${safeThankYou}</p>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  } catch (err) {
    console.error('Failed to print invoice', err)
  }
}

const copyOrderID = (order) => {
  const id = order.orderNumber || order.order_number || order.id
  navigator.clipboard.writeText(id)
  alert(`${t('profile.order_number_copied')}: ${id}`)
}

const initiateReturn = (order) => {
  router.push('/profile?tab=returns')
  showReturnForm.value = true
  returnStep.value = 2 // Skip step 1 (order selection)
  selectedOrderForReturn.value = order
  selectedItemForReturn.value = null
  returnReason.value = ''
}

// Rating Logic
const showRatingModal = ref(false)
const ratingOrder = ref(null)
const ratingItem = ref(null)
const ratingValue = ref(5)
const ratingComment = ref('')

const initiateRating = (order) => {
  ratingOrder.value = order
  showRatingModal.value = true
  ratingItem.value = order.items?.[0] || order.products?.[0]
  ratingValue.value = 5
  ratingComment.value = ''
}

const submitRating = async () => {
  if (!ratingItem.value) return
  loadingData.value = true
  try {
    const resolvedProductId = Number(
      ratingItem.value.product?.id ?? ratingItem.value.product_id ?? ratingItem.value.id
    )

    await api.post('/frontend/reviews', {
      product_id: resolvedProductId,
      rating: ratingValue.value,
      comment: ratingComment.value,
      order_id: ratingOrder.value.id
    })
    alert(t('profile.thanks_for_rating'))
    showRatingModal.value = false
  } catch (err) {
    alert(err.response?.data?.message || t('profile.rating_failed'))
  } finally {
    loadingData.value = false
  }
}

const getImageUrl = (i) => {
  if (!i) return '/images/home/product_ceramic_hob_60.png';
  const p = typeof i === 'object' ? (i.image_path || i.image || i.url || '') : i;
  if (!p) return '/images/home/product_ceramic_hob_60.png';
  if (typeof p === 'string' && (p.startsWith('http') || p.startsWith('/'))) return p;
  if (typeof p === 'string' && p.includes('catalog_images')) return `/${p.replace(/^\//, '')}`;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://backend-mastergas.be-kite.com/api';
  return `${baseUrl.replace('/api', '')}/storage/${p}`;
};
</script>

<style scoped>
.profile-page {
  padding: 140px 0 100px;
  background: #fcfbff;
  min-height: 100vh;
}
.uppercase-input {
  text-transform: uppercase;
}
.main-container { max-width: 1440px; margin: 0 auto; padding: 0 20px; box-sizing: border-box; }

/* Breadcrumbs Flow */
.breadcrumb-flow {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 8px;
  min-height: 21px;
  margin-bottom: 0px;
}

.crumb-link {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #64748B;
  text-decoration: none;
  transition: color 0.2s ease;
}

.crumb-link:hover {
  color: #000000;
}

.crumb-separator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.crumb-arrow-svg {
  width: 4px;
  height: 7px;
  display: block;
}

.profile-page[dir="ltr"] .crumb-arrow-svg {
  transform: rotate(180deg);
}

.crumb-current {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
}

.main-content-layout {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 24px 0 40px;
  gap: 32px;
  width: 100%;
  box-sizing: border-box;
}

/* Sidebar Filter Panel (on the right in RTL) */
.sidebar-filter-panel {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  gap: 8px;
  width: 280px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  flex-shrink: 0;
  position: sticky;
  top: 120px;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 4px;
  width: 100%;
}

.menu-item {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  width: 100%;
  height: 48px;
  border-radius: 10px;
  border: none;
  border-right: 3px solid transparent;
  outline: none;
  text-decoration: none;
  cursor: pointer;
  background: transparent;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: #F8FAFC;
}

.menu-item.active {
  background: #F1F5F9;
  border-right: 3px solid #000000;
  border-radius: 10px;
}

.menu-item .menu-text {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  text-align: right;
  color: #666666;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-item.active .menu-text {
  font-weight: 700;
  color: #000000;
}

.menu-item .menu-icon-frame {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  width: 20px;
  height: 20px;
  color: #666666;
  flex-shrink: 0;
}

.menu-item .menu-icon-frame svg {
  width: 20px;
  height: 20px;
  display: block;
}

.profile-menu-asset-icon {
  width: 20px;
  height: 20px;
  display: block;
  object-fit: contain;
  opacity: 0.72;
}

.profile-menu-fa-icon {
  font-size: 19px;
  line-height: 1;
  color: currentColor;
}

.menu-item.active .menu-icon-frame {
  color: #000000;
}

.menu-item.active .profile-menu-asset-icon {
  opacity: 1;
}

.sidebar-badge {
  background: #EF4444;
  color: #FFFFFF;
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 10px;
  font-weight: 600;
}

.sidebar-divider {
  width: 100%;
  height: 1px;
  background: #E2E8F0;
  margin: 4px 0;
}

.menu-item-logout {
  width: 100%;
}

.menu-item-logout .menu-text {
  color: #E53333 !important;
  font-weight: 500;
}

.menu-item-logout:hover {
  background: #FEF2F2;
}

/* Left Content Area (Main Area) */
.left-content-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 32px;
  flex: 1;
  min-width: 0;
  width: 100%;
}

/* Overview Content */
.overview-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
}

/* Stats Row */
.stats-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 24px;
  width: 100%;
  box-sizing: border-box;
}

.stat-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  height: 101px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  flex: 1;
  min-width: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.stat-txt {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 4px;
}

.stat-label {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #64748B;
  text-align: right;
}

.stat-val {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 36px;
  color: #000000;
  text-align: right;
}

.icon-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  width: 48px;
  height: 48px;
  background: #F1F5F9;
  border-radius: 24px;
  flex-shrink: 0;
}

/* Recent Orders Block */
.recent-orders-block {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  gap: 20px;
  width: 100%;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
}

.recent-orders-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 27px;
}

.recent-orders-title {
  margin: 0;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 27px;
  color: #000000;
}

.view-all-link {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 6px;
  text-decoration: none;
  cursor: pointer;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
}

.view-all-link:hover {
  text-decoration: underline;
}

.view-all-link .chevron-left {
  width: 14px;
  height: 14px;
  color: #000000;
}

.orders-list-compact {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 12px;
  width: 100%;
}

.order-row {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  width: 100%;
  min-height: 69px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
}

.order-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 32px;
}

.order-num {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
  direction: ltr;
  display: inline-block;
}

.order-date {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #64748B;
}

.price-unit {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 4px;
}

.riyal-icon {
  width: 11.41px;
  height: 12.75px;
  color: #000000;
}

.price-val {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
}

.status-badge {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 4px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: #FFFFFF;
}

.status-badge.status-delivering,
.status-badge.warning {
  background: #F59E1F;
}

.status-badge.status-completed,
.status-badge.success {
  background: #10B981;
}

.status-badge.status-cancelled,
.status-badge.danger {
  background: #EF4444;
}

.order-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
}

.order-btn {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  height: 37px;
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  cursor: pointer;
  transition: all 0.2s ease;
}

.order-btn:hover {
  background: #000000;
  color: #FFFFFF;
}

/* Other Views Inside Left Content Area */
.content-view {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 32px;
  width: 100%;
  box-sizing: border-box;
}

.account-main { background: transparent; width: 100%; }
.view-header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f3f4f6; }
.flex-header { display: flex; justify-content: space-between; align-items: center; }
.view-title { font-size: 24px; font-weight: 800; color: #111827; }
.view-title .count { color: #9ca3af; font-size: 18px; font-weight: 400; }

/* Form Elements */
.profile-form { display: flex; flex-direction: column; gap: 20px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-weight: 700; font-size: 14px; color: #374151; }
.form-group input, .form-group select {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 15px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-family: inherit;
  transition: 0.2s;
  background: #fff;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
.form-group input:focus, .form-group select:focus {
  border-color: #000000;
  outline: none;
  box-shadow: 0 0 0 3px rgba(135, 50, 96, 0.05);
}

.input-relative {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.input-relative input,
.input-relative select {
  width: 100%;
  box-sizing: border-box;
}

.input-relative .input-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 16px;
  pointer-events: none;
}

[dir="rtl"] .input-relative .input-icon,
html[dir="rtl"] .input-relative .input-icon {
  left: 14px;
  right: auto;
}

[dir="rtl"] .input-relative input,
[dir="rtl"] .input-relative select,
html[dir="rtl"] .input-relative input,
html[dir="rtl"] .input-relative select {
  padding-left: 42px !important;
  padding-right: 15px !important;
}

[dir="ltr"] .input-relative .input-icon,
html[dir="ltr"] .input-relative .input-icon {
  right: 14px;
  left: auto;
}

[dir="ltr"] .input-relative input,
[dir="ltr"] .input-relative select,
html[dir="ltr"] .input-relative input,
html[dir="ltr"] .input-relative select {
  padding-right: 42px !important;
  padding-left: 15px !important;
}

.input-relative select ~ .fa-chevron-down {
  color: #000000 !important;
  font-weight: 900 !important;
}
.form-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
.save-btn { background: #000000; color: #fff; border: none; padding: 12px 35px; border-radius: 10px; font-weight: 800; cursor: pointer; transition: 0.3s; }
.save-btn:hover { opacity: 0.9; }
.change-pw-btn { background: none; border: none; color: #000000; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.cancel-btn { background: #f3f4f6; border: none; padding: 12px 25px; border-radius: 10px; color: #4b5563; font-weight: 700; cursor: pointer; transition: 0.3s; }
.cancel-btn:hover { background: #e5e7eb; }

.add-btn {
  background: #000000;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(135, 50, 96, 0.15);
}
.add-btn:hover {
  background: #4a1936;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(135, 50, 96, 0.2);
}

.inner-subtitle {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 20px;
}

.address-form-box {
  background: #f8fafc;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 0px;
  border: 1px solid #f1f5f9;
  width: 100%;
  box-sizing: border-box;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  font-weight: 700;
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
}
.checkbox-group input {
  width: 18px;
  height: 18px;
  accent-color: #000000;
  cursor: pointer;
}

/* Addresses Redesign V2 (Figma Specs) */
.addresses-view-area {
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 24px;
  width: 100%;
  max-width: 1000px;
  box-sizing: border-box;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
}

.add-address-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 52px;
  box-sizing: border-box;
  direction: ltr;
}

.primary-add-button {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  gap: 8px;
  width: 167px;
  height: 48px;
  background: #000000;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #FFFFFF;
  transition: opacity 0.2s ease, transform 0.1s ease;
}

.primary-add-button:hover {
  opacity: 0.9;
}

.primary-add-button:active {
  transform: scale(0.98);
}

.addresses-main-title {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 27px;
  text-align: right;
  color: #000000;
  margin: 0;
}

.addresses-grid-v2 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;
  direction: rtl;
  box-sizing: border-box;
}

.address-card-v2 {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 20px;
  gap: 12px;
  width: 100%;
  min-height: 184px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  direction: ltr;
}

.address-card-v2:hover {
  border-color: #CBD5E1;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.04);
}

.address-card-v2.is-selected {
  border-color: #E2E8F0;
}

.card-header-v2 {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 0px;
  gap: 8px;
  width: 100%;
  height: 24px;
  box-sizing: border-box;
}

.card-header-v2.has-default {
  justify-content: space-between;
}

.default-address-tag {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  text-align: right;
  color: #64748B;
}

.card-user-info-v2 {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 8px;
}

.user-display-name {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
  white-space: nowrap;
}

.selection-indicator-v2 {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  width: 20px;
  height: 20px;
  background: #FFFFFF;
  border: 2px solid #E2E8F0;
  border-radius: 9999px;
  flex-shrink: 0;
  transition: border-color 0.2s ease;
}

.selection-indicator-v2.selected {
  border-color: #000000;
}

.selection-inner-dot {
  width: 10px;
  height: 10px;
  background: #000000;
  border-radius: 50%;
}

.address-details-v2 {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 0px;
  gap: 6px;
  width: 100%;
  min-height: 75px;
  box-sizing: border-box;
}

.detail-line-item {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  text-align: right;
  color: #64748B;
  width: 100%;
  direction: rtl;
}

.card-actions-v2 {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 0px;
  gap: 8px;
  width: 100%;
  height: 21px;
  margin-top: auto;
  box-sizing: border-box;
}

.card-action-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  transition: opacity 0.2s ease;
}

.card-action-btn:hover {
  opacity: 0.8;
}

.delete-action-btn {
  color: #E53333;
}

.edit-action-btn {
  color: #000000;
}

.action-btn-text {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 14px;
  line-height: 21px;
}

.action-icon-wrap {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 992px) {
  .addresses-grid-v2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .addresses-grid-v2 {
    grid-template-columns: 1fr;
  }
  .add-address-row {
    height: auto;
    gap: 16px;
  }
}

/* Redesigned Orders V2 */
/* ==========================================================================
   Figma Orders Tab Design (left-content-area, filter-sort-bar, detailed-cards)
   ========================================================================== */
.orders-tab-view {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 24px;
  width: 1000px;
  max-width: 100%;
}

/* filter-sort-bar */
.filter-sort-bar {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  width: 1000px;
  max-width: 100%;
  height: 64px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  align-self: stretch;
}

/* search-box (left in RTL) */
.search-box {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px 12px 0px 16px;
  gap: 8px;
  width: 240px;
  height: 40px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
}

.search-box .search-input {
  width: 190px;
  height: 21px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  text-align: right;
  color: #000000;
  border: none;
  background: transparent;
  outline: none;
  flex: 1;
}

.search-box .search-input::placeholder {
  color: #64748B;
}

.search-box .search-icon {
  width: 14px;
  height: 14px;
  color: #000000;
  flex-shrink: 0;
}

/* filter-tabs (right in RTL) */
.filter-tabs {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;
  height: 37px;
}

.filter-tabs .tab-btn {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  height: 37px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  background: #FFFFFF;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tabs .tab-btn:hover {
  background: #F8FAFC;
}

.filter-tabs .tab-btn.active {
  background: #000000;
  border-color: #000000;
  color: #FFFFFF;
}

/* orders-detailed-list */
.orders-detailed-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 16px;
  width: 1000px;
  max-width: 100%;
  align-self: stretch;
}

/* order-detailed-card */
.order-detailed-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  gap: 16px;
  width: 1000px;
  max-width: 100%;
  min-height: 232px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  align-self: stretch;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.order-detailed-card:hover {
  border-color: #CBD5E1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

/* card-top-info */
.card-top-info {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 43px;
  align-self: stretch;
}

/* status-area (left in RTL) */
.status-area {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 12px;
  height: 37px;
}

.status-badge {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  height: 37px;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #FFFFFF;
}

/* main-meta (right in RTL) */
.main-meta {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 24px;
  height: 43px;
}

.meta-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 4px;
  height: 43px;
  text-align: right;
}

.meta-label {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: #64748B;
}

.meta-val {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
}

.meta-divider {
  box-sizing: border-box;
  width: 1px;
  height: 32px;
  background: #000000;
  opacity: 0.15;
}

/* card divider line */
.card-line {
  box-sizing: border-box;
  width: 100%;
  height: 1px;
  background: #E2E8F0;
  align-self: stretch;
  margin: 0;
}

/* card-middle-content */
.card-middle-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 56px;
  align-self: stretch;
}

/* price-actions (left in RTL) */
.price-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 2px;
  height: 47px;
  direction: ltr;
  text-align: left;
}

.price-label {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: #64748B;
}

.price-unit {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 4px;
  height: 27px;
}

.price-amount {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 27px;
  color: #000000;
}

.price-unit .riyal-symbol {
  width: 13.69px;
  height: 15.3px;
  color: #000000;
}

/* products-description (right in RTL) */
.products-description {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 16px;
  height: 56px;
}

.prod-text-frame {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 4px;
  height: 49px;
  text-align: right;
}

.prod-count {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
}

.prod-subtitle {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  text-align: right;
  color: #64748B;
}

.prod-icon-frame {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  width: 56px;
  height: 56px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  flex-shrink: 0;
}

.prod-icon-frame svg {
  width: 24px;
  height: 24px;
}

/* card-bottom-actions */
.card-bottom-actions {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 21px;
  align-self: stretch;
}

/* help-prompt (right in RTL) */
.help-prompt {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 8px;
  height: 21px;
}

.help-question {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #64748B;
}

.help-link {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.help-link:hover {
  opacity: 0.7;
}

/* actions-left (left in RTL) */
.actions-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 12px;
  height: 21px;
}

.order-action-link {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 4px;
  height: 21px;
  direction: ltr;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  transition: opacity 0.2s ease;
}

.order-action-link:hover {
  opacity: 0.8;
}

.order-action-link.track-link {
  color: #000000;
}

.order-action-link.details-link {
  color: #64748B;
}

.action-chevron {
  width: 14px;
  height: 14px;
}

/* pagination */
.orders-pagination {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px 0px 0px;
  gap: 8px;
  width: 1000px;
  max-width: 100%;
  height: 52px;
  align-self: stretch;
}

.page-nav-btn {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  width: 36px;
  height: 36px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  cursor: pointer;
  color: #000000;
  transition: all 0.2s ease;
}

.page-nav-btn:hover:not(:disabled) {
  background: #F8FAFC;
  border-color: #CBD5E1;
}

.page-nav-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-num-btn {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  width: 36px;
  height: 36px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-num-btn:hover:not(.active) {
  background: #F8FAFC;
  border-color: #CBD5E1;
}

.page-num-btn.active {
  background: #000000;
  color: #FFFFFF;
  border-color: #000000;
}

.empty-orders-card {
  width: 100%;
  padding: 60px 20px;
  text-align: center;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  color: #94A3B8;
  font-size: 15px;
  font-weight: 600;
}

.empty-orders-card .empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.3;
}

/* ==========================================================================
   Order Details View (Figma left-content-area 1000px)
   ========================================================================== */
.orders-tab-wrapper {
  width: 1000px;
  max-width: 100%;
}

.clickable-order {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.clickable-order:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.order-details-view {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0px;
  gap: 24px;
  width: 1000px;
  max-width: 100%;
}

/* 1. order-info-card */
.order-info-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  padding: 24px;
  gap: 16px;
  width: 100%;
  min-height: 91px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
}

.order-info-frame {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.order-info-meta {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
}

.info-meta-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.info-meta-label {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: #64748B;
}

.info-meta-val {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
}

.info-meta-divider {
  box-sizing: border-box;
  width: 1px;
  height: 32px;
  background: #E2E8F0;
}

.order-status-badge {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  min-width: 102px;
  height: 37px;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #FFFFFF;
}

/* 2. order-tracking-card */
.order-tracking-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 24px;
  gap: 16px;
  width: 100%;
  min-height: 255px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
}

.tracking-title {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 36px;
  text-align: right;
  color: #000000;
  margin: 0;
}

.card-divider-line {
  box-sizing: border-box;
  width: 100%;
  height: 1px;
  background: #E2E8F0;
  border: none;
}

.timeline-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0px;
  width: 100%;
  min-height: 139px;
}

.timeline-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  gap: 8px;
  flex: 1;
  min-width: 0;
  text-align: center;
}

.step-indicator-wrapper {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-indicator-circle {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  background: #000000;
  border-radius: 16px;
  color: #FFFFFF;
}

.step-indicator-circle.active {
  width: 40px;
  height: 40px;
  background: #F59E1F;
  box-shadow: 0px 0px 8px rgba(255, 150, 79, 0.25);
  border-radius: 20px;
}

.step-indicator-circle.pending {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 2px solid #E2E8F0;
  border-radius: 16px;
}

.step-title {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  text-align: center;
  color: #000000;
}

.step-title.pending-text {
  color: #64748B;
}

.step-time {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  color: #64748B;
}

.step-note {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  color: #64748B;
}

.timeline-connector {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 32px;
  flex-shrink: 0;
  margin-top: 50px;
}

.connector-bar {
  width: 0px;
  height: 32px;
  border-right: 2px solid #000000;
}

.connector-bar.dashed {
  border-right: 2px dashed #CBD5E1;
}

/* 3. products-card */
.products-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 24px;
  gap: 16px;
  width: 100%;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
}

.products-card-title {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 36px;
  text-align: right;
  color: #000000;
  margin: 0;
}

.products-table-header {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px 0px;
  gap: 24px;
  width: 100%;
  height: 41px;
  border-bottom: 2px solid #E2E8F0;
}

.th-product {
  flex: 1;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  text-align: right;
  color: #64748B;
}

.th-unit-price {
  width: 150px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  text-align: center;
  color: #64748B;
}

.th-qty {
  width: 80px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  text-align: center;
  color: #64748B;
}

.th-total {
  width: 150px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  text-align: left;
  color: #64748B;
}

.product-row-item {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px 0px;
  gap: 24px;
  width: 100%;
  border-bottom: 1px solid #E2E8F0;
}

.col-prod-details {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
}

.prod-thumb-img {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  object-fit: cover;
  flex-shrink: 0;
  background: #F8FAFC;
}

.prod-titles-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.prod-main-name {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
  text-align: right;
}

.prod-model-num {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: #64748B;
}

.col-unit-price-cell {
  width: 150px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 4px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #64748B;
}

.col-qty-cell {
  width: 80px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  text-align: center;
  color: #000000;
}

.col-total-cell {
  width: 150px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 15px;
  line-height: 22px;
  color: #000000;
}

/* 4. summary-card */
.summary-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 24px;
  gap: 20px;
  width: 100%;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
}

.summary-card-title {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 27px;
  text-align: right;
  color: #000000;
  margin: 0;
}

.summary-rows-wrap {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  width: 100%;
}

.summary-item-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 24px;
}

.summary-item-label {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #64748B;
}

.summary-item-val {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
}

.summary-item-val.free {
  color: #10B981;
}

.summary-item-val.discount {
  color: #E53333;
}

.summary-total-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 36px;
}

.summary-total-label {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 27px;
  color: #000000;
}

.summary-total-val {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 36px;
  color: #000000;
}

/* 5. address-payment-split */
.address-payment-split {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 24px;
  width: 100%;
}

.delivery-card,
.payment-card {
  box-sizing: border-box;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 24px;
  gap: 12px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
}

.card-heading-md {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  text-align: right;
  color: #000000;
  margin: 0;
}

.delivery-info-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.delivery-name {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
}

.delivery-detail {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #64748B;
  text-align: right;
}

.payment-method-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  height: 24px;
}

.payment-method-text {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
}

.mada-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  background: #F8FAFC;
  border-radius: 4px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 10px;
  line-height: 15px;
  color: #000000;
}

/* 6. bottom-action-buttons */
.bottom-action-buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  width: 100%;
  height: 56px;
}

.help-prompt-col {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.help-q-text {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #64748B;
}

.help-link-bold {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.help-link-bold:hover {
  opacity: 0.7;
}

.action-buttons-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
}

.btn-primary-invoice {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px 32px;
  height: 56px;
  background: #000000;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;
}

.btn-primary-invoice:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}

.btn-secondary-back {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px 32px;
  height: 56px;
  background: #FFFFFF;
  border: 1.5px solid #000000;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}

.btn-secondary-back:hover {
  background: #F8FAFC;
  transform: translateY(-1px);
}

/* Riyal SVG Icon utilities */
.riyal-icon-dark {
  width: 12px;
  height: 12px;
  color: #000000;
  flex-shrink: 0;
}

.riyal-icon-muted {
  width: 12px;
  height: 12px;
  color: #64748B;
  flex-shrink: 0;
}

.riyal-icon-red {
  width: 12px;
  height: 12px;
  color: #E53333;
  flex-shrink: 0;
}

/* Responsive adjustments for Order Details */
@media (max-width: 992px) {
  .order-details-view {
    width: 100%;
  }

  .timeline-row {
    overflow-x: auto;
    padding-bottom: 12px;
  }

  .timeline-step {
    min-width: 110px;
  }

  .products-table-header,
  .product-row-item {
    gap: 12px;
  }

  .th-unit-price,
  .col-unit-price-cell {
    width: 110px;
  }

  .th-total,
  .col-total-cell {
    width: 110px;
  }

  .address-payment-split {
    flex-direction: column;
  }

  .bottom-action-buttons {
    flex-direction: column-reverse;
    height: auto;
    gap: 16px;
  }

  .action-buttons-wrap {
    width: 100%;
    justify-content: stretch;
  }

  .btn-primary-invoice,
  .btn-secondary-back {
    flex: 1;
  }
}

/* Order Details / Tracking Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.order-details-modal {
  background: #FFFFFF;
  border-radius: 16px;
  width: 100%;
  max-width: 580px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.modal-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #E2E8F0;
}

.modal-order-title h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #000000;
}

.modal-order-num {
  font-size: 13px;
  color: #64748B;
  font-weight: 600;
}

.close-modal {
  background: transparent;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: #94A3B8;
  cursor: pointer;
  padding: 4px;
}

.close-modal:hover {
  color: #000000;
}

.modal-body-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  background: #F8FAFC;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid #E2E8F0;
}

.modal-info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-k {
  font-size: 11px;
  color: #64748B;
}

.info-v {
  font-size: 13px;
  font-weight: 700;
  color: #000000;
}

.info-v-price {
  font-size: 14px;
  font-weight: 700;
  color: #000000;
}

.status-badge-sm {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 700;
  width: fit-content;
}

.modal-products-list h4 {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 12px;
  color: #000000;
}

.modal-prod-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #F1F5F9;
  font-size: 13px;
}

.modal-prod-name {
  font-weight: 600;
  color: #000000;
}

.modal-prod-qty {
  color: #64748B;
}

.modal-prod-price {
  font-weight: 700;
  color: #000000;
}

.modal-footer-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #E2E8F0;
  background: #FAFBFD;
  border-radius: 0 0 16px 16px;
}

.print-inv-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #000000;
  color: #FFFFFF;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.print-inv-btn:hover {
  opacity: 0.85;
}

.close-btn-secondary {
  background: #FFFFFF;
  color: #64748B;
  border: 1px solid #E2E8F0;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

.close-btn-secondary:hover {
  background: #F8FAFC;
  color: #000000;
}

/* Tracking Timeline V3 */
.tracking-timeline-v3 {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  padding-right: 20px;
}

.tracking-timeline-v3::before {
  content: '';
  position: absolute;
  top: 8px;
  bottom: 8px;
  right: 6px;
  width: 2px;
  background: #E2E8F0;
}

.track-step-v3 {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
}

.track-step-v3 .step-dot-v3 {
  position: absolute;
  right: -20px;
  top: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #E2E8F0;
  border: 2px solid #FFFFFF;
  box-shadow: 0 0 0 1px #CBD5E1;
}

.track-step-v3.completed .step-dot-v3 {
  background: #10B981;
  box-shadow: 0 0 0 1px #10B981;
}

.track-step-v3.active .step-dot-v3 {
  background: #F59E1F;
  box-shadow: 0 0 0 1px #F59E1F;
}

.track-step-v3 .step-info-v3 {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.track-step-v3 .step-title-v3 {
  font-size: 14px;
  font-weight: 700;
  color: #000000;
}

.track-step-v3 .step-desc-v3 {
  font-size: 12px;
  color: #64748B;
}

/* Wishlist */
.wishlist-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.wish-card { border: 1.5px solid #f3f4f6; border-radius: 20px; padding: 15px; display: flex; gap: 15px; transition: 0.3s; }
.wish-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.03); }
.wish-card img { width: 90px; height: 90px; border-radius: 12px; object-fit: cover; cursor: pointer; }
.wish-body { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.wish-body h4 { font-size: 16px; font-weight: 800; margin: 0; cursor: pointer; }
.wish-price { font-weight: 800; color: #000000; font-size: 17px; }
.wish-card-actions { display: flex; gap: 8px; }
.wish-add-cart { flex: 1; border: none; background: #f3f4f6; padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 700; color: #000000; cursor: pointer; transition: 0.3s; }
.wish-add-cart:hover { background: #000000; color: #fff; }
.wish-remove { width: 35px; height: 35px; border: none; background: #fee2e2; color: #ef4444; border-radius: 8px; cursor: pointer; }

/* Empty States */
.empty-state, .placeholder-msg, .empty-view { text-align: center; color: #9ca3af; padding: 40px 0; }
.empty-icon { font-size: 50px; margin-bottom: 15px; }
.wishlist-empty-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 18px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  color: #94a3b8;
  font-size: 32px;
}
.go-shop-btn { display: inline-block; background: #000000; color: #fff; padding: 10px 25px; border-radius: 10px; text-decoration: none; font-weight: 800; margin-top: 15px; }

/* Country Readonly Input */
.country-readonly-input {
  background-color: #f8fafc !important;
  color: #1f2937 !important;
  font-weight: 700 !important;
  border: 1px solid #e5e7eb !important;
  text-align: left !important;
  cursor: not-allowed;
}

[dir="ltr"] .country-readonly-input,
html[dir="ltr"] .country-readonly-input {
  text-align: left !important;
}

/* Mobile Profile Scroll Tabs */
.profile-mobile-tabs-container {
  display: none;
  margin-bottom: 16px;
  width: 100%;
  box-sizing: border-box;
}

.profile-mobile-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0 8px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}

.profile-mobile-tabs::-webkit-scrollbar {
  display: none;
}

.mobile-tab-btn {
  flex: 0 0 auto;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  height: 36px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  color: #4b5563;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  transition: all 0.2s ease;
  box-sizing: border-box;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}

.mobile-tab-btn i {
  font-size: 13px;
  color: #6b7280;
  flex-shrink: 0;
}

.mobile-tab-btn span {
  font-size: 12px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-tab-btn.active {
  background: #000000;
  border-color: #000000;
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(135, 50, 96, 0.2);
}

.mobile-tab-btn.active i {
  color: #ffffff;
}

.mobile-tab-badge {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 10px;
  font-weight: 800;
  background: #f1f5f9;
  color: #64748b;
  margin-left: 2px;
}

.mobile-tab-btn.active .mobile-tab-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.mobile-tab-badge.danger {
  background: #ef4444;
  color: #ffffff;
}

/* Mobile Responsive */
@media (max-width: 900px) {
  .profile-page { padding: 25px 0 25px !important; }
  .main-content-layout { flex-direction: column !important; gap: 20px !important; padding: 0 !important; }
  .account-layout { grid-template-columns: 1fr; gap: 0; }
  .account-sidebar, .sidebar-filter-panel { display: none !important; }
  .profile-mobile-tabs-container { display: block !important; }
  .account-main, .left-content-area { width: 100% !important; }
  .wishlist-grid { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
}

/* Returns Styles */
.return-form-box {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}

.return-form-box .custom-select-v2,
.return-form-box textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  transition: 0.2s;
  outline: none;
  background: #fff;
}

.return-form-box .custom-select-v2:focus,
.return-form-box textarea:focus {
  border-color: #000000;
  box-shadow: 0 0 0 3px rgba(135, 50, 96, 0.05);
}

.return-form-box .custom-select-v2 {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: left 12px center;
  padding-left: 35px;
}

.return-form-box textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.5;
}

.return-form-box .char-count {
  font-size: 12px;
  color: #6b7280;
  text-align: left;
  margin-top: 5px;
}

.return-form-box .char-count.valid {
  color: #10b981;
}

.return-form-box .char-count.invalid {
  color: #ef4444;
}

/* Notifications Styles (Figma pixel-perfect) */
.notifications-view-container {
  width: 100%;
  max-width: 1000px;
  box-sizing: border-box;
}

.notifications-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  gap: 16px;
  width: 100%;
  max-width: 1000px;
  min-height: 403px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  direction: rtl;
}

/* header */
.notifications-header {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 27px;
}

/* الإشعارات */
.notifications-title {
  margin: 0;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 27px;
  color: #000000;
}

/* تحديد الكل كمقروء */
.btn-mark-all-read {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0;
  background: transparent;
  border: none;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.btn-mark-all-read:hover {
  opacity: 0.7;
}

/* notifications-list */
.notifications-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;
  width: 100%;
}

/* notification-item */
.notification-item {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  gap: 16px;
  width: 100%;
  min-height: 56px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.notification-item.unread {
  background: #F1F5F9;
}

.notification-item:hover {
  border-color: #CBD5E1;
}

/* notification-main-content (right side in RTL: dot + text) */
.notification-main-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

/* Ellipse (unread dot) */
.notification-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #000000;
  flex-shrink: 0;
}

/* notification title text */
.notification-title-text {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  text-align: right;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-title-text.is-unread {
  font-weight: 700;
}

/* notification-time (left side in RTL) */
.notification-time {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #64748B;
  text-align: left;
  white-space: nowrap;
  flex-shrink: 0;
}

/* empty state */
.notifications-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 12px;
  width: 100%;
  color: #94A3B8;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
}

.notifications-empty .empty-icon {
  font-size: 32px;
}

@media (max-width: 768px) {
  .notifications-card {
    padding: 16px;
  }
  .notification-item {
    padding: 14px 16px;
    gap: 12px;
  }
  .notification-title-text {
    font-size: 14px;
    line-height: 20px;
    white-space: normal;
  }
  .notification-time {
    font-size: 12px;
  }
}

/* ==========================================================================
   Personal Information Tab (Figma section-personal-info pixel-perfect)
   ========================================================================== */
.personal-info-tab-wrapper {
  width: 100%;
  max-width: 1000px;
  box-sizing: border-box;
}

.section-personal-info {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  gap: 20px;
  width: 1000px;
  max-width: 100%;
  min-height: 379px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  direction: rtl;
}

.personal-info-title {
  margin: 0;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 27px;
  text-align: right;
  color: #000000;
  width: 100%;
}

.info-rows {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  width: 100%;
  box-sizing: border-box;
}

.info-row {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 12px 0px;
  gap: 4px;
  width: 100%;
}

.info-label {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  text-align: right;
  color: #64748B;
  display: block;
}

.info-value {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  text-align: right;
  color: #000000;
  display: block;
}

.info-divider {
  box-sizing: border-box;
  width: 100%;
  height: 0px;
  border-top: 1px solid #E2E8F0;
}

/* edit-actions */
.edit-actions {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: flex-start; /* In RTL flex-start is on the RIGHT */
  align-items: center;
  padding: 0px;
  gap: 12px;
  width: 100%;
  height: 45px;
  margin-top: auto;
}

.btn-save {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  min-width: 127px;
  height: 45px;
  background: #000000;
  border: 1px solid #000000;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save:hover {
  background: #222222;
  border-color: #222222;
}

.btn-cancel {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  min-width: 138px;
  height: 45px;
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #F8FAFC;
}

/* Edit Mode Form Inputs */
.personal-info-edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.info-row-edit {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px 0px;
  gap: 6px;
  width: 100%;
}

.personal-info-input {
  width: 100%;
  max-width: 480px;
  height: 42px;
  padding: 8px 14px;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 15px;
  color: #000000;
  background: #FFFFFF;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.personal-info-input:focus {
  border-color: #000000;
}

@media (max-width: 768px) {
  .section-personal-info {
    padding: 16px;
    height: auto;
    min-height: auto;
  }
  .edit-actions {
    flex-direction: column-reverse;
    align-items: stretch;
    height: auto;
  }
  .btn-save, .btn-cancel {
    width: 100%;
  }
  .personal-info-input {
    max-width: 100%;
  }
}

/* ==========================================================================
   Change Password Modal (Figma modal-security exact pixel-perfect)
   ========================================================================== */
.change-password-modal-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 9999;
  padding: 20px;
  box-sizing: border-box;
}

.modal-security {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 32px;
  gap: 24px;
  width: 480px;
  max-width: 100%;
  height: auto;
  min-height: auto;
  background: #FFFFFF;
  box-shadow: 0px 12px 32px rgba(0, 0, 0, 0.101961);
  border-radius: 8px;
  direction: rtl;
  position: relative;
  animation: modalSecurityPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalSecurityPop {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-security-header {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 36px;
}

.modal-security-title {
  margin: 0;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 36px;
  text-align: right;
  color: #000000;
}

.modal-security-close-btn {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  width: 32px;
  height: 32px;
  background: #F1F5F9;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.modal-security-close-btn:hover {
  background: #E2E8F0;
}

.modal-security-form {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 20px;
  width: 100%;
}

.modal-field {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;
  width: 100%;
}

.modal-field-label {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  text-align: right;
  transition: color 0.2s ease;
}

.modal-field-label.has-error {
  color: #E53333;
}

.modal-input-wrapper {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px 16px;
  width: 100%;
  height: 48px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  transition: border-color 0.2s ease;
}

.modal-input-wrapper.has-error {
  border-color: #E53333;
}

.modal-input {
  flex: 1;
  height: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  text-align: right;
  color: #000000;
}

.modal-input::placeholder {
  color: #64748B;
  letter-spacing: 2px;
}

.modal-eye-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #161616;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
  transition: opacity 0.2s ease;
}

.modal-eye-btn:hover {
  opacity: 0.7;
}

.modal-field-error {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: #E53333;
  text-align: right;
}

.btn-save-password {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 32px;
  width: 100%;
  height: 48px;
  background: #000000;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #FFFFFF;
  transition: background-color 0.2s ease;
  margin-top: 4px;
}

.btn-save-password:hover {
  background: #222222;
}

.btn-save-password:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .modal-security {
    padding: 24px 16px;
    min-height: auto;
  }
}

/* ==========================================================================
   Add / Edit Address Modal (Figma add-address-modal exact pixel-perfect)
   ========================================================================== */
.add-address-modal-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 9999;
  padding: 20px;
  box-sizing: border-box;
}

.add-address-modal {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 32px;
  gap: 24px;
  width: 480px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  background: #FFFFFF;
  box-shadow: 0px 12px 32px rgba(0, 0, 0, 0.101961);
  border-radius: 8px;
  direction: rtl;
  position: relative;
  animation: modalSecurityPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.add-address-modal-header {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 36px;
}

.add-address-modal-title {
  margin: 0;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 36px;
  text-align: right;
  color: #000000;
}

.add-address-close-btn {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  width: 32px;
  height: 32px;
  background: #F1F5F9;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.add-address-close-btn:hover {
  background: #E2E8F0;
}

.add-address-form {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 16px;
  width: 100%;
}

.add-address-field {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;
  width: 100%;
}

.add-address-label {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  text-align: right;
  color: #000000;
  width: 100%;
}

.add-address-input {
  box-sizing: border-box;
  width: 100%;
  height: 44px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  padding: 0px 16px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  text-align: right;
  transition: border-color 0.2s ease;
  outline: none;
}

.add-address-input:focus {
  border-color: #000000;
}

.add-address-input::placeholder {
  color: #64748B;
}

.phone-input-container {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px 16px;
  width: 100%;
  height: 44px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  transition: border-color 0.2s ease;
  direction: rtl;
}

.phone-input-container:focus-within {
  border-color: #000000;
}

.phone-country-code {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.phone-prefix {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  direction: ltr !important;
  display: inline-block;
  unicode-bidi: isolate;
}

.phone-divider {
  width: 1px;
  height: 16px;
  background: #E2E8F0;
}

.phone-number-input {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  padding-right: 8px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  text-align: right;
}

.phone-number-input::placeholder {
  color: #64748B;
}

.address-two-cols-row {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 20px;
  width: 100%;
}

.half-field {
  flex: 1;
  width: 50%;
}

.select-wrapper {
  position: relative;
  width: 100%;
}

.add-address-select {
  box-sizing: border-box;
  width: 100%;
  height: 44px;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  padding: 0px 16px 0px 36px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  text-align: right;
  cursor: pointer;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  transition: border-color 0.2s ease;
}

.city-select {
  background: #FFFFFF;
}

.region-select {
  background: #F1F5F9;
}

.add-address-select:focus {
  border-color: #000000;
}

.select-arrow {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-address-textarea {
  box-sizing: border-box;
  width: 100%;
  height: 100px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  padding: 12px 16px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  text-align: right;
  resize: none;
  outline: none;
  transition: border-color 0.2s ease;
}

.add-address-textarea:focus {
  border-color: #000000;
}

.add-address-textarea::placeholder {
  color: #64748B;
}

.default-address-checkbox-row {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  width: 100%;
  cursor: pointer;
  user-select: none;
}

.default-checkbox-text {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 21px;
  text-align: right;
  color: #000000;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 1.5px solid #CBD5E1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFFFFF;
  transition: all 0.2s ease;
}

.custom-checkbox.checked {
  background: #000000;
  border-color: #000000;
}

.btn-save-address {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 32px;
  width: 100%;
  height: 48px;
  background: #000000;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #FFFFFF;
  transition: background-color 0.2s ease;
  margin-top: 8px;
}

.btn-save-address:hover {
  background: #222222;
}

.btn-save-address:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .add-address-modal {
    padding: 24px 16px;
  }
  .address-two-cols-row {
    flex-direction: column;
    gap: 16px;
  }
  .half-field {
    width: 100%;
  }
}

/* Wallet Styles - Figma Design */
.wallet-view {
  background: transparent;
  min-height: 100%;
}

.wallet-container {
  max-width: 100%;
  margin: 0;
  padding: 0;
}

/* Main Balance Card */
.wallet-balance-card {
  background: linear-gradient(135deg, #8E2DE2 0%, #C94B4B 100%);
  color: #fff;
  padding: 32px;
  border-radius: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.wallet-balance-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.wallet-balance-card::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: 10%;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

.balance-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1;
}

.balance-title {
  font-size: 16px;
  opacity: 0.9;
  font-weight: 500;
}

.balance-value {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.2;
}

.balance-subtitle {
  font-size: 13px;
  opacity: 0.8;
  font-weight: 400;
}

.balance-icon {
  font-size: 56px;
  opacity: 0.3;
  z-index: 1;
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: relative;
}

.stat-header {
  position: absolute;
  top: 16px;
  right: 16px;
}

.stat-icon {
  font-size: 16px;
  opacity: 0.6;
}

.stat-title {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  margin-top: 8px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
}

.stat-count {
  display: block;
  font-size: 12px;
  font-weight: 500;
}

.refund-card {
  background: #E6F4EA;
}

.refund-card .stat-title,
.refund-card .stat-count {
  color: #166534;
}

.refund-card .stat-value {
  color: #15803d;
}

.refund-card .stat-icon {
  color: #166534;
}

.purchase-card {
  background: #FDECEC;
}

.purchase-card .stat-title,
.purchase-card .stat-count {
  color: #991b1b;
}

.purchase-card .stat-value {
  color: #b91c1c;
}

.purchase-card .stat-icon {
  color: #991b1b;
}

/* Transactions Section */
.wallet-transactions {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.transactions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.transactions-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.transaction-filters {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #8E2DE2;
  color: #8E2DE2;
}

.filter-btn.active {
  background: #8E2DE2;
  color: #fff;
  border-color: #8E2DE2;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.transaction-item:hover {
  border-color: #8E2DE2;
  box-shadow: 0 4px 12px rgba(142, 45, 226, 0.1);
}

.transaction-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.transaction-icon.deposit {
  background: #E6F4EA;
  color: #166534;
}

.transaction-icon.purchase {
  background: #FDECEC;
  color: #991b1b;
}

.transaction-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transaction-desc {
  font-weight: 600;
  color: #1f2937;
  font-size: 15px;
}

.transaction-subtext {
  font-size: 13px;
  color: #9ca3af;
}

.transaction-amount {
  font-weight: 700;
  font-size: 16px;
}

.transaction-amount.deposit {
  color: #166534;
}

.transaction-amount.purchase {
  color: #991b1b;
}

@media (max-width: 768px) {
  .order-row {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 14px !important;
    padding: 14px !important;
    height: auto !important;
  }
  .order-info {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    justify-content: space-between !important;
    align-items: center !important;
    gap: 10px !important;
    width: 100% !important;
  }
  .order-actions {
    width: 100% !important;
  }
  .order-btn {
    width: 100% !important;
  }
  .recent-orders-block {
    padding: 16px !important;
  }
  .stats-row {
    gap: 12px !important;
  }
  .stat-card {
    padding: 14px !important;
  }
  .stat-val {
    font-size: 20px !important;
  }
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .transactions-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .wallet-container {
    padding: 0;
    width: 100%;
    box-sizing: border-box;
  }

  .wallet-balance-card {
    padding: 20px 18px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    box-sizing: border-box;
    width: 100%;
  }

  .balance-value {
    font-size: 26px;
  }
}

.product-selection-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 15px 0;
  max-height: 400px;
  overflow-y: auto;
  padding: 5px;
}

.product-select-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  border: 1.5px solid #f1f5f9;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.2s;
  position: relative;
}

.product-select-item:hover {
  background: #fcfbff;
  border-color: rgba(0,0,0,0.15);
}

.product-select-item.selected {
  border-color: #000000;
  background: #f3f4f6;
}

.p-mini-img {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
}

.p-mini-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.p-mini-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 14px;
}

.p-mini-price {
  font-size: 13px;
  color: #000000;
  font-weight: 600;
}

.p-check {
  color: #000000;
  opacity: 0;
  transition: 0.2s;
}

.product-select-item.selected .p-check {
  opacity: 1;
}

.return-card {
  background: #fff;
  border: 1.5px solid #f1f5f9;
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 15px;
}

.ret-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #f1f5f9;
}

.ret-id {
  font-weight: 800;
  color: #1e293b;
}

.ret-body {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.ret-img {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
}

.ret-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ret-pname {
  font-weight: 800;
  color: #1e293b;
  font-size: 16px;
}

.ret-order {
  font-size: 13px;
  color: #64748b;
}

.ret-reason, .ret-notes {
  font-size: 14px;
  color: #4b5563;
  background: #f8fafc;
  padding: 10px;
  border-radius: 8px;
  margin-top: 5px;
}

.ret-refund {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.refund-label {
  font-size: 12px;
  color: #94a3b8;
}

.refund-val {
  font-weight: 800;
  color: #000000;
  font-size: 18px;
}

.ret-footer {
  margin-top: 15px;
  text-align: left;
  font-size: 12px;
  color: #94a3b8;
}

.btn-rate-v2, .btn-return-v2 {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.3s;
}

.btn-rate-v2 {
  background: #f3f4f6;
  color: #000000;
  border: 1px solid rgba(0,0,0,0.15);
}
.btn-rate-v2:hover {
  background: #000000;
  color: #fff;
}

.btn-return-v2 {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.btn-return-v2:hover {
  background: #f1f5f9;
  color: #1e293b;
}

/* Rating Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.rating-modal {
  background: #fff;
  width: 90%;
  max-width: 450px;
  padding: 40px;
  border-radius: 25px;
  position: relative;
  text-align: center;
}

.close-modal {
  position: absolute;
  top: 20px; right: 20px;
  background: none; border: none;
  font-size: 24px; color: #94a3b8;
  cursor: pointer;
}

.modal-title { font-size: 22px; font-weight: 800; margin-bottom: 10px; color: #1e293b; }
.modal-desc { color: #64748b; font-size: 14px; margin-bottom: 25px; }

.rating-item-select { margin-bottom: 20px; }
.rating-item-select label { font-weight: 700; font-size: 14px; color: #1e293b; margin-bottom: 10px; display: block; }
.rating-prods-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px; }
.r-item-card { 
  flex: 0 0 100px; padding: 10px; border: 1.5px solid #f1f5f9; border-radius: 12px; cursor: pointer; transition: 0.2s;
  display: flex; flex-direction: column; align-items: center; gap: 5px;
}
.r-item-card img { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; }
.r-item-card span { font-size: 11px; font-weight: 700; color: #64748b; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
.r-item-card.active { border-color: #000000; background: #f3f4f6; }
.r-item-card.active span { color: #000000; }

.stars-input { display: flex; justify-content: center; gap: 12px; margin-bottom: 25px; }
.stars-input i { font-size: 32px; color: #e2e8f0; cursor: pointer; transition: 0.2s; }
.stars-input i.active { color: #ffb800; transform: scale(1.1); }

.rating-modal textarea {
  width: 100%; border: 1.5px solid #f1f5f9; border-radius: 15px; padding: 15px; font-family: inherit; margin-bottom: 25px; outline: none;
}
.rating-modal textarea:focus { border-color: #000000; }

.submit-rating-btn {
  width: 100%; background: #000000; color: #fff; border: none; padding: 15px; border-radius: 15px; font-weight: 800; cursor: pointer; transition: 0.3s;
}
.submit-rating-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(135, 50, 96, 0.2); }

.fixed-country-input {
  background-color: #ffffff !important;
  color: #111827 !important;
  font-weight: 700 !important;
  border: 1px solid #e5e7eb !important;
}

.input-relative select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  cursor: pointer;
  padding-right: 45px !important;
  padding-left: 15px !important;
}

.input-relative select ~ .fa-chevron-down {
  left: auto !important;
  right: 18px !important;
  color: #000000 !important;
  font-weight: 900 !important;
}

[dir="rtl"] .input-relative select,
html[dir="rtl"] .input-relative select {
  padding-left: 45px !important;
  padding-right: 15px !important;
}

[dir="rtl"] .input-relative select ~ .fa-chevron-down,
html[dir="rtl"] .input-relative select ~ .fa-chevron-down {
  right: auto !important;
  left: 18px !important;
  color: #000000 !important;
  font-weight: 900 !important;
}

/* Mobile Responsive */
@media (max-width: 900px) {
  .profile-page { 
    padding: 25px 0 30px !important; 
    overflow-x: hidden; 
    width: 100%; 
  }
  .main-container { 
    padding: 0 16px !important; 
    width: 100% !important; 
    box-sizing: border-box !important; 
  }
  .main-content-layout,
  .account-layout { 
    display: flex !important;
    flex-direction: column !important;
    gap: 20px !important; 
    width: 100% !important; 
    box-sizing: border-box !important; 
    padding: 0 !important;
  }
  .account-sidebar, .sidebar-filter-panel { display: none !important; }
  .profile-mobile-tabs-container { 
    display: block !important; 
    width: 100% !important; 
    box-sizing: border-box !important; 
    padding: 0 !important; 
  }
  .left-content-area,
  .account-main { 
    width: 100% !important; 
    box-sizing: border-box !important; 
  }
  .wishlist-grid { grid-template-columns: 1fr !important; }
  
  .form-container,
  .profile-form {
    width: 100% !important;
    box-sizing: border-box !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .form-row {
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
    width: 100% !important;
    box-sizing: border-box !important;
    margin: 0 !important;
  }

  .form-group {
    width: 100% !important;
    box-sizing: border-box !important;
    margin: 0 !important;
    min-width: 0 !important;
  }

  .form-group input,
  .form-group select {
    width: 100% !important;
    box-sizing: border-box !important;
    max-width: 100% !important;
  }
  
  /* Symmetrical Inner Cards Padding */
  .notif-card,
  .address-card,
  .wish-card,
  .return-card,
  .order-card-v2,
  .wallet-balance-card,
  .stat-card,
  .transaction-item,
  .return-form-box {
    width: 100% !important;
    box-sizing: border-box !important;
    padding: 14px 14px !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  
  .order-summary-v2 {
    padding: 14px 12px !important;
    grid-template-columns: 24px 1fr auto !important;
    gap: 8px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
  
  .order-footer-actions-v2 { flex-direction: column !important; width: 100% !important; }
  .order-footer-actions-v2 button { width: 100% !important; }
}

/* ==========================================================================
   PRINTABLE INVOICE CARD & ACTION CONTROLS (FIGMA PIXEL-PERFECT SPEC)
   ========================================================================== */

/* In-Page Invoice View */
.inpage-invoice-view {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 24px;
  width: 1000px;
  max-width: 100%;
  direction: rtl;
  animation: fadeIn 0.25s ease-out;
}

.inpage-invoice-top-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 960px;
  max-width: 100%;
  padding: 0px;
}

.btn-back-to-order-details {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #F1F5F9;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-weight: 600;
  font-size: 15px;
  line-height: 22px;
  color: #0F172A;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-back-to-order-details:hover {
  background: #E2E8F0;
  border-color: #CBD5E1;
  color: #000000;
  transform: translateX(2px);
}

.btn-back-to-orders-list {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-back-to-orders-list:hover {
  background: #F8FAFC;
  color: #0F172A;
  border-color: #CBD5E1;
}

/* printable-invoice-card */
.printable-invoice-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 48px;
  gap: 32px;
  width: 960px;
  max-width: 100%;
  min-height: 906px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.0509804);
  border-radius: 16px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  direction: rtl;
}

/* 1. Header Frame (width: 864px, height: 108px) */
.invoice-header-frame {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 108px;
}

/* Right in RTL: Logo & Company info */
.invoice-company-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;
  width: 141px;
  height: 87px;
}

.invoice-logo-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 2px;
  width: 140px;
  height: 35px;
}

.invoice-logo-img {
  width: 140px;
  height: 35px;
  object-fit: contain;
  object-position: right center;
}

.invoice-company-name {
  width: 140px;
  height: 18px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  text-align: right;
  color: #000000;
  white-space: nowrap;
}

.invoice-vat-number {
  width: 160px;
  height: 18px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  text-align: right;
  color: #64748B;
  white-space: nowrap;
}

/* Left in RTL: Tax Invoice Meta */
.invoice-meta-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 6px;
  min-width: 155px;
  height: 108px;
}

.invoice-type-title {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 36px;
  color: #000000;
  margin: 0;
  text-align: right;
}

.invoice-meta-row {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: #64748B;
  text-align: right;
  white-space: nowrap;
}

/* 2. Divider Line */
.invoice-divider-line {
  box-sizing: border-box;
  width: 100%;
  height: 0px;
  border: none;
  border-top: 1px solid #E2E8F0;
}

/* 3. Customer & Delivery Frame (height: 111px, gap: 40px) */
.invoice-parties-frame {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 40px;
  width: 100%;
  min-height: 111px;
}

.invoice-party-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;
  flex: 1;
}

.invoice-party-title {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
  margin: 0;
}

.invoice-party-item {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  text-align: right;
  color: #64748B;
}

/* 4. Products Table Frame */
.invoice-table-frame {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 0;
  width: 100%;
}

.invoice-table-header {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px 0px;
  gap: 20px;
  width: 100%;
  height: 41px;
  border-bottom: 2px solid #E2E8F0;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #64748B;
}

.invoice-table-header .col-product {
  flex: 1;
  text-align: right;
}

.invoice-table-header .col-price {
  width: 150px;
  text-align: center;
}

.invoice-table-header .col-qty {
  width: 80px;
  text-align: center;
}

.invoice-table-header .col-total {
  width: 150px;
  text-align: left;
}

.invoice-product-row {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 0px;
  gap: 20px;
  width: 100%;
  height: 48px;
  border-bottom: 1px solid #E2E8F0;
}

.invoice-product-row .col-product {
  flex: 1;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  text-align: right;
  color: #000000;
}

.invoice-product-row .col-price {
  width: 150px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  gap: 4px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #64748B;
}

.invoice-product-row .col-qty {
  width: 80px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  text-align: center;
  color: #000000;
}

.invoice-product-row .col-total {
  width: 150px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 0px;
  gap: 4px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
}

/* 5. Totals Breakdown Frame (width: 360px on the left) */
.invoice-summary-frame {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 12px;
  width: 100%;
}

.invoice-summary-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;
  width: 360px;
  align-self: flex-end;
  margin-right: auto;
  margin-left: 0;
}

.summary-breakdown-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 360px;
  height: 21px;
}

.breakdown-label {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #64748B;
}

.breakdown-val {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 4px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
}

.breakdown-val.discount-val {
  color: #E53333;
}

.breakdown-val.free-val {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: #10B981;
}

.summary-box-line {
  box-sizing: border-box;
  width: 360px;
  height: 0px;
  border: none;
  border-top: 1px solid #E2E8F0;
}

.summary-final-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 360px;
  height: 36px;
}

.final-total-label {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
}

.final-total-val {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 4px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 36px;
  color: #000000;
}

/* 7. Bottom Footer Bar */
.invoice-footer-frame {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 18px;
}

.invoice-thanks-note {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: #94A3B8;
}

.invoice-payment-method {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: #000000;
}

/* ==========================================================================
   INVOICE ACTION CONTROLS (FIGMA PIXEL-PERFECT SPEC)
   ========================================================================== */
.invoice-action-controls {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  gap: 16px;
  width: 960px;
  max-width: 100%;
  min-height: 48px;
  direction: rtl;
}

.invoice-buttons-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
}

.primary-download-button {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  gap: 8px;
  min-width: 164px;
  height: 48px;
  background: #000000;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  color: #FFFFFF;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  white-space: nowrap;
  box-sizing: border-box;
  transition: opacity 0.2s ease, transform 0.1s ease;
}

.primary-download-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.primary-download-button:active {
  transform: translateY(0);
}

.secondary-print-button {
  box-sizing: border-box;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  gap: 8px;
  min-width: 160px;
  height: 48px;
  background: #FFFFFF;
  border: 1.5px solid #000000;
  border-radius: 6px;
  cursor: pointer;
  color: #000000;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  white-space: nowrap;
  transition: background 0.2s ease, transform 0.1s ease;
}

.secondary-print-button:hover {
  background: #F8FAFC;
  transform: translateY(-1px);
}

.secondary-print-button:active {
  transform: translateY(0);
}

.btn-icon-svg {
  flex-shrink: 0;
}

@media (max-width: 992px) {
  .printable-invoice-card {
    padding: 24px;
    gap: 24px;
    min-height: auto;
  }
  .invoice-header-frame {
    height: auto;
    flex-wrap: wrap;
    gap: 16px;
  }
  .invoice-parties-frame {
    flex-direction: column;
    gap: 20px;
    min-height: auto;
  }
  .invoice-table-header,
  .invoice-product-row {
    gap: 12px;
  }
  .invoice-table-frame {
    overflow-x: auto;
  }
  .invoice-summary-card {
    width: 100%;
  }
  .summary-breakdown-row,
  .summary-final-row,
  .summary-box-line {
    width: 100%;
  }
  .invoice-footer-frame {
    height: auto;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  .invoice-action-controls {
    flex-direction: column-reverse;
    align-items: stretch;
    height: auto;
    gap: 16px;
  }
  .invoice-buttons-wrap {
    flex-wrap: wrap;
    width: 100%;
  }
}

/* Print CSS */
@media print {
  body * {
    visibility: hidden;
  }
  #printable-invoice-card,
  #printable-invoice-card * {
    visibility: visible;
  }
  #printable-invoice-card {
    position: absolute;
    left: 0;
    top: 0;
    width: 100% !important;
    border: none !important;
    box-shadow: none !important;
    padding: 20px !important;
  }
  .invoice-modal-overlay {
    background: transparent !important;
    position: static !important;
    padding: 0 !important;
  }
  .invoice-modal-close-btn,
  .invoice-action-controls {
    display: none !important;
  }
}
</style>
