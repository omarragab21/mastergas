import { productService } from '../../product/services/productService';

export const categoryService = {
  getCategories(params = {}, options = {}) {
    return productService.getCategories(params, options);
  },
  getCategoriesWithProductCounts(params = {}, options = {}) {
    return productService.getCategoriesWithProductCounts(params, options);
  },
};
