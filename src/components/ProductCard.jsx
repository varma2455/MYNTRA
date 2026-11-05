import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  if (!product) return null;

  const inWishlist = isInWishlist(product);
  const productId = product.id || product._id;
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80&auto=format&fit=crop';
  const secondaryImage = product.images?.[1] || primaryImage;
  const isOutOfStock = product.inStock === false || (product.stockCount !== undefined && product.stockCount <= 0);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    const defaultSize = product.sizes?.[0] || 'M';
    const defaultColor = product.colors?.[0] || { name: 'Standard', hex: '#000' };

    setAddingToCart(true);
    try {
      await addToCart({
        productId,
        selectedSize: defaultSize,
        selectedColor: defaultColor,
        quantity: 1,
        productName: product.name,
      });
    } catch {
      // toast shown in context
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div
      className="product-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/product/${productId}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="product-image-container">
        <img
          src={hovered ? secondaryImage : primaryImage}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80&auto=format&fit=crop';
          }}
        />

        {/* Rating Overlay */}
        {product.rating && (
          <div className="product-rating-overlay">
            <span className="badge badge-rating">
              {product.rating.toFixed(1)} <Star size={11} className="star-icon" />
              {product.ratingCount ? ` | ${product.ratingCount > 999 ? `${(product.ratingCount / 1000).toFixed(1)}k` : product.ratingCount}` : ''}
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          className={`product-wishlist-btn ${inWishlist ? 'active' : ''}`}
          onClick={handleWishlistClick}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={18} fill={inWishlist ? 'var(--primary)' : 'none'} color={inWishlist ? 'var(--primary)' : 'currentColor'} />
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <span className="badge badge-danger" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Quick Add To Bag on Desktop Hover */}
        {hovered && !isOutOfStock && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 -2px 10px rgba(0,0,0,0.08)',
              zIndex: 3,
            }}
          >
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              style={{ width: '100%', gap: 6 }}
              onClick={handleQuickAdd}
              disabled={addingToCart}
            >
              <ShoppingBag size={14} />
              {addingToCart ? 'ADDING...' : 'ADD TO BAG'}
            </button>
          </div>
        )}
      </div>

      <div className="product-details">
        <h3 className="product-brand">{product.brand || 'Brand'}</h3>
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
      </div>
    </div>
  );
};
