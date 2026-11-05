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
  ArrowLeft
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Loader } from '../components/Loader';
import { Modal } from '../components/Modal';

export const Orders = () => {
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <p>Login to view your placed orders and delivery timelines.</p>
        <Link to="/login" className="btn btn-primary btn-lg">
          LOGIN NOW
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px' }}>
        <Loader size="large" text="Retrieving your orders..." />
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
        return <span className="badge badge-info"><Truck size={12} /> DISPATCHED</span>;
      case 'Processing':
        return <span className="badge badge-warning"><Clock size={12} /> PROCESSING</span>;
      default:
        return <span className="badge badge-info"><Clock size={12} /> {status.toUpperCase()}</span>;
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '80px', maxWidth: '960px' }}>
      <Breadcrumbs items={[{ label: 'Orders & Returns' }]} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 28px 0', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            {orderId ? `Order #${orderId}` : 'My Orders & Shipments'}
          </h1>
          <span style={{ fontSize: '0.95rem', color: 'var(--muted)' }}>
            ({orders.length} Total Orders)
          </span>
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
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
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
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Order ID
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{ord.orderId}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Total Amount
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>₹{ord.total?.toLocaleString('en-IN')}</div>
                </div>

                <div>{getStatusBadge(ord.status)}</div>
              </div>

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
                        ? 'Delivered safely to your address'
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
      <Modal
        isOpen={!!cancelModalOrder}
        onClose={() => setCancelModalOrder(null)}
        title="Cancel Order"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: 16 }}>
          Are you sure you want to cancel order <strong>#{cancelModalOrder?.orderId}</strong>? Reserved inventory will be instantly restored to the catalog.
        </p>

        <div className="form-group">
          <label className="form-label">Reason for Cancellation</label>
          <select
            className="form-control"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          >
            <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
            <option value="Changed delivery address">Changed delivery address</option>
            <option value="Expected delivery date is too late">Expected delivery date is too late</option>
            <option value="Ordered by mistake">Ordered by mistake</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setCancelModalOrder(null)}
          >
            Keep Order
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ backgroundColor: 'var(--danger)' }}
            disabled={cancelling}
            onClick={handleCancelOrder}
          >
            {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
          </button>
        </div>
      </Modal>

      {/* Request Return Modal */}
      <Modal
        isOpen={!!returnModalOrder}
        onClose={() => setReturnModalOrder(null)}
        title="Request Return & Refund"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: 16 }}>
          Myntra Pro offers a 14-day hassle-free doorstep return and exchange policy.
        </p>

        <div className="form-group">
          <label className="form-label">Return Reason</label>
          <select
            className="form-control"
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
          >
            <option value="Size/Fit issue">Size or Fit issue</option>
            <option value="Defective / Damaged product">Defective / Damaged product</option>
            <option value="Not as pictured">Product does not match picture</option>
            <option value="Quality not satisfactory">Quality not satisfactory</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Comments (Optional)</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Help us improve our sizing or quality..."
            value={returnComment}
            onChange={(e) => setReturnComment(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setReturnModalOrder(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={returning}
            onClick={handleRequestReturn}
          >
            {returning ? 'Submitting...' : 'Submit Return Request'}
          </button>
        </div>
      </Modal>
    </div>
  );
};
