import React, { useState, useEffect } from 'react';
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
  UserCheck
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const DeliveryDashboard = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Outcome modal
  const [outcomeShipment, setOutcomeShipment] = useState(null);
  const [outcomeStatus, setOutcomeStatus] = useState('delivered');
  const [recipientName, setRecipientName] = useState('');
  const [failureReason, setFailureReason] = useState('Customer unavailable');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDeliveryStaffTasks();
      setTasks(res.shipments || res.tasks || res || []);
    } catch (err) {
      error('Failed to load assigned delivery queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleOpenOutcome = (shp, defaultOutcome) => {
    setOutcomeShipment(shp);
    setOutcomeStatus(defaultOutcome);
    setRecipientName(shp.recipient?.name || '');
    setNotes(defaultOutcome === 'delivered' ? 'Delivered with customer signature' : 'Customer unreachable via phone');
  };

  const handleRecordOutcome = async (e) => {
    e.preventDefault();
    if (!outcomeShipment) return;

    setSubmitting(true);
    try {
      await adminService.recordDeliveryOutcome(
        outcomeShipment.shipmentId || outcomeShipment._id,
        {
          outcome: outcomeStatus,
          recipientName: outcomeStatus === 'delivered' ? recipientName : undefined,
          failureReason: outcomeStatus === 'failed' ? failureReason : undefined,
          notes,
        }
      );
      success(`Delivery outcome recorded for Shipment #${outcomeShipment.shipmentId}`);
      setOutcomeShipment(null);
      fetchTasks();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit delivery outcome');
    } finally {
      setSubmitting(false);
    }
  };

  const activeDeliveries = tasks.filter((t) => t.status !== 'Delivered' && t.status !== 'Delivery Failed');
  const completedDeliveries = tasks.filter((t) => t.status === 'Delivered' || t.status === 'Delivery Failed');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Courier Delivery Queue
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            Assigned Rider: <strong>{user?.name}</strong> • Vehicle: {user?.assignedVehicle || 'Scooter Fleet'}
          </p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={fetchTasks}>
          <RefreshCw size={14} /> Refresh Queue
        </button>
      </div>

      {loading ? (
        <Loader size="large" text="Retrieving today's parcel runs..." />
      ) : (
        <div>
          {/* Active Deliveries */}
          <div style={{ marginBottom: 36 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Truck size={20} color="var(--primary)" /> Today's Active Drop-offs ({activeDeliveries.length})
            </h3>

            {activeDeliveries.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '32px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                  color: 'var(--muted)',
                }}
              >
                No active drop-offs pending in your queue right now. Great job!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                {activeDeliveries.map((shp) => (
                  <div
                    key={shp._id || shp.shipmentId}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      padding: 20,
                      boxShadow: 'var(--shadow-card)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700 }}>
                          WAYBILL: {shp.shipmentId}
                        </span>
                        <div style={{ fontWeight: 800, fontSize: '1rem', marginTop: 2 }}>
                          Order #{shp.orderId}
                        </div>
                      </div>
                      <span className="badge badge-warning">{shp.status}</span>
                    </div>

                    {/* Recipient Information */}
                    <div
                      style={{
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 6,
                        padding: 12,
                        marginBottom: 16,
                        fontSize: '0.85rem',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{shp.recipient?.name}</div>
                      <div style={{ color: 'var(--secondary)', marginTop: 4, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <MapPin size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>
                          {shp.recipient?.street}, {shp.recipient?.locality ? `${shp.recipient?.locality}, ` : ''}{shp.recipient?.city} - <strong>{shp.recipient?.pincode}</strong>
                        </span>
                      </div>
                      <div style={{ color: 'var(--dark)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                        <Phone size={14} /> {shp.recipient?.mobile}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, backgroundColor: 'var(--success)' }}
                        onClick={() => handleOpenOutcome(shp, 'delivered')}
                      >
                        <CheckCircle size={14} /> Delivered
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                        onClick={() => handleOpenOutcome(shp, 'failed')}
                      >
                        <XCircle size={14} /> Failed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed History */}
          {completedDeliveries.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={20} color="var(--success)" /> Completed Deliveries ({completedDeliveries.length})
              </h3>

              <div className="portal-table-container">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Shipment ID</th>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Location</th>
                      <th>Outcome</th>
                      <th>Updated At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedDeliveries.map((shp) => (
                      <tr key={shp._id || shp.shipmentId}>
                        <td><strong>{shp.shipmentId}</strong></td>
                        <td>{shp.orderId}</td>
                        <td>{shp.recipient?.name}</td>
                        <td>{shp.recipient?.city}</td>
                        <td>
                          <span className={`badge ${shp.status === 'Delivered' ? 'badge-success' : 'badge-danger'}`}>
                            {shp.status}
                          </span>
                        </td>
                        <td>{new Date(shp.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Record Outcome Modal */}
      <Modal
        isOpen={!!outcomeShipment}
        onClose={() => setOutcomeShipment(null)}
        title={`Record Outcome: #${outcomeShipment?.shipmentId}`}
      >
        <form onSubmit={handleRecordOutcome}>
          <div className="form-group">
            <label className="form-label">Delivery Outcome *</label>
            <select
              className="form-control"
              value={outcomeStatus}
              onChange={(e) => setOutcomeStatus(e.target.value)}
              required
            >
              <option value="delivered">Delivered Successfully</option>
              <option value="failed">Delivery Failed / Customer Unavailable</option>
            </select>
          </div>

          {outcomeStatus === 'delivered' ? (
            <div className="form-group">
              <label className="form-label">Received By (Customer or Family Member) *</label>
              <input
                type="text"
                className="form-control"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Reason for Non-Delivery *</label>
              <select
                className="form-control"
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                required
              >
                <option value="Customer unavailable">Customer unavailable at premises</option>
                <option value="Phone unanswered">Phone unanswered after 3 attempts</option>
                <option value="Incomplete / incorrect address">Incomplete or incorrect address</option>
                <option value="Customer refused delivery">Customer refused delivery</option>
                <option value="Security / gate entry restricted">Security / gate entry restricted</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Driver Notes</label>
            <textarea
              className="form-control"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setOutcomeShipment(null)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submitting}
              style={{
                backgroundColor: outcomeStatus === 'delivered' ? 'var(--success)' : 'var(--danger)',
              }}
            >
              {submitting ? 'Submitting...' : 'Confirm Delivery Outcome'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
