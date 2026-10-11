const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export function useCheckoutPricing({ getActiveOfferForProduct, calculatePriceWithOffer }) {
  const getItemPriceWithDiscount = (item) => {
    const offer = getActiveOfferForProduct(item);
    if (offer) {
      const price = calculatePriceWithOffer(item, offer);
      return roundMoney(Math.max(0, price) * Math.max(1, Number(item.quantity) || 1));
    }

    const price = Math.max(0, Number(item.price) || 0);
    const discount = Math.max(0, Number(item.discount) || 0);
    if (item.type === 'fixed') {
      return roundMoney(Math.max(0, price - discount) * Math.max(1, Number(item.quantity) || 1));
    }
    return roundMoney(price * (1 - Math.min(100, discount) / 100) * Math.max(1, Number(item.quantity) || 1));
  };

  const getItemUnitPrice = (item) => {
    const offer = getActiveOfferForProduct(item);
    if (offer) return roundMoney(Math.max(0, calculatePriceWithOffer(item, offer)));

    const price = Math.max(0, Number(item.price) || 0);
    const discount = Math.max(0, Number(item.discount) || 0);
    if (item.type === 'fixed') return roundMoney(Math.max(0, price - discount));
    return roundMoney(price * (1 - Math.min(100, discount) / 100));
  };

  return { roundMoney, getItemPriceWithDiscount, getItemUnitPrice };
}
