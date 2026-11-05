import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  Navigation,
  Clock,
  ArrowRight,
  ChevronRight,
  Filter
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { partnerService } from '../../services/partnerService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const DeliveryMyDeliveries = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('active'); // 'active', 'delivered', 'all'

  // Outcome modal
  const [outcomeShipment, setOutcomeShipment] = useState(null);
  const [outcomeStatus, setOutcomeStatus] = useState('delivered');
  const [recipientName, setRecipientName] = useState('');
  const [failureReason, setFailureReason] = useState('Customer unavailable');
  const [notes, setNotes] = useState('');
  const [submittingOutcome, setSubmittingOutcome] = useState(false);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const data = await deliveryService.getMyDeliveries();
      setDeliveries(data || []);
    } catch (err) {
      error('Failed to load your assigned deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleUpdateStatus = async (shp, newStatus) => {
    const id = shp.shipmentId || shp._id;
    try {
      await partnerService.updateShipmentStatus(id, newStatus, `Courier updated status to ${newStatus}`);
      success(`Updated status of #${shp.shipmentId || id} to "${newStatus}"`);
      fetchDeliveries();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update delivery status');
    }
  };

  const openOutcomeModal = (shp, type) => {
    setOutcomeShipment(shp);
    setOutcomeStatus(type);
    setRecipientName(shp.recipient?.name || shp.customerName || '');
    setNotes(type === 'delivered' ? 'Delivered with recipient signature' : 'Customer unreachable after multiple calls');
  };

  const handleRecordOutcome = async (e) => {
    e.preventDefault();
    if (!outcomeShipment) return;

    setSubmittingOutcome(true);
    const id = outcomeShipment.shipmentId || outcomeShipment._id;
    try {
      await deliveryService.recordOutcome(id, {
        outcome: outcomeStatus,
        recipientName: outcomeStatus === 'delivered' ? recipientName : undefined,
        failureReason: outcomeStatus === 'failed' ? failureReason : undefined,
        notes,
      });
      success(`Recorded outcome for delivery #${outcomeShipment.shipmentId || id}`);
      setOutcomeShipment(null);
      fetchDeliveries();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit delivery outcome');
    } finally {
      setSubmittingOutcome(false);
    }
  };

  const filteredDeliveries = deliveries.filter((d) => {
    if (filterTab === 'active') {
      return d.status !== 'Delivered' && d.status !== 'Delivery Failed';
    }
    if (filterTab === 'delivered') {
      return d.status === 'Delivered';
    }
    if (filterTab === 'failed') {
      return d.status === 'Delivery Failed';
    }
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            My Active Deliveries
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Shipments assigned to courier <strong>{user?.name}</strong>. Manage your route and submit proof of delivery.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={fetchDeliveries} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh List
          </button>
          <Link to="/delivery/available-orders" className="btn btn-primary btn-sm" style={{ backgroundColor: '#ff905a', borderColor: '#ff905a' }}>
            Claim New Orders
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
        <button
          type="button"
          className={`btn btn-sm ${filterTab === 'active' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilterTab('active')}
          style={filterTab === 'active' ? { backgroundColor: '#ff905a', borderColor: '#ff905a' } : {}}
        >
          Active Tasks ({deliveries.filter((d) => d.status !== 'Delivered' && d.status !== 'Delivery Failed').length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${filterTab === 'delivered' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilterTab('delivered')}
          style={filterTab === 'delivered' ? { backgroundColor: '#03a685', borderColor: '#03a685' } : {}}
        >
          Delivered ({deliveries.filter((d) => d.status === 'Delivered').length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${filterTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilterTab('all')}
        >
          All Runs ({deliveries.length})
        </button>
      </div>

      {loading ? (
        <Loader message="Loading assigned delivery assignments..." />
      ) : filteredDeliveries.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
          <Truck size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)' }}>No deliveries found</h3>
          <p style={{ maxWidth: 420, margin: '8px auto 20px', fontSize: '0.9rem' }}>
            You have no deliveries matching this filter. Check the available pool to claim unassigned packages.
          </p>
          <Link to="/delivery/available-orders" className="btn btn-primary btn-sm" style={{ backgroundColor: '#ff905a', borderColor: '#ff905a' }}>
            Browse Available Orders
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredDeliveries.map((shp) => {
            const id = shp.shipmentId || shp._id;
            const isCompleted = shp.status === 'Delivered' || shp.status === 'Delivery Failed';

            return (
              <div
                key={id}
                className="card"
                style={{
                  padding: 20,
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                        Shipment #{shp.shipmentId || id.slice(-8)}
                      </h3>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 4,
                          backgroundColor:
                            shp.status === 'Delivered'
                              ? '#e6f4ea'
                              : shp.status === 'Delivery Failed'
                              ? '#fce8e6'
                              : shp.status === 'Out for Delivery'
                              ? '#fff4e5'
                              : '#e8f0fe',
                          color:
                            shp.status === 'Delivered'
                              ? '#137333'
                              : shp.status === 'Delivery Failed'
                              ? '#c5221f'
                              : shp.status === 'Out for Delivery'
                              ? '#b78103'
                              : '#1a73e8'
                        }}
                      >
                        {shp.status}
                      </span>
                    </div>
                    {shp.orderId && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>
                        Associated Order ID: #{typeof shp.orderId === 'object' ? shp.orderId._id || shp.orderId.orderNumber : shp.orderId}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link
                      to={`/delivery/delivery/${id}`}
                      className="btn btn-outline btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      Full Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 16,
                    backgroundColor: '#fafafa',
                    padding: 14,
                    borderRadius: 8,
                    marginBottom: 16,
                    fontSize: '0.85rem'
                  }}
                >
                  <div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      Customer / Recipient
                    </div>
                    <div style={{ fontWeight: 600, marginTop: 4 }}>
                      {shp.deliveryAddress?.name || shp.recipient?.name || 'Customer'}
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                      {shp.deliveryAddress?.mobile || shp.recipient?.phone || 'Contact provided on dispatch'}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      Delivery Location
                    </div>
                    <div style={{ fontWeight: 600, marginTop: 4 }}>
                      {shp.deliveryAddress?.city || 'Bengaluru'} - {shp.deliveryAddress?.pincode || '560001'}
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                      {shp.deliveryAddress?.street || shp.deliveryAddress?.locality || 'Address details in parcel record'}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      Package Content
                    </div>
                    <div style={{ fontWeight: 600, marginTop: 4 }}>
                      {shp.itemsCount || shp.items?.length || 1} Apparel Package(s)
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                      Payment: {shp.paymentMethod === 'cod' ? 'Cash on Delivery (Collect Cash)' : 'Prepaid (No Cash Due)'}
                    </div>
                  </div>
                </div>

                {/* Workflow action buttons */}
                {!isCompleted && (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                    {shp.status !== 'Out for Delivery' && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleUpdateStatus(shp, 'Out for Delivery')}
                      >
                        <Navigation size={14} /> Mark Out for Delivery
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ backgroundColor: '#c5221f', color: '#fff', borderColor: '#c5221f' }}
                      onClick={() => openOutcomeModal(shp, 'failed')}
                    >
                      <XCircle size={14} /> Report Failed
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ backgroundColor: '#03a685', borderColor: '#03a685' }}
                      onClick={() => openOutcomeModal(shp, 'delivered')}
                    >
                      <CheckCircle size={14} /> Mark as Delivered
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Outcome Submission Modal */}
      {outcomeShipment && (
        <Modal
          isOpen={!!outcomeShipment}
          onClose={() => setOutcomeShipment(null)}
          title={`Delivery Outcome for #${outcomeShipment.shipmentId || outcomeShipment._id}`}
        >
          <form onSubmit={handleRecordOutcome} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Outcome Status
              </label>
              <select
                className="input-field"
                value={outcomeStatus}
                onChange={(e) => setOutcomeStatus(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="delivered">Delivered (Success)</option>
                <option value="failed">Delivery Failed (Undeliverable)</option>
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
                  placeholder="e.g. John Doe (Customer / Household member)"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                  Failure Reason *
                </label>
                <select
                  className="input-field"
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Customer unavailable">Customer unavailable / Premises locked</option>
                  <option value="Customer refused parcel">Customer refused parcel / Cancelled at door</option>
                  <option value="Cash not ready">Customer did not have cash (COD)</option>
                  <option value="Incomplete / incorrect address">Incomplete or incorrect address</option>
                  <option value="Rescheduled by customer">Rescheduled by customer</option>
                </select>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Courier Remarks & Notes
              </label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Add delivery confirmation notes or attempt details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setOutcomeShipment(null)}
                disabled={submittingOutcome}
              >
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
                {submittingOutcome ? 'Saving Outcome...' : 'Confirm Outcome'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
