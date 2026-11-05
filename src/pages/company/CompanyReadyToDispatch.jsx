import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Send,
  RefreshCw,
  Package,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import { companyService } from '../../services/companyService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';

export const CompanyReadyToDispatch = () => {
  const { error } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReady = async () => {
    setLoading(true);
    try {
      const data = await companyService.getOrders({ status: 'ready-to-dispatch' });
      setOrders(data?.orders || []);
    } catch (err) {
      error('Failed to load ready-to-dispatch queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReady();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Ready for Dispatch Staging Dock ({orders.length})
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Parcels fully packed and staged at dispatch dock bays waiting for Travel Partner carrier pickup.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={fetchReady} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Staging Dock
          </button>
          <Link
            to="/company/dispatch"
            className="btn btn-primary btn-sm"
            style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }}
          >
            <Send size={14} /> Open Partner Dispatch Desk
          </Link>
        </div>
      </div>

      {loading ? (
        <Loader message="Scanning staging dock conveyor..." />
      ) : orders.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
          <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3>No Orders Staged at Dispatch Dock</h3>
          <p style={{ maxWidth: 440, margin: '8px auto 20px', fontSize: '0.9rem' }}>
            All packed orders have been assigned to Travel Partners. Check packing bench for orders awaiting boxing.
          </p>
          <Link to="/company/packing" className="btn btn-outline btn-sm">
            Go to Packing Bench
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {orders.map((ord) => {
            const id = ord._id || ord.orderId;
            const pkg = ord.packageDetails || {};

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
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase' }}>
                        Dock Staging Cleared
                      </span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '2px 0 0' }}>
                        #{ord.orderId || id.slice(-8)}
                      </h3>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4, backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                      READY
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem', margin: '14px 0' }}>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Destination: </span>
                      <strong>{ord.shippingAddress?.city} - {ord.shippingAddress?.pincode}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Package Specs: </span>
                      <span>{pkg.weightKg || 0.75} kg • {pkg.packageCount || 1} Box</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Warehouse: </span>
                      <span>{pkg.warehouse || 'BNG-01'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Payment Mode: </span>
                      <span>{ord.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Prepaid Online'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <Link
                    to="/company/dispatch"
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', backgroundColor: '#0d9488', borderColor: '#0d9488' }}
                  >
                    <Send size={14} /> Assign Travel Partner
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
