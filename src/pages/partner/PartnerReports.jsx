import React, { useState } from 'react';
import {
  FileText,
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  Truck
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const PartnerReports = () => {
  const { success } = useToast();
  const [dateRange, setDateRange] = useState('month');

  const handleExport = (format) => {
    success(`Logistics SLA report generated and downloaded as .${format}`);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Logistics & SLA Analytics Reports
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Fulfillment performance, on-time SLA metrics, courier velocity and fuel efficiency.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => handleExport('csv')}>
            <Download size={14} /> Export CSV
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ backgroundColor: '#03a685', borderColor: '#03a685' }}
            onClick={() => handleExport('pdf')}
          >
            <Download size={14} /> Export Executive PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              On-Time SLA Handover
            </span>
            <CheckCircle size={20} color="#03a685" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#03a685' }}>
            98.6%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
            +1.2% versus previous quarter
          </div>
        </div>

        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Average Last-Mile Time
            </span>
            <Clock size={20} color="#1a73e8" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#1a73e8' }}>
            2.1 Hours
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
            From hub inward to door delivery
          </div>
        </div>

        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Return-To-Origin (RTO)
            </span>
            <AlertTriangle size={20} color="#ff905a" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#ff905a' }}>
            1.4%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
            Significantly below 5% sector ceiling
          </div>
        </div>

        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Cost per Delivery Unit
            </span>
            <TrendingUp size={20} color="#6f42c1" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8, color: '#6f42c1' }}>
            ₹38.20
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
            Optimized via electric 2-wheeler fleet
          </div>
        </div>
      </div>

      {/* SLA Breakdown Matrix */}
      <div className="card" style={{ padding: 24, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>Operational Corridor Performance Matrix</h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '12px 14px' }}>Zone / Sector</th>
                <th style={{ padding: '12px 14px' }}>Monthly Volume</th>
                <th style={{ padding: '12px 14px' }}>On-Time Rate</th>
                <th style={{ padding: '12px 14px' }}>Avg Time to Door</th>
                <th style={{ padding: '12px 14px' }}>Customer Handover Rating</th>
                <th style={{ padding: '12px 14px' }}>SLA Compliance</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700 }}>Koramangala 4th Block Hub</td>
                <td style={{ padding: '12px 14px' }}>3,420 parcels</td>
                <td style={{ padding: '12px 14px' }}>99.1%</td>
                <td style={{ padding: '12px 14px' }}>1.8 hrs</td>
                <td style={{ padding: '12px 14px', color: '#03a685', fontWeight: 700 }}>4.94 / 5.0</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4, backgroundColor: '#e6f4ea', color: '#137333' }}>
                    EXCEEDS SLA
                  </span>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700 }}>Indiranagar 100ft Metro</td>
                <td style={{ padding: '12px 14px' }}>2,890 parcels</td>
                <td style={{ padding: '12px 14px' }}>98.4%</td>
                <td style={{ padding: '12px 14px' }}>2.0 hrs</td>
                <td style={{ padding: '12px 14px', color: '#03a685', fontWeight: 700 }}>4.91 / 5.0</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4, backgroundColor: '#e6f4ea', color: '#137333' }}>
                    EXCEEDS SLA
                  </span>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700 }}>Whitefield Tech Corridor</td>
                <td style={{ padding: '12px 14px' }}>4,150 parcels</td>
                <td style={{ padding: '12px 14px' }}>97.8%</td>
                <td style={{ padding: '12px 14px' }}>2.6 hrs</td>
                <td style={{ padding: '12px 14px', color: '#03a685', fontWeight: 700 }}>4.88 / 5.0</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4, backgroundColor: '#e6f4ea', color: '#137333' }}>
                    MEETS SLA
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '12px 14px', fontWeight: 700 }}>Electronic City Phase 1</td>
                <td style={{ padding: '12px 14px' }}>3,980 parcels</td>
                <td style={{ padding: '12px 14px' }}>98.7%</td>
                <td style={{ padding: '12px 14px' }}>2.2 hrs</td>
                <td style={{ padding: '12px 14px', color: '#03a685', fontWeight: 700 }}>4.90 / 5.0</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4, backgroundColor: '#e6f4ea', color: '#137333' }}>
                    EXCEEDS SLA
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
