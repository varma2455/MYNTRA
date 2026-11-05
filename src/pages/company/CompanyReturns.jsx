import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Package,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { companyService } from '../../services/companyService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const CompanyReturns = () => {
  const { success, error } = useToast();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inspection modal
  const [inspectingOrder, setInspectingOrder] = useState(null);
  const [inspectionPassed, setInspectionPassed] = useState(true);
  const [restockInventory, setRestockInventory] = useState(true);
  const [notes, setNotes] = useState('Product tags intact; passed 10-point quality check.');
  const [submitting, setSubmitting] = useState(false);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const data = await companyService.getReturns();
      setReturns(data || []);
    } catch (err) {
      error('Failed to load warehouse returns queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleConfirmInspection = async (e) => {
    e.preventDefault();
    if (!inspectingOrder) return;

    setSubmitting(true);
    const id = inspectingOrder._id || inspectingOrder.orderId;
    try {
      await companyService.inspectReturn(id, {
        inspectionPassed,
        restockInventory,
        notes,
      });
      success(`Return inspection completed for Order #${inspectingOrder.orderId || id}! Restocked: ${restockInventory}`);
      setInspectingOrder(null);
      fetchReturns();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to complete return inspection');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Returns Quality Inspection & Restocking ({returns.length})
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Physical intake station for parcels returned by customers. Verify condition and restock into inventory.
          </p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={fetchReturns} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Returns
        </button>
      </div>

      {loading ? (
        <Loader message="Scanning returns intake bay..." />
      ) : returns.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
          <RotateCcw size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3>No Returns Awaiting Inspection</h3>
          <p style={{ maxWidth: 420, margin: '8px auto 0', fontSize: '0.9rem' }}>
            All customer returns have been inspected and restocked into the active catalog inventory.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {returns.map((ord) => {
            const id = ord._id || ord.orderId;
            const isCompleted = ord.status === 'Returned';

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
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>
                        Customer Return
                      </span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '2px 0 0' }}>
                        #{ord.orderId || id.slice(-8)}
                      </h3>
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 4,
                        backgroundColor: isCompleted ? '#dcfce7' : '#fee2e2',
                        color: isCompleted ? '#15803d' : '#b91c1c',
                      }}
                    >
                      {isCompleted ? 'INSPECTED & RESTOCKED' : 'AWAITING INSPECTION'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem', margin: '14px 0' }}>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Customer: </span>
                      <strong>{ord.shippingAddress?.name || ord.user?.name || 'Customer'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Return Reason: </span>
                      <span>{ord.returnReason || 'Size / Fit Exchange'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Items to Inspect: </span>
                      <span>{ord.items?.length || 1} product(s) (₹{ord.total})</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  {!isCompleted ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', backgroundColor: '#0d9488', borderColor: '#0d9488' }}
                      onClick={() => setInspectingOrder(ord)}
                    >
                      <CheckCircle size={14} /> Perform Physical QC & Restock
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>
                      Inspection Completed • Refund Triggered
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspection Modal */}
      {inspectingOrder && (
        <Modal
          isOpen={!!inspectingOrder}
          onClose={() => setInspectingOrder(null)}
          title={`Return QC Inspection: #${inspectingOrder.orderId || inspectingOrder._id}`}
        >
          <form onSubmit={handleConfirmInspection} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={inspectionPassed}
                  onChange={(e) => setInspectionPassed(e.target.checked)}
                />
                <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                  Product passed physical quality inspection (tags attached, unworn)
                </span>
              </label>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={restockInventory}
                  onChange={(e) => setRestockInventory(e.target.checked)}
                />
                <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                  Restock product quantities back into live catalog inventory (+1 stock)
                </span>
              </label>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                Warehouse Inspection Notes
              </label>
              <textarea
                rows={3}
                className="input-field"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-outline" onClick={() => setInspectingOrder(null)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }}
                disabled={submitting}
              >
                {submitting ? 'Confirming...' : 'Approve & Trigger Refund'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
