import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Truck,
  Package,
  MapPin,
  Clock,
  ArrowLeft,
  UserCheck,
  CheckCircle,
  Plus,
  Navigation,
  FileText
} from 'lucide-react';
import { partnerService } from '../../services/partnerService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const PartnerShipmentDetail = () => {
  const { shipmentId } = useParams();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [shipment, setShipment] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status modal
  const [statusModal, setStatusModal] = useState(false);
  const [status, setStatus] = useState('In Transit');
  const [location, setLocation] = useState('Regional Hub');
  const [note, setNote] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  // Assign modal
  const [assignModal, setAssignModal] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [savingAssign, setSavingAssign] = useState(false);

  // Telemetry event modal
  const [eventModal, setEventModal] = useState(false);
  const [eventStatus, setEventStatus] = useState('Departed Sorting Facility');
  const [eventLocation, setEventLocation] = useState('Hub 04 (South Bangalore)');
  const [eventNote, setEventNote] = useState('Container sealed and dispatched on feeder truck');
  const [savingEvent, setSavingEvent] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const [shpData, driversData] = await Promise.all([
        partnerService.getShipmentById(shipmentId),
        partnerService.getDeliveryStaff().catch(() => []),
      ]);
      setShipment(shpData);
      setDrivers(driversData || []);
      if (shpData?.deliveryStaff) {
        setSelectedDriverId(shpData.deliveryStaff._id || shpData.deliveryStaff);
      }
    } catch (err) {
      error('Failed to load shipment waybill record');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shipmentId) {
      fetchDetail();
    }
  }, [shipmentId]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSavingStatus(true);
    try {
      await partnerService.updateShipmentStatus(shipmentId, status, note, location);
      success(`Updated shipment status to "${status}"`);
      setStatusModal(false);
      fetchDetail();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAssignDriver = async (e) => {
    e.preventDefault();
    setSavingAssign(true);
    try {
      await partnerService.assignDeliveryStaff(shipmentId, selectedDriverId, user?._id || user?.id);
      success('Driver assignment saved');
      setAssignModal(false);
      fetchDetail();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to assign driver');
    } finally {
      setSavingAssign(false);
    }
  };

  const handleRecordEvent = async (e) => {
    e.preventDefault();
    setSavingEvent(true);
    try {
      await partnerService.recordTrackingEvent(shipmentId, {
        status: eventStatus,
        location: eventLocation,
        note: eventNote,
      });
      success('Telemetry event logged in blockchain-style waybill log');
      setEventModal(false);
      fetchDetail();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to record tracking event');
    } finally {
      setSavingEvent(false);
    }
  };

  if (loading) {
    return <Loader message="Retrieving waybill telemetry & cargo manifest..." />;
  }

  if (!shipment) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <Package size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
        <h3>Shipment Not Found</h3>
        <Link to="/partner/shipments" className="btn btn-outline btn-sm" style={{ marginTop: 12 }}>
          <ArrowLeft size={14} /> Back to Manifest
        </Link>
      </div>
    );
  }

  const dest = shipment.deliveryAddress || {};

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link
          to="/partner/shipments"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 12 }}
        >
          <ArrowLeft size={16} /> Back to All Shipments
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
                      : shipment.status === 'Out for Delivery'
                      ? '#fff4e5'
                      : '#e8f0fe',
                  color:
                    shipment.status === 'Delivered'
                      ? '#137333'
                      : shipment.status === 'Delivery Failed'
                      ? '#c5221f'
                      : shipment.status === 'Out for Delivery'
                      ? '#b78103'
                      : '#1a73e8'
                }}
              >
                {shipment.status}
              </span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Carrier Partner ID: {shipment.carrier || 'Express Direct'} • Created: {new Date(shipment.createdAt || Date.now()).toLocaleString()}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setAssignModal(true)}>
              <UserCheck size={14} /> {shipment.deliveryStaff ? 'Reassign Driver' : 'Assign Driver'}
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setStatusModal(true)}>
              <Navigation size={14} /> Change Status
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: '#03a685', borderColor: '#03a685' }}
              onClick={() => setEventModal(true)}
            >
              <Plus size={14} /> Log Milestone Event
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Recipient Info, Driver, and Order Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Recipient Details */}
        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} color="var(--primary)" /> Recipient & Sector Destination
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Customer Name
              </div>
              <div style={{ fontWeight: 700, marginTop: 2 }}>{dest.name || shipment.recipient?.name || 'Customer'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Address
              </div>
              <div style={{ marginTop: 2, lineHeight: 1.4 }}>
                {dest.street || dest.locality || 'Registered address'}
                <br />
                {dest.city || 'Bengaluru'}, {dest.state || 'Karnataka'} - <strong>{dest.pincode || '560001'}</strong>
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Contact Phone
              </div>
              <div style={{ marginTop: 2 }}>{dest.mobile || shipment.recipient?.phone || 'On file'}</div>
            </div>
          </div>
        </div>

        {/* Assigned Courier & Logistics Metadata */}
        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Truck size={18} color="#03a685" /> Last-Mile Courier Assignment
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Allocated Courier Driver
              </div>
              <div style={{ fontWeight: 700, marginTop: 2, fontSize: '1.05rem', color: shipment.deliveryStaff ? '#03a685' : '#ff905a' }}>
                {shipment.deliveryStaff?.name || 'Unassigned (Waiting for Driver)'}
              </div>
              {shipment.deliveryStaff?.phone && (
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2 }}>
                  Phone: {shipment.deliveryStaff.phone}
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Payment Modality
              </div>
              <div style={{ fontWeight: 600, marginTop: 2 }}>
                {shipment.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid (Direct Online)'}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Associated Order ID
              </div>
              <div style={{ marginTop: 2 }}>
                #{typeof shipment.orderId === 'object' ? shipment.orderId._id || shipment.orderId.orderNumber : shipment.orderId}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Tracking Events Timeline */}
      <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} color="#1a73e8" /> Waybill Telemetry Log Stream
          </h3>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setEventModal(true)}
          >
            <Plus size={14} /> Add Event
          </button>
        </div>

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
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-dark)', marginTop: 4 }}>
                    "{evt.note}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Driver Assignment Modal */}
      {assignModal && (
        <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title="Assign / Reassign Courier">
          <form onSubmit={handleAssignDriver} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Driver Roster Selection *
              </label>
              <select
                required
                className="input-field"
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">-- Choose Courier --</option>
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.phone || d.email})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button type="button" className="btn btn-outline" onClick={() => setAssignModal(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#03a685', borderColor: '#03a685' }}
                disabled={savingAssign || !selectedDriverId}
              >
                {savingAssign ? 'Saving...' : 'Confirm Assignment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Status Modal */}
      {statusModal && (
        <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title="Update Waybill Status">
          <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Status Selection
              </label>
              <select
                className="input-field"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="In Transit">In Transit</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Delivery Failed">Delivery Failed</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Location / Facility
              </label>
              <input
                type="text"
                className="input-field"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Operational Note
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Remarks about transit checkpoint"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button type="button" className="btn btn-outline" onClick={() => setStatusModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={savingStatus}>
                {savingStatus ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Log Telemetry Event Modal */}
      {eventModal && (
        <Modal isOpen={eventModal} onClose={() => setEventModal(false)} title="Log Telemetry Checkpoint">
          <form onSubmit={handleRecordEvent} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Milestone Event Name *
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={eventStatus}
                onChange={(e) => setEventStatus(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Checkpoint Location *
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Technical / Handover Details
              </label>
              <textarea
                className="input-field"
                rows={3}
                value={eventNote}
                onChange={(e) => setEventNote(e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button type="button" className="btn btn-outline" onClick={() => setEventModal(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#03a685', borderColor: '#03a685' }}
                disabled={savingEvent}
              >
                {savingEvent ? 'Logging...' : 'Save Telemetry Event'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
