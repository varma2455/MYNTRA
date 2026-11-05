import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
  Clock,
  Package,
  Send,
  AlertTriangle,
  MapPin,
  Phone,
  Calendar,
  Layers,
  CheckSquare,
  Square,
  Truck,
  RotateCcw
} from 'lucide-react';
import { companyService } from '../../services/companyService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const CompanyOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState({});

  // Processing modal
  const [processModal, setProcessModal] = useState(false);
  const [processNotes, setProcessNotes] = useState('Inventory verified in sector bins; initiated fulfillment.');
  const [submittingProcess, setSubmittingProcess] = useState(false);

  // Packing modal
  const [packModal, setPackModal] = useState(false);
  const [weightKg, setWeightKg] = useState('0.75');
  const [lengthCm, setLengthCm] = useState('32');
  const [widthCm, setWidthCm] = useState('24');
  const [heightCm, setHeightCm] = useState('10');
  const [packageCount, setPackageCount] = useState('1');
  const [warehouse, setWarehouse] = useState('Warehouse BNG-01 (Electronic City)');
  const [packingNotes, setPackingNotes] = useState('Inspected tags, folded and boxed with tamper-evident seal');
  const [submittingPack, setSubmittingPack] = useState(false);

  // Ready to dispatch
  const [submittingReady, setSubmittingReady] = useState(false);

  // Flag issue modal
  const [issueModal, setIssueModal] = useState(false);
  const [issueReason, setIssueReason] = useState('Damaged packaging found in warehouse bin');
  const [submittingIssue, setSubmittingIssue] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const data = await companyService.getOrderById(orderId);
      setOrder(data);
      if (data?.packageDetails) {
        if (data.packageDetails.weightKg) setWeightKg(String(data.packageDetails.weightKg));
        if (data.packageDetails.warehouse) setWarehouse(data.packageDetails.warehouse);
        if (data.packageDetails.dimensions) {
          setLengthCm(String(data.packageDetails.dimensions.lengthCm || 30));
          setWidthCm(String(data.packageDetails.dimensions.widthCm || 20));
          setHeightCm(String(data.packageDetails.dimensions.heightCm || 10));
        }
      }
    } catch (err) {
      error('Failed to load order fulfillment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const toggleCheck = (idx) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleStartProcessing = async (e) => {
    e.preventDefault();
    setSubmittingProcess(true);
    try {
      await companyService.processOrder(orderId, processNotes);
      success(`Order #${order.orderId} moved to Processing queue`);
      setProcessModal(false);
      fetchOrder();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to start processing');
    } finally {
      setSubmittingProcess(false);
    }
  };

  const handlePackOrder = async (e) => {
    e.preventDefault();
    setSubmittingPack(true);
    try {
      await companyService.packOrder(orderId, {
        weightKg: Number(weightKg) || 0.75,
        dimensions: {
          lengthCm: Number(lengthCm) || 30,
          widthCm: Number(widthCm) || 20,
          heightCm: Number(heightCm) || 10,
        },
        packageCount: Number(packageCount) || 1,
        warehouse,
        packingNotes,
      });
      success(`Order #${order.orderId} packed and weighed (${weightKg} kg)`);
      setPackModal(false);
      fetchOrder();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to record packing completion');
    } finally {
      setSubmittingPack(false);
    }
  };

  const handleMarkReadyForDispatch = async () => {
    setSubmittingReady(true);
    try {
      await companyService.markReadyForDispatch(orderId);
      success(`Order #${order.orderId} moved to Ready for Dispatch`);
      fetchOrder();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update ready state');
    } finally {
      setSubmittingReady(false);
    }
  };

  const handleFlagIssue = async (e) => {
    e.preventDefault();
    setSubmittingIssue(true);
    try {
      await companyService.flagFulfillmentIssue({
        orderId,
        reason: issueReason,
      });
      success('Fulfillment exception recorded and order marked for review');
      setIssueModal(false);
      fetchOrder();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to flag issue');
    } finally {
      setSubmittingIssue(false);
    }
  };

  if (loading) {
    return <Loader message="Fetching order items, inventory checks & package records..." />;
  }

  if (!order) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <ShoppingBag size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
        <h3>Order Record Not Found</h3>
        <Link to="/company/orders" className="btn btn-outline btn-sm" style={{ marginTop: 12 }}>
          <ArrowLeft size={14} /> Back to Fulfillment Queue
        </Link>
      </div>
    );
  }

  const status = (order.status || '').toLowerCase();
  const isNew = status.includes('placed') || status.includes('confirmed') || status.includes('pending');
  const isProcessing = status.includes('processing');
  const isPacked = status.includes('packed');
  const isReady = status.includes('ready');
  const isDispatched = status.includes('dispatched') || status.includes('shipped');

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link
          to="/company/orders"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 12 }}
        >
          <ArrowLeft size={16} /> Back to All Orders
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
                Fulfillment Docket #{order.orderId || order._id}
              </h1>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 4,
                  backgroundColor: '#0d9488',
                  color: '#fff',
                  textTransform: 'uppercase',
                }}
              >
                {order.status}
              </span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Order Date: {new Date(order.createdAt).toLocaleString()} • Pincode: <strong>{order.shippingAddress?.pincode}</strong>
            </p>
          </div>

          {/* Workflow Action Buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ borderColor: '#ef4444', color: '#ef4444' }}
              onClick={() => setIssueModal(true)}
            >
              <AlertTriangle size={14} /> Report Issue
            </button>

            {isNew && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#b78103', borderColor: '#b78103' }}
                onClick={() => setProcessModal(true)}
              >
                <Clock size={14} /> Start Processing & Picking
              </button>
            )}

            {isProcessing && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#7e22ce', borderColor: '#7e22ce' }}
                onClick={() => setPackModal(true)}
              >
                <Package size={14} /> Open Packing Bench
              </button>
            )}

            {isPacked && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }}
                onClick={handleMarkReadyForDispatch}
                disabled={submittingReady}
              >
                <CheckCircle size={14} /> {submittingReady ? 'Saving...' : 'Mark Ready for Dispatch'}
              </button>
            )}

            {isReady && (
              <Link
                to="/company/dispatch"
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }}
              >
                <Send size={14} /> Dispatch with Travel Partner
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Flagged Issue Alert */}
      {order.fulfillmentIssue?.isFlagged && (
        <div
          className="card"
          style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #f87171',
            borderRadius: 8,
            padding: 16,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <AlertTriangle size={24} color="#b91c1c" />
          <div>
            <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.95rem' }}>
              Fulfillment Exception Flagged
            </div>
            <div style={{ fontSize: '0.85rem', color: '#b91c1c', marginTop: 2 }}>
              Reason: <strong>{order.fulfillmentIssue.reason}</strong> • Flagged on {new Date(order.fulfillmentIssue.flaggedAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Grid: Items Verification Checklist & Recipient/Destination */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 24, alignItems: 'start', marginBottom: 24 }}>
        {/* Ordered Items with Stock Availability Check */}
        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckSquare size={18} color="#0d9488" /> Picking Verification Checklist
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
              Check items as picked from warehouse bin
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {order.items?.map((item, idx) => {
              const isChecked = !!checkedItems[idx];
              const isAvailable = item.stockSufficient !== false;

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    backgroundColor: isChecked ? '#f0fdf4' : '#fafafa',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleCheck(idx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {isChecked ? (
                      <CheckSquare size={22} color="#16a34a" />
                    ) : (
                      <Square size={22} color="#94a3b8" />
                    )}
                  </button>

                  <img
                    src={item.image || 'https://via.placeholder.com/60'}
                    alt={item.productName}
                    style={{ width: 50, height: 60, objectFit: 'cover', borderRadius: 4 }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.productName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>
                      Brand: <strong>{item.brand}</strong> • Size: {item.size} • Color: {item.color}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>
                      Quantity Required: <strong>{item.quantity}</strong> • Unit Price: ₹{item.price}
                    </div>
                  </div>

                  {/* Real-time Inventory Check Indicator */}
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 4,
                        backgroundColor: isAvailable ? '#dcfce7' : '#fee2e2',
                        color: isAvailable ? '#15803d' : '#b91c1c',
                      }}
                    >
                      {isAvailable ? `Stock Available (${item.availableStock || 50})` : 'Low / Zero Stock'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recipient & Destination Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Destination Details */}
          <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={18} color="var(--primary)" /> Delivery Destination
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Customer Name
                </div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>
                  {order.shippingAddress?.name || order.user?.name || 'Customer'}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Destination Address
                </div>
                <div style={{ marginTop: 2, lineHeight: 1.4 }}>
                  {order.shippingAddress?.street}
                  <br />
                  {order.shippingAddress?.locality ? `${order.shippingAddress.locality}, ` : ''}
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - <strong>{order.shippingAddress?.pincode}</strong>
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Contact Phone
                </div>
                <div style={{ marginTop: 2 }}>{order.shippingAddress?.mobile || order.user?.phone || 'On file'}</div>
              </div>
            </div>
          </div>

          {/* Package Details Card */}
          <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={18} color="#7e22ce" /> Package Specifications
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Weight:</span>
                <strong>{order.packageDetails?.weightKg || 0.75} kg</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Dimensions:</span>
                <span>
                  {order.packageDetails?.dimensions?.lengthCm || 30} x {order.packageDetails?.dimensions?.widthCm || 20} x {order.packageDetails?.dimensions?.heightCm || 10} cm
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Warehouse:</span>
                <span>{order.packageDetails?.warehouse || 'BNG-01'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Payment:</span>
                <strong>{order.paymentMethod === 'cod' ? 'COD (Collect Cash)' : 'Prepaid Online'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process Modal */}
      {processModal && (
        <Modal isOpen={processModal} onClose={() => setProcessModal(false)} title="Start Processing Order">
          <form onSubmit={handleStartProcessing} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-dark)' }}>
              Confirm that all ordered items have been verified in inventory stock and allocate picking tasks to warehouse operators.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                Processing Notes
              </label>
              <textarea
                className="input-field"
                rows={3}
                value={processNotes}
                onChange={(e) => setProcessNotes(e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-outline" onClick={() => setProcessModal(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }}
                disabled={submittingProcess}
              >
                {submittingProcess ? 'Starting...' : 'Confirm & Move to Processing'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Packing Modal */}
      {packModal && (
        <Modal isOpen={packModal} onClose={() => setPackModal(false)} title="Record Package & Weighing Details">
          <form onSubmit={handlePackOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                  Actual Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.05"
                  required
                  className="input-field"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                  Package Count *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  className="input-field"
                  value={packageCount}
                  onChange={(e) => setPackageCount(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                Box Dimensions (L x W x H in cm)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <input
                  type="number"
                  placeholder="Length"
                  className="input-field"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Width"
                  className="input-field"
                  value={widthCm}
                  onChange={(e) => setWidthCm(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Height"
                  className="input-field"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                Pickup Warehouse
              </label>
              <input
                type="text"
                className="input-field"
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                Packing Notes / Seal Check
              </label>
              <textarea
                rows={2}
                className="input-field"
                value={packingNotes}
                onChange={(e) => setPackingNotes(e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-outline" onClick={() => setPackModal(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#7e22ce', borderColor: '#7e22ce' }}
                disabled={submittingPack}
              >
                {submittingPack ? 'Saving...' : 'Confirm Packing & Reserve Stock'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Flag Issue Modal */}
      {issueModal && (
        <Modal isOpen={issueModal} onClose={() => setIssueModal(false)} title="Report Fulfillment Issue">
          <form onSubmit={handleFlagIssue} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                Issue Description *
              </label>
              <textarea
                required
                rows={4}
                className="input-field"
                value={issueReason}
                onChange={(e) => setIssueReason(e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-outline" onClick={() => setIssueModal(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                disabled={submittingIssue}
              >
                {submittingIssue ? 'Flagging...' : 'Confirm Exception Flag'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
