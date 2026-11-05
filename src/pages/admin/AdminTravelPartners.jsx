import React, { useState, useEffect } from 'react';
import { Truck, Plus, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const AdminTravelPartners = () => {
  const { success, error } = useToast();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'transport_manager',
    assignedVehicle: 'Logistics Van KA-04-TR-9901',
  });

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const data = await adminService.getStaff();
      const list = (data || []).filter((s) => s.role === 'transport_manager');
      setPartners(list);
    } catch (err) {
      error('Failed to load travel partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminService.createStaff(formData);
      success(`Travel partner "${formData.name}" enrolled.`);
      setShowAddModal(false);
      fetchPartners();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to enroll partner');
    }
  };

  const handleToggleStatus = async (partner) => {
    const next = partner.status === 'active' ? 'suspended' : 'active';
    try {
      await adminService.updateStaffStatus(partner._id || partner.id, next);
      success(`Partner status updated to ${next}`);
      fetchPartners();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update partner status');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Travel Partners & Fleet Coordinators
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            Regional transport hubs and authorized logistics dispatchers
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Register Travel Partner
        </button>
      </div>

      {loading ? (
        <Loader size="large" text="Retrieving verified transport partners..." />
      ) : (
        <div className="portal-table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Partner Name</th>
                <th>Contact Email</th>
                <th>Phone</th>
                <th>Hub Fleet / Logistics Unit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p._id || p.id}>
                  <td>
                    <strong>{p.name}</strong>
                  </td>
                  <td>{p.email}</td>
                  <td>{p.phone || '—'}</td>
                  <td>{p.assignedVehicle || 'Central Dispatch Hub'}</td>
                  <td>
                    <span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {p.status?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleToggleStatus(p)}
                    >
                      {p.status === 'active' ? 'Suspend' : 'Activate'}
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
        title="Register Travel Partner"
      >
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Partner / Organization Name *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Dispatch Email *</label>
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
              <label className="form-label">Contact Phone</label>
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Enroll Partner
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
