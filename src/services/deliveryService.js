import supabase from '../lib/supabase';

const mapShipment = (s) => {
  if (!s) return null;
  return {
    _id: s.id,
    id: s.shipment_id || s.id,
    shipmentId: s.shipment_id,
    orderId: s.order_code,
    orderMongoId: s.order_id,
    order: s.orders ? {
      _id: s.orders.id,
      orderId: s.orders.order_id,
      total: s.orders.total,
      paymentMethod: s.orders.payment_method,
      paymentStatus: s.orders.payment_status,
      shippingAddress: s.orders.shipping_address,
      items: s.orders.order_items || [],
    } : null,
    transportManager: s.transport_manager_id,
    deliveryStaff: s.delivery_staff_id,
    status: s.status,
    packageDetails: s.package_details || {
      weightKg: 0.5,
      packageCount: 1,
      warehouse: 'Warehouse BNG-01 (Electronic City)',
      priority: 'Standard',
      serviceLevel: 'Road Surface Express',
    },
    recipient: s.recipient || {},
    originHub: s.origin_hub || { facility: 'Bengaluru Central Fulfillment Hub', city: 'Bengaluru' },
    destinationHub: s.destination_hub || {},
    vehicleInfo: s.vehicle_info || { vehicleType: 'Bike', vehicleNumber: 'KA-05-MN-2026' },
    estimatedDeliveryDate: s.estimated_delivery_date || 'Expected today',
    deliveryOtp: s.delivery_otp || '',
    isOtpVerified: !!s.is_otp_verified,
    trackingEvents: s.tracking_events || [],
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  };
};

export const deliveryService = {
  async getMyDeliveries() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('shipments')
      .select('*, orders(*, order_items(*))')
      .eq('delivery_staff_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error in getMyDeliveries:', error);
      throw error;
    }
    return (data || []).map(mapShipment);
  },

  async getAvailableDeliveries() {
    const { data, error } = await supabase
      .from('shipments')
      .select('*, orders(*, order_items(*))')
      .or('delivery_staff_id.is.null,status.in.(Pending Assignment,Created,Assigned to Partner,Awaiting Pickup)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error in getAvailableDeliveries:', error);
      throw error;
    }
    return (data || []).map(mapShipment);
  },

  async getDeliveryById(id) {
    let query = supabase.from('shipments').select('*, orders(*, order_items(*))');
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      query = query.eq('id', id);
    } else {
      query = query.eq('shipment_id', id);
    }

    const { data, error } = await query.maybeSingle();
    if (error || !data) throw new Error('Shipment not found');
    return mapShipment(data);
  },

  async claimDelivery(id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const target = await this.getDeliveryById(id);
    if (!target) throw new Error('Shipment not found');

    const trackingEvents = [
      ...(target.trackingEvents || []),
      {
        status: 'Assigned to Courier',
        location: 'Bengaluru South Hub',
        note: `Shipment claimed by delivery staff (${user.email})`,
        timestamp: new Date().toISOString(),
      },
    ];

    const { data, error } = await supabase
      .from('shipments')
      .update({
        delivery_staff_id: user.id,
        status: 'Out for Delivery',
        tracking_events: trackingEvents,
      })
      .eq('id', target._id)
      .select('*, orders(*)')
      .single();

    if (error) throw error;

    // Update order status
    await supabase
      .from('orders')
      .update({ status: 'Out for Delivery' })
      .eq('id', target.orderMongoId);

    return mapShipment(data);
  },

  async rejectDelivery(id, reason = 'Staff unavailable') {
    const target = await this.getDeliveryById(id);
    if (!target) throw new Error('Shipment not found');

    const { data, error } = await supabase
      .from('shipments')
      .update({
        delivery_staff_id: null,
        status: 'Pending Assignment',
        failure_reason: reason,
      })
      .eq('id', target._id)
      .select()
      .single();

    if (error) throw error;
    return mapShipment(data);
  },

  async recordOutcome(id, outcomeData) {
    const { data: { user } } = await supabase.auth.getUser();
    const target = await this.getDeliveryById(id);
    if (!target) throw new Error('Shipment not found');

    const outcome = outcomeData.status || outcomeData.outcome;
    const isDelivered = outcome === 'Delivered' || outcome === 'delivered';

    if (isDelivered) {
      // Verify OTP if submitted
      if (outcomeData.otp && target.deliveryOtp && outcomeData.otp.trim() !== target.deliveryOtp.trim()) {
        const err = new Error('Invalid delivery OTP. Please verify with the recipient.');
        err.response = { data: { message: err.message } };
        throw err;
      }

      const trackingEvents = [
        ...(target.trackingEvents || []),
        {
          status: 'Delivered',
          location: target.recipient?.city || 'Bengaluru',
          note: outcomeData.notes || 'Package handed over to recipient. OTP verified.',
          timestamp: new Date().toISOString(),
        },
      ];

      const { data, error } = await supabase
        .from('shipments')
        .update({
          status: 'Delivered',
          is_otp_verified: true,
          delivery_timestamp: new Date().toISOString(),
          delivery_notes: outcomeData.notes || '',
          tracking_events: trackingEvents,
          proof_of_delivery: {
            notes: outcomeData.notes || '',
            recipientSignature: outcomeData.signature || 'Digital Sign-off',
            verifiedWithRecipient: true,
          },
        })
        .eq('id', target._id)
        .select()
        .single();

      if (error) throw error;

      // Update Order Status & Payment Status
      await supabase
        .from('orders')
        .update({
          status: 'Delivered',
          is_otp_verified: true,
          payment_status: 'completed',
        })
        .eq('id', target.orderMongoId);

      // Update Delivery Partner stats
      if (user) {
        const { data: dp } = await supabase
          .from('delivery_partners')
          .select('total_deliveries, successful_deliveries, total_earnings')
          .eq('user_id', user.id)
          .maybeSingle();

        if (dp) {
          await supabase
            .from('delivery_partners')
            .update({
              total_deliveries: (dp.total_deliveries || 0) + 1,
              successful_deliveries: (dp.successful_deliveries || 0) + 1,
              total_earnings: (Number(dp.total_earnings) || 0) + 65,
              status: 'Available',
            })
            .eq('user_id', user.id);
        }
      }

      return mapShipment(data);
    } else {
      // Delivery Failed
      const trackingEvents = [
        ...(target.trackingEvents || []),
        {
          status: 'Delivery Failed',
          location: target.recipient?.city || 'Bengaluru',
          note: outcomeData.reason || outcomeData.notes || 'Attempt failed',
          timestamp: new Date().toISOString(),
        },
      ];

      const { data, error } = await supabase
        .from('shipments')
        .update({
          status: 'Delivery Failed',
          failure_reason: outcomeData.reason || outcomeData.notes || 'Attempt failed',
          tracking_events: trackingEvents,
        })
        .eq('id', target._id)
        .select()
        .single();

      if (error) throw error;
      return mapShipment(data);
    }
  },
};

export default deliveryService;
