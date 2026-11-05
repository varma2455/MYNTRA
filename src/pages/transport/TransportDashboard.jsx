import React, { useState, useEffect } from 'react';
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
  Search
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const TransportDashboard = () => {
  const { success, error } = useToast();
  const [metrics, setMetrics] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Assign staff modal
  const [assigningShipment, setAssigningShipment] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Update status modal
  const [updatingShipment, setUpdatingShipment] = useState(null);
  const [newStatus, setNewStatus] = useState('In Transit');
  const [statusLocation, setStatusLocation] = useState('Bengaluru Central Hub');
  const [statusNote, setStatusNote] = useState('Sorted and dispatched to delivery station');
  const [updating, setUpdating] = useState(false);

  const fetchTransportData = async () => {
    setLoading(true);
    try {
      const [metricsRes, shipmentsRes, staffRes] = await Promise.all([
        adminService.getTransportMetrics().catch(() => null),
        adminService.getShipments({
          status: statusFilter || undefined,
          q: search.trim() || undefined,
        }),
        adminService.getStaff().catch(() => []),
      ]);

      setMetrics(metricsRes?.metrics || metricsRes || {});
      setShipments(shipmentsRes.shipments || []);
      setStaffList((staffRes || []).filter((s) => s.role === 'delivery_staff' && s.status === 'active'));
    } catch (err) {
      error('Failed to load transport dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportData();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTransportData();
  };

  const handleAssignStaff = async (e) => {
    e.preventDefault();
    if (!assigningShipment || !selectedStaffId) return;

    setAssigning(true);
    try {
      await adminService.assignShipmentStaff(
        assigningShipment.shipmentId || assigningShipment._id,
        selectedStaffId
      );
      success(`Shipment #${assigningShipment.shipmentId} assigned to driver.`);
      setAssigningShipment(null);
      fetchTransportData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to assign staff');
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!updatingShipment) return;

    setUpdating(true);
    try {
      await adminService.updateShipmentStatus(
        updatingShipment.shipmentId || updatingShipment._id,
        newStatus,
        statusNote
      );
      success(`Shipment #${updatingShipment.shipmentId} status updated to ${newStatus}`);
      setUpdatingShipment(null);
      fetchTransportData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Transport & Logistics Operations
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            Fleet dispatch, rider assignments and hub-to-hub parcel movements
          </p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={fetchTransportData}>
          <RefreshCw size={14} /> Refresh Metrics
        </button>
      </div>

      {/* Top Transport Metric KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div style={{ backgroundColor: '#ffffff', padding: 18, borderRadius: 8, border: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Waybills
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 4 }}>
            {shipments.length || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>In active dispatch cycle</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: 18, borderRadius: 8, border: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Out For Delivery
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 4, color: 'var(--warning)' }}>
            {shipments.filter((s) => s.status === 'Out for Delivery').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: 2 }}>With delivery riders today</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: 18, borderRadius: 8, border: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Delivered Successfully
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 4, color: 'var(--success)' }}>
            {shipments.filter((s) => s.status === 'Delivered').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: 2 }}>Proof of delivery verified</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: 18, borderRadius: 8, border: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Active Drivers
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 4, color: 'var(--primary)' }}>
            {staffList.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: 2 }}>Ready for route allocation</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 20,
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, minWidth: 260, gap: 8 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by Shipment ID, Order ID or Recipient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-outline btn-sm">
            <Search size={14} /> Search
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-control"
          style={{ width: '220px' }}
        >
          <option value="">All Shipment Statuses</option>
          <option value="Created">Created</option>
          <option value="Awaiting Pickup">Awaiting Pickup</option>
          <option value="Picked Up">Picked Up</option>
          <option value="In Transit">In Transit</option>
          <option value="At Delivery Facility">At Delivery Facility</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Delivery Failed">Delivery Failed</option>
        </select>
      </div>

      {/* Shipments Table */}
      {loading ? (
        <Loader size="large" text="Syncing fleet shipments..." />
      ) : (
        <div className="portal-table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Shipment ID</th>
                <th>Order Ref</th>
                <th>Recipient & Destination</th>
                <th>Assigned Courier Rider</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                    No shipments found matching filters.
                  </td>
                </tr>
              ) : (
                shipments.map((shp) => (
                  <tr key={shp._id || shp.shipmentId}>
                    <td>
                      <strong>{shp.shipmentId}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                        {new Date(shp.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{shp.orderId}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{shp.recipient?.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                        {shp.recipient?.city}, {shp.recipient?.pincode}
                      </div>
                    </td>
                    <td>
                      {shp.deliveryStaff ? (
                        <div>
                          <strong>{shp.deliveryStaff.name}</strong>
                          <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                            {shp.deliveryStaff.assignedVehicle || 'Scooter'}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 700 }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          shp.status === 'Delivered'
                            ? 'badge-success'
                            : shp.status === 'Delivery Failed'
                            ? 'badge-danger'
                            : shp.status === 'Out for Delivery'
                            ? 'badge-warning'
                            : 'badge-info'
                        }`}
                      >
                        {shp.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          onClick={() => {
                            setAssigningShipment(shp);
                            setSelectedStaffId(shp.deliveryStaff?._id || '');
                          }}
                        >
                          <UserCheck size={13} /> Assign
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          onClick={() => {
                            setUpdatingShipment(shp);
                            setNewStatus(shp.status || 'In Transit');
                          }}
                        >
                          Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Delivery Staff Modal */}
      <Modal
        isOpen={!!assigningShipment}
        onClose={() => setAssigningShipment(null)}
        title={`Assign Courier Driver: #${assigningShipment?.shipmentId}`}
      >
        <form onSubmit={handleAssignStaff}>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: 16 }}>
            Destination: <strong>{assigningShipment?.recipient?.city} ({assigningShipment?.recipient?.pincode})</strong>
          </p>

          <div className="form-group">
            <label className="form-label">Select Delivery Staff Member *</label>
            <select
              className="form-control"
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              required
            >
              <option value="">Choose a delivery driver...</option>
              {staffList.map((st) => (
                <option key={st._id || st.id} value={st._id || st.id}>
                  {st.name} — ({st.assignedVehicle || 'Vehicle'} • {st.phone})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setAssigningShipment(null)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={assigning || !selectedStaffId}
            >
              {assigning ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Shipment Status Modal */}
      <Modal
        isOpen={!!updatingShipment}
        onClose={() => setUpdatingShipment(null)}
        title={`Update Shipment Status: #${updatingShipment?.shipmentId}`}
      >
        <form onSubmit={handleUpdateStatus}>
          <div className="form-group">
            <label className="form-label">New Status *</label>
            <select
              className="form-control"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              required
            >
              <option value="Created">Created</option>
              <option value="Awaiting Pickup">Awaiting Pickup</option>
              <option value="Picked Up">Picked Up</option>
              <option value="In Transit">In Transit</option>
              <option value="At Delivery Facility">At Delivery Facility</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Delivery Failed">Delivery Failed</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Facility / Hub Location</label>
            <input
              type="text"
              className="form-control"
              value={statusLocation}
              onChange={(e) => setStatusLocation(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status Notes / Event Detail</label>
            <textarea
              className="form-control"
              rows={2}
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setUpdatingShipment(null)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={updating}>
              {updating ? 'Updating...' : 'Save Status Update'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
