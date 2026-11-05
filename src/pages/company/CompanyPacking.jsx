import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  Scale,
  Send,
  Boxes
} from 'lucide-react';
import { companyService } from '../../services/companyService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const CompanyPacking = () => {
  const { success, error } = useToast();
  const [packedOrders, setPackedOrders] = useState([]);
  const [processingOrders, setProcessingOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pack modal
  const [activePackOrder, setActivePackOrder] = useState(null);
  const [weightKg, setWeightKg] = useState('0.75');
  const [lengthCm, setLengthCm] = useState('32');
  const [widthCm, setWidthCm] = useState('24');
  const [heightCm, setHeightCm] = useState('10');
  const [warehouse, setWarehouse] = useState('Warehouse BNG-01 (Electronic City)');
  const [submittingPack, setSubmittingPack] = useState(false);

  const fetchPackingData = async () => {
    setLoading(true);
    try {
      const [packedRes, procRes] = await Promise.all([
        companyService.getOrders({ status: 'packing' }),
        companyService.getOrders({ status: 'processing' }),
      ]);
      setPackedOrders(packedRes?.orders || []);
      setProcessingOrders(procRes?.orders || []);
    } catch (err) {
      error('Failed to load packing bench queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackingData();
  }, []);

  const handleConfirmPack = async (e) => {
    e.preventDefault();
    if (!activePackOrder) return;

    setSubmittingPack(true);
    const id = activePackOrder._id || activePackOrder.orderId;
    try {
      await companyService.packOrder(id, {
        weightKg: Number(weightKg) || 0.75,
        dimensions: { lengthCm: Number(lengthCm), widthCm: Number(widthCm), heightCm: Number(heightCm) },
        warehouse,
      });
      success(`Order #${activePackOrder.orderId || id} packed and ready for dispatch!`);
      setActivePackOrder(null);
      fetchPackingData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to pack order');
    } finally {
      setSubmittingPack(false);
    }
  };

  const handleMarkReady = async (ord) => {
    const id = ord._id || ord.orderId;
    try {
      await companyService.markReadyForDispatch(id);
      success(`Order #${ord.orderId || id} marked Ready for Dispatch!`);
      fetchPackingData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to mark ready');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Packing Bench & Box Weighing Station
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Weigh parcels, apply tamper-evident barcodes and record exact dimensions.
          </p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={fetchPackingData} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Packing Queue
        </button>
      </div>

      {loading ? (
        <Loader message="Loading packing station queues..." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          {/* Left Column: Orders Awaiting Packing */}
          <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="#b78103" /> Orders Awaiting Packing ({processingOrders.length})
            </h3>

            {processingOrders.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>
                No orders waiting on packing table.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {processingOrders.map((ord) => {
                  const id = ord._id || ord.orderId;
                  return (
                    <div
                      key={id}
                      style={{
                        padding: 14,
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        backgroundColor: '#fff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>#{ord.orderId || id.slice(-8)}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2 }}>
                          {ord.items?.length || 1} item(s) • {ord.shippingAddress?.city}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: '#7e22ce', borderColor: '#7e22ce' }}
                        onClick={() => {
                          setActivePackOrder(ord);
                          setWeightKg('0.85');
                        }}
                      >
                        <Scale size={14} /> Pack & Weigh
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Packed & Ready for Dock */}
          <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={18} color="#0d9488" /> Packed Parcels ({packedOrders.length})
            </h3>

            {packedOrders.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>
                No packed parcels awaiting ready confirmation.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {packedOrders.map((ord) => {
                  const id = ord._id || ord.orderId;
                  return (
                    <div
                      key={id}
                      style={{
                        padding: 14,
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        backgroundColor: '#f0fdfa',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>#{ord.orderId || id.slice(-8)}</div>
                        <div style={{ fontSize: '0.8rem', color: '#0f766e', marginTop: 2 }}>
                          Weighed: <strong>{ord.packageDetails?.weightKg || 0.75} kg</strong> • Box: {ord.packageDetails?.warehouse || 'BNG-01'}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }}
                        onClick={() => handleMarkReady(ord)}
                      >
                        <CheckCircle size={14} /> Send to Dock
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pack Modal */}
      {activePackOrder && (
        <Modal isOpen={!!activePackOrder} onClose={() => setActivePackOrder(null)} title={`Pack Order #${activePackOrder.orderId || activePackOrder._id}`}>
          <form onSubmit={handleConfirmPack} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                  Actual Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.05"
                  required
                  className="input-field"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  style={{ width: '100%' }}
                />
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
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                Box Dimensions (L x W x H in cm)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <input type="number" placeholder="L" className="input-field" value={lengthCm} onChange={(e) => setLengthCm(e.target.value)} />
                <input type="number" placeholder="W" className="input-field" value={widthCm} onChange={(e) => setWidthCm(e.target.value)} />
                <input type="number" placeholder="H" className="input-field" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-outline" onClick={() => setActivePackOrder(null)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#7e22ce', borderColor: '#7e22ce' }}
                disabled={submittingPack}
              >
                {submittingPack ? 'Saving...' : 'Confirm Packing'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
