import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  MapPin,
  Phone,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Truck,
  Clock,
  ShieldCheck,
  FileText,
  Navigation,
  DollarSign
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { partnerService } from '../../services/partnerService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const DeliveryShipmentDetail = () => {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status update
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('Out for Delivery');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  // Outcome submission
  const [outcomeModal, setOutcomeModal] = useState(false);
  const [outcomeStatus, setOutcomeStatus] = useState('delivered');
  const [recipientName, setRecipientName] = useState('');
  const [failureReason, setFailureReason] = useState('Customer unavailable');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [submittingOutcome, setSubmittingOutcome] = useState(false);

  const fetchShipment = async () => {
    setLoading(true);
    try {
      const data = await deliveryService.getDeliveryById(shipmentId);
      setShipment(data);
      setRecipientName(data?.deliveryAddress?.name || data?.recipient?.name || '');
    } catch (err) {
      error('Failed to load shipment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shipmentId) {
      fetchShipment();
    }
  }, [shipmentId]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await partnerService.updateShipmentStatus(shipmentId, newStatus, statusNote);
      success(`Updated shipment status to "${newStatus}"`);
      setStatusModal(false);
      fetchShipment();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleRecordOutcome = async (e) => {
    e.preventDefault();
    setSubmittingOutcome(true);
    try {
      await deliveryService.recordOutcome(shipmentId, {
        outcome: outcomeStatus,
        recipientName: outcomeStatus === 'delivered' ? recipientName : undefined,
        failureReason: outcomeStatus === 'failed' ? failureReason : undefined,
        notes: outcomeNotes,
      });
      success(`Delivery outcome successfully recorded!`);
      setOutcomeModal(false);
      fetchShipment();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit delivery outcome');
    } finally {
      setSubmittingOutcome(false);
    }
  };

  if (loading) {
    return <Loader message="Fetching waybill and package telemetry..." />;
  }

  if (!shipment) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <Package size={48} style={{ opacity: 0.4, margin: '0 auto 16px' }} />
        <h3>Shipment Not Found</h3>
        <p style={{ color: 'var(--muted)', margin: '8px 0 16px' }}>
          Could not locate shipment ID #{shipmentId} in the delivery network.
        </p>
        <Link to="/delivery/my-deliveries" className="btn btn-outline btn-sm">
          <ArrowLeft size={14} /> Back to My Deliveries
        </Link>
      </div>
    );
  }

  const isCompleted = shipment.status === 'Delivered' || shipment.status === 'Delivery Failed';
  const isCod = shipment.paymentMethod === 'cod' || shipment.paymentStatus === 'pending';
  const destAddress = shipment.deliveryAddress || {};

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link
          to="/delivery/my-deliveries"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 12 }}
        >
          <ArrowLeft size={16} /> Back to My Deliveries
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
                Waybill #{shipment.shipmentId || shipment._id}
              </h1>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 20,
                  backgroundColor:
                    shipment.status === 'Delivered'
                      ? '#e6f4ea'
                      : shipment.status === 'Delivery Failed'
                      ? '#fce8e6'
                      : '#fff4e5',
                  color:
                    shipment.status === 'Delivered'
                      ? '#137333'
                      : shipment.status === 'Delivery Failed'
                      ? '#c5221f'
                      : '#b78103'
                }}
              >
                {shipment.status}
              </span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Tracking Code: <strong>{shipment.trackingNumber || `TRK-${(shipment.shipmentId || shipment._id).slice(-8).toUpperCase()}`}</strong>
            </p>
          </div>

          {!isCompleted && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setStatusModal(true)}
              >
                <Navigation size={14} /> Update Transit Status
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#03a685', borderColor: '#03a685' }}
                onClick={() => setOutcomeModal(true)}
              >
                <CheckCircle size={14} /> Submit Final Outcome
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Recipient Card */}
        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} color="var(--primary)" /> Destination & Customer Contact
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                Recipient Name
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: 2 }}>
                {destAddress.name || shipment.recipient?.name || 'Customer'}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                Delivery Address
              </div>
              <div style={{ marginTop: 2, lineHeight: 1.4 }}>
                {destAddress.street || destAddress.locality || 'Address Line 1'}
                <br />
                {destAddress.locality ? `${destAddress.locality}, ` : ''}
                {destAddress.city || 'Bengaluru'}, {destAddress.state || 'Karnataka'} - <strong>{destAddress.pincode || '560001'}</strong>
              </div>
            </div>

            {(destAddress.mobile || shipment.recipient?.phone) && (
              <div style={{ marginTop: 8 }}>
                <a
                  href={`tel:${destAddress.mobile || shipment.recipient?.phone}`}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1a73e8', borderColor: '#1a73e8' }}
                >
                  <Phone size={14} /> Call Customer: {destAddress.mobile || shipment.recipient?.phone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Order & Payment Card */}
        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={18} color="#ff905a" /> Order & Payment Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Associated Order:</span>
              <strong>#{typeof shipment.orderId === 'object' ? shipment.orderId._id || shipment.orderId.orderNumber : shipment.orderId}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Payment Mode:</span>
              <strong style={{ color: isCod ? '#b78103' : '#137333' }}>
                {isCod ? 'Cash on Delivery (COD)' : 'Prepaid Online'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Amount to Collect:</span>
              <strong style={{ fontSize: '1.1rem', color: isCod ? '#ff3f6c' : 'var(--text-dark)' }}>
                {isCod ? `₹${shipment.orderId?.totalAmount || shipment.amount || 0}` : '₹0.00 (Paid)'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Package Count:</span>
              <span>{shipment.itemsCount || shipment.items?.length || 1} item(s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipment Events Timeline */}
      <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={18} color="#1a73e8" /> Real-time Waybill Timeline
        </h3>

        {(!shipment.events || shipment.events.length === 0) ? (
          <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No telemetry logs recorded yet.</div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ position: 'absolute', left: 7, top: 4, bottom: 4, width: 2, backgroundColor: 'var(--border)' }} />
            {shipment.events.map((evt, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: -24,
                    top: 2,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: idx === shipment.events.length - 1 ? '#03a685' : '#1a73e8',
                    border: '3px solid #fff'
                  }}
                />
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{evt.status}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2 }}>
                  {evt.location && <span>{evt.location} • </span>}
                  {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : 'Recent update'}
                </div>
                {evt.note && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-dark)', marginTop: 4, fontStyle: 'italic' }}>
                    "{evt.note}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Modal */}
      {statusModal && (
        <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title="Update Waybill Status">
          <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                New Transit Status
              </label>
              <select
                className="input-field"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="In Transit">In Transit (Sorted at Hub)</option>
                <option value="Out for Delivery">Out for Delivery (On Rider Vehicle)</option>
                <option value="Delivery Attempted">Delivery Attempted (Rescheduling)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Courier Notes / Checkpoint Location
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Indiranagar sector delivery van loaded"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button type="button" className="btn btn-outline" onClick={() => setStatusModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={updating}>
                {updating ? 'Saving...' : 'Apply Status'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Outcome Modal */}
      {outcomeModal && (
        <Modal isOpen={outcomeModal} onClose={() => setOutcomeModal(false)} title="Submit Proof of Delivery Outcome">
          <form onSubmit={handleRecordOutcome} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Final Run Outcome
              </label>
              <select
                className="input-field"
                value={outcomeStatus}
                onChange={(e) => setOutcomeStatus(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="delivered">Delivered Successfully</option>
                <option value="failed">Delivery Failed</option>
              </select>
            </div>

            {outcomeStatus === 'delivered' ? (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                  Received By (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Customer signature verified"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                  Reason for Failure *
                </label>
                <select
                  className="input-field"
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Customer unavailable">Customer unavailable / Door locked</option>
                  <option value="Customer refused parcel">Customer refused parcel</option>
                  <option value="Cash not ready">Cash not ready (COD)</option>
                  <option value="Address incorrect">Wrong address / Untraceable location</option>
                </select>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Delivery Log Remarks
              </label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Proof of handover or verification notes..."
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button type="button" className="btn btn-outline" onClick={() => setOutcomeModal(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  backgroundColor: outcomeStatus === 'delivered' ? '#03a685' : '#c5221f',
                  borderColor: outcomeStatus === 'delivered' ? '#03a685' : '#c5221f'
                }}
                disabled={submittingOutcome}
              >
                {submittingOutcome ? 'Recording...' : 'Submit Proof'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
