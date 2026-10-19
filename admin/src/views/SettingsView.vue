<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '../config/axios';
import settingsService from '../services/settingsService';
import { validateAdminImageFile, safeObjectUrl, sanitizeAssetUrl } from '../utils/adminSecurity';

const { t } = useI18n();

// State
const activeTab = ref('general'); // 'general' or 'social'
const loading = ref(false);
const isSaving = ref(false);
const settings = ref({
    site_name: 'Mastergas',
    free_delivery_threshold: '500',
    shipping_cost: '15',
    tax_rate: '0',
    default_shipping_cost: null,
    vat_percentage: null,
    site_contact_phone: '',
    social_links: {},
    delivery_range_km: '10',
    enable_city_shipping: '0',
    use_city_specific_rates: '0',
    default_city_shipping_rate: '0',
    // Defaults mirror the contact details already published on the storefront (Contact page and i18n).
    support_phone: '8001240198',
    support_email: 'info@mastergas.com.sa',
    email: 'info@saudietqaan.com.sa',
    address_ar: 'المملكة العربية السعودية - الرياض، مجمع صالات العرض لشركة إتقان السعودية',
    address_en: 'Kingdom of Saudi Arabia - Riyadh, Itqan Saudi Showroom Complex',
    working_hours_ar: 'السبت - الخميس: 9:00 ص - 10:00 م',
    working_hours_en: 'Saturday - Thursday: 9:00 AM - 10:00 PM',
    friday_hours_ar: 'الجمعة: 4:00 م - 10:00 م',
    friday_hours_en: 'Friday: 4:00 PM - 10:00 PM',
    currency_ar: 'ر.س',
    currency_en: 'SAR',
    logo: null,
    favicon: null,
    footer_logo: null,
    // QA defaults: saved only when the dashboard form is submitted. Existing
    // non-empty values returned by the API always take precedence below.
    whatsapp: 'https://wa.me/966500000000',
    facebook: 'https://facebook.com/mastergas-test',
    instagram: 'https://instagram.com/mastergas-test',
    x_twitter: 'https://x.com/mastergas-test',
    linkedin: 'https://linkedin.com/company/mastergas-test',
    youtube: 'https://youtube.com/@mastergas-test',
    snapchat: 'https://snapchat.com/add/mastergas-test',
    tiktok: 'https://tiktok.com/@mastergas-test',
    home_category_1: null,
    home_category_2: null,
    home_section_category_title_ar: 'تسوّق حسب الفئة',
    home_section_category_title_en: 'Shop by Category',
    home_section_offers_title_ar: 'العروض المميزة',
    home_section_offers_title_en: 'Featured Offers',
    about_title_ar: '',
    about_title_en: '',
    about_content_ar: '',
    about_content_en: '',
    about_section_2_title_ar: '',
    about_section_2_title_en: '',
    about_section_2_content_ar: '',
    about_section_2_content_en: '',
    about_section_3_title_ar: '',
    about_section_3_title_en: '',
    about_section_3_content_ar: '',
    about_section_3_content_en: '',
    about_hero_image: null,
    about_image_1: null,
    about_image_2: null,
    about_image_3: null,
});

const categories = ref([]);
const logoPreview = ref(null);

const isCityShippingEnabled = computed(() =>
    settings.value.enable_city_shipping === '1' ||
    settings.value.enable_city_shipping === true ||
    settings.value.enable_city_shipping === 1
);
const isCitySpecificRates = computed(() =>
    settings.value.use_city_specific_rates === '1' ||
    settings.value.use_city_specific_rates === true ||
    settings.value.use_city_specific_rates === 1
);
const faviconPreview = ref(null);
const footerLogoPreview = ref(null);
const aboutImagePreviews = ref({});
const aboutHeroField = { key: 'about_hero_image', label: 'صورة الغلاف / Hero image' };
// The About Us page shows three stacked sections, each with an image, a title and a description.
// Section 1 keeps the original about_title / about_content keys so existing content stays in place.
const aboutSections = [
    {
        number: 1,
        image: 'about_image_1',
        titleAr: 'about_title_ar',
        titleEn: 'about_title_en',
        contentAr: 'about_content_ar',
        contentEn: 'about_content_en',
        placeholders: {
            titleAr: 'عن Mastergas',
            titleEn: 'About Mastergas',
            contentAr: 'تأسست Mastergas لتكون رائدة في تقديم أحدث تقنيات أجهزة ومطابخ الطهي الإيطالية الفاخرة...',
            contentEn: 'Mastergas was founded to lead in providing cutting-edge luxury Italian culinary appliances...',
        },
    },
    {
        number: 2,
        image: 'about_image_2',
        titleAr: 'about_section_2_title_ar',
        titleEn: 'about_section_2_title_en',
        contentAr: 'about_section_2_content_ar',
        contentEn: 'about_section_2_content_en',
        placeholders: {
            titleAr: 'الحرفية الإيطالية والتكنولوجيا المعاصرة',
            titleEn: 'Italian Craftsmanship & Contemporary Technology',
            contentAr: 'نتميز بأننا نجمع بين عراقة الحرفية اليدوية والتكنولوجيا الصناعية المتقدمة...',
            contentEn: 'We uniquely blend traditional artisanal heritage with cutting-edge industrial technology...',
        },
    },
    {
        number: 3,
        image: 'about_image_3',
        titleAr: 'about_section_3_title_ar',
        titleEn: 'about_section_3_title_en',
        contentAr: 'about_section_3_content_ar',
        contentEn: 'about_section_3_content_en',
        placeholders: {
            titleAr: 'مصمم لثقافتنا واحتياجاتنا المحلية',
            titleEn: 'Designed for Our Local Culture & Needs',
            contentAr: 'صُممت أجهزة ماستر غاز لتلبي متطلبات الطهي العربي والسعودي...',
            contentEn: 'Mastergas appliances are purposefully engineered for Arabian and Saudi culinary requirements...',
        },
    },
];

const resolveSettingAsset = (value) => {
    if (!value || typeof value !== 'string') return '';
    const normalized = value.trim();
    if (!normalized || normalized === '[]') return '';
    if (/^(https?:|blob:|data:|\/(?![/\\]))/i.test(normalized)) {
        return sanitizeAssetUrl(normalized, '');
    }
    if (/^[/\\]{2}/.test(normalized) || /^(?:javascript|vbscript|file):/i.test(normalized)) {
        return '';
    }
    const storagePath = normalized.replace(/^\/?storage\//i, '');
    const apiOrigin = String(api.defaults.baseURL || '').replace(/\/api\/?$/, '');
    return sanitizeAssetUrl(`${apiOrigin}/storage/${storagePath}`, '');
};

// Fetch Data
const fetchSettings = async () => {
    loading.value = true;
    try {
        const response = await settingsService.getAdminSettings();
        const data = Array.isArray(response)
            ? response
            : (Array.isArray(response?.data) ? response.data : []);
        const isIrisAsset = (val) => {
            if (!val) return false;
            const str = String(val).toLowerCase();
            return str.includes('iris') || str.includes('t3jcwn2n2rvkxvcva') || str.includes('dobvpg934hatbpm5') || str.includes('yugdc4mk4vmsf6el');
        };
        data.forEach(s => {
            if (Object.hasOwn(settings.value, s.key)) {
                // Sanitize empty arrays stored as string '[]' or actual empty arrays
                if ((s.value === '' || s.value === null) && settings.value[s.key]) {
                    // Nothing saved yet for this key: keep the storefront default shown in the form.
                } else if (s.value === '[]' || (Array.isArray(s.value) && s.value.length === 0)) {
                    settings.value[s.key] = null;
                } else if (isIrisAsset(s.value)) {
                    if (s.key === 'logo') settings.value[s.key] = '/brand/mastergas-logo.png';
                    else if (s.key === 'footer_logo') settings.value[s.key] = '/brand/mastergas-logo-white.png';
                    else if (s.key === 'favicon') settings.value[s.key] = '/brand/mastergas-icon.png';
                    else if (s.key === 'site_name') settings.value[s.key] = 'ماسترجاز | Mastergas';
                    else settings.value[s.key] = null;
                } else {
                    settings.value[s.key] = s.value;
                }
            }
        });

        const socialSetting = data.find((setting) => setting.key === 'social_links');
        const socialLinks = typeof socialSetting?.value === 'string'
            ? (() => { try { return JSON.parse(socialSetting.value); } catch { return {}; } })()
            : socialSetting?.value;
        if (socialLinks && typeof socialLinks === 'object') {
            ['whatsapp', 'facebook', 'instagram', 'x_twitter', 'linkedin', 'youtube', 'snapchat', 'tiktok'].forEach((key) => {
                if (socialLinks[key] !== undefined && socialLinks[key] !== null && socialLinks[key] !== '') {
                    settings.value[key] = socialLinks[key];
                }
            });
        }
        ['whatsapp', 'facebook', 'instagram', 'x_twitter', 'linkedin', 'youtube', 'snapchat', 'tiktok'].forEach((key) => {
            if (/\.\.\.|…/.test(String(settings.value[key] || ''))) settings.value[key] = '';
        });

        // The public Site API uses these canonical commerce/general keys.
        // Keep the existing dashboard fields readable while persisting both
        // contracts through settingsService.bulkUpdate().
        const defaultShipping = data.find((setting) => setting.key === 'default_shipping_cost')?.value;
        const vatPercentage = data.find((setting) => setting.key === 'vat_percentage')?.value;
        const siteContactPhone = data.find((setting) => setting.key === 'site_contact_phone')?.value;
        if (defaultShipping !== undefined && defaultShipping !== null && defaultShipping !== '') {
            settings.value.shipping_cost = defaultShipping;
        }
        if (vatPercentage !== undefined && vatPercentage !== null && vatPercentage !== '') {
            // The backend stores a percentage (14 = 14%): show it as typed.
            const parsedVat = Number(vatPercentage);
            if (Number.isFinite(parsedVat)) settings.value.tax_rate = parsedVat;
        }
        if (siteContactPhone !== undefined && siteContactPhone !== null && siteContactPhone !== '') {
            settings.value.support_phone = siteContactPhone;
        }
    } catch (error) {
        triggerAlert(t('admin.settings.failed'), 'error');
    } finally {
        loading.value = false;
    }
};

const fetchAllCategories = async () => {
    try {
        const response = await api.get('/v1/categories');
        const payload = response.data?.data ?? response.data;
        categories.value = Array.isArray(payload) ? payload : (payload?.data || []);
    } catch (error) {
        console.error('Failed to fetch categories');
    }
};

onMounted(() => {
    fetchSettings();
    fetchAllCategories();
});

// Actions
const onLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
        const check = validateAdminImageFile(file, { maxSizeMB: 2 });
        if (!check.valid) {
            triggerAlert(check.error, 'error');
            e.target.value = '';
            return;
        }
        settings.value.logo = file;
        logoPreview.value = safeObjectUrl(file, logoPreview.value);
    }
};

const onFaviconChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
        const check = validateAdminImageFile(file, { maxSizeMB: 1, allowIco: true });
        if (!check.valid) {
            triggerAlert(check.error, 'error');
            e.target.value = '';
            return;
        }
        settings.value.favicon = file;
        faviconPreview.value = safeObjectUrl(file, faviconPreview.value);
    }
};

const onFooterLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
        const check = validateAdminImageFile(file, { maxSizeMB: 2 });
        if (!check.valid) {
            triggerAlert(check.error, 'error');
            e.target.value = '';
            return;
        }
        settings.value.footer_logo = file;
        footerLogoPreview.value = safeObjectUrl(file, footerLogoPreview.value);
    }
};

const onAboutImageChange = (key, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const check = validateAdminImageFile(file, { maxSizeMB: 2 });
    if (!check.valid) {
        triggerAlert(check.error, 'error');
        e.target.value = '';
        return;
    }
    settings.value[key] = file;
    aboutImagePreviews.value[key] = safeObjectUrl(file, aboutImagePreviews.value[key]);
};

const aboutImagePreview = (key) => aboutImagePreviews.value[key] || resolveSettingAsset(settings.value[key]);

const saveSettings = async () => {
    isSaving.value = true;
    try {
        await settingsService.bulkUpdate(settings.value);

        triggerAlert(t('admin.settings.success'));
        // Refresh to get full URLs
        fetchSettings();
    } catch (error) {
        if (error?.code === 'SETTINGS_ASSET_UPLOAD_UNSUPPORTED') {
            triggerAlert(t('admin.settings.failed'), 'error');
        } else {
            triggerAlert(t('admin.settings.failed'), 'error');
            console.error('Save failed:', error);
        }
    } finally {
        isSaving.value = false;
    }
};

// Alert State
const showAlert = ref(false);
const alertMessage = ref('');
const alertType = ref('success');

const triggerAlert = (message, type = 'success') => {
    alertMessage.value = message;
    alertType.value = type;
    showAlert.value = true;
    setTimeout(() => showAlert.value = false, 3000);
};
</script>

<template>
  <div class="settings-page p-6">
    <!-- Breadcrumbs -->
    <div class="breadcrumb mb-4">
       <span>{{ t('admin.profile.dashboard') }}</span>
       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
       <span class="active">{{ t('admin.settings.title') }}</span>
    </div>

    <!-- Header -->
    <div class="header-section mb-6">
        <div class="page-title-area">
            <div class="title-with-icon">
                <div class="icon-box">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </div>
                <div>
                    <h1>{{ t('admin.settings.title') }}</h1>
                    <p>{{ t('admin.settings.subtitle') }}</p>
                </div>
            </div>
        </div>
        <div class="left-actions">
            <button class="save-btn" @click="saveSettings" :disabled="isSaving">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
               {{ isSaving ? t('admin.settings.saving') : t('admin.settings.save') }}
            </button>
        </div>
    </div>

    <!-- Tabs Nav -->
    <div class="tabs-nav mb-6">
        <button :class="['tab-link', { active: activeTab === 'general' }]" @click="activeTab = 'general'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            {{ t('admin.settings.general') }}
        </button>
        <button :class="['tab-link', { active: activeTab === 'social' }]" @click="activeTab = 'social'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {{ t('admin.settings.social') }}
        </button>
        <button :class="['tab-link', { active: activeTab === 'homepage' }]" @click="activeTab = 'homepage'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            {{ t('admin.settings.homepage') }}
        </button>
        <button :class="['tab-link', { active: activeTab === 'about' }]" @click="activeTab = 'about'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ t('admin.settings.about') }}
        </button>
    </div>

    <!-- Content Sections -->
    <div class="settings-content shadow-sm">
        <!-- General Settings Tab -->
        <div v-if="activeTab === 'general'" class="tab-pane fade-in">
            <div class="form-grid">
                <div class="form-group">
                    <label>{{ t('admin.settings.site_name') }} <span class="req">*</span></label>
                    <input type="text" v-model="settings.site_name" placeholder="Mastergas" />
                </div>
                <div class="form-group">
                    <label>{{ t('admin.settings.free_delivery') }} ({{ t('admin.dashboard.sar') }}) <span class="req">*</span></label>
                    <input type="text" v-model="settings.free_delivery_threshold" placeholder="10" />
                </div>
                <div class="form-group">
                    <label>{{ t('admin.settings.shipping_cost') }} ({{ t('admin.dashboard.sar') }}) <span class="req">*</span></label>
                    <input type="text" v-model="settings.shipping_cost" placeholder="15" />
                </div>
                <!-- Commented out as requested:
                <div class="form-group full-width">
                    <div class="toggle-row">
                        <div class="toggle-info">
                            <span class="toggle-title">تفعيل نظام الشحن حسب المدن</span>
                            <span class="toggle-hint">تحديد سعر شحن مختلف لكل مدينة / محافظة</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" v-model="settings.enable_city_shipping" true-value="1" false-value="0" />
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="form-group full-width" v-if="isCityShippingEnabled">
                    <div class="toggle-row">
                        <div class="toggle-info">
                            <span class="toggle-title">استخدام أسعار خاصة لكل مدينة</span>
                            <span class="toggle-hint">تخصيص سعر منفصل لكل مدينة من إدارة أسعار الشحن</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" v-model="settings.use_city_specific_rates" true-value="1" false-value="0" />
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="form-group" v-if="isCityShippingEnabled && !isCitySpecificRates">
                    <label>سعر الشحن الموحد للمدن (ر.س)</label>
                    <input type="text" v-model="settings.default_city_shipping_rate" placeholder="3" />
                </div>
                -->
                <div class="form-group">
                    <label>{{ t('admin.settings.tax_rate') }} (%) <span class="req">*</span></label>
                    <input type="text" v-model="settings.tax_rate" placeholder="0" />
                </div>
                <div class="form-group">
                    <label>{{ t('admin.settings.currency_ar') }} <span class="req">*</span></label>
                    <input type="text" v-model="settings.currency_ar" placeholder="ر.س" />
                </div>
                <div class="form-group">
                    <label>{{ t('admin.settings.currency_en') }} <span class="req">*</span></label>
                    <input type="text" v-model="settings.currency_en" placeholder="SAR" class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>{{ t('admin.settings.delivery_range') }} <span class="req">*</span></label>
                    <input type="text" v-model="settings.delivery_range_km" placeholder="10" />
                </div>
                <div class="form-group">
                    <label>{{ t('admin.settings.support_phone') }} <span class="req">*</span></label>
                    <input type="text" v-model="settings.support_phone" placeholder="8001240198" class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>{{ t('admin.settings.whatsapp') }} <span class="req">*</span></label>
                    <input type="text" v-model="settings.whatsapp" placeholder="https://wa.me/9665XXXXXXXX" class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>{{ t('admin.settings.email') }} <span class="req">*</span></label>
                    <input type="email" v-model="settings.email" placeholder="info@saudietqaan.com.sa" class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>{{ t('admin.settings.support_email') }} <span class="req">*</span></label>
                    <input type="email" v-model="settings.support_email" placeholder="info@mastergas.com.sa" class="ltr-input" />
                </div>
                
                <div class="form-group full-width">
                    <label>{{ t('admin.settings.address_ar') }} <span class="req">*</span></label>
                    <textarea v-model="settings.address_ar" rows="2" placeholder="المملكة العربية السعودية - الرياض"></textarea>
                </div>
                <div class="form-group full-width">
                    <label>{{ t('admin.settings.address_en') }} <span class="req">*</span></label>
                    <textarea v-model="settings.address_en" rows="2" placeholder="Kingdom of Saudi Arabia - Riyadh" class="ltr-input"></textarea>
                </div>

                <div class="form-group full-width">
                    <label>{{ t('admin.settings.working_hours_ar') }} <span class="req">*</span></label>
                    <input type="text" v-model="settings.working_hours_ar" placeholder="السبت - الخميس: 9:00 ص - 10:00 م" />
                </div>
                <div class="form-group full-width">
                    <label>{{ t('admin.settings.working_hours_en') }} <span class="req">*</span></label>
                    <input type="text" v-model="settings.working_hours_en" placeholder="Saturday - Thursday: 9:00 AM - 10:00 PM" class="ltr-input" />
                </div>
                <div class="form-group full-width">
                    <label>{{ t('admin.settings.friday_hours_ar') }} <span class="req">*</span></label>
                    <input type="text" v-model="settings.friday_hours_ar" placeholder="الجمعة: 4:00 م - 10:00 م" />
                </div>
                <div class="form-group full-width">
                    <label>{{ t('admin.settings.friday_hours_en') }} <span class="req">*</span></label>
                    <input type="text" v-model="settings.friday_hours_en" placeholder="Friday: 4:00 PM - 10:00 PM" class="ltr-input" />
                </div>

                <div class="form-group full-width">
                    <label>{{ t('admin.settings.logo') }} <span class="req">*</span></label>
                    <div class="logo-upload-container">
                        <div class="logo-preview-box">
                            <img v-if="logoPreview" :src="logoPreview" />
                            <img v-else :src="resolveSettingAsset(settings.logo) || '/brand/mastergas-logo.png'" />
                        </div>
                        <div class="upload-info">
                            <p>{{ t('admin.settings.upload_logo_hint') }}</p>
                            <div class="upload-btn-wrapper">
                                <button class="btn-outline-upload">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                    {{ t('admin.settings.choose_logo') }}
                                </button>
                                <input type="file" @change="onLogoChange" accept="image/*" />
                            </div>
                            <span>{{ t('admin.settings.main_logo_note') }}</span>
                        </div>
                    </div>
                </div>

                <div class="form-group full-width">
                    <label>{{ t('admin.settings.favicon') }} <span class="req">*</span></label>
                    <div class="logo-upload-container">
                        <div class="logo-preview-box small">
                            <img v-if="faviconPreview" :src="faviconPreview" />
                            <img v-else :src="resolveSettingAsset(settings.favicon) || '/brand/mastergas-icon.png'" />
                        </div>
                        <div class="upload-info">
                            <p>{{ t('admin.settings.upload_favicon_hint') }}</p>
                            <div class="upload-btn-wrapper">
                                <button class="btn-outline-upload">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                    {{ t('admin.settings.choose_favicon') }}
                                </button>
                                <input type="file" @change="onFaviconChange" accept="image/*" />
                            </div>
                            <span>{{ t('admin.settings.favicon_note') }}</span>
                        </div>
                    </div>
                </div>

                <div class="form-group full-width">
                    <label>{{ t('admin.settings.footer_logo') }} <span class="req">*</span></label>
                    <div class="logo-upload-container">
                        <div class="logo-preview-box dark">
                            <img v-if="footerLogoPreview" :src="footerLogoPreview" />
                            <img v-else :src="resolveSettingAsset(settings.footer_logo) || '/brand/mastergas-logo-white.png'" />
                        </div>
                        <div class="upload-info">
                            <p>{{ t('admin.settings.upload_footer_hint') }}</p>
                            <div class="upload-btn-wrapper">
                                <button class="btn-outline-upload">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                    {{ t('admin.settings.choose_footer_logo') }}
                                </button>
                                <input type="file" @change="onFooterLogoChange" accept="image/*" />
                            </div>
                            <span>{{ t('admin.settings.footer_logo_note') }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Social Media Tab -->
        <div v-if="activeTab === 'social'" class="tab-pane fade-in">
            <div class="form-grid">
                <div class="form-group">
                    <label>{{ t('admin.settings.whatsapp') }}</label>
                    <input type="text" v-model="settings.whatsapp" placeholder="https://wa.me/..." class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>Facebook</label>
                    <input type="text" v-model="settings.facebook" placeholder="https://facebook.com/..." class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>Instagram</label>
                    <input type="text" v-model="settings.instagram" placeholder="https://instagram.com/..." class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>X / Twitter</label>
                    <input type="text" v-model="settings.x_twitter" placeholder="https://x.com/..." class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>LinkedIn</label>
                    <input type="text" v-model="settings.linkedin" placeholder="https://linkedin.com/..." class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>YouTube</label>
                    <input type="text" v-model="settings.youtube" placeholder="https://youtube.com/..." class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>Snapchat</label>
                    <input type="text" v-model="settings.snapchat" placeholder="https://snapchat.com/..." class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>TikTok</label>
                    <input type="text" v-model="settings.tiktok" placeholder="https://tiktok.com/@..." class="ltr-input" />
                </div>
            </div>
        </div>

        <!-- Homepage Sections Tab -->
        <div v-if="activeTab === 'homepage'" class="tab-pane fade-in">
            <div class="form-grid">
                <div class="form-group full-width">
                   <div class="info-alert mb-4">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {{ t('admin.settings.categories_hint') }}
                   </div>
                </div>
                <div class="form-group">
                    <label>{{ t('admin.settings.category_one') }}</label>
                    <select v-model="settings.home_category_1" class="custom-select-v2">
                        <option :value="null">{{ t('admin.settings.category_one') }}</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>{{ t('admin.settings.category_two') }}</label>
                    <select v-model="settings.home_category_2" class="custom-select-v2">
                        <option :value="null">{{ t('admin.settings.category_two') }}</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                    </select>
                </div>
                
                <div class="form-group full-width" style="grid-column: span 2; border-top: 1px solid #f3f4f6; padding-top: 30px; margin-top: 10px;">
                    <h3 style="font-size: 1.1rem; font-weight: 800; color: #1f2937; margin: 0 0 20px 0;">{{ t('admin.settings.home_titles') }}</h3>
                </div>
                
                <div class="form-group">
                    <label>{{ t('admin.settings.category_title_ar') }}</label>
                    <input type="text" v-model="settings.home_section_category_title_ar" placeholder="تسوّق حسب الفئة" />
                </div>
                <div class="form-group">
                    <label>{{ t('admin.settings.category_title_en') }}</label>
                    <input type="text" v-model="settings.home_section_category_title_en" placeholder="Shop by Category" class="ltr-input" />
                </div>
                
                <div class="form-group">
                    <label>{{ t('admin.settings.offers_title_ar') }}</label>
                    <input type="text" v-model="settings.home_section_offers_title_ar" placeholder="العروض المميزة" />
                </div>
                <div class="form-group">
                    <label>{{ t('admin.settings.offers_title_en') }}</label>
                    <input type="text" v-model="settings.home_section_offers_title_en" placeholder="Featured Offers" class="ltr-input" />
                </div>
            </div>
        </div>
        <!-- About Us Tab -->
        <div v-if="activeTab === 'about'" class="tab-pane fade-in">
            <div class="about-settings-stack">
                <div class="form-group full-width">
                    <div class="info-alert mb-4">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {{ t('admin.settings.about_hint') }}
                    </div>
                </div>
                <section class="about-setting-block about-hero-block">
                    <div class="about-setting-heading">
                        <span class="about-setting-step">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </span>
                        <div>
                            <h3>صورة الغلاف</h3>
                            <p>الصورة العريضة التي تظهر أعلى صفحة «من نحن».</p>
                        </div>
                    </div>
                    <div class="about-image-card">
                        <div class="about-image-preview-frame">
                            <img v-if="aboutImagePreview(aboutHeroField.key)" :src="aboutImagePreview(aboutHeroField.key)" :alt="aboutHeroField.label" />
                            <span v-else>لا توجد صورة مرفوعة</span>
                        </div>
                        <div class="about-image-card-actions">
                            <div class="upload-btn-wrapper">
                                <button class="btn-outline-upload" type="button">Choose image / اختيار صورة</button>
                                <input type="file" @change="onAboutImageChange(aboutHeroField.key, $event)" accept="image/*" />
                            </div>
                            <span>JPG / PNG</span>
                        </div>
                    </div>
                </section>

                <section v-for="section in aboutSections" :key="section.number" class="about-setting-block about-section-block">
                    <div class="about-setting-heading">
                        <span class="about-setting-step">0{{ section.number }}</span>
                        <div>
                            <h3>القسم {{ section.number }}</h3>
                            <p>صورة وعنوان ووصف يظهروا معاً في الصفحة (بالعربي والإنجليزي).</p>
                        </div>
                    </div>

                    <div class="about-image-card">
                        <div class="about-image-card-header">
                            <label>صورة القسم {{ section.number }} / Section {{ section.number }} image</label>
                            <span>API image</span>
                        </div>
                        <div class="about-image-preview-frame">
                            <img v-if="aboutImagePreview(section.image)" :src="aboutImagePreview(section.image)" :alt="`Section ${section.number}`" />
                            <span v-else>لا توجد صورة مرفوعة</span>
                        </div>
                        <div class="about-image-card-actions">
                            <div class="upload-btn-wrapper">
                                <button class="btn-outline-upload" type="button">Choose image / اختيار صورة</button>
                                <input type="file" @change="onAboutImageChange(section.image, $event)" accept="image/*" />
                            </div>
                            <span>JPG / PNG</span>
                        </div>
                    </div>

                    <div class="form-grid about-two-columns about-section-fields">
                        <div class="form-group">
                            <label>العنوان (عربي)</label>
                            <input type="text" v-model="settings[section.titleAr]" :placeholder="section.placeholders.titleAr" />
                        </div>
                        <div class="form-group">
                            <label>Title (English)</label>
                            <input type="text" v-model="settings[section.titleEn]" :placeholder="section.placeholders.titleEn" class="ltr-input" />
                        </div>
                        <div class="form-group">
                            <label>الوصف (عربي)</label>
                            <textarea v-model="settings[section.contentAr]" rows="6" :placeholder="section.placeholders.contentAr"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Description (English)</label>
                            <textarea v-model="settings[section.contentEn]" rows="6" :placeholder="section.placeholders.contentEn" class="ltr-input"></textarea>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    </div>

    <!-- Alert -->
    <div v-if="showAlert" :class="['alert-toast', alertType]">
       {{ alertMessage }}
    </div>
  </div>
</template>

<style scoped>
.settings-page { font-family: 'IBM Plex Sans Arabic', sans-serif; direction: rtl; }

/* Breadcrumbs */
.breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #9ca3af; }
.breadcrumb svg { transform: rotate(180deg); color: #d1d5db; }
.breadcrumb .active { color: #000000; font-weight: 700; }

/* Header */
.header-section { display: flex; justify-content: space-between; align-items: center; }
.page-title-area h1 { font-size: 1.4rem; font-weight: 800; color: #1f2937; margin: 0; }
.page-title-area p { color: #6b7280; font-size: 0.85rem; margin: 0; }
.title-with-icon { display: flex; align-items: center; gap: 12px; }
.icon-box { background: #f3f4f6; color: #000000; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }

.save-btn { background: #000000; color: white; border: none; padding: 10px 22px; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; font-size: 0.9rem; }
.save-btn:hover { background: #262626; transform: translateY(-2px); }
.save-btn:disabled { background: #9ca3af; }

/* Tabs */
.tabs-nav { display: flex; gap: 25px; border-bottom: 1px solid #f3f4f6; }
.tab-link { background: none; border: none; padding: 12px 5px; color: #6b7280; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.95rem; position: relative; border-bottom: 2px solid transparent; transition: 0.2s; }
.tab-link.active { color: #000000; border-bottom-color: #000000; }
.tab-link:hover { color: #000000; }

/* Content */
.settings-content { background: white; border-radius: 20px; padding: 40px; border: 1px solid #f3f4f6; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
.form-group.full-width { grid-column: span 2; }

.about-settings-stack { display: flex; flex-direction: column; gap: 22px; }
.about-setting-block { border: 1px solid #e8ebf0; border-radius: 18px; padding: 24px; background: #fff; }
.about-setting-heading { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 20px; }
.about-setting-step { display: inline-flex; align-items: center; justify-content: center; flex: 0 0 34px; width: 34px; height: 34px; border-radius: 10px; background: #111827; color: #fff; font-size: 0.78rem; font-weight: 800; }
.about-setting-heading h3 { margin: 0; color: #111827; font-size: 1.05rem; font-weight: 800; }
.about-setting-heading p { margin: 4px 0 0; color: #6b7280; font-size: 0.82rem; }
.about-two-columns { gap: 20px; }
.about-section-block textarea { min-height: 140px; resize: vertical; }
.about-section-fields { margin-top: 20px; }
.about-hero-block .about-image-card .about-image-preview-frame { height: 220px; }
.about-image-card { min-width: 0; border: 1px solid #edf0f4; border-radius: 14px; padding: 14px; background: #fafbfc; }
.about-image-card-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.about-image-card-header label { color: #1f2937; font-size: 0.84rem; font-weight: 800; }
.about-image-card-header span { color: #9ca3af; font-size: 0.7rem; direction: ltr; }
.about-image-preview-frame { height: 180px; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 10px; background: #eef1f5; color: #9ca3af; font-size: 0.78rem; }
.about-image-preview-frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
.about-image-card-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; }
.about-image-card-actions > span { color: #9ca3af; font-size: 0.72rem; direction: ltr; }

.form-group label { display: block; font-weight: 700; font-size: 0.9rem; color: #374151; margin-bottom: 10px; text-align: right; }
.form-group input, .form-group textarea { width: 100%; padding: 14px 18px; border: 1px solid #f3f4f6; border-radius: 12px; outline: none; transition: 0.3s; font-family: inherit; font-size: 0.95rem; background: #fafafa; color: #1f2937; }
.form-group input:focus, .form-group textarea:focus { border-color: #000000; background: white; box-shadow: 0 0 0 4px rgba(0,0,0, 0.05); }

.ltr-input { direction: ltr; text-align: left; }
.req { color: #dc2626; }

/* Toggle Switch */
.toggle-row { display: flex; align-items: center; justify-content: space-between; background: #f9fafb; padding: 16px 20px; border-radius: 14px; border: 1px solid #f3f4f6; gap: 1rem; }
.toggle-info { display: flex; flex-direction: column; gap: 3px; }
.toggle-title { font-weight: 700; font-size: 0.92rem; color: #1f2937; }
.toggle-hint { font-size: 0.78rem; color: #9ca3af; }
.toggle-switch { position: relative; display: inline-block; width: 52px; height: 28px; flex-shrink: 0; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; cursor: pointer; inset: 0; background: #e5e7eb; border-radius: 28px; transition: 0.3s; }
.toggle-slider::before { position: absolute; content: ''; height: 22px; width: 22px; right: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
.toggle-switch input:checked + .toggle-slider { background: #000000; }
.toggle-switch input:checked + .toggle-slider::before { transform: translateX(-24px); }

/* Logo Upload */
.logo-upload-container { display: flex; align-items: center; gap: 25px; background: #fafafa; padding: 25px; border-radius: 15px; border: 1px dashed #e5e7eb; }
.logo-preview-box { width: 100px; height: 100px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid #f3f4f6; overflow: hidden; flex-shrink: 0; }
.logo-preview-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
.logo-preview-box.dark { background: #1f2937; }
.logo-preview-box.small { width: 60px; height: 60px; }

.upload-info p { margin: 0 0 8px; color: #4b5563; font-size: 0.85rem; font-weight: 600; }
.upload-info span { font-size: 0.75rem; color: #9ca3af; }

.upload-btn-wrapper { position: relative; overflow: hidden; display: inline-block; margin: 10px 0; }
.btn-outline-upload { border: 1px solid #e5e7eb; background: white; color: #374151; padding: 8px 18px; border-radius: 8px; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; cursor: pointer; }
.upload-btn-wrapper input[type=file] { font-size: 100px; position: absolute; left: 0; top: 0; opacity: 0; cursor: pointer; }

/* Custom Select and Alert */
.custom-select-v2 { width: 100%; padding: 14px 18px; border: 1px solid #f3f4f6; border-radius: 12px; outline: none; background: #fafafa; color: #1f2937; font-family: inherit; font-size: 0.95rem; cursor: pointer; }
.custom-select-v2:focus { border-color: #000000; background: white; }

.info-alert { background: #eff6ff; color: #1e40af; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 12px; font-size: 0.85rem; font-weight: 600; border: 1px solid #dbeafe; }
.mb-4 { margin-bottom: 1rem; }

/* Alert */
.alert-toast { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); padding: 12px 24px; border-radius: 10px; color: white; font-weight: 700; z-index: 2000; box-shadow: 0 10px 15px rgba(0,0,0,0.1); animation: toastIn 0.3s ease-out; }
@keyframes toastIn { from { top: -50px; opacity: 0; } to { top: 24px; opacity: 1; } }
.alert-toast.success { background: #10b981; }
.alert-toast.error { background: #ef4444; }

.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 768px) {
    .form-grid { grid-template-columns: 1fr; }
    .form-group.full-width { grid-column: span 1; }
    .about-setting-block { padding: 18px; }
    .logo-upload-container { flex-direction: column; text-align: center; }
}
</style>
