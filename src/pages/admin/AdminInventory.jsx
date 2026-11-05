import React, { useState, useEffect } from 'react';
import { AlertTriangle, Package, Check, RefreshCw, Search } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';

export const AdminInventory = () => {
  const { success, error } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterThreshold, setFilterThreshold] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await adminService.getProducts({ limit: 100 });
      setProducts(res.products || []);
    } catch (err) {
      error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdateStock = async (product, newCount) => {
    setUpdatingId(product._id || product.id);
    try {
      const count = Math.max(0, parseInt(newCount, 10) || 0);
      await adminService.updateProduct(product._id || product.id, {
        stockCount: count,
        inStock: count > 0,
      });
      success(`Updated stock for "${product.name}" to ${count} units`);
      setProducts((prev) =>
        prev.map((p) =>
          (p._id || p.id) === (product._id || product.id)
            ? { ...p, stockCount: count, inStock: count > 0 }
            : p
        )
      );
    } catch (err) {
      error('Failed to update stock count');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const stock = p.stockCount !== undefined ? p.stockCount : 50;
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterThreshold === 'out_of_stock') return stock === 0;
    if (filterThreshold === 'low_stock') return stock > 0 && stock <= 15;
    if (filterThreshold === 'healthy') return stock > 15;
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Inventory Alerts & Stock Control
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            Monitor real-time product quantities and replenish SKU inventory
          </p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={fetchInventory}>
          <RefreshCw size={14} /> Refresh Stock
        </button>
      </div>

      {/* Filter and threshold bar */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 20,
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 260 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by product, brand or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={filterThreshold}
          onChange={(e) => setFilterThreshold(e.target.value)}
          className="form-control"
          style={{ width: '220px' }}
        >
          <option value="all">All Inventory Levels</option>
          <option value="low_stock">⚠️ Low Stock (≤ 15 units)</option>
          <option value="out_of_stock">🚫 Out of Stock (0 units)</option>
          <option value="healthy">✅ Healthy Stock (&gt; 15 units)</option>
        </select>
      </div>

      {loading ? (
        <Loader size="large" text="Auditing warehouse inventory..." />
      ) : (
        <div className="portal-table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Product SKU</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Current Units</th>
                <th>Stock Status</th>
                <th>Replenish Stock</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const stock = p.stockCount !== undefined ? p.stockCount : 50;
                return (
                  <tr key={p._id || p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={p.images?.[0] || 'https://via.placeholder.com/40'}
                          alt={p.name}
                          style={{ width: 40, height: 50, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>ID: {p.id || p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td>{p.brand}</td>
                    <td>
                      <span className="badge badge-info">{p.category}</span>
                    </td>
                    <td>₹{p.sellingPrice?.toLocaleString('en-IN')}</td>
                    <td>
                      <strong style={{ fontSize: '1rem', color: stock === 0 ? 'var(--danger)' : stock <= 15 ? 'var(--warning)' : 'inherit' }}>
                        {stock}
                      </strong>
                    </td>
                    <td>
                      {stock === 0 ? (
                        <span className="badge badge-danger">OUT OF STOCK</span>
                      ) : stock <= 15 ? (
                        <span className="badge badge-warning">LOW STOCK ALERT</span>
                      ) : (
                        <span className="badge badge-success">IN STOCK</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input
                          type="number"
                          defaultValue={stock}
                          id={`stock-${p._id || p.id}`}
                          min={0}
                          style={{
                            width: 70,
                            padding: '4px 8px',
                            border: '1px solid var(--border)',
                            borderRadius: 4,
                            fontSize: '0.85rem',
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          disabled={updatingId === (p._id || p.id)}
                          onClick={() => {
                            const val = document.getElementById(`stock-${p._id || p.id}`).value;
                            handleUpdateStock(p, val);
                          }}
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
