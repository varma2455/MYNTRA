import React, { useState } from 'react';
import {
  Truck,
  Shield,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Building,
  FileCheck,
  Edit2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const PartnerProfile = () => {
  const { user } = useAuth();
  const { success } = useToast();

  const [partnerDetails, setPartnerDetails] = useState({
    agencyName: 'Express Direct Logistics Partners LLP',
    gstin: '29ABCDE1234F1Z5',
    licenseNumber: 'KA/LOG-TRAN/2024/09812',
    hqAddress: 'Plot 42, Hosur Main Road, Electronic City Phase 1, Bengaluru, Karnataka 560100',
    hubCount: 4,
    zonesCovered: 'Bengaluru Urban, Bengaluru Rural, Kolar, Hosur Industrial Corridor',
    contactPerson: user?.name || 'Transport Operations Manager',
    email: user?.email || 'transport@myntrapro.com',
    phone: '+91 80 4912 8800',
  });

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
          Travel Partner Logistics Profile
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
          Registered carrier documentation, operating jurisdiction and hub network metadata.
        </p>
      </div>

      {/* Compliance Badge */}
      <div
        className="card"
        style={{
          padding: 20,
          borderRadius: 10,
          border: '1px solid var(--border)',
          backgroundColor: '#e6f4ea',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Shield size={32} color="#03a685" />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#137333' }}>
              AUTHORIZED CARRIER STATUS: VERIFIED & COMPLIANT
            </div>
            <div style={{ fontSize: '0.82rem', color: '#0d5924' }}>
              Commercial transit insurance active • ISO 9001:2015 Logistics Standard Certified
            </div>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: 4,
            backgroundColor: '#03a685',
            color: '#fff',
            textTransform: 'uppercase'
          }}
        >
          TIER-1 LOGISTICS PARTNER
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* Corporate Entity Details */}
        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building size={18} color="#03a685" /> Partner Entity Data
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.88rem' }}>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Corporate Legal Name
              </div>
              <div style={{ fontWeight: 700, marginTop: 2, fontSize: '1rem' }}>
                {partnerDetails.agencyName}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                GSTIN / Tax Identification
              </div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a73e8', marginTop: 2 }}>
                {partnerDetails.gstin}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                National Carrier License
              </div>
              <div style={{ fontFamily: 'monospace', fontWeight: 600, marginTop: 2 }}>
                {partnerDetails.licenseNumber}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Regional Headquarters
              </div>
              <div style={{ marginTop: 2, color: 'var(--text-dark)', lineHeight: 1.4 }}>
                {partnerDetails.hqAddress}
              </div>
            </div>
          </div>
        </div>

        {/* Operational Scope & Hubs */}
        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} color="#ff905a" /> Operating Scope & Hubs
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.88rem' }}>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Assigned Operational Hubs
              </div>
              <div style={{ fontWeight: 700, marginTop: 2 }}>
                {partnerDetails.hubCount} Regional Sorting Facilities
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Operating Delivery Zones
              </div>
              <div style={{ marginTop: 2, lineHeight: 1.4 }}>
                {partnerDetails.zonesCovered}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Transport Operations Lead
              </div>
              <div style={{ fontWeight: 700, marginTop: 2 }}>
                {partnerDetails.contactPerson}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                {partnerDetails.email} • {partnerDetails.phone}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Platform Role Mapping
              </div>
              <div style={{ fontWeight: 600, marginTop: 2, color: '#03a685' }}>
                transport_manager (Travel Partner Console)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
