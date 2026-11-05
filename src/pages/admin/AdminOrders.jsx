import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  Filter,
  RefreshCw
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const AdminOrders = () => {
  const { success, error } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminService.getOrders({
        status: statusFilter || undefined,
      });
      setOrders(res.orders || []);
    } catch (err) {
      error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      success(`Order #${orderId} status changed to ${newStatus}`);
      fetchOrders();
      if (selectedOrder) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Customer Orders Management
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            Dispatch, track and update customer fulfillment lifecycle
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">All Statuses</option>
            <option value="Placed">Placed</option>
            <option value="Processing">Processing</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button type="button" className="btn btn-outline btn-sm" onClick={fetchOrders}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <Loader size="large" text="Retrieving orders..." />
      ) : (
        <div className="portal-table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer & Address</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Change Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                    No orders found matching status filter.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id || ord.orderId}>
                    <td>
                      <strong>{ord.orderId}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{ord.user?.name || ord.shippingAddress?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        {ord.shippingAddress?.city}, {ord.shippingAddress?.pincode}
                      </div>
                    </td>
                    <td>{ord.items?.length || 1} items</td>
                    <td>
                      <strong>₹{ord.total?.toLocaleString('en-IN')}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{ord.paymentMethod}</div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          ord.status === 'Delivered'
                            ? 'badge-success'
                            : ord.status === 'Cancelled'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateStatus(ord._id || ord.orderId, e.target.value)}
                        disabled={updatingStatus}
                        style={{
                          fontSize: '0.8rem',
                          padding: '4px 8px',
                          borderRadius: 4,
                          border: '1px solid var(--border)',
                        }}
                      >
                        <option value="Placed">Placed</option>
                        <option value="Processing">Processing</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => setSelectedOrder(ord)}
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details: #${selectedOrder?.orderId}`}
      >
        {selectedOrder && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>CUSTOMER</div>
                <div style={{ fontWeight: 700 }}>{selectedOrder.shippingAddress?.name}</div>
                <div style={{ fontSize: '0.85rem' }}>Phone: {selectedOrder.shippingAddress?.mobile}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>SHIPPING ADDRESS</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                  {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.locality ? `${selectedOrder.shippingAddress?.locality}, ` : ''}{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 16 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, marginBottom: 8 }}>
                ORDER ITEMS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedOrder.items?.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={it.image || 'https://via.placeholder.com/60'}
                      alt="item"
                      style={{ width: 44, height: 55, objectFit: 'cover', borderRadius: 4 }}
                    />
                    <div style={{ flex: 1, fontSize: '0.85rem' }}>
                      <div style={{ fontWeight: 700 }}>{it.brand}</div>
                      <div>{it.productName}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>
                        Size: {it.size} • Color: {it.color} • Qty: {it.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      ₹{(it.price * it.quantity)?.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                padding: '12px 16px',
                borderRadius: 6,
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 800,
              }}
            >
              <span>Total Amount:</span>
              <span>₹{selectedOrder.total?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
