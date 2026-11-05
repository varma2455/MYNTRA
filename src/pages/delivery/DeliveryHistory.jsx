import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Truck,
  Calendar,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/Loader';

export const DeliveryHistory = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await deliveryService.getMyDeliveries();
      setTasks(data || []);
    } catch (err) {
      console.error('Failed to load courier history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const completed = tasks.filter((t) => t.status === 'Delivered' || t.status === 'Delivery Failed');
  const deliveredCount = tasks.filter((t) => t.status === 'Delivered').length;
  const failedCount = tasks.filter((t) => t.status === 'Delivery Failed').length;
  const totalCompleted = deliveredCount + failedCount;
  const successRate = totalCompleted > 0 ? Math.round((deliveredCount / totalCompleted) * 100) : 100;

  const filteredHistory = completed.filter((t) => {
    const id = t.shipmentId || t._id || '';
    const matchSearch = id.toLowerCase().includes(search.toLowerCase()) ||
      (t.deliveryAddress?.city || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Delivery Run History & Metrics
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Historical fulfillment logs for courier <strong>{user?.name}</strong>
          </p>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={fetchHistory}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 18, borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Delivered
            </span>
            <CheckCircle size={20} color="#03a685" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#03a685' }}>
            {deliveredCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
            Successfully handed over
          </div>
        </div>

        <div className="card" style={{ padding: 18, borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Success Rate
            </span>
            <TrendingUp size={20} color="#1a73e8" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#1a73e8' }}>
            {successRate}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
            First-attempt SLA benchmark
          </div>
        </div>

        <div className="card" style={{ padding: 18, borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Failed Attempts
            </span>
            <XCircle size={20} color="#c5221f" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#c5221f' }}>
            {failedCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
            Unreachable or refused
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by shipment ID or destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36, width: '100%' }}
            />
          </div>

          <div style={{ width: 180 }}>
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="ALL">All Outcomes</option>
              <option value="Delivered">Delivered Only</option>
              <option value="Delivery Failed">Failed Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loader message="Loading courier past logs..." />
      ) : filteredHistory.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
          <Truck size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <h3>No historical runs found</h3>
          <p style={{ fontSize: '0.88rem', margin: '6px 0 0' }}>
            Completed deliveries and handover logs will be archived here.
          </p>
        </div>
      ) : (
        <div className="card" style={{ borderRadius: 10, border: '1px solid var(--border)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '12px 16px' }}>Waybill / ID</th>
                <th style={{ padding: '12px 16px' }}>Destination</th>
                <th style={{ padding: '12px 16px' }}>Recipient</th>
                <th style={{ padding: '12px 16px' }}>Outcome Status</th>
                <th style={{ padding: '12px 16px' }}>Payment</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => {
                const id = item.shipmentId || item._id;
                const isDelivered = item.status === 'Delivered';
                return (
                  <tr key={id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                      #{item.shipmentId || id.slice(-8)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {item.deliveryAddress?.city || 'Bengaluru'} - {item.deliveryAddress?.pincode || '560001'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {item.recipient?.name || item.deliveryAddress?.name || 'Customer'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 4,
                          backgroundColor: isDelivered ? '#e6f4ea' : '#fce8e6',
                          color: isDelivered ? '#137333' : '#c5221f'
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {item.paymentMethod === 'cod' ? 'COD Collected' : 'Prepaid'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <Link to={`/delivery/delivery/${id}`} className="btn btn-outline btn-sm">
                        View <ChevronRight size={14} />
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
  );
};
