import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Boxes, Lock, Mail, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const CompanyLogin = () => {
  const { login, isAuthenticated, role } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('company@myntrapro.com');
  const [password, setPassword] = useState('CompanyPass123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'company_staff' || role === 'super_admin' || role === 'admin') {
        navigate('/company/dashboard', { replace: true });
      } else {
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      const data = await login({ email: email.trim(), password });
      if (data.user?.role !== 'company_staff' && data.user?.role !== 'super_admin' && data.user?.role !== 'admin') {
        setAuthError('Unauthorized: Your credentials do not possess Company Operations rights.');
        navigate('/unauthorized');
        return;
      }
      success('Company Operations staff authenticated successfully');
      navigate('/company/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please check credentials.';
      setAuthError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: '#f8fafc',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#1e293b',
          borderRadius: 12,
          padding: '36px 32px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
          border: '1px solid #334155',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#94a3b8',
            fontSize: '0.82rem',
            marginBottom: 24,
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> Back to Storefront
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              backgroundColor: '#0d9488',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 20px rgba(13, 148, 136, 0.4)',
            }}
          >
            <Boxes size={30} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: 0.5 }}>
            Company Operations
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '6px 0 0' }}>
            Warehouse Fulfillment & Dispatch Terminal
          </p>
        </div>

        {authError && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: 6,
              fontSize: '0.82rem',
              marginBottom: 20,
            }}
          >
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
              Warehouse Staff Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
              <input
                type="email"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  paddingLeft: 38,
                  width: '100%',
                  backgroundColor: '#0f172a',
                  color: '#f8fafc',
                  borderColor: '#334155',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
              Security Key / Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  paddingLeft: 38,
                  paddingRight: 38,
                  width: '100%',
                  backgroundColor: '#0f172a',
                  color: '#f8fafc',
                  borderColor: '#334155',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 10,
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              backgroundColor: '#0d9488',
              borderColor: '#0d9488',
              padding: '12px',
              fontSize: '0.95rem',
              fontWeight: 800,
              letterSpacing: 0.5,
              marginTop: 6,
            }}
          >
            {loading ? 'Authenticating Staff...' : 'ACCESS FULFILLMENT DOCK'}
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #334155', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          <div>Authorized Warehouse Operations Staff Only</div>
          <div style={{ marginTop: 4, color: '#0d9488', fontWeight: 600 }}>
            Station: Bengaluru Central Fulfillment Hub
          </div>
        </div>
      </div>
    </div>
  );
};
