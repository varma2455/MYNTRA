import api from './api';

export const wishlistService = {
  async getWishlist() {
    const response = await api.get('/wishlist');
    return response.data;
  },

  async addToWishlist(productId) {
    const response = await api.post('/wishlist', { productId });
    return response.data;
  },

  async removeFromWishlist(productId) {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  },

  async toggleWishlist(productId) {
    const response = await api.post('/wishlist/toggle', { productId });
    return response.data;
  },
};
