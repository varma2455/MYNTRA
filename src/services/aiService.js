import api from './api';

export const aiService = {
  async naturalLanguageSearch(query, limit = 20) {
    const response = await api.get('/ai/search', { params: { q: query, limit } });
    return response.data;
  },

  async getOutfitRecommendation(productId) {
    const response = await api.get(`/ai/outfit/${productId}`);
    return response.data;
  },

  async chatSupport(message, history = []) {
    const response = await api.post('/ai/chat', { message, history });
    return response.data;
  },

  async getPersonalizedRecommendations(params = {}) {
    const response = await api.get('/ai/recommendations', { params });
    return response.data;
  },
};
