import { calculateBundleCartPricing, cartItemKey } from './useBundlePricing.js';

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export function useCheckoutPricing({ getActiveOfferForProduct, calculatePriceWithOffer }) {
  const getLineTotalWithoutBundle = (item) => {
    const price = Math.max(0, Number(item.price) || 0);
    const discount = Math.max(0, Number(item.discount) || 0);
    if (item.type === 'fixed') {
      return roundMoney(Math.max(0, price - discount) * Math.max(1, Number(item.quantity) || 1));
    }
    return roundMoney(price * (1 - Math.min(100, discount) / 100) * Math.max(1, Number(item.quantity) || 1));
  };

  const getCartPricing = (items = []) => calculateBundleCartPricing({
    items,
    getActiveOfferForProduct,
    getLineTotalWithoutBundle,
  });

  const getItemPriceWithDiscount = (item, allItems = null) => {
    if (Array.isArray(allItems)) {
      const lineTotal = getCartPricing(allItems).lineTotals.get(cartItemKey(item));
      if (lineTotal !== undefined) return lineTotal;
    }

    const offer = getActiveOfferForProduct(item);
    if (offer && offer.type !== 'bundle') {
      const price = calculatePriceWithOffer(item, offer);
      return roundMoney(Math.max(0, price) * Math.max(1, Number(item.quantity) || 1));
    }
    return getLineTotalWithoutBundle(item);
  };

  const getItemUnitPrice = (item, allItems = null) => {
    const lineTotal = getItemPriceWithDiscount(item, allItems);
    return roundMoney(lineTotal / Math.max(1, Number(item.quantity) || 1));
  };

  return { roundMoney, getItemPriceWithDiscount, getItemUnitPrice, getCartPricing };
}
