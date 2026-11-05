import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  RefreshCw,
  Package,
  Layers,
  CheckCircle,
  FileText
} from 'lucide-react';
import { companyService } from '../../services/companyService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const CompanyInventory = () => {
  const { success, error } = useToast();
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Flag issue modal
  const [flagModal, setFlagModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderIdRef, setOrderIdRef] = useState('');
  const [flagReason, setFlagReason] = useState('Damaged fabric detected during picking in Bin A-12');
  const [submittingFlag, setSubmittingFlag] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await companyService.getInventory({
        q: search.trim() || undefined,
        lowStockOnly: lowStockOnly ? 'true' : undefined,
      });
      setProducts(data?.products || []);
      setTotalProducts(data?.totalProducts || 0);
    } catch (err) {
      error('Failed to load warehouse inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [lowStockOnly]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  const handleFlagIssue = async (e) => {
    e.preventDefault();
    setSubmittingFlag(true);
    try {
      await companyService.flagFulfillmentIssue({
        orderId: orderIdRef.trim(),
        productId: selectedProduct?.id || selectedProduct?._id,
        reason: flagReason,
      });
      success('Warehouse inventory exception logged successfully!');
      setFlagModal(false);
      setOrderIdRef('');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to flag inventory issue');
    } finally {
      setSubmittingFlag(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Warehouse Inventory & Stock Watchlist
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Live shelf count across <strong>{totalProducts}</strong> active catalog SKUs. Prevent negative stock.
          </p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={fetchInventory} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Stock Counts
        </button>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 20 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by product name, brand, or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36, width: '100%' }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
            />
            Show Low Stock Only (&le; 15 units)
          </label>

          <button type="submit" className="btn btn-primary btn-sm" style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }}>
            Filter Catalog
          </button>
        </form>
      </div>

      {loading ? (
        <Loader message="Querying warehouse inventory registers..." />
      ) : products.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
          <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3>No Inventory Items Found</h3>
          <p style={{ fontSize: '0.88rem', margin: '6px 0 0' }}>
            Try broadening your search or unchecking the low-stock filter.
          </p>
        </div>
      ) : (
        <div className="card" style={{ borderRadius: 10, border: '1px solid var(--border)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '12px 14px' }}>SKU / Product</th>
                <th style={{ padding: '12px 14px' }}>Brand</th>
                <th style={{ padding: '12px 14px' }}>Department</th>
                <th style={{ padding: '12px 14px' }}>Price</th>
                <th style={{ padding: '12px 14px' }}>Available Stock</th>
                <th style={{ padding: '12px 14px' }}>Inventory Health</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const stock = p.stockQuantity ?? p.stockCount ?? 50;
                const isCritical = stock <= 10;
                const isLow = stock > 10 && stock <= 20;

                return (
                  <tr key={p._id || p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src={p.images?.[0] || 'https://via.placeholder.com/40'}
                          alt={p.name}
                          style={{ width: 36, height: 44, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <div>
                          <div style={{ fontWeight: 700 }}>{p.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>ID: {p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{p.brand}</td>
                    <td style={{ padding: '12px 14px' }}>{p.categoryName || p.category}</td>
                    <td style={{ padding: '12px 14px' }}>₹{p.sellingPrice}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 800, fontSize: '0.95rem' }}>
                      {stock} units
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 4,
                          backgroundColor: isCritical ? '#fee2e2' : isLow ? '#fef3c7' : '#dcfce7',
                          color: isCritical ? '#b91c1c' : isLow ? '#b45309' : '#15803d',
                        }}
                      >
                        {isCritical ? 'CRITICAL LOW' : isLow ? 'LOW STOCK' : 'HEALTHY'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.75rem', borderColor: '#ef4444', color: '#ef4444' }}
                        onClick={() => {
                          setSelectedProduct(p);
                          setFlagModal(true);
                        }}
                      >
                        <AlertTriangle size={12} /> Flag Bin Issue
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Flag Issue Modal */}
      {flagModal && (
        <Modal isOpen={flagModal} onClose={() => setFlagModal(false)} title={`Flag Inventory Issue for: ${selectedProduct?.name}`}>
          <form onSubmit={handleFlagIssue} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                Associated Order ID (Optional)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Order ID experiencing picking failure"
                value={orderIdRef}
                onChange={(e) => setOrderIdRef(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                Exception Reason *
              </label>
              <textarea
                required
                rows={3}
                className="input-field"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-outline" onClick={() => setFlagModal(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                disabled={submittingFlag}
              >
                {submittingFlag ? 'Recording...' : 'Log Inventory Exception'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
