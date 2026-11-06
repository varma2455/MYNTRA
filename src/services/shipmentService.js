import supabase from '../lib/supabase';
import { deliveryService } from './deliveryService';
import { partnerService } from './partnerService';

export const shipmentService = {
  async getShipments(params = {}) {
    return await partnerService.getShipments(params);
  },

  async getShipmentById(id) {
    return await deliveryService.getDeliveryById(id);
  },

  async getAvailableShipments() {
    return await deliveryService.getAvailableDeliveries();
  },

  async createShipment(shipmentData) {
    const { data, error } = await supabase
      .from('shipments')
      .insert({
        shipment_id: shipmentData.shipmentId || `SHP-${Date.now().toString(36).toUpperCase()}`,
        order_id: shipmentData.orderId,
        order_code: shipmentData.orderCode || 'MYN-PRO',
        recipient: shipmentData.recipient,
        package_details: shipmentData.packageDetails || {},
        status: shipmentData.status || 'Created',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateShipmentStatus(id, status, location, note) {
    return await partnerService.updateShipmentStatus(id, status, note, location);
  },

  async recordEvent(id, eventData) {
    return await partnerService.recordTrackingEvent(id, eventData);
  },
};

export default shipmentService;
