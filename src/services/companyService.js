import api from './api';

export const companyService = {
  async getDashboardStats() {
    const response = await api.get('/company/dashboard/stats');
    return response.data;
  },

  async getOrders(params = {}) {
    const response = await api.get('/company/orders', { params });
    return response.data;
  },

  async getOrderById(id) {
    const response = await api.get(`/company/orders/${id}`);
    return response.data?.order || response.data;
  },

  async processOrder(id, notes) {
    const response = await api.post(`/company/orders/${id}/process`, { notes });
    return response.data;
  },

  async packOrder(id, packData) {
    const response = await api.post(`/company/orders/${id}/pack`, packData);
    return response.data;
  },

  async markReadyForDispatch(id) {
    const response = await api.post(`/company/orders/${id}/ready-to-dispatch`);
    return response.data;
  },

  async getEligibleTravelPartners() {
    const response = await api.get('/company/travel-partners/eligible');
    return response.data?.partners || [];
  },

  async dispatchOrderToPartner(id, dispatchData) {
    const response = await api.post(`/company/orders/${id}/dispatch`, dispatchData);
    return response.data;
  },

  async getShipments(params = {}) {
    const response = await api.get('/company/shipments', { params });
    return response.data;
  },

  async getInventory(params = {}) {
    const response = await api.get('/company/inventory', { params });
    return response.data;
  },

  async flagFulfillmentIssue(data) {
    const response = await api.post('/company/inventory/flag-issue', data);
    return response.data;
  },

  async getReturns() {
    const response = await api.get('/company/returns');
    return response.data?.returns || [];
  },

  async inspectReturn(id, inspectionData) {
    const response = await api.post(`/company/returns/${id}/inspect`, inspectionData);
    return response.data;
  },

  async getNotifications() {
    const response = await api.get('/company/notifications');
    return response.data?.notifications || [];
  },
};
