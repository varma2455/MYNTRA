import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const AdminProducts = () => {
  const { success, error } = useToast();

  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'mens-clothing',
    sellingPrice: '',
    originalPrice: '',
    stockCount: 50,
    images: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800',
    sizes: 'S,M,L,XL',
    description: '',
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminService.getProducts({
        page,
        limit: 15,
        search: search.trim() || undefined,
        category: category || undefined,
      });
      setProducts(res.products || []);
      setTotalCount(res.totalCount || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    adminService
      .getCategories()
      .then((data) => setCategories(data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      brand: '',
      category: categories[0]?.id || 'mens-clothing',
      sellingPrice: '',
      originalPrice: '',
      stockCount: 50,
      images: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800',
      sizes: 'S,M,L,XL',
      description: '',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || '',
      brand: p.brand || '',
      category: p.category || 'mens-clothing',
      sellingPrice: p.sellingPrice || '',
      originalPrice: p.originalPrice || '',
      stockCount: p.stockCount !== undefined ? p.stockCount : 50,
      images: Array.isArray(p.images) ? p.images.join(',') : p.images || '',
      sizes: Array.isArray(p.sizes) ? p.sizes.join(',') : p.sizes || 'S,M,L',
      description: p.description || '',
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      category: formData.category,
      sellingPrice: Number(formData.sellingPrice),
      originalPrice: Number(formData.originalPrice || formData.sellingPrice),
      stockCount: Number(formData.stockCount),
      images: formData.images.split(',').map((img) => img.trim()).filter(Boolean),
      sizes: formData.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      description: formData.description.trim(),
    };

    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct._id || editingProduct.id, payload);
        success('Product updated successfully');
        setEditingProduct(null);
      } else {
        await adminService.createProduct(payload);
        success('Product created successfully');
        setShowAddModal(false);
      }
      fetchProducts();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      await adminService.deleteProduct(id);
      success('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Product Catalog Management
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            {totalCount} total catalog items registered in MongoDB
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
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
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, minWidth: 260, gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search by title, SKU or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: 36 }}
            />
            <Search size={16} color="var(--muted)" style={{ position: 'absolute', left: 12, top: 14 }} />
          </div>
          <button type="submit" className="btn btn-outline btn-sm">
            Search
          </button>
        </form>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="form-control"
          style={{ width: '220px' }}
        >
          <option value="">All 15 Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      {loading ? (
        <Loader size="large" text="Querying database products..." />
      ) : (
        <div className="portal-table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price / MRP</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                    No products matched your search criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
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
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>SKU: {p.sku || p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{p.brand}</td>
                    <td>
                      <span className="badge badge-info">{p.category}</span>
                    </td>
                    <td>
                      <strong>₹{p.sellingPrice?.toLocaleString('en-IN')}</strong>
                      {p.originalPrice > p.sellingPrice && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--light-muted)', textDecoration: 'line-through', marginLeft: 6 }}>
                          ₹{p.originalPrice?.toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${p.stockCount <= 5 ? 'badge-danger' : 'badge-success'}`}>
                        {p.stockCount !== undefined ? p.stockCount : 50} in stock
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleOpenEdit(p)}
                          title="Edit product"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => handleDeleteProduct(p._id || p.id, p.name)}
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showAddModal || !!editingProduct}
        onClose={() => {
          setShowAddModal(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? `Edit "${editingProduct.name}"` : 'Add New Fashion Product'}
      >
        <form onSubmit={handleSaveProduct}>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Brand *</label>
              <input
                type="text"
                className="form-control"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Selling Price (₹) *</label>
              <input
                type="number"
                className="form-control"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                required
                min={0}
              />
            </div>
            <div className="form-group">
              <label className="form-label">MRP Price (₹)</label>
              <input
                type="number"
                className="form-control"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                min={0}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Stock Units *</label>
              <input
                type="number"
                className="form-control"
                value={formData.stockCount}
                onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                required
                min={0}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image URLs (comma separated)</label>
            <input
              type="text"
              className="form-control"
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Available Sizes (comma separated)</label>
            <input
              type="text"
              className="form-control"
              value={formData.sizes}
              onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
              placeholder="S,M,L,XL"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setShowAddModal(false);
                setEditingProduct(null);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
