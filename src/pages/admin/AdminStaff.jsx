import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Shield, Truck, Package, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const AdminStaff = () => {
  const { success, error } = useToast();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add staff modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'delivery_staff',
    assignedVehicle: '',
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const data = await adminService.getStaff();
      setStaff(data || []);
    } catch (err) {
      error('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await adminService.createStaff(formData);
      success(`Staff member ${formData.name} added successfully.`);
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'delivery_staff',
        assignedVehicle: '',
      });
      fetchStaff();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create staff');
    }
  };

  const handleToggleStatus = async (member) => {
    const nextStatus = member.status === 'active' ? 'suspended' : 'active';
    try {
      await adminService.updateStaffStatus(member._id || member.id, nextStatus);
      success(`${member.name} status updated to ${nextStatus}`);
      fetchStaff();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleRoleChange = async (member, newRole) => {
    try {
      await adminService.updateStaffRole(member._id || member.id, newRole);
      success(`${member.name} role updated to ${newRole}`);
      fetchStaff();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update role');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Staff Provisioning & Roles
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            Manage warehouse managers, fleet coordinators and express delivery drivers
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Staff Member
        </button>
      </div>

      {loading ? (
        <Loader size="large" text="Retrieving operational staff..." />
      ) : (
        <div className="portal-table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role Assignment</th>
                <th>Vehicle / Notes</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((m) => (
                <tr key={m._id || m.id}>
                  <td>
                    <strong>{m.name}</strong>
                  </td>
                  <td>{m.email}</td>
                  <td>{m.phone || '—'}</td>
                  <td>
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        border: '1px solid var(--border)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                      }}
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="transport_manager">Transport Manager</option>
                      <option value="delivery_staff">Delivery Staff</option>
                    </select>
                  </td>
                  <td>{m.assignedVehicle || '—'}</td>
                  <td>
                    <span
                      className={`badge ${
                        m.status === 'active' ? 'badge-success' : 'badge-danger'
                      }`}
                    >
                      {m.status?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleToggleStatus(m)}
                    >
                      {m.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Provision New Staff Member"
      >
        <form onSubmit={handleCreateStaff}>
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
            <label className="form-label">Work Email *</label>
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
            <label className="form-label">Role Assignment *</label>
            <select
              className="form-control"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="delivery_staff">Delivery Staff / Courier Associate</option>
              <option value="transport_manager">Transport Manager / Dispatcher</option>
              <option value="super_admin">Super Administrator</option>
            </select>
          </div>

          {formData.role === 'delivery_staff' && (
            <div className="form-group">
              <label className="form-label">Assigned Vehicle (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Hero Electric Scooter (KA-01-EQ-4081)"
                value={formData.assignedVehicle}
                onChange={(e) => setFormData({ ...formData, assignedVehicle: e.target.value })}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Create Staff Credentials
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
