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
  Clock
} from 'lucide-react';
import { productService } from '../services/productService';
import { ProductCard } from '../components/ProductCard';
import { Loader } from '../components/Loader';

export const Home = () => {
  const navigate = useNavigate();
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    productService
      .getHomeFeed()
      .then((data) => {
        if (isMounted) {
          setHomeData(data);
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

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', minHeight: '60vh' }}>
        <Loader size="large" text="Curating the latest fashion trends..." />
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

      {/* 2. Shop By 15 Categories Strip */}
      <section className="container" style={{ marginTop: '16px', marginBottom: '40px' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">15 curated fashion & lifestyle departments</p>
          </div>
          <Link to="/categories" className="section-view-all">
            View All 15 Categories →
          </Link>
        </div>

        <div className="category-strip">
          {(homeData?.categories || []).map((cat) => (
            <div
              key={cat.id}
              className="category-circle-card"
              onClick={() => navigate(`/products?category=${cat.id}`)}
            >
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=300'}
                alt={cat.name}
                className="category-circle-img"
                loading="lazy"
              />
              <span className="category-circle-name">{cat.name}</span>
              <span className="category-circle-count">{cat.itemCountText || '50+ Styles'}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Promotional Strip / Coupons */}
      <section className="container" style={{ marginBottom: '48px' }}>
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
                FLAT ₹100 OFF ON YOUR FIRST APPAREL ORDER
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--secondary)' }}>
                Apply coupon code <strong style={{ color: 'var(--primary)' }}>FIRST100</strong> during checkout. Minimum cart value ₹799.
              </p>
            </div>
          </div>
          <Link to="/products" className="btn btn-primary btn-sm">
            SHOP NOW
          </Link>
        </div>
      </section>

      {/* 4. Deals of the Day */}
      {homeData?.dealsOfTheDay?.length > 0 && (
        <section className="container" style={{ marginBottom: '56px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Flame color="#ff5722" /> Deals of the Day
              </h2>
              <p className="section-subtitle">Unbeatable discounts up to 70% off for 24 hours only</p>
            </div>
            <Link to="/products?minDiscount=40" className="section-view-all">
              View All Deals →
            </Link>
          </div>

          <div className="products-grid">
            {homeData.dealsOfTheDay.slice(0, 4).map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Trending Fashion Brands */}
      {homeData?.trendingBrands?.length > 0 && (
        <section className="container" style={{ marginBottom: '56px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp color="var(--primary)" /> Top Trending Brands
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
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: 16,
                    color: '#fff',
                  }}
                >
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{brand.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#ff905a', fontWeight: 700 }}>{brand.discount}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Bestsellers */}
      {homeData?.bestsellers?.length > 0 && (
        <section className="container" style={{ marginBottom: '56px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award color="#03a685" /> Bestsellers of the Season
              </h2>
              <p className="section-subtitle">Most-loved items by over 50,000 satisfied shoppers</p>
            </div>
            <Link to="/products?sortBy=popularity" className="section-view-all">
              See All Bestsellers →
            </Link>
          </div>

          <div className="products-grid">
            {homeData.bestsellers.slice(0, 4).map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 7. New Arrivals */}
      {homeData?.newArrivals?.length > 0 && (
        <section className="container" style={{ marginBottom: '56px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles color="var(--primary)" /> Fresh Off the Runway: New Arrivals
              </h2>
              <p className="section-subtitle">Newest drops updated daily from international studios</p>
            </div>
            <Link to="/products?sortBy=newest" className="section-view-all">
              View All New Arrivals →
            </Link>
          </div>

          <div className="products-grid">
            {homeData.newArrivals.slice(0, 4).map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 8. Curated Fashion Picks */}
      {homeData?.curatedPicks?.length > 0 && (
        <section className="container" style={{ marginBottom: '32px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">Editor's Curated Picks</h2>
              <p className="section-subtitle">Hand-selected statement pieces tailored for you</p>
            </div>
            <Link to="/products" className="section-view-all">
              Explore Full Collection ({homeData.curatedPicks.length}+) →
            </Link>
          </div>

          <div className="products-grid">
            {homeData.curatedPicks.slice(0, 8).map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
