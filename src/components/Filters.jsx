import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Search, RotateCcw } from 'lucide-react';

const PRICE_RANGES = [
  { label: 'Under ₹999', min: '', max: '999' },
  { label: '₹1,000 to ₹1,999', min: '1000', max: '1999' },
  { label: '₹2,000 to ₹4,999', min: '2000', max: '4999' },
  { label: '₹5,000 and Above', min: '5000', max: '' },
];

const DISCOUNT_RANGES = [
  { label: '10% and above', value: '10' },
  { label: '20% and above', value: '20' },
  { label: '30% and above', value: '30' },
  { label: '40% and above', value: '40' },
  { label: '50% and above', value: '50' },
];

const RATING_OPTIONS = [
  { label: '4★ & above', value: '4' },
  { label: '3★ & above', value: '3' },
  { label: '2★ & above', value: '2' },
];

const POPULAR_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'];

export const Filters = ({
  filters,
  onChange,
  onClear,
  availableBrands = [],
  categories = [],
  totalCount = 0,
}) => {
  const [brandSearch, setBrandSearch] = useState('');
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleBrandToggle = (brand) => {
    const currentBrands = filters.brand ? filters.brand.split(',').map((b) => b.trim()) : [];
    let updated;
    if (currentBrands.includes(brand)) {
      updated = currentBrands.filter((b) => b !== brand);
    } else {
      updated = [...currentBrands, brand];
    }
    onChange('brand', updated.join(','));
  };

  const handleSizeToggle = (size) => {
    const currentSizes = filters.sizes ? filters.sizes.split(',').map((s) => s.trim()) : [];
    let updated;
    if (currentSizes.includes(size)) {
      updated = currentSizes.filter((s) => s !== size);
    } else {
      updated = [...currentSizes, size];
    }
    onChange('sizes', updated.join(','));
  };

  const filteredBrands = availableBrands.filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase().trim())
  );

  const selectedBrands = filters.brand ? filters.brand.split(',').map((b) => b.trim()) : [];
  const selectedSizes = filters.sizes ? filters.sizes.split(',').map((s) => s.trim()) : [];

  const hasActiveFilters =
    filters.brand ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minDiscount ||
    filters.minRating ||
    filters.sizes;

  return (
    <aside
      style={{
        width: '280px',
        flexShrink: 0,
        borderRight: '1px solid var(--border)',
        paddingRight: '20px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border)',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={18} />
          <span style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase' }}>
            Filters
          </span>
          {totalCount > 0 && (
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
              ({totalCount})
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--primary)',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <RotateCcw size={12} /> Clear All
          </button>
        )}
      </div>

      {/* Brands Filter */}
      <div style={{ paddingBottom: '18px', borderBottom: '1px solid var(--border-light)', marginBottom: '18px' }}>
        <div
          onClick={() => toggleSection('brand')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase' }}>
            Brand ({availableBrands.length})
          </span>
          {collapsedSections.brand ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>

        {!collapsedSections.brand && (
          <div>
            {availableBrands.length > 6 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-subtle)',
                  borderRadius: 4,
                  padding: '4px 8px',
                  marginBottom: 10,
                  fontSize: '0.8rem',
                }}
              >
                <Search size={14} color="var(--muted)" />
                <input
                  type="text"
                  placeholder="Search brand"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  style={{ background: 'transparent', border: 'none', marginLeft: 6, width: '100%' }}
                />
              </div>
            )}

            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredBrands.map((brand) => (
                <label
                  key={brand}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.85rem',
                    color: 'var(--dark)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                    style={{ accentColor: 'var(--primary)', width: 15, height: 15 }}
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Price Ranges Filter */}
      <div style={{ paddingBottom: '18px', borderBottom: '1px solid var(--border-light)', marginBottom: '18px' }}>
        <div
          onClick={() => toggleSection('price')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase' }}>
            Price
          </span>
          {collapsedSections.price ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>

        {!collapsedSections.price && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PRICE_RANGES.map((pr, idx) => {
              const isSelected = filters.minPrice === pr.min && filters.maxPrice === pr.max;
              return (
                <label
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="price_filter"
                    checked={isSelected}
                    onChange={() => {
                      onChange('minPrice', pr.min);
                      onChange('maxPrice', pr.max);
                    }}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span>{pr.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Discount Filter */}
      <div style={{ paddingBottom: '18px', borderBottom: '1px solid var(--border-light)', marginBottom: '18px' }}>
        <div
          onClick={() => toggleSection('discount')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase' }}>
            Discount Range
          </span>
          {collapsedSections.discount ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>

        {!collapsedSections.discount && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DISCOUNT_RANGES.map((dr) => (
              <label
                key={dr.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="discount_filter"
                  checked={filters.minDiscount === dr.value}
                  onChange={() => onChange('minDiscount', dr.value)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span>{dr.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Customer Ratings Filter */}
      <div style={{ paddingBottom: '18px', borderBottom: '1px solid var(--border-light)', marginBottom: '18px' }}>
        <div
          onClick={() => toggleSection('rating')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase' }}>
            Customer Rating
          </span>
          {collapsedSections.rating ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>

        {!collapsedSections.rating && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {RATING_OPTIONS.map((ro) => (
              <label
                key={ro.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="rating_filter"
                  checked={filters.minRating === ro.value}
                  onChange={() => onChange('minRating', ro.value)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span>{ro.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Sizes Filter */}
      <div>
        <div
          onClick={() => toggleSection('sizes')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase' }}>
            Size
          </span>
          {collapsedSections.sizes ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>

        {!collapsedSections.sizes && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {POPULAR_SIZES.map((size) => {
              const active = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeToggle(size)}
                  style={{
                    border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                    backgroundColor: active ? 'var(--primary-light)' : '#ffffff',
                    color: active ? 'var(--primary)' : 'var(--dark)',
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
