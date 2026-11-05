import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';

export const DeliveryAvailableOrders = () => {
  const { success, error } = useToast();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);

  const fetchAvailable = async () => {
    setLoading(true);
    try {
      const data = await deliveryService.getAvailableDeliveries();
      setShipments(data || []);
    } catch (err) {
      error('Failed to load available orders pool');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailable();
  }, []);

  const handleClaim = async (shp) => {
    const id = shp.shipmentId || shp._id;
    setClaimingId(id);
    try {
      await deliveryService.claimDelivery(id);
      success(`Successfully claimed delivery #${shp.shipmentId || id}! It is now in your active runs.`);
      fetchAvailable();
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        error(`Conflict: Delivery #${shp.shipmentId || id} was just claimed by another courier.`);
      } else {
        error(err.response?.data?.message || 'Failed to claim shipment');
      }
      fetchAvailable();
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Available Deliveries Pool
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Claim orders in your operational sector. Atomic assignment guarantees first-come first-served protection.
          </p>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={fetchAvailable} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Pool
        </button>
      </div>

      {loading ? (
        <Loader message="Scanning logistics pool for ready shipments..." />
      ) : shipments.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
          <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)' }}>No Orders Pending Courier Pickup</h3>
          <p style={{ maxWidth: 460, margin: '8px auto 20px', fontSize: '0.9rem' }}>
            All current shipments in this hub have either been claimed or assigned. New dispatches arrive continuously from the sorting warehouse.
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={fetchAvailable}>
            Check Again
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {shipments.map((shp) => {
            const id = shp.shipmentId || shp._id;
            const isClaiming = claimingId === id;
            const isCod = shp.paymentMethod === 'cod' || shp.paymentStatus === 'pending';

            return (
              <div
                key={id}
                className="card"
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ff905a', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Ready to Claim
                      </span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '2px 0 0' }}>
                        #{shp.shipmentId || id.slice(-8)}
                      </h3>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 20,
                        backgroundColor: isCod ? '#fff4e5' : '#e6f4ea',
                        color: isCod ? '#b78103' : '#137333',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {isCod ? 'Cash on Delivery' : 'Prepaid'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: 8, margin: '16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <strong>{shp.deliveryAddress?.city || 'Bengaluru'}, {shp.deliveryAddress?.pincode || '560001'}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                          {shp.deliveryAddress?.locality || shp.deliveryAddress?.street || 'Delivery address registered'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Package size={16} color="var(--muted)" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.85rem' }}>
                        {shp.itemsCount || shp.items?.length || 1} item(s) • Standard Parcel
                      </span>
                    </div>

                    {shp.estimatedDeliveryDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: '0.82rem' }}>
                        <Clock size={16} style={{ flexShrink: 0 }} />
                        Target: {new Date(shp.estimatedDeliveryDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', backgroundColor: '#ff905a', borderColor: '#ff905a' }}
                    onClick={() => handleClaim(shp)}
                    disabled={isClaiming}
                  >
                    {isClaiming ? 'Claiming Order...' : 'Claim This Delivery'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
