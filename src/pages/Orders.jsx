import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Package,
  Truck,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  AlertCircle,
  ShoppingBag,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Radio,
  MapPin
} from 'lucide-react';
import supabase from '../lib/supabase';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Loader } from '../components/Loader';
import { Modal } from '../components/Modal';

const LIFECYCLE_STEPS = [
  'Placed',
  'Confirmed',
  'Packed',
  'Dispatched',
  'In Transit',
  'Out for Delivery',
  'Delivered',
];

export const Orders = () => {
  const { isAuthenticated, user } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  // Cancel order modal
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Found cheaper elsewhere');
  const [cancelling, setCancelling] = useState(false);

  // Return modal
  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('Size/Fit issue');
  const [returnComment, setReturnComment] = useState('');
  const [returning, setReturning] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders();
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Supabase Real-time updates for orders & deliveries
  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('realtime:orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.new && payload.new.order_id) {
            const updated = payload.new;
            info(`Order #${updated.order_id} status updated: ${updated.status}`);
            setOrders((prev) =>
              prev.map((o) =>
                o.orderId === updated.order_id
                  ? {
                      ...o,
                      status: updated.status,
                      isOtpVerified: updated.is_otp_verified,
                      paymentStatus: updated.payment_status,
                      trackingNumber: updated.tracking_number || o.trackingNumber,
                    }
                  : o
              )
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shipments',
        },
        (payload) => {
          if (payload.new) {
            const updated = payload.new;
            if (updated.status === 'Delivered') {
              success(`Delivery confirmed for Shipment #${updated.shipment_id}!`);
            }
            fetchOrders();
          }
        }
      )
      .subscribe((status) => {
        setSocketConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  const handleCancelOrder = async () => {
    if (!cancelModalOrder) return;
    setCancelling(true);
    try {
      await orderService.cancelOrder(cancelModalOrder.orderId, cancelReason);
      success(`Order #${cancelModalOrder.orderId} cancelled successfully.`);
      setCancelModalOrder(null);
      await fetchOrders();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleRequestReturn = async () => {
    if (!returnModalOrder) return;
    setReturning(true);
    try {
      await orderService.requestReturn(returnModalOrder.orderId, {
        reason: returnReason,
        comment: returnComment,
      });
      success(`Return request registered for Order #${returnModalOrder.orderId}`);
      setReturnModalOrder(null);
      await fetchOrders();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit return');
    } finally {
      setReturning(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container empty-state" style={{ padding: '80px 20px' }}>
        <Package size={48} color="var(--primary)" />
        <h2>PLEASE SIGN IN</h2>
        <p>Login to view your placed orders, live shipment tracking and OTP verification.</p>
        <Link to="/login" className="btn btn-primary btn-lg">
          LOGIN NOW
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px' }}>
        <Loader size="large" text="Connecting to logistics tracking server..." />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container empty-state" style={{ padding: '80px 20px' }}>
        <div className="empty-state-icon">
          <ShoppingBag size={44} />
        </div>
        <h2>NO ORDERS PLACED YET</h2>
        <p>You haven't placed any fashion orders yet. Explore our latest catalogs!</p>
        <Link to="/products" className="btn btn-primary btn-lg">
          DISCOVER STYLES
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <span className="badge badge-success"><CheckCircle size={12} /> DELIVERED</span>;
      case 'Cancelled':
        return <span className="badge badge-danger"><XCircle size={12} /> CANCELLED</span>;
      case 'Out for Delivery':
        return <span className="badge badge-warning"><Truck size={12} /> OUT FOR DELIVERY</span>;
      case 'Dispatched':
      case 'In Transit':
        return <span className="badge badge-info"><Truck size={12} /> {status.toUpperCase()}</span>;
      case 'Return Requested':
        return <span className="badge badge-warning"><RotateCcw size={12} /> RETURN REQUESTED</span>;
      default:
        return <span className="badge badge-info"><Clock size={12} /> {status.toUpperCase()}</span>;
    }
  };

  const getStepIndex = (status) => {
    const idx = LIFECYCLE_STEPS.indexOf(status);
    if (idx !== -1) return idx;
    if (status === 'Processing') return 1;
    if (status === 'Ready for Dispatch') return 2;
    return 0;
  };

  return (
    <div className="container" style={{ paddingBottom: '80px', maxWidth: '960px' }}>
      <Breadcrumbs items={[{ label: 'Orders & Returns' }]} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 28px 0', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            {orderId ? `Order #${orderId}` : 'My Orders & Real-time Tracking'}
          </h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            ({orders.length} Orders)
          </span>
          {socketConnected && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#03a685',
                backgroundColor: '#e8f7f3',
                padding: '2px 8px',
                borderRadius: 12,
              }}
            >
              <Radio size={12} className="animate-pulse" /> Live Tracking
            </span>
          )}
        </div>
        {orderId && (
          <Link to="/orders" className="btn btn-outline btn-sm">
            <ArrowLeft size={14} /> View All Orders
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {(orderId ? orders.filter((o) => (o._id === orderId || o.orderId === orderId || o.id === orderId)) : orders).map((ord) => {
          const isCancelled = ord.status === 'Cancelled';
          const isDelivered = ord.status === 'Delivered';
          const currentStep = getStepIndex(ord.status);

          return (
            <div
              key={ord._id || ord.orderId}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 24px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderBottom: '1px solid var(--border)',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Order Placed
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                    {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Order ID
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{ord.orderId}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Total Amount
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>₹{ord.total?.toLocaleString('en-IN')}</div>
                </div>

                <div>{getStatusBadge(ord.status)}</div>
              </div>

              {/* Delivery OTP Highlight Card for Active Delivery Handover */}
              {!isCancelled && !isDelivered && (ord.deliveryOtp || ord.shipment?.deliveryOtp) && (
                <div
                  style={{
                    backgroundColor: '#fff0f3',
                    borderBottom: '1px solid #ffd0d9',
                    padding: '12px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <KeyRound size={20} color="var(--primary)" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--dark)' }}>
                        Delivery Handover Security OTP
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                        Share this 4-digit code with your courier partner upon doorstep arrival
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 900,
                      letterSpacing: 4,
                      color: 'var(--primary)',
                      backgroundColor: '#ffffff',
                      padding: '4px 16px',
                      borderRadius: 6,
                      border: '1px dashed var(--primary)',
                    }}
                  >
                    {ord.deliveryOtp || ord.shipment?.deliveryOtp}
                  </div>
                </div>
              )}

              {/* Lifecycle Progress Stepper (PLACED → DELIVERED) */}
              {!isCancelled && (
                <div style={{ padding: '20px 24px 10px 24px', backgroundColor: '#fdfdfe', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', overflowX: 'auto', paddingBottom: 8 }}>
                    {LIFECYCLE_STEPS.map((step, sIdx) => {
                      const isPast = sIdx < currentStep;
                      const isCurrent = sIdx === currentStep;
                      return (
                        <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80, zIndex: 1 }}>
                          <div
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              backgroundColor: isPast || isCurrent ? 'var(--primary)' : '#e5e7eb',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              boxShadow: isCurrent ? '0 0 0 4px rgba(255, 63, 108, 0.2)' : 'none',
                              marginBottom: 6,
                            }}
                          >
                            {isPast ? '✓' : sIdx + 1}
                          </div>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: isCurrent ? 800 : 600,
                              color: isCurrent ? 'var(--primary)' : isPast ? 'var(--dark)' : 'var(--muted)',
                              textAlign: 'center',
                            }}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items in this Order */}
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {(ord.items || []).map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                      }}
                    >
                      <img
                        src={it.image || 'https://via.placeholder.com/80'}
                        alt={it.productName}
                        style={{ width: 64, height: 80, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{it.brand}</div>
                        <div style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{it.productName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: 4 }}>
                          Size: {it.size} • Color: {it.color} • Qty: {it.quantity}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                          ₹{(it.price * it.quantity)?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tracking & Timeline details */}
                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: '1px solid var(--border-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Truck size={16} color="var(--primary)" />
                    <span>
                      {isDelivered
                        ? 'Delivered safely to your destination'
                        : isCancelled
                        ? 'Order was cancelled'
                        : `Estimated Delivery: ${ord.estimatedDeliveryDate || '3-4 Business Days'}`}
                    </span>
                    {ord.trackingNumber && (
                      <span style={{ color: 'var(--muted)', marginLeft: 8 }}>
                        (AWB: <strong>{ord.trackingNumber}</strong>)
                      </span>
                    )}
                  </div>

                  {/* Cancel / Return Actions */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    {!isCancelled && !isDelivered && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--danger)', borderColor: 'var(--border)' }}
                        onClick={() => setCancelModalOrder(ord)}
                      >
                        Cancel Order
                      </button>
                    )}

                    {isDelivered && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
                        onClick={() => setReturnModalOrder(ord)}
                      >
                        <RotateCcw size={14} /> Request Return
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Order Modal */}
      {cancelModalOrder && (
        <Modal
          isOpen={Boolean(cancelModalOrder)}
          onClose={() => setCancelModalOrder(null)}
          title={`Cancel Order #${cancelModalOrder.orderId}`}
        >
          <div style={{ padding: '8px 0' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: 16 }}>
              Are you sure you wish to cancel this order? Reserved items will be released back to inventory immediately.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 4 }}
              >
                <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Delivery time too long">Delivery time too long</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setCancelModalOrder(null)} className="btn btn-outline btn-sm">
                Keep Order
              </button>
              <button onClick={handleCancelOrder} className="btn btn-primary btn-sm" disabled={cancelling}>
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Request Return Modal */}
      {returnModalOrder && (
        <Modal
          isOpen={Boolean(returnModalOrder)}
          onClose={() => setReturnModalOrder(null)}
          title={`Initiate Doorstep Return: #${returnModalOrder.orderId}`}
        >
          <div style={{ padding: '8px 0' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: 16 }}>
              Our courier will arrive at your address within 24 to 48 hours for doorstep parcel verification and pickup.
            </p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                Return Discrepancy Reason
              </label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 4 }}
              >
                <option value="Size/Fit issue">Size / Fit Discrepancy</option>
                <option value="Fabric quality not as expected">Fabric quality not as expected</option>
                <option value="Defective or damaged item">Defective or damaged item</option>
                <option value="Different item received">Different item received</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                Additional Notes
              </label>
              <textarea
                value={returnComment}
                onChange={(e) => setReturnComment(e.target.value)}
                placeholder="Describe the issue..."
                rows={3}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 4 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setReturnModalOrder(null)} className="btn btn-outline btn-sm">
                Cancel
              </button>
              <button onClick={handleRequestReturn} className="btn btn-primary btn-sm" disabled={returning}>
                {returning ? 'Submitting...' : 'Confirm Doorstep Pickup'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
