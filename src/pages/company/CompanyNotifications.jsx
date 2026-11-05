import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  Send,
  Package,
  RotateCcw,
  Check
} from 'lucide-react';
import { companyService } from '../../services/companyService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';

export const CompanyNotifications = () => {
  const { success } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companyService
      .getNotifications()
      .then((data) => setNotifications(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    success('All warehouse operational alerts marked as read');
  };

  const getIcon = (type) => {
    switch (type) {
      case 'dispatch':
        return <Send size={18} color="#0d9488" />;
      case 'inventory':
        return <AlertTriangle size={18} color="#b45309" />;
      case 'return':
        return <RotateCcw size={18} color="#dc2626" />;
      default:
        return <Package size={18} color="#1d4ed8" />;
    }
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Warehouse Operations Alerts
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Live notifications regarding dispatch spikes, inventory thresholds, and customer return handovers.
          </p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={markAllRead}>
          <Check size={14} /> Mark All as Read
        </button>
      </div>

      {loading ? (
        <Loader message="Loading warehouse notification feed..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {notifications.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: 16,
                borderRadius: 10,
                border: '1px solid var(--border)',
                backgroundColor: item.read ? '#fff' : '#f0fdfa',
                borderLeft: item.read ? '1px solid var(--border)' : '4px solid #0d9488',
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  backgroundColor: item.read ? '#f8fafc' : '#ccfbf1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {getIcon(item.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>
                    {item.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {item.time}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#475569', margin: '4px 0 0', lineHeight: 1.4 }}>
                  {item.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
