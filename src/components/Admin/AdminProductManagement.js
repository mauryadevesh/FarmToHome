import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/currency';

const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.getProducts();
      setProducts(Array.isArray(response) ? response : []);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct({
      ...product,
      stock: product.stock !== undefined ? product.stock : (product.quantity || 0)
    });
    setSuccess(null);
    setError(null);
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setSuccess(null);
    setError(null);
  };

  const handleSave = async () => {
    try {
      await api.updateAdminProduct(editingProduct.id || editingProduct._id, editingProduct);
      setSuccess('Product updated successfully!');
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      setError('Failed to update product');
      console.error('Update product error:', err);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteAdminProduct(productId.id || productId);
        setSuccess('Product deleted successfully!');
        fetchProducts();
      } catch (err) {
        setError('Failed to delete product');
        console.error('Delete product error:', err);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' || name === 'quantity' ? Number(value) : value
    }));
  };

  if (loading) {
    return (
      <div className="admin-product-management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-product-management">
      <div className="section-header">
        <h2>Product Management</h2>
        <p>Manage all products in the system</p>
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

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                {editingProduct && editingProduct._id === product._id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        name="name"
                        value={editingProduct.name}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                          type="number"
                          name="price"
                          value={editingProduct.price}
                          onChange={handleChange}
                          className="form-input"
                          min="0"
                          step="0.01"
                          style={{ width: '80px' }}
                        />
                        <span>/</span>
                        <select
                          name="unit"
                          value={editingProduct.unit || 'kg'}
                          onChange={handleChange}
                          className="form-input"
                          style={{ width: '80px' }}
                        >
                          <option value="kg">kg</option>
                          <option value="liters">liters</option>
                          <option value="pieces">pieces</option>
                          <option value="dozens">dozens</option>
                          <option value="grams">grams</option>
                          <option value="bunches">bunches</option>
                        </select>
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        name="stock"
                        value={editingProduct.stock ?? editingProduct.quantity ?? 0}
                        onChange={handleChange}
                        className="form-input"
                        min="0"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="category"
                        value={editingProduct.category}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </td>
                    <td>
                      <button onClick={handleSave} className="btn btn-primary btn-sm">
                        Save
                      </button>
                      <button onClick={handleCancel} className="btn btn-secondary btn-sm">
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td><strong>{product.name}</strong></td>
                    <td>{formatCurrency(product.price)} / {product.unit}</td>
                    <td>{product.stock ?? product.quantity ?? 0} {product.unit}</td>
                    <td><span className="product-category">{product.category}</span></td>
                    <td>
                      <button onClick={() => handleEdit(product)} className="btn btn-primary btn-sm">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(product.id || product._id)} className="btn btn-danger btn-sm">
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductManagement;
