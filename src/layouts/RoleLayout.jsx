import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  Truck,
  Package,
  Layers,
  Users,
  FileText,
  BarChart3,
  ShoppingBag,
  LogOut,
  ArrowLeft,
  CheckCircle,
  Clock,
  UserCheck,
  CreditCard,
  AlertTriangle,
  Compass,
  Navigation,
  Car,
  Bell,
  User,
  HelpCircle,
  Boxes,
  Send,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RoleLayout = ({ portalRole, title }) => {
  const { user, logout, isSuperAdmin, isCompanyStaff, isTransportManager, isDeliveryStaff } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  let navItems = [];
  let headerColor = '#ff3f6c';
  let badgeBg = '#ff3f6c';

  if (portalRole === 'admin') {
    headerColor = '#ff3f6c';
    badgeBg = '#ff3f6c';
    navItems = [
      { label: 'Executive Dashboard', href: '/admin/dashboard', icon: <BarChart3 size={18} /> },
      { label: 'Product Catalog', href: '/admin/products', icon: <Package size={18} /> },
      { label: '15 Categories', href: '/admin/categories', icon: <Layers size={18} /> },
      { label: 'Inventory Watchlist', href: '/admin/inventory', icon: <AlertTriangle size={18} /> },
      { label: 'Orders & Fulfillment', href: '/admin/orders', icon: <ShoppingBag size={18} /> },
      { label: 'Customer Accounts', href: '/admin/customers', icon: <Users size={18} /> },
      { label: 'Staff Management', href: '/admin/staff', icon: <UserCheck size={18} /> },
      { label: 'Travel Partners', href: '/admin/travel-partners', icon: <Truck size={18} /> },
      { label: 'Delivery Staff Roster', href: '/admin/delivery-staff', icon: <Navigation size={18} /> },
      { label: 'All Waybill Shipments', href: '/admin/shipments', icon: <Compass size={18} /> },
      { label: 'Payments & Revenue', href: '/admin/payments', icon: <CreditCard size={18} /> },
      { label: 'Analytics Reports', href: '/admin/reports', icon: <BarChart3 size={18} /> },
      { label: 'Audit Log Trail', href: '/admin/audit-logs', icon: <FileText size={18} /> },
    ];
  } else if (portalRole === 'company') {
    headerColor = '#0d9488';
    badgeBg = '#0d9488';
    navItems = [
      { label: 'Fulfillment Dashboard', href: '/company/dashboard', icon: <BarChart3 size={18} /> },
      { label: 'All Orders Queue', href: '/company/orders', icon: <ShoppingBag size={18} /> },
      { label: 'Processing Queue', href: '/company/processing', icon: <Clock size={18} /> },
      { label: 'Packing & Checklists', href: '/company/packing', icon: <Package size={18} /> },
      { label: 'Ready for Dispatch', href: '/company/ready-to-dispatch', icon: <CheckCircle size={18} /> },
      { label: 'Partner Dispatch Desk', href: '/company/dispatch', icon: <Send size={18} /> },
      { label: 'Shipments Manifest', href: '/company/shipments', icon: <Truck size={18} /> },
      { label: 'Returns Inspection', href: '/company/returns', icon: <RotateCcw size={18} /> },
      { label: 'Warehouse Inventory', href: '/company/inventory', icon: <AlertTriangle size={18} /> },
      { label: 'Operations Alerts', href: '/company/notifications', icon: <Bell size={18} /> },
      { label: 'Warehouse Profile', href: '/company/profile', icon: <User size={18} /> },
    ];
  } else if (portalRole === 'partner') {
    headerColor = '#03a685';
    badgeBg = '#03a685';
    navItems = [
      { label: 'Partner Dashboard', href: '/partner/dashboard', icon: <BarChart3 size={18} /> },
      { label: 'All Shipments', href: '/partner/shipments', icon: <Truck size={18} /> },
      { label: 'Available for Dispatch', href: '/partner/available-shipments', icon: <Clock size={18} /> },
      { label: 'Dispatch Assignments', href: '/partner/assignments', icon: <CheckCircle size={18} /> },
      { label: 'Assigned Drivers', href: '/partner/delivery-staff', icon: <Users size={18} /> },
      { label: 'Fleet & Vehicles', href: '/partner/vehicles', icon: <Car size={18} /> },
      { label: 'Live Tracking Map', href: '/partner/tracking', icon: <Compass size={18} /> },
      { label: 'Logistics Reports', href: '/partner/reports', icon: <FileText size={18} /> },
      { label: 'Partner Profile', href: '/partner/profile', icon: <User size={18} /> },
    ];
  } else if (portalRole === 'delivery') {
    headerColor = '#ff905a';
    badgeBg = '#ff905a';
    navItems = [
      { label: 'Rider Dashboard', href: '/delivery/dashboard', icon: <Package size={18} /> },
      { label: 'Available Deliveries', href: '/delivery/available-orders', icon: <Clock size={18} /> },
      { label: 'My Active Deliveries', href: '/delivery/my-deliveries', icon: <Truck size={18} /> },
      { label: 'Delivery History', href: '/delivery/history', icon: <CheckCircle size={18} /> },
      { label: 'Notifications', href: '/delivery/notifications', icon: <Bell size={18} /> },
      { label: 'Courier Profile', href: '/delivery/profile', icon: <User size={18} /> },
    ];
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Top Portal Header */}
      <header
        style={{
          backgroundColor: '#1e2230',
          color: '#ffffff',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #2d3345',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#a0aec0',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Storefront
          </Link>

          <div style={{ height: 20, width: 1, backgroundColor: '#4a5568' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {portalRole === 'admin' && <Shield size={20} color={headerColor} />}
            {portalRole === 'company' && <Boxes size={20} color={headerColor} />}
            {portalRole === 'partner' && <Truck size={20} color={headerColor} />}
            {portalRole === 'delivery' && <Package size={20} color={headerColor} />}
            <span style={{ fontWeight: 800, letterSpacing: 0.5, fontSize: '1.05rem' }}>{title}</span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: badgeBg,
                color: '#fff',
                padding: '2px 8px',
                borderRadius: 4,
                textTransform: 'uppercase',
              }}
            >
              {portalRole === 'company' ? 'COMPANY OPERATIONS' : (portalRole === 'partner' ? 'TRAVEL PARTNER' : user?.role?.replace('_', ' '))}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{user?.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#a0aec0' }}>{user?.email}</div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="btn btn-outline btn-sm"
            style={{ color: '#ff5252', borderColor: '#4a5568' }}
          >
            <LogOut size={14} /> Exit
          </button>
        </div>
      </header>

      {/* Main Portal View with Sidebar */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside
          style={{
            width: '260px',
            backgroundColor: '#ffffff',
            borderRight: '1px solid var(--border)',
            padding: '20px 12px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '9px 14px',
                    borderRadius: 6,
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: isActive ? headerColor : 'var(--dark)',
                    backgroundColor: isActive ? 'var(--bg-subtle)' : 'transparent',
                    borderLeft: isActive ? `3px solid ${headerColor}` : '3px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 6,
              fontSize: '0.78rem',
              color: 'var(--muted)',
            }}
          >
            <div>Connected Database: <strong>myntra_pro</strong></div>
            <div>Secure RBAC: <strong>Enforced</strong></div>
          </div>
        </aside>

        {/* Content Area */}
        <main style={{ flex: 1, padding: '28px 32px', overflowX: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
