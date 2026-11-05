import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Package,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  MapPin,
  UserCheck,
  Send,
  Navigation
} from 'lucide-react';
import { partnerService } from '../../services/partnerService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const PartnerShipments = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [shipments, setShipments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Status update modal
  const [statusModalShipment, setStatusModalShipment] = useState(null);
  const [newStatus, setNewStatus] = useState('In Transit');
  const [statusLocation, setStatusLocation] = useState('Central Sorting Facility');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Assign driver modal
  const [assignShipment, setAssignShipment] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assigningDriver, setAssigningDriver] = useState(false);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const [res, staff] = await Promise.all([
        partnerService.getShipments({
          status: statusFilter || undefined,
          q: search.trim() || undefined,
        }),
        partnerService.getDeliveryStaff().catch(() => []),
      ]);
      setShipments(res.shipments || []);
      setStaffList(staff || []);
    } catch (err) {
      error('Failed to load partner shipments');
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

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusModalShipment) return;

    setUpdatingStatus(true);
    const id = statusModalShipment.shipmentId || statusModalShipment._id;
    try {
      await partnerService.updateShipmentStatus(id, newStatus, statusNote, statusLocation);
      success(`Updated shipment #${statusModalShipment.shipmentId || id} to "${newStatus}"`);
      setStatusModalShipment(null);
      fetchShipments();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update shipment status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignDriver = async (e) => {
    e.preventDefault();
    if (!assignShipment || !selectedStaffId) return;

    setAssigningDriver(true);
    const id = assignShipment.shipmentId || assignShipment._id;
    try {
      await partnerService.assignDeliveryStaff(id, selectedStaffId, user?._id || user?.id);
      success(`Shipment #${assignShipment.shipmentId || id} assigned successfully`);
      setAssignShipment(null);
      fetchShipments();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to assign driver');
    } finally {
      setAssigningDriver(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Hub Shipments Manifest
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Complete shipment tracking, transit statuses and last-mile driver allocation.
          </p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={fetchShipments} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh List
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 20 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by Waybill #, destination or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36, width: '100%' }}
            />
          </div>

          <div style={{ width: 180 }}>
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">All Statuses</option>
              <option value="In Transit">In Transit</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Delivery Failed">Delivery Failed</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-sm" style={{ backgroundColor: '#03a685', borderColor: '#03a685' }}>
            Filter
          </button>
        </form>
      </div>

      {/* Shipments Table */}
      {loading ? (
        <Loader message="Loading shipment roster..." />
      ) : shipments.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
          <Truck size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3>No shipments matching criteria</h3>
          <p style={{ fontSize: '0.88rem', margin: '6px 0 0' }}>
            Try broadening your search or resetting the status filters.
          </p>
        </div>
      ) : (
        <div className="card" style={{ borderRadius: 10, border: '1px solid var(--border)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '12px 14px' }}>Waybill #</th>
                <th style={{ padding: '12px 14px' }}>Destination</th>
                <th style={{ padding: '12px 14px' }}>Recipient</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px' }}>Assigned Driver</th>
                <th style={{ padding: '12px 14px' }}>Date</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shp) => {
                const id = shp.shipmentId || shp._id;
                const hasDriver = !!shp.deliveryStaff;

                return (
                  <tr key={id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>
                      <Link to={`/partner/shipments/${id}`} style={{ color: '#03a685' }}>
                        #{shp.shipmentId || id.slice(-8)}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {shp.deliveryAddress?.city || 'Bengaluru'} - {shp.deliveryAddress?.pincode || '560001'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {shp.deliveryAddress?.name || shp.recipient?.name || 'Customer'}
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
                              ? '#e6f4ea'
                              : shp.status === 'Delivery Failed'
                              ? '#fce8e6'
                              : shp.status === 'Out for Delivery'
                              ? '#fff4e5'
                              : '#e8f0fe',
                          color:
                            shp.status === 'Delivered'
                              ? '#137333'
                              : shp.status === 'Delivery Failed'
                              ? '#c5221f'
                              : shp.status === 'Out for Delivery'
                              ? '#b78103'
                              : '#1a73e8'
                        }}
                      >
                        {shp.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {hasDriver ? (
                        <span style={{ fontWeight: 600 }}>{shp.deliveryStaff?.name}</span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '2px 8px', fontSize: '0.75rem', borderColor: '#ff905a', color: '#ff905a' }}
                          onClick={() => {
                            setAssignShipment(shp);
                            setSelectedStaffId(staffList[0]?._id || '');
                          }}
                        >
                          Assign Driver
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--muted)' }}>
                      {new Date(shp.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          onClick={() => {
                            setStatusModalShipment(shp);
                            setNewStatus(shp.status || 'In Transit');
                            setStatusLocation(shp.deliveryAddress?.city || 'Central Hub');
                            setStatusNote('');
                          }}
                          title="Update Status"
                        >
                          Status
                        </button>
                        <Link to={`/partner/shipments/${id}`} className="btn btn-outline btn-sm" style={{ padding: '3px 8px' }}>
                          <Eye size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModalShipment && (
        <Modal
          isOpen={!!statusModalShipment}
          onClose={() => setStatusModalShipment(null)}
          title={`Update Status: #${statusModalShipment.shipmentId || statusModalShipment._id}`}
        >
          <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                New Transit Status
              </label>
              <select
                className="input-field"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="In Transit">In Transit</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Delivery Failed">Delivery Failed</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Current Location / Facility
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Indiranagar Sorting Depot"
                value={statusLocation}
                onChange={(e) => setStatusLocation(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Status Remarks
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Scanned at regional conveyor line"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button type="button" className="btn btn-outline" onClick={() => setStatusModalShipment(null)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#03a685', borderColor: '#03a685' }}
                disabled={updatingStatus}
              >
                {updatingStatus ? 'Updating...' : 'Save Status'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Driver Assignment Modal */}
      {assignShipment && (
        <Modal
          isOpen={!!assignShipment}
          onClose={() => setAssignShipment(null)}
          title={`Assign Courier to #${assignShipment.shipmentId || assignShipment._id}`}
        >
          <form onSubmit={handleAssignDriver} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Select Delivery Driver *
              </label>
              <select
                required
                className="input-field"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">-- Choose Driver --</option>
                {staffList.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name} ({driver.phone || driver.email})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button type="button" className="btn btn-outline" onClick={() => setAssignShipment(null)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#03a685', borderColor: '#03a685' }}
                disabled={assigningDriver || !selectedStaffId}
              >
                {assigningDriver ? 'Assigning...' : 'Confirm Driver'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
