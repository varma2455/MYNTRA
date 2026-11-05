import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="container empty-state" style={{ padding: '80px 20px' }}>
        <CheckCircle size={48} color="var(--success)" />
        <h2>Order Processed</h2>
        <p>Your order details can be viewed anytime in your account order history.</p>
        <Link to="/orders" className="btn btn-primary">
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '80px', maxWidth: '800px' }}>
      <Breadcrumbs items={[{ label: 'Orders', href: '/orders' }, { label: 'Confirmation' }]} />

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 8,
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
          marginTop: 20,
        }}
      >
        {/* Top Success Banner */}
        <div
          style={{
            backgroundColor: '#e8f7f3',
            borderBottom: '1px solid #b2dfdb',
            padding: '32px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'var(--success)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <CheckCircle size={36} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#004d40' }}>
            ORDER CONFIRMED!
          </h1>
          <p style={{ color: '#00695c', fontSize: '0.95rem', marginTop: 4 }}>
            Thank you for shopping with Myntra Pro. We have sent a confirmation email to your account.
          </p>
        </div>

        {/* Order Meta Bar */}
        <div
          style={{
            padding: '20px 28px',
            backgroundColor: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            fontSize: '0.88rem',
          }}
        >
          <div>
            <div style={{ color: 'var(--muted)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
              Order Reference
            </div>
            <div style={{ fontWeight: 800, color: 'var(--dark)', fontSize: '1rem' }}>
              {order.orderId}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--muted)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
              Waybill / Tracking Number
            </div>
            <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
              {order.trackingNumber || 'TRK-2026-LIVE'}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--muted)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
              Estimated Delivery
            </div>
            <div style={{ fontWeight: 700, color: 'var(--success)' }}>
              {order.estimatedDeliveryDate || 'Within 3-4 Business Days'}
            </div>
          </div>
        </div>

        {/* Delivery Address & Items */}
        <div style={{ padding: '28px' }}>
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={16} /> Delivery Address
            </h4>
            <div style={{ fontSize: '0.92rem', lineHeight: 1.5 }}>
              <strong>{order.shippingAddress?.name}</strong> • {order.shippingAddress?.mobile}
              <div style={{ color: 'var(--secondary)', marginTop: 2 }}>
                {order.shippingAddress?.street}, {order.shippingAddress?.locality ? `${order.shippingAddress?.locality}, ` : ''}{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Package size={16} /> Ordered Items ({order.items?.length || 0})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(order.items || []).map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: 6,
                  }}
                >
                  <img
                    src={it.image || 'https://via.placeholder.com/80'}
                    alt={it.productName}
                    style={{ width: 60, height: 75, objectFit: 'cover', borderRadius: 4 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{it.brand}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{it.productName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: 2 }}>
                      Size: {it.size} • Color: {it.color} • Qty: {it.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                    ₹{(it.price * it.quantity)?.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Paid */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 6,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '1rem',
              fontWeight: 800,
            }}
          >
            <span>Total Paid ({order.paymentMethod}):</span>
            <span style={{ fontSize: '1.2rem', color: 'var(--dark)' }}>
              ₹{order.total?.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Action Navigation */}
          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <Link to="/orders" className="btn btn-outline" style={{ flex: 1 }}>
              View All Orders
            </Link>
            <Link to="/products" className="btn btn-primary" style={{ flex: 1 }}>
              Continue Shopping <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
