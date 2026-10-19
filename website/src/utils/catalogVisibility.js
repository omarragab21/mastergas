// Keep QA/test records out of the customer-facing catalog until they are
// explicitly approved for publication. This is presentation-only filtering;
// it does not delete or modify records in the backend.
const TEST_PRODUCT_IDS = new Set([42, 55]);
const TEST_CATEGORY_IDS = new Set([61]);

const searchableText = (record = {}) => [
  record.name,
  record.name_ar,
  record.name_en,
  record.slug,
  record.sku,
].filter(Boolean).join(' ').toLowerCase();

export const isTestProduct = (product = {}) => {
  const id = Number(product.id ?? product.product_id);
  if (TEST_PRODUCT_IDS.has(id)) return true;
  return /(?:^|\s)(?:test|qa)(?:\s|$)|single-stock-qa|single stock qa/i.test(searchableText(product));
};

export const isTestCategory = (category = {}) => {
  const id = Number(category.id ?? category.category_id);
  if (TEST_CATEGORY_IDS.has(id)) return true;
  return /(?:^|\s)test(?:\s|$)/i.test(searchableText(category));
};

export const visibleProducts = (products = []) => products.filter((product) => !isTestProduct(product));
export const visibleCategories = (categories = []) => categories.filter((category) => !isTestCategory(category));
