import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Search, RotateCcw, Check } from 'lucide-react';

const CATEGORIES_LIST = [
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
  { id: 'kids', label: 'Kids' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'footwear', label: 'Footwear' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'home-living', label: 'Home & Living' },
  { id: 'sports-fitness', label: 'Sports & Fitness' },
  { id: 'jewellery', label: 'Jewellery' },
  { id: 'electronics-lifestyle', label: 'Electronics & Lifestyle' },
  { id: 'premium-luxe', label: 'Premium Luxe' },
];

const PRICE_RANGES = [
  { label: 'Under ₹499', min: '', max: '499' },
  { label: '₹500–₹999', min: '500', max: '999' },
  { label: '₹1,000–₹1,999', min: '1000', max: '1999' },
  { label: '₹2,000–₹4,999', min: '2000', max: '4999' },
  { label: '₹5,000–₹9,999', min: '5000', max: '9999' },
  { label: 'Above ₹10,000', min: '10000', max: '' },
];

const DISCOUNT_RANGES = [
  { label: '10% and above', value: '10' },
  { label: '20% and above', value: '20' },
  { label: '30% and above', value: '30' },
  { label: '40% and above', value: '40' },
  { label: '50% and above', value: '50' },
  { label: '60% and above', value: '60' },
];

const RATING_OPTIONS = [
  { label: '4★ and above', value: '4' },
  { label: '3★ and above', value: '3' },
  { label: '2★ and above', value: '2' },
];

const SIZES_LIST = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

const COLORS_LIST = [
  { name: 'Black', hex: '#000000', border: false },
  { name: 'White', hex: '#FFFFFF', border: true },
  { name: 'Blue', hex: '#1E40AF', border: false },
  { name: 'Red', hex: '#DC2626', border: false },
  { name: 'Green', hex: '#16A34A', border: false },
  { name: 'Grey', hex: '#6B7280', border: false },
  { name: 'Pink', hex: '#EC4899', border: false },
  { name: 'Brown', hex: '#78350F', border: false },
  { name: 'Beige', hex: '#D4B996', border: false },
];

const DEFAULT_BRANDS = [
  'Nike',
  'Zara',
  "Levi's",
  'H&M',
  'Puma',
  'Roadstar',
  'Fossil',
  'FabIndia',
];

export const Filters = ({
  filters = {},
  onChange,
  onClear,
  availableBrands = [],
  totalCount = 0,
}) => {
  const [brandSearch, setBrandSearch] = useState('');
  const [collapsedSections, setCollapsedSections] = useState({
    category: false,
    brand: false,
    price: false,
    discount: false,
    rating: false,
    sizes: false,
    colors: false,
    availability: false,
  });

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Helper for toggling values in a comma-separated query param
  const handleMultiToggle = (key, item) => {
    const raw = filters[key] ? filters[key].split(',').map((x) => x.trim()) : [];
    let updated;
    if (raw.includes(item)) {
      updated = raw.filter((x) => x !== item);
    } else {
      updated = [...raw, item];
    }
    onChange(key, updated.join(','));
  };

  const selectedCategories = filters.category ? filters.category.split(',').map((c) => c.trim().toLowerCase()) : [];
  const selectedBrands = filters.brand ? filters.brand.split(',').map((b) => b.trim()) : [];
  const selectedSizes = filters.sizes ? filters.sizes.split(',').map((s) => s.trim()) : [];
  const selectedColors = filters.colors ? filters.colors.split(',').map((c) => c.trim()) : [];
  const selectedAvailability = filters.availability || '';

  const displayBrands = Array.from(new Set([...DEFAULT_BRANDS, ...availableBrands])).filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase().trim())
  );

  const hasActiveFilters =
    filters.category ||
    filters.brand ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minDiscount ||
    filters.minRating ||
    filters.sizes ||
    filters.colors ||
    filters.availability;

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
          <span style={{ fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase' }}>
            Filters
          </span>
          {totalCount !== undefined && (
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>
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
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <RotateCcw size={12} /> Clear All
          </button>
        )}
      </div>

      {/* 1. Category Filter */}
      <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-light)', marginBottom: '16px' }}>
        <div
          onClick={() => toggleSection('category')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
            Categories
          </span>
          {collapsedSections.category ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>

        {!collapsedSections.category && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '200px', overflowY: 'auto' }}>
            {CATEGORIES_LIST.map((cat) => {
              const isChecked = selectedCategories.includes(cat.id);
              return (
                <label
                  key={cat.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.84rem',
                    color: isChecked ? 'var(--primary)' : 'var(--dark)',
                    fontWeight: isChecked ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleMultiToggle('category', cat.id)}
                    style={{ accentColor: 'var(--primary)', width: 15, height: 15, cursor: 'pointer' }}
                  />
                  <span>{cat.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Brand Filter */}
      <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-light)', marginBottom: '16px' }}>
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
          <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
            Brand ({displayBrands.length})
          </span>
          {collapsedSections.brand ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>

        {!collapsedSections.brand && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-subtle)',
                borderRadius: 4,
                padding: '4px 8px',
                marginBottom: 8,
                fontSize: '0.8rem',
              }}
            >
              <Search size={14} color="var(--muted)" />
              <input
                type="text"
                placeholder="Search brand..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                style={{ background: 'transparent', border: 'none', marginLeft: 6, width: '100%', fontSize: '0.8rem' }}
              />
            </div>

            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {displayBrands.map((brand) => {
                const isChecked = selectedBrands.includes(brand);
                return (
                  <label
                    key={brand}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '0.84rem',
                      color: isChecked ? 'var(--primary)' : 'var(--dark)',
                      fontWeight: isChecked ? 600 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleMultiToggle('brand', brand)}
                      style={{ accentColor: 'var(--primary)', width: 15, height: 15, cursor: 'pointer' }}
                    />
                    <span>{brand}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Price Filter (6 Exact Brackets) */}
      <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-light)', marginBottom: '16px' }}>
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
          <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
            Price Range
          </span>
          {collapsedSections.price ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>

        {!collapsedSections.price && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {PRICE_RANGES.map((pr, idx) => {
              const isSelected = filters.minPrice === pr.min && filters.maxPrice === pr.max;
              return (
                <label
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    color: isSelected ? 'var(--primary)' : 'var(--dark)',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  <input
                    type="radio"
                    name="price_filter_radio"
                    checked={isSelected}
                    onChange={() => {
                      if (isSelected) {
                        onChange('minPrice', '');
                        onChange('maxPrice', '');
                      } else {
                        onChange('minPrice', pr.min);
                        onChange('maxPrice', pr.max);
                      }
                    }}
                    onClick={() => {
                      if (isSelected) {
                        onChange('minPrice', '');
                        onChange('maxPrice', '');
                      }
                    }}
                    style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <span>{pr.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Discount Filter (6 Thresholds) */}
      <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-light)', marginBottom: '16px' }}>
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
          <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
            Discount
          </span>
          {collapsedSections.discount ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>

        {!collapsedSections.discount && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {DISCOUNT_RANGES.map((dr) => {
              const isSelected = filters.minDiscount === dr.value;
              return (
                <label
                  key={dr.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    color: isSelected ? 'var(--primary)' : 'var(--dark)',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  <input
                    type="radio"
                    name="discount_filter_radio"
                    checked={isSelected}
                    onChange={() => {
                      if (isSelected) {
                        onChange('minDiscount', '');
                      } else {
                        onChange('minDiscount', dr.value);
                      }
                    }}
                    onClick={() => {
                      if (isSelected) onChange('minDiscount', '');
                    }}
                    style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <span>{dr.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Rating Filter (4★, 3★, 2★) */}
      <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-light)', marginBottom: '16px' }}>
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
          <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
            Rating
          </span>
          {collapsedSections.rating ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>

        {!collapsedSections.rating && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {RATING_OPTIONS.map((ro) => {
              const isSelected = filters.minRating === ro.value;
              return (
                <label
                  key={ro.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    color: isSelected ? 'var(--primary)' : 'var(--dark)',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  <input
                    type="radio"
                    name="rating_filter_radio"
                    checked={isSelected}
                    onChange={() => {
                      if (isSelected) {
                        onChange('minRating', '');
                      } else {
                        onChange('minRating', ro.value);
                      }
                    }}
                    onClick={() => {
                      if (isSelected) onChange('minRating', '');
                    }}
                    style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <span>{ro.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Size Filter */}
      <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-light)', marginBottom: '16px' }}>
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
          <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
            Size
          </span>
          {collapsedSections.sizes ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>

        {!collapsedSections.sizes && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SIZES_LIST.map((sz) => {
              const active = selectedSizes.includes(sz);
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => handleMultiToggle('sizes', sz)}
                  style={{
                    border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                    backgroundColor: active ? 'var(--primary-light)' : '#ffffff',
                    color: active ? 'var(--primary)' : 'var(--dark)',
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. Color Filter */}
      <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-light)', marginBottom: '16px' }}>
        <div
          onClick={() => toggleSection('colors')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
            Color
          </span>
          {collapsedSections.colors ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>

        {!collapsedSections.colors && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {COLORS_LIST.map((c) => {
              const active = selectedColors.includes(c.name);
              return (
                <div
                  key={c.name}
                  onClick={() => handleMultiToggle('colors', c.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 6px',
                    borderRadius: 4,
                    border: `1px solid ${active ? 'var(--primary)' : 'var(--border-light)'}`,
                    backgroundColor: active ? 'var(--primary-light)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                  title={c.name}
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: c.hex,
                      border: c.border ? '1px solid #ccc' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {active && <Check size={10} color={c.name === 'White' || c.name === 'Beige' ? '#000' : '#fff'} />}
                  </span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 8. Availability Filter */}
      <div style={{ paddingBottom: '16px', marginBottom: '16px' }}>
        <div
          onClick={() => toggleSection('availability')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
            Availability
          </span>
          {collapsedSections.availability ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>

        {!collapsedSections.availability && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'In Stock', value: 'inStock' },
              { label: 'Out of Stock', value: 'outOfStock' },
            ].map((av) => {
              const isSelected = selectedAvailability === av.value;
              return (
                <label
                  key={av.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    color: isSelected ? 'var(--primary)' : 'var(--dark)',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  <input
                    type="radio"
                    name="availability_filter_radio"
                    checked={isSelected}
                    onChange={() => {
                      if (isSelected) {
                        onChange('availability', '');
                      } else {
                        onChange('availability', av.value);
                      }
                    }}
                    onClick={() => {
                      if (isSelected) onChange('availability', '');
                    }}
                    style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <span>{av.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
