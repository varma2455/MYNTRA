import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Loader } from '../components/Loader';

export const Wishlist = () => {
  const { items, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleMoveToBag = async (product) => {
    const size = product.sizes?.[0] || 'M';
    const color = product.colors?.[0] || { name: 'Standard', hex: '#000' };

    try {
      await addToCart({
        productId: product.id || product._id,
        selectedSize: size,
        selectedColor: color,
        quantity: 1,
        productName: product.name,
      });
      await removeFromWishlist(product.id || product._id);
    } catch {
      // handled
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container empty-state" style={{ padding: '80px 20px' }}>
        <div className="empty-state-icon">
          <Heart size={44} />
        </div>
        <h2>PLEASE LOG IN</h2>
        <p>Login to view your saved wishlist items.</p>
        <Link to="/login" className="btn btn-primary btn-lg">
          LOGIN NOW
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px' }}>
        <Loader size="large" text="Fetching your saved items..." />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="container empty-state" style={{ padding: '80px 20px' }}>
        <div className="empty-state-icon">
          <Heart size={44} />
        </div>
        <h2>YOUR WISHLIST IS EMPTY</h2>
        <p>Explore our fashion catalogue and tap the heart icon on items you love to save them here.</p>
        <Link to="/products" className="btn btn-primary btn-lg">
          START SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      <Breadcrumbs items={[{ label: 'My Wishlist' }]} />

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, margin: '16px 0 28px 0' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase' }}>
          My Wishlist
        </h1>
        <span style={{ fontSize: '1rem', color: 'var(--muted)' }}>
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="products-grid">
        {items.map((product) => {
          const productId = product.id || product._id;
          const image = product.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600';
          const isOutOfStock = product.inStock === false || (product.stockCount !== undefined && product.stockCount <= 0);

          return (
            <div
              key={productId}
              className="product-card"
              style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}
            >
              <div
                className="product-image-container"
                onClick={() => navigate(`/product/${productId}`)}
                style={{ cursor: 'pointer' }}
              >
                <img src={image} alt={product.name} loading="lazy" />

                <button
                  type="button"
                  className="product-wishlist-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWishlist(productId);
                  }}
                  title="Remove from wishlist"
                >
                  <Trash2 size={16} color="var(--danger)" />
                </button>
              </div>

              <div className="product-details">
                <h3 className="product-brand">{product.brand}</h3>
                <p className="product-name" title={product.name}>
                  {product.name}
                </p>

                <div className="product-price-row">
                  <span className="price-selling">₹{product.sellingPrice?.toLocaleString('en-IN')}</span>
                  {product.originalPrice > product.sellingPrice && (
                    <>
                      <span className="price-original">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                      <span className="price-discount">
                        ({product.discountPercentage || Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100)}% OFF)
                      </span>
                    </>
                  )}
                </div>

                <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-light)' }}>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    style={{ width: '100%', gap: 6 }}
                    disabled={isOutOfStock}
                    onClick={() => handleMoveToBag(product)}
                  >
                    <ShoppingBag size={14} />
                    {isOutOfStock ? 'OUT OF STOCK' : 'MOVE TO BAG'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
