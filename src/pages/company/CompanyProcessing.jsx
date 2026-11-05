import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Package,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  Eye,
  CheckCircle
} from 'lucide-react';
import { companyService } from '../../services/companyService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';

export const CompanyProcessing = () => {
  const { error } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProcessing = async () => {
    setLoading(true);
    try {
      const data = await companyService.getOrders({ status: 'processing' });
      setOrders(data?.orders || []);
    } catch (err) {
      error('Failed to load processing orders queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcessing();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Order Processing & Picking Queue ({orders.length})
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Orders currently being picked from warehouse racks and brought to packing benches.
          </p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={fetchProcessing} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Queue
        </button>
      </div>

      {loading ? (
        <Loader message="Loading active picking tasks..." />
      ) : orders.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
          <Clock size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3>No Orders In Processing Stage</h3>
          <p style={{ maxWidth: 420, margin: '8px auto 20px', fontSize: '0.9rem' }}>
            Check the New Orders queue to verify stock and start fulfillment on newly placed orders.
          </p>
          <Link to="/company/orders?status=new" className="btn btn-primary btn-sm" style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }}>
            View New Orders Queue
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {orders.map((ord) => {
            const id = ord._id || ord.orderId;

            return (
              <div
                key={id}
                className="card"
                style={{
                  padding: 20,
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b78103', textTransform: 'uppercase' }}>
                        In Picking
                      </span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '2px 0 0' }}>
                        #{ord.orderId || id.slice(-8)}
                      </h3>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4, backgroundColor: '#fff4e5', color: '#b78103' }}>
                      PROCESSING
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem', margin: '14px 0' }}>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Customer: </span>
                      <strong>{ord.shippingAddress?.name || ord.user?.name || 'Customer'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Destination: </span>
                      <span>{ord.shippingAddress?.city} - {ord.shippingAddress?.pincode}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Items Count: </span>
                      <span>{ord.items?.length || 1} Apparel Item(s)</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Started At: </span>
                      <span>{ord.processingDetails?.processedAt ? new Date(ord.processingDetails.processedAt).toLocaleTimeString() : 'Recent'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', gap: 10 }}>
                  <Link
                    to={`/company/orders/${id}`}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, backgroundColor: '#7e22ce', borderColor: '#7e22ce' }}
                  >
                    <Package size={14} /> Open Packing Bench
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
