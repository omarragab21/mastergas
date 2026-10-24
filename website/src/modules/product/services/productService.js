import {
  getCached,
  parseCollectionResponse,
  parseDataResponse,
} from '../../../services/apiClient';
import {
  normalizeSiteCategory,
  normalizeSiteOffer,
  normalizeSiteProduct,
  normalizeSiteReview,
} from '../../../services/siteDataMappers';
import api from '../../../config/axios';
import { isTestProduct, visibleCategories, visibleProducts } from '../../../utils/catalogVisibility.js';
import { isItalianMade, matchesExtraFilters } from '../../../domain/product/productFilters.js';
import { isOfferActive } from '../../../domain/product/offerRules.js';

const cleanParams = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
);

const listFromBody = (body, mapper) => parseCollectionResponse(body).items.map(mapper);

const matchesSearch = (product, query) => {
  if (!query) return true;
  const haystack = [
    product.name_ar,
    product.name_en,
    product.description_ar,
    product.description_en,
    product.slug,
  ].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(String(query).toLowerCase());
};

const sortProducts = (items, sortBy) => {
  const sorted = [...items];
  if (sortBy === 'price_asc') sorted.sort((a, b) => Number(a.sale_price) - Number(b.sale_price));
  if (sortBy === 'price_desc') sorted.sort((a, b) => Number(b.sale_price) - Number(a.sale_price));
  if (sortBy === 'newest' || sortBy === 'created_at') {
    sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }
  return sorted;
};

const paginate = (items, params) => {
  const page = Math.max(1, Number(params.page) || 1);
  const perPage = Math.max(1, Number(params.per_page) || items.length || 1);
  const start = (page - 1) * perPage;
  const total = items.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  return {
    items: items.slice(start, start + perPage),
    total,
    current_page: page,
    last_page: lastPage,
    per_page: perPage,
    meta: { total, current_page: page, last_page: lastPage, per_page: perPage },
    data: items,
    raw: items,
  };
};

// The site API paginates (10 categories / 15 products per page) and ignores per_page,
// so every page must be read or the storefront silently drops the rest.
const MAX_CATALOG_PAGES = 50;
const getAllPagesCached = async (endpoint, params, requestOptions) => {
  const first = await getCached(endpoint, params, requestOptions);
  const firstPage = parseCollectionResponse(first);
  const lastPage = Math.min(firstPage.last_page || 1, MAX_CATALOG_PAGES);
  if (lastPage <= 1) return first;
  const rest = await Promise.all(Array.from({ length: lastPage - 1 }, (_, index) => (
    getCached(endpoint, { ...params, page: index + 2 }, requestOptions)
  )));
  const items = [firstPage.items, ...rest.map((body) => parseCollectionResponse(body).items)].flat();
  const unique = [...new Map(items.map((item) => [String(item?.id ?? Math.random()), item])).values()];
  return { data: unique, meta: { total: unique.length, current_page: 1, last_page: 1, per_page: unique.length } };
};

// A product assigned to a sub-category also belongs to that sub-category's parent.
const productBelongsToCategory = (product, categoryId) => {
  const wanted = String(categoryId);
  return String(product.category_id) === wanted || String(product.category?.parent_id ?? '') === wanted;
};

// Parents first, each followed by its own sub-categories (depth marks the level).
const arrangeCategoryTree = (categories = []) => {
  const ids = new Set(categories.map((category) => String(category.id)));
  const isChild = (category) => category.parent_id !== null && category.parent_id !== undefined && ids.has(String(category.parent_id));
  const parents = categories.filter((category) => !isChild(category));
  return parents.flatMap((parent) => [
    { ...parent, depth: 0 },
    ...categories.filter((category) => isChild(category) && String(category.parent_id) === String(parent.id)).map((child) => ({ ...child, depth: 1 })),
  ]);
};

const fetchProductsEndpoint = async (endpoint, params = {}, options = {}) => {
  const fetchBody = endpoint.endsWith('/all_products') ? getAllPagesCached : getCached;
  const body = await fetchBody(endpoint, cleanParams(params), {
    cache: options.cache,
      refresh: options.refresh,
    signal: options.signal,
    retries: options.retries ?? 2,
    timeout: options.timeout ?? 6000,
  });
  return visibleProducts(listFromBody(body, normalizeSiteProduct));
};

export const productService = {
  async getProducts(params = {}, options = {}) {
    const clean = cleanParams(params);
    // The site API returns the catalog collection; filtering and pagination
    // are already normalized client-side below. Reuse the canonical active
    // catalog request so the products page can consume the response warmed
    // by the home/category sections instead of issuing a second slow query
    // for every sort or filter combination.
    const products = await fetchProductsEndpoint('/v1/site/products/all_products', {
      is_active: clean.is_active ?? 1,
    }, options);
    // "Offers & Discounts" also counts products that belong to an active offer.
    const wantsDiscounted = String(clean.has_discount) === '1' || String(clean.has_offer) === '1';
    let activeOffers = [];
    if (wantsDiscounted) {
      try {
        activeOffers = (await this.getOffers({ is_active: 1 }, options)).filter(isOfferActive);
      } catch {
        activeOffers = [];
      }
    }
    const extraFilters = {
      inStock: String(clean.in_stock) === '1',
      discounted: wantsDiscounted,
      italian: Boolean(clean.origin) && /ital/i.test(String(clean.origin)),
    };
    const filtered = products.filter((product) => {
      if (clean.category_id && !productBelongsToCategory(product, clean.category_id)) return false;
      if (clean.is_active !== undefined && Boolean(product.is_active) !== Boolean(Number(clean.is_active))) return false;
      if (!matchesExtraFilters(product, extraFilters, activeOffers)) return false;
      return matchesSearch(product, clean.search);
    });
    return {
      ...paginate(sortProducts(filtered, clean.sort_by), clean),
      // Whether the catalog has any product with a stated Italian origin, so the
      // page can offer the "Made in Italy" filter only when it can actually apply.
      facets: { italian: products.some(isItalianMade) },
    };
  },

  async getFeaturedProducts(options = {}) {
    return fetchProductsEndpoint('/v1/site/products/featured', {}, options);
  },

  async getNewArrivals(options = {}) {
    return fetchProductsEndpoint('/v1/site/products/new-arrivals', {}, options);
  },

  async getProductById(id, options = {}) {
    const body = await getCached(`/v1/site/products/${encodeURIComponent(id)}`, {}, {
      cache: options.cache,
      refresh: options.refresh,
      lang: options.lang,
      signal: options.signal,
      retries: options.retries ?? 2,
      timeout: options.timeout ?? 6000,
    });
    const product = parseDataResponse(body);
    if (isTestProduct(product)) return null;
    return product && typeof product === 'object' && !Array.isArray(product)
      ? normalizeSiteProduct(product)
      : null;
  },

  async getCategories(params = {}, options = {}) {
    const body = await getAllPagesCached('/v1/site/categories', cleanParams(params), {
      cache: options.cache,
      refresh: options.refresh,
      signal: options.signal,
      retries: options.retries ?? 2,
      timeout: options.timeout ?? 6000,
    });
    return visibleCategories(listFromBody(body, normalizeSiteCategory));
  },

  async getCategoryProductCounts(categories = [], options = {}) {
    const requestOptions = {
      cache: options.cache,
      refresh: options.refresh,
      signal: options.signal,
      retries: options.retries ?? 2,
      timeout: options.timeout ?? 6000,
    };

    try {
      const body = await getAllPagesCached('/v1/site/products/all_products', { is_active: 1 }, requestOptions);
      const collection = parseCollectionResponse(body);
      if (collection.last_page <= 1 || collection.items.length >= collection.total) {
        const counts = collection.items.reduce((result, product) => {
          const categoryId = product.category_id ?? product.category?.id;
          if (categoryId !== null && categoryId !== undefined) {
            const key = String(categoryId);
            result[key] = (result[key] || 0) + 1;
          }
          return result;
        }, {});
        return Object.fromEntries(categories.map((category) => [
          String(category.id), counts[String(category.id)] || 0,
        ]));
      }
    } catch (error) {
      console.error('Failed to fetch all products for category counts:', error);
    }

    const entries = await Promise.all(categories.map(async (category) => {
      const categoryId = category?.id;
      if (categoryId === null || categoryId === undefined || categoryId === '') return null;
      try {
        const body = await getCached('/v1/site/products/all_products', {
          category_id: categoryId,
          is_active: 1,
        }, requestOptions);
        return [String(categoryId), Number(parseCollectionResponse(body).total) || 0];
      } catch (error) {
        console.error(`Failed to fetch product count for category ${categoryId}:`, error);
        return [String(categoryId), Number(category.products_count) || 0];
      }
    }));
    return Object.fromEntries(entries.filter(Boolean));
  },

  async getProductCount(params = {}, options = {}) {
    const body = await getCached('/v1/site/products/all_products', cleanParams(params), {
      cache: options.cache,
      refresh: options.refresh,
      signal: options.signal,
      retries: options.retries ?? 2,
      timeout: options.timeout ?? 6000,
    });
    return Number(parseCollectionResponse(body).total) || 0;
  },

  async getCategoriesWithProductCounts(params = {}, options = {}) {
    const categories = await this.getCategories(params, options);
    const counts = await this.getCategoryProductCounts(categories, options);
    const own = (category) => counts[String(category.id)] ?? (Number(category.products_count) || 0);
    return arrangeCategoryTree(categories).map((category) => ({
      ...category,
      // A main category also counts the products of its sub-categories.
      products_count: category.depth === 0
        ? categories.filter((child) => String(child.parent_id) === String(category.id)).reduce((sum, child) => sum + own(child), own(category))
        : own(category),
    }));
  },

  async getOffers(params = {}, options = {}) {
    const body = await getCached('/v1/site/offers', cleanParams(params), {
      cache: options.cache,
      refresh: options.refresh,
      signal: options.signal,
      retries: options.retries ?? 2,
      timeout: options.timeout ?? 6000,
    });
    return listFromBody(body, normalizeSiteOffer);
  },

  async getProductReviews(productId, options = {}) {
    const body = await getCached(`/v1/site/products/${encodeURIComponent(productId)}`, {}, {
      cache: options.cache,
      refresh: options.refresh,
      signal: options.signal,
      retries: options.retries ?? 2,
      timeout: options.timeout ?? 6000,
    });
    const product = parseDataResponse(body);
    return Array.isArray(product?.reviews) ? product.reviews.map(normalizeSiteReview) : [];
  },

  async submitReview(productId, reviewData = {}) {
    const response = await api.post('/v1/site/reviews', {
      product_id: productId,
      rating: Number(reviewData.rating),
      comment: String(reviewData.comment || '').trim(),
    });
    return response.data;
  },
};

export default productService;
