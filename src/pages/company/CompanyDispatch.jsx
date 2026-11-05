import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  Truck,
  CheckCircle,
  Package,
  MapPin,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Building,
  ArrowRight
} from 'lucide-react';
import { companyService } from '../../services/companyService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const CompanyDispatch = () => {
  const { success, error } = useToast();

  const [readyOrders, setReadyOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dispatch modal
  const [dispatchOrder, setDispatchOrder] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [priority, setPriority] = useState('Standard');
  const [serviceLevel, setServiceLevel] = useState('Road Surface Express');
  const [warehouse, setWarehouse] = useState('Warehouse BNG-01 (Electronic City)');
  const [dispatchNotes, setDispatchNotes] = useState('Sealed parcel transferred to Travel Partner dock');
  const [dispatching, setDispatching] = useState(false);

  const fetchDispatchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, partnersRes] = await Promise.all([
        companyService.getOrders({ status: 'ready-to-dispatch' }),
        companyService.getEligibleTravelPartners(),
      ]);
      setReadyOrders(ordersRes?.orders || []);
      setPartners(partnersRes || []);
      if (partnersRes?.length > 0 && !selectedPartnerId) {
        setSelectedPartnerId(partnersRes[0]._id || partnersRes[0].id);
      }
    } catch (err) {
      error('Failed to load dispatch desk data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispatchData();
  }, []);

  const handleOpenDispatchModal = (ord) => {
    setDispatchOrder(ord);
    if (ord.packageDetails?.warehouse) {
      setWarehouse(ord.packageDetails.warehouse);
    }
  };

  const handleConfirmDispatch = async (e) => {
    e.preventDefault();
    if (!dispatchOrder || !selectedPartnerId) return;

    setDispatching(true);
    const id = dispatchOrder._id || dispatchOrder.orderId;
    try {
      const res = await companyService.dispatchOrderToPartner(id, {
        transportPartnerId: selectedPartnerId,
        priority,
        serviceLevel,
        warehouse,
        dispatchNotes,
        weightKg: dispatchOrder.packageDetails?.weightKg || 0.75,
        dimensions: dispatchOrder.packageDetails?.dimensions || { lengthCm: 30, widthCm: 20, heightCm: 10 },
      });
      success(res.message || `Order successfully dispatched to Travel Partner!`);
      setDispatchOrder(null);
      fetchDispatchData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to dispatch order to partner');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Travel Partner Dispatch Desk
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Handoff packed parcels to authorized Travel Partners with duplicate-prevention atomic locking.
          </p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={fetchDispatchData} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Dispatch Desk
        </button>
      </div>

      {loading ? (
        <Loader message="Loading eligible Travel Partners & dock queue..." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1.1fr', gap: 24, alignItems: 'start' }}>
          {/* Ready to Dispatch Orders List */}
          <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={18} color="#0d9488" /> Ready for Carrier Handoff ({readyOrders.length})
            </h3>

            {readyOrders.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                <CheckCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <h4>All Staged Orders Dispatched</h4>
                <p style={{ fontSize: '0.85rem', margin: '6px 0 16px' }}>
                  There are no orders currently awaiting Travel Partner assignment on dock.
                </p>
                <Link to="/company/packing" className="btn btn-outline btn-sm">
                  Check Packing Bench
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {readyOrders.map((ord) => {
                  const id = ord._id || ord.orderId;
                  const pkg = ord.packageDetails || {};

                  return (
                    <div
                      key={id}
                      style={{
                        padding: 16,
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0d9488' }}>
                            Order #{ord.orderId || id.slice(-8)}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2 }}>
                            {ord.items?.length || 1} Item(s) • Total: ₹{ord.total}
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 4,
                            backgroundColor: '#e0f2fe',
                            color: '#0369a1',
                            textTransform: 'uppercase'
                          }}
                        >
                          READY FOR DISPATCH
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: 12,
                          backgroundColor: '#f8fafc',
                          padding: 12,
                          borderRadius: 6,
                          fontSize: '0.82rem'
                        }}
                      >
                        <div>
                          <span style={{ color: 'var(--muted)' }}>Destination:</span>
                          <div style={{ fontWeight: 600 }}>{ord.shippingAddress?.city} ({ord.shippingAddress?.pincode})</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--muted)' }}>Weight & Box:</span>
                          <div>{pkg.weightKg || 0.75} kg (Box 1 of 1)</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--muted)' }}>Payment Mode:</span>
                          <div>{ord.paymentMethod === 'cod' ? 'COD (Cash Handover)' : 'Prepaid Direct'}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                        <Link to={`/company/orders/${id}`} className="btn btn-outline btn-sm">
                          Inspect Details
                        </Link>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }}
                          onClick={() => handleOpenDispatchModal(ord)}
                        >
                          <Send size={14} /> Dispatch to Travel Partner
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Registered Travel Partners Roster */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Truck size={18} color="#03a685" /> Registered Travel Partners ({partners.length})
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '-8px 0 14px' }}>
                Authorized logistics partners connected to hub feeder network.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {partners.map((p) => (
                  <div
                    key={p._id || p.id}
                    style={{
                      padding: 14,
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      backgroundColor: '#f0fdf4',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#166534' }}>{p.name}</div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#166534', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: 4 }}>
                        ACTIVE
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#15803d', marginTop: 6, lineHeight: 1.4 }}>
                      Operating Zone: {p.operatingZone}
                      <br />
                      Active Parcels in Transit: <strong>{p.activeShipmentsCount}</strong>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 6, paddingTop: 6, borderTop: '1px dashed #bbf7d0' }}>
                      Carrier ID: {p.email} • {p.phone}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {dispatchOrder && (
        <Modal
          isOpen={!!dispatchOrder}
          onClose={() => setDispatchOrder(null)}
          title={`Dispatch Order #${dispatchOrder.orderId || dispatchOrder._id} to Carrier`}
        >
          <form onSubmit={handleConfirmDispatch} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                Select Travel Partner *
              </label>
              <select
                required
                className="input-field"
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">-- Choose Partner --</option>
                {partners.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name} ({p.operatingZone}) — Active Loads: {p.activeShipmentsCount}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                  Dispatch Priority
                </label>
                <select
                  className="input-field"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Standard">Standard Delivery (24-48h)</option>
                  <option value="Express">Express Feeder (Same Day)</option>
                  <option value="Urgent">Urgent Priority (Direct Couriers)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                  Service Level
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={serviceLevel}
                  onChange={(e) => setServiceLevel(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                Pickup Warehouse
              </label>
              <input
                type="text"
                className="input-field"
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                Dispatch Instructions / Manifest Notes
              </label>
              <textarea
                rows={2}
                className="input-field"
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button type="button" className="btn btn-outline" onClick={() => setDispatchOrder(null)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }}
                disabled={dispatching || !selectedPartnerId}
              >
                {dispatching ? 'Dispatching...' : 'Confirm Dispatch & Create Waybill'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
