import api from './api';

export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  async addAddress(addressData) {
    const response = await api.post('/auth/addresses', addressData);
    return response.data;
  },

  async deleteAddress(addressId) {
    const response = await api.delete(`/auth/addresses/${addressId}`);
    return response.data;
  },

  async setDefaultAddress(addressId) {
    const response = await api.patch(`/auth/addresses/${addressId}/default`);
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
};
