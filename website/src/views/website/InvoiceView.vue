<template>
  <div class="invoice-page">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ t('invoice.loading') }}</p>
    </div>

    <div class="invoice-box" v-else-if="order">

      <!-- Header -->
      <div class="invoice-header">
        <div class="header-info">
          <div class="invoice-badge-tax">فاتورة ضريبية مبسطة | Simplified Tax Invoice</div>
          <h2 class="invoice-title">ماسترجاز لتجارة الأجهزة الإيطالية</h2>
          <p class="invoice-company-desc">Mastergas Italian Appliances Trading Est.</p>
          <div class="tax-info-grid">
            <p class="tax-detail-item"><strong>الرقم الضريبي (VAT ID):</strong> <span class="tax-mono">301204567800003</span></p>
            <p class="tax-detail-item"><strong>السجل التجاري (CR):</strong> <span class="tax-mono">1010654321</span></p>
            <p class="tax-detail-item"><strong>العنوان:</strong> الرياض - المملكة العربية السعودية</p>
          </div>
        </div>

        <div class="logo-and-qr">
          <div class="brand-logo-area">
            <h3 class="logo-text">MASTERGAS</h3>
            <span class="logo-sub">ITALIAN LUXURY</span>
          </div>
          <!-- ZATCA QR Code Representation -->
          <div class="zatca-qr-box">
            <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" fill="#ffffff" />
              <!-- Outer corner squares -->
              <rect x="5" y="5" width="28" height="28" fill="#000000" />
              <rect x="9" y="9" width="20" height="20" fill="#ffffff" />
              <rect x="13" y="13" width="12" height="12" fill="#000000" />
              <rect x="67" y="5" width="28" height="28" fill="#000000" />
              <rect x="71" y="9" width="20" height="20" fill="#ffffff" />
              <rect x="75" y="13" width="12" height="12" fill="#000000" />
              <rect x="5" y="67" width="28" height="28" fill="#000000" />
              <rect x="9" y="71" width="20" height="20" fill="#ffffff" />
              <rect x="13" y="75" width="12" height="12" fill="#000000" />
              <!-- Data patterns -->
              <rect x="40" y="8" width="6" height="6" fill="#000000" />
              <rect x="52" y="8" width="6" height="6" fill="#000000" />
              <rect x="40" y="20" width="6" height="12" fill="#000000" />
              <rect x="52" y="22" width="6" height="6" fill="#000000" />
              <rect x="8" y="40" width="12" height="6" fill="#000000" />
              <rect x="25" y="40" width="6" height="6" fill="#000000" />
              <rect x="40" y="40" width="8" height="8" fill="#000000" />
              <rect x="54" y="40" width="8" height="8" fill="#000000" />
              <rect x="68" y="40" width="12" height="6" fill="#000000" />
              <rect x="86" y="40" width="6" height="6" fill="#000000" />
              <rect x="8" y="52" width="6" height="6" fill="#000000" />
              <rect x="20" y="52" width="6" height="12" fill="#000000" />
              <rect x="40" y="54" width="8" height="8" fill="#000000" />
              <rect x="56" y="54" width="12" height="6" fill="#000000" />
              <rect x="74" y="52" width="6" height="12" fill="#000000" />
              <rect x="86" y="52" width="6" height="6" fill="#000000" />
              <rect x="40" y="68" width="6" height="14" fill="#000000" />
              <rect x="52" y="74" width="14" height="6" fill="#000000" />
              <rect x="72" y="68" width="6" height="8" fill="#000000" />
              <rect x="84" y="68" width="8" height="8" fill="#000000" />
              <rect x="40" y="86" width="14" height="6" fill="#000000" />
              <rect x="60" y="86" width="6" height="6" fill="#000000" />
              <rect x="74" y="82" width="16" height="10" fill="#000000" />
            </svg>
            <span class="zatca-label">معتمد من ZATCA</span>
          </div>
        </div>
      </div>

      <!-- Invoice Meta Row -->
      <div class="invoice-meta-banner">
        <div class="meta-item">
          <span class="meta-label">رقم الفاتورة:</span>
          <span class="meta-val font-mono">#{{ order.orderNumber || order.order_number || order.id }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">تاريخ الإصدار:</span>
          <span class="meta-val">{{ order.date || new Date().toLocaleDateString('ar-SA') }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">طريقة الدفع:</span>
          <span class="meta-val">{{ order.payment_method || 'دفع إلكتروني معتمد (مدى / فيزا)' }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">حالة الطلب:</span>
          <span class="meta-val status-confirmed">تم الدفع والتأكيد</span>
        </div>
      </div>

      <!-- Customer -->
      <div class="invoice-customer">
        <h4 class="section-title">بيانات العميل والمستلم</h4>
        <div class="customer-info-grid">
          <p class="customer-info"><strong>الاسم:</strong> {{ order.customerName || order.customer?.name || 'عميل ماسترجاز' }}</p>
          <p class="customer-info"><strong>الجوال:</strong> {{ order.customerPhone || order.customer?.phone || '-' }}</p>
          <p class="customer-info"><strong>البريد الإلكتروني:</strong> {{ order.customerEmail || order.customer?.email || '-' }}</p>
          <p class="customer-info"><strong>عنوان التوصيل:</strong> {{ order.customerAddress || order.shipping_address || 'المملكة العربية السعودية' }}</p>
        </div>
      </div>

      <!-- Table -->
      <table class="invoice-table">
        <thead>
          <tr>
            <th>#</th>
            <th>تفاصيل المنتج والضمان</th>
            <th>الكمية</th>
            <th>سعر الوحدة</th>
            <th>الضريبة (15%)</th>
            <th>المجموع شامل الضريبة</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, idx) in (order.items || order.products || [])" :key="item.id || idx">
            <td class="col-index">{{ idx + 1 }}</td>
            <td>
              <div class="prod-title-inv">{{ localized(item.product || item, 'name') }}</div>
              <span class="prod-warranty-inv">ضمان شامل سنتين (SASO / CE)</span>
            </td>
            <td class="text-center font-bold">{{ item.quantity }}</td>
            <td class="text-center">{{ (item.price || item.unit_price).toFixed(2) }} {{ currency }}</td>
            <td class="text-center">{{ (((item.price || item.unit_price) * item.quantity) * 0.15 / 1.15).toFixed(2) }} {{ currency }}</td>
            <td class="text-end font-bold">{{ ((item.price || item.unit_price) * item.quantity).toFixed(2) }} {{ currency }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Totals -->
      <div class="invoice-totals">
        <div class="total-row">
          <span>المجموع الفرعي (غير شامل الضريبة):</span>
          <strong>{{ ((order.total || order.total_amount || 0) / 1.15).toFixed(2) }} {{ currency }}</strong>
        </div>
        <div class="total-row">
          <span>ضريبة القيمة المضافة (15%):</span>
          <strong>{{ ((order.total || order.total_amount || 0) - ((order.total || order.total_amount || 0) / 1.15)).toFixed(2) }} {{ currency }}</strong>
        </div>
        <div class="total-row" v-if="order.shipping > 0">
          <span>تكلفة الشحن والتوصيل:</span>
          <strong>{{ (order.shipping || 0).toFixed(2) }} {{ currency }}</strong>
        </div>
        <div class="total-row discount" v-if="order.discount > 0">
          <span>الخصم:</span>
          <strong>-{{ (order.discount || 0).toFixed(2) }} {{ currency }}</strong>
        </div>
        <div class="total-row grand-total">
          <span>الإجمالي النهائي المستحق:</span>
          <strong>{{ (order.total || order.total_amount).toFixed(2) }} {{ currency }}</strong>
        </div>
      </div>

      <!-- Footer -->
      <div class="invoice-footer">
        <p class="footer-thank">شكراً لتسوقكم من ماسترجاز - أجهزة الطهي الإيطالية الأولى في المملكة</p>
        <p class="footer-legal">هذه الفاتورة تم إنشاؤها إلكترونياً وتعد صالحة دون توقيع بموجب أنظمة هيئة الزكاة والضريبة والجمارك (ZATCA).</p>
      </div>

    </div>

    <div v-else-if="!order" class="error-state">
      <p>{{ t('invoice.not_found') }}</p>
      <button class="back-btn" @click="goBack">{{ t('common.back') }}</button>
    </div>

    <!-- Actions -->
    <div class="invoice-actions" v-if="order && !loading">
      <button class="print-btn" @click="printInvoice">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        طباعة الفاتورة الضريبية
      </button>

      <button class="back-btn" @click="goBack">
        {{ t('common.back') }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import api from '../../config/axios'
import { useLocalized } from '../../composables/useLocalized'
import { useSettings } from '../../composables/useSettings'
import { escapeHtml } from '../../utils/sanitize'

export default {
  name: 'InvoiceView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { t, locale } = useI18n()
    const { localized } = useLocalized()
    const { currency } = useSettings()
    const order = ref(null)
    const loading = ref(true)
    const siteLogo = ref('/brand/mastergas-logo.png')
    const siteName = ref('ماسترجاز | Mastergas')

    const fetchSiteInfo = async () => {
      try {
        const isIrisAsset = (val) => {
          if (!val) return false;
          const str = String(val).toLowerCase();
          return str.includes('iris') || str.includes('t3jcwn2n2rvkxvcva') || str.includes('dobvpg934hatbpm5') || str.includes('yugdc4mk4vmsf6el');
        };

        const res = await api.get('/frontend/settings')
        const settings = res.data.data || res.data
        
        const logoVal = settings.find(s => s.key === 'logo')
        if (logoVal && logoVal.value && !isIrisAsset(logoVal.value)) {
          siteLogo.value = logoVal.value.startsWith('http') 
            ? logoVal.value 
            : `${api.defaults.baseURL.replace('/api', '')}/storage/${logoVal.value}`
        } else {
          siteLogo.value = '/brand/mastergas-logo.png'
        }

        const nameVal = settings.find(s => s.key === 'site_name')
        if (nameVal && nameVal.value && !isIrisAsset(nameVal.value)) {
          siteName.value = nameVal.value
        } else {
          siteName.value = 'ماسترجاز | Mastergas'
        }
      } catch (err) {
        console.error('Failed to fetch settings', err)
      }
    }

    const fetchOrder = async () => {
      try {
        const orderId = route.params.id
        // Try to get order from user's orders list
        const res = await api.get('/frontend/orders/me')
        const raw = res.data?.data || res.data || []
        const orders = Array.isArray(raw) ? raw : (Array.isArray(raw.data) ? raw.data : [])
        order.value = orders.find(o => o.id == orderId || o.order_number == orderId)

        // If not found in /orders/me, attempt direct single order lookup
        if (!order.value && orderId) {
          try {
            const singleRes = await api.get(`/frontend/orders/${orderId}`)
            const singleData = singleRes.data?.data || singleRes.data
            if (singleData && typeof singleData === 'object' && !Array.isArray(singleData)) {
              order.value = singleData
            }
          } catch (_) {
            // direct single order lookup not found or guest
          }
        }
      } catch (err) {
        console.error('Failed to fetch order', err)
      } finally {
        loading.value = false
      }
    }

    const printInvoice = () => {
      const isRtl = locale.value === 'ar'
      const dir = isRtl ? 'rtl' : 'ltr'
      const textAlign = isRtl ? 'right' : 'left'
      const totalsMargin = isRtl ? 'margin-right: auto;' : 'margin-left: auto;'
      const safeOrderNumber = escapeHtml(order.value.orderNumber || order.value.order_number || order.value.id)
      const safeInvoiceDate = escapeHtml(order.value.date || new Date().toLocaleDateString('ar-SA'))
      const safePaymentMethod = escapeHtml(order.value.payment_method || 'مدى / فيزا')
      const safeCustomerName = escapeHtml(order.value.customerName || order.value.customer?.name || 'عميل ماسترجاز')
      const safeCustomerPhone = escapeHtml(order.value.customerPhone || order.value.customer?.phone || '-')
      const safeCustomerEmail = escapeHtml(order.value.customerEmail || order.value.customer?.email || '-')
      const safeCustomerAddress = escapeHtml(order.value.customerAddress || order.value.shipping_address || 'المملكة العربية السعودية')
      const safeCurrency = escapeHtml(currency.value ?? currency)
      const subtotalWithoutVat = ((order.value.total || order.value.total_amount || 0) / 1.15).toFixed(2);
      const vatAmount = ((order.value.total || order.value.total_amount || 0) - ((order.value.total || order.value.total_amount || 0) / 1.15)).toFixed(2);
      const grandTotal = (order.value.total || order.value.total_amount || 0).toFixed(2);

      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="${dir}">
        <head>
          <title>فاتورة ضريبية مبسطة - ${safeOrderNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'IBM Plex Sans Arabic', Arial, sans-serif; direction: ${dir}; text-align: ${textAlign}; padding: 30px; background: #ffffff; color: #111827; }
            .badge-tax { display: inline-block; padding: 4px 10px; background: #000000; color: #ffffff; font-size: 11px; font-weight: 700; border-radius: 4px; margin-bottom: 8px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000000; padding-bottom: 20px; margin-bottom: 24px; }
            .title { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
            .subtitle { font-size: 13px; color: #6b7280; margin-bottom: 12px; }
            .tax-details p { font-size: 13px; color: #374151; margin-bottom: 4px; }
            .logo-area { text-align: end; }
            .logo-title { font-size: 26px; font-weight: 900; letter-spacing: 2px; }
            .meta-banner { display: flex; justify-content: space-between; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; font-size: 13px; }
            .customer-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
            .customer-title { font-size: 14px; font-weight: 800; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
            .customer-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { background: #000000; color: #ffffff; padding: 10px 12px; font-size: 13px; text-align: ${textAlign}; }
            td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
            .totals { width: 340px; ${totalsMargin} margin-bottom: 30px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 12px; background: #f9fafb; font-size: 13px; margin-bottom: 4px; border-radius: 4px; }
            .total-row.grand { background: #000000; color: #ffffff; font-size: 15px; font-weight: 800; }
            .footer { text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 12px; color: #6b7280; }
            @media print { body { padding: 15px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <span class="badge-tax">فاتورة ضريبية مبسطة | Simplified Tax Invoice</span>
              <h1 class="title">ماسترجاز لتجارة الأجهزة الإيطالية</h1>
              <p class="subtitle">Mastergas Italian Appliances Trading Est.</p>
              <div class="tax-details">
                <p><strong>الرقم الضريبي (VAT ID):</strong> 301204567800003</p>
                <p><strong>السجل التجاري (CR):</strong> 1010654321</p>
                <p><strong>العنوان:</strong> الرياض - المملكة العربية السعودية</p>
              </div>
            </div>
            <div class="logo-area">
              <div class="logo-title">MASTERGAS</div>
              <div style="font-size: 11px; color: #6b7280; letter-spacing: 1px;">ITALIAN LUXURY APPLIANCES</div>
              <div style="margin-top: 10px; font-size: 11px; font-weight: 700; color: #059669;">معتمد من هيئة ZATCA</div>
            </div>
          </div>

          <div class="meta-banner">
            <div><strong>رقم الفاتورة:</strong> #${safeOrderNumber}</div>
            <div><strong>تاريخ الإصدار:</strong> ${safeInvoiceDate}</div>
            <div><strong>طريقة الدفع:</strong> ${safePaymentMethod}</div>
          </div>

          <div class="customer-box">
            <div class="customer-title">بيانات العميل</div>
            <div class="customer-grid">
              <div><strong>الاسم:</strong> ${safeCustomerName}</div>
              <div><strong>الجوال:</strong> ${safeCustomerPhone}</div>
              <div><strong>البريد:</strong> ${safeCustomerEmail}</div>
              <div><strong>العنوان:</strong> ${safeCustomerAddress}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>سعر الوحدة</th>
                <th>الضريبة (15%)</th>
                <th>الإجمالي شامل الضريبة</th>
              </tr>
            </thead>
            <tbody>
              ${(order.value.items || order.value.products || []).map((item, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${escapeHtml(localized(item.product || item, 'name'))}</td>
                  <td style="text-align: center;">${escapeHtml(item.quantity)}</td>
                  <td style="text-align: center;">${(item.price || item.unit_price).toFixed(2)} ${safeCurrency}</td>
                  <td style="text-align: center;">${(((item.price || item.unit_price) * item.quantity) * 0.15 / 1.15).toFixed(2)} ${safeCurrency}</td>
                  <td style="text-align: end; font-weight: bold;">${((item.price || item.unit_price) * item.quantity).toFixed(2)} ${safeCurrency}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row"><span>المجموع الفرعي (غير شامل الضريبة):</span><strong>${subtotalWithoutVat} ${safeCurrency}</strong></div>
            <div class="total-row"><span>ضريبة القيمة المضافة (15%):</span><strong>${vatAmount} ${safeCurrency}</strong></div>
            ${order.value.shipping > 0 ? `<div class="total-row"><span>الشحن:</span><strong>${(order.value.shipping || 0).toFixed(2)} ${safeCurrency}</strong></div>` : ''}
            <div class="total-row grand"><span>الإجمالي النهائي المستحق:</span><strong>${grandTotal} ${safeCurrency}</strong></div>
          </div>

          <div class="footer">
            <p>شكراً لتعاملكم مع ماسترجاز | هذه الفاتورة صادرة إلكترونياً ومعتمدة نظاماً وفق متطلبات هيئة الزكاة والضريبة والجمارك</p>
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }

    const goBack = () => {
      router.back()
    }

    onMounted(() => {
      fetchSiteInfo()
      fetchOrder()
    })

    return {
      order,
      loading,
      siteLogo,
      siteName,
      currency,
      printInvoice,
      goBack,
      t,
      localized
    }
  }
}
</script>

<style scoped>
.invoice-page {
  background: #f8fafc;
  padding: 40px 20px;
  min-height: 100vh;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
}

.invoice-box {
  background: #ffffff;
  padding: 40px;
  max-width: 900px;
  margin: 0 auto 30px;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  border: 1px solid #e5e7eb;
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 24px;
  border-bottom: 2px solid #000000;
  margin-bottom: 24px;
}

.invoice-badge-tax {
  display: inline-block;
  padding: 4px 12px;
  background: #000000;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  border-radius: 4px;
  margin-bottom: 10px;
}

.invoice-title {
  font-size: 24px;
  font-weight: 900;
  color: #111827;
  margin: 0 0 4px 0;
}

.invoice-company-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 12px 0;
}

.tax-info-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tax-detail-item {
  font-size: 13.5px;
  color: #374151;
  margin: 0;
}

.tax-mono {
  font-family: monospace;
  font-weight: 700;
  color: #111827;
}

.logo-and-qr {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
}

.brand-logo-area {
  text-align: end;
}

.logo-text {
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #000000;
  margin: 0;
}

.logo-sub {
  font-size: 10.5px;
  color: #6b7280;
  letter-spacing: 1.5px;
  font-weight: 700;
  display: block;
}

.zatca-qr-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.zatca-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #059669;
}

.invoice-meta-banner {
  display: flex;
  justify-content: space-between;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 14px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 12px;
  color: #6b7280;
}

.meta-val {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.status-confirmed {
  color: #059669;
}

.invoice-customer {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 18px 20px;
  margin-bottom: 28px;
}

.section-title {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 12px 0;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

.customer-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.customer-info {
  font-size: 13.5px;
  color: #374151;
  margin: 0;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 28px;
}

.invoice-table th {
  background: #000000;
  color: #ffffff;
  padding: 12px 14px;
  font-size: 13.5px;
  font-weight: 700;
  text-align: start;
}

.invoice-table td {
  padding: 14px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13.5px;
  color: #1f2937;
}

.invoice-table tbody tr:nth-child(even) {
  background: #f9fafb;
}

.col-index {
  font-weight: 700;
  color: #9ca3af;
  width: 40px;
}

.prod-title-inv {
  font-weight: 700;
  color: #111827;
}

.prod-warranty-inv {
  font-size: 11.5px;
  color: #059669;
  display: block;
  margin-top: 2px;
}

.invoice-totals {
  width: 360px;
  margin-inline-start: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 30px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 13.5px;
}

.total-row.discount {
  color: #059669;
}

.total-row.grand-total {
  background: #000000;
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;
}

.invoice-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
  text-align: center;
}

.footer-thank {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.footer-legal {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.invoice-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

.print-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 28px;
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.print-btn:hover {
  background: #262626;
  transform: translateY(-1px);
}

.back-btn {
  padding: 12px 24px;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #e5e7eb;
}

.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
  background: #ffffff;
  border-radius: 12px;
  max-width: 500px;
  margin: 40px auto;
  border: 1px solid #e5e7eb;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #000000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .invoice-box { padding: 20px 16px; }
  .invoice-header { flex-direction: column; align-items: stretch; gap: 16px; }
  .logo-and-qr { align-items: flex-start; }
  .customer-info-grid { grid-template-columns: 1fr; }
  .invoice-totals { width: 100%; }
  .invoice-table { display: block; overflow-x: auto; }
}
</style>
