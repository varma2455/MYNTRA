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
  Boxes
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import { useDebounce } from '../hooks/useDebounce';

const CATEGORIES_MENU = [
  {
    id: 'men',
    name: 'Men',
    href: '/products?category=mens-clothing',
    subsections: [
      {
        title: 'Topwear',
        items: [
          { name: 'All Clothing', href: '/products?category=mens-clothing' },
          { name: 'Casual Shirts', href: '/products?category=mens-clothing&subCategory=men-shirts' },
          { name: 'Graphic T-Shirts', href: '/products?category=mens-clothing&subCategory=men-tshirts' },
          { name: 'Jackets & Blazers', href: '/products?category=mens-clothing&subCategory=men-jackets' },
        ],
      },
      {
        title: 'Bottomwear & Active',
        items: [
          { name: 'Jeans & Denims', href: '/products?category=mens-clothing&subCategory=men-jeans' },
          { name: 'Sportswear & Activewear', href: '/products?category=sportswear-activewear' },
        ],
      },
      {
        title: 'Footwear',
        items: [
          { name: "Men's Footwear", href: '/products?category=mens-footwear' },
          { name: 'Sneakers & Casuals', href: '/products?category=mens-footwear' },
          { name: 'Formal Shoes', href: '/products?category=mens-footwear' },
        ],
      },
      {
        title: 'Accessories',
        items: [
          { name: 'Watches & Wearables', href: '/products?category=watches-wearables' },
          { name: 'Bags & Backpacks', href: '/products?category=bags-backpacks' },
        ],
      },
    ],
  },
  {
    id: 'women',
    name: 'Women',
    href: '/products?category=womens-clothing',
    subsections: [
      {
        title: 'Western Wear',
        items: [
          { name: "Women's Clothing", href: '/products?category=womens-clothing' },
          { name: 'Dresses & Jumpsuits', href: '/products?category=womens-clothing' },
          { name: 'Tops & Shirts', href: '/products?category=womens-clothing' },
        ],
      },
      {
        title: 'Ethnic & Traditional',
        items: [
          { name: 'Ethnic & Traditional Wear', href: '/products?category=ethnic-traditional-wear' },
          { name: 'Kurtas & Kurtis', href: '/products?category=ethnic-traditional-wear' },
          { name: 'Sarees & Lehengas', href: '/products?category=ethnic-traditional-wear' },
        ],
      },
      {
        title: 'Footwear & Sleepwear',
        items: [
          { name: "Women's Footwear", href: '/products?category=womens-footwear' },
          { name: 'Heels & Flats', href: '/products?category=womens-footwear' },
          { name: 'Lingerie & Sleepwear', href: '/products?category=lingerie-sleepwear' },
        ],
      },
      {
        title: 'Beauty & Jewellery',
        items: [
          { name: 'Jewellery', href: '/products?category=jewellery' },
          { name: 'Beauty & Makeup', href: '/products?category=beauty-makeup' },
          { name: 'Skincare & Personal Care', href: '/products?category=skincare-personal-care' },
        ],
      },
    ],
  },
  {
    id: 'kids',
    name: 'Kids',
    href: '/products?category=kids-clothing',
    subsections: [
      {
        title: 'Boys Clothing',
        items: [
          { name: "Kids' Clothing", href: '/products?category=kids-clothing' },
          { name: 'T-Shirts & Shirts', href: '/products?category=kids-clothing' },
          { name: 'Shorts & Jeans', href: '/products?category=kids-clothing' },
        ],
      },
      {
        title: 'Girls Clothing',
        items: [
          { name: 'Dresses & Frocks', href: '/products?category=kids-clothing' },
          { name: 'Tops & Skirts', href: '/products?category=kids-clothing' },
        ],
      },
      {
        title: 'Kids Footwear',
        items: [
          { name: "Kids' Footwear", href: '/products?category=kids-footwear' },
          { name: 'School Shoes', href: '/products?category=kids-footwear' },
          { name: 'Sandals & Slides', href: '/products?category=kids-footwear' },
        ],
      },
      {
        title: 'Bags & Accessories',
        items: [
          { name: 'School Backpacks', href: '/products?category=bags-backpacks' },
          { name: 'Kids Watches', href: '/products?category=watches-wearables' },
        ],
      },
    ],
  },
  {
    id: 'beauty',
    name: 'Beauty & Care',
    href: '/products?category=beauty-makeup',
    subsections: [
      {
        title: 'Makeup Essentials',
        items: [
          { name: 'Beauty & Makeup', href: '/products?category=beauty-makeup' },
          { name: 'Lipsticks & Glosses', href: '/products?category=beauty-makeup' },
          { name: 'Eye Makeup', href: '/products?category=beauty-makeup' },
          { name: 'Foundations & Compact', href: '/products?category=beauty-makeup' },
        ],
      },
      {
        title: 'Skincare & Glow',
        items: [
          { name: 'Skincare & Personal Care', href: '/products?category=skincare-personal-care' },
          { name: 'Face Serums & Creams', href: '/products?category=skincare-personal-care' },
          { name: 'Sunscreen & Cleansers', href: '/products?category=skincare-personal-care' },
        ],
      },
      {
        title: 'Wellness & Traditional',
        items: [
          { name: 'Body Care & Lotions', href: '/products?category=skincare-personal-care' },
          { name: 'Hair Care & Oils', href: '/products?category=skincare-personal-care' },
        ],
      },
      {
        title: 'Top Beauty Brands',
        items: [
          { name: 'Maybelline', href: '/products?category=beauty-makeup&brand=Maybelline' },
          { name: "L'Oreal Paris", href: '/products?category=beauty-makeup' },
          { name: 'Mamaearth', href: '/products?category=skincare-personal-care' },
        ],
      },
    ],
  },
  {
    id: 'home-living',
    name: 'Home & Living',
    href: '/products?category=home-living',
    subsections: [
      {
        title: 'Bed Linen & Furnishing',
        items: [
          { name: 'Home & Living', href: '/products?category=home-living' },
          { name: 'Bedsheets & Covers', href: '/products?category=home-living' },
          { name: 'Curtains & Drapes', href: '/products?category=home-living' },
        ],
      },
      {
        title: 'Decor & Lighting',
        items: [
          { name: 'Wall Art & Clocks', href: '/products?category=home-living' },
          { name: 'Lamps & Ambient Lights', href: '/products?category=home-living' },
        ],
      },
      {
        title: 'Kitchen & Dining',
        items: [
          { name: 'Dinnerware & Crockery', href: '/products?category=home-living' },
          { name: 'Cookware & Storage', href: '/products?category=home-living' },
        ],
      },
      {
        title: 'Bath & Fragrance',
        items: [
          { name: 'Towels & Bath Mats', href: '/products?category=home-living' },
          { name: 'Aroma Diffusers', href: '/products?category=home-living' },
        ],
      },
    ],
  },
  {
    id: 'more',
    name: 'More Categories',
    href: '/categories',
    subsections: [
      {
        title: 'All 15 Categories',
        items: [
          { name: 'Watches & Wearables', href: '/products?category=watches-wearables' },
          { name: 'Bags & Backpacks', href: '/products?category=bags-backpacks' },
          { name: 'Jewellery', href: '/products?category=jewellery' },
          { name: 'Sportswear & Activewear', href: '/products?category=sportswear-activewear' },
        ],
      },
      {
        title: 'Specialty Sections',
        items: [
          { name: 'Ethnic & Traditional', href: '/products?category=ethnic-traditional-wear' },
          { name: 'Lingerie & Sleepwear', href: '/products?category=lingerie-sleepwear' },
          { name: "Kids' Footwear", href: '/products?category=kids-footwear' },
          { name: 'Explore All Categories', href: '/categories' },
        ],
      },
      {
        title: 'Discounts & Deals',
        items: [
          { name: 'Deals of the Day (Min 40% Off)', href: '/products?minDiscount=40' },
          { name: 'Budget Corner (Under ₹999)', href: '/products?maxPrice=999' },
          { name: 'Trending Styles', href: '/products?sortBy=popularity' },
        ],
      },
      {
        title: 'Internal Portals',
        items: [
          { name: 'Admin Dashboard', href: '/admin' },
          { name: 'Transport Logistics', href: '/transport' },
          { name: 'Delivery Staff Tasks', href: '/delivery' },
        ],
      },
    ],
  },
];

export const Navbar = () => {
  const { user, isAuthenticated, logout, isSuperAdmin, isCompanyStaff, isTransportManager, isDeliveryStaff } = useAuth();
  const { wishlistCount } = useWishlist();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const searchRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowSuggestions(false);
  }, [location.pathname, location.search]);

  // Click outside listener for search suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        <span>🎉 THE FASHION CARNIVAL IS LIVE | FLAT 50-80% OFF</span>
        <span>•</span>
        <span>FREE DELIVERY ON ORDERS ABOVE ₹1199</span>
        <span>•</span>
        <span>Use Coupon <strong>FIRST100</strong> for ₹100 Off!</span>
      </div>

      <header className="navbar">
        <div className="container navbar-container">
          {/* Mobile Hamburger Toggle */}
          <button
            className="mobile-nav-toggle btn-icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Left: Brand Logo & Mega Menus */}
          <div className="navbar-left">
            <Link to="/" className="navbar-logo">
              <svg className="logo-icon-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="20" fill="#FF3F6C" />
                <path d="M22 75V25L42 55L50 43L58 55L78 25V75H64V46L53.5 62H46.5L36 46V75H22Z" fill="white" />
              </svg>
              <div className="logo-text">
                <span className="logo-main">MYNTRA</span>
                <span className="logo-sub">PRO LUXE</span>
              </div>
            </Link>

            {/* Desktop Mega Menu Navigation */}
            <nav className="nav-menu">
              {CATEGORIES_MENU.map((cat) => (
                <div key={cat.id} className="nav-item">
                  <Link to={cat.href} className="nav-link">
                    {cat.name}
                  </Link>

                  <div className="mega-menu">
                    {cat.subsections.map((sub, idx) => (
                      <div key={idx} className="mega-column">
                        <h4>{sub.title}</h4>
                        <ul>
                          {sub.items.map((item, i) => (
                            <li key={i}>
                              <Link to={item.href}>{item.name}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Center: Live Product Search Bar */}
          <div className="navbar-center" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search for products, brands and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  aria-label="Clear search query"
                >
                  <X size={16} />
                </button>
              )}
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions-dropdown">
                {suggestions.map((p) => (
                  <div
                    key={p._id || p.id}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(p)}
                  >
                    <img src={p.images?.[0] || 'https://via.placeholder.com/80'} alt={p.name} />
                    <div className="suggestion-info">
                      <div className="suggestion-name">{p.name}</div>
                      <div className="suggestion-sub">
                        <span style={{ fontWeight: 600, color: 'var(--dark)' }}>{p.brand}</span> • ₹{p.sellingPrice}
                        {p.discountPercentage > 0 && (
                          <span style={{ color: 'var(--primary)', marginLeft: 6, fontWeight: 700 }}>
                            ({p.discountPercentage}% OFF)
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight size={14} color="var(--light-muted)" />
                  </div>
                ))}
                <div
                  className="suggestion-item"
                  style={{ background: 'var(--bg-subtle)', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}
                  onClick={handleSearchSubmit}
                >
                  View all results for "{searchQuery}"
                </div>
              </div>
            )}
          </div>

          {/* Right: Profile, Wishlist, Cart Actions */}
          <div className="navbar-right">
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
                      <p>To access wishlist and shopping bag</p>
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

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                Categories
              </h3>
              <ul style={{ listStyle: 'none' }}>
                {CATEGORIES_MENU.map((c) => (
                  <li key={c.id} style={{ marginBottom: 12 }}>
                    <Link
                      to={c.href}
                      style={{ fontSize: '1rem', fontWeight: 700, display: 'block', padding: '6px 0' }}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
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
    </>
  );
};
