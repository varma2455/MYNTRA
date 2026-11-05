import React, { useState } from 'react';
import {
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  Truck,
  RotateCcw,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2
} from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useToast } from '../context/ToastContext';

const FAQS = [
  {
    q: 'How do I track my active shipment in real time?',
    a: 'Navigate to "Orders" in your account dashboard. Click on any active order to view live waypoint scans, estimated delivery dates, and assigned courier details.'
  },
  {
    q: 'What is Myntra Pro’s return and refund policy?',
    a: 'You can initiate returns within 14 days of delivery. Our courier will pick up the parcel directly from your doorstep. Refunds are automatically triggered to your original payment method within 2 to 4 hours of pickup.'
  },
  {
    q: 'Can I pay via Cash on Delivery (COD)?',
    a: 'Yes, Cash on Delivery is available across 25,000+ Indian pincodes. You can hand over cash or scan the delivery agent’s static dynamic QR code upon parcel arrival.'
  },
  {
    q: 'What should I do if an item received is damaged or wrong size?',
    a: 'Go to your Orders page and click "Return / Exchange". Choose "Size / Fit Issue" or "Defective Item" to request an immediate doorstep swap at no extra charge.'
  }
];

export const CustomerSupport = () => {
  const { success } = useToast();
  const [openFaq, setOpenFaq] = useState(0);

  // Ticket form
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitted(true);
    success('Support ticket submitted successfully! Reference ticket #TKT-8291 created.');
    setSubject('');
    setMessage('');
    setOrderNumber('');
  };

  return (
    <div className="container" style={{ paddingBottom: '80px', maxWidth: '960px' }}>
      <Breadcrumbs items={[{ label: 'Account', path: '/profile' }, { label: 'Customer Help Center' }]} />

      <div style={{ margin: '16px 0 28px 0' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
          Customer Help & Support Center
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '4px 0 0' }}>
          24x7 resolution for orders, delivery tracking, payment queries and doorstep exchanges.
        </p>
      </div>

      {/* Contact Channels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <Phone size={24} color="var(--primary)" style={{ marginBottom: 12 }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px' }}>Toll-Free Helpline</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '0 0 10px' }}>
            Speak with an ecommerce concierge.
          </p>
          <a href="tel:1800123456" style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
            1800-419-3500
          </a>
        </div>

        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <Mail size={24} color="#03a685" style={{ marginBottom: 12 }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px' }}>Email Support</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '0 0 10px' }}>
            Average response time under 15 minutes.
          </p>
          <a href="mailto:support@myntrapro.com" style={{ fontWeight: 800, color: '#03a685', fontSize: '0.95rem' }}>
            support@myntrapro.com
          </a>
        </div>

        <div className="card" style={{ padding: 20, borderRadius: 10, border: '1px solid var(--border)' }}>
          <MessageSquare size={24} color="#1a73e8" style={{ marginBottom: 12 }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px' }}>Live Concierge</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '0 0 10px' }}>
            Instant order status & returns assistance.
          </p>
          <span style={{ fontWeight: 800, color: '#1a73e8', fontSize: '0.95rem', cursor: 'pointer' }}>
            Chat Active 24x7
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 28, alignItems: 'start' }}>
        {/* FAQs */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 16 }}>Frequently Asked Questions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="card"
                  style={{
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: '#fff',
                      border: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'left',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 16px 14px', fontSize: '0.85rem', color: '#4a5568', lineHeight: 1.5, borderTop: '1px solid #f0f0f0', paddingTop: 10 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Ticket Form */}
        <div className="card" style={{ padding: 24, borderRadius: 10, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 14 }}>Raise an Order Issue Ticket</h3>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <CheckCircle2 size={40} color="#03a685" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontWeight: 800, margin: '0 0 6px' }}>Ticket Logged</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '0 0 16px' }}>
                Our customer care agent will review your request and contact you via registered email/phone.
              </p>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setSubmitted(false)}>
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                  Issue Category *
                </label>
                <select
                  required
                  className="input-field"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">-- Choose Category --</option>
                  <option value="Delivery Delay">Delivery Delay / Status Inquiry</option>
                  <option value="Return / Pickup Issue">Return / Doorstep Pickup Issue</option>
                  <option value="Refund Not Credited">Refund Not Credited</option>
                  <option value="Damaged / Wrong Product">Damaged or Wrong Product Received</option>
                  <option value="Payment / COD Discrepancy">Payment / COD Discrepancy</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                  Associated Order Number (Optional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. MYN-83921"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                  Explain Your Concern *
                </label>
                <textarea
                  required
                  rows={4}
                  className="input-field"
                  placeholder="Please describe details so our support team can expedite..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 6 }}
              >
                <Send size={15} /> Submit Support Request
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
