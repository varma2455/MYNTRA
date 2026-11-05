import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Compass,
  MapPin,
  Truck,
  Package,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  Eye,
  Radio
} from 'lucide-react';
import { partnerService } from '../../services/partnerService';
import { Loader } from '../../components/Loader';

const SECTORS = [
  { name: 'Koramangala 4th Block', activeCouriers: 3, pendingDrops: 14, status: 'Normal Flow' },
  { name: 'Indiranagar 100ft Corridor', activeCouriers: 2, pendingDrops: 8, status: 'Fast Transit' },
  { name: 'Electronic City Phase 1', activeCouriers: 4, pendingDrops: 21, status: 'High Volume' },
  { name: 'Whitefield ITPL Road', activeCouriers: 3, pendingDrops: 19, status: 'Peak Congestion' },
];

export const PartnerTracking = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(null);

  const fetchLiveShipments = async () => {
    setLoading(true);
    try {
      const res = await partnerService.getShipments({ limit: 50 });
      setShipments(res.shipments || []);
      if (res.shipments?.length > 0 && !selectedShipment) {
        setSelectedShipment(res.shipments[0]);
      }
    } catch (err) {
      console.error('Failed to load tracking stream', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveShipments();
  }, []);

  const activeShipments = shipments.filter(
    (s) => s.status === 'In Transit' || s.status === 'Out for Delivery'
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Live Telemetry & Sector Tracking
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Real-time radar for active courier dispatches, corridor density and route waypoints.
          </p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={fetchLiveShipments} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Stream
        </button>
      </div>

      {/* Sector Corridor Health */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {SECTORS.map((sec) => (
          <div key={sec.name} className="card" style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                Operational Sector
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#03a685', fontWeight: 700 }}>
                <Radio size={12} className="spin" /> Live
              </span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '6px 0 4px' }}>{sec.name}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--muted)', marginTop: 8 }}>
              <span>Couriers: <strong>{sec.activeCouriers}</strong></span>
              <span>Pending Drops: <strong>{sec.pendingDrops}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Split Console: Visual Map Simulation + Waybill Tracking Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 24, alignItems: 'start' }}>
        {/* Simulated GPS Radar Grid */}
        <div
          className="card"
          style={{
            padding: 24,
            borderRadius: 10,
            border: '1px solid var(--border)',
            backgroundColor: '#1b2430',
            color: '#fff',
            minHeight: 460,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Compass size={20} color="#03a685" />
              <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: 0.5 }}>
                BENGALURU LOGISTICS CORRIDOR RADAR
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#03a685', fontWeight: 700, backgroundColor: 'rgba(3, 166, 133, 0.2)', padding: '2px 8px', borderRadius: 4 }}>
              GPS LOCK ACTIVE
            </span>
          </div>

          {/* Grid visual overlay */}
          <div
            style={{
              height: 340,
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'radial-gradient(circle, rgba(3,166,133,0.08) 0%, rgba(15,23,42,0.8) 100%)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Concentric rings */}
            <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', border: '1px dashed rgba(3,166,133,0.2)' }} />
            <div style={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', border: '1px dashed rgba(3,166,133,0.3)' }} />

            {/* Central Hub Icon */}
            <div style={{ textAlign: 'center', zIndex: 2 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#03a685',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 6px',
                  boxShadow: '0 0 20px #03a685'
                }}
              >
                <Truck size={22} color="#fff" />
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>CENTRAL SORTING HUB 04</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>12.9716° N, 77.5946° E</div>
            </div>

            {/* Dynamic simulated rider pins */}
            {activeShipments.slice(0, 6).map((shp, i) => {
              const angles = [30, 85, 140, 210, 270, 320];
              const dists = [90, 115, 100, 120, 85, 110];
              const angle = (angles[i % angles.length] * Math.PI) / 180;
              const dist = dists[i % dists.length];
              const left = 50 + (dist / 340) * 100 * Math.cos(angle);
              const top = 50 + (dist / 340) * 100 * Math.sin(angle);

              const isSelected = selectedShipment && (selectedShipment.shipmentId === shp.shipmentId || selectedShipment._id === shp._id);

              return (
                <div
                  key={shp._id || i}
                  onClick={() => setSelectedShipment(shp)}
                  style={{
                    position: 'absolute',
                    left: `${left}%`,
                    top: `${top}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: 3
                  }}
                  title={`Shipment #${shp.shipmentId || shp._id}`}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: isSelected ? '#ff3f6c' : '#ff905a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isSelected ? '0 0 14px #ff3f6c' : '0 0 8px #ff905a',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Navigation size={12} color="#fff" />
                  </div>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      padding: '1px 4px',
                      borderRadius: 3,
                      marginTop: 2,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    #{shp.shipmentId ? shp.shipmentId.slice(-6) : shp._id.slice(-6)}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
            <span>Radar Range: 25 KM Radius</span>
            <span>Target Refresh: Every 15s</span>
          </div>
        </div>

        {/* Selected Shipment Telemetry Detail */}
        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 14 }}>Selected Waybill Inspector</h3>

          {!selectedShipment ? (
            <div style={{ padding: 30, textAlign: 'center', color: 'var(--muted)' }}>
              Select a package pin on the radar to inspect transit telemetry.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Waybill Number
                </span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#03a685' }}>
                  #{selectedShipment.shipmentId || selectedShipment._id}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Status
                </span>
                <div style={{ marginTop: 2 }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 4,
                      backgroundColor: '#e6f4ea',
                      color: '#03a685'
                    }}
                  >
                    {selectedShipment.status}
                  </span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Destination Address
                </span>
                <div style={{ fontWeight: 600, marginTop: 2 }}>
                  {selectedShipment.deliveryAddress?.city || 'Bengaluru'} - {selectedShipment.deliveryAddress?.pincode || '560001'}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                  {selectedShipment.deliveryAddress?.street || selectedShipment.deliveryAddress?.locality || 'On File'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Courier Assigned
                </span>
                <div style={{ fontWeight: 600, marginTop: 2 }}>
                  {selectedShipment.deliveryStaff?.name || 'Unassigned / Automated Hub'}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Recent Waybill Events ({selectedShipment.events?.length || 0})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {(selectedShipment.events || []).slice(-3).map((evt, idx) => (
                    <div key={idx} style={{ fontSize: '0.8rem', borderLeft: '2px solid #03a685', paddingLeft: 8 }}>
                      <div style={{ fontWeight: 700 }}>{evt.status}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{evt.location || 'Hub'} • {new Date(evt.timestamp || Date.now()).toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
