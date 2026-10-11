import { productService } from '../../product/services/productService';

export const offerService = {
  getOffers(params = {}) {
    return productService.getOffers(params);
  },

  getProducts(params = {}) {
    return productService.getProducts(params);
  },
};

