import React, { useState, useEffect } from 'react';
import { Users, ShieldAlert, ShieldCheck, Search, Ban, CheckCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const AdminUsers = () => {
  const { success, error } = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Block modal
  const [blockingUser, setBlockingUser] = useState(null);
  const [blockReason, setBlockReason] = useState('Repeated policy violation');
  const [processing, setProcessing] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ search: search.trim() || undefined });
      setUsers(res.users || []);
    } catch (err) {
      error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleBlockUser = async () => {
    if (!blockingUser) return;
    setProcessing(true);
    try {
      await adminService.blockUser(blockingUser._id || blockingUser.id, blockReason);
      success(`User ${blockingUser.name} has been blocked.`);
      setBlockingUser(null);
      fetchUsers();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to block user');
    } finally {
      setProcessing(false);
    }
  };

  const handleUnblockUser = async (user) => {
    try {
      await adminService.unblockUser(user._id || user.id);
      success(`User ${user.name} has been unblocked.`);
      fetchUsers();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to unblock user');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Customer & Account Administration
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            Manage user accounts, view suspicious activity flags and enforce account security
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, minWidth: 280 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-outline btn-sm">
            <Search size={14} /> Search
          </button>
        </form>
      </div>

      {loading ? (
        <Loader size="large" text="Loading customer accounts..." />
      ) : (
        <div className="portal-table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Security Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isBlocked = u.status === 'blocked';
                return (
                  <tr key={u._id || u.id}>
                    <td>
                      <strong>{u.name}</strong>
                      {u.blockReason && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--danger)', marginTop: 2 }}>
                          Reason: {u.blockReason}
                        </div>
                      )}
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      <span className="badge badge-info">{u.role}</span>
                    </td>
                    <td>
                      <span className={`badge ${isBlocked ? 'badge-danger' : 'badge-success'}`}>
                        {u.status?.toUpperCase() || 'ACTIVE'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      {isBlocked ? (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--success)', borderColor: 'var(--success)' }}
                          onClick={() => handleUnblockUser(u)}
                        >
                          <ShieldCheck size={14} /> Unblock
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--danger)', borderColor: 'var(--border)' }}
                          onClick={() => setBlockingUser(u)}
                        >
                          <Ban size={14} /> Block Account
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Block User Modal */}
      <Modal
        isOpen={!!blockingUser}
        onClose={() => setBlockingUser(null)}
        title={`Block Customer Account: ${blockingUser?.name}`}
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: 16 }}>
          Blocking this account will immediately revoke access and prevent login and checkout across all portals.
        </p>

        <div className="form-group">
          <label className="form-label">Reason for Restriction *</label>
          <textarea
            className="form-control"
            rows={3}
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setBlockingUser(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ backgroundColor: 'var(--danger)' }}
            disabled={processing}
            onClick={handleBlockUser}
          >
            {processing ? 'Blocking...' : 'Confirm Block'}
          </button>
        </div>
      </Modal>
    </div>
  );
};
