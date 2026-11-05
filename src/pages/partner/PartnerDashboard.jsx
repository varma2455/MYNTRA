import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Send,
  Eye,
  RefreshCw,
  Search,
  ArrowRight,
  Navigation,
  Car,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { partnerService } from '../../services/partnerService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const PartnerDashboard = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [metrics, setMetrics] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [availableShipments, setAvailableShipments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick assign modal
  const [assigningShipment, setAssigningShipment] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsRes, shipmentsRes, availableRes, staffRes] = await Promise.all([
        partnerService.getDashboardMetrics().catch(() => null),
        partnerService.getShipments({ limit: 10 }).catch(() => ({ shipments: [] })),
        partnerService.getAvailableShipments().catch(() => []),
        partnerService.getDeliveryStaff().catch(() => []),
      ]);

      setMetrics(metricsRes || {});
      setShipments(shipmentsRes.shipments || []);
      setAvailableShipments(availableRes || []);
      setStaffList(staffRes || []);
    } catch (err) {
      error('Failed to load travel partner dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAssignStaff = async (e) => {
    e.preventDefault();
    if (!assigningShipment || !selectedStaffId) return;

    setAssigning(true);
    const id = assigningShipment.shipmentId || assigningShipment._id;
    try {
      await partnerService.assignDeliveryStaff(id, selectedStaffId, user?._id || user?.id);
      success(`Shipment #${assigningShipment.shipmentId || id} assigned to driver successfully.`);
      setAssigningShipment(null);
      fetchDashboardData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to assign driver');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Travel Partner Logistics Operations
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Hub Dispatch Control • Partner: <strong>{user?.name || 'Express Logistics Partner'}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={fetchDashboardData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Operations
          </button>
          <Link to="/partner/available-shipments" className="btn btn-primary btn-sm" style={{ backgroundColor: '#03a685', borderColor: '#03a685' }}>
            Ready for Dispatch ({availableShipments.length})
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Pending Dispatch
            </span>
            <Clock size={20} color="#ff905a" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#ff905a' }}>
            {availableShipments.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
            Unassigned shipments in hub
          </div>
        </div>

        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              In Transit
            </span>
            <Truck size={20} color="#1a73e8" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#1a73e8' }}>
            {metrics?.inTransitCount || shipments.filter((s) => s.status === 'In Transit').length || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
            Actively moving between hubs
          </div>
        </div>

        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Out for Delivery
            </span>
            <Navigation size={20} color="#03a685" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#03a685' }}>
            {metrics?.outForDeliveryCount || shipments.filter((s) => s.status === 'Out for Delivery').length || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
            With last-mile couriers
          </div>
        </div>

        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Active Drivers
            </span>
            <UserCheck size={20} color="#6f42c1" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#6f42c1' }}>
            {staffList.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
            Ready for route assignment
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Shipments & Quick Hub Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Recent Shipments Table */}
        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Active Waybills Overview</h3>
            <Link to="/partner/shipments" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#03a685', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All Shipments <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <Loader message="Loading hub waybills..." />
          ) : shipments.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center', color: 'var(--muted)' }}>
              No shipments found in hub registry.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th style={{ padding: '10px 12px' }}>Waybill</th>
                    <th style={{ padding: '10px 12px' }}>Destination</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                    <th style={{ padding: '10px 12px' }}>Assigned Driver</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.slice(0, 8).map((shp) => {
                    const id = shp.shipmentId || shp._id;
                    const hasDriver = !!shp.deliveryStaff;

                    return (
                      <tr key={id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                          <Link to={`/partner/shipments/${id}`} style={{ color: '#03a685' }}>
                            #{shp.shipmentId || id.slice(-8)}
                          </Link>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {shp.deliveryAddress?.city || 'Bengaluru'} - {shp.deliveryAddress?.pincode || '560001'}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 6px',
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
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {hasDriver ? (
                            <span style={{ fontWeight: 600 }}>
                              {shp.deliveryStaff?.name || 'Assigned Courier'}
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ padding: '2px 8px', fontSize: '0.75rem', borderColor: '#ff905a', color: '#ff905a' }}
                              onClick={() => {
                                setAssigningShipment(shp);
                                setSelectedStaffId(staffList[0]?._id || '');
                              }}
                            >
                              Assign Driver
                            </button>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          <Link to={`/partner/shipments/${id}`} className="btn btn-outline btn-sm" style={{ padding: '2px 6px' }}>
                            <Eye size={12} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Operations Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>Quick Hub Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                to="/partner/available-shipments"
                className="btn btn-outline"
                style={{ justifyContent: 'flex-start', gap: 10, borderColor: 'var(--border)' }}
              >
                <Clock size={16} color="#ff905a" />
                <span>Dispatch Ready Shipments</span>
              </Link>
              <Link
                to="/partner/assignments"
                className="btn btn-outline"
                style={{ justifyContent: 'flex-start', gap: 10, borderColor: 'var(--border)' }}
              >
                <CheckCircle2 size={16} color="#03a685" />
                <span>Driver Workload Board</span>
              </Link>
              <Link
                to="/partner/tracking"
                className="btn btn-outline"
                style={{ justifyContent: 'flex-start', gap: 10, borderColor: 'var(--border)' }}
              >
                <Navigation size={16} color="#1a73e8" />
                <span>Live Route Tracking</span>
              </Link>
              <Link
                to="/partner/vehicles"
                className="btn btn-outline"
                style={{ justifyContent: 'flex-start', gap: 10, borderColor: 'var(--border)' }}
              >
                <Car size={16} color="#6f42c1" />
                <span>Fleet & Vehicle Manager</span>
              </Link>
            </div>
          </div>

          {/* Assigned Hub Information */}
          <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)', backgroundColor: '#fdfdfd' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>
              Operating Logistics Hub
            </h4>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>Bengaluru Regional Sorting Hub #04</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 4, lineHeight: 1.4 }}>
              Serving Electronic City, Koramangala, Indiranagar, and Whitefield corridors.
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--muted)' }}>Hub SLA Compliance:</span>
              <strong style={{ color: '#03a685' }}>98.4% On-Time</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Assignment Modal */}
      {assigningShipment && (
        <Modal
          isOpen={!!assigningShipment}
          onClose={() => setAssigningShipment(null)}
          title={`Assign Courier to #${assigningShipment.shipmentId || assigningShipment._id}`}
        >
          <form onSubmit={handleAssignStaff} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Select Delivery Driver *
              </label>
              <select
                required
                className="input-field"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">-- Choose Driver --</option>
                {staffList.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name} ({driver.phone || driver.email})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button type="button" className="btn btn-outline" onClick={() => setAssigningShipment(null)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#03a685', borderColor: '#03a685' }}
                disabled={assigning || !selectedStaffId}
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
