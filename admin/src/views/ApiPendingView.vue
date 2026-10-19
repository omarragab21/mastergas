<template>
  <div class="offers-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-titles">
        <div class="title-with-icon">
          <h2 class="page-title">{{ tx('العروض والباقات', 'Offers & Bundles') }}</h2>
          <div class="tag-icon-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
            </svg>
          </div>
        </div>
        <p class="page-subtitle">{{ tx('إنشاء وإدارة العروض والباقات وربطها بالمنتجات', 'Create and manage bundles linked to products') }}</p>
      </div>
      <button class="add-btn" @click="openCreate">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {{ tx('إضافة عرض', 'Add Offer') }}
      </button>
    </div>

    <!-- Stat Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon-wrapper pink">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ tx('إجمالي العروض', 'Total Offers') }}</span>
          <h3 class="stat-value">{{ offers.length }}</h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper green">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ tx('العروض النشطة', 'Active Offers') }}</span>
          <h3 class="stat-value">{{ activeOffers }}</h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper gray">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ tx('المنتهية', 'Expired') }}</span>
          <h3 class="stat-value">{{ expiredOffers }}</h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper blue">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20V14"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ tx('إجمالي الاستخدام', 'Total Usage') }}</span>
          <h3 class="stat-value">{{ totalUsageCount }}</h3>
        </div>
      </div>
    </div>

    <!-- Filters Row -->
    <div class="filters-row">
      <div class="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="search-icon">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" v-model="searchQuery" :placeholder="tx('البحث باسم العرض...', 'Search offers...')" class="search-input" />
      </div>

      <div class="filter-select">
        <select v-model="statusFilter" class="form-select">
          <option value="">{{ tx('كل الحالات', 'All statuses') }}</option>
          <option value="active">{{ tx('نشط', 'Active') }}</option>
          <option value="paused">{{ tx('متوقف', 'Paused') }}</option>
          <option value="expired">{{ tx('منتهي', 'Expired') }}</option>
          <option value="scheduled">{{ tx('مجدول', 'Scheduled') }}</option>
        </select>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="select-icon" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </div>

      <div class="date-comp">
        <input type="date" v-model="startDateFilter" class="date-input" :title="tx('من تاريخ', 'From date')" />
      </div>
      <div class="date-comp">
        <input type="date" v-model="endDateFilter" class="date-input" :title="tx('إلى تاريخ', 'To date')" />
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-name text-right">{{ tx('اسم العرض', 'Offer name') }}</th>
            <th class="col-price">{{ tx('سعر الباقة', 'Bundle price') }}</th>
            <th class="col-items">{{ tx('المنتجات', 'Products') }}</th>
            <th class="col-start">{{ tx('تاريخ البداية', 'Start date') }}</th>
            <th class="col-end">{{ tx('تاريخ النهاية', 'End date') }}</th>
            <th class="col-used">{{ tx('استخدم', 'Used') }}</th>
            <th class="col-status">{{ tx('الحالة', 'Status') }}</th>
            <th class="col-actions">{{ tx('الإجراءات', 'Actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="state-row"><td colspan="8">{{ tx('جاري التحميل...', 'Loading...') }}</td></tr>
          <tr v-else-if="filteredOffers.length === 0" class="state-row"><td colspan="8">{{ tx('لا توجد عروض مطابقة', 'No matching offers found') }}</td></tr>
          <template v-else>
            <tr v-for="offer in filteredOffers" :key="offer.id" class="data-row">
              <td class="col-name text-right">
                <span class="offer-name">{{ displayName(offer) }}</span>
                <small v-if="displayDescription(offer)" class="offer-desc">{{ displayDescription(offer) }}</small>
              </td>
              <td class="col-price font-bold text-blue">{{ money(offer.bundle_price) }}</td>
              <td class="col-items">{{ offer.items?.length || 0 }}</td>
              <td class="col-start">{{ formatDate(offer.start_date) }}</td>
              <td class="col-end">{{ formatDate(offer.end_date) }}</td>
              <td class="col-used">
                <div class="usage-text" dir="ltr">{{ offer.total_uses || 0 }}<template v-if="offer.max_uses"> / {{ offer.max_uses }}</template></div>
                <div class="usage-bar-bg" v-if="offer.max_uses">
                  <div class="usage-bar-fill" :style="{ width: usagePercent(offer) + '%' }"></div>
                </div>
              </td>
              <td class="col-status">
                <span :class="['status-badge-table', offerStatus(offer)]">{{ formatStatus(offerStatus(offer)) }}</span>
              </td>
              <td class="col-actions">
                <div class="actions-group">
                  <button class="action-btn edit-btn" @click="openEdit(offer)" :title="tx('تعديل', 'Edit')" :aria-label="tx('تعديل', 'Edit')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="action-btn view-btn" @click="openView(offer)" :title="tx('عرض', 'View')" :aria-label="tx('عرض', 'View')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button class="action-btn delete-btn" @click="confirmDelete(offer)" :title="tx('حذف', 'Delete')" :aria-label="tx('حذف', 'Delete')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
      <div class="modal-content form-content">
        <button class="modal-close" @click="closeModal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="form-header">
          <div class="header-icon-main">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
          </div>
          <h3 class="modal-title-main">{{ isView ? tx('تفاصيل العرض', 'Offer Details') : (editingId ? tx('تعديل العرض', 'Edit Offer') : tx('إضافة عرض جديد', 'Add New Offer')) }}</h3>
          <p class="modal-subtitle-main">{{ isView ? tx('عرض البيانات فقط — للتعديل استخدم زر التعديل', 'Read-only view — use Edit to make changes') : tx('أدخل تفاصيل العرض', 'Enter offer details') }}</p>
        </div>

        <form @submit.prevent="saveOffer" class="offer-form">
          <fieldset class="form-fieldset" :disabled="isView">
            <div class="form-section">
              <label class="form-label">{{ tx('صورة العرض', 'Offer image') }}</label>
              <div class="upload-wrapper" @click="fileInputRef?.click()">
                <input type="file" ref="fileInputRef" @change="handleImageUpload" accept="image/*" hidden />
                <div class="upload-box">
                  <img v-if="imagePreview" :src="imagePreview" class="preview-image" alt="Preview" />
                  <div v-else class="upload-placeholder">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <p>{{ tx('انقر لرفع صورة العرض', 'Click to upload offer image') }}</p>
                    <span>{{ tx('الحد الأقصى 1 ميجابايت', 'Maximum 1 MB') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="i18n-toggle" role="tablist" aria-label="Language">
                <button type="button" class="i18n-btn" :class="{ active: activeLang === 'en' }" @click="activeLang = 'en'">English</button>
                <button type="button" class="i18n-btn" :class="{ active: activeLang === 'ar' }" @click="activeLang = 'ar'">العربية</button>
              </div>

              <label class="form-label">{{ tx('اسم العرض', 'Offer name') }} <span class="req">*</span></label>
              <input v-show="activeLang === 'ar'" type="text" v-model.trim="form.name_ar" class="form-control" placeholder="مثلاً: باقة التوفير الكبرى" />
              <input v-show="activeLang === 'en'" type="text" v-model.trim="form.name_en" class="form-control ltr-text" placeholder="Offer name in English" />
            </div>

            <div class="form-section">
              <label class="form-label">{{ tx('وصف العرض (اختياري)', 'Offer description (optional)') }}</label>
              <textarea v-show="activeLang === 'ar'" v-model="form.description_ar" class="form-control" placeholder="وصف قصير للعرض بالعربي..." rows="3"></textarea>
              <textarea v-show="activeLang === 'en'" v-model="form.description_en" class="form-control ltr-text" placeholder="Short offer description in English..." rows="3"></textarea>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">{{ tx('سعر الباقة (ر.س)', 'Bundle price (SAR)') }} <span class="req">*</span></label>
                <input type="number" min="0" step="0.01" v-model.number="form.bundle_price" class="form-control" placeholder="0.00" required />
              </div>
              <div class="form-group">
                <label class="form-label">{{ tx('الحد الأقصى للاستخدام (عدد المرات)', 'Maximum uses') }}</label>
                <input type="number" min="0" step="1" inputmode="numeric" v-model.number="form.max_uses" class="form-control" placeholder="مثلاً: 100" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ tx('الحد الأقصى للاستخدام للعميل', 'Maximum uses per customer') }}</label>
                <input type="number" min="0" step="1" inputmode="numeric" v-model.number="form.max_per_customer" class="form-control" placeholder="مثلاً: 1" />
              </div>
            </div>

            <div class="form-grid mt-1">
              <div class="form-group">
                <label class="form-label">{{ tx('تاريخ البدء', 'Start date') }} <span class="req">*</span></label>
                <input type="date" v-model="form.start_date" class="form-control" required />
              </div>
              <div class="form-group">
                <label class="form-label">{{ tx('تاريخ الانتهاء', 'End date') }} <span class="req" v-if="!form.no_end_date">*</span></label>
                <input type="date" v-model="form.end_date" class="form-control" :required="!form.no_end_date" :disabled="form.no_end_date" />
                <label class="chk-item mt-2">
                  <input type="checkbox" v-model="form.no_end_date">
                  <span>{{ tx('مفتوح (غير محدد المدة)', 'Open-ended') }}</span>
                </label>
              </div>
            </div>

            <div class="form-section items-section">
              <div class="items-heading">
                <label class="form-label">{{ tx('منتجات الباقة', 'Bundle products') }} <span class="req">*</span></label>
                <span class="items-count">{{ tx('تم تحديد', 'Selected') }} {{ form.items.length }} {{ tx('منتج', 'products') }}</span>
              </div>

              <div class="selection-box-area">
                <div class="products-toolbar">
                  <div class="search-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="search-icon">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input type="text" v-model="productSearch" class="form-control search-control" :placeholder="tx('ابحث عن منتج...', 'Search products...')" />
                  </div>
                  <label class="chk-item select-all">
                    <input type="checkbox" :checked="allFilteredSelected" :disabled="!filteredProducts.length" @change="toggleAllProducts" />
                    <span>{{ tx('تحديد الكل', 'Select all') }}</span>
                  </label>
                </div>

                <div class="product-pick-list">
                  <p v-if="!filteredProducts.length" class="hint">{{ tx('لا توجد منتجات مطابقة.', 'No matching products.') }}</p>
                  <div v-for="product in filteredProducts" :key="product.id" class="product-pick-row" :class="{ selected: isSelected(product.id) }" @click="toggleProduct(product.id)">
                    <input type="checkbox" :checked="isSelected(product.id)" @click.stop @change="toggleProduct(product.id)" />
                    <div class="product-thumb">
                      <img v-if="productImage(product)" :src="productImage(product)" :alt="productName(product)" />
                      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                    </div>
                    <span class="product-pick-name">{{ productName(product) }}</span>
                    <div class="qty-box" @click.stop>
                      <span class="qty-label">{{ tx('الكمية', 'Quantity') }}</span>
                      <input type="number" min="1" class="form-control qty-input" :value="quantityOf(product.id)" :disabled="!isSelected(product.id)" @input="setQuantity(product.id, $event.target.value)" :aria-label="tx('الكمية', 'Quantity')" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-section-toggle">
                <span class="toggle-lbl">{{ tx('تفعيل العرض', 'Enable offer') }}</span>
              <label class="toggle-switch">
                <input type="checkbox" v-model="form.is_active" hidden>
                <div class="t-slider" :class="{ on: form.is_active }">
                  <div class="t-knob"></div>
                </div>
              </label>
            </div>
          </fieldset>

          <div class="form-footer-btns">
            <button type="button" class="btn-cancel-form" @click="closeModal">{{ isView ? tx('إغلاق', 'Close') : tx('إلغاء', 'Cancel') }}</button>
            <button v-if="isView" type="button" class="btn-submit-form" @click="openEdit(viewedOffer)">{{ tx('تعديل العرض', 'Edit Offer') }}</button>
            <button v-else type="submit" class="btn-submit-form" :disabled="saving">
              {{ saving ? tx('جاري الحفظ...', 'Saving...') : (editingId ? tx('حفظ التعديلات', 'Save changes') : tx('إنشاء العرض', 'Create Offer')) }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div class="modal-overlay" v-if="deleteTarget" @click.self="cancelDelete">
      <div class="modal-content delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-offer-title">
        <div class="delete-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.6 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/>
          </svg>
        </div>
        <div class="delete-copy">
          <h2 id="delete-offer-title">{{ tx('تأكيد حذف العرض', 'Confirm offer deletion') }}</h2>
          <p>{{ tx('هل أنت متأكد من حذف العرض', 'Are you sure you want to delete offer') }} «{{ displayName(deleteTarget) }}»؟ {{ tx('لا يمكن التراجع عن هذا الإجراء.', 'This action cannot be undone.') }}</p>
        </div>
        <div class="delete-footer">
          <button class="btn-cancel-form" type="button" :disabled="isDeleting" @click="cancelDelete">{{ tx('إلغاء', 'Cancel') }}</button>
          <button class="btn-delete-confirm" type="button" :disabled="isDeleting" @click="executeDelete">
            <span v-if="isDeleting" class="delete-spinner" aria-hidden="true"></span>
            {{ isDeleting ? tx('جاري الحذف...', 'Deleting...') : tx('حذف العرض', 'Delete offer') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Alert Message -->
    <div class="alert-toast" :class="[alertType, { show: showAlert }]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-icon">
        <path v-if="alertType === 'success'" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline v-if="alertType === 'success'" points="22 4 12 14.01 9 11.01"/>
        <circle v-if="alertType === 'error'" cx="12" cy="12" r="10"/><line v-if="alertType === 'error'" x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {{ alertMessage }}
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAdminText } from '../composables/useAdminText';
import adminCatalogService from '../application/adminCatalogService';
import { toOfferPayload } from '../domain/catalog/adminCatalog';
import { validateAdminImageFile, safeObjectUrl, sanitizeAssetUrl } from '../utils/adminSecurity';

const { tx, locale } = useAdminText();

const offers = ref([]);
const products = ref([]);
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const isView = ref(false);
const viewedOffer = ref(null);
const editingId = ref(null);
const deleteTarget = ref(null);
const isDeleting = ref(false);
const activeLang = ref(locale.value);

const searchQuery = ref('');
const statusFilter = ref('');
const startDateFilter = ref('');
const endDateFilter = ref('');

const fileInputRef = ref(null);
const imagePreview = ref(null);

const showAlert = ref(false);
const alertMessage = ref('');
const alertType = ref('success');

const backendOrigin = (import.meta.env.VITE_API_BASE_URL || 'https://backend-tijara.be-kite.com/api')
  .replace(/\/api\/?$/, '');

const normalizeOfferImage = (value) => {
  if (!value) return null;
  const raw = String(value);
  const resolved = raw.startsWith('/storage/')
    ? `${backendOrigin}/public${raw}`
    : (raw.includes('/storage/') && !raw.includes('/public/storage/')
      ? raw.replace('/storage/', '/public/storage/')
      : raw);
  return sanitizeAssetUrl(resolved, '');
};

const emptyForm = () => ({
  name_ar: '', name_en: '', description_ar: '', description_en: '',
  bundle_price: '', max_uses: '', max_per_customer: '',
  start_date: '', end_date: '', no_end_date: false, is_active: true,
  image: null, items: [],
});
const form = ref(emptyForm());

const triggerAlert = (msg, type = 'success') => {
  alertMessage.value = msg;
  alertType.value = type;
  showAlert.value = true;
  setTimeout(() => { showAlert.value = false; }, 3000);
};

const formatDate = (value) => (value ? String(value).slice(0, 10) : '—');
const money = (value) => `${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${tx('ر.س', 'SAR')}`;
const displayName = (offer) => {
  const lang = locale.value === 'en' ? 'en' : 'ar';
  return offer.name_i18n?.[lang] || offer.name_i18n?.ar || offer.name_i18n?.en || offer.name_ar || offer.name || `${tx('عرض', 'Offer')} #${offer.id}`;
};
const displayDescription = (offer) => {
  const lang = locale.value === 'en' ? 'en' : 'ar';
  return offer.description_i18n?.[lang] || offer.description_i18n?.ar || offer.description_i18n?.en || offer.description_ar || offer.description || '';
};

const offerStatus = (offer) => {
  const today = new Date().toISOString().slice(0, 10);
  const start = offer.start_date ? String(offer.start_date).slice(0, 10) : '';
  const end = offer.end_date ? String(offer.end_date).slice(0, 10) : '';
  if (end && end < today) return 'expired';
  if (!offer.is_active) return 'paused';
  if (start && start > today) return 'scheduled';
  return 'active';
};
const formatStatus = (status) => {
  const labels = { active: ['نشط', 'Active'], paused: ['متوقف', 'Paused'], expired: ['منتهي', 'Expired'], scheduled: ['مجدول', 'Scheduled'] };
  return labels[status] ? tx(...labels[status]) : status;
};
const usagePercent = (offer) => Math.min(100, Math.round(((offer.total_uses || 0) / offer.max_uses) * 100));

const activeOffers = computed(() => offers.value.filter((offer) => offerStatus(offer) === 'active').length);
const expiredOffers = computed(() => offers.value.filter((offer) => offerStatus(offer) === 'expired').length);
const totalUsageCount = computed(() => offers.value.reduce((sum, offer) => sum + (offer.total_uses || 0), 0));

const filteredOffers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return offers.value.filter((offer) => {
    const nameMatch = !q
      || (offer.name_i18n?.ar || '').toLowerCase().includes(q)
      || (offer.name_i18n?.en || '').toLowerCase().includes(q)
      || (offer.name || '').toLowerCase().includes(q);
    const statusMatch = !statusFilter.value || offerStatus(offer) === statusFilter.value;
    const start = offer.start_date ? String(offer.start_date).slice(0, 10) : '';
    const end = offer.end_date ? String(offer.end_date).slice(0, 10) : '';
    const startMatch = !startDateFilter.value || (start && start >= startDateFilter.value);
    const endMatch = !endDateFilter.value || (end && end <= endDateFilter.value);
    return nameMatch && statusMatch && startMatch && endMatch;
  });
});

const fetchOffers = async () => {
  loading.value = true;
  try {
    offers.value = await adminCatalogService.listOffers({ include_inactive: 1 });
  } catch (error) {
    offers.value = [];
    triggerAlert(error.response?.data?.message || 'فشل تحميل العروض من الخادم', 'error');
  } finally {
    loading.value = false;
  }
};
const fetchProducts = async () => {
  try { products.value = await adminCatalogService.listAllProducts({ per_page: 100 }); } catch { products.value = []; }
};

const resetImage = () => {
  imagePreview.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
};

const openCreate = () => {
  editingId.value = null;
  isView.value = false;
  viewedOffer.value = null;
  form.value = emptyForm();
  resetImage();
  activeLang.value = 'ar';
  productSearch.value = '';
  showModal.value = true;
};

const openEdit = (offer) => {
  editingId.value = offer.id;
  isView.value = false;
  form.value = {
    ...emptyForm(),
    ...offer,
    name_ar: offer.name_i18n?.ar || offer.name_ar || offer.name || '',
    name_en: offer.name_i18n?.en || offer.name_en || offer.name || '',
    description_ar: offer.description_i18n?.ar || offer.description_ar || offer.description || '',
    description_en: offer.description_i18n?.en || offer.description_en || offer.description || '',
    start_date: offer.start_date ? formatDate(offer.start_date) : '',
    end_date: offer.end_date ? formatDate(offer.end_date) : '',
    no_end_date: !offer.end_date,
    image: null,
    items: (offer.items || []).map((item) => ({ product_id: item.product_id ?? item.product?.id, quantity: Number(item.quantity) || 1 })),
  };
  imagePreview.value = normalizeOfferImage(offer.image);
  activeLang.value = 'ar';
  productSearch.value = '';
  showModal.value = true;
};

const openView = (offer) => {
  openEdit(offer);
  viewedOffer.value = offer;
  isView.value = true;
};

const closeModal = () => { if (!saving.value) showModal.value = false; };

// Product picker
const productSearch = ref('');
const productName = (product) => product.name || product.name_i18n?.ar || product.name_ar || `منتج #${product.id}`;
const productImage = (product) => product.images?.[0] || product.image || '';
const filteredProducts = computed(() => {
  const q = productSearch.value.trim().toLowerCase();
  if (!q) return products.value;
  return products.value.filter((product) => `${productName(product)} ${product.name_i18n?.en || ''}`.toLowerCase().includes(q));
});
const findItem = (id) => form.value.items.find((item) => String(item.product_id) === String(id));
const isSelected = (id) => !!findItem(id);
const quantityOf = (id) => findItem(id)?.quantity ?? 1;
const setQuantity = (id, value) => {
  const item = findItem(id);
  if (item) item.quantity = Math.max(1, Number(value) || 1);
};
const toggleProduct = (id) => {
  if (isView.value) return;
  const index = form.value.items.findIndex((item) => String(item.product_id) === String(id));
  if (index >= 0) form.value.items.splice(index, 1);
  else form.value.items.push({ product_id: id, quantity: 1 });
};
const allFilteredSelected = computed(() => filteredProducts.value.length > 0 && filteredProducts.value.every((product) => isSelected(product.id)));
const toggleAllProducts = () => {
  const ids = filteredProducts.value.map((product) => product.id);
  if (allFilteredSelected.value) {
    form.value.items = form.value.items.filter((item) => !ids.some((id) => String(id) === String(item.product_id)));
  } else {
    ids.filter((id) => !isSelected(id)).forEach((id) => form.value.items.push({ product_id: id, quantity: 1 }));
  }
};

const handleImageUpload = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const check = validateAdminImageFile(file, { maxSizeMB: 1 });
  if (!check.valid) {
    triggerAlert(check.error, 'error');
    event.target.value = '';
    return;
  }
  form.value.image = file;
  imagePreview.value = safeObjectUrl(file, imagePreview.value);
};

const saveOffer = async () => {
  if (!String(form.value.name_ar || '').trim()) {
    activeLang.value = 'ar';
    triggerAlert('اسم العرض بالعربي مطلوب', 'error');
    return;
  }
  if (!String(form.value.name_en || '').trim()) {
    activeLang.value = 'en';
    triggerAlert('اسم العرض بالإنجليزية مطلوب', 'error');
    return;
  }
  if (!form.value.items.some((item) => item.product_id)) {
    triggerAlert('اختر منتجًا واحدًا على الأقل.', 'error');
    return;
  }
  saving.value = true;
  try {
    const payload = toOfferPayload(form.value);
    if (editingId.value) {
      await adminCatalogService.updateOffer(editingId.value, payload, form.value.image);
      triggerAlert('تم تحديث العرض بنجاح');
    } else {
      await adminCatalogService.createOffer(payload, form.value.image);
      triggerAlert('تم إنشاء العرض بنجاح');
    }
    showModal.value = false;
    await fetchOffers();
  } catch (error) {
    const errorData = error.response?.data;
    let msg = errorData?.message || 'فشل حفظ العرض.';
    if (errorData?.errors) msg = Object.values(errorData.errors)[0][0];
    triggerAlert(msg, 'error');
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (offer) => { deleteTarget.value = offer; };
const cancelDelete = () => { if (!isDeleting.value) deleteTarget.value = null; };
const executeDelete = async () => {
  if (!deleteTarget.value || isDeleting.value) return;
  const target = deleteTarget.value;
  isDeleting.value = true;
  try {
    await adminCatalogService.deleteOffer(target.id);
    offers.value = offers.value.filter((offer) => offer.id !== target.id);
    deleteTarget.value = null;
    triggerAlert('تم حذف العرض بنجاح');
  } catch (error) {
    triggerAlert(error.response?.data?.message || 'فشل حذف العرض. حاول مرة أخرى.', 'error');
  } finally {
    isDeleting.value = false;
  }
};

onMounted(() => { fetchOffers(); fetchProducts(); });
</script>

<style scoped>
.offers-page {
  display: flex; flex-direction: column; gap: 1.5rem; direction: rtl; font-family: 'IBM Plex Sans Arabic', sans-serif; padding-bottom: 3rem;
}

/* Page Header */
.page-header { display: flex; align-items: center; justify-content: space-between; }
.title-with-icon { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.2rem; }
.page-title { font-size: 1.4rem; font-weight: 800; color: #111827; margin: 0; }
.tag-icon-wrapper { background: #f3f4f6; color: #000000; width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.page-subtitle { font-size: 0.85rem; color: #6b7280; margin: 0; }

.add-btn {
  display: flex; align-items: center; gap: 0.5rem; background: #000000; color: #fff; border: none; padding: 0.65rem 1.1rem; border-radius: 8px;
  font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
}
.add-btn:hover { background: #262626; }

/* Stats Cards */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.stat-card {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}
.stat-icon-wrapper { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.stat-icon-wrapper.pink { background: #f3f4f6; color: #000000; }
.stat-icon-wrapper.green { background: #ecfdf5; color: #10b981; }
.stat-icon-wrapper.gray { background: #f9fafb; color: #6b7280; }
.stat-icon-wrapper.blue { background: #eff6ff; color: #2563eb; }
.stat-info { display: flex; flex-direction: column; gap: 0.2rem; }
.stat-label { font-size: 0.75rem; font-weight: 600; color: #6b7280; }
.stat-value { font-size: 1.4rem; font-weight: 800; color: #111827; margin: 0; }

/* Filters */
.filters-row { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
.search-box { flex: 1; min-width: 250px; position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; right: 1rem; color: #9ca3af; }
.search-input { width: 100%; padding: 0.75rem 2.8rem 0.75rem 1rem; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 0.85rem; outline: none; background: #fff; }
.search-input:focus { border-color: #000000; }
.filter-select { position: relative; display: flex; align-items: center; min-width: 150px; }
.form-select { width: 100%; padding: 0.75rem 0.75rem 0.75rem 2.2rem; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 0.85rem; color: #374151; appearance: none; outline: none; }
.filter-select .select-icon { position: absolute; left: 0.75rem; color: #9ca3af; pointer-events: none; }
.date-input { border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.65rem 0.75rem; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 0.85rem; color: #374151; outline: none; }

/* Table */
.table-container { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow-x: auto; margin-top: 0.5rem; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1.1rem 0.75rem; border-bottom: 1px solid #f3f4f6; vertical-align: middle; text-align: center; }
.data-table th { background: #f9fafb; font-size: 0.75rem; font-weight: 700; color: #6b7280; white-space: nowrap; }
.data-table td { font-size: 0.82rem; color: #374151; }
.data-row:hover td { background: #f3f4f6; }
.state-row td { padding: 3rem 1rem; color: #6b7280; }

.text-right { text-align: right !important; }
.font-bold { font-weight: 700; }
.text-blue { color: #2563eb; }
.ltr-text { direction: ltr; }
.offer-name { display: block; font-weight: 700; color: #111827; }
.offer-desc { display: block; color: #9ca3af; margin-top: 0.2rem; max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Usage Bar */
.usage-text { font-size: 0.65rem; color: #6b7280; font-weight: 600; margin-bottom: 4px; }
.usage-bar-bg { width: 80px; height: 6px; background: #f3f4f6; border-radius: 10px; margin: 0 auto; overflow: hidden; }
.usage-bar-fill { height: 100%; background: #000000; border-radius: 10px; }

/* Status Badges */
.status-badge-table { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; }
.status-badge-table.active { background: #ecfdf5; color: #059669; }
.status-badge-table.paused { background: #eff6ff; color: #2563eb; }
.status-badge-table.expired { background: #fef2f2; color: #dc2626; }
.status-badge-table.scheduled { background: #fff7ed; color: #ea580c; }

/* Actions */
.actions-group { display: flex; align-items: center; justify-content: center; gap: 0.4rem; }
.action-btn { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: none; cursor: pointer; transition: 0.2s; flex-shrink: 0; }
.view-btn { background: #f3f4f6; color: #000000; }
.edit-btn { background: #eff6ff; color: #2563eb; }
.delete-btn { background: #fef2f2; color: #dc2626; }
.action-btn:hover { opacity: 0.8; transform: translateY(-1px); }

/* Delete Modal */
.delete-modal { max-width: 460px; padding: 28px; text-align: center; }
.delete-icon { width: 58px; height: 58px; margin: 0 auto 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #dc2626; background: #fef2f2; }
.delete-copy h2 { margin: 0 0 8px; color: #111827; font-size: 1.2rem; }
.delete-copy p { margin: 0; color: #6b7280; line-height: 1.7; font-size: 0.92rem; }
.delete-footer { display: flex; gap: 1rem; padding: 24px 0 0; }
.delete-footer button { min-height: 44px; }
.btn-delete-confirm { background: #dc2626; color: white; border: none; padding: 12px 20px; border-radius: 10px; font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 700; cursor: pointer; flex: 1; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
.btn-delete-confirm:hover { background: #b91c1c; }
.btn-delete-confirm:disabled, .btn-cancel-form:disabled { opacity: 0.6; cursor: not-allowed; }
.delete-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.45); border-top-color: white; border-radius: 50%; animation: delete-spin 0.7s linear infinite; }
@keyframes delete-spin { to { transform: rotate(360deg); } }

/* FORM MODAL */
.form-content { max-width: 650px; padding: 0; max-height: 95vh; overflow-y: auto; }
.form-header { text-align: center; padding: 2rem 2rem 1.5rem 2rem; position: relative; }
.header-icon-main { width: 50px; height: 50px; background: #f3f4f6; color: #000000; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
.modal-title-main { font-size: 1.3rem; font-weight: 800; color: #111827; margin: 0; }
.modal-subtitle-main { font-size: 0.85rem; color: #9ca3af; margin-top: 0.4rem; }

.offer-form { padding: 0 2.5rem 2.5rem 2.5rem; }
.i18n-toggle { display: inline-flex; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: #fff; margin: 0 auto 1.1rem; }
.i18n-btn { border: none; background: transparent; padding: 0.4rem 0.9rem; font-weight: 800; font-size: 0.85rem; cursor: pointer; color: #6b7280; min-width: 96px; font-family: 'IBM Plex Sans Arabic', sans-serif; }
.i18n-btn.active { background: #000000; color: #fff; }
.form-section { margin-bottom: 1.5rem; }
.form-label { display: block; font-size: 0.85rem; font-weight: 700; color: #374151; margin-bottom: 0.75rem; text-align: right; }
.req { color: #dc2626; }
.form-control { width: 100%; padding: 0.8rem 1rem; border: 1px solid #e5e7eb; border-radius: 10px; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 0.85rem; transition: 0.2s; outline: none; background: #f9fafb; box-sizing: border-box; }
.form-control:focus { background: #fff; border-color: #000000; box-shadow: 0 0 0 4px rgba(0,0,0, 0.08); }
.select-control { appearance: none; padding-left: 2.2rem; }

/* Upload */
.upload-wrapper { width: 100%; border: 2px dashed #e5e7eb; border-radius: 12px; padding: 1.5rem; text-align: center; cursor: pointer; transition: 0.2s; background: #f9fafb; margin-bottom: 1rem; box-sizing: border-box; }
.upload-wrapper:hover { border-color: #000000; background: #fff; }
.upload-box { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 120px; }
.preview-image { max-width: 100%; max-height: 200px; border-radius: 8px; object-fit: contain; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: #6b7280; }
.upload-placeholder svg { color: #9ca3af; margin-bottom: 0.25rem; }
.upload-placeholder p { font-size: 0.9rem; font-weight: 700; margin: 0; color: #374151; }
.upload-placeholder span { font-size: 0.75rem; color: #9ca3af; }

/* Items */
.items-section { border-top: 1px solid #f3f4f6; padding-top: 1.25rem; }
.items-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
.items-heading .form-label { margin-bottom: 0; }
.items-count { font-size: 0.75rem; font-weight: 700; color: #6b7280; background: #f3f4f6; padding: 0.25rem 0.6rem; border-radius: 6px; }
.selection-box-area { border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; background: #fff; }
.products-toolbar { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
.products-toolbar .search-box { min-width: 0; }
.search-control { padding: 0.65rem 2.4rem 0.65rem 1rem; }
.select-all { white-space: nowrap; font-weight: 700; }
.product-pick-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 320px; overflow-y: auto; padding: 0.25rem; border: 1px solid #f3f4f6; border-radius: 8px; }
.product-pick-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.75rem; border: 1px solid #e5e7eb; border-radius: 10px; cursor: pointer; transition: 0.2s; background: #fff; }
.product-pick-row:hover { border-color: #000000; background: #f9fafb; }
.product-pick-row.selected { border-color: #000000; background: #f3f4f6; }
.product-pick-row input[type="checkbox"] { width: 16px; height: 16px; accent-color: #000000; flex-shrink: 0; cursor: pointer; }
.product-thumb { width: 42px; height: 42px; border-radius: 8px; background: #f3f4f6; color: #9ca3af; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
.product-thumb img { width: 100%; height: 100%; object-fit: cover; }
.product-pick-name { flex: 1; min-width: 0; font-size: 0.82rem; font-weight: 700; color: #111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qty-box { display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0; }
.qty-label { font-size: 0.7rem; font-weight: 600; color: #6b7280; }
.qty-input { width: 70px; padding: 0.45rem 0.5rem; text-align: center; }
.qty-input:disabled { opacity: 0.5; }
.hint { color: #9ca3af; font-size: 0.8rem; margin: 0.5rem; text-align: center; }

.chk-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #374151; cursor: pointer; padding: 0.25rem 0; }
.chk-item input { width: 16px; height: 16px; accent-color: #000000; }
.mt-2 { margin-top: 0.75rem; }

/* Form Grid */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
.mt-1 { margin-top: 1.5rem; margin-bottom: 1.5rem; }

/* Toggle */
.form-section-toggle { display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: #f9fafb; border-radius: 12px; margin-top: 1.5rem; }
.toggle-lbl { font-size: 0.9rem; font-weight: 700; color: #111827; }
.toggle-switch { cursor: pointer; }
.t-slider { width: 50px; height: 26px; background: #e5e7eb; border-radius: 100px; position: relative; transition: 0.4s; }
.t-knob { width: 20px; height: 20px; background: #fff; border-radius: 50%; position: absolute; top: 3px; right: 3px; transition: 0.4s; }
.t-slider.on { background: #10b981; }
.t-slider.on .t-knob { transform: translateX(-24px); }

/* Footer Btns */
.form-footer-btns { margin-top: 2rem; display: flex; gap: 1rem; }
.btn-cancel-form { flex: 1; padding: 0.85rem; border-radius: 10px; border: 1px solid #e5e7eb; background: #fff; color: #6b7280; font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 700; cursor: pointer; }
.btn-submit-form { flex: 2; padding: 0.85rem; border-radius: 10px; border: none; background: #000000; color: #fff; font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 700; cursor: pointer; transition: 0.2s; }
.btn-submit-form:hover:not(:disabled) { background: #262626; }
.btn-submit-form:disabled { opacity: 0.6; }

/* Modals Shared */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; backdrop-filter: blur(4px); }
.modal-content { background: #fff; border-radius: 20px; width: 100%; position: relative; box-shadow: 0 25px 70px rgba(0,0,0,0.25); }
.modal-close { position: absolute; top: 1.5rem; left: 1.5rem; background: #f3f4f6; border: none; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; }

/* Alerts */
.alert-toast { position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 1.5rem; border-radius: 12px; background: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 0.75rem; transform: translateY(150%); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 2000; font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 600; font-size: 0.9rem; }
.alert-toast.show { transform: translateY(0); }
.alert-toast.success { border-right: 4px solid #059669; color: #065f46; }
.alert-toast.error { border-right: 4px solid #dc2626; color: #991b1b; }

.form-fieldset { border: 0; padding: 0; margin: 0; min-width: 0; }
.form-fieldset:disabled .form-control { background: #f9fafb; cursor: default; }

@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
  .offer-form { padding: 0 1.25rem 1.5rem; }
  .page-header { align-items: flex-start; flex-direction: column; gap: 1rem; }
}
</style>
