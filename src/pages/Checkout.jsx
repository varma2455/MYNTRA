import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  CheckCircle2,
  Plus,
  CreditCard,
  Smartphone,
  Banknote,
  ShieldCheck,
  AlertCircle,
  Truck,
  ArrowRight,
  Info
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Modal } from '../components/Modal';
import confetti from 'canvas-confetti';

export const Checkout = () => {
  const { cart, items, summary, clearCart, appliedCoupon } = useCart();
  const { user, addAddress } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Add new address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: user?.name || '',
    mobile: user?.phone || '',
    pincode: '560001',
    street: '',
    locality: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'HOME',
    isDefault: false,
  });

  const savedAddresses = user?.savedAddresses || [];

  // If no saved addresses exist, open modal automatically
  useEffect(() => {
    if (savedAddresses.length === 0) {
      setShowAddressModal(true);
    }
  }, [savedAddresses.length]);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.name || !newAddr.mobile || !newAddr.pincode || !newAddr.street || !newAddr.city || !newAddr.state) {
      error('Please fill in all required address fields.');
      return;
    }

    try {
      await addAddress(newAddr);
      success('Delivery address saved successfully');
      setShowAddressModal(false);
      setSelectedAddressIndex(savedAddresses.length);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      error('Your shopping bag is empty.');
      navigate('/cart');
      return;
    }

    const currentAddress = savedAddresses[selectedAddressIndex];
    if (!currentAddress) {
      error('Please select or add a delivery address to proceed.');
      setShowAddressModal(true);
      return;
    }

    setSubmitting(true);
    setCheckoutError('');

    try {
      const idempotencyKey = `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const orderPayload = {
        items: items.map((it) => ({
          productId: it.product?._id || it.product?.id || it.product,
          productName: it.product?.name || it.product?.title || 'Fashion Item',
          brand: it.product?.brand || 'Myntra Pro',
          image: it.product?.images?.[0] || '',
          size: it.selectedSize || 'M',
          color: it.selectedColor?.name || 'Default',
          quantity: it.quantity,
          price: it.product?.sellingPrice || 999,
          originalPrice: it.product?.originalPrice || it.product?.sellingPrice || 999,
        })),
        shippingAddress: {
          name: currentAddress.name,
          mobile: currentAddress.mobile || currentAddress.phone,
          pincode: currentAddress.pincode,
          street: currentAddress.street,
          locality: currentAddress.locality || '',
          city: currentAddress.city,
          state: currentAddress.state,
          type: currentAddress.type || 'HOME',
        },
        paymentMethod,
        couponCode: appliedCoupon?.code,
        couponDiscount: summary.couponDiscount || 0,
        idempotencyKey,
      };

      const placedOrder = await orderService.createOrder(orderPayload, idempotencyKey);

      // Trigger celebration confetti!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore if confetti fails
      }

      await clearCart();
      success(`Order placed successfully! ID: ${placedOrder.orderId}`);
      navigate('/order-confirmation', { state: { order: placedOrder } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Order placement failed. Please verify stock.';
      setCheckoutError(msg);
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      <Breadcrumbs items={[{ label: 'Bag', href: '/cart' }, { label: 'Secure Checkout' }]} />

      {/* Notice Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 18px',
          backgroundColor: '#e8f4fd',
          border: '1px solid #b3d7ff',
          borderRadius: 6,
          marginTop: 12,
          marginBottom: 24,
          fontSize: '0.85rem',
          color: '#004085',
        }}
      >
        <Info size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>Checkout Demonstration Mode:</strong> All orders are validated against the real backend, with live inventory reservation, dynamic shipping charges and audit recording.
        </span>
      </div>

      {checkoutError && (
        <div
          style={{
            backgroundColor: 'var(--danger-light)',
            border: '1px solid #ffcdd2',
            borderRadius: 6,
            padding: '14px 18px',
            marginBottom: 24,
            color: 'var(--danger)',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>{checkoutError}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '36px' }}>
        {/* Left Column: Address Selection & Payment Method */}
        <div>
          {/* 1. Address Selection */}
          <div
            style={{
              padding: '24px',
              border: '1px solid var(--border)',
              borderRadius: 8,
              backgroundColor: '#ffffff',
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={20} color="var(--primary)" /> 1. Select Delivery Address
              </h3>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowAddressModal(true)}
              >
                <Plus size={14} /> Add New Address
              </button>
            </div>

            {savedAddresses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--muted)' }}>
                <p>No saved delivery addresses found. Please add one to continue.</p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: 12 }}
                  onClick={() => setShowAddressModal(true)}
                >
                  Add Address Now
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {savedAddresses.map((addr, idx) => {
                  const isSelected = selectedAddressIndex === idx;
                  return (
                    <div
                      key={addr._id || idx}
                      onClick={() => setSelectedAddressIndex(idx)}
                      style={{
                        padding: '16px',
                        border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 6,
                        backgroundColor: isSelected ? 'var(--primary-light)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{addr.name}</span>
                          <span className="badge badge-info">{addr.type || 'HOME'}</span>
                          {addr.isDefault && <span className="badge badge-success">DEFAULT</span>}
                        </div>
                        {isSelected && <CheckCircle2 size={18} color="var(--primary)" />}
                      </div>

                      <div style={{ fontSize: '0.88rem', color: 'var(--secondary)', marginTop: 8, lineHeight: 1.5 }}>
                        {addr.street}, {addr.locality ? `${addr.locality}, ` : ''}{addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 4 }}>
                        Mobile: <strong>{addr.mobile}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Payment Method */}
          <div
            style={{
              padding: '24px',
              border: '1px solid var(--border)',
              borderRadius: 8,
              backgroundColor: '#ffffff',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <CreditCard size={20} color="var(--primary)" /> 2. Payment Method
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 18px',
                  border: `2px solid ${paymentMethod === 'UPI' ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'UPI' ? 'var(--primary-light)' : '#ffffff',
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <Smartphone size={20} color="var(--primary)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>UPI (Instant Simulation)</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    Google Pay, PhonePe, Paytm, BHIM & Any UPI App
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 18px',
                  border: `2px solid ${paymentMethod === 'Credit Card' ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'Credit Card' ? 'var(--primary-light)' : '#ffffff',
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Credit Card'}
                  onChange={() => setPaymentMethod('Credit Card')}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <CreditCard size={20} color="var(--primary)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Credit / Debit Card</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    Visa, Mastercard, RuPay, Maestro & American Express
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 18px',
                  border: `2px solid ${paymentMethod === 'COD' ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'COD' ? 'var(--primary-light)' : '#ffffff',
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <Banknote size={20} color="var(--primary)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Cash On Delivery (COD)</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    Pay in cash or QR code when your courier arrives
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order Button */}
        <div>
          <div
            style={{
              padding: '24px',
              border: '1px solid var(--border)',
              borderRadius: 8,
              backgroundColor: '#ffffff',
            }}
          >
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              ORDER SUMMARY ({items.length} Items)
            </h4>

            {/* Thumbnail items list preview */}
            <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((it) => (
                <div key={it._id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img
                    src={it.product?.images?.[0] || 'https://via.placeholder.com/60'}
                    alt="item"
                    style={{ width: 44, height: 55, objectFit: 'cover', borderRadius: 4 }}
                  />
                  <div style={{ flex: 1, fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: 700 }}>{it.product?.brand}</div>
                    <div style={{ color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {it.product?.name}
                    </div>
                    <div style={{ color: 'var(--secondary)' }}>
                      Size: {it.selectedSize} • Qty: {it.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    ₹{it.itemTotal?.toLocaleString('en-IN') || (it.product?.sellingPrice * it.quantity)?.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary)' }}>Items Subtotal</span>
                <span>₹{summary.subtotal?.toLocaleString('en-IN')}</span>
              </div>

              {summary.couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--secondary)' }}>Coupon ({summary.couponCode})</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>- ₹{summary.couponDiscount}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary)' }}>Shipping Fee</span>
                <span>{summary.deliveryCharge === 0 ? <strong style={{ color: 'var(--success)' }}>FREE</strong> : `₹${summary.deliveryCharge}`}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary)' }}>Convenience Fee</span>
                <span>₹{summary.convenienceFee}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border)',
                  paddingTop: 14,
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--dark)',
                }}
              >
                <span>Total Payable</span>
                <span>₹{summary.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 24 }}
              onClick={handlePlaceOrder}
              disabled={submitting || savedAddresses.length === 0}
            >
              {submitting ? 'RESERVING & PLACING ORDER...' : `PAY ₹${summary.totalAmount?.toLocaleString('en-IN')}`}
            </button>
          </div>
        </div>
      </div>

      {/* Add New Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="Add Delivery Address"
      >
        <form onSubmit={handleAddNewAddress}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              value={newAddr.name}
              onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input
                type="tel"
                className="form-control"
                value={newAddr.mobile}
                onChange={(e) => setNewAddr({ ...newAddr, mobile: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pincode *</label>
              <input
                type="text"
                className="form-control"
                maxLength={6}
                value={newAddr.pincode}
                onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Street / Flat / Building *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Flat 302, Prestige Tower"
              value={newAddr.street}
              onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Locality / Landmark</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Near MG Road Metro"
              value={newAddr.locality}
              onChange={(e) => setNewAddr({ ...newAddr, locality: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                className="form-control"
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">State *</label>
              <input
                type="text"
                className="form-control"
                value={newAddr.state}
                onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address Type</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem' }}>
                <input
                  type="radio"
                  name="addr_type"
                  checked={newAddr.type === 'HOME'}
                  onChange={() => setNewAddr({ ...newAddr, type: 'HOME' })}
                />
                Home (All day delivery)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem' }}>
                <input
                  type="radio"
                  name="addr_type"
                  checked={newAddr.type === 'WORK'}
                  onChange={() => setNewAddr({ ...newAddr, type: 'WORK' })}
                />
                Work (10 AM - 6 PM delivery)
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowAddressModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Address
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
