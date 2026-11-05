import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Shield,
  ShoppingBag,
  Heart,
  Package,
  Edit2,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Modal } from '../components/Modal';

export const Profile = () => {
  const { user, updateProfile, addAddress, deleteAddress, setDefaultAddress, logout, isAuthenticated } = useAuth();
  const { wishlistCount } = useWishlist();
  const { cartCount } = useCart();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Address modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: user?.name || '',
    mobile: user?.phone || '',
    pincode: '',
    street: '',
    locality: '',
    city: '',
    state: '',
    type: 'HOME',
    isDefault: false,
  });

  if (!isAuthenticated) {
    return (
      <div className="container empty-state" style={{ padding: '80px 20px' }}>
        <User size={48} color="var(--primary)" />
        <h2>PLEASE LOG IN</h2>
        <p>Login to view and manage your account details and saved addresses.</p>
        <Link to="/login" className="btn btn-primary btn-lg">
          LOGIN NOW
        </Link>
      </div>
    );
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      success('Profile details updated successfully');
      setIsEditing(false);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addAddress(newAddr);
      success('Address added successfully');
      setShowAddressModal(false);
      setNewAddr({
        name: user?.name || '',
        mobile: user?.phone || '',
        pincode: '',
        street: '',
        locality: '',
        city: '',
        state: '',
        type: 'HOME',
        isDefault: false,
      });
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      await deleteAddress(addrId);
      success('Address deleted');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (addrId) => {
    try {
      await setDefaultAddress(addrId);
      success('Default delivery address updated');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to set default address');
    }
  };

  const savedAddresses = user?.savedAddresses || [];

  return (
    <div className="container" style={{ paddingBottom: '80px', maxWidth: '1000px' }}>
      <Breadcrumbs items={[{ label: 'My Account' }]} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: '32px', marginTop: '20px' }}>
        {/* Left Column: Profile Card & Quick Stats */}
        <div>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 8,
              border: '1px solid var(--border)',
              padding: '24px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-card)',
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                fontSize: '2rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark)' }}>
              {user.name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 2 }}>{user.email}</p>

            <span
              style={{
                display: 'inline-block',
                marginTop: 8,
                backgroundColor: 'var(--dark)',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 10px',
                borderRadius: 4,
                textTransform: 'uppercase',
              }}
            >
              {user.role?.replace('_', ' ')}
            </span>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginTop: 24,
                paddingTop: 16,
                borderTop: '1px solid var(--border-light)',
              }}
            >
              <Link
                to="/orders"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '12px 8px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 6,
                }}
              >
                <Package size={20} color="var(--primary)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: 4 }}>Orders</span>
              </Link>

              <Link
                to="/wishlist"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '12px 8px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 6,
                }}
              >
                <Heart size={20} color="var(--primary)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: 4 }}>
                  Wishlist ({wishlistCount})
                </span>
              </Link>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ width: '100%', marginTop: 20, color: 'var(--danger)' }}
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* Right Column: Personal Info & Address Book */}
        <div>
          {/* 1. Personal Information */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 8,
              border: '1px solid var(--border)',
              padding: '24px',
              marginBottom: 24,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, textTransform: 'uppercase' }}>
                Profile Details
              </h3>
              {!isEditing && (
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={13} /> Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={savingProfile}
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <User size={18} color="var(--muted)" />
                  <div>
                    <span style={{ color: 'var(--muted)', fontSize: '0.78rem', display: 'block' }}>Name</span>
                    <strong>{user.name}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Mail size={18} color="var(--muted)" />
                  <div>
                    <span style={{ color: 'var(--muted)', fontSize: '0.78rem', display: 'block' }}>Email</span>
                    <strong>{user.email}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Phone size={18} color="var(--muted)" />
                  <div>
                    <span style={{ color: 'var(--muted)', fontSize: '0.78rem', display: 'block' }}>Mobile</span>
                    <strong>{user.phone || 'Not added'}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Address Book */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 8,
              border: '1px solid var(--border)',
              padding: '24px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, textTransform: 'uppercase' }}>
                Saved Delivery Addresses ({savedAddresses.length})
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
                No addresses saved yet. Add your home or office address for fast 1-click checkout.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {savedAddresses.map((addr) => (
                  <div
                    key={addr._id}
                    style={{
                      padding: '16px',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <strong>{addr.name}</strong>
                        <span className="badge badge-info">{addr.type}</span>
                        {addr.isDefault && <span className="badge badge-success">DEFAULT</span>}
                      </div>

                      <div style={{ fontSize: '0.88rem', color: 'var(--secondary)', marginTop: 6, lineHeight: 1.5 }}>
                        {addr.street}, {addr.locality ? `${addr.locality}, ` : ''}{addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 4 }}>
                        Mobile: {addr.mobile}
                      </div>

                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(addr._id)}
                          style={{
                            marginTop: 8,
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            textTransform: 'uppercase',
                          }}
                        >
                          Make Default
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr._id)}
                      style={{ color: 'var(--danger)', padding: 4 }}
                      title="Delete address"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="Add New Address"
      >
        <form onSubmit={handleAddAddress}>
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
            <label className="form-label">Street / House / Building *</label>
            <input
              type="text"
              className="form-control"
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
