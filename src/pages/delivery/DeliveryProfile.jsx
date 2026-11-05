import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  Truck,
  Shield,
  MapPin,
  Clock,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const DeliveryProfile = () => {
  const { user } = useAuth();
  const { success } = useToast();

  const [isOnDuty, setIsOnDuty] = useState(true);
  const [vehicle, setVehicle] = useState({
    type: 'Electric Two-Wheeler',
    registrationNumber: 'KA-01-EQ-9421',
    hub: 'Bengaluru Central Logistics Hub (Sector 4)',
    pincodesServed: '560001, 560025, 560038',
  });

  const toggleDuty = () => {
    const newState = !isOnDuty;
    setIsOnDuty(newState);
    if (newState) {
      success('You are now ONLINE. You will receive active dispatch broadcasts.');
    } else {
      success('You are now OFFLINE. Active runs must be completed before logout.');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
          Courier Profile & Duty Status
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
          Verified driver badge, fleet vehicle assignment and operational safety settings.
        </p>
      </div>

      {/* Duty Status Banner */}
      <div
        className="card"
        style={{
          padding: 20,
          borderRadius: 10,
          border: '1px solid var(--border)',
          backgroundColor: isOnDuty ? '#e6f4ea' : '#f8f9fa',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: isOnDuty ? '#137333' : '#a0aec0'
            }}
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: isOnDuty ? '#137333' : 'var(--text-dark)' }}>
              Current Status: {isOnDuty ? 'ON DUTY (ACCEPTING ORDERS)' : 'OFF DUTY'}
            </div>
            <div style={{ fontSize: '0.82rem', color: isOnDuty ? '#0d5924' : 'var(--muted)' }}>
              {isOnDuty
                ? 'Your device is actively synced with hub dispatch algorithms.'
                : 'You will not receive new batch offers while offline.'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleDuty}
          className="btn btn-sm"
          style={{
            backgroundColor: isOnDuty ? '#137333' : '#4a5568',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          {isOnDuty ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          {isOnDuty ? 'Go Off Duty' : 'Go On Duty'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Personal Details */}
        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={18} color="#ff905a" /> Personal Credentials
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.88rem' }}>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Full Name
              </div>
              <div style={{ fontWeight: 700, marginTop: 2 }}>{user?.name || 'Authorized Courier'}</div>
            </div>

            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Email Address
              </div>
              <div style={{ marginTop: 2 }}>{user?.email}</div>
            </div>

            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Assigned Role
              </div>
              <div style={{ marginTop: 2 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4, backgroundColor: '#fff4e5', color: '#b78103' }}>
                  DELIVERY STAFF (LAST-MILE)
                </span>
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Driver Safety Rating
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontWeight: 700, color: '#03a685' }}>
                <CheckCircle size={16} /> 4.92 / 5.0 (Top 5% of Logistics Fleet)
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Vehicle */}
        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Truck size={18} color="#1a73e8" /> Assigned Transport Unit
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.88rem' }}>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Vehicle Type
              </div>
              <div style={{ fontWeight: 700, marginTop: 2 }}>{vehicle.type}</div>
            </div>

            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Registration Number
              </div>
              <div style={{ marginTop: 2, fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', color: '#1a73e8' }}>
                {vehicle.registrationNumber}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Operating Logistics Hub
              </div>
              <div style={{ marginTop: 2 }}>{vehicle.hub}</div>
            </div>

            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Primary Delivery Pincodes
              </div>
              <div style={{ marginTop: 2, color: 'var(--muted)' }}>{vehicle.pincodesServed}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
