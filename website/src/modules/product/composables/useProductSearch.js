import { onUnmounted, ref, watch } from 'vue';
import { isCancelledRequest } from '../../../config/axios';
import { productService } from '../services/productService';
import { API_TTL } from '../../../config/cache';

export function useProductSearch() {
  const query = ref('');
  const results = ref([]);
  const searching = ref(false);
  let controller = null;
  let sequence = 0;
  let timeoutId = null;

  const clearResults = () => {
    controller?.abort();
    results.value = [];
    searching.value = false;
  };

  const performSearch = async () => {
    const normalizedQuery = query.value.trim();
    if (normalizedQuery.length < 2) {
      clearResults();
      return;
    }

    controller?.abort();
    controller = new AbortController();
    const currentController = controller;
    const currentSequence = ++sequence;
    searching.value = true;

    try {
      const result = await productService.getProducts(
        { search: normalizedQuery, per_page: 8, is_active: 1 },
        { signal: currentController.signal, ttl: API_TTL.products }
      );
      if (currentSequence === sequence && !currentController.signal.aborted) {
        results.value = result.items;
      }
    } catch (error) {
      if (isCancelledRequest(error) || currentController.signal.aborted || currentSequence !== sequence) return;
      console.error('Search failed:', error);
      results.value = [];
    } finally {
      if (currentSequence === sequence) searching.value = false;
    }
  };

  watch(query, (value) => {
    clearTimeout(timeoutId);
    if (value.trim().length >= 2) {
      timeoutId = setTimeout(performSearch, 300);
    } else {
      clearResults();
    }
  });

  onUnmounted(() => {
    clearTimeout(timeoutId);
    controller?.abort();
  });

  return {
    query,
    results,
    searching,
    clearResults,
    performSearch,
  };
}
