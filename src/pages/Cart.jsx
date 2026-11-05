import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Heart,
  Tag,
  ShieldCheck,
  ArrowRight,
  Plus,
  Minus,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Loader } from '../components/Loader';

const AVAILABLE_COUPONS = [
  { code: 'FIRST100', desc: 'Flat ₹100 OFF on orders above ₹799', minCart: 799 },
  { code: 'MYNTRA200', desc: 'Flat ₹200 OFF on orders above ₹1499', minCart: 1499 },
  { code: 'FESTIVE15', desc: '15% OFF up to ₹500 on all orders', minCart: 999 },
];

export const Cart = () => {
  const { cart, items, summary, loading, updateQuantity, removeFromCart, applyCoupon, removeCoupon, appliedCoupon } = useCart();
  const { toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponCode;
    if (!code.trim()) return;
    setCouponError('');
    setApplying(true);
    try {
      await applyCoupon(code.trim().toUpperCase());
      setCouponCode('');
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid or inapplicable coupon');
    } finally {
      setApplying(false);
    }
  };

  const handleMoveToWishlist = async (item) => {
    if (!item.product) return;
    await toggleWishlist(item.product);
    await removeFromCart(item._id);
  };

  if (!isAuthenticated) {
    return (
      <div className="container empty-state" style={{ padding: '80px 20px' }}>
        <div className="empty-state-icon">
          <ShoppingBag size={44} />
        </div>
        <h2>PLEASE LOG IN</h2>
        <p>Login to view your items in the shopping bag.</p>
        <Link to="/login" className="btn btn-primary btn-lg">
          LOGIN NOW
        </Link>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px' }}>
        <Loader size="large" text="Updating shopping bag..." />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="container empty-state" style={{ padding: '80px 20px' }}>
        <div className="empty-state-icon">
          <ShoppingBag size={44} />
        </div>
        <h2>HEY, IT FEELS SO LIGHT!</h2>
        <p>There is nothing in your bag. Let's add some fashion items.</p>
        <Link to="/products" className="btn btn-primary btn-lg">
          ADD ITEMS FROM WISHLIST / CATALOGUE
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      <Breadcrumbs items={[{ label: 'Shopping Bag' }]} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '36px', marginTop: '16px' }}>
        {/* Left: Items in Bag */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 6,
              marginBottom: 20,
              fontSize: '0.88rem',
              fontWeight: 600,
            }}
          >
            <span>{summary.totalItems} Items Selected for Checkout</span>
            <span style={{ color: 'var(--success)' }}>
              {summary.deliveryCharge === 0 ? '✓ Free Express Delivery Applied' : 'Add items worth ₹' + (1199 - summary.subtotal) + ' for Free Delivery'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {items.map((it) => {
              const product = it.product || {};
              const image = product.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400';

              return (
                <div
                  key={it._id}
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: '16px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    backgroundColor: '#ffffff',
                    position: 'relative',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: 100,
                      height: 125,
                      borderRadius: 6,
                      overflow: 'hidden',
                      backgroundColor: '#f5f5f6',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={image}
                      alt={product.name || 'Product'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--dark)' }}>
                        {product.brand || 'Brand'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeFromCart(it._id)}
                        style={{ color: 'var(--light-muted)' }}
                        title="Remove item"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginTop: 2 }}>
                      {product.name || product.title}
                    </p>

                    <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: '0.82rem' }}>
                      <span
                        style={{
                          backgroundColor: 'var(--bg-subtle)',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontWeight: 600,
                        }}
                      >
                        Size: {it.selectedSize || 'M'}
                      </span>
                      {it.selectedColor && (
                        <span
                          style={{
                            backgroundColor: 'var(--bg-subtle)',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontWeight: 600,
                          }}
                        >
                          Color: {it.selectedColor.name}
                        </span>
                      )}
                    </div>

                    {/* Price and Quantity row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 14,
                        paddingTop: 10,
                        borderTop: '1px solid var(--border-light)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--dark)' }}>
                          ₹{it.itemTotal?.toLocaleString('en-IN') || (product.sellingPrice * it.quantity)?.toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice > product.sellingPrice && (
                          <span style={{ fontSize: '0.82rem', color: 'var(--light-muted)', textDecoration: 'line-through' }}>
                            ₹{((product.originalPrice || 0) * it.quantity)?.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ width: 28, height: 28, border: '1px solid var(--border)' }}
                          disabled={it.quantity <= 1}
                          onClick={() => updateQuantity(it._id, it.quantity - 1)}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', minWidth: 20, textAlign: 'center' }}>
                          {it.quantity}
                        </span>
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ width: 28, height: 28, border: '1px solid var(--border)' }}
                          onClick={() => updateQuantity(it._id, it.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Move to Wishlist */}
                    <button
                      type="button"
                      onClick={() => handleMoveToWishlist(it)}
                      style={{
                        marginTop: 8,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Heart size={13} /> MOVE TO WISHLIST
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Coupons & Bill Breakdown */}
        <div>
          {/* Coupons Card */}
          <div
            style={{
              padding: '20px',
              border: '1px solid var(--border)',
              borderRadius: 8,
              backgroundColor: '#ffffff',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.95rem', marginBottom: 12 }}>
              <Tag size={18} color="var(--primary)" /> APPLY COUPONS
            </div>

            {appliedCoupon ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--success-light)',
                  border: '1px solid #b2dfdb',
                  padding: '10px 14px',
                  borderRadius: 6,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.9rem' }}>
                    {appliedCoupon.code} Applied!
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#004d40' }}>
                    You saved ₹{appliedCoupon.discountAmount}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '0.8rem' }}
                >
                  REMOVE
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Enter coupon code (e.g. FIRST100)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                      textTransform: 'uppercase',
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={applying || !couponCode.trim()}
                    onClick={() => handleApplyCoupon()}
                  >
                    {applying ? '...' : 'APPLY'}
                  </button>
                </div>
                {couponError && (
                  <div style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 6 }}>
                    {couponError}
                  </div>
                )}

                {/* Available Quick Coupons */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                    Recommended Coupons:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {AVAILABLE_COUPONS.map((cp) => (
                      <div
                        key={cp.code}
                        onClick={() => handleApplyCoupon(cp.code)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: '1px dashed var(--border)',
                          padding: '6px 10px',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          backgroundColor: 'var(--bg-subtle)',
                        }}
                      >
                        <div>
                          <strong style={{ color: 'var(--primary)' }}>{cp.code}</strong>: {cp.desc}
                        </div>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>APPLY</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price Details Card */}
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
                fontSize: '0.88rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--dark)',
                marginBottom: 16,
              }}
            >
              PRICE DETAILS ({summary.totalItems} Items)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary)' }}>Total MRP</span>
                <span>₹{summary.totalMrp?.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary)' }}>Discount on MRP</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                  - ₹{summary.totalDiscount?.toLocaleString('en-IN')}
                </span>
              </div>

              {summary.couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--secondary)' }}>Coupon Discount ({summary.couponCode})</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                    - ₹{summary.couponDiscount?.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary)' }}>Convenience Fee</span>
                <span>₹{summary.convenienceFee}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary)' }}>Shipping Fee</span>
                <span>
                  {summary.deliveryCharge === 0 ? (
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE</span>
                  ) : (
                    `₹${summary.deliveryCharge}`
                  )}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border)',
                  paddingTop: 16,
                  marginTop: 6,
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: 'var(--dark)',
                }}
              >
                <span>Total Amount</span>
                <span style={{ color: 'var(--dark)' }}>₹{summary.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 24 }}
              onClick={() => navigate('/checkout')}
            >
              PLACE ORDER <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
