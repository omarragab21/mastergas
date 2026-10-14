import { productService } from '../../product/services/productService';

export const categoryService = {
  getCategories(params = {}) {
    return productService.getCategories(params);
  },
  getCategoriesWithProductCounts(params = {}) {
    return productService.getCategoriesWithProductCounts(params);
  },
};
