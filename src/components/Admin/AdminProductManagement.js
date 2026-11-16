import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { getProductImage } from '../../utils/productImage';
import ImageUpload from '../UI/ImageUpload';
import { FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from '../UI/Motion';

const CATEGORIES = [
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'grains', label: 'Grains & Cereals' },
  { value: 'pulses', label: 'Pulses & Dals' },
  { value: 'dairy', label: 'Dairy & Eggs' },
  { value: 'other', label: 'Other' }
];

const UNITS = ['kg', 'liters', 'pieces', 'dozens', 'grams', 'bunches', 'packets'];

const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data for adding a product
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'vegetables',
    unit: 'kg',
    stock: '',
    image: '',
    isAvailable: true
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminProducts();
      setProducts(Array.isArray(response) ? response : []);
    } catch (err) {
      setError('Failed to fetch product catalog. Please check API connection.');
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetNewProduct = () => {
    setNewProduct({
      name: '',
      description: '',
      price: '',
      category: 'vegetables',
      unit: 'kg',
      stock: '',
      image: '',
      isAvailable: true
    });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price || newProduct.stock === '') {
      setError('Please provide product name, price, and stock quantity.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.createAdminProduct({
        ...newProduct,
        name: newProduct.name.trim(),
        description: newProduct.description.trim() || `Fresh, farm-harvested ${newProduct.name.trim()}.`,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock, 10),
        unit: newProduct.unit.trim()
      });
      setSuccess(`Product "${newProduct.name}" created successfully!`);
      setShowAddModal(false);
      resetNewProduct();
      fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct({
      id: product.id || product._id,
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || 'vegetables',
      unit: product.unit || 'kg',
      stock: product.stock !== undefined ? product.stock : (product.quantity || 0),
      image: product.image || '',
      isAvailable: product.isAvailable !== false && product.is_available !== false
    });
    setSuccess(null);
    setError(null);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setSubmitting(true);
      setError(null);
      const payload = {
        ...editingProduct,
        price: parseFloat(editingProduct.price),
        stock: parseInt(editingProduct.stock, 10),
        isAvailable: editingProduct.isAvailable
      };

      await api.updateAdminProduct(editingProduct.id, payload);
      setSuccess(`Product "${editingProduct.name}" updated successfully!`);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}" from the catalog? This cannot be undone.`)) {
      try {
        const id = productId.id || productId._id || productId;
        await api.deleteAdminProduct(id);
        setSuccess(`"${productName}" deleted successfully.`);
        fetchProducts();
      } catch (err) {
        setError(err.message || 'Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchTerm || (
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesCategory = selectedCategory === 'all' || p.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="admin-product-management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading catalog inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-product-management">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Product & Produce Catalog</h2>
          <p>Manage all marketplace offerings, adjust live stock, and add new crops.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => { resetNewProduct(); setShowAddModal(true); }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <FaPlus /> Add New Product
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="success-message">
          <p>{success}</p>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="admin-toolbar" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search crops by name or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedCategory('all')}
          >
            All ({products.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = products.filter(p => p.category?.toLowerCase() === cat.value).length;
            return (
              <button
                key={cat.value}
                type="button"
                className={`btn btn-sm ${selectedCategory === cat.value ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Table */}
      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Photo</th>
              <th>Produce Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-muted)' }}>
                  No produce items match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => {
                const currentId = product.id || product._id;
                const isAvailable = product.isAvailable !== false && product.is_available !== false;

                return (
                  <tr key={currentId}>
                    <td>
                      <img
                        src={getProductImage(product.image, product.name)}
                        alt={product.name}
                        className="product-thumbnail"
                        onError={(e) => {
                          e.target.src = getProductImage(null, product.name);
                        }}
                      />
                    </td>
                    <td>
                      <strong>{product.name}</strong>
                      {product.description && (
                        <div style={{ fontSize: '11px', color: 'var(--color-muted)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="product-category" style={{ textTransform: 'capitalize' }}>
                        {product.category}
                      </span>
                    </td>
                    <td>
                      {formatCurrency(product.price)} / {product.unit}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: (product.stock ?? 0) <= 5 ? 'var(--color-danger)' : 'inherit' }}>
                        {product.stock ?? product.quantity ?? 0} {product.unit}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${isAvailable ? 'status-badge--delivered' : 'status-badge--cancelled'}`}>
                        {isAvailable ? 'In Stock' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleEditClick(product)}
                          className="btn btn-primary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(currentId, product.name)}
                          className="btn btn-danger btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="edit-form-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-lenis-prevent
          >
            <motion.div
              className="edit-form-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <h3>Add New Produce Listing</h3>
              <form onSubmit={handleCreateProduct}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label className="form-label">Produce Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Organic Spinach"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Category *</label>
                    <select
                      className="form-input"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label className="form-label">Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      required
                      placeholder="35.00"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Unit *</label>
                    <select
                      className="form-input"
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    >
                      {UNITS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Initial Stock *</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      required
                      placeholder="50"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    placeholder="Crisp, fresh morning harvest..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>

                {/* Image Upload Component */}
                <ImageUpload
                  value={newProduct.image}
                  onChange={(img) => setNewProduct({ ...newProduct, image: img })}
                  label="Upload Produce Photo or Enter URL"
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Add Produce'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            className="edit-form-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-lenis-prevent
          >
            <motion.div
              className="edit-form-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <h3>Edit Produce Details</h3>
              <form onSubmit={handleUpdateProduct}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label className="form-label">Produce Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Category *</label>
                    <select
                      className="form-input"
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label className="form-label">Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      required
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Unit *</label>
                    <select
                      className="form-input"
                      value={editingProduct.unit}
                      onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    >
                      {UNITS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Stock Quantity *</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      required
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  />
                </div>

                {/* Image Upload Component */}
                <ImageUpload
                  value={editingProduct.image}
                  onChange={(img) => setEditingProduct({ ...editingProduct, image: img })}
                  label="Update Photo or Change URL"
                />

                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--text-xs)' }}>
                    <input
                      type="checkbox"
                      checked={editingProduct.isAvailable}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isAvailable: e.target.checked })}
                    />
                    <strong>Visible in Marketplace (In Stock)</strong>
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingProduct(null)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProductManagement;
