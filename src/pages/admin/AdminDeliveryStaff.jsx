import React, { useState, useEffect } from 'react';
import { Navigation, Plus, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const AdminDeliveryStaff = () => {
  const { success, error } = useToast();
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'delivery_staff',
    assignedVehicle: 'Hero Electric Scooter',
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const data = await adminService.getStaff();
      setCouriers((data || []).filter((s) => s.role === 'delivery_staff'));
    } catch (err) {
      error('Failed to load couriers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminService.createStaff(formData);
      success(`Courier associate ${formData.name} added.`);
      setShowAddModal(false);
      fetchStaff();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add staff');
    }
  };

  const handleToggle = async (staff) => {
    const next = staff.status === 'active' ? 'suspended' : 'active';
    try {
      await adminService.updateStaffStatus(staff._id || staff.id, next);
      success(`Courier status set to ${next}`);
      fetchStaff();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Delivery Staff Roster
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            Field couriers, last-mile drivers and vehicle assignments
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Delivery Courier
        </button>
      </div>

      {loading ? (
        <Loader size="large" text="Loading courier roster..." />
      ) : (
        <div className="portal-table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Courier Name</th>
                <th>Work Email</th>
                <th>Mobile Number</th>
                <th>Assigned Vehicle</th>
                <th>Active Runs</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {couriers.map((c) => (
                <tr key={c._id || c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.email}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.assignedVehicle || 'Motorcycle'}</td>
                  <td>
                    <span className="badge badge-info">
                      {c.activeAssignments || 0} drop-offs
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {c.status?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleToggle(c)}
                    >
                      {c.status === 'active' ? 'Suspend' : 'Activate'}
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
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Delivery Courier"
      >
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-control"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Vehicle</label>
            <input
              type="text"
              className="form-control"
              value={formData.assignedVehicle}
              onChange={(e) => setFormData({ ...formData, assignedVehicle: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Enroll Courier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
