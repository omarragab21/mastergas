<template>
  <div class="profile-mobile-tabs-container">
    <div class="profile-mobile-tabs">
      <router-link to="/profile" class="mobile-tab-btn" :class="{ active: currentTab === 'overview' }"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 14l3.5-3.5"/><path d="M20.3 18c.4-1.2.7-2.6.7-4a9 9 0 0 0-18 0c0 1.4.3 2.8.7 4"/></svg><span>{{ t('profile.overview') || 'نظرة عامة' }}</span></router-link>
      <router-link to="/profile?tab=orders" class="mobile-tab-btn" :class="{ active: currentTab === 'orders' }"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><span>{{ t('profile.orders') || 'طلباتي' }}</span></router-link>
      <router-link to="/profile?tab=addresses" class="mobile-tab-btn" :class="{ active: currentTab === 'addresses' }"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span>{{ t('profile.addresses') || 'العناوين' }}</span></router-link>
      <router-link to="/profile?tab=wallet" class="mobile-tab-btn" :class="{ active: currentTab === 'wallet' }"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 10h20"/><circle cx="17" cy="14" r="1.5" fill="currentColor"/></svg><span>{{ t('profile.wallet') || 'المحفظة' }}</span></router-link>
      <router-link to="/profile?tab=notifications" class="mobile-tab-btn" :class="{ active: currentTab === 'notifications' }"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span>{{ t('profile.notifications') || 'الإشعارات' }}</span><span v-if="notifCount > 0" class="mobile-tab-badge danger">{{ notifCount }}</span></router-link>
      <router-link to="/profile?tab=returns" class="mobile-tab-btn" :class="{ active: currentTab === 'returns' }"><i class="fas fa-rotate-left" aria-hidden="true"></i><span>{{ t('profile.returns') || 'المرتجعات' }}</span></router-link>
      <router-link to="/profile?tab=wishlist" class="mobile-tab-btn" :class="{ active: currentTab === 'wishlist' }"><i class="far fa-heart" aria-hidden="true"></i><span>{{ t('profile.wishlist') || 'المفضلة' }}</span><span v-if="wishlistCount > 0" class="mobile-tab-badge">{{ wishlistCount }}</span></router-link>
      <router-link to="/profile?tab=info" class="mobile-tab-btn" :class="{ active: currentTab === 'info' }"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>{{ t('profile.personal_info') || 'الملف الشخصي' }}</span></router-link>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

defineProps({
  currentTab: { type: String, required: true },
  notifCount: { type: Number, default: 0 },
  wishlistCount: { type: Number, default: 0 },
});

const { t } = useI18n();
</script>

<style scoped>
.profile-mobile-tabs-container { display: none; margin-bottom: 16px; width: 100%; box-sizing: border-box; }
.profile-mobile-tabs { display: flex; gap: 8px; overflow-x: auto; padding: 4px 0 8px; scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; }
.profile-mobile-tabs::-webkit-scrollbar { display: none; }
.mobile-tab-btn { flex: 0 0 auto; display: inline-flex; flex-direction: row; align-items: center; justify-content: center; gap: 6px; padding: 6px 12px; height: 36px; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; color: #4b5563; text-decoration: none; font-size: 12px; font-weight: 700; white-space: nowrap; box-sizing: border-box; box-shadow: 0 1px 4px rgba(0,0,0,0.03); }
.mobile-tab-btn i { font-size: 13px; color: #6b7280; flex-shrink: 0; }
.mobile-tab-btn span { font-size: 12px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mobile-tab-btn.active { background: #000; border-color: #000; color: #fff; box-shadow: 0 3px 10px rgba(135, 50, 96, 0.2); }
.mobile-tab-btn.active i { color: #fff; }
.mobile-tab-badge { font-size: 10px; padding: 1px 5px; border-radius: 10px; font-weight: 800; background: #f1f5f9; color: #64748b; margin-left: 2px; }
.mobile-tab-btn.active .mobile-tab-badge { background: rgba(255, 255, 255, 0.25); color: #fff; }
.mobile-tab-badge.danger { background: #ef4444; color: #fff; }
@media (max-width: 900px) { .profile-mobile-tabs-container { display: block; } }
</style>
