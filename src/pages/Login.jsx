import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!email.trim() || !password) {
      setAuthError('Please enter both your email address and password');
      return;
    }

    setLoading(true);
    try {
      const data = await login({ email: email.trim(), password });
      success(`Welcome back, ${data.user?.name || 'Shopper'}!`);

      // Redirect based on role according to multi-role architecture
      if (location.state?.from?.pathname) {
        navigate(location.state.from.pathname);
      } else if (data.user?.role === 'super_admin' || data.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.user?.role === 'company_staff') {
        navigate('/company/dashboard');
      } else if (data.user?.role === 'transport_manager') {
        navigate('/partner/dashboard');
      } else if (data.user?.role === 'delivery_staff') {
        navigate('/delivery/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setAuthError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for testing demo credentials
  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setAuthError('');
  };

  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        backgroundColor: '#fafbfc',
      }}
    >
      <div
        style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: 8,
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        {/* Banner Top Strip */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ff3f6c 0%, #ff527b 100%)',
            padding: '24px 32px',
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
            Sign In to Myntra Pro
          </h2>
          <p style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: 4 }}>
            Access your orders, wishlist, saved addresses & bag
          </p>
        </div>

        <div style={{ padding: '32px' }}>
          {authError && (
            <div
              style={{
                backgroundColor: 'var(--danger-light)',
                border: '1px solid #ffcdd2',
                borderRadius: 4,
                padding: '12px 14px',
                marginBottom: 20,
                color: 'var(--danger)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>{authError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. demo@myntrapro.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: 38 }}
                  required
                />
                <Mail size={16} color="var(--muted)" style={{ position: 'absolute', left: 12, top: 14 }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                  Forgot?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: 38, paddingRight: 40 }}
                  required
                />
                <Lock size={16} color="var(--muted)" style={{ position: 'absolute', left: 12, top: 14 }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: 13, color: 'var(--muted)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginBottom: 16 }}
              disabled={loading}
            >
              {loading ? 'LOGGING IN...' : 'CONTINUE'}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--muted)', marginTop: 8 }}>
            New to Myntra Pro?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Create Account
            </Link>
          </div>

          {/* Quick Demo Credentials Roster */}
          <div
            style={{
              marginTop: 28,
              paddingTop: 20,
              borderTop: '1px solid var(--border-light)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <UserCheck size={14} /> Quick Demo Logins:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fillCredentials('demo@myntrapro.com', 'Password123')}
                style={{ fontSize: '0.72rem', padding: '6px 8px', justifyContent: 'flex-start' }}
              >
                👤 Customer
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fillCredentials('admin@myntrapro.com', 'AdminPassword123')}
                style={{ fontSize: '0.72rem', padding: '6px 8px', justifyContent: 'flex-start', color: 'var(--primary)' }}
              >
                👑 Super Admin
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fillCredentials('transport@myntrapro.com', 'TransportPass123')}
                style={{ fontSize: '0.72rem', padding: '6px 8px', justifyContent: 'flex-start', color: '#03a685' }}
              >
                🚚 Transport
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fillCredentials('delivery@myntrapro.com', 'DeliveryPass123')}
                style={{ fontSize: '0.72rem', padding: '6px 8px', justifyContent: 'flex-start', color: '#ff905a' }}
              >
                🛵 Delivery Staff
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
