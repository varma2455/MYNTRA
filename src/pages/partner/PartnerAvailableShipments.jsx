import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  MapPin,
  RefreshCw,
  UserCheck,
  Send,
  AlertCircle
} from 'lucide-react';
import { partnerService } from '../../services/partnerService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const PartnerAvailableShipments = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [available, setAvailable] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign modal
  const [assignShipment, setAssignShipment] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchAvailable = async () => {
    setLoading(true);
    try {
      const [shipmentsRes, driversRes] = await Promise.all([
        partnerService.getAvailableShipments(),
        partnerService.getDeliveryStaff().catch(() => []),
      ]);
      setAvailable(shipmentsRes || []);
      setDrivers(driversRes || []);
    } catch (err) {
      error('Failed to load available shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailable();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignShipment || !selectedDriverId) return;

    setAssigning(true);
    const id = assignShipment.shipmentId || assignShipment._id;
    try {
      await partnerService.assignDeliveryStaff(id, selectedDriverId, user?._id || user?.id);
      success(`Shipment #${assignShipment.shipmentId || id} dispatched to driver`);
      setAssignShipment(null);
      fetchAvailable();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to dispatch shipment');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Ready for Dispatch ({available.length})
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Inward packages cleared by warehouse sorting and ready for courier route assignment.
          </p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={fetchAvailable} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Pool
        </button>
      </div>

      {loading ? (
        <Loader message="Checking hub intake conveyor..." />
      ) : available.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
          <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3>All Shipments Currently Dispatched</h3>
          <p style={{ maxWidth: 420, margin: '8px auto 0', fontSize: '0.9rem' }}>
            There are currently no unassigned packages in this hub. When new orders are placed and packed, they will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {available.map((shp) => {
            const id = shp.shipmentId || shp._id;
            const dest = shp.deliveryAddress || {};

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
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#03a685', textTransform: 'uppercase' }}>
                        Hub Inward Cleared
                      </span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '2px 0 0' }}>
                        #{shp.shipmentId || id.slice(-8)}
                      </h3>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 4,
                        backgroundColor: '#e8f0fe',
                        color: '#1a73e8'
                      }}
                    >
                      {shp.status || 'Order Placed'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem', margin: '14px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <strong>{dest.city || 'Bengaluru'} - {dest.pincode || '560001'}</strong>
                        <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                          {dest.locality || dest.street || 'Address record on file'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Package size={16} color="var(--muted)" />
                      <span>{shp.itemsCount || shp.items?.length || 1} Standard Parcel Package</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: '0.8rem' }}>
                      <Clock size={16} />
                      Created: {new Date(shp.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', backgroundColor: '#03a685', borderColor: '#03a685' }}
                    onClick={() => {
                      setAssignShipment(shp);
                      setSelectedDriverId(drivers[0]?._id || '');
                    }}
                  >
                    <UserCheck size={16} /> Dispatch to Driver
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Driver Assignment Modal */}
      {assignShipment && (
        <Modal
          isOpen={!!assignShipment}
          onClose={() => setAssignShipment(null)}
          title={`Dispatch Shipment #${assignShipment.shipmentId || assignShipment._id}`}
        >
          <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Select Delivery Driver *
              </label>
              <select
                required
                className="input-field"
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">-- Choose Driver --</option>
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.phone || d.email})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button type="button" className="btn btn-outline" onClick={() => setAssignShipment(null)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#03a685', borderColor: '#03a685' }}
                disabled={assigning || !selectedDriverId}
              >
                {assigning ? 'Dispatching...' : 'Confirm Dispatch'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
