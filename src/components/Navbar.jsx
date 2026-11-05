import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Shield,
  Truck,
  Package,
  LogOut,
  MapPin,
  Tag,
  ArrowRight,
  Boxes,
  Sparkles,
  Zap,
  Flame,
  LayoutGrid,
  Shirt,
  Smile,
  Palette,
  Footprints,
  Glasses,
  Home,
  Dumbbell,
  Gem,
  Headphones,
  Crown,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import { useDebounce } from '../hooks/useDebounce';
import { AIChatModal } from './AIChatModal';

export const ALL_CATEGORIES = [
  {
    id: 'men',
    slug: 'men',
    name: 'Men',
    href: '/products?category=men',
    description: 'Casual Shirts, Denims, Jackets & Blazers',
    count: '12 Styles',
    icon: Shirt,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    id: 'women',
    slug: 'women',
    name: 'Women',
    href: '/products?category=women',
    description: 'Dresses, Kurtas, Sarees, Western Tops',
    count: '12 Styles',
    icon: Sparkles,
    color: '#ec4899',
    bg: '#fdf2f8',
    border: '#fbcfe8',
  },
  {
    id: 'kids',
    slug: 'kids',
    name: 'Kids',
    href: '/products?category=kids',
    description: 'Boys & Girls Wear, Playwear, Shoes',
    count: '10 Styles',
    icon: Smile,
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  {
    id: 'beauty',
    slug: 'beauty',
    name: 'Beauty',
    href: '/products?category=beauty',
    description: 'Luxury Skincare, Makeup, Perfumes',
    count: '10 Styles',
    icon: Palette,
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fecaca',
  },
  {
    id: 'footwear',
    slug: 'footwear',
    name: 'Footwear',
    href: '/products?category=footwear',
    description: 'Sneakers, Formal Oxfords, Loafers & Heels',
    count: '10 Styles',
    icon: Footprints,
    color: '#8b5cf6',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
  {
    id: 'accessories',
    slug: 'accessories',
    name: 'Accessories',
    href: '/products?category=accessories',
    description: 'Leather Bags, Wallets, Belts, Eyewear',
    count: '9 Styles',
    icon: Glasses,
    color: '#06b6d4',
    bg: '#ecfeff',
    border: '#a5f3fc',
  },
  {
    id: 'home-living',
    slug: 'home-living',
    name: 'Home & Living',
    href: '/products?category=home-living',
    description: 'Bed Linens, Ceramic Decor, Diffusers, Rugs',
    count: '8 Styles',
    icon: Home,
    color: '#10b981',
    bg: '#ecfdf5',
    border: '#a7f3d0',
  },
  {
    id: 'sports-fitness',
    slug: 'sports-fitness',
    name: 'Sports & Fitness',
    href: '/products?category=sports-fitness',
    description: 'Activewear, Gym Tees, Trackpants, Yoga',
    count: '8 Styles',
    icon: Dumbbell,
    color: '#f97316',
    bg: '#fff7ed',
    border: '#fed7aa',
  },
  {
    id: 'jewellery',
    slug: 'jewellery',
    name: 'Jewellery',
    href: '/products?category=jewellery',
    description: 'Sterling Silver, Gold Pendants, Rings',
    count: '7 Styles',
    icon: Gem,
    color: '#eab308',
    bg: '#fefce8',
    border: '#fef08a',
  },
  {
    id: 'electronics-lifestyle',
    slug: 'electronics-lifestyle',
    name: 'Electronics & Lifestyle',
    href: '/products?category=electronics-lifestyle',
    description: 'Smartwatches, ANC Audio, Smart Gadgets',
    count: '7 Styles',
    icon: Headphones,
    color: '#6366f1',
    bg: '#eef2ff',
    border: '#c7d2fe',
  },
  {
    id: 'premium-luxe',
    slug: 'premium-luxe',
    name: 'Premium Luxe',
    href: '/products?category=premium-luxe',
    description: 'Couture Atelier, Mulberry Silk, Swiss Watches',
    count: '7 Styles',
    icon: Crown,
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  {
    id: 'all-products',
    slug: '',
    name: 'All 100 Styles',
    href: '/products',
    description: 'Explore entire verified product catalog with filters',
    count: '100 Total',
    icon: Boxes,
    color: '#ff3f6c',
    bg: '#fff0f3',
    border: '#ffd0d9',
  },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems: cartCount } = useCart();
  const { totalItems: wishlistCount } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 250);
  const searchRef = useRef(null);
  const categoriesRef = useRef(null);

  const currentCategory = new URLSearchParams(location.search).get('category') || '';

  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  const isTransportManager = user?.role === 'transport_manager';
  const isDeliveryStaff = user?.role === 'delivery_staff';
  const isCompanyStaff = user?.role === 'company_staff';

  useEffect(() => {
    setCategoriesOpen(false);
    setMobileMenuOpen(false);
    setShowSuggestions(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setCategoriesOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setCategoriesOpen(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    let isCurrent = true;
    if (!debouncedSearch.trim()) {
      setSuggestions([]);
      return;
    }

    productService
      .getProducts({ q: debouncedSearch.trim(), limit: 6 })
      .then((res) => {
        if (isCurrent && res?.products) {
          setSuggestions(res.products);
          setShowSuggestions(true);
        }
      })
      .catch((err) => {
        console.error('Search suggestion error:', err);
      });

    return () => {
      isCurrent = false;
    };
  }, [debouncedSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (product) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/product/${product.id || product._id}`);
  };

  return (
    <>
      {/* Top Promotional Announcement Strip */}
      <div className="announcement-bar">
        <span>🎉 MYNTRA PRO LUXURY CARNIVAL | 50-80% OFF</span>
        <span>•</span>
        <span>FREE DELIVERY ON ORDERS ABOVE ₹1199</span>
        <span>•</span>
        <span>Code: <strong style={{ color: '#fff' }}>FIRST100</strong> for Flat ₹100 Off</span>
      </div>

      <header className="navbar">
        <div className="container navbar-container">
          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="mobile-nav-toggle btn-icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Left: Brand Logo Only */}
          <div className="navbar-left">
            <Link to="/" className="navbar-logo" aria-label="Myntra Pro Luxe Home">
              <svg className="logo-icon-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="20" fill="#FF3F6C" />
                <path d="M22 75V25L42 55L50 43L58 55L78 25V75H64V46L53.5 62H46.5L36 46V75H22Z" fill="white" />
              </svg>
              <div className="logo-text">
                <span className="logo-main">MYNTRA</span>
                <span className="logo-sub">PRO LUXE</span>
              </div>
            </Link>
          </div>

          {/* Center: CATEGORIES Button + Search Bar */}
          <div className="navbar-center-wrapper">
            {/* CATEGORIES BUTTON & MEGA-DROPDOWN */}
            <div className="categories-dropdown-container" ref={categoriesRef}>
              <button
                type="button"
                className={`categories-nav-btn ${categoriesOpen ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCategoriesOpen((prev) => !prev);
                }}
                aria-expanded={categoriesOpen}
                aria-haspopup="true"
                aria-label="Toggle categories menu"
              >
                <LayoutGrid size={18} className="categories-btn-icon" />
                <span>CATEGORIES</span>
                <ChevronDown size={15} className={`categories-btn-arrow ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Categories Mega Dropdown Menu */}
              {categoriesOpen && (
                <div className="categories-mega-dropdown" role="menu">
                  <div className="categories-dropdown-header">
                    <div>
                      <div className="categories-header-title">
                        <Sparkles size={16} color="var(--primary)" />
                        <span>Shop by Department</span>
                      </div>
                      <div className="categories-header-subtitle">
                        Explore all 11 curated luxury departments & 100 verified styles
                      </div>
                    </div>
                    <div className="categories-header-badge">
                      <Tag size={13} />
                      <span>100 Unique Products</span>
                    </div>
                  </div>

                  <div className="categories-dropdown-grid">
                    {ALL_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isActive = cat.slug
                        ? currentCategory === cat.slug
                        : location.pathname === '/products' && !currentCategory;

                      return (
                        <Link
                          key={cat.id}
                          to={cat.href}
                          role="menuitem"
                          onClick={() => setCategoriesOpen(false)}
                          className={`category-dropdown-card ${isActive ? 'active-category' : ''}`}
                        >
                          <div className="category-card-left">
                            <div
                              className="category-card-icon-box"
                              style={{
                                backgroundColor: cat.bg,
                                color: cat.color,
                                border: `1px solid ${cat.border}`,
                              }}
                            >
                              <Icon size={20} />
                            </div>
                            <div className="category-card-info">
                              <div className="category-card-name-row">
                                <span className="category-card-name">{cat.name}</span>
                                {isActive && <Check size={14} color="var(--primary)" />}
                              </div>
                              <div className="category-card-desc">{cat.description}</div>
                            </div>
                          </div>
                          <span className={`category-card-badge ${isActive ? 'active' : ''}`}>
                            {cat.count}
                          </span>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="categories-dropdown-footer">
                    <div className="categories-dropdown-footer-left">
                      <Flame size={15} color="#ff3f6c" />
                      <span>Myntra Pro Luxe Carnival: Flat ₹100 Off with coupon FIRST100</span>
                    </div>
                    <Link
                      to="/products"
                      onClick={() => setCategoriesOpen(false)}
                      className="categories-dropdown-footer-link"
                    >
                      <span>Explore All 100 Styles</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Center: Search Bar with Autocomplete & AI NLP prompt */}
            <div className="navbar-search" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search brands, outfits, styles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px', color: 'var(--muted)' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </form>

              {/* Search Autocomplete Suggestions */}
              {showSuggestions && (
                <div className="search-suggestions-dropdown">
                  {/* AI NLP Search Prompt */}
                  {searchQuery.trim().length > 2 && (
                    <div
                      onClick={handleSearchSubmit}
                      style={{
                        padding: '10px 14px',
                        background: 'linear-gradient(135deg, #fff0f3 0%, #ffe3e8 100%)',
                        borderBottom: '1px solid #ffd0d9',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--primary)',
                      }}
                    >
                      <Sparkles size={16} />
                      <span>Search AI collection: "{searchQuery}"</span>
                    </div>
                  )}

                  {suggestions.map((p) => (
                    <div
                      key={p.id || p._id}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(p)}
                    >
                      <img
                        src={p.images?.[0] || 'https://via.placeholder.com/40'}
                        alt={p.name}
                        className="suggestion-img"
                      />
                      <div className="suggestion-info">
                        <div className="suggestion-name">{p.name}</div>
                        <div className="suggestion-brand">
                          {p.brand} • <strong style={{ color: 'var(--primary)' }}>₹{p.sellingPrice}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: AI Concierge, Profile, Wishlist, Cart Actions */}
          <div className="navbar-right">
            {/* AI Concierge Button */}
            <button
              type="button"
              onClick={() => setIsAIChatOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #fff0f3 0%, #ffe3e8 100%)',
                border: '1px solid #ff3f6c',
                borderRadius: 20,
                padding: '6px 14px',
                color: '#ff3f6c',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 6px rgba(255, 63, 108, 0.15)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Sparkles size={15} color="#ff3f6c" />
              <span style={{ fontSize: '0.8rem', letterSpacing: 0.5 }}>AI CONCIERGE</span>
            </button>

            {/* User Profile Dropdown */}
            <div className="profile-dropdown-wrapper">
              <Link to={isAuthenticated ? '/profile' : '/login'} className="nav-action-btn">
                <User size={20} />
                <span>{isAuthenticated ? user?.name?.split(' ')[0] || 'Profile' : 'Profile'}</span>
              </Link>

              <div className="profile-dropdown-menu">
                {isAuthenticated ? (
                  <>
                    <div className="profile-welcome">
                      <h4>Hello, {user?.name}</h4>
                      <p>{user?.email}</p>
                      {user?.role && user.role !== 'customer' && (
                        <span className="role-badge">{user.role.replace('_', ' ')}</span>
                      )}
                    </div>
                    <ul className="profile-links">
                      <li>
                        <Link to="/profile">
                          <User size={16} /> My Account
                        </Link>
                      </li>
                      <li>
                        <Link to="/orders">
                          <Package size={16} /> Orders & Returns
                        </Link>
                      </li>
                      <li>
                        <Link to="/wishlist">
                          <Heart size={16} /> Wishlist ({wishlistCount})
                        </Link>
                      </li>

                      {/* Role-Specific Portal Links */}
                      {isSuperAdmin && (
                        <li style={{ borderTop: '1px solid var(--border-light)', paddingTop: 6, marginTop: 6 }}>
                          <Link to="/admin/dashboard" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                            <Shield size={16} /> Super Admin Portal
                          </Link>
                        </li>
                      )}
                      {isCompanyStaff && (
                        <li>
                          <Link to="/company/dashboard" style={{ color: '#0d9488', fontWeight: 700 }}>
                            <Boxes size={16} /> Company Operations
                          </Link>
                        </li>
                      )}
                      {isTransportManager && (
                        <li>
                          <Link to="/partner/dashboard" style={{ color: '#03a685', fontWeight: 700 }}>
                            <Truck size={16} /> Travel Partner Portal
                          </Link>
                        </li>
                      )}
                      {isDeliveryStaff && (
                        <li>
                          <Link to="/delivery/dashboard" style={{ color: '#ff905a', fontWeight: 700 }}>
                            <Package size={16} /> Courier Delivery Portal
                          </Link>
                        </li>
                      )}

                      <li style={{ borderTop: '1px solid var(--border-light)', paddingTop: 6, marginTop: 6 }}>
                        <button onClick={logout} style={{ color: 'var(--danger)' }}>
                          <LogOut size={16} /> Logout
                        </button>
                      </li>
                    </ul>
                  </>
                ) : (
                  <>
                    <div className="profile-welcome">
                      <h4>Welcome to Myntra Pro</h4>
                      <p>Sign in to unlock personalized wishlist & luxury offers</p>
                      <Link to="/login" className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: 10 }}>
                        LOGIN / SIGNUP
                      </Link>
                    </div>
                    <ul className="profile-links">
                      <li>
                        <Link to="/login">
                          <Package size={16} /> Orders
                        </Link>
                      </li>
                      <li>
                        <Link to="/login">
                          <Heart size={16} /> Wishlist
                        </Link>
                      </li>
                      <li>
                        <Link to="/categories">
                          <Tag size={16} /> 15 Fashion Categories
                        </Link>
                      </li>
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* Wishlist Link */}
            <Link to="/wishlist" className="nav-action-btn" aria-label="Wishlist">
              <Heart size={20} />
              {wishlistCount > 0 && <span className="nav-badge-count">{wishlistCount}</span>}
              <span>Wishlist</span>
            </Link>

            {/* Cart Link */}
            <Link to="/cart" className="nav-action-btn" aria-label="Shopping Bag">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="nav-badge-count">{cartCount}</span>}
              <span>Bag</span>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              top: 80,
              backgroundColor: '#ffffff',
              zIndex: 999,
              overflowY: 'auto',
              padding: '20px 24px 80px 24px',
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <form onSubmit={handleSearchSubmit} className="search-box" style={{ display: 'flex' }}>
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            <div className="mobile-categories-section">
              <div className="mobile-categories-header">
                <LayoutGrid size={16} color="var(--primary)" />
                <span>Shop by Category (11 Departments)</span>
              </div>
              <div className="mobile-categories-grid">
                {ALL_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = cat.slug
                    ? currentCategory === cat.slug
                    : location.pathname === '/products' && !currentCategory;

                  return (
                    <Link
                      key={cat.id}
                      to={cat.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`mobile-category-pill ${isActive ? 'active' : ''}`}
                      style={{ borderColor: isActive ? 'var(--primary)' : cat.border }}
                    >
                      <div
                        className="mobile-category-icon"
                        style={{ backgroundColor: cat.bg, color: cat.color }}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="mobile-category-text">
                        <span className="mobile-category-name">{cat.name}</span>
                        <span className="mobile-category-count">{cat.count}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
              {isAuthenticated ? (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Signed in as {user?.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 16 }}>{user?.email}</div>
                  <Link to="/orders" className="btn btn-outline btn-sm" style={{ width: '100%', marginBottom: 8 }}>
                    My Orders
                  </Link>
                  <button onClick={logout} className="btn btn-outline btn-sm" style={{ width: '100%', color: 'var(--danger)' }}>
                    Logout
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <Link to="/login" className="btn btn-primary" style={{ flex: 1 }}>
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-outline" style={{ flex: 1 }}>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* AI Concierge Chatbot Modal */}
      <AIChatModal isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </>
  );
};
