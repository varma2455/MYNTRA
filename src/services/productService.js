import api from './api';

export const productService = {
  async getProducts(params = {}) {
    const response = await api.get('/products', { params });
    return response.data;
  },

  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async getCategories() {
    const response = await api.get('/categories');
    return response.data;
  },

  async getCategoryById(id) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  async getBrands() {
    const response = await api.get('/brands');
    return response.data;
  },

  async getHomeFeed() {
    const response = await api.get('/home');
    return response.data;
  },

  async addReview(productId, reviewData) {
    try {
      const response = await api.post(`/products/${productId}/reviews`, reviewData);
      return response.data;
    } catch (err) {
      const response = await api.post(`/products/${productId}/review`, reviewData);
      return response.data;
    }
  },
};
