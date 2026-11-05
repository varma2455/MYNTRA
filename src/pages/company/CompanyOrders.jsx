import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  Package,
  Send,
  AlertTriangle,
  RotateCcw,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { companyService } from '../../services/companyService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';

export const CompanyOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { error } = useToast();

  const currentStatus = searchParams.get('status') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentQuery = searchParams.get('q') || '';

  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(currentQuery);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await companyService.getOrders({
        status: currentStatus !== 'all' ? currentStatus : undefined,
        q: currentQuery || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page: currentPage,
        limit: 15,
      });
      setOrders(data?.orders || []);
      setTotalPages(data?.totalPages || 1);
      setTotalOrders(data?.totalOrders || 0);
    } catch (err) {
      error('Failed to load fulfillment orders queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentStatus, currentPage, currentQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (search.trim()) {
      newParams.set('q', search.trim());
    } else {
      newParams.delete('q');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleStatusFilter = (statusKey) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('status', statusKey);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const getStageBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('placed') || s.includes('confirmed')) {
      return { bg: '#e8f0fe', color: '#1a73e8', label: 'NEW ORDER' };
    }
    if (s.includes('processing')) {
      return { bg: '#fff4e5', color: '#b78103', label: 'PROCESSING' };
    }
    if (s.includes('packed')) {
      return { bg: '#f3e8ff', color: '#7e22ce', label: 'PACKED' };
    }
    if (s.includes('ready')) {
      return { bg: '#e0f2fe', color: '#0369a1', label: 'READY FOR DISPATCH' };
    }
    if (s.includes('dispatched') || s.includes('shipped') || s.includes('transit')) {
      return { bg: '#e6f4ea', color: '#137333', label: 'DISPATCHED' };
    }
    if (s.includes('delivered')) {
      return { bg: '#dcfce7', color: '#15803d', label: 'DELIVERED' };
    }
    if (s.includes('return')) {
      return { bg: '#fee2e2', color: '#b91c1c', label: 'RETURN REQ' };
    }
    return { bg: '#f1f5f9', color: '#475569', label: (status || 'UNKNOWN').toUpperCase() };
  };

  const tabs = [
    { key: 'all', label: 'All Orders' },
    { key: 'new', label: 'New Awaiting Verification' },
    { key: 'processing', label: 'Processing / Picking' },
    { key: 'packing', label: 'Packing Bench' },
    { key: 'ready_for_dispatch', label: 'Ready to Dispatch' },
    { key: 'dispatched', label: 'Dispatched with Carrier' },
    { key: 'delayed', label: 'Delayed / Exceptions' },
    { key: 'returns', label: 'Returns Queue' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Order Fulfillment Master Roster
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Tracking total of <strong>{totalOrders}</strong> customer orders across all fulfillment stages.
          </p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={fetchOrders} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Queue
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 16 }}>
        {tabs.map((tab) => {
          const isActive = currentStatus === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleStatusFilter(tab.key)}
              style={
                isActive
                  ? { backgroundColor: '#0d9488', borderColor: '#0d9488', whiteSpace: 'nowrap' }
                  : { whiteSpace: 'nowrap' }
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Date Filter Bar */}
      <div className="card" style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 20 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by Order ID, customer name, city, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36, width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>From:</span>
            <input
              type="date"
              className="input-field"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{ width: 140 }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>To:</span>
            <input
              type="date"
              className="input-field"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{ width: 140 }}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-sm" style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }}>
            Filter Orders
          </button>
        </form>
      </div>

      {/* Orders Table */}
      {loading ? (
        <Loader message="Loading warehouse fulfillment roster..." />
      ) : orders.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
          <ShoppingBag size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3>No orders matching this filter</h3>
          <p style={{ fontSize: '0.88rem', margin: '6px 0 0' }}>
            Try adjusting your search criteria or resetting the stage filters.
          </p>
        </div>
      ) : (
        <div className="card" style={{ borderRadius: 10, border: '1px solid var(--border)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '12px 14px' }}>Order ID</th>
                <th style={{ padding: '12px 14px' }}>Customer / Contact</th>
                <th style={{ padding: '12px 14px' }}>Destination</th>
                <th style={{ padding: '12px 14px' }}>Items</th>
                <th style={{ padding: '12px 14px' }}>Fulfillment Stage</th>
                <th style={{ padding: '12px 14px' }}>Travel Partner</th>
                <th style={{ padding: '12px 14px' }}>Date</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => {
                const id = ord._id || ord.orderId;
                const badge = getStageBadge(ord.status);

                return (
                  <tr key={id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>
                      <Link to={`/company/orders/${id}`} style={{ color: '#0d9488' }}>
                        #{ord.orderId || id.slice(-8)}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600 }}>{ord.shippingAddress?.name || ord.user?.name || 'Customer'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{ord.shippingAddress?.mobile || ord.user?.phone}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {ord.shippingAddress?.city || 'Bengaluru'} - {ord.shippingAddress?.pincode || '560001'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {ord.items?.length || 1} item(s) • ₹{ord.total}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 4,
                          backgroundColor: badge.bg,
                          color: badge.color,
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {ord.transportPartner?.name || ord.shipment?.transportManager?.name || (
                        <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--muted)' }}>
                      {new Date(ord.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <Link to={`/company/orders/${id}`} className="btn btn-outline btn-sm" style={{ padding: '4px 8px', fontSize: '0.78rem' }}>
                        Inspect <Eye size={12} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={currentPage <= 1}
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set('page', String(currentPage - 1));
              setSearchParams(newParams);
            }}
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={currentPage >= totalPages}
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set('page', String(currentPage + 1));
              setSearchParams(newParams);
            }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
