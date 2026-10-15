import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLocalized } from '../../../composables/useLocalized';
import { isOfferActive } from '../../product/composables/useOffers';
import { productService } from '../../product/services/productService';

export function useOffersCatalog() {
  const router = useRouter();
  const route = useRoute();
  const { currentLang, localized } = useLocalized();

  const offers = ref([]);
  const allProducts = ref([]);
  const loading = ref(true);
  const selectedOfferId = ref(null);
  const currentPage = ref(1);
  const perPage = ref(9);
  const sortBy = ref('relevant');
  
  const backendOrigin = (import.meta.env.VITE_API_BASE_URL || 'https://backend-tijara.be-kite.com/api')
    .replace(/\/api\/?$/, '');
  
  const normalizeOfferImage = (value) => {
    if (!value) return value;
    const raw = String(value);
    if (raw.startsWith('/storage/')) return `${backendOrigin}/public${raw}`;
    if (raw.includes('/storage/') && !raw.includes('/public/storage/')) {
      return raw.replace('/storage/', '/public/storage/');
    }
    return raw;
  };
  
  // Filters
  const inStockOnly = ref(false);
  const hasDiscountOnly = ref(false);
  const italianOnly = ref(false);
  
  
  const currentOffer = computed(() => {
    if (!selectedOfferId.value) return null;
    return offers.value.find(o => String(o.id) === String(selectedOfferId.value)) || null;
  });
  
  // Count products belonging to an offer
  const getOfferCount = (offer) => {
    if (!offer || !allProducts.value.length) return 0;
    if (offer.applies_to === 'categories' && offer.selected_categories?.length) {
      const matched = allProducts.value.filter(p => offer.selected_categories.includes(Number(p.category_id)));
      return matched.length;
    }
    if (offer.applies_to === 'products' && offer.selected_products?.length) {
      const matched = allProducts.value.filter(p => offer.selected_products.includes(Number(p.id)) || offer.selected_products.includes(String(p.id)));
      return matched.length;
    }
    return allProducts.value.length;
  };
  
  // Filtered and Sorted Products
  const filteredProducts = computed(() => {
    let list = [...allProducts.value];
  
    // 1. Filter by Selected Offer
    if (selectedOfferId.value) {
      const offer = offers.value.find(o => String(o.id) === String(selectedOfferId.value));
      if (offer) {
        if (offer.applies_to === 'categories' && offer.selected_categories?.length) {
          list = list.filter(p => offer.selected_categories.includes(Number(p.category_id)));
        } else if (offer.applies_to === 'products' && offer.selected_products?.length) {
          list = list.filter(p => offer.selected_products.includes(Number(p.id)) || offer.selected_products.includes(String(p.id)));
        }
      }
    }
  
    // 2. Extra Filter: In Stock Only
    if (inStockOnly.value) {
      list = list.filter(p => (Number(p.stock) > 0 || Number(p.quantity) > 0));
    }
  
    // 3. Extra Filter: Discounts Only
    if (hasDiscountOnly.value) {
      list = list.filter(p => {
        const price = parseFloat(p.price) || 0;
        const sale = parseFloat(p.sale_price) || 0;
        return (sale > 0 && sale < price) || (parseFloat(p.discount) > 0) || (selectedOfferId.value !== null);
      });
    }
  
    // 4. Extra Filter: Italian Made
    if (italianOnly.value) {
      list = list.filter(p => {
        const origin = p.country_of_manufacture || p.origin || p.country_of_origin || '';
        return origin.includes('إيطال') || origin.toLowerCase().includes('ital');
      });
    }
  
    // 5. Sorting
    if (sortBy.value === 'price_asc') {
      list.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    } else if (sortBy.value === 'price_desc') {
      list.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    } else if (sortBy.value === 'newest') {
      list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
  
    return list;
  });
  
  // Paginated Products
  const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * perPage.value;
    return filteredProducts.value.slice(start, start + perPage.value);
  });
  
  const totalPages = computed(() => {
    return Math.ceil(filteredProducts.value.length / perPage.value) || 1;
  });
  
  const selectOffer = (id) => {
    selectedOfferId.value = id;
    currentPage.value = 1;
    if (id) {
      router.replace({ query: { ...route.query, offer: id } });
    } else {
      const q = { ...route.query };
      delete q.offer;
      delete q.id;
      router.replace({ query: q });
    }
  };
  
  const goToProduct = (product) => {
    router.push(`/product/${product.id}`);
  };
  
  const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const resolveOfferFromQuery = () => {
    const queryOffer = route.query.offer || route.query.id;
    if (!queryOffer) {
      return;
    }
    const found = offers.value.find(o => 
      String(o.id) === String(queryOffer) ||
      String(o.id).replace('-pro', '') === String(queryOffer).replace('-pro', '').replace('pro-', '') ||
      String(o.id).replace('pro-', '') === String(queryOffer).replace('pro-', '').replace('-pro', '')
    );
    if (found) {
      selectedOfferId.value = found.id;
    }
  };
  
  const fetchOffers = async () => {
    try {
      const result = await productService.getOffers({ is_active: 1 });
      offers.value = (Array.isArray(result) ? result : []).filter(isOfferActive).map((offer) => ({
        ...offer,
        image: normalizeOfferImage(offer.image),
      }));
    } catch (err) {
      console.error('Failed to fetch offers from API:', err);
      offers.value = [];
    }
  };
  
  const fetchProducts = async () => {
    loading.value = true;
    const safetyTimer = setTimeout(() => {
      loading.value = false;
    }, 4000);
    try {
      const result = await productService.getProducts({ per_page: 50, is_active: 1 });
      allProducts.value = Array.isArray(result.items) ? result.items : [];
    } catch (err) {
      console.error('Failed to fetch products for offers from API:', err);
      allProducts.value = [];
    } finally {
      clearTimeout(safetyTimer);
      loading.value = false;
    }
  };
  
  watch(() => route.query.offer, () => {
    resolveOfferFromQuery();
  });

  return {
    currentLang,
    localized,
    offers,
    allProducts,
    loading,
    selectedOfferId,
    currentPage,
    perPage,
    sortBy,
    inStockOnly,
    hasDiscountOnly,
    italianOnly,
    currentOffer,
    getOfferCount,
    filteredProducts,
    paginatedProducts,
    totalPages,
    selectOffer,
    goToProduct,
    changePage,
    resolveOfferFromQuery,
    fetchOffers,
    fetchProducts,
  };
}
