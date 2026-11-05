import api from './api';

export const partnerService = {
  async getDashboardMetrics() {
    const response = await api.get('/admin/reports/transport');
    return response.data?.metrics || response.data;
  },

  async getShipments(params = {}) {
    const response = await api.get('/admin/shipments', { params });
    return response.data;
  },

  async getAvailableShipments() {
    const response = await api.get('/admin/shipments/available');
    return response.data?.shipments || [];
  },

  async getShipmentById(id) {
    const response = await api.get(`/admin/shipments/${id}`);
    return response.data?.shipment || response.data;
  },

  async assignDeliveryStaff(id, deliveryStaffId, transportManagerId, estimatedDeliveryDate) {
    const response = await api.patch(`/admin/shipments/${id}/assign`, {
      deliveryStaffId,
      transportManagerId,
      estimatedDeliveryDate,
    });
    return response.data;
  },

  async updateShipmentStatus(id, status, note, location) {
    const response = await api.patch(`/admin/shipments/${id}/status`, {
      status,
      note,
      location,
    });
    return response.data;
  },

  async getDeliveryStaff() {
    const response = await api.get('/admin/staff');
    const allStaff = response.data?.staff || response.data || [];
    return allStaff.filter((s) => s.role === 'delivery_staff');
  },

  async getOrdersForDispatch(params = {}) {
    const response = await api.get('/admin/orders', { params });
    return response.data?.orders || [];
  },

  async recordTrackingEvent(id, eventData) {
    const response = await api.post(`/admin/shipments/${id}/events`, eventData);
    return response.data;
  },
};
