const numeric = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const quantity = (item) => Math.max(1, Math.floor(numeric(item?.quantity, 1)));

export const cartItemKey = (item, index = 0) => String(item?.cart_item_key || item?.id || `line-${index}`);

const productId = (item) => numeric(item?.product_id ?? item?.product?.id ?? item?.id, 0);

const isBundle = (offer) => Boolean(
  offer &&
  (offer.type === 'bundle' || numeric(offer.bundle_price, 0) > 0) &&
  numeric(offer.id, 0) > 0
);

const offerRequirements = (offer) => {
  if (Array.isArray(offer?.items) && offer.items.length > 0) {
    return offer.items
      .map((item) => ({ productId: productId(item), quantity: Math.max(1, Math.floor(numeric(item.quantity, 1))) }))
      .filter((item) => item.productId > 0);
  }

  return (Array.isArray(offer?.selected_products) ? offer.selected_products : [])
    .map((id) => ({ productId: numeric(id, 0), quantity: 1 }))
    .filter((item) => item.productId > 0);
};

const roundMoney = (value) => Math.round((numeric(value) + Number.EPSILON) * 100) / 100;

/**
 * Mirrors the backend bundle rule:
 * - a bundle is eligible only when all required product quantities exist;
 * - bundle_price is charged once per complete bundle;
 * - extra quantities stay at their normal product price.
 *
 * Line totals are allocated proportionally only for display. The aggregate
 * subtotal is always exactly bundle_price * bundleCount plus any remainder.
 */
export const calculateBundleCartPricing = ({
  items = [],
  getActiveOfferForProduct,
  getLineTotalWithoutBundle,
}) => {
  const lines = Array.isArray(items) ? items : [];
  const lineTotals = new Map();
  const baseTotals = new Map();
  const offersById = new Map();

  lines.forEach((item, index) => {
    const key = cartItemKey(item, index);
    const baseTotal = roundMoney(Math.max(0, numeric(getLineTotalWithoutBundle(item), 0)));
    baseTotals.set(key, baseTotal);
    lineTotals.set(key, baseTotal);

    const offer = getActiveOfferForProduct?.(item);
    if (isBundle(offer)) {
      const offerId = String(offer.id);
      if (!offersById.has(offerId)) offersById.set(offerId, { offer, lines: [] });
      offersById.get(offerId).lines.push({ item, index, key });
    }
  });

  const appliedBundles = [];

  for (const { offer, lines: offerLines } of offersById.values()) {
    const requirements = offerRequirements(offer);
    if (!requirements.length) continue;

    const available = new Map();
    offerLines.forEach(({ item }) => {
      const id = productId(item);
      available.set(id, (available.get(id) || 0) + quantity(item));
    });

    const bundleCount = Math.min(...requirements.map((required) => Math.floor(
      (available.get(required.productId) || 0) / required.quantity
    )));
    if (!Number.isFinite(bundleCount) || bundleCount < 1) continue;

    const bundlePrice = roundMoney(numeric(offer.bundle_price, 0) * bundleCount);
    if (bundlePrice <= 0) continue;

    const remainingBundleQuantity = new Map(
      requirements.map((required) => [required.productId, required.quantity * bundleCount])
    );
    const eligibleLines = [];

    for (const line of offerLines) {
      const id = productId(line.item);
      const remaining = remainingBundleQuantity.get(id) || 0;
      const bundleQuantity = Math.min(quantity(line.item), remaining);
      if (bundleQuantity > 0) {
        const unitBase = baseTotals.get(line.key) / quantity(line.item);
        eligibleLines.push({
          ...line,
          bundleQuantity,
          baseEligibleTotal: roundMoney(unitBase * bundleQuantity),
        });
        remainingBundleQuantity.set(id, remaining - bundleQuantity);
      }
    }

    const eligibleBaseTotal = eligibleLines.reduce((sum, line) => sum + line.baseEligibleTotal, 0);
    if (eligibleBaseTotal <= 0) continue;

    let allocated = 0;
    eligibleLines.forEach((line, index) => {
      const isLast = index === eligibleLines.length - 1;
      const allocation = isLast
        ? roundMoney(bundlePrice - allocated)
        : roundMoney(bundlePrice * (line.baseEligibleTotal / eligibleBaseTotal));
      allocated = roundMoney(allocated + allocation);

      const baseTotal = baseTotals.get(line.key) || 0;
      const remainder = roundMoney(baseTotal - line.baseEligibleTotal);
      lineTotals.set(line.key, roundMoney(remainder + allocation));
    });

    appliedBundles.push({ offerId: Number(offer.id), bundleCount, bundlePrice });
  }

  const subtotal = roundMoney([...lineTotals.values()].reduce((sum, value) => sum + value, 0));
  return { subtotal, lineTotals, appliedBundles };
};
