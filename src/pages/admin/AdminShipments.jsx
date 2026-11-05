import React, { useState, useEffect } from 'react';
import { Compass, Truck, Search, RefreshCw, UserCheck, Eye } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const AdminShipments = () => {
  const { success, error } = useToast();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [staffList, setStaffList] = useState([]);

  // Assign modal
  const [assigningShipment, setAssigningShipment] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await adminService.getShipments({
        status: statusFilter || undefined,
        q: search.trim() || undefined,
      });
      setShipments(res.shipments || []);
    } catch (err) {
      error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    adminService.getStaff().then((st) => {
      setStaffList((st || []).filter((s) => s.role === 'delivery_staff' && s.status === 'active'));
    });
  }, []);

  useEffect(() => {
    fetchShipments();
  }, [statusFilter]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assigningShipment || !selectedStaffId) return;

    try {
      await adminService.assignShipmentStaff(
        assigningShipment.shipmentId || assigningShipment._id,
        selectedStaffId
      );
      success(`Courier assigned to #${assigningShipment.shipmentId}`);
      setAssigningShipment(null);
      fetchShipments();
    } catch (err) {
      error('Failed to assign shipment');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase' }}>
            All Waybill Shipments
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            Hub packages, last-mile runs and dispatch lifecycles
          </p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={fetchShipments}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

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
        <div style={{ flex: 1, minWidth: 260 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by Waybill ID, Order ID or Recipient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-control"
          style={{ width: '220px' }}
        >
          <option value="">All Statuses</option>
          <option value="Created">Created</option>
          <option value="In Transit">In Transit</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Delivery Failed">Delivery Failed</option>
        </select>
      </div>

      {loading ? (
        <Loader size="large" text="Reading logistics records..." />
      ) : (
        <div className="portal-table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Waybill</th>
                <th>Order Ref</th>
                <th>Destination</th>
                <th>Assigned Courier</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shp) => (
                <tr key={shp._id || shp.shipmentId}>
                  <td><strong>{shp.shipmentId}</strong></td>
                  <td>{shp.orderId}</td>
                  <td>
                    <div><strong>{shp.recipient?.name}</strong></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      {shp.recipient?.city} ({shp.recipient?.pincode})
                    </div>
                  </td>
                  <td>
                    {shp.deliveryStaff ? (
                      <div>
                        <strong>{shp.deliveryStaff.name}</strong>
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                          {shp.deliveryStaff.assignedVehicle || 'Vehicle'}
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
                          : 'badge-warning'
                      }`}
                    >
                      {shp.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setAssigningShipment(shp);
                        setSelectedStaffId(shp.deliveryStaff?._id || '');
                      }}
                    >
                      <UserCheck size={13} /> Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={!!assigningShipment}
        onClose={() => setAssigningShipment(null)}
        title={`Assign Courier: #${assigningShipment?.shipmentId}`}
      >
        <form onSubmit={handleAssign}>
          <div className="form-group">
            <label className="form-label">Select Courier Rider</label>
            <select
              className="form-control"
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              required
            >
              <option value="">Choose rider...</option>
              {staffList.map((st) => (
                <option key={st._id || st.id} value={st._id || st.id}>
                  {st.name} ({st.assignedVehicle})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setAssigningShipment(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
