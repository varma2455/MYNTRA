import api from './api';

export const cartService = {
  async getCart() {
    const response = await api.get('/cart');
    return response.data;
  },

  async addToCart({ productId, selectedSize, selectedColor, quantity = 1 }) {
    const response = await api.post('/cart', {
      productId,
      selectedSize,
      selectedColor,
      quantity,
    });
    return response.data;
  },

  async updateCartItem(itemId, { quantity, selectedSize }) {
    const response = await api.put(`/cart/${itemId}`, {
      quantity,
      selectedSize,
    });
    return response.data;
  },

  async removeFromCart(itemId) {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data;
  },

  async clearCart() {
    const response = await api.delete('/cart');
    return response.data;
  },

  async applyCoupon({ code, cartSubtotal }) {
    const response = await api.post('/cart/coupon', { code, cartSubtotal });
    return response.data;
  },

  async getCoupons() {
    const response = await api.get('/coupons');
    return response.data;
  },
};
