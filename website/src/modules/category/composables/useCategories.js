import { computed, ref } from 'vue';
import { useLocalized } from '../../../composables/useLocalized';
import { categories as fallbackCategories } from '../../../data/catalogData';
import { categoryService } from '../services/categoryService';

export function useCategories() {
  const { currentLang, localized } = useLocalized();
  const rawCategories = ref([]);

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
    try {
      const list = await categoryService.getCategories({ is_active: 1 });
      rawCategories.value = Array.isArray(list) && list.length > 0 ? list : fallbackCategories;
    } catch (error) {
      console.error('Failed to fetch categories from API:', error);
      rawCategories.value = fallbackCategories;
    }
  };

  return { rawCategories, displayCategories, fetchCategories };
}

