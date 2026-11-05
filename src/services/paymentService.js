import api from './api';

export const paymentService = {
  async createRazorpayOrder({ amount, orderId, notes = {} }) {
    const response = await api.post('/payments/razorpay/order', { amount, orderId, notes });
    return response.data;
  },

  async verifyRazorpayPayment(payload) {
    const response = await api.post('/payments/razorpay/verify', payload);
    return response.data;
  },
};
