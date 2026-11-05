import api from './api';

export const deliveryService = {
  async getMyDeliveries() {
    const response = await api.get('/admin/shipments/assigned-to-me');
    return response.data?.tasks || response.data?.shipments || response.data || [];
  },

  async getAvailableDeliveries() {
    const response = await api.get('/admin/shipments/available');
    return response.data?.shipments || [];
  },

  async getDeliveryById(id) {
    const response = await api.get(`/admin/shipments/${id}`);
    return response.data?.shipment || response.data;
  },

  async claimDelivery(id) {
    const response = await api.post(`/admin/shipments/${id}/claim`);
    return response.data;
  },

  async rejectDelivery(id, reason) {
    const response = await api.post(`/admin/shipments/${id}/reject`, { reason });
    return response.data;
  },

  async recordOutcome(id, outcomeData) {
    const response = await api.post(`/admin/shipments/${id}/delivery-outcome`, outcomeData);
    return response.data;
  },
};
