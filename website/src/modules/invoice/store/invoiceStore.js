import { defineStore } from 'pinia';
import { invoiceService } from '../services/invoiceService';

const isInvalidBrandAsset = (value) => {
  if (!value) return false;
  const normalized = String(value).toLowerCase();
  return normalized.includes('iris')
    || normalized.includes('t3jcwn2n2rvkxvcva')
    || normalized.includes('dobvpg934hatbpm5')
    || normalized.includes('yugdc4mk4vmsf6el');
};

export const useInvoiceStore = defineStore('invoiceFeature', {
  state: () => ({
    order: null,
    loading: true,
    siteLogo: '/brand/mastergas-logo.png',
    siteName: 'ماسترجاز | Mastergas',
  }),

  actions: {
    async load(orderId) {
      this.loading = true;
      const [settingsResult, orderResult] = await Promise.allSettled([
        invoiceService.getSettings(),
        invoiceService.getOrder(orderId),
      ]);

      if (settingsResult.status === 'fulfilled') {
        const settings = settingsResult.value;
        const logo = settings.find((setting) => setting.key === 'logo');
        const siteName = settings.find((setting) => setting.key === 'site_name');
        if (logo?.value && !isInvalidBrandAsset(logo.value)) {
          this.siteLogo = String(logo.value).startsWith('http')
            ? logo.value
            : `/storage/${logo.value}`;
        }
        if (siteName?.value && !isInvalidBrandAsset(siteName.value)) {
          this.siteName = siteName.value;
        }
      }

      this.order = orderResult.status === 'fulfilled' ? orderResult.value : null;
      this.loading = false;
    },
  },
});
