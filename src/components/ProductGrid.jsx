import React from 'react';
import { ProductCard } from './ProductCard';
import { ShoppingBag, RefreshCw } from 'lucide-react';

export const ProductGrid = ({ products = [], loading = false, onResetFilters, skeletonCount = 8 }) => {
  if (loading) {
    return (
      <div className="products-grid">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="product-card-skeleton">
            <div className="skeleton skeleton-img" />
            <div style={{ padding: '12px 8px' }}>
              <div className="skeleton skeleton-text" style={{ width: '60%' }} />
              <div className="skeleton skeleton-text" style={{ width: '90%' }} />
              <div className="skeleton skeleton-text" style={{ width: '40%', marginTop: 12 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <ShoppingBag size={40} />
        </div>
        <h3>No Products Found</h3>
        <p>We couldn't find any items matching your selected criteria. Try adjusting your filters or search terms.</p>
        {onResetFilters && (
          <button type="button" className="btn btn-outline-primary" onClick={onResetFilters}>
            <RefreshCw size={16} /> Reset All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map((product) => (
        <ProductCard key={product.id || product._id} product={product} />
      ))}
    </div>
  );
};
