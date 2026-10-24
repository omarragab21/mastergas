import { computed, ref } from 'vue';
import { useLocalized } from '../../../composables/useLocalized';
import { categoryService } from '../services/categoryService';

export function useCategories() {
  const { currentLang, localized } = useLocalized();
  const rawCategories = ref([]);
  // Categories are public catalog data and must load for guest visitors too.
  const categoriesLoading = ref(true);

  const displayCategories = computed(() => {
    if (!rawCategories.value.length) return [];

    return rawCategories.value.filter((cat) => !cat.parent_id).map((cat) => {
      const isAr = currentLang.value === 'ar';
      const name = isAr
        ? (cat.name_i18n?.ar || localized(cat, 'name') || cat.name)
        : (cat.name_i18n?.en || cat.name_en || localized(cat, 'name') || cat.name);

      return {
        id: cat.id,
        name,
        countText: isAr ? `${cat.products_count ?? 0} منتجات` : `${cat.products_count ?? 0} Products`,
        image: cat.image || '',
        link: `/products?category_id=${cat.id}`,
      };
    });
  });

  // options.refresh: a background refresh, so keep the current list on screen
  // (no skeleton) and keep it if the request fails.
  const fetchCategories = async (options = {}) => {
    if (!options.refresh) categoriesLoading.value = true;
    try {
      const list = await categoryService.getCategoriesWithProductCounts({ is_active: 1 }, options);
      rawCategories.value = Array.isArray(list) ? list : [];
    } catch (error) {
      console.error('Failed to fetch categories from API:', error);
      if (!options.refresh) rawCategories.value = [];
    } finally {
      categoriesLoading.value = false;
    }
  };

  return { rawCategories, displayCategories, categoriesLoading, fetchCategories };
}
