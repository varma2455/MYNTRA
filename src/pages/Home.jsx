import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  TrendingUp,
  Award,
  Zap,
  ArrowRight,
  ShieldCheck,
  Percent,
  Clock,
  Mail,
  CheckCircle2,
  Gift
} from 'lucide-react';
import { productService } from '../services/productService';
import { aiService } from '../services/aiService';
import { ProductCard } from '../components/ProductCard';
import { Loader } from '../components/Loader';
import { useToast } from '../context/ToastContext';

export const Home = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [homeData, setHomeData] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [aiPicks, setAiPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Newsletter subscription
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Load recently viewed products
    try {
      const recent = JSON.parse(localStorage.getItem('myntra_recently_viewed') || '[]');
      if (isMounted) setRecentlyViewed(recent);
    } catch {
      // ignore
    }

    Promise.all([
      productService.getHomeFeed(),
      aiService.getPersonalizedRecommendations({ limit: 4 }).catch(() => null),
    ])
      .then(([feed, aiRes]) => {
        if (isMounted) {
          setHomeData(feed);
          if (aiRes?.products) {
            setAiPicks(aiRes.products);
          }
          setError(null);
        }
      })
      .catch((err) => {
        console.error('Home feed error:', err);
        if (isMounted) setError(err.message || 'Failed to load home feed');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto rotate hero carousel every 5s
  useEffect(() => {
    const banners = homeData?.heroBanners || [];
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [homeData?.heroBanners]);

  const heroBanners = homeData?.heroBanners || [];

  const handlePrevBanner = () => {
    setActiveBannerIndex((prev) => (prev === 0 ? heroBanners.length - 1 : prev - 1));
  };

  const handleNextBanner = () => {
    setActiveBannerIndex((prev) => (prev + 1) % heroBanners.length);
  };

  const handleNewsletterSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !/^\S+@\S+\.\S+$/.test(newsletterEmail)) {
      toastError('Please enter a valid email address');
      return;
    }

    setSubscribed(true);
    success('Welcome to the VIP Club! Use code VIP30 for 30% OFF.');
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', minHeight: '60vh' }}>
        <Loader size="large" text="Curating the latest runway trends & fashion collections..." />
      </div>
    );
  }

  if (error && !homeData) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h3>Unable to load home feed</h3>
        <p style={{ color: 'var(--muted)', marginTop: 8 }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
          style={{ marginTop: 16 }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* 1. Hero Carousel Banner */}
      <section className="container" style={{ marginTop: '24px' }}>
        {heroBanners.length > 0 && (
          <div className="hero-carousel">
            <div
              className="hero-slide"
              style={{
                backgroundImage: `url(${heroBanners[activeBannerIndex]?.image})`,
              }}
            >
              <div className="hero-slide-overlay" />
              <div className="hero-content">
                <span className="hero-badge">
                  <Zap size={13} style={{ display: 'inline', marginRight: 4 }} /> LIMITED TIME OFFER
                </span>
                <h1 className="hero-title">{heroBanners[activeBannerIndex]?.title}</h1>
                <p className="hero-subtitle">{heroBanners[activeBannerIndex]?.subtitle}</p>
                <Link
                  to={heroBanners[activeBannerIndex]?.link || '/products'}
                  className="btn btn-primary btn-lg"
                >
                  {heroBanners[activeBannerIndex]?.ctaText || 'EXPLORE NOW'}{' '}
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            {heroBanners.length > 1 && (
              <>
                <button
                  type="button"
                  className="carousel-nav-btn carousel-nav-prev"
                  onClick={handlePrevBanner}
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  className="carousel-nav-btn carousel-nav-next"
                  onClick={handleNextBanner}
                  aria-label="Next slide"
                >
                  <ChevronRight size={24} />
                </button>
                <div className="carousel-indicators">
                  {heroBanners.map((_, idx) => (
                    <div
                      key={idx}
                      className={`indicator-dot ${idx === activeBannerIndex ? 'active' : ''}`}
                      onClick={() => setActiveBannerIndex(idx)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* 1. Shop by Category */}
      <section className="container" style={{ marginTop: '16px', marginBottom: '48px' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Curated fashion & lifestyle departments</p>
          </div>
          <Link to="/products" className="section-view-all">
            Browse All Categories →
          </Link>
        </div>

        <div className="category-strip">
          {(homeData?.categories || []).map((cat) => (
            <div
              key={cat.id || cat.slug}
              className="category-circle-card"
              onClick={() => navigate(`/products?category=${cat.slug || cat.id}`)}
            >
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=300'}
                alt={cat.name}
                className="category-circle-img"
                loading="lazy"
              />
              <span className="category-circle-name">{cat.name}</span>
              <span className="category-circle-count">{cat.itemCountText || 'Curated'}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Trending Now */}
      {((homeData?.trendingNow && homeData.trendingNow.length > 0) || (homeData?.popularProducts && homeData.popularProducts.length > 0)) && (
        <section className="container" style={{ marginBottom: '56px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Flame color="#ff3f6c" /> Trending Now
              </h2>
              <p className="section-subtitle">Styles gaining viral momentum this week</p>
            </div>
            <Link to="/products?sortBy=popularity" className="section-view-all">
              View All Trending →
            </Link>
          </div>

          <div className="products-grid">
            {(homeData?.trendingNow?.length ? homeData.trendingNow : homeData.popularProducts).slice(0, 4).map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 3. New Arrivals */}
      {homeData?.newArrivals?.length > 0 && (
        <section className="container" style={{ marginBottom: '56px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles color="var(--primary)" /> New Arrivals
              </h2>
              <p className="section-subtitle">Fresh off the runway drops updated daily</p>
            </div>
            <Link to="/products?sortBy=newest" className="section-view-all">
              View All New Drops →
            </Link>
          </div>

          <div className="products-grid">
            {homeData.newArrivals.slice(0, 4).map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Best Sellers */}
      {homeData?.bestsellers?.length > 0 && (
        <section className="container" style={{ marginBottom: '56px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award color="#03a685" /> Best Sellers
              </h2>
              <p className="section-subtitle">Most coveted items loved by thousands of shoppers</p>
            </div>
            <Link to="/products?sortBy=rating" className="section-view-all">
              See All Best Sellers →
            </Link>
          </div>

          <div className="products-grid">
            {homeData.bestsellers.slice(0, 4).map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Top Brands */}
      {homeData?.trendingBrands?.length > 0 && (
        <section className="container" style={{ marginBottom: '56px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp color="var(--primary)" /> Top Brands
              </h2>
              <p className="section-subtitle">Coveted designer labels & streetwear favorites</p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 20,
            }}
          >
            {homeData.trendingBrands.map((brand, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/products?brand=${encodeURIComponent(brand.name)}`)}
                style={{
                  position: 'relative',
                  height: 240,
                  borderRadius: 8,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <img
                  src={brand.image}
                  alt={brand.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: 16,
                    color: '#fff',
                  }}
                >
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{brand.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#ff905a', fontWeight: 700 }}>{brand.discount || 'Min 30% OFF'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Recommended For You */}
      {(aiPicks.length > 0 || (homeData?.recommendedForYou && homeData.recommendedForYou.length > 0)) && (
        <section className="container" style={{ marginBottom: '56px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles color="var(--primary)" /> Recommended For You
              </h2>
              <p className="section-subtitle">Algorithmic curation tailored to your fashion preferences</p>
            </div>
            <Link to="/products" className="section-view-all">
              Explore More →
            </Link>
          </div>

          <div className="products-grid">
            {(aiPicks.length > 0 ? aiPicks : homeData.recommendedForYou).slice(0, 4).map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Premium Collections */}
      {homeData?.premiumCollections?.length > 0 && (
        <section className="container" style={{ marginBottom: '56px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award color="#b8860b" /> Premium Collections
              </h2>
              <p className="section-subtitle">High couture, precious atelier pieces & bespoke luxury</p>
            </div>
            <Link to="/products?category=premium-luxe" className="section-view-all">
              Discover Luxe →
            </Link>
          </div>

          <div className="products-grid">
            {homeData.premiumCollections.slice(0, 4).map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 8. Special Offers */}
      <section className="container" style={{ marginBottom: '56px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #fff0f3 0%, #ffe3e8 100%)',
            border: '1px dashed #ff3f6c',
            borderRadius: 8,
            padding: '20px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: '28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Percent size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dark)' }}>
                FLAT ₹100 OFF ON YOUR FIRST ORDER
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--secondary)' }}>
                Apply coupon code <strong style={{ color: 'var(--primary)' }}>FIRST100</strong> during checkout.
              </p>
            </div>
          </div>
          <Link to="/products?minDiscount=40" className="btn btn-primary btn-sm">
            GRAB DEALS
          </Link>
        </div>

        {homeData?.specialOffers?.length > 0 && (
          <>
            <div className="section-header">
              <div>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Flame color="#ff5722" /> Special Offers & Steals
                </h2>
                <p className="section-subtitle">Exclusive limited-time price drops up to 70% off</p>
              </div>
              <Link to="/products?minDiscount=50" className="section-view-all">
                View All Deals →
              </Link>
            </div>

            <div className="products-grid">
              {homeData.specialOffers.slice(0, 4).map((p) => (
                <ProductCard key={p.id || p._id} product={p} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* 9. Recently Viewed */}
      {recentlyViewed?.length > 0 && (
        <section className="container" style={{ marginBottom: '56px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock color="var(--primary)" /> Recently Viewed
              </h2>
              <p className="section-subtitle">Pick up right where you left off</p>
            </div>
          </div>

          <div className="products-grid">
            {recentlyViewed.slice(0, 4).map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 10. Popular Products */}
      {homeData?.popularProducts?.length > 0 && (
        <section className="container" style={{ marginBottom: '56px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap color="#ff9800" /> Popular Products
              </h2>
              <p className="section-subtitle">Top customer ratings and highest repeat purchases</p>
            </div>
            <Link to="/products?sortBy=rating" className="section-view-all">
              Browse Popular Picks →
            </Link>
          </div>

          <div className="products-grid">
            {homeData.popularProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 10. Newsletter Subscription Section */}
      <section className="container" style={{ marginBottom: '40px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #282c3f 0%, #1f2333 100%)',
            borderRadius: 12,
            padding: '48px 36px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'rgba(255, 63, 108, 0.2)',
              pointerEvents: 'none',
            }}
          />
          <Gift size={36} color="var(--primary)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
            Unlock VIP Fashion Privileges
          </h2>
          <p style={{ color: '#a0a5b8', maxWidth: 580, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
            Subscribe to the Myntra Pro Atelier newsletter to receive secret designer preview drops, private sale invitations, and an instant ₹100 discount coupon code.
          </p>

          {subscribed ? (
            <div
              style={{
                backgroundColor: 'rgba(3, 166, 133, 0.2)',
                border: '1px solid #03a685',
                padding: '12px 24px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: '#4ade80',
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={20} />
              <span>You're in the VIP Club! Use code VIP30 during checkout for your instant discount.</span>
            </div>
          ) : (
            <form
              onSubmit={handleNewsletterSubscribe}
              style={{
                display: 'flex',
                gap: 10,
                width: '100%',
                maxWidth: 480,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <input
                type="email"
                placeholder="Enter your email address..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 260,
                  padding: '12px 18px',
                  borderRadius: 6,
                  border: '1px solid #45495d',
                  backgroundColor: '#ffffff',
                  color: 'var(--dark)',
                  fontSize: '0.9rem',
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                CLAIM ₹100 COUPON
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
