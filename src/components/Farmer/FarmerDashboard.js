import React, { useEffect, useState } from 'react';
import apiService from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { getProductImage } from '../../utils/productImage';
import { PageTransition, motion, AnimatePresence } from '../UI/Motion';

const FarmerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    unit: 'kg',
    image: ''
  });
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts();
      setProducts(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      unit: 'kg',
      image: ''
    });
    setEditingProduct(null);
    setFormError(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      unit: product.unit,
      image: product.image || ''
    });
    setShowForm(true);
  };

  const handleQuantityAdjust = async (product, delta) => {
    const prodId = product._id || product.id;
    const newStock = Math.max(0, (product.stock || 0) + delta);
    if (newStock === product.stock) return;

    try {
      setSaving(true);
      const updated = await apiService.updateProduct(prodId, { stock: newStock });
      const updatedId = updated._id || updated.id;
      setProducts(prev => prev.map(p => ((p._id || p.id) === updatedId ? { ...p, stock: newStock, ...updated } : p)));
    } catch (err) {
      setFormError(err.message || 'Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    try {
      setSaving(true);
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10)
      };

      let response;
      if (editingProduct) {
        const editId = editingProduct._id || editingProduct.id;
        response = await apiService.updateProduct(editId, payload);
      } else {
        response = await apiService.createProduct(payload);
      }

      const resId = response._id || response.id;
      if (editingProduct) {
        setProducts(prev => prev.map(p => ((p._id || p.id) === resId ? response : p)));
      } else {
        setProducts(prev => [response, ...prev]);
      }

      resetForm();
      setShowForm(false);
    } catch (err) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="farmer-dashboard-container"><div className="loading">Loading dashboard...</div></div>;
  }

  if (error) {
    return (
      <div className="farmer-dashboard-container">
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-primary" onClick={fetchProducts}>Retry</button>
      </div>
    );
  }

  return (
    <PageTransition className="farmer-dashboard-container">
      <div className="dashboard-header">
        <h1>Farmer Dashboard</h1>
        <p>Manage your farm products and keep inventory fresh</p>
        <button className="btn btn-primary" onClick={openCreateForm}>
          Add New Product
        </button>
      </div>

      <div className="dashboard-content">
        {products.length === 0 ? (
          <div className="no-products">
            <h3>No products listed yet</h3>
            <p>Start by adding your first farm product.</p>
            <button className="btn btn-primary" onClick={openCreateForm}>Add Product</button>
          </div>
        ) : (
          <div className="product-management">
            <AnimatePresence>
              {products.map((product, idx) => {
                const prodKey = product._id || product.id || Math.random().toString();
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.04, 0.25) }}
                    key={prodKey}
                    className="farmer-product-card"
                  >
                  <div className="product-media">
                    <img
                      src={getProductImage(product.image, product.name)}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = getProductImage(null, product.name);
                      }}
                    />
                  </div>
                  <div className="product-details">
                    <div className="product-header">
                      <h3>{product.name}</h3>
                      <span className="product-category">{product.category}</span>
                    </div>
                    <p>{product.description}</p>
                    <div className="product-meta">
                      <span>{formatCurrency(product.price)} / {product.unit}</span>
                      <span>{product.stock} {product.unit} in stock</span>
                    </div>
                    <div className="product-actions">
                      <div className="stock-controls">
                        <button
                          className="quantity-btn"
                          onClick={() => handleQuantityAdjust(product, -1)}
                          disabled={saving || product.stock <= 0}
                        >
                          -
                        </button>
                        <span className="stock-count">{product.stock}</span>
                        <button
                          className="quantity-btn"
                          onClick={() => handleQuantityAdjust(product, 1)}
                          disabled={saving}
                        >
                          +
                        </button>
                      </div>
                      <button className="btn btn-outline" onClick={() => openEditForm(product)}>
                        Edit Details
                      </button>
                    </div>
                  </div>
                </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      )}
    </div>

    <AnimatePresence>
      {showForm && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-lenis-prevent
        >
          <motion.div
            className="modal"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            {formError && <div className="alert alert-error">{formError}</div>}
            <form className="product-form" onSubmit={handleFormSubmit}>
              <label>
                Product Name
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="3"
                  required
                />
              </label>
              <label>
                Category
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  required
                />
              </label>
              <div className="form-row">
                <label>
                  Price (₹)
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleFormChange}
                    required
                  />
                </label>
                <label>
                  Stock
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleFormChange}
                    required
                  />
                </label>
                <label>
                  Unit
                  <select name="unit" value={formData.unit} onChange={handleFormChange}>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="lb">lb</option>
                    <option value="piece">piece</option>
                  </select>
                </label>
              </div>
              <label>
                Image URL
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleFormChange}
                  placeholder="https://example.com/product.jpg"
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </PageTransition>
  );
};

export default FarmerDashboard;
