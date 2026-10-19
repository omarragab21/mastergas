<template>
  <div class="dashboard" :dir="locale === 'ar' ? 'rtl' : 'ltr'">

    <!-- ===== PAGE HEADER ===== -->
    <div class="dash-header">
      <div>
        <h1 class="dash-title">{{ t('admin.dashboard.title') }}</h1>
        <p class="dash-subtitle">{{ t('admin.dashboard.subtitle') }} · {{ formattedDate }}</p>
      </div>
    </div>

    <!-- ===== LOADING STATE (skeleton in the real layout) ===== -->
    <div v-if="loading" class="dashboard-skeleton" aria-busy="true" :aria-label="t('admin.dashboard.loading')">
      <div class="stats-grid">
        <div v-for="n in 5" :key="'sk-stat-' + n" class="stat-card">
          <div class="stat-top">
            <span class="shimmer sk-icon"></span>
            <span class="shimmer sk-pill"></span>
          </div>
          <div class="stat-bottom">
            <span class="shimmer sk-value"></span>
            <span class="shimmer sk-line sk-w-40"></span>
          </div>
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-card donut-card">
          <span class="shimmer sk-line sk-title"></span>
          <div class="donut-body">
            <span class="shimmer sk-donut"></span>
            <div class="donut-legend-grid">
              <span v-for="n in 6" :key="'sk-leg-' + n" class="shimmer sk-line"></span>
            </div>
          </div>
        </div>
        <div class="chart-card line-card">
          <span class="shimmer sk-line sk-title"></span>
          <span class="shimmer sk-chart"></span>
        </div>
      </div>

      <div v-for="row in ['tables-row', 'bottom-row']" :key="row" :class="row">
        <div v-for="n in 2" :key="row + n" class="section-card">
          <div class="section-header">
            <span class="shimmer sk-line sk-title"></span>
          </div>
          <div class="sk-rows">
            <div v-for="r in 5" :key="r" class="sk-row">
              <span class="shimmer sk-avatar"></span>
              <span class="shimmer sk-line"></span>
              <span class="shimmer sk-line sk-w-20"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== ERROR STATE ===== -->
    <div v-else-if="error" class="error-alert">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>{{ error }}</p>
      <button @click="fetchAll({ force: true })" class="retry-btn">{{ t('admin.dashboard.retry') }}</button>
    </div>

    <!-- ===== MAIN CONTENT ===== -->
    <template v-else>

      <!-- ===== ROW 1: STAT CARDS (5) ===== -->
      <div class="stats-grid">
        <div v-for="card in statCards" :key="card.key" class="stat-card">
          <div class="stat-top">
            <div class="stat-icon" :style="{ background: card.iconBg }">
              <span v-html="card.icon"></span>
            </div>
            <div class="stat-trend" :class="card.trendUp ? 'trend-up' : 'trend-down'">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline :points="card.trendUp ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
              </svg>
              {{ card.trend }}
            </div>
          </div>
          <div class="stat-bottom">
            <div class="stat-value">
              <span>{{ card.value }}</span>
              <img v-if="card.currency" :src="riyalIcon" class="currency-icon" alt="ريال سعودي" />
            </div>
            <div class="stat-label">{{ t(`admin.dashboard.${card.labelKey}`) }}</div>
          </div>
        </div>
      </div>

      <!-- ===== ROW 2: CHARTS ===== -->
      <div class="charts-row">

        <!-- Donut: Order Distribution -->
        <div class="chart-card donut-card">
          <div class="chart-header">
            <h3 class="chart-title">{{ t('admin.dashboard.orders_distribution') }}</h3>
          </div>
          <div class="donut-body">
            <div class="donut-canvas-wrap">
              <canvas ref="donutCanvas" width="160" height="160"></canvas>
              <div class="donut-center-text">
                <span class="donut-total-num">{{ totalOrdersCount }}</span>
                <span class="donut-total-lbl">{{ t('admin.dashboard.orders_total') }}</span>
              </div>
            </div>
            <div class="donut-legend-grid">
              <div v-for="item in orderStatusData" :key="item.key" class="legend-row">
                <div class="legend-left-part">
                  <span class="legend-dot" :style="{ background: item.color }"></span>
                  <span class="legend-lbl">{{ t(`admin.dashboard.${item.labelKey}`) }}</span>
                </div>
                <span class="legend-count">{{ Number.isFinite(item.count) ? item.count : 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Line: Sales Chart -->
        <div class="chart-card line-card">
          <div class="chart-header">
            <h3 class="chart-title">{{ t('admin.dashboard.sales_chart') }}</h3>
            <div class="period-toggle">
              <button
                class="toggle-btn"
                :class="{ active: salesPeriod === 'monthly' }"
                @click="setSalesPeriod('monthly')"
              >{{ t('admin.dashboard.monthly') }}</button>
              <button
                class="toggle-btn"
                :class="{ active: salesPeriod === 'daily' }"
                @click="setSalesPeriod('daily')"
              >{{ t('admin.dashboard.daily') }}</button>
            </div>
          </div>
          <div class="line-wrapper">
            <canvas ref="lineCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- ===== ROW 3: ORDERS TABLE + BEST SELLERS ===== -->
      <div class="tables-row">

        <!-- Recent Orders -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span class="section-title">{{ t('admin.dashboard.recent_orders') }}</span>
            </div>
            <router-link to="/admin/orders" class="view-all-link">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              {{ t('admin.dashboard.view_all') }}
            </router-link>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ t('admin.dashboard.status') }}</th>
                  <th>{{ t('admin.dashboard.amount') }}</th>
                  <th>{{ t('admin.dashboard.customer') }}</th>
                  <th>{{ t('admin.dashboard.order_number') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in recentOrders" :key="order.id">
                  <td><span class="status-badge" :class="order.statusClass">{{ localizeOrderStatus(order.status) }}</span></td>
                  <td class="td-amount"><span class="amount-with-currency">{{ formatAmountValue(order.amount) }}<img :src="riyalIcon" class="currency-icon" :alt="t('admin.dashboard.sar')" /></span></td>
                  <td>{{ order.customer }}</td>
                  <td class="td-order-id">{{ formatOrderNum(order.orderNumber || order.id) }}</td>
                </tr>
                <tr v-if="!recentOrders.length">
                  <td colspan="4" class="td-empty">{{ t('admin.dashboard.no_orders') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Best Selling Products -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span class="section-title">{{ t('admin.dashboard.best_sellers') }}</span>
            </div>
            <router-link to="/admin/products" class="view-all-link">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              {{ t('admin.dashboard.view_all') }}
            </router-link>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ t('admin.dashboard.revenue') }}</th>
                  <th>{{ t('admin.dashboard.sales') }}</th>
                  <th>{{ t('admin.dashboard.product') }}</th>
                  <th>#</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="bestSellersLoading">
                  <tr v-for="r in 5" :key="'sk-best-' + r">
                    <td colspan="4" class="td-loading"><span class="shimmer sk-line"></span></td>
                  </tr>
                </template>
                <tr v-else-if="bestSellersError">
                  <td colspan="4" class="td-error">
                    <span>{{ bestSellersError }}</span>
                    <button @click="fetchBestSellers(abortController?.signal)" class="section-retry-btn">{{ t('admin.dashboard.retry') }}</button>
                  </td>
                </tr>
                <template v-else>
                  <tr v-for="(prod, idx) in bestSellers" :key="prod.id || idx">
                    <td class="td-amount"><span class="amount-with-currency">{{ formatAmountValue(prod.revenue ?? prod.total_revenue ?? 0) }}<img :src="riyalIcon" class="currency-icon" :alt="t('admin.dashboard.sar')" /></span></td>
                    <td class="td-num">{{ prod.sales ?? prod.total_sold ?? 0 }}</td>
                    <td class="td-product-name">{{ prod.name ?? prod.product_name ?? '-' }}</td>
                    <td><span class="rank-num" :class="'rank-' + (idx + 1)">{{ idx + 1 }}</span></td>
                  </tr>
                  <tr v-if="!bestSellers.length">
                    <td colspan="4" class="td-empty">{{ t('admin.dashboard.no_data') }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ===== ROW 4: RETURNS + INVENTORY ALERTS ===== -->
      <div class="bottom-row">

        <!-- Returns -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 0 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 0-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
              <span class="section-title">{{ t('admin.dashboard.returns') }}</span>
              <span v-if="pendingReturnsCount > 0" class="badge-pending">{{ pendingReturnsCount }} {{ t('admin.dashboard.pending') }}</span>
            </div>
            <router-link to="/admin/returns" class="view-all-link">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              {{ t('admin.dashboard.view_all') }}
            </router-link>
          </div>
          <div class="returns-list">
            <div v-if="returnsLoading" class="sk-rows" aria-busy="true">
              <div v-for="r in 4" :key="'sk-ret-' + r" class="sk-row">
                <span class="shimmer sk-line"></span>
                <span class="shimmer sk-line sk-w-20"></span>
              </div>
            </div>
            <div v-else-if="returnsError" class="section-error">
              <span>{{ returnsError }}</span>
              <button @click="fetchReturns(abortController?.signal)" class="section-retry-btn">{{ t('admin.dashboard.retry') }}</button>
            </div>
            <template v-else>
              <div v-for="ret in recentReturns" :key="ret.id" class="return-item">
                <div class="return-left">
                  <span class="return-status" :class="'rs-' + ret.status">{{ returnStatusLabel(ret.status) }}</span>
                  <div class="return-meta">
                    <span class="return-order-ref">#{{ ret.order_id || ret.id }} - {{ ret.customer_name }}</span>
                    <span class="return-product-txt">{{ ret.product_name }}</span>
                  </div>
                </div>
                <span class="return-amt amount-with-currency">{{ formatAmountValue(ret.refund_amount ?? 0) }}<img :src="riyalIcon" class="currency-icon" :alt="t('admin.dashboard.sar')" /></span>
              </div>
              <div v-if="!recentReturns.length" class="empty-section">{{ t('admin.dashboard.no_returns') }}</div>
            </template>
          </div>
        </div>

        <!-- Inventory Alerts -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span class="section-title">{{ t('admin.dashboard.inventory') }}</span>
            </div>
            <router-link to="/admin/products" class="view-all-link">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              {{ t('admin.dashboard.manage_inventory') }}
            </router-link>
          </div>
          <div class="inventory-list">
            <div v-if="lowStockLoading" class="sk-rows" aria-busy="true">
              <div v-for="r in 5" :key="'sk-inv-' + r" class="sk-row">
                <span class="shimmer sk-avatar"></span>
                <span class="shimmer sk-line"></span>
                <span class="shimmer sk-line sk-w-20"></span>
              </div>
            </div>
            <div v-else-if="lowStockError" class="section-error">
              <span>{{ lowStockError }}</span>
              <button @click="fetchLowStock(abortController?.signal)" class="section-retry-btn">{{ t('admin.dashboard.retry') }}</button>
            </div>
            <template v-else>
              <div v-for="(item, idx) in lowStockItems" :key="item.id || idx" class="inv-item">
                <div class="inv-icon-box" :style="{ background: INV_COLORS[idx % INV_COLORS.length] }">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                    <polyline points="2 17 12 22 22 17"/>
                    <polyline points="2 12 12 17 22 12"/>
                  </svg>
                </div>
                <div class="inv-info">
                  <span class="inv-sku">{{ item.sku ?? item.barcode ?? '-' }}</span>
                  <span class="inv-name">{{ item.name ?? item.product_name ?? '-' }}</span>
                </div>
                <span class="inv-stock-badge" :class="(item.stock ?? item.quantity ?? 0) <= 0 ? 'out-stock' : 'low-stock-badge'">
                  {{ (item.stock ?? item.quantity ?? 0) <= 0 ? t('admin.dashboard.out_of_stock') : `${item.stock ?? item.quantity} ${t('admin.dashboard.remaining')}` }}
                </span>
              </div>
              <div v-if="!lowStockItems.length" class="empty-section">{{ t('admin.dashboard.no_inventory') }}</div>
            </template>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onActivated, nextTick, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import api from '../config/axios';
import { toProduct, listFromResponse } from '../domain/catalog/adminCatalog';
import { toAdminUser } from '../domain/adminManagement';
import { toOrder } from '../domain/orders/adminOrder';
import { normalizeReturn } from '../services/returnsService';
import riyalIcon from '../assets/riyal.svg';
import { useTheme } from '../composables/useTheme';
import { useI18n } from 'vue-i18n';
import { freshness } from '../utils/dataFreshness';

Chart.register(...registerables);

const { isDark } = useTheme();
const { locale, t } = useI18n();
// The dashboard must reflect the authenticated Tijara data by default. The
// legacy /dashboard/statistics route is not available on the current backend,
// so the screen is always assembled from the live v1 resources below.
const useLiveApi = true;

// ─── Canvas refs ───────────────────────────────────────────────────────────────
const donutCanvas = ref(null);
const lineCanvas  = ref(null);
let donutChartInstance = null;
let lineChartInstance  = null;
let abortController = null;
let isDisposed = false;

// ─── State ─────────────────────────────────────────────────────────────────────
const loading        = ref(true);
const error          = ref(null);
const salesPeriod    = ref('monthly');
const monthlyData    = ref([]);
const dailyData      = ref([]);
const recentOrders   = ref([]);
const bestSellers    = ref([]);
const recentReturns  = ref([]);
const lowStockItems  = ref([]);

const returnsLoading     = ref(false);
const returnsError       = ref(null);
const bestSellersLoading = ref(false);
const bestSellersError   = ref(null);
const lowStockLoading    = ref(false);
const lowStockError      = ref(null);

const pendingReturnsTotal = ref(null);
const serverTotalOrders  = ref(null);
const hasStatusBreakdown = ref(false);

const orderStatusData = ref([
  { key: 'completed',  labelKey: 'completed',  count: 0, color: '#10B981' },
  { key: 'pending',    labelKey: 'pending',    count: 0, color: "#9ca3af" },
  { key: 'processing', labelKey: 'processing', count: 0, color: "#374151" },
  { key: 'shipped',    labelKey: 'shipped',    count: 0, color: "#6b7280" },
  { key: 'cancelled',  labelKey: 'cancelled', count: 0, color: '#000000' },
  { key: 'returned',   labelKey: 'returned',   count: 0, color: '#EF4444' },
]);

const statCards = ref([
  {
    key: 'products',
    labelKey: 'products',
    value: '0',
    trend: '0%',
    trendUp: true,
    iconBg: "#f3f4f6",
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  },
  {
    key: 'customers',
    labelKey: 'customers',
    value: '0',
    trend: '0%',
    trendUp: true,
    iconBg: "#f3f4f6",
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  },
  {
    key: 'today_orders',
    labelKey: 'today_orders',
    value: '0',
    trend: '0%',
    trendUp: true,
    iconBg: "#f3f4f6",
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  },
  {
    key: 'monthly_sales',
    labelKey: 'monthly_sales',
    value: '0',
    currency: true,
    trend: '0%',
    trendUp: true,
    iconBg: "#f3f4f6",
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  },
  {
    key: 'today_sales',
    labelKey: 'today_sales',
    value: '0',
    currency: true,
    trend: '0%',
    trendUp: true,
    iconBg: '#f3f4f6',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  },
]);

const INV_COLORS = ["#000000", "#374151", "#6b7280", "#9ca3af", "#d1d5db"];

// ─── Computed ──────────────────────────────────────────────────────────────────
const formattedDate = computed(() => {
  return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date());
});

const totalOrdersCount = computed(() => {
  const statusSum = orderStatusData.value.reduce((s, i) => s + (Number.isFinite(i.count) && i.count > 0 ? i.count : 0), 0);
  if (hasStatusBreakdown.value && statusSum > 0) {
    return statusSum;
  }
  if (serverTotalOrders.value !== null && Number.isFinite(serverTotalOrders.value) && serverTotalOrders.value >= 0) {
    return serverTotalOrders.value;
  }
  return statusSum;
});

const pendingReturnsCount = computed(() =>
  pendingReturnsTotal.value ?? recentReturns.value.filter(r => r.status === 'pending').length
);

// ─── Helpers ───────────────────────────────────────────────────────────────────
function parseNonNegativeInt(val, fallback = 0) {
  if (val === null || val === undefined || val === '' || typeof val === 'object' || typeof val === 'boolean') return fallback;
  const n = Number(val);
  if (!Number.isFinite(n) || n < 0 || Math.floor(n) !== n) {
    return fallback;
  }
  return n;
}

function extractList(payload) {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;
  return null;
}

const fmt = (n) => {
  const v = Number(n);
  return Number.isFinite(v) ? v.toLocaleString('en-US') : '-';
};

const formatAmountValue = (n) => {
  const v = Number(n);
  return Number.isFinite(v) ? v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '-';
};

const CURRENCY_TEXT = () => t('admin.dashboard.sar');

const formatOrderNum = (val) => {
  if (!val) return '-';
  const cleaned = String(val).replace(/^ORD-/i, '');
  return '#' + cleaned;
};

const sortByStock = (arr) => {
  if (!Array.isArray(arr)) return [];
  return [...arr].sort((a, b) => {
    const aStock = Number(a.stock ?? a.quantity ?? 0);
    const bStock = Number(b.stock ?? b.quantity ?? 0);
    return (Number.isFinite(aStock) ? aStock : 0) - (Number.isFinite(bStock) ? bStock : 0);
  });
};

const sortBySales = (arr) => {
  if (!Array.isArray(arr)) return [];
  return [...arr].sort((a, b) => {
    const aSales = Number(a.sales ?? a.total_sold ?? 0);
    const bSales = Number(b.sales ?? b.total_sold ?? 0);
    return (Number.isFinite(bSales) ? bSales : 0) - (Number.isFinite(aSales) ? aSales : 0);
  });
};

const returnStatusLabel = (s) => ({
  pending:  'pending_review',
  approved: 'approved',
  rejected: 'rejected',
  refunded: 'refunded',
}[s] ? t(`admin.dashboard.${{
  pending: 'pending_review', approved: 'approved', rejected: 'rejected', refunded: 'refunded'
}[s]}`) : s);

const localizeOrderStatus = (status) => {
  const key = String(status || '').toLowerCase();
  const statusKey = {
    completed: 'completed', delivered: 'completed',
    pending: 'pending', awaiting: 'pending',
    processing: 'processing', prepared: 'processing', paid_confirmed: 'processing',
    shipped: 'shipped', out_for_delivery: 'shipped',
    cancelled: 'cancelled', canceled: 'cancelled',
    returned: 'returned', refunded: 'returned',
  }[key];
  return statusKey ? t(`admin.dashboard.${statusKey}`) : status;
};

const trend = (val) => {
  const v = parseFloat(val);
  if (!Number.isFinite(v)) return '0%';
  return (v > 0 ? '+' : '') + v + '%';
};

// ─── Section Fetchers ──────────────────────────────────────────────────────────
const fetchReturns = async (signal) => {
  returnsLoading.value = true;
  returnsError.value = null;
  try {
    const res = await getDashboardResource(useLiveApi ? '/v1/returns' : '/dashboard/returns?per_page=4', { signal });
    const list = extractList(res.data);
    if (!list) {
      throw new Error('بنية بيانات المرتجعات غير مدعومة');
    }
    recentReturns.value = list.slice(0, 4);
  } catch (err) {
    if (err.name === 'CanceledError' || err.name === 'AbortError') return;
    returnsError.value = err.response?.data?.message || 'فشل في تحميل طلبات الإرجاع';
  } finally {
    returnsLoading.value = false;
  }
};

const fetchBestSellers = async (signal) => {
  bestSellersLoading.value = true;
  bestSellersError.value = null;
  try {
    const res = await getDashboardResource(useLiveApi ? '/v1/products?per_page=1000&include_inactive=1&show_all=1' : '/dashboard/products?per_page=7&sort_by=total_sold&sort_dir=desc', { signal });
    const list = extractList(res.data);
    if (!list) {
      throw new Error('بنية بيانات المنتجات غير مدعومة');
    }
    bestSellers.value = sortBySales(list).slice(0, 7);
  } catch (err) {
    if (err.name === 'CanceledError' || err.name === 'AbortError') return;
    bestSellersError.value = err.response?.data?.message || 'فشل في تحميل أفضل المنتجات';
  } finally {
    bestSellersLoading.value = false;
  }
};

const fetchLowStock = async (signal) => {
  lowStockLoading.value = true;
  lowStockError.value = null;
  try {
    const res = await getDashboardResource(useLiveApi ? '/v1/products?per_page=1000&include_inactive=1&show_all=1' : '/dashboard/products?low_stock=1&per_page=5', { signal });
    const list = extractList(res.data);
    if (!list) {
      throw new Error('بنية بيانات المخزون غير مدعومة');
    }
    lowStockItems.value = sortByStock(list).slice(0, 5);
  } catch (err) {
    if (err.name === 'CanceledError' || err.name === 'AbortError') return;
    lowStockError.value = err.response?.data?.message || 'فشل في تحميل تنبيهات المخزون';
  } finally {
    lowStockLoading.value = false;
  }
};

// The live Tijara API has no aggregate dashboard route (/dashboard/statistics
// is a 404), so the same dashboard contract is built from the paginated admin
// resources. The orders endpoint is fixed at 20 per page and ignores per_page,
// so every page is collected through the shared services instead of one request.
const ORDER_STATUS_BUCKETS = {
  delivered: 'completed', completed: 'completed',
  processing: 'processing', paid_confirmed: 'processing', prepared: 'processing',
  shipped: 'shipped', out_for_delivery: 'shipped',
  cancelled: 'cancelled', canceled: 'cancelled',
  returned: 'returned', refunded: 'returned',
};
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const dayKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const percentChange = (current, previous) => {
  if (!previous) return current ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const DASHBOARD_MAX_ORDER_PAGES = 50;
// Orders pages are fetched a few at a time; firing all of them at once made
// the backend drop or time out random pages, which failed the whole screen.
const DASHBOARD_ORDER_CONCURRENCY = 4;
// The aggregate requests (1000 products, every user) are heavy, so they get
// more time than the 6s default before counting as a failure.
const DASHBOARD_REQUEST_TIMEOUT = 20000;
const DASHBOARD_STORAGE_KEY = 'admin_dashboard_cache_v1';
// The snapshot has no time-to-live: it is current until a write, a manual refresh
// or a language change moves freshness.version past the version it was fetched
// at. It lives on globalThis so SPA navigation never repeats the API fan-out, and
// in localStorage so a browser reload paints the last dashboard instantly while
// one background refresh runs.
const dashboardCache = globalThis.__mastergasDashboardCache || { data: null, version: -1, owner: null, inFlight: null };
globalThis.__mastergasDashboardCache = dashboardCache;

const cacheOwner = () => {
  try {
    return String(localStorage.getItem('token') || '').slice(-16) || null;
  } catch {
    return null;
  }
};

const readDashboardCache = () => {
  const owner = cacheOwner();
  if (dashboardCache.data && dashboardCache.owner === owner) return dashboardCache;
  try {
    const stored = JSON.parse(localStorage.getItem(DASHBOARD_STORAGE_KEY) || 'null');
    if (stored?.data && stored.owner === owner) {
      // Version -1: a snapshot from a previous browser session is shown at once but refreshed once.
      Object.assign(dashboardCache, { data: stored.data, version: -1, owner });
      return dashboardCache;
    }
  } catch {
    // A corrupt or blocked cache only costs a fresh request.
  }
  return null;
};

const writeDashboardCache = (data, version) => {
  const owner = cacheOwner();
  Object.assign(dashboardCache, { data, version, owner });
  try {
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify({ data, owner }));
  } catch {
    // Storage full or blocked: the in-memory snapshot still works.
  }
};

const mapWithConcurrency = async (items, limit, worker) => {
  const results = new Array(items.length);
  let next = 0;
  const run = async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await worker(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
};

const waitBeforeRetry = (delay, signal) => new Promise((resolve, reject) => {
  const timer = setTimeout(resolve, delay);
  if (!signal) return;
  signal.addEventListener('abort', () => {
    clearTimeout(timer);
    const error = new Error('Dashboard request cancelled');
    error.name = 'AbortError';
    reject(error);
  }, { once: true });
});

const isTransientDashboardError = (error) => (
  !error?.response ||
  error.response.status >= 500 ||
  ['ECONNABORTED', 'ETIMEDOUT'].includes(error.code)
);

const getDashboardResource = async (path, config = {}) => {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await api.get(path, { timeout: DASHBOARD_REQUEST_TIMEOUT, ...config });
    } catch (error) {
      lastError = error;
      if (!isTransientDashboardError(error) || attempt === 2 || error.name === 'CanceledError' || error.name === 'AbortError') {
        throw error;
      }
      await waitBeforeRetry(400 * (attempt + 1), config.signal);
    }
  }
  throw lastError;
};

const fetchDashboardOrders = async (signal) => {
  const first = await getDashboardResource('/v1/orders', { params: { page: 1 }, signal });
  const items = [...listFromResponse(first.data)];
  const lastPage = Math.min(Number(first.data?.meta?.last_page) || 1, DASHBOARD_MAX_ORDER_PAGES);
  if (lastPage > 1) {
    const pageNumbers = Array.from({ length: lastPage - 1 }, (_, index) => index + 2);
    const pages = await mapWithConcurrency(pageNumbers, DASHBOARD_ORDER_CONCURRENCY, (page) =>
      getDashboardResource('/v1/orders', { params: { page }, signal })
        .then((response) => listFromResponse(response.data))
    );
    pages.forEach((page) => items.push(...page));
  }
  return items.map(toOrder);
};

const fetchDashboardResources = async (signal) => {
  const [productsResult, ordersResult, usersResult, returnsResult] = await Promise.allSettled([
    getDashboardResource('/v1/products', { params: { per_page: 1000, include_inactive: 1, show_all: 1 }, signal })
      .then((response) => listFromResponse(response.data).map(toProduct)),
    fetchDashboardOrders(signal),
    getDashboardResource('/v1/users', { params: { per_page: 1000 }, signal })
      .then((response) => listFromResponse(response.data).map(toAdminUser)),
    getDashboardResource('/v1/returns', { params: { per_page: 4 }, signal })
      .then((response) => listFromResponse(response.data).map(normalizeReturn)),
  ]);
  if (ordersResult.status === 'rejected') throw ordersResult.reason;
  return {
    products: productsResult.status === 'fulfilled' ? productsResult.value : [],
    orders: ordersResult.value,
    users: usersResult.status === 'fulfilled' ? usersResult.value : [],
    returns: returnsResult.status === 'fulfilled' ? returnsResult.value : [],
  };
};

// One fan-out at a time: a second mount or retry while a refresh is running
// reuses it instead of doubling the load on the backend.
const fetchFreshDashboard = () => {
  if (!dashboardCache.inFlight) {
    const controller = new AbortController();
    const startedAtVersion = freshness.version;
    dashboardCache.inFlight = buildLiveDashboardFallback(controller.signal)
      .then((data) => {
        writeDashboardCache(data, startedAtVersion);
        return data;
      })
      .finally(() => {
        dashboardCache.inFlight = null;
      });
  }
  return dashboardCache.inFlight;
};

const buildLiveDashboardFallback = async (signal) => {
  const { products, orders, users, returns } = await fetchDashboardResources(signal);
  const customers = users.filter((user) => ['user', 'customer'].includes(String(user.role).toLowerCase()));

  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const dated = orders
    .map((order) => ({ order, date: order.createdAt ? new Date(order.createdAt) : null }))
    .filter(({ date }) => date && Number.isFinite(date.getTime()));
  // Cancelled orders are not revenue.
  const sold = dated.filter(({ order }) => String(order.status).toLowerCase() !== 'cancelled');
  const sum = (rows) => rows.reduce((total, { order }) => total + (Number(order.total) || 0), 0);
  const onDay = (rows, day) => rows.filter(({ date }) => dayKey(date) === dayKey(day));
  const inMonth = (rows, month) => rows.filter(({ date }) => date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth());

  const todayRows = onDay(sold, now);
  const yesterdayRows = onDay(sold, yesterday);
  const monthRows = inMonth(sold, now);
  const lastMonthRows = inMonth(sold, lastMonth);

  const statusCounts = orders.reduce((counts, order) => {
    counts[ORDER_STATUS_BUCKETS[String(order.status).toLowerCase()] || 'pending'] += 1;
    return counts;
  }, { completed: 0, pending: 0, processing: 0, shipped: 0, cancelled: 0, returned: 0 });

  const monthly = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return { month_ar: MONTHS_AR[month.getMonth()], month_en: MONTHS_EN[month.getMonth()], sales: sum(inMonth(sold, month)) };
  });
  const daily = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - index));
    return { day_ar: DAYS_AR[day.getDay()], day_en: DAYS_EN[day.getDay()], sales: sum(onDay(sold, day)) };
  });

  const bySales = new Map();
  sold.forEach(({ order }) => order.products.forEach((item) => {
    const key = item.productId ?? item.name;
    if (key === undefined || key === '') return;
    const row = bySales.get(key) || { id: key, name: item.name || '-', sales: 0, revenue: 0 };
    row.sales += item.quantity;
    row.revenue += item.total;
    bySales.set(key, row);
  }));

  const recent = [...dated]
    .sort((a, b) => b.date - a.date)
    .slice(0, 5)
    .map(({ order }) => {
      const key = String(order.status).toLowerCase();
      const bucket = ORDER_STATUS_BUCKETS[key] || 'pending';
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.customerName || '-',
        amount: order.total,
        status: bucket,
        statusClass: 'status-' + (bucket === 'completed' ? 'completed' : bucket),
      };
    });

  const lowStock = products
    .map((product) => ({ ...product, stock: Number(product.stock ?? product.quantity ?? 0) || 0 }))
    .filter((product) => product.stock <= 5)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  return {
    returns: returns && {
      recent: returns.slice(0, 4).map((ret) => ({
        id: ret.id,
        status: ret.status,
        order_id: ret.orderNumber || ret.orderId,
        customer_name: ret.customerName,
        product_name: ret.productName,
        refund_amount: ret.refundAmount,
      })),
      pending: returns.filter((ret) => ret.status === 'pending').length,
    },
    summary: {
      total_products: products.length,
      total_customers: customers.length,
      total_orders: orders.length,
      today_orders: onDay(dated, now).length,
      today_orders_change: percentChange(onDay(dated, now).length, onDay(dated, yesterday).length),
      monthly_sales: sum(monthRows),
      monthly_sales_change: percentChange(sum(monthRows), sum(lastMonthRows)),
      today_sales: sum(todayRows),
      today_sales_change: percentChange(sum(todayRows), sum(yesterdayRows)),
    },
    orders_by_status: statusCounts,
    monthly_data: monthly,
    daily_data: daily,
    recent_orders: recent,
    best_selling_products: sortBySales([...bySales.values()]).slice(0, 7),
    low_stock_products: lowStock,
  };
};

// ─── Fetch All ─────────────────────────────────────────────────────────────────
const setStatCard = (index, value, change, format) => {
  const card = statCards.value[index];
  card.value   = (value !== undefined && value !== null && Number.isFinite(Number(value))) ? format(value) : '-';
  card.trend   = trend(change ?? 0);
  card.trendUp = parseFloat(change ?? 0) >= 0;
};

let renderedSnapshot = null;

const applyDashboard = async (data) => {
  const s = data.summary || {};

  setStatCard(0, s.total_products ?? s.products_count, s.products_change, fmt);
  setStatCard(1, s.total_customers ?? s.customers_count, s.customers_change, fmt);
  setStatCard(2, s.today_orders, s.today_orders_change, fmt);
  setStatCard(3, s.monthly_sales, s.monthly_sales_change, formatAmountValue);
  setStatCard(4, s.today_sales, s.today_sales_change, formatAmountValue);

  // Order status distribution for donut
  serverTotalOrders.value = parseNonNegativeInt(s.total_orders, null);
  const obs = data.orders_by_status;
  if (obs && typeof obs === 'object') {
    hasStatusBreakdown.value = true;
    const counts = {
      completed:  obs.completed ?? obs.delivered,
      pending:    obs.pending ?? obs.awaiting,
      processing: obs.processing,
      shipped:    obs.shipped,
      cancelled:  obs.cancelled ?? obs.canceled,
      returned:   obs.returned,
    };
    orderStatusData.value.forEach(d => { d.count = parseNonNegativeInt(counts[d.key], 0); });
  } else {
    hasStatusBreakdown.value = false;
    orderStatusData.value.forEach(d => { d.count = 0; });
  }

  monthlyData.value  = Array.isArray(data.monthly_data) ? data.monthly_data : [];
  dailyData.value    = Array.isArray(data.daily_data) ? data.daily_data : [];
  recentOrders.value = Array.isArray(data.recent_orders) ? data.recent_orders.slice(0, 5) : [];

  bestSellers.value = sortBySales(data.best_selling_products || []).slice(0, 7);
  bestSellersError.value = null;
  lowStockItems.value = sortByStock(data.low_stock_products || []).slice(0, 5);
  lowStockError.value = null;

  if (data.returns) {
    recentReturns.value = data.returns.recent;
    pendingReturnsTotal.value = data.returns.pending;
    returnsError.value = null;
  } else {
    returnsError.value = 'فشل في تحميل طلبات الإرجاع';
  }

  if (isDisposed) return;
  loading.value = false;
  // Charts are rebuilt only when the numbers changed, so a background refresh
  // that returns the same data does not make them flash.
  const snapshot = JSON.stringify([data.orders_by_status, data.monthly_data, data.daily_data]);
  if (snapshot === renderedSnapshot && donutChartInstance && lineChartInstance) return;
  renderedSnapshot = snapshot;
  await nextTick();
  if (isDisposed) return;
  initDonutChart();
  initLineChart();
};

const describeLoadError = (err) => {
  if (err.response) {
    return `خطأ من السيرفر (${err.response.status}): ${err.response.data?.message || 'فشل في تحميل البيانات'}`;
  }
  if (err.request) {
    return 'لا يوجد استجابة من السيرفر. تأكد من الاتصال بالإنترنت ثم أعد المحاولة';
  }
  return 'خطأ: ' + err.message;
};

const fetchAll = async ({ force = false } = {}) => {
  error.value = null;

  // Stale-while-revalidate: paint the last snapshot right away (even after a
  // browser reload) and refresh it in the background.
  const cached = readDashboardCache();
  if (cached) {
    await applyDashboard(cached.data);
    if (!force && cached.version === freshness.version) return;
  } else {
    loading.value = true;
  }

  try {
    const data = await fetchFreshDashboard();
    if (isDisposed) return;
    await applyDashboard(data);
  } catch (err) {
    if (isDisposed) return;
    loading.value = false;
    if (err.name === 'CanceledError' || err.name === 'AbortError') return;
    if (err.response?.status === 401) return;
    // With a snapshot on screen a failed background refresh stays silent; the
    // next visit or retry replaces it once the backend answers again.
    if (cached) return;
    error.value = describeLoadError(err);
  }
};

// ─── Charts ────────────────────────────────────────────────────────────────────
function initDonutChart() {
  if (!donutCanvas.value || isDisposed) return;
  if (donutChartInstance) donutChartInstance.destroy();

  const active = orderStatusData.value.filter(d => Number.isFinite(d.count) && d.count > 0);
  const chartData = active.length
    ? active
    : [{ labelKey: 'no_data', count: 1, color: '#e5e7eb' }];

  donutChartInstance = new Chart(donutCanvas.value, {
    type: 'doughnut',
    data: {
      labels: chartData.map(d => t(`admin.dashboard.${d.labelKey}`)),
      datasets: [{
        data: chartData.map(d => d.count),
        backgroundColor: chartData.map(d => d.color),
        borderWidth: 3,
        borderColor: '#fff',
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: false,
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}` },
        },
      },
    },
  });
}

function initLineChart() {
  if (!lineCanvas.value || isDisposed) return;
  if (lineChartInstance) lineChartInstance.destroy();

  const src    = salesPeriod.value === 'daily' ? dailyData.value : monthlyData.value;
  const labels = Array.isArray(src) ? src.map(i => locale.value === 'en'
    ? (i.day_en ?? i.month_en ?? i.label ?? '')
    : (i.day_ar ?? i.month_ar ?? i.label ?? '')) : [];
  const values = Array.isArray(src) ? src.map(i => {
    const v = parseFloat(i.sales ?? i.total ?? 0);
    return Number.isFinite(v) ? v : 0;
  }) : [];

  lineChartInstance = new Chart(lineCanvas.value, {
    type: 'line',
    data: {
      labels: labels.length ? labels : [t('admin.dashboard.no_data')],
      datasets: [{
        label: t('admin.dashboard.sales'),
        data: values.length ? values : [0],
        borderColor: '#000000',
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 220);
          gradient.addColorStop(0, 'rgba(0,0,0, 0.18)');
          gradient.addColorStop(1, 'rgba(0,0,0, 0)');
          return gradient;
        },
        borderWidth: 2.5,
        fill: true,
        tension: 0.45,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#000000',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: { label: ctx => ` ${formatAmountValue(ctx.parsed.y || 0)} ${CURRENCY_TEXT()}` },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'IBM Plex Sans Arabic', size: 11 }, color: isDark.value ? '#94a3b8' : '#9ca3af' },
        },
        y: {
          position: locale.value === 'ar' ? 'right' : 'left',
          grid: { color: isDark.value ? '#334155' : '#f3f4f6' },
          ticks: {
            font: { family: 'IBM Plex Sans Arabic', size: 11 },
            color: isDark.value ? '#94a3b8' : '#9ca3af',
            callback: v => Number(v || 0).toLocaleString('en-US'),
          },
        },
      },
    },
  });
}

function setSalesPeriod(period) {
  salesPeriod.value = period;
  if (!isDisposed) {
    initLineChart();
  }
}

// ─── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  isDisposed = false;
  fetchAll();
});

// The page is kept alive between tab clicks: charts only need a resize after
// being re-attached, no request is made.
onActivated(() => {
  if (loading.value || isDisposed) return;
  lineChartInstance?.resize();
  donutChartInstance?.resize();
});

onUnmounted(() => {
  isDisposed = true;
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
  if (donutChartInstance) {
    donutChartInstance.destroy();
    donutChartInstance = null;
  }
  if (lineChartInstance) {
    lineChartInstance.destroy();
    lineChartInstance = null;
  }
});

watch([isDark, locale], () => {
  if (!loading.value && !isDisposed) {
    initDonutChart();
    initLineChart();
  }
});
</script>

<style scoped>
/* ─── Base ─────────────────────────────────────────────────────────────────── */
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

/* ─── Page Header ──────────────────────────────────────────────────────────── */
.dash-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-bottom: 0.25rem;
}
.dash-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 0.2rem 0;
  text-align: start;
}
.dash-subtitle {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
  text-align: start;
}

/* ─── Stat Cards ───────────────────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.9rem;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 1rem 1.1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  box-sizing: border-box;
  min-width: 0;
  max-width: 100%;
}
.stat-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-icon span {
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.18rem 0.45rem;
  border-radius: 6px;
}
.trend-up   { color: #059669; background: #d1fae5; }
.trend-down { color: #dc2626; background: #fee2e2; }

.stat-bottom { text-align: start; }
.stat-value {
  font-size: 1.55rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.15;
  display: block;
}
.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  margin-top: 0.1rem;
  display: block;
}

/* ─── Charts Row ───────────────────────────────────────────────────────────── */
.charts-row {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 0.9rem;
}
.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.1rem 1.2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  border: 1px solid #f0f0f0;
  box-sizing: border-box;
  min-width: 0;
  max-width: 100%;
}
.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.chart-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

/* Donut */
.donut-card { display: flex; flex-direction: column; }
.donut-body {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex: 1;
}
.donut-canvas-wrap {
  position: relative;
  width: 160px;
  height: 160px;
  flex-shrink: 0;
}
.donut-canvas-wrap canvas {
  display: block;
}
.donut-center-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.donut-total-num {
  font-size: 1.4rem;
  font-weight: 800;
  color: #111827;
  line-height: 1;
}
.donut-total-lbl {
  font-size: 0.7rem;
  color: #6b7280;
  margin-top: 2px;
}
.donut-legend-grid {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  flex: 1;
  min-width: 130px;
}
.legend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.75rem;
}
.legend-left-part {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.legend-lbl { color: #374151; }
.legend-count { font-weight: 700; color: #111827; }

/* Line chart */
.line-card { display: flex; flex-direction: column; }
.period-toggle {
  display: flex;
  gap: 0.3rem;
  background: #f3f4f6;
  padding: 3px;
  border-radius: 8px;
}
.toggle-btn {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
  color: #6b7280;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  transition: all 0.2s;
}
.toggle-btn.active {
  background: #fff;
  color: #000000;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.line-wrapper {
  height: 200px;
  position: relative;
  flex: 1;
}

/* ─── Tables Row ───────────────────────────────────────────────────────────── */
.tables-row,
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
}
.section-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  border: 1px solid #f0f0f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;
  max-width: 100%;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.1rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}
.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.section-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1f2937;
}
.view-all-link {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.73rem;
  font-weight: 600;
  color: #000000;
  text-decoration: none;
  transition: opacity 0.2s;
}
.view-all-link:hover { opacity: 0.7; }
/* The chevron is drawn for RTL; mirror it in English. */
.dashboard[dir="ltr"] .view-all-link svg { transform: scaleX(-1); }
.table-wrap { overflow-x: auto; }
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
}
.data-table th {
  text-align: start;
  padding: 0.55rem 0.9rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: #6b7280;
  background: #fafafa;
  border-bottom: 1px solid #f3f4f6;
  white-space: nowrap;
}
.data-table td {
  padding: 0.65rem 0.9rem;
  border-bottom: 1px solid #f9f9f9;
  color: #374151;
  text-align: start;
  white-space: nowrap;
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #fafafa; }
.td-order-id { font-weight: 700; color: #000000; }
.td-amount   { font-weight: 700; color: #111827; }
.amount-with-currency { display: inline-flex; align-items: center; gap: 4px; direction: ltr; white-space: nowrap; }
.currency-icon { width: 13px; height: 15px; object-fit: contain; display: inline-block; flex: 0 0 auto; }
.td-num      { font-weight: 600; color: #374151; }
.td-product-name { color: #374151; max-width: 150px; overflow: hidden; text-overflow: ellipsis; }
.td-empty    { text-align: center; color: #9ca3af; padding: 1.5rem; }

/* Status badges */
.status-badge {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 600;
  white-space: nowrap;
}
.status-completed, .status-done, .status-delivered { background: #d1fae5; color: #065f46; }
.status-processing { background: #dbeafe; color: #1e40af; }
.status-shipped    { background: #ffedd5; color: #9a3412; }
.status-pending    { background: #fef3c7; color: #92400e; }
.status-cancelled  { background: #fee2e2; color: #991b1b; }
.status-returned   { background: #f3f4f6; color: #6b21a8; }

/* Rank numbers */
.rank-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 700;
  background: #f3f4f6;
  color: #374151;
}
.rank-1 { background: #fef3c7; color: #92400e; }
.rank-2 { background: #f3f4f6; color: #374151; }
.rank-3 { background: #ffedd5; color: #9a3412; }

/* ─── Returns Section ──────────────────────────────────────────────────────── */
.badge-pending {
  font-size: 0.65rem;
  font-weight: 700;
  background: #fef3c7;
  color: #92400e;
  padding: 0.15rem 0.45rem;
  border-radius: 20px;
}
.returns-list {
  display: flex;
  flex-direction: column;
  padding: 0.4rem 0;
}
.return-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1.1rem;
  border-bottom: 1px solid #f9f9f9;
  gap: 0.75rem;
}
.return-item:last-child { border-bottom: none; }
.return-left {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  flex: 1;
  min-width: 0;
}
.return-status {
  display: inline-block;
  padding: 0.18rem 0.5rem;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}
.rs-pending  { background: #fef3c7; color: #92400e; }
.rs-approved { background: #d1fae5; color: #065f46; }
.rs-rejected { background: #fee2e2; color: #991b1b; }
.return-meta { min-width: 0; }
.return-order-ref {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.return-product-txt {
  display: block;
  font-size: 0.7rem;
  color: #6b7280;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.return-amt {
  font-weight: 700;
  font-size: 0.78rem;
  color: #111827;
  flex-shrink: 0;
}

/* ─── Inventory Section ────────────────────────────────────────────────────── */
.inventory-list {
  display: flex;
  flex-direction: column;
  padding: 0.4rem 0;
}
.inv-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1.1rem;
  border-bottom: 1px solid #f9f9f9;
}
.inv-item:last-child { border-bottom: none; }
.inv-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.inv-info {
  flex: 1;
  min-width: 0;
}
.inv-sku {
  display: block;
  font-size: 0.67rem;
  color: #9ca3af;
  font-weight: 500;
}
.inv-name {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.inv-stock-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.18rem 0.5rem;
  border-radius: 20px;
  flex-shrink: 0;
}
.out-stock       { background: #fee2e2; color: #991b1b; }
.low-stock-badge { background: #fef3c7; color: #92400e; }

.empty-section {
  text-align: center;
  color: #9ca3af;
  font-size: 0.78rem;
  padding: 1.5rem;
}

/* ─── Loading skeleton ─────────────────────────────────────────────────────── */
.dashboard-skeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  --sk-base: #eef0f3;
  --sk-glint: #f8f9fb;
}
:global(.dark) .dashboard-skeleton,
:global(.dark) .sk-rows,
:global(.dark) .td-loading {
  --sk-base: #1e293b;
  --sk-glint: #2b3a50;
}
.shimmer {
  display: block;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--sk-base, #eef0f3) 25%, var(--sk-glint, #f8f9fb) 50%, var(--sk-base, #eef0f3) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.3s ease-in-out infinite;
}
[dir="rtl"] .shimmer { animation-direction: reverse; }
@keyframes shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .shimmer { animation: none; }
}
.sk-icon   { width: 48px; height: 48px; border-radius: 10px; }
.sk-pill   { width: 44px; height: 20px; }
.sk-value  { width: 60%; height: 26px; margin-bottom: 0.4rem; }
.sk-line   { width: 100%; height: 12px; }
.sk-title  { width: 40%; height: 14px; margin-bottom: 1rem; }
.sk-w-40   { width: 40%; }
.sk-w-20   { width: 20%; flex-shrink: 0; }
.sk-donut  { width: 160px; height: 160px; border-radius: 50%; flex-shrink: 0; }
.sk-chart  { width: 100%; height: 200px; }
.dashboard-skeleton .donut-legend-grid { display: flex; flex-direction: column; gap: 0.7rem; flex: 1; }
.sk-rows   { display: flex; flex-direction: column; gap: 0.9rem; padding: 1rem 1.1rem; }
.sk-row    { display: flex; align-items: center; gap: 0.75rem; }
.sk-avatar { width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0; }

/* ─── Error ────────────────────────────────────────────────────────────────── */
.error-alert {
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #b91c1c;
}
.retry-btn {
  background: #000000;
  color: #fff;
  border: none;
  padding: 0.55rem 1.5rem;
  border-radius: 8px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-weight: 600;
  cursor: pointer;
}

/* ─── Section States ───────────────────────────────────────────────────────── */
.section-loading {
  padding: 1.5rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.85rem;
}
.section-error {
  padding: 1.25rem 1rem;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  color: #b91c1c;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  text-align: center;
}
.section-retry-btn {
  background: #000000;
  color: #fff;
  border: none;
  padding: 0.35rem 1rem;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.section-retry-btn:hover {
  opacity: 0.9;
}
.td-loading {
  padding: 0.85rem 1rem !important;
}
.td-error {
  padding: 1.5rem !important;
  text-align: center;
}
.td-error {
  color: #b91c1c;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

/* ─── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 1280px) {
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1024px) {
  .stats-grid    { grid-template-columns: repeat(2, 1fr); }
  .charts-row    { grid-template-columns: 1fr; }
  .tables-row,
  .bottom-row    { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }
  .stat-card {
    padding: 0.85rem 0.75rem;
    min-width: 0;
  }
  .chart-card {
    padding: 1rem 0.85rem;
    min-width: 0;
  }
  .donut-body {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .donut-legend-grid {
    width: 100%;
  }
  .dash-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
@media (max-width: 360px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
