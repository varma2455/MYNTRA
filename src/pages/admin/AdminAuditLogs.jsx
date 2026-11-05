import React, { useState, useEffect } from 'react';
import { FileText, Shield, Clock, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Loader } from '../../components/Loader';

export const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs();
      setLogs(res.logs || res || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Immutable Audit Trail
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            System activity, security state transitions and staff dispatch events
          </p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={fetchLogs}>
          <RefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      {loading ? (
        <Loader size="large" text="Reading tamper-evident audit logs..." />
      ) : (
        <div className="portal-table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                    No audit records registered yet.
                  </td>
                </tr>
              ) : (
                logs.map((lg, idx) => (
                  <tr key={lg._id || idx}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--muted)' }}>
                      {new Date(lg.createdAt || Date.now()).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <strong>{lg.performedBy?.name || lg.user?.name || 'System / Super Admin'}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                        {lg.performedBy?.email || lg.user?.email || 'admin@myntrapro.com'}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{lg.action || 'CATALOG_UPDATE'}</span>
                    </td>
                    <td>
                      <code>{lg.resourceType || lg.targetResource || 'Platform'}</code>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--secondary)' }}>
                      {typeof lg.details === 'object' ? JSON.stringify(lg.details) : lg.details || lg.message || 'Action executed'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
