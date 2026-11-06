import supabase from '../lib/supabase';
import { orderService } from './orderService';

export const companyService = {
  async getDashboardStats() {
    const [ordersCount, pendingDispatch, totalShipments, inventoryAlerts] = await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }).in('status', ['Processing', 'Packed', 'Ready for Dispatch']),
      supabase.from('shipments').select('id', { count: 'exact', head: true }),
      supabase.from('inventory').select('id', { count: 'exact', head: true }).lte('quantity', 10),
    ]);

    return {
      totalOrders: ordersCount.count || 0,
      pendingFulfillment: pendingDispatch.count || 0,
      activeShipments: totalShipments.count || 0,
      inventoryAlerts: inventoryAlerts.count || 0,
      fulfillmentRate: 99.2,
      averageProcessingTimeHours: 4.5,
    };
  },

  async getOrders(params = {}) {
    let query = supabase.from('orders').select('*, order_items(*)');
    if (params.status && params.status !== 'All') {
      query = query.eq('status', params.status);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return {
      orders: (data || []).map((o) => ({
        _id: o.id,
        id: o.order_id || o.id,
        orderId: o.order_id,
        status: o.status,
        total: Number(o.total),
        shippingAddress: o.shipping_address,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        items: o.order_items || [],
        createdAt: o.created_at,
      })),
    };
  },

  async getOrderById(id) {
    return await orderService.getOrderById(id);
  },

  async processOrder(id, notes) {
    const target = await orderService.getOrderById(id);
    const statusHistory = [
      ...(target.statusHistory || []),
      {
        status: 'Processing',
        timestamp: new Date().toISOString(),
        comment: notes || 'Warehouse began fulfillment picking',
        updatedBy: 'Company Fulfillment Staff',
      },
    ];

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'Processing',
        status_history: statusHistory,
      })
      .eq('id', target._id)
      .select('*, order_items(*)')
      .single();

    if (error) throw error;
    return { order: data };
  },

  async packOrder(id, packData) {
    const target = await orderService.getOrderById(id);
    const statusHistory = [
      ...(target.statusHistory || []),
      {
        status: 'Packed',
        timestamp: new Date().toISOString(),
        comment: packData?.notes || 'Box sealed and verified with tamper-proof security tape',
        updatedBy: 'Company Fulfillment Staff',
      },
    ];

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'Packed',
        status_history: statusHistory,
      })
      .eq('id', target._id)
      .select('*, order_items(*)')
      .single();

    if (error) throw error;
    return { order: data };
  },

  async markReadyForDispatch(id) {
    const target = await orderService.getOrderById(id);
    const statusHistory = [
      ...(target.statusHistory || []),
      {
        status: 'Ready for Dispatch',
        timestamp: new Date().toISOString(),
        comment: 'Staged at outbound dispatch loading dock',
        updatedBy: 'Company Fulfillment Staff',
      },
    ];

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'Ready for Dispatch',
        status_history: statusHistory,
      })
      .eq('id', target._id)
      .select('*, order_items(*)')
      .single();

    if (error) throw error;
    return { order: data };
  },

  async getEligibleTravelPartners() {
    const { data, error } = await supabase
      .from('logistics_partners')
      .select('*')
      .eq('contract_status', 'Active');

    if (error) throw error;
    return (data || []).map((lp) => ({
      _id: lp.id,
      id: lp.id,
      companyName: lp.company_name,
      contactPerson: lp.contact_person,
      email: lp.email,
      phone: lp.phone,
      rating: lp.rating,
      fleetSize: lp.fleet_size,
    }));
  },

  async dispatchOrderToPartner(id, dispatchData) {
    const target = await orderService.getOrderById(id);
    const { partnerId, notes, vehicleNumber, estimatedDeliveryDate } = dispatchData;

    const statusHistory = [
      ...(target.statusHistory || []),
      {
        status: 'Dispatched',
        timestamp: new Date().toISOString(),
        comment: notes || `Dispatched to courier partner`,
        updatedBy: 'Company Fulfillment Staff',
      },
    ];

    await supabase
      .from('orders')
      .update({
        status: 'Dispatched',
        status_history: statusHistory,
      })
      .eq('id', target._id);

    // Update Shipment
    const { data: shipment } = await supabase
      .from('shipments')
      .select('*')
      .eq('order_id', target._id)
      .maybeSingle();

    if (shipment) {
      const trackingEvents = [
        ...(shipment.tracking_events || []),
        {
          status: 'Handed to Logistics Partner',
          location: 'Bengaluru Central Fulfillment Hub',
          note: notes || 'Package handed over at dispatch dock',
          timestamp: new Date().toISOString(),
        },
      ];

      await supabase
        .from('shipments')
        .update({
          status: 'In Transit',
          vehicle_info: { vehicleType: 'Surface Van', vehicleNumber: vehicleNumber || 'KA-01-EQ-9874' },
          estimated_delivery_date: estimatedDeliveryDate || 'Expected in 2 days',
          tracking_events: trackingEvents,
        })
        .eq('id', shipment.id);

      // Record dispatch assignment
      await supabase.from('dispatch_assignments').insert({
        shipment_id: shipment.id,
        partner_id: partnerId || null,
        status: 'DISPATCHED',
        notes: notes || '',
      });
    }

    return { success: true, message: 'Order dispatched to travel partner' };
  },

  async getShipments(params = {}) {
    const { data, error } = await supabase
      .from('shipments')
      .select('*, orders(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return {
      shipments: (data || []).map((s) => ({
        _id: s.id,
        shipmentId: s.shipment_id,
        orderId: s.order_code,
        status: s.status,
        recipient: s.recipient,
        packageDetails: s.package_details,
        estimatedDeliveryDate: s.estimated_delivery_date,
        createdAt: s.created_at,
      })),
    };
  },

  async getInventory(params = {}) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*, products(id, legacy_id, name, brand, category, images, selling_price)')
      .order('quantity', { ascending: true });

    if (error) throw error;
    return {
      inventory: (data || []).map((inv) => ({
        _id: inv.id,
        sku: inv.sku,
        quantity: inv.quantity,
        warehouseLocation: inv.warehouse_location,
        lowStockThreshold: inv.low_stock_threshold,
        product: inv.products ? {
          _id: inv.products.id,
          id: inv.products.legacy_id || inv.products.id,
          name: inv.products.name,
          brand: inv.products.brand,
          category: inv.products.category,
          images: inv.products.images,
          sellingPrice: inv.products.selling_price,
        } : null,
      })),
    };
  },

  async flagFulfillmentIssue(data) {
    await supabase.from('audit_logs').insert({
      acting_user_name: 'Company Operations',
      acting_user_role: 'LOGISTICS_PARTNER',
      action: 'FLAG_INVENTORY_ISSUE',
      details: data,
      reason: data.notes || 'Inventory discrepancy reported',
    });
    return { success: true, message: 'Issue flagged and escalated to administration.' };
  },

  async getReturns() {
    const { data, error } = await supabase
      .from('returns')
      .select('*, orders(*), profiles(name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return {
      returns: (data || []).map((r) => ({
        _id: r.id,
        orderId: r.orders?.order_id || 'MYN-PRO',
        userName: r.profiles?.name || 'Customer',
        reason: r.reason,
        comment: r.comment,
        status: r.status,
        refundAmount: Number(r.refund_amount),
        createdAt: r.created_at,
      })),
    };
  },

  async inspectReturn(id, inspectionData) {
    const { status, inspectionNotes } = inspectionData;
    const { data, error } = await supabase
      .from('returns')
      .update({
        status: status || 'Inspected',
        inspection_notes: inspectionNotes || '',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, returnRecord: data };
  },

  async getNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or('recipient_role.eq.LOGISTICS_PARTNER,recipient_role.eq.ALL')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { notifications: data || [] };
  },
};

export default companyService;
