import {
  API_TTL,
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

const fetchProductsEndpoint = async (endpoint, params = {}, options = {}) => {
  const body = await getCached(endpoint, cleanParams(params), {
    ttl: options.ttl ?? API_TTL.products,
    signal: options.signal,
    retries: options.retries ?? 2,
    timeout: options.timeout ?? 6000,
  });
  return listFromBody(body, normalizeSiteProduct);
};

export const productService = {
  async getProducts(params = {}, options = {}) {
    const clean = cleanParams(params);
    const products = await fetchProductsEndpoint('/v1/site/products/all_products', clean, options);
    const filtered = products.filter((product) => {
      if (clean.category_id && String(product.category_id) !== String(clean.category_id)) return false;
      if (clean.is_active !== undefined && Boolean(product.is_active) !== Boolean(Number(clean.is_active))) return false;
      if (String(clean.has_discount) === '1' && !product.has_discount) return false;
      if (String(clean.in_stock) === '1' && product.stock !== undefined && Number(product.stock) <= 0) return false;
      return matchesSearch(product, clean.search);
    });
    return paginate(sortProducts(filtered, clean.sort_by), clean);
  },

  async getFeaturedProducts(options = {}) {
    return fetchProductsEndpoint('/v1/site/products/featured', {}, options);
  },

  async getNewArrivals(options = {}) {
    return fetchProductsEndpoint('/v1/site/products/new-arrivals', {}, options);
  },

  async getProductById(id, options = {}) {
    const body = await getCached(`/v1/site/products/${encodeURIComponent(id)}`, {}, {
      ttl: options.ttl ?? API_TTL.productDetail,
      signal: options.signal,
      retries: options.retries ?? 2,
      timeout: options.timeout ?? 6000,
    });
    const product = parseDataResponse(body);
    return product && typeof product === 'object' && !Array.isArray(product)
      ? normalizeSiteProduct(product)
      : null;
  },

  async getCategories(params = {}, options = {}) {
    const body = await getCached('/v1/site/categories', cleanParams(params), {
      ttl: options.ttl ?? API_TTL.categories,
      signal: options.signal,
      retries: options.retries ?? 2,
      timeout: options.timeout ?? 6000,
    });
    return listFromBody(body, normalizeSiteCategory);
  },

  async getCategoryProductCounts(categories = [], options = {}) {
    const requestOptions = {
      ttl: options.ttl ?? API_TTL.products,
      signal: options.signal,
      retries: options.retries ?? 2,
      timeout: options.timeout ?? 6000,
    };

    try {
      const body = await getCached('/v1/site/products/all_products', { is_active: 1 }, requestOptions);
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
      ttl: options.ttl ?? API_TTL.products,
      signal: options.signal,
      retries: options.retries ?? 2,
      timeout: options.timeout ?? 6000,
    });
    return Number(parseCollectionResponse(body).total) || 0;
  },

  async getCategoriesWithProductCounts(params = {}, options = {}) {
    const categories = await this.getCategories(params, options);
    const counts = await this.getCategoryProductCounts(categories, options);
    return categories.map((category) => ({
      ...category,
      products_count: counts[String(category.id)] ?? (Number(category.products_count) || 0),
    }));
  },

  async getOffers(params = {}, options = {}) {
    const body = await getCached('/v1/site/offers', cleanParams(params), {
      ttl: options.ttl ?? API_TTL.offers,
      signal: options.signal,
      retries: options.retries ?? 2,
      timeout: options.timeout ?? 6000,
    });
    return listFromBody(body, normalizeSiteOffer);
  },

  async getProductReviews(productId, options = {}) {
    const body = await getCached(`/v1/site/products/${encodeURIComponent(productId)}`, {}, {
      ttl: options.ttl ?? API_TTL.productDetail,
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
