import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  Truck,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Loader } from '../../components/Loader';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    adminService
      .getDashboard()
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        if (isMounted) setError(err.response?.data?.message || err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <Loader size="large" text="Computing platform metrics & financial aggregates..." />;
  }

  if (error) {
    return (
      <div className="empty-state">
        <h3>Dashboard Unavailable</h3>
        <p>{error}</p>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const recentOrders = data?.recentOrders || metrics.recentOrders || [];
  const lowStock = data?.lowStockAlerts || metrics.lowStockProducts || [];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, textTransform: 'uppercase' }}>
          Executive Platform Analytics
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>
          Live metrics calculated authoritatively from MongoDB collections
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          marginBottom: 36,
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Gross Revenue</span>
            <DollarSign size={18} color="var(--success)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: 'var(--dark)' }}>
            ₹{(metrics.grossSales || metrics.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: 4 }}>
            Paid GMV across completed & placed orders
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Total Orders</span>
            <ShoppingBag size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: 'var(--dark)' }}>
            {metrics.totalOrders || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
            All-time placed orders in DB
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Catalog Styles</span>
            <Package size={18} color="#0288d1" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: 'var(--dark)' }}>
            {metrics.totalProducts || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
            Across 15 top-level categories
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Platform Users</span>
            <Users size={18} color="#7b1fa2" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: 'var(--dark)' }}>
            {metrics.totalUsers || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
            Customers, staff & administrators
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders & Low Stock Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 28 }}>
        {/* Recent Orders Table */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            border: '1px solid var(--border)',
            padding: '20px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, textTransform: 'uppercase' }}>
              Recent Customer Orders
            </h3>
            <Link to="/admin/orders" style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700 }}>
              View All Orders →
            </Link>
          </div>

          <div className="portal-table-container">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                      No recent orders recorded
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord._id || ord.orderId}>
                      <td><strong>{ord.orderId}</strong></td>
                      <td>{ord.user?.name || ord.shippingAddress?.name || 'Customer'}</td>
                      <td>{ord.items?.length || 1} styles</td>
                      <td>₹{ord.total?.toLocaleString('en-IN')}</td>
                      <td>
                        <span
                          className={`badge ${
                            ord.status === 'Delivered'
                              ? 'badge-success'
                              : ord.status === 'Cancelled'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            border: '1px solid var(--border)',
            padding: '20px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <AlertTriangle size={18} color="var(--warning)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, textTransform: 'uppercase' }}>
              Inventory Watchlist
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {lowStock.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                All catalog inventory levels are healthy.
              </p>
            ) : (
              lowStock.slice(0, 6).map((item) => (
                <div
                  key={item._id || item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px',
                    borderBottom: '1px solid var(--border-light)',
                  }}
                >
                  <img
                    src={item.images?.[0] || 'https://via.placeholder.com/40'}
                    alt={item.name}
                    style={{ width: 40, height: 50, objectFit: 'cover', borderRadius: 4 }}
                  />
                  <div style={{ flex: 1, fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: 700 }}>{item.brand}</div>
                    <div style={{ color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                  </div>
                  <span className="badge badge-warning">
                    {item.stockCount || 0} units left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
