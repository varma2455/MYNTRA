import supabase from '../lib/supabase';
import { cartService } from './cartService';

const mapOrder = (o, items = [], shipment = null) => {
  if (!o) return null;
  return {
    _id: o.id,
    id: o.order_id || o.id,
    orderId: o.order_id,
    idempotencyKey: o.idempotency_key,
    subtotal: Number(o.subtotal),
    discount: Number(o.discount || 0),
    couponCode: o.coupon_code || '',
    couponDiscount: Number(o.coupon_discount || 0),
    deliveryCharge: Number(o.delivery_charge || 0),
    convenienceFee: Number(o.convenience_fee || 0),
    total: Number(o.total),
    shippingAddress: o.shipping_address || {},
    status: o.status,
    statusHistory: o.status_history || [],
    paymentMethod: o.payment_method || 'UPI',
    paymentStatus: o.payment_status || 'completed',
    paymentDetails: o.payment_details || {},
    deliveryOtp: o.delivery_otp || '8472',
    isOtpVerified: !!o.is_otp_verified,
    trackingNumber: o.tracking_number || `TRK-${o.order_id}`,
    estimatedDeliveryDate: o.estimated_delivery_date || 'Expected in 2-3 days',
    cancellationReason: o.cancellation_reason || '',
    returnReason: o.return_reason || '',
    createdAt: o.created_at,
    updatedAt: o.updated_at,
    items: (items || []).map((it) => ({
      _id: it.id,
      productId: it.legacy_product_id || it.product_id,
      productName: it.product_name || 'Fashion Apparel',
      brand: it.brand || 'Myntra Pro',
      image: it.image || '',
      size: it.size || 'M',
      color: it.color || 'Standard',
      quantity: it.quantity || 1,
      price: Number(it.price),
      originalPrice: Number(it.original_price || it.price),
    })),
    shipment: shipment ? {
      _id: shipment.id,
      shipmentId: shipment.shipment_id,
      status: shipment.status,
      trackingEvents: shipment.tracking_events || [],
      estimatedDeliveryDate: shipment.estimated_delivery_date,
      vehicleInfo: shipment.vehicle_info,
      originHub: shipment.origin_hub,
    } : null,
  };
};

export const orderService = {
  async createOrder(orderData, idempotencyKey) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    // Check idempotency if provided
    if (idempotencyKey) {
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

      if (existingOrder) {
        return mapOrder(existingOrder, existingOrder.order_items);
      }
    }

    const items = orderData.items || [];
    if (items.length === 0) {
      throw new Error('Cannot create an empty order');
    }

    // Compute financial totals securely
    let subtotal = 0;
    for (const item of items) {
      subtotal += Number(item.price) * Number(item.quantity || 1);
    }

    const couponDiscount = Number(orderData.couponDiscount || 0);
    const deliveryCharge = subtotal > 1199 || subtotal === 0 ? 0 : 79;
    const convenienceFee = subtotal > 0 ? 20 : 0;
    const total = Math.max(0, subtotal - couponDiscount + deliveryCharge + convenienceFee);

    // Generate unique order ID and 4-digit OTP
    const orderIdCode = `MYN-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const statusHistory = [
      {
        status: 'Placed',
        timestamp: new Date().toISOString(),
        comment: 'Order placed by customer via Storefront',
        updatedBy: 'Customer',
      },
    ];

    // Insert Order record
    const { data: newOrder, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_id: orderIdCode,
        idempotency_key: idempotencyKey || null,
        user_id: user.id,
        subtotal,
        discount: Number(orderData.discount || 0),
        coupon_code: orderData.couponCode || '',
        coupon_discount: couponDiscount,
        delivery_charge: deliveryCharge,
        convenience_fee: convenienceFee,
        total,
        shipping_address: orderData.shippingAddress,
        status: 'Placed',
        status_history: statusHistory,
        payment_method: orderData.paymentMethod || 'UPI',
        payment_status: orderData.paymentMethod === 'Cash on Delivery' || orderData.paymentMethod === 'COD' ? 'pending' : 'completed',
        payment_details: orderData.paymentDetails || {},
        delivery_otp: otp,
        is_otp_verified: false,
        tracking_number: `TRK-${orderIdCode}`,
        estimated_delivery_date: 'Delivery within 2 to 3 days',
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // Insert Order Items
    const itemRows = [];
    for (const item of items) {
      // Resolve product UUID if possible
      let pgProdId = null;
      if (item.productId) {
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.productId)) {
          pgProdId = item.productId;
        } else {
          const { data: p } = await supabase
            .from('products')
            .select('id')
            .or(`legacy_id.eq.${item.productId},sku.eq.${item.productId}`)
            .maybeSingle();
          if (p) pgProdId = p.id;
        }
      }

      itemRows.push({
        order_id: newOrder.id,
        product_id: pgProdId,
        legacy_product_id: item.productId,
        product_name: item.productName || item.name || 'Apparel Item',
        brand: item.brand || 'Myntra Pro',
        image: item.image || '',
        size: item.size || 'M',
        color: item.color || 'Standard',
        quantity: item.quantity || 1,
        price: item.price,
        original_price: item.originalPrice || item.price,
      });

      // Update inventory (decrement reserved/available)
      if (pgProdId) {
        const { data: inv } = await supabase
          .from('inventory')
          .select('quantity')
          .eq('product_id', pgProdId)
          .maybeSingle();
        if (inv) {
          const newQty = Math.max(0, inv.quantity - (item.quantity || 1));
          await supabase.from('inventory').update({ quantity: newQty }).eq('product_id', pgProdId);
        }
      }
    }

    const { data: insertedItems } = await supabase
      .from('order_items')
      .insert(itemRows)
      .select();

    // Auto-create initial shipment record to initialize fulfillment pipeline
    const shipmentIdCode = `SHP-${orderIdCode.replace('MYN-', '')}`;
    const { data: newShipment } = await supabase
      .from('shipments')
      .insert({
        shipment_id: shipmentIdCode,
        order_id: newOrder.id,
        order_code: orderIdCode,
        status: 'Created',
        recipient: orderData.shippingAddress,
        delivery_otp: otp,
        is_otp_verified: false,
        estimated_delivery_date: 'Delivery within 2 to 3 days',
        tracking_events: [
          {
            status: 'Order Placed',
            location: 'Bengaluru Central Fulfillment Hub',
            note: 'Order registered into logistics dispatch pipeline',
            timestamp: new Date().toISOString(),
          },
        ],
      })
      .select()
      .maybeSingle();

    // Record Payment
    await supabase.from('payments').insert({
      payment_id: `PAY-${Date.now().toString(36).toUpperCase()}`,
      order_id: newOrder.id,
      order_code: orderIdCode,
      user_id: user.id,
      amount: total,
      currency: 'INR',
      payment_method: orderData.paymentMethod || 'UPI',
      gateway: 'Razorpay',
      status: orderData.paymentMethod === 'Cash on Delivery' || orderData.paymentMethod === 'COD' ? 'pending' : 'captured',
    });

    // Clear user shopping cart
    await cartService.clearCart();

    return mapOrder(newOrder, insertedItems || itemRows, newShipment);
  },

  async getMyOrders() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*), shipments(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }

    return (orders || []).map((o) => {
      const items = o.order_items || [];
      const shipment = Array.isArray(o.shipments) ? o.shipments[0] : o.shipments;
      return mapOrder(o, items, shipment);
    });
  },

  async getOrderById(orderId) {
    let query = supabase.from('orders').select('*, order_items(*), shipments(*)');
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
      query = query.eq('id', orderId);
    } else {
      query = query.eq('order_id', orderId);
    }

    const { data: order, error } = await query.maybeSingle();
    if (error || !order) throw new Error('Order not found');

    const items = order.order_items || [];
    const shipment = Array.isArray(order.shipments) ? order.shipments[0] : order.shipments;
    return mapOrder(order, items, shipment);
  },

  async cancelOrder(orderId, reason = 'Cancelled by Customer') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const targetOrder = await this.getOrderById(orderId);
    if (!targetOrder) throw new Error('Order not found');

    const statusHistory = [
      ...(targetOrder.statusHistory || []),
      {
        status: 'Cancelled',
        timestamp: new Date().toISOString(),
        comment: reason,
        updatedBy: 'Customer',
      },
    ];

    const { data: updated, error } = await supabase
      .from('orders')
      .update({
        status: 'Cancelled',
        cancellation_reason: reason,
        status_history: statusHistory,
      })
      .eq('id', targetOrder._id)
      .select('*, order_items(*), shipments(*)')
      .single();

    if (error) throw error;

    // Update shipment if exists
    if (targetOrder.shipment) {
      await supabase
        .from('shipments')
        .update({ status: 'Delivery Failed', failure_reason: 'Order cancelled by customer' })
        .eq('order_id', targetOrder._id);
    }

    const items = updated.order_items || [];
    const shipment = Array.isArray(updated.shipments) ? updated.shipments[0] : updated.shipments;
    return mapOrder(updated, items, shipment);
  },

  async requestReturn(orderId, { reason, comment }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const targetOrder = await this.getOrderById(orderId);
    if (!targetOrder) throw new Error('Order not found');

    const statusHistory = [
      ...(targetOrder.statusHistory || []),
      {
        status: 'Return Requested',
        timestamp: new Date().toISOString(),
        comment: `${reason}: ${comment || ''}`,
        updatedBy: 'Customer',
      },
    ];

    const { data: updated, error } = await supabase
      .from('orders')
      .update({
        status: 'Return Requested',
        return_reason: `${reason} - ${comment || ''}`,
        status_history: statusHistory,
      })
      .eq('id', targetOrder._id)
      .select('*, order_items(*), shipments(*)')
      .single();

    if (error) throw error;

    // Insert Return Record
    await supabase.from('returns').insert({
      order_id: targetOrder._id,
      user_id: user.id,
      reason,
      comment: comment || '',
      status: 'Pending',
      refund_amount: targetOrder.total,
    });

    const items = updated.order_items || [];
    const shipment = Array.isArray(updated.shipments) ? updated.shipments[0] : updated.shipments;
    return mapOrder(updated, items, shipment);
  },
};

export default orderService;
