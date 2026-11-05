import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, CheckCircle2, RefreshCw, Smartphone, Banknote } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';

export const AdminPayments = () => {
  const { error } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await adminService.getOrders({ limit: 50 });
      setOrders(res.orders || []);
    } catch (err) {
      error('Failed to load payment transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalGMV = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const upiOrders = orders.filter((o) => o.paymentMethod === 'UPI');
  const cardOrders = orders.filter((o) => o.paymentMethod === 'Credit Card' || o.paymentMethod === 'Debit Card');
  const codOrders = orders.filter((o) => o.paymentMethod === 'COD');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Payment Transactions & Settlements
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            Authoritative order receipts, gateway distributions and settlement ledger
          </p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={fetchPayments}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ backgroundColor: '#ffffff', padding: 18, borderRadius: 8, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
            Gross Settled Revenue
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 4, color: 'var(--dark)' }}>
            ₹{totalGMV.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: 2 }}>{orders.length} transactions processed</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: 18, borderRadius: 8, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
            UPI Settlements
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 4, color: 'var(--primary)' }}>
            {upiOrders.length} orders
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
            ₹{upiOrders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: 18, borderRadius: 8, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
            Card Gateways
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 4, color: '#0288d1' }}>
            {cardOrders.length} orders
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
            ₹{cardOrders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: 18, borderRadius: 8, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
            Cash On Delivery (COD)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 4, color: '#ff905a' }}>
            {codOrders.length} orders
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
            ₹{codOrders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {loading ? (
        <Loader size="large" text="Reading transaction logs..." />
      ) : (
        <div className="portal-table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Payer Customer</th>
                <th>Method</th>
                <th>Gateway Status</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Net Paid</th>
                <th>Settled At</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord._id || ord.orderId}>
                  <td><strong>{ord.orderId}</strong></td>
                  <td>{ord.user?.name || ord.shippingAddress?.name}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{ord.paymentMethod}</span>
                  </td>
                  <td>
                    <span className="badge badge-success">
                      {ord.paymentStatus?.toUpperCase() || 'COMPLETED'}
                    </span>
                  </td>
                  <td>₹{ord.subtotal?.toLocaleString('en-IN')}</td>
                  <td>-₹{ord.couponDiscount || 0}</td>
                  <td><strong>₹{ord.total?.toLocaleString('en-IN')}</strong></td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
