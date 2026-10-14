import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import api, { isCancelledRequest } from '../../../config/axios';
import { cartState } from '../../../store/cart';
import { authState } from '../../../store/auth';
import { useOffers } from './useOffers';
import { useLocalized } from '../../../composables/useLocalized';
import { useSettings } from '../../../composables/useSettings';
import { useSEO } from '../../../composables/useSEO';
import { trackViewContent } from '../../../utils/metaPixel';
import { productService } from '../services/productService';
import { useProductContent } from './useProductContent';
import { useProductVisuals } from './useProductVisuals';
import riyalIcon from '../../../assets/riyal.svg';
export function useProductDetail() {
const { getActiveOfferForProduct, calculatePriceWithOffer, fetchOffers } = useOffers();
const { t, locale } = useI18n();
const { localized, localizedValue } = useLocalized();
const { currency, fetchSettings } = useSettings();

const route = useRoute();
const router = useRouter();

const product = ref(null);
const relatedProducts = ref([]);
const loading = ref(true);
let productController = null;
let productRequestSequence = 0;
const currentImageIndex = ref(0);
const quantity = ref(1);
const selectedAttributes = ref({});
const activeTab = ref('overview');

// Lightbox
const showLightbox = ref(false);
const lightboxIndex = ref(0);

// Share & Review Modals
const showShareModal = ref(false);
const showAddReviewModal = ref(false);
const linkCopied = ref(false);

const shareTo = (platform) => {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(product.value?.name || '');
  
  if (platform === 'whatsapp') {
    window.open(`https://api.whatsapp.com/send?text=${title} - ${url}`, '_blank');
  } else if (platform === 'facebook') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  } else if (platform === 'twitter') {
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
  }
};

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    linkCopied.value = true;
    setTimeout(() => {
      linkCopied.value = false;
      showShareModal.value = false;
    }, 2000);
  });
};

const openLightbox = (index) => {
  lightboxIndex.value = index;
  showLightbox.value = true;
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  showLightbox.value = false;
  document.body.style.overflow = '';
};

const nextLightbox = () => {
  if (lightboxIndex.value < allImages.value.length - 1) {
    lightboxIndex.value++;
  } else {
    lightboxIndex.value = 0;
  }
};

const prevLightbox = () => {
  if (lightboxIndex.value > 0) {
    lightboxIndex.value--;
  } else {
    lightboxIndex.value = allImages.value.length - 1;
  }
};

// Tabs definition matching exact Figma order and titles
const tabOptions = computed(() => {
  return [
    { id: 'overview', label: locale.value === 'ar' ? 'نظرة عامة' : 'Overview' },
    { id: 'specs', label: locale.value === 'ar' ? 'المواصفات الفنية' : 'Technical Specifications' },
    { id: 'installation', label: locale.value === 'ar' ? 'التركيب' : 'Installation' },
    { id: 'shipping', label: locale.value === 'ar' ? 'الشحن والإرجاع' : 'Shipping & Returns' },
    { id: 'reviews', label: locale.value === 'ar' ? 'التقييمات' : 'Reviews' }
  ];
});

watch(tabOptions, (tabs) => {
  if (!Array.isArray(tabs) || tabs.length === 0) return;
  const exists = tabs.some(t => t.id === activeTab.value);
  if (!exists) activeTab.value = tabs[0].id;
}, { immediate: true });

// Multi-Image Gallery
const allImages = computed(() => {
  const images = [];
  const pId = product.value?.id;
  if (product.value?.images && Array.isArray(product.value.images) && product.value.images.length > 0) {
    product.value.images.forEach(img => {
      images.push(getImageUrl(img, pId));
    });
  } else if (product.value?.image) {
    images.push(getImageUrl(product.value.image, pId));
  }

  return images;
});

const getImageUrl = (path, id) => {
  if (typeof path === 'object' && path !== null) {
    path = path.image_url || path.url || path.image || path.path || '';
  }
  if (!path) {
    return '';
  }
  if (typeof path === 'string' && (path.startsWith('http') || path.startsWith('/'))) return path;
  const baseUrl = api.defaults.baseURL || 'https://backend-tijara.be-kite.com/api';
  return `${baseUrl.replace('/api', '')}/storage/${path}`;
};

const handleImageError = (event) => {
  event.target.removeAttribute('src');
};

const formatPrice = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? '2,499' : num.toLocaleString('en-US');
};

// Stock Status logic
const isProductInStock = computed(() => {
  if (!product.value) return true;
  if (product.value.stock !== undefined && product.value.stock !== null) {
    return Number(product.value.stock) > 0;
  }
  if (product.value.quantity !== undefined && product.value.quantity !== null) {
    return Number(product.value.quantity) > 0;
  }
  return true;
});

// Rating & Reviews logic
const reviews = ref([]);

const defaultReviews = computed(() => [
  {
    id: 'def-1',
    user_name: 'أحمد محمد',
    date: locale.value === 'ar' ? '15 أغسطس 2026' : 'August 15, 2026',
    rating: 4,
    comment: locale.value === 'ar' ? 'منتج ممتاز والجودة كانت كما توقعت، التركيب كان سهل والأداء فاق التوقعات.' : 'Excellent product, quality was as expected. Installation was easy and performance exceeded expectations.'
  },
  {
    id: 'def-2',
    user_name: 'سارة العتيبي',
    date: locale.value === 'ar' ? '3 يوليو 2026' : 'July 3, 2026',
    rating: 4,
    comment: locale.value === 'ar' ? 'فرن رائع بتصميم أنيق. الطهي متساوي والحرارة ممتازة. أنصح به بشدة.' : 'Wonderful oven with elegant design. Cooking is even and heat is excellent. Highly recommend.'
  },
  {
    id: 'def-3',
    user_name: 'خالد الشمري',
    date: locale.value === 'ar' ? '22 يونيو 2026' : 'June 22, 2026',
    rating: 4,
    comment: locale.value === 'ar' ? 'أفضل فرن استخدمته. الجودة الإيطالية واضحة في كل التفاصيل. يستحق كل ريال.' : 'Best oven I have used. Italian quality is evident in every detail. Worth every riyal.'
  }
]);

const displayReviews = computed(() => {
  if (Array.isArray(reviews.value) && reviews.value.length > 0) {
    return reviews.value;
  }
  return defaultReviews.value;
});

const computedRatingCount = computed(() => {
  if (product.value?.reviews_count !== undefined && product.value?.reviews_count !== null) {
    return Number(product.value.reviews_count);
  }
  if (Array.isArray(reviews.value) && reviews.value.length > 0) {
    return reviews.value.length;
  }
  return 24;
});

const computedAverageRating = computed(() => {
  if (product.value?.rating !== undefined && product.value?.rating !== null) {
    return Number(product.value.rating);
  }
  if (Array.isArray(reviews.value) && reviews.value.length > 0) {
    const sum = reviews.value.reduce((acc, r) => acc + Number(r.rating || 5), 0);
    return Number((sum / reviews.value.length).toFixed(1));
  }
  return 4.0;
});

const getRatingPercentage = (star) => {
  if (Array.isArray(reviews.value) && reviews.value.length > 0) {
    const count = reviews.value.filter(r => Math.round(Number(r.rating || 5)) === star).length;
    return Math.round((count / reviews.value.length) * 100);
  }
  const map = { 5: 80, 4: 15, 3: 5, 2: 0, 1: 0 };
  return map[star] || 0;
};

const fetchReviews = async (productId) => {
  try {
    const list = await productService.getProductReviews(productId);
    if (Array.isArray(list) && list.length > 0) {
      reviews.value = list;
    }
  } catch (err) {
    console.warn('Reviews API info:', err?.message);
  }
};

const {
  productFeatures,
  dynamicOverviewTitle,
  dynamicOverviewDesc,
  dynamicOverviewFeatures,
  specRows,
  colorOptions,
  selectedColorName,
  selectableAttributes,
  selectColor,
  selectAttribute,
  currentPrice,
} = useProductContent({
  product,
  locale,
  localized,
  selectedAttributes,
  getActiveOfferForProduct,
  calculatePriceWithOffer,
});

const { isLightColor, isColorSpec, getSpecColorsList } = useProductVisuals(colorOptions);
const isFavorite = computed(() => cartState.isInWishlist(product.value?.id));

const toggleFavorite = () => {
  if (product.value) {
    cartState.toggleWishlist(product.value);
  }
};

const handleAddToCart = () => {
  const payload = {
    ...product.value,
    price: currentPrice.value
  };
  cartState.addToCart(payload, quantity.value, selectedAttributes.value);
};

const goToProduct = (p) => {
  router.push(`/product/${p.id}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Fetch product data
const fetchProduct = async (id) => {
  productController?.abort();
  productController = new AbortController();
  const controller = productController;
  const sequence = ++productRequestSequence;
  loading.value = true;
  currentImageIndex.value = 0;
  try {
    const pData = await productService.getProductById(id, { signal: controller.signal });
    if (controller.signal.aborted || sequence !== productRequestSequence) return;
    if (pData && typeof pData === 'object' && !Array.isArray(pData) && pData.id) {
      product.value = pData;
      selectColor(colorOptions.value[0]?.name);

      useSEO({
        title: localized(product.value, 'name'),
        description: localized(product.value, 'description') || `اشتري ${localized(product.value, 'name')} الإيطالي الفاخر من ماسترجاز.`,
        keywords: `${localized(product.value, 'name')}, ماسترجاز, أجهزة غاز إيطالية, Mastergas`,
        image: getImageUrl(product.value.image, product.value.id)
      });

      trackViewContent(product.value, currency.value);
      fetchRelated(product.value.category_id);
    } else {
      product.value = null;
      relatedProducts.value = [];
    }
  } catch (err) {
    if (isCancelledRequest(err) || controller.signal.aborted || sequence !== productRequestSequence) return;
    console.error('Failed to fetch product:', err);
    product.value = null;
    relatedProducts.value = [];
  } finally {
    if (sequence === productRequestSequence) loading.value = false;
  }
};

const fetchRelated = async (categoryId) => {
  try {
    const catId = categoryId || product.value?.category_id || product.value?.category?.id;
    if (catId) {
      const res = await productService.getProducts({ category_id: catId, per_page: 8 });
      const list = res.items || [];
      const filtered = Array.isArray(list) ? list.filter(p => p.id !== product.value?.id).slice(0, 4) : [];
      relatedProducts.value = filtered;
    } else {
      relatedProducts.value = [];
    }
  } catch {
    relatedProducts.value = [];
  }
};

watch(() => route.params.id, (newId) => {
  if (newId) fetchProduct(newId);
});

// Reviews submit logic
const reviewForm = ref({ rating: 5, comment: '' });
const isSubmittingReview = ref(false);
const reviewMessage = ref('');
const reviewStatus = ref('');
const user = computed(() => authState.user || (authState.token ? { logged_in: true } : null));

const submitReview = async () => {
  isSubmittingReview.value = true;
  reviewMessage.value = '';
  try {
    await api.post('/frontend/reviews', {
      product_id: route.params.id,
      rating: reviewForm.value.rating,
      comment: reviewForm.value.comment
    });
    reviewStatus.value = 'success';
    reviewMessage.value = locale.value === 'ar' ? 'شكراً لك! تم إرسال تقييمك بنجاح.' : 'Thank you! Your review has been submitted.';
    if (route.params.id) {
      fetchReviews(route.params.id);
    }
    setTimeout(() => {
      showAddReviewModal.value = false;
    }, 1500);
  } catch {
    reviewStatus.value = 'error';
    reviewMessage.value = locale.value === 'ar' ? 'حدث خطأ أثناء إرسال التقييم.' : 'Error submitting review.';
  } finally {
    isSubmittingReview.value = false;
  }
};

const openLoginModal = () => {
  showAddReviewModal.value = false;
  if (typeof window !== 'undefined' && typeof window.openAuthModal === 'function') {
    window.openAuthModal();
  }
};

const handleAddReviewClick = () => {
  if (user.value) {
    showAddReviewModal.value = true;
    return;
  }
  openLoginModal();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

onMounted(() => {
  if (!authState.token) {
    loading.value = false;
    return;
  }
  fetchOffers();
  fetchSettings();
  if (route.params.id) {
    fetchProduct(route.params.id);
  } else {
    product.value = null;
    relatedProducts.value = [];
    loading.value = false;
  }
});

onUnmounted(() => {
  productController?.abort();
});
  const addToCart = (productToAdd) => cartState.addToCart(productToAdd);
  return {
    t, locale, product, relatedProducts, loading, localized, localizedValue, allImages, currentImageIndex, handleImageError, openLightbox, showLightbox, lightboxIndex, closeLightbox, nextLightbox, prevLightbox, showShareModal, linkCopied, shareTo, copyLink, user, reviewForm, isSubmittingReview, reviewMessage, reviewStatus, openLoginModal, submitReview, showAddReviewModal, tabOptions, activeTab, computedRatingCount, computedAverageRating, formatPrice, currentPrice, currency, riyalIcon, productFeatures, colorOptions, selectedColorName, isLightColor, selectableAttributes, selectedAttributes, isProductInStock, isFavorite, toggleFavorite, selectColor, selectAttribute, quantity, handleAddToCart, addToCart, goToProduct, dynamicOverviewTitle, dynamicOverviewDesc, dynamicOverviewFeatures, specRows, isColorSpec, getSpecColorsList, getRatingPercentage, displayReviews, formatDate, handleAddReviewClick
  };
}
