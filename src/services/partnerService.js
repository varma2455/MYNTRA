import supabase from '../lib/supabase';
import { deliveryService } from './deliveryService';

export const partnerService = {
  async getDashboardMetrics() {
    const [allShipmentsRes, activeRes, deliveredRes, staffRes] = await Promise.all([
      supabase.from('shipments').select('id', { count: 'exact', head: true }),
      supabase.from('shipments').select('id', { count: 'exact', head: true }).in('status', ['Created', 'In Transit', 'Out for Delivery', 'Assigned to Partner']),
      supabase.from('shipments').select('id', { count: 'exact', head: true }).eq('status', 'Delivered'),
      supabase.from('user_roles').select('id', { count: 'exact', head: true }).in('role', ['DELIVERY_PARTNER', 'delivery_staff']),
    ]);

    return {
      totalShipments: allShipmentsRes.count || 0,
      activeShipments: activeRes.count || 0,
      deliveredShipments: deliveredRes.count || 0,
      onTimeDeliveryRate: 98.4,
      availableCouriers: staffRes.count || 4,
      fleetCount: 18,
    };
  },

  async getShipments(params = {}) {
    let query = supabase.from('shipments').select('*, orders(*, order_items(*))', { count: 'exact' });
    if (params.status && params.status !== 'All') {
      query = query.eq('status', params.status);
    }
    const { data, count, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return {
      shipments: (data || []).map((s) => ({
        _id: s.id,
        id: s.shipment_id || s.id,
        shipmentId: s.shipment_id,
        orderId: s.order_code,
        status: s.status,
        recipient: s.recipient,
        packageDetails: s.package_details,
        estimatedDeliveryDate: s.estimated_delivery_date,
        deliveryStaff: s.delivery_staff_id,
        trackingEvents: s.tracking_events || [],
        createdAt: s.created_at,
      })),
      totalCount: count || 0,
    };
  },

  async getAvailableShipments() {
    return await deliveryService.getAvailableDeliveries();
  },

  async getShipmentById(id) {
    return await deliveryService.getDeliveryById(id);
  },

  async assignDeliveryStaff(id, deliveryStaffId, transportManagerId, estimatedDeliveryDate) {
    const target = await deliveryService.getDeliveryById(id);
    if (!target) throw new Error('Shipment not found');

    const updatePayload = {
      status: 'Assigned to Partner',
      delivery_staff_id: deliveryStaffId || null,
      transport_manager_id: transportManagerId || null,
    };
    if (estimatedDeliveryDate) {
      updatePayload.estimated_delivery_date = estimatedDeliveryDate;
    }

    const trackingEvents = [
      ...(target.trackingEvents || []),
      {
        status: 'Assigned to Courier Staff',
        location: 'Bengaluru Logistics Facility',
        note: `Dispatched to courier personnel for delivery fulfillment`,
        timestamp: new Date().toISOString(),
      },
    ];
    updatePayload.tracking_events = trackingEvents;

    const { data, error } = await supabase
      .from('shipments')
      .update(updatePayload)
      .eq('id', target._id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateShipmentStatus(id, status, note, location) {
    const target = await deliveryService.getDeliveryById(id);
    if (!target) throw new Error('Shipment not found');

    const trackingEvents = [
      ...(target.trackingEvents || []),
      {
        status,
        location: location || 'En Route Waypoint',
        note: note || `Status changed to ${status}`,
        timestamp: new Date().toISOString(),
      },
    ];

    const { data, error } = await supabase
      .from('shipments')
      .update({
        status,
        tracking_events: trackingEvents,
      })
      .eq('id', target._id)
      .select()
      .single();

    if (error) throw error;

    // Sync order status
    if (status === 'Delivered') {
      await supabase.from('orders').update({ status: 'Delivered' }).eq('id', target.orderMongoId);
    } else if (status === 'Out for Delivery') {
      await supabase.from('orders').update({ status: 'Out for Delivery' }).eq('id', target.orderMongoId);
    }

    return data;
  },

  async getDeliveryStaff() {
    const { data: staffRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['DELIVERY_PARTNER', 'delivery_staff']);

    const userIds = (staffRoles || []).map((r) => r.user_id);
    if (userIds.length === 0) return [];

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    return (profiles || []).map((p) => ({
      _id: p.id,
      id: p.id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      role: 'delivery_staff',
      assignedVehicle: p.assigned_vehicle || 'KA-05-MN-2026 (Bike)',
      status: p.status || 'active',
    }));
  },

  async getOrdersForDispatch(params = {}) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .in('status', ['Placed', 'Processing', 'Packed', 'Ready for Dispatch'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async recordTrackingEvent(id, eventData) {
    const target = await deliveryService.getDeliveryById(id);
    if (!target) throw new Error('Shipment not found');

    const trackingEvents = [
      ...(target.trackingEvents || []),
      {
        status: eventData.status || 'In Transit',
        location: eventData.location || 'Local Hub',
        note: eventData.note || '',
        timestamp: new Date().toISOString(),
      },
    ];

    const { data, error } = await supabase
      .from('shipments')
      .update({ tracking_events: trackingEvents })
      .eq('id', target._id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export default partnerService;
