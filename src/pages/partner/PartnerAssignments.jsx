import React, { useState, useEffect } from 'react';
import {
  Users,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  ChevronRight,
  Package
} from 'lucide-react';
import { partnerService } from '../../services/partnerService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const PartnerAssignments = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [drivers, setDrivers] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [availableShipments, setAvailableShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign modal
  const [targetDriver, setTargetDriver] = useState(null);
  const [selectedShipmentId, setSelectedShipmentId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchAssignmentData = async () => {
    setLoading(true);
    try {
      const [driversRes, shipmentsRes, availableRes] = await Promise.all([
        partnerService.getDeliveryStaff().catch(() => []),
        partnerService.getShipments({ limit: 100 }).catch(() => ({ shipments: [] })),
        partnerService.getAvailableShipments().catch(() => []),
      ]);

      setDrivers(driversRes || []);
      setShipments(shipmentsRes.shipments || []);
      setAvailableShipments(availableRes || []);
    } catch (err) {
      error('Failed to load dispatch board data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentData();
  }, []);

  const handleAssignToDriver = async (e) => {
    e.preventDefault();
    if (!targetDriver || !selectedShipmentId) return;

    setAssigning(true);
    try {
      await partnerService.assignDeliveryStaff(selectedShipmentId, targetDriver._id, user?._id || user?.id);
      success(`Shipment successfully assigned to driver ${targetDriver.name}`);
      setTargetDriver(null);
      setSelectedShipmentId('');
      fetchAssignmentData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to assign shipment to driver');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Driver Workload & Dispatch Board
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Monitor route saturation, parcel balances and courier allocations in real-time.
          </p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={fetchAssignmentData} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Board
        </button>
      </div>

      {loading ? (
        <Loader message="Synthesizing driver allocations & active runs..." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {drivers.map((driver) => {
            const driverShipments = shipments.filter(
              (s) => s.deliveryStaff?._id === driver._id || s.deliveryStaff === driver._id
            );
            const activeRuns = driverShipments.filter(
              (s) => s.status !== 'Delivered' && s.status !== 'Delivery Failed'
            );
            const completedRuns = driverShipments.filter((s) => s.status === 'Delivered');

            const isHighLoad = activeRuns.length >= 8;
            const isMediumLoad = activeRuns.length >= 4 && activeRuns.length < 8;

            return (
              <div
                key={driver._id}
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
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{driver.name}</h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2 }}>
                        {driver.email} • {driver.phone || 'Phone on file'}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 4,
                        backgroundColor: isHighLoad ? '#fce8e6' : isMediumLoad ? '#fff4e5' : '#e6f4ea',
                        color: isHighLoad ? '#c5221f' : isMediumLoad ? '#b78103' : '#137333'
                      }}
                    >
                      {isHighLoad ? 'High Load' : isMediumLoad ? 'Optimal' : 'Available Capacity'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '16px 0', backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8 }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Active Tasks
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', marginTop: 2 }}>
                        {activeRuns.length}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Completed Runs
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#03a685', marginTop: 2 }}>
                        {completedRuns.length}
                      </div>
                    </div>
                  </div>

                  {activeRuns.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      Current Stops: {activeRuns.slice(0, 3).map((r) => r.deliveryAddress?.locality || r.deliveryAddress?.city || 'Stop').join(', ')}
                      {activeRuns.length > 3 ? ` +${activeRuns.length - 3} more` : ''}
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 14 }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', backgroundColor: '#03a685', borderColor: '#03a685' }}
                    onClick={() => {
                      setTargetDriver(driver);
                      setSelectedShipmentId(availableShipments[0]?.shipmentId || availableShipments[0]?._id || '');
                    }}
                    disabled={availableShipments.length === 0}
                  >
                    <Package size={14} /> Assign Package to {driver.name.split(' ')[0]}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Modal */}
      {targetDriver && (
        <Modal
          isOpen={!!targetDriver}
          onClose={() => setTargetDriver(null)}
          title={`Assign Shipment to Driver: ${targetDriver.name}`}
        >
          <form onSubmit={handleAssignToDriver} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {availableShipments.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                No unassigned shipments available in the hub at this moment.
              </p>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                  Select Package to Dispatch *
                </label>
                <select
                  required
                  className="input-field"
                  value={selectedShipmentId}
                  onChange={(e) => setSelectedShipmentId(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">-- Choose Waybill --</option>
                  {availableShipments.map((shp) => {
                    const id = shp.shipmentId || shp._id;
                    return (
                      <option key={id} value={id}>
                        #{shp.shipmentId || id.slice(-8)} — {shp.deliveryAddress?.city || 'City'} ({shp.deliveryAddress?.pincode || 'Pincode'})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button type="button" className="btn btn-outline" onClick={() => setTargetDriver(null)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#03a685', borderColor: '#03a685' }}
                disabled={assigning || !selectedShipmentId}
              >
                {assigning ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
