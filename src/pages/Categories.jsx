import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { Loader } from '../components/Loader';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    productService
      .getCategories()
      .then((data) => {
        if (isMounted) {
          setCategories(data || []);
        }
      })
      .catch((err) => {
        console.error('Categories error:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px' }}>
        <Loader size="large" text="Loading Fashion Departments..." />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      <Breadcrumbs items={[{ label: 'All Categories' }]} />

      <div style={{ textAlign: 'center', margin: '20px 0 40px 0' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
          Explore Curated Departments
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1rem', maxWidth: '640px', margin: '8px auto 0 auto' }}>
          Discover hand-curated fashion, footwear, beauty and luxury lifestyle collections with verified stock and fast express shipping.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '28px',
        }}
      >
        {categories.map((cat, idx) => (
          <div
            key={cat.id || idx}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-card)';
            }}
          >
            {/* Category Banner / Image */}
            <div
              style={{
                position: 'relative',
                height: 180,
                backgroundColor: '#f5f5f6',
                overflow: 'hidden',
              }}
            >
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800'}
                alt={cat.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '16px 20px',
                }}
              >
                <div>
                  <span
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 3,
                      textTransform: 'uppercase',
                    }}
                  >
                    Category #{idx + 1}
                  </span>
                  <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, marginTop: 4 }}>
                    {cat.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Subcategories & Details */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--success)' }}>
                  <CheckCircle2 size={14} style={{ display: 'inline', marginRight: 4 }} />
                  {cat.itemCountText || `${cat.productCount || 52}+ Styles Available`}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                  ID: {cat.id}
                </span>
              </div>

              {/* Subcategories list */}
              {cat.subCategories?.length > 0 && (
                <div style={{ marginBottom: 16, flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
                    Popular Subcategories
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {cat.subCategories.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/products?category=${cat.id}&subCategory=${sub.id}`}
                        style={{
                          backgroundColor: 'var(--bg-subtle)',
                          color: 'var(--dark)',
                          fontSize: '0.78rem',
                          fontWeight: 500,
                          padding: '3px 8px',
                          borderRadius: 4,
                          border: '1px solid var(--border-light)',
                        }}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <Link
                to={`/products?category=${cat.id}`}
                className="btn btn-outline-primary"
                style={{ width: '100%', marginTop: 'auto', gap: 6 }}
              >
                Browse {cat.name} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
