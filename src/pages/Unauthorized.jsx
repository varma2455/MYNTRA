import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Unauthorized = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMyPortalLink = () => {
    if (role === 'super_admin' || role === 'admin') return '/admin/dashboard';
    if (role === 'company_staff') return '/company/dashboard';
    if (role === 'transport_manager') return '/partner/dashboard';
    if (role === 'delivery_staff') return '/delivery/dashboard';
    return '/';
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        backgroundColor: '#fafbfc',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: 8,
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          padding: '40px 32px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
          }}
        >
          <ShieldAlert size={40} />
        </div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark)' }}>
          403 — Access Restricted
        </h1>

        <p style={{ color: 'var(--secondary)', fontSize: '0.95rem', marginTop: 10, lineHeight: 1.6 }}>
          You do not have administrative or operational authorization to view this secure portal.
          Your current authenticated role is <strong>{role ? role.replace('_', ' ') : 'Guest'}</strong>.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
          <Link to={getMyPortalLink()} className="btn btn-primary btn-sm">
            <Home size={15} /> Return to My Portal
          </Link>
          <button type="button" onClick={handleLogout} className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }}>
            <LogOut size={15} /> Sign in with another account
          </button>
        </div>
      </div>
    </div>
  );
};
