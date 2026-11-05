import React from 'react';
import {
  Boxes,
  User,
  Mail,
  MapPin,
  Building,
  ShieldCheck,
  Phone,
  CheckCircle,
  Truck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CompanyProfile = () => {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
          Warehouse Operations Profile
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
          Operator station credentials, fulfillment authorization scope and terminal details.
        </p>
      </div>

      {/* Terminal Authorization Banner */}
      <div
        className="card"
        style={{
          padding: 20,
          borderRadius: 10,
          border: '1px solid var(--border)',
          backgroundColor: '#f0fdfa',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Boxes size={32} color="#0d9488" />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f766e' }}>
              FULFILLMENT OPERATOR TERMINAL: ACTIVE
            </div>
            <div style={{ fontSize: '0.82rem', color: '#115e59' }}>
              Authorized to verify orders, record packing specifications, and dispatch to Travel Partners.
            </div>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: 4,
            backgroundColor: '#0d9488',
            color: '#fff',
            textTransform: 'uppercase',
          }}
        >
          COMPANY OPERATIONS
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* Operator Credentials */}
        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={18} color="#0d9488" /> Operator Credentials
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.88rem' }}>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Full Name
              </div>
              <div style={{ fontWeight: 700, marginTop: 2, fontSize: '1rem' }}>
                {user?.name || 'Operations Lead'}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Email Address
              </div>
              <div style={{ marginTop: 2 }}>{user?.email}</div>
            </div>

            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Security Role
              </div>
              <div style={{ marginTop: 2 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4, backgroundColor: '#f0fdfa', color: '#0d9488' }}>
                  company_staff (Order Fulfillment)
                </span>
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Contact Hotline
              </div>
              <div style={{ marginTop: 2 }}>{user?.phone || '+91 98888 11223'}</div>
            </div>
          </div>
        </div>

        {/* Warehouse Terminal Location */}
        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building size={18} color="#1d4ed8" /> Operating Warehouse Station
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.88rem' }}>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Facility Code
              </div>
              <div style={{ fontWeight: 800, color: '#1d4ed8', marginTop: 2, fontSize: '1rem' }}>
                BNG-01 (Bengaluru Central Mega Fulfillment Center)
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Physical Location
              </div>
              <div style={{ marginTop: 2, color: 'var(--text-dark)', lineHeight: 1.4 }}>
                Plot 18, Electronics City Phase 1, Hosur Road, Bengaluru, Karnataka 560100
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Connected Travel Partners
              </div>
              <div style={{ marginTop: 2, fontWeight: 600 }}>
                Express Direct Logistics Partners LLP (Active Fleet: Vans, EVs, Feeder Trucks)
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Compliance & Quality Benchmark
              </div>
              <div style={{ color: '#15803d', fontWeight: 700, marginTop: 2 }}>
                ISO 9001:2015 Warehouse QC Passed
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
