import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  MapPin,
  Tag,
  AlertCircle,
  Share2
} from 'lucide-react';
import { productService } from '../services/productService';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader } from '../components/Loader';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProductCard } from '../components/ProductCard';

export const ProductDetails = () => {
  const { id, productId } = useParams();
  const effectiveId = productId || id;
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { success, error, info } = useToast();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Delivery pincode check
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // User review form
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    productService
      .getProductById(effectiveId)
      .then((data) => {
        if (!isMounted) return;
        setProduct(data);
        if (data?.sizes?.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        if (data?.colors?.length > 0) {
          setSelectedColor(data.colors[0]);
        }

        // Fetch similar products in same category
        if (data?.category) {
          productService
            .getProducts({ category: data.category, limit: 5 })
            .then((sim) => {
              if (isMounted && sim?.products) {
                const filtered = sim.products.filter(
                  (p) => (p.id || p._id) !== (data.id || data._id)
                );
                setSimilarProducts(filtered.slice(0, 4));
              }
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        console.error('Failed to load product details:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pincode.trim())) {
      setPincodeStatus({
        valid: true,
        text: `Standard Delivery by ${new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })} | Pay on Delivery available`,
      });
    } else {
      setPincodeStatus({
        valid: false,
        text: 'Please enter a valid 6-digit Indian postal pincode.',
      });
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!selectedSize) {
      error('Please select a size before adding to bag');
      return;
    }

    setIsAdding(true);
    try {
      const res = await addToCart({
        productId: product.id || product._id,
        selectedSize,
        selectedColor: selectedColor || { name: 'Standard', hex: '#000000' },
        quantity,
        productName: product.name,
      });
      if (res?.requiresAuth) {
        navigate('/login');
      }
    } catch {
      // toast shown in context
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    toggleWishlist(product);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      info('Please log in to submit a rating & review');
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      await productService.addReview(product.id || product._id, {
        rating: Number(ratingInput),
        comment: commentInput,
      });
      success('Thank you! Your verified review has been submitted.');
      setCommentInput('');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', minHeight: '60vh' }}>
        <Loader size="large" text="Loading product specifications..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container empty-state">
        <div className="empty-state-icon" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}>
          <AlertCircle size={40} />
        </div>
        <h3>Product Not Found</h3>
        <p>The product you are looking for is unavailable or has been discontinued.</p>
        <Link to="/products" className="btn btn-primary">
          Browse All Products
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product);
  const isOutOfStock = product.inStock === false || (product.stockCount !== undefined && product.stockCount <= 0);
  const images = product.images?.length > 0 ? product.images : ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800'];

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      <Breadcrumbs
        items={[
          { label: 'Products', href: '/products' },
          { label: product.categoryName || product.category, href: `/products?category=${product.category}` },
          { label: product.name },
        ]}
      />

      {/* Main Details Grid: Left Image Gallery, Right Product Info */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          marginTop: '16px',
        }}
      >
        {/* Left: Images */}
        <div>
          {/* Main Large Image */}
          <div
            style={{
              position: 'relative',
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: '#f7f7f8',
              aspectRatio: '3/4',
              marginBottom: 16,
            }}
          >
            <img
              src={images[activeImageIndex]}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {product.rating && (
              <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
                <span className="badge badge-rating" style={{ fontSize: '0.85rem', padding: '4px 10px' }}>
                  {product.rating.toFixed(1)} <Star size={14} className="star-icon" /> | {product.ratingCount || 120} Ratings
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails list */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    width: 72,
                    height: 96,
                    borderRadius: 4,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: `2px solid ${idx === activeImageIndex ? 'var(--primary)' : 'transparent'}`,
                    opacity: idx === activeImageIndex ? 1 : 0.7,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <img src={img} alt={`thumb-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Actions & Information */}
        <div>
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20 }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark)', textTransform: 'capitalize' }}>
              {product.brand}
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--muted)', marginTop: 4 }}>
              {product.name}
            </p>
          </div>

          {/* Pricing Row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark)' }}>
              ₹{product.sellingPrice?.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.sellingPrice && (
              <>
                <span style={{ fontSize: '1.1rem', color: 'var(--light-muted)', textDecoration: 'line-through' }}>
                  MRP ₹{product.originalPrice?.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ({product.discountPercentage || Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100)}% OFF)
                </span>
              </>
            )}
            <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 700, marginLeft: 6 }}>
              inclusive of all taxes
            </span>
          </div>

          {/* Stock Availability Badge */}
          <div style={{ marginBottom: 24 }}>
            {isOutOfStock ? (
              <span className="badge badge-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Currently Out of Stock
              </span>
            ) : product.stockCount !== undefined && product.stockCount < 10 ? (
              <span className="badge badge-warning" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Hurry! Only {product.stockCount} left in stock
              </span>
            ) : (
              <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <Check size={14} style={{ display: 'inline', marginRight: 4 }} /> In Stock & Ready to Ship
              </span>
            )}
          </div>

          {/* Color Selector */}
          {product.colors?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>
                Select Color: <span style={{ color: 'var(--muted)', textTransform: 'none' }}>{selectedColor?.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {product.colors.map((c, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: c.hex || '#000',
                      border: `2px solid ${selectedColor?.name === c.name ? 'var(--primary)' : 'var(--border)'}`,
                      padding: 2,
                      boxShadow: selectedColor?.name === c.name ? '0 0 0 2px var(--primary)' : 'none',
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes?.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Select Size
                </div>
                <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>
                  SIZE CHART
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {product.sizes.map((s) => {
                  const isSelected = selectedSize === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        backgroundColor: isSelected ? 'var(--primary-light)' : '#ffffff',
                        color: isSelected ? 'var(--primary)' : 'var(--dark)',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase' }}>Quantity:</span>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={{
                padding: '6px 12px',
                border: '1px solid var(--border)',
                borderRadius: 4,
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              {[1, 2, 3, 4, 5].map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons: Add to Bag & Wishlist */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 36 }}>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ flex: 2, gap: 10 }}
              onClick={handleAddToCart}
              disabled={isAdding || isOutOfStock}
            >
              <ShoppingBag size={20} />
              {isAdding ? 'ADDING TO BAG...' : isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}
            </button>

            <button
              type="button"
              className={`btn btn-outline btn-lg ${inWishlist ? 'btn-outline-primary' : ''}`}
              style={{ flex: 1, gap: 8 }}
              onClick={handleWishlistToggle}
            >
              <Heart size={20} fill={inWishlist ? 'var(--primary)' : 'none'} color={inWishlist ? 'var(--primary)' : 'currentColor'} />
              {inWishlist ? 'WISHLISTED' : 'WISHLIST'}
            </button>
          </div>

          {/* Delivery & Pincode Checker */}
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 8,
              border: '1px solid var(--border)',
              marginBottom: 32,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.95rem', marginBottom: 12 }}>
              <Truck size={18} /> DELIVERY OPTIONS
            </div>

            <form onSubmit={handlePincodeCheck} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                type="text"
                placeholder="Enter 6-digit pincode"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  backgroundColor: '#ffffff',
                }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Check
              </button>
            </form>

            {pincodeStatus && (
              <p
                style={{
                  fontSize: '0.85rem',
                  color: pincodeStatus.valid ? 'var(--success)' : 'var(--danger)',
                  fontWeight: 600,
                  marginTop: 6,
                }}
              >
                {pincodeStatus.text}
              </p>
            )}

            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 12, lineHeight: 1.6 }}>
              <div>• Free Express Delivery on orders above ₹1199</div>
              <div>• Cash on Delivery is available</div>
              <div>• Hassle-free 14-day return and exchange</div>
            </div>
          </div>

          {/* Product Description */}
          {product.description && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginBottom: 24 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
                Product Details
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', lineHeight: 1.7 }}>
                {product.description}
              </p>
            </div>
          )}

          {/* Specifications */}
          {product.details?.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginBottom: 24 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12 }}>
                Specifications
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px 24px',
                }}
              >
                {product.details.map((d, i) => (
                  <div key={i} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 6 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase' }}>
                      {d.label}
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--dark)' }}>
                      {d.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Reviews & Submit Form */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12 }}>
              Ratings & Customer Reviews
            </h4>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 6,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--dark)' }}>
                {product.rating?.toFixed(1) || '4.5'}
              </div>
              <div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={18}
                      fill={s <= Math.round(product.rating || 4.5) ? 'var(--success)' : '#ccc'}
                      color={s <= Math.round(product.rating || 4.5) ? 'var(--success)' : '#ccc'}
                    />
                  ))}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2 }}>
                  Based on {product.ratingCount || 150} verified buyer ratings
                </div>
              </div>
            </div>

            {/* Leave a review form */}
            <form onSubmit={handleReviewSubmit} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 16 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 8 }}>
                Write a Review
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Your Rating:</span>
                <select
                  value={ratingInput}
                  onChange={(e) => setRatingInput(e.target.value)}
                  style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)' }}
                >
                  <option value="5">5 ★★★★★ (Excellent)</option>
                  <option value="4">4 ★★★★☆ (Good)</option>
                  <option value="3">3 ★★★☆☆ (Average)</option>
                  <option value="2">2 ★★☆☆☆ (Poor)</option>
                  <option value="1">1 ★☆☆☆☆ (Terrible)</option>
                </select>
              </div>
              <textarea
                placeholder="Share your thoughts on the fit, fabric and quality..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                rows={3}
                className="form-control"
                style={{ marginBottom: 12 }}
              />
              <button
                type="submit"
                className="btn btn-outline-primary btn-sm"
                disabled={submittingReview}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Similar Products Recommendation Grid */}
      {similarProducts.length > 0 && (
        <section style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">Similar Styles You Might Love</h2>
              <p className="section-subtitle">More curated recommendations in {product.categoryName || product.category}</p>
            </div>
            <Link to={`/products?category=${product.category}`} className="section-view-all">
              View Category →
            </Link>
          </div>

          <div className="products-grid">
            {similarProducts.map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
