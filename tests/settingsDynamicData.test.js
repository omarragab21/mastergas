import test from 'node:test';
import assert from 'node:assert/strict';
import { ref } from 'vue';
import {
  booleanSetting,
  firstSetting,
  settingsToObject,
  vatPercentage,
} from '../website/src/utils/siteSettings.js';
import { useCheckoutTotals } from '../website/src/modules/checkout/composables/useCheckoutTotals.js';

test('site settings normalize the public response and nested social links', () => {
  const settings = settingsToObject({
    data: 'not-used',
    default_shipping_cost: 25,
    vat_percentage: 14,
    social_links: { facebook: 'https://facebook.com/tijara', instagram: 'https://instagram.com/tijara' },
    youtube: null,
  });

  assert.equal(firstSetting(settings, 'default_shipping_cost', 'shipping_cost'), 25);
  assert.equal(vatPercentage(firstSetting(settings, 'vat_percentage', 'tax_rate')), 14);
  assert.equal(settings.facebook, 'https://facebook.com/tijara');
  assert.equal(settings.instagram, 'https://instagram.com/tijara');
  assert.equal(settings.youtube, null);
});

test('site settings support dashboard-shaped wrappers and every social link field', () => {
  const settings = settingsToObject({
    status: true,
    data: {
      settings: [
        { key: 'social_links', value: JSON.stringify({
          whatsapp: '+966500000000',
          facebook: 'https://facebook.com/mastergas',
          instagram: 'https://instagram.com/mastergas',
          x_twitter: 'https://x.com/mastergas',
          linkedin: 'https://linkedin.com/company/mastergas',
          youtube: 'https://youtube.com/@mastergas',
          snapchat: 'https://snapchat.com/add/mastergas',
          tiktok: 'https://tiktok.com/@mastergas',
        }) },
      ],
    },
  });

  assert.equal(settings.whatsapp, '+966500000000');
  assert.equal(settings.facebook, 'https://facebook.com/mastergas');
  assert.equal(settings.instagram, 'https://instagram.com/mastergas');
  assert.equal(settings.x_twitter, 'https://x.com/mastergas');
  assert.equal(settings.linkedin, 'https://linkedin.com/company/mastergas');
  assert.equal(settings.youtube, 'https://youtube.com/@mastergas');
  assert.equal(settings.snapchat, 'https://snapchat.com/add/mastergas');
  assert.equal(settings.tiktok, 'https://tiktok.com/@mastergas');
  assert.deepEqual(settings.social_links, {
    whatsapp: '+966500000000',
    facebook: 'https://facebook.com/mastergas',
    instagram: 'https://instagram.com/mastergas',
    x_twitter: 'https://x.com/mastergas',
    linkedin: 'https://linkedin.com/company/mastergas',
    youtube: 'https://youtube.com/@mastergas',
    snapchat: 'https://snapchat.com/add/mastergas',
    tiktok: 'https://tiktok.com/@mastergas',
  });
});

test('nested social links override null flat aliases from the Site API', () => {
  const settings = settingsToObject({
    facebook: null,
    instagram: null,
    x_twitter: null,
    social_links: JSON.stringify({
      facebook: 'https://facebook.com/mastergas-test',
      instagram: 'https://instagram.com/mastergas-test',
      x_twitter: 'https://x.com/mastergas-test',
    }),
  });

  assert.equal(settings.facebook, 'https://facebook.com/mastergas-test');
  assert.equal(settings.instagram, 'https://instagram.com/mastergas-test');
  assert.equal(settings.x_twitter, 'https://x.com/mastergas-test');
});

test('checkout settings helpers preserve boolean and null behavior', () => {
  assert.equal(booleanSetting('1'), true);
  assert.equal(booleanSetting('0'), false);
  assert.equal(firstSetting({ facebook: null, instagram: 'https://instagram.com/tijara' }, 'facebook', 'instagram'), 'https://instagram.com/tijara');
  assert.equal(vatPercentage(15), 15);
});

test('checkout totals use the API shipping and VAT values', () => {
  const state = {
    cartState: { items: [] },
    settings: ref({ enable_city_shipping: false, default_city_shipping_rate: 0 }),
    cityShippingRate: ref(0),
    freeDeliveryThreshold: ref(33),
    shippingCost: ref(25),
    taxRate: ref(14),
    discountAmount: ref(0),
    useWallet: ref(false),
    walletBalance: ref(0),
    selectedPayment: ref('cod'),
    getCartPricing: () => ({ subtotal: 20 }),
    roundMoney: (value) => Math.round(value * 100) / 100,
  };
  const totals = useCheckoutTotals(state);

  assert.equal(totals.shippingAmount.value, 25);
  assert.equal(totals.taxAmount.value, 2.8);
  assert.equal(totals.grandTotal.value, 47.8);

  const freeShippingTotals = useCheckoutTotals({
    ...state,
    getCartPricing: () => ({ subtotal: 100 }),
  });
  assert.equal(freeShippingTotals.shippingAmount.value, 0);
  assert.equal(freeShippingTotals.taxAmount.value, 14);
  assert.equal(freeShippingTotals.grandTotal.value, 114);
});
