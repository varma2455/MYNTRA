import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  MapPin,
  Calendar
} from 'lucide-react';
import { companyService } from '../../services/companyService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const CompanyShipments = () => {
  const { error } = useToast();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(null);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const data = await companyService.getShipments({
        status: statusFilter || undefined,
        q: search.trim() || undefined,
      });
      setShipments(data?.shipments || []);
    } catch (err) {
      error('Failed to load company shipments manifest');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchShipments();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Company Shipments Manifest
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Comprehensive registry of all parcels dispatched from company warehouses to carrier networks.
          </p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={fetchShipments} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Manifest
        </button>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 20 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by Waybill #, Order ID, customer name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36, width: '100%' }}
            />
          </div>

          <div style={{ width: 200 }}>
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">All Shipment Statuses</option>
              <option value="Assigned to Partner">Assigned to Partner</option>
              <option value="Awaiting Pickup">Awaiting Pickup</option>
              <option value="In Transit">In Transit</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Delivery Failed">Delivery Failed</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-sm" style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }}>
            Filter Manifest
          </button>
        </form>
      </div>

      {/* Shipments Table */}
      {loading ? (
        <Loader message="Loading company shipments roster..." />
      ) : shipments.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
          <Truck size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3>No Shipments Found</h3>
          <p style={{ fontSize: '0.88rem', margin: '6px 0 0' }}>
            Shipments will appear here once orders are dispatched to registered Travel Partners.
          </p>
        </div>
      ) : (
        <div className="card" style={{ borderRadius: 10, border: '1px solid var(--border)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '12px 14px' }}>Shipment / Waybill</th>
                <th style={{ padding: '12px 14px' }}>Order Ref</th>
                <th style={{ padding: '12px 14px' }}>Destination</th>
                <th style={{ padding: '12px 14px' }}>Travel Partner</th>
                <th style={{ padding: '12px 14px' }}>Delivery Courier</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px' }}>Dispatch Date</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Telemetry</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shp) => {
                const id = shp.shipmentId || shp._id;

                return (
                  <tr key={id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>
                      <span style={{ color: '#0d9488', cursor: 'pointer' }} onClick={() => setSelectedShipment(shp)}>
                        #{shp.shipmentId || id.slice(-8)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Link to={`/company/orders/${shp.orderId || (shp.order?._id || '')}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                        #{shp.orderId || (shp.order?.orderId || 'Order')}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {shp.recipient?.city || 'Bengaluru'} - {shp.recipient?.pincode}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {shp.transportManager?.name || 'Assigned Carrier'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {shp.deliveryStaff?.name || (
                        <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>Pending Driver</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 4,
                          backgroundColor:
                            shp.status === 'Delivered'
                              ? '#dcfce7'
                              : shp.status === 'Delivery Failed'
                              ? '#fee2e2'
                              : shp.status === 'Out for Delivery'
                              ? '#fef3c7'
                              : '#e0f2fe',
                          color:
                            shp.status === 'Delivered'
                              ? '#15803d'
                              : shp.status === 'Delivery Failed'
                              ? '#b91c1c'
                              : shp.status === 'Out for Delivery'
                              ? '#b45309'
                              : '#0369a1',
                        }}
                      >
                        {shp.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--muted)' }}>
                      {new Date(shp.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                        onClick={() => setSelectedShipment(shp)}
                      >
                        Timeline <Eye size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Telemetry Timeline Modal */}
      {selectedShipment && (
        <Modal
          isOpen={!!selectedShipment}
          onClose={() => setSelectedShipment(null)}
          title={`Waybill Telemetry: #${selectedShipment.shipmentId || selectedShipment._id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--muted)' }}>Carrier Partner:</span>
                <div style={{ fontWeight: 700 }}>{selectedShipment.transportManager?.name || 'Express Logistics'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--muted)' }}>Delivery Courier:</span>
                <div style={{ fontWeight: 700 }}>{selectedShipment.deliveryStaff?.name || 'Pending Route Assignment'}</div>
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '8px 0 0' }}>Waybill Milestone Timeline</h4>

            {(!selectedShipment.trackingEvents || selectedShipment.trackingEvents.length === 0) ? (
              <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No events logged yet.</div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ position: 'absolute', left: 6, top: 4, bottom: 4, width: 2, backgroundColor: 'var(--border)' }} />
                {selectedShipment.trackingEvents.map((evt, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: -20,
                        top: 2,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        backgroundColor: '#0d9488',
                        border: '2px solid #fff'
                      }}
                    />
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{evt.status}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                      {evt.location && <span>{evt.location} • </span>}
                      {new Date(evt.timestamp || Date.now()).toLocaleString()}
                    </div>
                    {evt.note && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginTop: 2, fontStyle: 'italic' }}>
                        "{evt.note}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button type="button" className="btn btn-outline" onClick={() => setSelectedShipment(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
