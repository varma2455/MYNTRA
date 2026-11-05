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
  Share2,
  ZoomIn,
  Sparkles,
  Zap,
  Ruler,
  Plus
} from 'lucide-react';
import { productService } from '../services/productService';
import { aiService } from '../services/aiService';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader } from '../components/Loader';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProductCard } from '../components/ProductCard';
import { Modal } from '../components/Modal';

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
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [outfitData, setOutfitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // Modals
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);

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

    // Load recently viewed from localStorage
    try {
      const savedRecent = JSON.parse(localStorage.getItem('myntra_recently_viewed') || '[]');
      setRecentlyViewed(savedRecent.filter((p) => (p.id || p._id) !== effectiveId));
    } catch {
      setRecentlyViewed([]);
    }

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

        // Save to recently viewed in localStorage
        try {
          const currentRecent = JSON.parse(localStorage.getItem('myntra_recently_viewed') || '[]');
          const filtered = currentRecent.filter((p) => (p.id || p._id) !== (data.id || data._id));
          const updated = [
            {
              id: data.id || data._id,
              name: data.name,
              brand: data.brand,
              images: data.images,
              sellingPrice: data.sellingPrice,
              originalPrice: data.originalPrice,
              discountPercentage: data.discountPercentage,
              rating: data.rating,
              ratingCount: data.ratingCount,
              category: data.category,
            },
            ...filtered,
          ].slice(0, 10);
          localStorage.setItem('myntra_recently_viewed', JSON.stringify(updated));
        } catch {
          // ignore localStorage error
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

        // Fetch AI outfit recommendations
        aiService
          .getOutfitRecommendation(data._id || data.id)
          .then((res) => {
            if (isMounted) setOutfitData(res);
          })
          .catch(() => {});
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
  }, [effectiveId]);

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pincode.trim())) {
      setPincodeStatus({
        valid: true,
        text: `Standard Express Delivery by ${new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', {
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
    if (isOutOfStock) {
      error('Product is out of stock');
      return;
    }
    if (!selectedSize) {
      error('Please select a size');
      return;
    }

    if (!isAuthenticated) {
      info('Please log in to continue');
      navigate('/login', { state: { from: `/product/${effectiveId}` } });
      return;
    }

    setIsAdding(true);
    try {
      await addToCart({
        productId: product.id || product._id,
        selectedSize,
        selectedColor: selectedColor || product.colors?.[0] || { name: 'Standard', hex: '#000000' },
        quantity,
        productName: product.name,
      });
    } catch {
      // Meaningful error message is toasted inside CartContext
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (isOutOfStock) {
      error('Product is out of stock');
      return;
    }
    if (!selectedSize) {
      error('Please select a size');
      return;
    }

    if (!isAuthenticated) {
      info('Please log in to continue');
      navigate('/login', { state: { from: `/product/${effectiveId}` } });
      return;
    }

    setIsBuyingNow(true);
    try {
      await addToCart({
        productId: product.id || product._id,
        selectedSize,
        selectedColor: selectedColor || product.colors?.[0] || { name: 'Standard', hex: '#000000' },
        quantity,
        productName: product.name,
      });
      navigate('/checkout');
    } catch {
      // Meaningful error message is toasted inside CartContext
    } finally {
      setIsBuyingNow(false);
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
        <Loader size="large" text="Curating product specifications & imagery..." />
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '48px',
          marginTop: '16px',
        }}
      >
        {/* Left: Images & Zoom Preview */}
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
              cursor: 'zoom-in',
            }}
            onClick={() => setShowZoomModal(true)}
          >
            <img
              src={images[activeImageIndex]}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                padding: '6px 10px',
                borderRadius: 20,
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <ZoomIn size={14} /> Click to Zoom
            </div>

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
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--dark)' }}>
              ₹{product.sellingPrice?.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.sellingPrice && (
              <>
                <span style={{ fontSize: '1.15rem', color: 'var(--light-muted)', textDecoration: 'line-through' }}>
                  MRP ₹{product.originalPrice?.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ({product.discountPercentage || Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100)}% OFF)
                </span>
              </>
            )}
            <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 700, marginLeft: 6 }}>
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
                Hurry! Only {product.stockCount} units remaining
              </span>
            ) : (
              <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <Check size={14} style={{ display: 'inline', marginRight: 4 }} /> In Stock & Dispatches within 24 hrs
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
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      backgroundColor: c.hex || '#000',
                      border: `2px solid ${selectedColor?.name === c.name ? 'var(--primary)' : 'var(--border)'}`,
                      padding: 2,
                      boxShadow: selectedColor?.name === c.name ? '0 0 0 2px var(--primary)' : 'none',
                      cursor: 'pointer',
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selector with Size Guide Link */}
          {product.sizes?.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Select Size
                </div>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(true)}
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'none',
                    border: 'none',
                  }}
                >
                  <Ruler size={14} /> SIZE GUIDE
                </button>
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
                        cursor: 'pointer',
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
                padding: '6px 14px',
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

          {/* Action Buttons: Add to Bag, Buy Now, Wishlist */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 36, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ flex: 2, gap: 10, minWidth: 160 }}
              onClick={handleAddToCart}
              disabled={isAdding || isOutOfStock}
            >
              <ShoppingBag size={20} />
              {isAdding ? 'ADDING TO BAG...' : isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}
            </button>

            <button
              type="button"
              className="btn btn-dark btn-lg"
              style={{ flex: 2, gap: 8, minWidth: 160 }}
              onClick={handleBuyNow}
              disabled={isBuyingNow || isOutOfStock}
            >
              <Zap size={20} color="#ffbe3b" />
              {isBuyingNow ? 'PROCEEDING...' : 'BUY NOW'}
            </button>

            <button
              type="button"
              className={`btn btn-outline btn-lg ${inWishlist ? 'btn-outline-primary' : ''}`}
              style={{ flex: 1, gap: 8, minWidth: 120 }}
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
              <Truck size={18} /> DELIVERY OPTIONS & ESTIMATION
            </div>

            <form onSubmit={handlePincodeCheck} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                type="text"
                placeholder="Enter 6-digit Indian pincode"
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
              <div>• Cash on Delivery (COD) available with delivery OTP</div>
              <div>• 14-day hassle-free doorstep return & size exchange</div>
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
              Ratings & Verified Customer Reviews
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
                Write a Verified Review
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Your Rating:</span>
                <select
                  value={ratingInput}
                  onChange={(e) => setRatingInput(e.target.value)}
                  style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)' }}
                >
                  <option value="5">5 ★★★★★ (Exceptional Fit)</option>
                  <option value="4">4 ★★★★☆ (Good Quality)</option>
                  <option value="3">3 ★★★☆☆ (Average)</option>
                  <option value="2">2 ★★☆☆☆ (Below Expectation)</option>
                  <option value="1">1 ★☆☆☆☆ (Poor)</option>
                </select>
              </div>
              <textarea
                placeholder="Share your experience on fabric comfort, styling and fit..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px', borderRadius: 4, border: '1px solid var(--border)', marginBottom: 12 }}
              />
              <button
                type="submit"
                className="btn btn-outline-primary btn-sm"
                disabled={submittingReview}
              >
                {submittingReview ? 'Submitting...' : 'Submit Verified Review'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* AI Outfit Coordination & Complete the Look */}
      {outfitData?.outfitBundle?.length > 0 && (
        <section style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles color="var(--primary)" /> Complete The Look — AI Fashion Coordination
              </h2>
              <p className="section-subtitle">{outfitData.styleAdvice}</p>
            </div>
            <span className="badge badge-discount" style={{ fontSize: '0.9rem' }}>
              Bundle & Save 15%
            </span>
          </div>

          <div className="products-grid">
            {outfitData.outfitBundle.map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Similar Products Recommendation Grid */}
      {similarProducts.length > 0 && (
        <section style={{ marginTop: '56px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
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

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <section style={{ marginTop: '56px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">Recently Viewed by You</h2>
              <p className="section-subtitle">Picked up from your browsing journey</p>
            </div>
          </div>

          <div className="products-grid">
            {recentlyViewed.slice(0, 4).map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <Modal
          isOpen={showSizeGuide}
          onClose={() => setShowSizeGuide(false)}
          title="Standard Brand Size Measurement Guide"
        >
          <div style={{ padding: '8px 0' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: 16 }}>
              Measurements below are body measurements in inches and centimeters. Order your true size for standard regular fit.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '10px 12px' }}>Size</th>
                    <th style={{ padding: '10px 12px' }}>Chest / Bust</th>
                    <th style={{ padding: '10px 12px' }}>Waist</th>
                    <th style={{ padding: '10px 12px' }}>Hips</th>
                    <th style={{ padding: '10px 12px' }}>Length</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>XS</td>
                    <td style={{ padding: '10px 12px' }}>34 in (86 cm)</td>
                    <td style={{ padding: '10px 12px' }}>28 in (71 cm)</td>
                    <td style={{ padding: '10px 12px' }}>35 in (89 cm)</td>
                    <td style={{ padding: '10px 12px' }}>26 in (66 cm)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>S</td>
                    <td style={{ padding: '10px 12px' }}>38 in (96 cm)</td>
                    <td style={{ padding: '10px 12px' }}>30 in (76 cm)</td>
                    <td style={{ padding: '10px 12px' }}>38 in (96 cm)</td>
                    <td style={{ padding: '10px 12px' }}>27 in (69 cm)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: '#fff0f3' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--primary)' }}>M (Standard)</td>
                    <td style={{ padding: '10px 12px' }}>40 in (102 cm)</td>
                    <td style={{ padding: '10px 12px' }}>32 in (81 cm)</td>
                    <td style={{ padding: '10px 12px' }}>40 in (102 cm)</td>
                    <td style={{ padding: '10px 12px' }}>28 in (71 cm)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>L</td>
                    <td style={{ padding: '10px 12px' }}>42 in (107 cm)</td>
                    <td style={{ padding: '10px 12px' }}>34 in (86 cm)</td>
                    <td style={{ padding: '10px 12px' }}>42 in (107 cm)</td>
                    <td style={{ padding: '10px 12px' }}>29 in (74 cm)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>XL</td>
                    <td style={{ padding: '10px 12px' }}>44 in (112 cm)</td>
                    <td style={{ padding: '10px 12px' }}>36 in (91 cm)</td>
                    <td style={{ padding: '10px 12px' }}>44 in (112 cm)</td>
                    <td style={{ padding: '10px 12px' }}>30 in (76 cm)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>XXL</td>
                    <td style={{ padding: '10px 12px' }}>46 in (117 cm)</td>
                    <td style={{ padding: '10px 12px' }}>38 in (96 cm)</td>
                    <td style={{ padding: '10px 12px' }}>46 in (117 cm)</td>
                    <td style={{ padding: '10px 12px' }}>31 in (79 cm)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <button onClick={() => setShowSizeGuide(false)} className="btn btn-primary btn-sm">
                Got It
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* High-Resolution Image Zoom Modal */}
      {showZoomModal && (
        <Modal
          isOpen={showZoomModal}
          onClose={() => setShowZoomModal(false)}
          title={`${product.brand} — High Definition Fabric View`}
        >
          <div style={{ textAlign: 'center' }}>
            <img
              src={images[activeImageIndex]}
              alt={product.name}
              style={{
                maxWidth: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: 8,
                margin: '0 auto',
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
