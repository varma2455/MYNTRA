import React, { useState, useEffect } from 'react';
import { BarChart3, Download, RefreshCw, TrendingUp } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';

export const AdminReports = () => {
  const { success, error } = useToast();
  const [report, setReport] = useState(null);
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSalesReport({ range });
      setReport(data);
    } catch (err) {
      error('Failed to generate sales report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [range]);

  const handleExportCSV = () => {
    if (!report?.summary) return;
    const rows = [
      ['Metric', 'Value'],
      ['Reporting Range', range],
      ['Total Orders', report.summary.totalOrders],
      ['Gross GMV Revenue', report.summary.grossRevenue],
      ['Net Revenue', report.summary.netRevenue],
      ['Average Order Value (AOV)', report.summary.averageOrderValue],
      ['Delivered Packages', report.ordersCountByStatus?.Delivered || 0],
      ['In Processing', report.ordersCountByStatus?.Processing || 0],
      ['In Transit / Out for Delivery', report.ordersCountByStatus?.Shipped || 0],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `myntra_sales_report_${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Sales report exported to CSV successfully.');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Executive Analytics & Sales Reports
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            Aggregated business intelligence calculated across customer purchase records
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <select
            className="form-control"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <button type="button" className="btn btn-primary btn-sm" onClick={handleExportCSV}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <Loader size="large" text="Compiling financial trends..." />
      ) : report?.summary ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
            <div style={{ backgroundColor: '#ffffff', padding: 20, borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Orders ({range})
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 4 }}>
                {report.summary.totalOrders}
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: 20, borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Gross Revenue
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 4, color: 'var(--primary)' }}>
                ₹{report.summary.grossRevenue?.toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: 20, borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Average Order Value
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 4, color: 'var(--success)' }}>
                ₹{report.summary.averageOrderValue?.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Fulfillment Status breakdown */}
          <div style={{ backgroundColor: '#ffffff', padding: 24, borderRadius: 8, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 16 }}>
              Fulfillment Status Breakdown
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div style={{ padding: 16, backgroundColor: 'var(--bg-subtle)', borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Delivered Safely</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>
                  {report.ordersCountByStatus?.Delivered || 0}
                </div>
              </div>

              <div style={{ padding: 16, backgroundColor: 'var(--bg-subtle)', borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>In Warehouse Processing</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--warning)', marginTop: 4 }}>
                  {report.ordersCountByStatus?.Processing || 0}
                </div>
              </div>

              <div style={{ padding: 16, backgroundColor: 'var(--bg-subtle)', borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Shipped & In Transit</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
                  {report.ordersCountByStatus?.Shipped || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">No report data available.</div>
      )}
    </div>
  );
};
