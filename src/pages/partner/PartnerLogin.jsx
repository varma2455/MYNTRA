import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Lock, Mail, Eye, EyeOff, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const PartnerLogin = () => {
  const { login, isAuthenticated, role } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('transport@myntrapro.com');
  const [password, setPassword] = useState('TransportPass123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'transport_manager' || role === 'super_admin' || role === 'admin') {
        navigate('/partner/dashboard', { replace: true });
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
      if (data.user?.role !== 'transport_manager' && data.user?.role !== 'super_admin') {
        setAuthError('Unauthorized: Your credentials do not possess Travel Partner/Logistics permissions.');
        navigate('/unauthorized');
        return;
      }
      success('Travel Partner authenticated successfully');
      navigate('/partner/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Partner authentication failed.';
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0d1f1d',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '440px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: 8,
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        <div style={{ backgroundColor: '#133934', padding: '24px', color: '#fff', textAlign: 'center' }}>
          <Truck size={36} color="#03a685" style={{ margin: '0 auto 8px auto' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
            Travel Partner Gateway
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: 4 }}>
            Fleet Coordination & Dispatch Operations
          </p>
        </div>

        <div style={{ padding: '28px' }}>
          {authError && (
            <div
              style={{
                backgroundColor: 'var(--danger-light)',
                color: 'var(--danger)',
                padding: '10px 14px',
                borderRadius: 4,
                fontSize: '0.85rem',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <ShieldAlert size={16} /> {authError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Partner Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: 38 }}
                  required
                />
                <Mail size={16} color="var(--muted)" style={{ position: 'absolute', left: 12, top: 14 }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: 38, paddingRight: 40 }}
                  required
                />
                <Lock size={16} color="var(--muted)" style={{ position: 'absolute', left: 12, top: 14 }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: 14, color: 'var(--muted)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginBottom: 16, backgroundColor: '#03a685' }}
              disabled={loading}
            >
              {loading ? 'AUTHENTICATING...' : 'ENTER PARTNER PORTAL'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={14} /> Back to Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
