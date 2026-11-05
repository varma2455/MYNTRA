import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Loader } from '../components/Loader';

export const CustomerReturns = () => {
  const { isAuthenticated } = useAuth();
  const { error } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      orderService
        .getMyOrders()
        .then((data) => setOrders(data || []))
        .catch(() => error('Failed to load orders for return tracking'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const returnedOrders = orders.filter(
    (o) => o.status === 'Return Requested' || o.status === 'Returned' || o.returnRequested
  );

  return (
    <div className="container" style={{ paddingBottom: '80px', maxWidth: '960px' }}>
      <Breadcrumbs items={[{ label: 'Account', path: '/profile' }, { label: 'Returns & Refunds' }]} />

      <div style={{ margin: '16px 0 28px 0' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
          Returns & Refunds Center
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '4px 0 0' }}>
          Track doorstep pickups, replacement items, and instant bank / source account refunds.
        </p>
      </div>

      {loading ? (
        <Loader message="Scanning return requests & refund ledgers..." />
      ) : returnedOrders.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)', borderRadius: 10 }}>
          <RotateCcw size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)' }}>No active returns or exchange requests</h3>
          <p style={{ maxWidth: 440, margin: '8px auto 20px', fontSize: '0.9rem' }}>
            All eligible delivered items have a 14-day hassle-free return window with complimentary doorstep pickup.
          </p>
          <Link to="/orders" className="btn btn-primary btn-sm">
            Check Orders Eligible for Return
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {returnedOrders.map((ord) => (
            <div
              key={ord._id || ord.orderId}
              className="card"
              style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                    Return Request for Order #{ord.orderNumber || (ord._id ? ord._id.slice(-8) : 'N/A')}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2 }}>
                    Requested on: {new Date(ord.updatedAt || ord.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 4,
                    backgroundColor: '#e6f4ea',
                    color: '#137333'
                  }}
                >
                  RETURN APPROVED • PICKUP IN PROGRESS
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Refund Amount:</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>₹{ord.totalAmount}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Refund Target:</span>
                  <span>Original Source Payment Method (Instant UPI / Card)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Doorstep Quality Check:</span>
                  <span style={{ color: '#03a685', fontWeight: 600 }}>Standard tags & condition verification at doorstep</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trust & Guarantee Banner */}
      <div
        className="card"
        style={{
          padding: 20,
          borderRadius: 10,
          border: '1px solid var(--border)',
          backgroundColor: '#fafafa',
          marginTop: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}
      >
        <ShieldCheck size={32} color="#03a685" style={{ flexShrink: 0 }} />
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>Myntra 100% Return Assurance</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '4px 0 0', lineHeight: 1.4 }}>
            Enjoy zero pickup fees on returns. Once our courier scans the item, refund initiates immediately to your source payment account within 2 hours.
          </p>
        </div>
      </div>
    </div>
  );
};
