import api from './api';

export const orderService = {
  async createOrder(orderData, idempotencyKey) {
    const headers = {};
    if (idempotencyKey) {
      headers['x-idempotency-key'] = idempotencyKey;
    }
    const response = await api.post('/orders', orderData, { headers });
    return response.data;
  },

  async getMyOrders() {
    const response = await api.get('/orders');
    return response.data;
  },

  async getOrderById(orderId) {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  async cancelOrder(orderId, reason) {
    const response = await api.patch(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  async requestReturn(orderId, { reason, comment }) {
    const response = await api.post(`/orders/${orderId}/return`, { reason, comment });
    return response.data;
  },
};
