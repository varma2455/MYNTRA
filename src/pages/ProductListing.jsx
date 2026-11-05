import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { productService } from '../services/productService';
import { ProductGrid } from '../components/ProductGrid';
import { Filters } from '../components/Filters';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ArrowUpDown, X, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'newest', label: 'What’s New' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Customer Rating' },
];

export const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { slug } = useParams();

  // Extract query filters from URL
  const queryCategory = searchParams.get('category') || '';
  const category = queryCategory || slug || '';
  const subCategory = searchParams.get('subCategory') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minDiscount = searchParams.get('minDiscount') || '';
  const minRating = searchParams.get('minRating') || '';
  const sizes = searchParams.get('sizes') || '';
  const q = searchParams.get('q') || '';
  const sortBy = searchParams.get('sortBy') || 'popularity';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [productsData, setProductsData] = useState({
    products: [],
    totalCount: 0,
    totalPages: 1,
    page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);

  // Fetch all categories for filter sidebar & title resolution
  useEffect(() => {
    productService
      .getCategories()
      .then((cats) => setCategories(cats || []))
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  // Fetch products based on search params
  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = {
      page,
      limit: 20,
      sortBy,
    };
    if (category) params.category = category;
    if (subCategory) params.subCategory = subCategory;
    if (brand) params.brand = brand;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minDiscount) params.minDiscount = minDiscount;
    if (minRating) params.minRating = minRating;
    if (sizes) params.sizes = sizes;
    if (q) params.q = q;

    productService
      .getProducts(params)
      .then((res) => {
        setProductsData({
          products: res.products || [],
          totalCount: res.totalCount || 0,
          totalPages: res.totalPages || 1,
          page: res.page || 1,
        });

        // Extract available unique brands for filter sidebar
        if (res.products?.length > 0) {
          const brandsSet = new Set();
          res.products.forEach((p) => {
            if (p.brand) brandsSet.add(p.brand);
          });
          setAvailableBrands((prev) => {
            const combined = new Set([...prev, ...brandsSet]);
            return Array.from(combined).sort();
          });
        }
      })
      .catch((err) => {
        console.error('Failed to fetch products:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load products');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category, subCategory, brand, minPrice, maxPrice, minDiscount, minRating, sizes, q, sortBy, page]);

  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchProducts]);

  // Update a single filter in the URL query string
  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // reset to page 1 on filter change
    setSearchParams(newParams);
  };

  // Clear all filters
  const clearAllFilters = () => {
    const newParams = new URLSearchParams();
    if (category) newParams.set('category', category);
    setSearchParams(newParams);
  };

  // Change page
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > productsData.totalPages) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  // Format active category name
  const currentCategoryObj = categories.find(
    (c) => c.id === category || c.slug === category
  );
  const pageTitle = currentCategoryObj
    ? currentCategoryObj.name
    : q
    ? `Search Results for "${q}"`
    : 'All Fashion Products';

  const breadcrumbItems = [
    ...(category
      ? [
          { label: 'Categories', href: '/categories' },
          { label: currentCategoryObj ? currentCategoryObj.name : category },
        ]
      : q
      ? [{ label: `Search: "${q}"` }]
      : [{ label: 'Products' }]),
  ];

  // Active filter tags
  const activeFilters = [];
  if (brand) {
    brand.split(',').forEach((b) => {
      activeFilters.push({
        label: b.trim(),
        remove: () => {
          const remaining = brand.split(',').filter((x) => x.trim() !== b.trim()).join(',');
          updateFilter('brand', remaining);
        },
      });
    });
  }
  if (minPrice || maxPrice) {
    activeFilters.push({
      label: `₹${minPrice || '0'} - ₹${maxPrice || 'Above'}`,
      remove: () => {
        updateFilter('minPrice', '');
        updateFilter('maxPrice', '');
      },
    });
  }
  if (minDiscount) {
    activeFilters.push({
      label: `${minDiscount}%+ Off`,
      remove: () => updateFilter('minDiscount', ''),
    });
  }
  if (minRating) {
    activeFilters.push({
      label: `${minRating}★ & Above`,
      remove: () => updateFilter('minRating', ''),
    });
  }
  if (sizes) {
    sizes.split(',').forEach((s) => {
      activeFilters.push({
        label: `Size: ${s.trim()}`,
        remove: () => {
          const remaining = sizes.split(',').filter((x) => x.trim() !== s.trim()).join(',');
          updateFilter('sizes', remaining);
        },
      });
    });
  }

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      <Breadcrumbs items={breadcrumbItems} />

      {/* Top Banner / Heading & Sort Dropdown */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          padding: '12px 0 20px 0',
          borderBottom: '1px solid var(--border)',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'capitalize' }}>
            {pageTitle}
          </h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            Showing {productsData.products.length} of {productsData.totalCount} items
          </span>
        </div>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Sort by:</span>
          <div
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '6px 12px',
              backgroundColor: '#ffffff',
            }}
          >
            <select
              value={sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                paddingRight: '16px',
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown size={14} color="var(--muted)" style={{ pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>Active Filters:</span>
          {activeFilters.map((af, i) => (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: 600,
              }}
            >
              {af.label}
              <button
                type="button"
                onClick={af.remove}
                style={{ display: 'flex', alignItems: 'center', color: 'var(--muted)' }}
                aria-label={`Remove filter ${af.label}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAllFilters}
            style={{
              fontSize: '0.78rem',
              color: 'var(--primary)',
              fontWeight: 700,
              marginLeft: 8,
              textDecoration: 'underline',
            }}
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Content: Filter Sidebar + Products Grid */}
      <div style={{ display: 'flex', gap: '32px' }}>
        <Filters
          filters={{
            category,
            brand,
            minPrice,
            maxPrice,
            minDiscount,
            minRating,
            sizes,
          }}
          onChange={updateFilter}
          onClear={clearAllFilters}
          availableBrands={availableBrands}
          categories={categories}
          totalCount={productsData.totalCount}
        />

        <div style={{ flex: 1 }}>
          {error ? (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}>
                <AlertCircle size={40} />
              </div>
              <h3>Unable to Load Products</h3>
              <p>{error}</p>
              <button type="button" className="btn btn-primary" onClick={fetchProducts}>
                <RefreshCw size={16} /> Retry
              </button>
            </div>
          ) : (
            <>
              <ProductGrid
                products={productsData.products}
                loading={loading}
                onResetFilters={clearAllFilters}
                skeletonCount={8}
              />

              {/* Pagination Controls */}
              {productsData.totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 48,
                    paddingTop: 24,
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                    style={{ opacity: page <= 1 ? 0.4 : 1 }}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>

                  <span style={{ fontSize: '0.88rem', fontWeight: 600, padding: '0 12px' }}>
                    Page {page} of {productsData.totalPages}
                  </span>

                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={page >= productsData.totalPages}
                    onClick={() => handlePageChange(page + 1)}
                    style={{ opacity: page >= productsData.totalPages ? 0.4 : 1 }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
