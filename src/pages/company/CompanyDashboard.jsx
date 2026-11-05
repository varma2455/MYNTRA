import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  ShoppingBag,
  Clock,
  Package,
  CheckCircle,
  Send,
  Truck,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { companyService } from '../../services/companyService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';

export const CompanyDashboard = () => {
  const { user } = useAuth();
  const { error } = useToast();

  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await companyService.getDashboardStats();
      setStats(data?.stats || {});
      setRecentOrders(data?.recentOrders || []);
    } catch (err) {
      error('Failed to load company operations dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      return { bg: '#e0f2fe', color: '#0369a1', label: 'READY TO DISPATCH' };
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

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0, color: 'var(--text-dark)' }}>
            Company Operations & Fulfillment Center
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Station: <strong>Bengaluru Central Hub 04</strong> • Operations Lead: <strong>{user?.name}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={fetchDashboardData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Live Data
          </button>
          <Link
            to="/company/dispatch"
            className="btn btn-primary btn-sm"
            style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }}
          >
            <Send size={14} /> Dispatch Ready Shipments
          </Link>
        </div>
      </div>

      {/* Delayed / Blocked Alert Banner if any */}
      {stats?.delayedOrdersCount > 0 && (
        <div
          className="card"
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 8,
            padding: '14px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={20} color="#b45309" />
            <div>
              <strong style={{ color: '#92400e', fontSize: '0.9rem' }}>
                Fulfillment Delay Alert: {stats.delayedOrdersCount} order(s) require operator attention!
              </strong>
              <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: 2 }}>
                Orders pending processing or packing for more than 48 hours. Expedite immediately to maintain customer SLA.
              </div>
            </div>
          </div>
          <Link to="/company/orders?status=delayed" className="btn btn-sm" style={{ backgroundColor: '#b45309', color: '#fff' }}>
            Review Delayed Queue
          </Link>
        </div>
      )}

      {loading ? (
        <Loader message="Querying warehouse database & order processing queues..." />
      ) : (
        <>
          {/* Live KPI Metric Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
            {/* New Orders */}
            <Link to="/company/orders?status=new" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ padding: 18, borderRadius: 10, border: '1px solid var(--border)', transition: 'transform 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    1. New Orders
                  </span>
                  <ShoppingBag size={18} color="#1a73e8" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#1a73e8' }}>
                  {stats?.newOrdersCount ?? 0}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
                  Awaiting staff verification
                </div>
              </div>
            </Link>

            {/* Processing */}
            <Link to="/company/processing" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ padding: 18, borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    2. In Processing
                  </span>
                  <Clock size={18} color="#b78103" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#b78103' }}>
                  {stats?.processingCount ?? 0}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
                  Picking from warehouse bins
                </div>
              </div>
            </Link>

            {/* Packing */}
            <Link to="/company/packing" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ padding: 18, borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    3. At Packing Bench
                  </span>
                  <Package size={18} color="#7e22ce" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#7e22ce' }}>
                  {stats?.packingCount ?? 0}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
                  Boxed & weighed
                </div>
              </div>
            </Link>

            {/* Ready to Dispatch */}
            <Link to="/company/ready-to-dispatch" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ padding: 18, borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    4. Ready for Dispatch
                  </span>
                  <CheckCircle size={18} color="#0d9488" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#0d9488' }}>
                  {stats?.readyForDispatchCount ?? 0}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
                  On staging dock
                </div>
              </div>
            </Link>

            {/* Awaiting Partner */}
            <Link to="/company/dispatch" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ padding: 18, borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    5. Awaiting Carrier
                  </span>
                  <Send size={18} color="#ea580c" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#ea580c' }}>
                  {stats?.awaitingPartnerCount ?? 0}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
                  Needs Travel Partner assignment
                </div>
              </div>
            </Link>

            {/* Dispatched Today */}
            <Link to="/company/orders?status=dispatched" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ padding: 18, borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    6. Dispatched Today
                  </span>
                  <Truck size={18} color="#16a34a" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#16a34a' }}>
                  {stats?.dispatchedTodayCount ?? 0}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
                  En route with carriers
                </div>
              </div>
            </Link>

            {/* Returns */}
            <Link to="/company/returns" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ padding: 18, borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    7. Inward Returns
                  </span>
                  <RotateCcw size={18} color="#dc2626" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#dc2626' }}>
                  {stats?.returnsAwaitingInspectionCount ?? 0}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
                  Requires inspection & restock
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Operations Actions Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 28 }}>
            <Link
              to="/company/orders?status=new"
              className="card"
              style={{
                padding: 16,
                borderRadius: 8,
                border: '1px solid var(--border)',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                backgroundColor: '#ffffff'
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' }}>
                <ShoppingBag size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>1. Verify & Process Orders</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Verify stock & print picking list</div>
              </div>
              <ArrowRight size={16} color="var(--muted)" />
            </Link>

            <Link
              to="/company/packing"
              className="card"
              style={{
                padding: 16,
                borderRadius: 8,
                border: '1px solid var(--border)',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                backgroundColor: '#ffffff'
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7e22ce' }}>
                <Package size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>2. Pack & Weigh Bench</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Record weight, size & packing slip</div>
              </div>
              <ArrowRight size={16} color="var(--muted)" />
            </Link>

            <Link
              to="/company/dispatch"
              className="card"
              style={{
                padding: 16,
                borderRadius: 8,
                border: '1px solid var(--border)',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                backgroundColor: '#ffffff'
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488' }}>
                <Send size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>3. Travel Partner Dispatch</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Assign carrier & create waybill</div>
              </div>
              <ArrowRight size={16} color="var(--muted)" />
            </Link>
          </div>

          {/* Recent Orders Master Queue */}
          <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Recent Orders in Fulfillment Stream</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: '2px 0 0' }}>
                  Live orders requiring progressive picking, packing and partner dispatch.
                </p>
              </div>
              <Link to="/company/orders" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0d9488', display: 'flex', alignItems: 'center', gap: 4 }}>
                View All Orders <ArrowRight size={14} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                No active orders in warehouse pipeline.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                    <tr>
                      <th style={{ padding: '12px 14px' }}>Order ID</th>
                      <th style={{ padding: '12px 14px' }}>Customer</th>
                      <th style={{ padding: '12px 14px' }}>Destination</th>
                      <th style={{ padding: '12px 14px' }}>Items</th>
                      <th style={{ padding: '12px 14px' }}>Fulfillment Stage</th>
                      <th style={{ padding: '12px 14px' }}>Date</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((ord) => {
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
                            {ord.shippingAddress?.city || 'Bengaluru'}, {ord.shippingAddress?.pincode || '560001'}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {ord.items?.length || 1} product(s)
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
          </div>
        </>
      )}
    </div>
  );
};
