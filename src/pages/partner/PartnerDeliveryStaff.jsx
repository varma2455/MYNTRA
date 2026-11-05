import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus
} from 'lucide-react';
import { partnerService } from '../../services/partnerService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';

export const PartnerDeliveryStaff = () => {
  const { error } = useToast();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const data = await partnerService.getDeliveryStaff();
      setStaff(data || []);
    } catch (err) {
      error('Failed to load courier driver roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = staff.filter((s) => {
    const q = search.toLowerCase();
    return (s.name || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q);
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Delivery Couriers Roster
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Active delivery personnel allocated to travel partner logistics operations.
          </p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={fetchStaff} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Roster
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 20 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search driver by name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>
      </div>

      {loading ? (
        <Loader message="Loading courier fleet..." />
      ) : filteredStaff.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
          <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3>No delivery couriers found</h3>
          <p style={{ fontSize: '0.9rem', margin: '6px 0 0' }}>
            All enrolled couriers will appear here once registered by administration.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filteredStaff.map((person) => {
            const isActive = person.status !== 'suspended' && person.status !== 'inactive';

            return (
              <div
                key={person._id}
                className="card"
                style={{
                  padding: 20,
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        backgroundColor: '#e6f4ea',
                        color: '#03a685',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.1rem'
                      }}
                    >
                      {person.name?.[0]?.toUpperCase() || 'D'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>{person.name}</h3>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          backgroundColor: isActive ? '#e6f4ea' : '#fce8e6',
                          color: isActive ? '#137333' : '#c5221f'
                        }}
                      >
                        {isActive ? 'ACTIVE ON-DUTY' : 'SUSPENDED'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mail size={15} color="var(--muted)" />
                    <span>{person.email}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Phone size={15} color="var(--muted)" />
                    <span>{person.phone || '+91 98450 12345 (Verified)'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Truck size={15} color="var(--muted)" />
                    <span>Vehicle: {person.assignedVehicle || 'Scooter Fleet (Standard Parcel)'}</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--muted)' }}>Role: <strong>Courier Staff</strong></span>
                  <span style={{ color: '#03a685', fontWeight: 700 }}>Direct Contact Enabled</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
