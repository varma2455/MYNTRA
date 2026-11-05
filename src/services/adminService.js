import api from './api';

export const adminService = {
  // Super Admin Analytics
  async getDashboard() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  async getSalesReport(params = {}) {
    const response = await api.get('/admin/reports/sales', { params });
    return response.data;
  },

  // Catalog Management
  async getProducts(params = {}) {
    const response = await api.get('/admin/products', { params });
    return response.data;
  },

  async createProduct(productData) {
    const response = await api.post('/admin/products', productData);
    return response.data;
  },

  async updateProduct(id, productData) {
    const response = await api.patch(`/admin/products/${id}`, productData);
    return response.data;
  },

  async deleteProduct(id) {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  // Category Management
  async getCategories() {
    const response = await api.get('/admin/categories');
    return response.data;
  },

  async createCategory(categoryData) {
    const response = await api.post('/admin/categories', categoryData);
    return response.data;
  },

  async updateCategory(id, categoryData) {
    const response = await api.patch(`/admin/categories/${id}`, categoryData);
    return response.data;
  },

  async deleteCategory(id) {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },

  // Orders Management (Super Admin & Transport Manager)
  async getOrders(params = {}) {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  async getOrderById(id) {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data;
  },

  async updateOrderStatus(id, status, notes) {
    const response = await api.patch(`/admin/orders/${id}/status`, { status, notes });
    return response.data;
  },

  // User Management
  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async getUserById(id) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  async blockUser(id, reason) {
    const response = await api.patch(`/admin/users/${id}/block`, { reason });
    return response.data;
  },

  async unblockUser(id) {
    const response = await api.patch(`/admin/users/${id}/unblock`);
    return response.data;
  },

  // Staff Management
  async getStaff() {
    const response = await api.get('/admin/staff');
    return response.data;
  },

  async createStaff(staffData) {
    const response = await api.post('/admin/staff', staffData);
    return response.data;
  },

  async updateStaffStatus(id, status) {
    const response = await api.patch(`/admin/staff/${id}/status`, { status });
    return response.data;
  },

  async updateStaffRole(id, role) {
    const response = await api.patch(`/admin/staff/${id}/role`, { role });
    return response.data;
  },

  // Audit Logs
  async getAuditLogs(params = {}) {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  },

  // Transport & Shipments (Transport Manager & Super Admin)
  async getShipments(params = {}) {
    const response = await api.get('/admin/shipments', { params });
    return response.data;
  },

  async createShipment(shipmentData) {
    const response = await api.post('/admin/shipments', shipmentData);
    return response.data;
  },

  async assignShipmentStaff(id, deliveryStaffId) {
    const response = await api.patch(`/admin/shipments/${id}/assign`, { deliveryStaffId });
    return response.data;
  },

  async updateShipmentStatus(id, status, notes) {
    const response = await api.patch(`/admin/shipments/${id}/status`, { status, notes });
    return response.data;
  },

  async recordShipmentEvent(id, eventData) {
    const response = await api.post(`/admin/shipments/${id}/events`, eventData);
    return response.data;
  },

  async getTransportMetrics() {
    const response = await api.get('/admin/reports/transport');
    return response.data;
  },

  // Delivery Staff Portal
  async getDeliveryStaffTasks() {
    const response = await api.get('/admin/shipments/assigned-to-me');
    return response.data;
  },

  async recordDeliveryOutcome(id, outcomeData) {
    const response = await api.post(`/admin/shipments/${id}/delivery-outcome`, outcomeData);
    return response.data;
  },
};
