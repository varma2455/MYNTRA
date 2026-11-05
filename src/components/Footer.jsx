import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, RefreshCw, Truck, Award, Smartphone, Mail, Phone, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        {/* Value Propositions / Promises */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24,
            paddingBottom: 36,
            marginBottom: 36,
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="footer-guarantee">
            <div className="footer-guarantee-icon">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h5 style={{ fontSize: '0.9rem', fontWeight: 700 }}>100% ORIGINAL</h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>All products are authentic and direct from brands</p>
            </div>
          </div>

          <div className="footer-guarantee">
            <div className="footer-guarantee-icon">
              <RefreshCw size={24} />
            </div>
            <div>
              <h5 style={{ fontSize: '0.9rem', fontWeight: 700 }}>EASY 14 DAYS RETURN</h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Hassle-free instant return & pickup from your door</p>
            </div>
          </div>

          <div className="footer-guarantee">
            <div className="footer-guarantee-icon">
              <Truck size={24} />
            </div>
            <div>
              <h5 style={{ fontSize: '0.9rem', fontWeight: 700 }}>FAST EXPRESS DELIVERY</h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Free delivery on fashion orders above ₹1199</p>
            </div>
          </div>

          <div className="footer-guarantee">
            <div className="footer-guarantee-icon">
              <Award size={24} />
            </div>
            <div>
              <h5 style={{ fontSize: '0.9rem', fontWeight: 700 }}>PREMIUM EXPERIENCE</h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Over 750+ handpicked styles across 15 categories</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="footer-grid">
          <div className="footer-column">
            <h4>Online Shopping</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <ul>
                <li><Link to="/products?category=mens-clothing">Men's Clothing</Link></li>
                <li><Link to="/products?category=womens-clothing">Women's Clothing</Link></li>
                <li><Link to="/products?category=kids-clothing">Kids' Clothing</Link></li>
                <li><Link to="/products?category=mens-footwear">Men's Footwear</Link></li>
                <li><Link to="/products?category=womens-footwear">Women's Footwear</Link></li>
                <li><Link to="/products?category=kids-footwear">Kids' Footwear</Link></li>
                <li><Link to="/products?category=bags-backpacks">Bags & Backpacks</Link></li>
                <li><Link to="/products?category=watches-wearables">Watches & Wearables</Link></li>
              </ul>
              <ul>
                <li><Link to="/products?category=jewellery">Jewellery</Link></li>
                <li><Link to="/products?category=beauty-makeup">Beauty & Makeup</Link></li>
                <li><Link to="/products?category=skincare-personal-care">Skincare & Personal Care</Link></li>
                <li><Link to="/products?category=sportswear-activewear">Sportswear & Activewear</Link></li>
                <li><Link to="/products?category=home-living">Home & Living</Link></li>
                <li><Link to="/products?category=ethnic-traditional-wear">Ethnic & Traditional</Link></li>
                <li><Link to="/products?category=lingerie-sleepwear">Lingerie & Sleepwear</Link></li>
                <li><Link to="/categories"><strong>All 15 Categories →</strong></Link></li>
              </ul>
            </div>
          </div>

          <div className="footer-column">
            <h4>Customer Policies</h4>
            <ul>
              <li><Link to="/account/orders">Track Orders</Link></li>
              <li><Link to="/profile">Shipping & Delivery</Link></li>
              <li><Link to="/account/returns">Returns & Refunds Center</Link></li>
              <li><Link to="/account/support">24x7 Customer Support</Link></li>
              <li><Link to="/profile">Cancellation Policy</Link></li>
              <li><Link to="/profile">Terms of Use</Link></li>
              <li><Link to="/profile">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Role Portals & Tools</h4>
            <ul>
              <li><Link to="/admin/dashboard">Super Admin Portal</Link></li>
              <li><Link to="/company/dashboard">Company Operations Dock</Link></li>
              <li><Link to="/partner/dashboard">Travel Partner Operations</Link></li>
              <li><Link to="/delivery/dashboard">Courier Delivery App</Link></li>
              <li><Link to="/wishlist">My Wishlist</Link></li>
              <li><Link to="/cart">Shopping Bag</Link></li>
              <li><Link to="/account/addresses">Address Book</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Experience Myntra Pro App</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 16 }}>
              Get real-time order tracking, exclusive discounts and fast mobile checkout.
            </p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div
                style={{
                  background: '#000',
                  color: '#fff',
                  borderRadius: 6,
                  padding: '8px 14px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <Smartphone size={18} />
                <div>
                  <div style={{ fontSize: '0.6rem', color: '#ccc' }}>GET IT ON</div>
                  <div style={{ fontWeight: 700 }}>Google Play</div>
                </div>
              </div>
              <div
                style={{
                  background: '#000',
                  color: '#fff',
                  borderRadius: 6,
                  padding: '8px 14px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <Smartphone size={18} />
                <div>
                  <div style={{ fontSize: '0.6rem', color: '#ccc' }}>DOWNLOAD ON</div>
                  <div style={{ fontWeight: 700 }}>App Store</div>
                </div>
              </div>
            </div>

            <h5 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
              Need Help?
            </h5>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Mail size={14} /> support@myntrapro.com
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={14} /> +91 (800) 123-MYNTRA
            </div>
          </div>
        </div>

        {/* Footer Bottom Strip */}
        <div className="footer-bottom">
          <div>
            © 2026 Myntra Pro E-Commerce Pvt. Ltd. Inspired by Myntra. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            Crafted with <Heart size={14} fill="#ff3f6c" color="#ff3f6c" /> for Fashion Lovers across India
          </div>
        </div>
      </div>
    </footer>
  );
};
