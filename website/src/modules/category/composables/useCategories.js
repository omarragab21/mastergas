import { computed, ref } from 'vue';
import { useLocalized } from '../../../composables/useLocalized';
import { authState } from '../../../store/auth';
import { categoryService } from '../services/categoryService';

export function useCategories() {
  const { currentLang, localized } = useLocalized();
  const rawCategories = ref([]);
  // True until the first API answer (or immediately false when there is no session to ask with).
  const categoriesLoading = ref(Boolean(authState.token));

  const displayCategories = computed(() => {
    if (!rawCategories.value.length) return [];

    return rawCategories.value.map((cat) => {
      const isAr = currentLang.value === 'ar';
      const name = isAr
        ? (cat.name_i18n?.ar || localized(cat, 'name') || cat.name)
        : (cat.name_i18n?.en || cat.name_en || localized(cat, 'name') || cat.name);

      return {
        id: cat.id,
        name,
        countText: isAr ? `${cat.products_count ?? 0} منتجات` : `${cat.products_count ?? 0} Products`,
        image: cat.image || '/images/home/cat_cookers.png',
        link: `/products?category_id=${cat.id}`,
      };
    });
  });

  const fetchCategories = async () => {
    if (!authState.token) {
      categoriesLoading.value = false;
      return;
    }
    categoriesLoading.value = true;
    try {
      const list = await categoryService.getCategoriesWithProductCounts({ is_active: 1 });
      rawCategories.value = Array.isArray(list) ? list : [];
    } catch (error) {
      console.error('Failed to fetch categories from API:', error);
      rawCategories.value = [];
    } finally {
      categoriesLoading.value = false;
    }
  };

  return { rawCategories, displayCategories, categoriesLoading, fetchCategories };
}
