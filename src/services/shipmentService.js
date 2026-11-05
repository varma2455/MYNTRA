import api from './api';

export const shipmentService = {
  async getShipments(params = {}) {
    const response = await api.get('/admin/shipments', { params });
    return response.data;
  },

  async getShipmentById(id) {
    const response = await api.get(`/admin/shipments/${id}`);
    return response.data;
  },

  async getAvailableShipments() {
    const response = await api.get('/admin/shipments/available');
    return response.data;
  },

  async createShipment(shipmentData) {
    const response = await api.post('/admin/shipments', shipmentData);
    return response.data;
  },

  async updateShipmentStatus(id, status, location, note) {
    const response = await api.patch(`/admin/shipments/${id}/status`, {
      status,
      location,
      note,
    });
    return response.data;
  },

  async recordEvent(id, eventData) {
    const response = await api.post(`/admin/shipments/${id}/events`, eventData);
    return response.data;
  },
};
