import React, { useState } from 'react';
import { Bell, CheckCircle2, Clock, AlertTriangle, Truck, Info, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'New High-Priority Shipment Assigned',
    message: 'Shipment #MYN-8392 (Prepaid Express) has been assigned to your sector route.',
    time: '15 mins ago',
    type: 'order',
    read: false,
  },
  {
    id: 2,
    title: 'Customer Delivery Instruction Updated',
    message: 'Customer for #MYN-7714 requested delivery after 5:00 PM at reception desk.',
    time: '42 mins ago',
    type: 'info',
    read: false,
  },
  {
    id: 3,
    title: 'Traffic Advisory: Koramangala 80ft Road',
    message: 'Road maintenance diversion in effect. Use 100ft Inner Ring Road for faster transit.',
    time: '2 hours ago',
    type: 'warning',
    read: true,
  },
  {
    id: 4,
    title: 'Daily Shift Settlement Complete',
    message: 'COD collections for yesterday were verified and balanced successfully.',
    time: '1 day ago',
    type: 'success',
    read: true,
  },
];

export const DeliveryNotifications = () => {
  const { success } = useToast();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    success('All delivery alerts marked as read');
  };

  const toggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order':
        return <Truck size={18} color="#ff905a" />;
      case 'warning':
        return <AlertTriangle size={18} color="#b78103" />;
      case 'success':
        return <CheckCircle2 size={18} color="#03a685" />;
      default:
        return <Info size={18} color="#1a73e8" />;
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Courier Dispatch Notifications
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Real-time hub alerts, customer delivery instructions and sector advisories.
          </p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={markAllRead}>
          <Check size={14} /> Mark All as Read
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {notifications.map((item) => (
          <div
            key={item.id}
            className="card"
            style={{
              padding: 16,
              borderRadius: 10,
              border: '1px solid var(--border)',
              backgroundColor: item.read ? '#fff' : '#fefaf6',
              borderLeft: item.read ? '1px solid var(--border)' : '4px solid #ff905a',
              cursor: 'pointer',
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start'
            }}
            onClick={() => toggleRead(item.id)}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: item.read ? '#f8f9fa' : '#fff0e6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
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
              <p style={{ fontSize: '0.85rem', color: '#4a5568', margin: '4px 0 0', lineHeight: 1.4 }}>
                {item.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
