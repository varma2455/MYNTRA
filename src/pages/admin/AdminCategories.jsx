import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const AdminCategories = () => {
  const { success, error } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    image: '',
    itemCountText: '50+ Styles',
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await adminService.getCategories();
      setCategories(data || []);
    } catch (err) {
      error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setFormData({ id: '', name: '', image: '', itemCountText: '50+ Styles' });
    setShowAddModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCategory(c);
    setFormData({
      id: c.id,
      name: c.name,
      image: c.image || '',
      itemCountText: c.itemCountText || '50+ Styles',
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id || editingCategory._id, formData);
        success('Category updated successfully');
        setEditingCategory(null);
      } else {
        await adminService.createCategory(formData);
        success('Category created successfully');
        setShowAddModal(false);
      }
      fetchCategories();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await adminService.deleteCategory(id);
      success('Category deleted');
      fetchCategories();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Category Hierarchy & Taxonomy
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            {categories.length} active departments configured in MongoDB
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <Loader size="large" text="Loading categories..." />
      ) : (
        <div className="portal-table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Identifier Slug</th>
                <th>Product Count</th>
                <th>Subcategories</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id || cat._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={cat.image || 'https://via.placeholder.com/40'}
                        alt={cat.name}
                        style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <strong>{cat.name}</strong>
                    </div>
                  </td>
                  <td><code>{cat.id}</code></td>
                  <td>
                    <span className="badge badge-success">
                      {cat.productCount || 52} items
                    </span>
                  </td>
                  <td>{cat.subCategories?.length || 0} sub-departments</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => handleOpenEdit(cat)}
                        title="Edit category"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDelete(cat.id || cat._id, cat.name)}
                        title="Delete category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showAddModal || !!editingCategory}
        onClose={() => {
          setShowAddModal(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? `Edit Category` : 'Create Category'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Unique Slug ID *</label>
            <input
              type="text"
              className="form-control"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              required
              disabled={!!editingCategory}
              placeholder="e.g. ethnic-wear"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input
              type="text"
              className="form-control"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Item Count Label</label>
            <input
              type="text"
              className="form-control"
              value={formData.itemCountText}
              onChange={(e) => setFormData({ ...formData, itemCountText: e.target.value })}
              placeholder="e.g. 50+ Styles"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setShowAddModal(false);
                setEditingCategory(null);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
