import React, { useEffect, useState } from 'react';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import formatCurrency from '../../utils/currency';
import { getProductImage } from '../../utils/productImage';
import ImageUpload from '../UI/ImageUpload';
import { PageTransition, motion, AnimatePresence } from '../UI/Motion';
import {
  FaMapMarkerAlt,
  FaClock,
  FaPhoneAlt,
  FaLeaf,
  FaPlus,
  FaClipboardList,
  FaCheck,
  FaRupeeSign,
  FaAward,
  FaTruck
} from 'react-icons/fa';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders' | 'profile'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Product Form Modal State
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'vegetables',
    stock: '',
    unit: '1 kg',
    image: '',
    originFarm: '',
    harvestDate: 'Morning Harvest (5:30 AM)'
  });
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [prodRes, orderRes] = await Promise.all([
        apiService.getProducts(),
        apiService.getOrders()
      ]);
      setProducts(Array.isArray(prodRes) ? prodRes : []);
      setOrders(Array.isArray(orderRes) ? orderRes : []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load farmer hub data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'vegetables',
      stock: '',
      unit: '1 kg',
      image: '',
      originFarm: user?.address || 'Uttan Coastal Agro Farm',
      harvestDate: 'Morning Harvest (5:30 AM)'
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
      image: product.image || '',
      originFarm: product.origin_farm || product.originFarm || user?.address || 'Uttan Coastal Agro Farm',
      harvestDate: product.harvest_date || product.harvestDate || 'Morning Harvest (5:30 AM)'
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

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this crop listing?')) return;
    try {
      await apiService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => (p.id !== productId && p._id !== productId)));
      setActionSuccess('Crop listing removed successfully.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      alert(err.message || 'Error removing product');
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
        setActionSuccess(`Updated ${formData.name} successfully.`);
      } else {
        setProducts(prev => [response, ...prev]);
        setActionSuccess(`Added fresh ${formData.name} to active harvest catalog.`);
      }

      resetForm();
      setShowForm(false);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiService.updateDeliveryStatus(orderId, { status: newStatus });
      setOrders(prev => prev.map(o => ((o.id === orderId || o._id === orderId) ? { ...o, status: newStatus, order_status: newStatus } : o)));
      setActionSuccess(`Order #${orderId} advanced to "${newStatus}".`);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      alert(err.message || 'Error updating order status');
    }
  };

  // Farmer metrics strictly scoped to current cultivator
  const myFarmerId = user?.id || user?._id;
  const myProducts = products.filter(p => (
    p.farmer_id === myFarmerId ||
    p.farmerId === myFarmerId ||
    p.farmer?.id === myFarmerId ||
    p.farmer?._id === myFarmerId ||
    (myFarmerId === 'user_farmer' && (p.farmer_id === 'user_farmer' || p.farmer_id === 'farmer_1'))
  ));
  const totalStock = myProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
  const pendingOrdersCount = orders.filter(o => ['Pending', 'Accepted', 'Preparing'].includes(o.status || o.order_status)).length;

  if (loading) {
    return (
      <div className="farmer-dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your farm harvest hub...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="farmer-dashboard-container">
      {/* Top Header */}
      <div className="dashboard-header">
        <div className="farmer-header-inner">
          <div className="farmer-header-meta">
            <div className="farmer-title-row">
              <h1>Grower Harvest Control Hub</h1>
              <span className="badge-verified-cultivator">
                <FaAward /> Verified Cultivator
              </span>
            </div>
            <p className="farmer-welcome-sub">
              Welcome back, <strong>{user?.name}</strong>! Direct harvest management for the Mira Bhayandar peri-urban network.
            </p>
            <div className="farmer-tags-row">
              <span className="farmer-meta-tag">
                <FaMapMarkerAlt /> {user?.address || 'Uttan Coastal Green Belt, Mira Bhayandar'}
              </span>
              <span className="farmer-meta-tag">
                <FaPhoneAlt /> {user?.phone || '+91 98201 12345'}
              </span>
              <span className="farmer-meta-tag">
                <FaLeaf /> 0% Middleman Deduction Active
              </span>
            </div>
          </div>

          <div className="farmer-header-actions">
            <button className="btn btn--primary" onClick={openCreateForm}>
              <FaPlus style={{ marginRight: '6px' }} /> List New Crop
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="farmer-kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Active Crops Listed</span>
          <span className="kpi-val">{myProducts.length}</span>
          <span className="kpi-sub">Field crops ready</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Harvest Stock Available</span>
          <span className="kpi-val">{totalStock} Units</span>
          <span className="kpi-sub">Direct inventory</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Incoming Orders</span>
          <span className="kpi-val kpi-val--highlight">{orders.length}</span>
          <span className="kpi-sub">{pendingOrdersCount} awaiting dispatch</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Estimated Revenue</span>
          <span className="kpi-val kpi-val--green">{formatCurrency(orders.reduce((sum, o) => sum + (o.total_amount || 0), 0))}</span>
          <span className="kpi-sub">100% fair gate payout</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ margin: '1rem 0' }}>
          <span>{error}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="alert alert-success feedback-toast">
          <FaCheck /> <span>{actionSuccess}</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="dashboard-tabs-bar">
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <FaLeaf /> Field Produce & Inventory ({myProducts.length})
        </button>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <FaClipboardList /> Customer Orders & Fulfillment ({orders.length})
        </button>
      </div>

      {/* TAB 1: Produce & Inventory Management */}
      {activeTab === 'products' && (
        <div className="farmer-tab-content">
          <div className="tab-section-head">
            <div>
              <h3>Active Farm Crops</h3>
              <p>Adjust stock availability per morning harvest or update unit pricing.</p>
            </div>
            <button className="btn btn--secondary btn--sm" onClick={openCreateForm}>
              <FaPlus /> Add Crop
            </button>
          </div>

          <div className="farmer-products-grid">
            {myProducts.map((prod) => {
              const prodId = prod.id || prod._id;
              const isOutOfStock = prod.stock <= 0;

              return (
                <div key={prodId} className="farmer-crop-card">
                  <div className="crop-card-image-wrap">
                    <img
                      src={getProductImage(prod.image, prod.name)}
                      alt={prod.name}
                      className="crop-card-img"
                    />
                    <span className={`crop-stock-badge ${isOutOfStock ? 'out' : ''}`}>
                      {isOutOfStock ? 'Sold Out' : `${prod.stock} ${prod.unit} Available`}
                    </span>
                  </div>

                  <div className="crop-card-body">
                    <div className="crop-top-row">
                      <span className="crop-category">{prod.category}</span>
                      <span className="crop-price">{formatCurrency(prod.price)} / {prod.unit}</span>
                    </div>

                    <h4 className="crop-title">{prod.name}</h4>
                    <p className="crop-desc">{prod.description}</p>
                    <span className="crop-origin"><FaMapMarkerAlt /> {prod.origin_farm || 'Uttan Farm'}</span>

                    {/* Stock Quick-Adjuster */}
                    <div className="stock-adjustment-bar">
                      <span className="adjust-label">Adjust Available Units:</span>
                      <div className="adjust-controls">
                        <button
                          type="button"
                          className="btn-stock-delta"
                          onClick={() => handleQuantityAdjust(prod, -5)}
                          disabled={saving || prod.stock <= 0}
                          title="Decrease by 5"
                        >
                          -5
                        </button>
                        <button
                          type="button"
                          className="btn-stock-delta"
                          onClick={() => handleQuantityAdjust(prod, -1)}
                          disabled={saving || prod.stock <= 0}
                          title="Decrease by 1"
                        >
                          -1
                        </button>
                        <span className="stock-display-val">{prod.stock}</span>
                        <button
                          type="button"
                          className="btn-stock-delta"
                          onClick={() => handleQuantityAdjust(prod, 1)}
                          disabled={saving}
                          title="Increase by 1"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          className="btn-stock-delta"
                          onClick={() => handleQuantityAdjust(prod, 10)}
                          disabled={saving}
                          title="Increase by 10"
                        >
                          +10
                        </button>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="crop-card-actions">
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => openEditForm(prod)}
                      >
                        Edit Details
                      </button>
                      <button
                        type="button"
                        className="btn-delete-crop"
                        onClick={() => handleDeleteProduct(prodId)}
                        title="Remove crop"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Customer Orders & Fulfillment Pipeline */}
      {activeTab === 'orders' && (
        <div className="farmer-tab-content">
          <div className="tab-section-head">
            <div>
              <h3>Customer Harvest Orders</h3>
              <p>Review customer requests from Mira Bhayandar, confirm harvest pick, and mark ready for transit.</p>
            </div>
            <span className="orders-badge-pill">{orders.length} Total Orders</span>
          </div>

          {orders.length === 0 ? (
            <div className="empty-orders-farmer">
              <FaClipboardList className="empty-icon" />
              <h4>No Customer Orders Yet</h4>
              <p>Incoming customer orders from Mira Road and Bhayandar will appear here for harvest confirmation.</p>
            </div>
          ) : (
            <div className="farmer-orders-stack">
              {orders.map((ord) => {
                const ordId = ord.id || ord._id;
                const status = ord.order_status || ord.status || 'Pending';

                return (
                  <div key={ordId} className="farmer-order-ticket">
                    <div className="ticket-header-row">
                      <div className="ticket-id-block">
                        <span className="ticket-id">Order #{ordId}</span>
                        <span className="ticket-date">
                          {new Date(ord.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="ticket-status-block">
                        <span className={`status-pill-badge status-pill--${status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {status}
                        </span>
                      </div>
                    </div>

                    <div className="ticket-meta-grid">
                      <div className="ticket-meta-item">
                        <span className="meta-label">Delivery Address:</span>
                        <span className="meta-val"><FaMapMarkerAlt /> {ord.shipping_address || ord.shippingAddress}</span>
                      </div>
                      <div className="ticket-meta-item">
                        <span className="meta-label">Selected Delivery Window:</span>
                        <span className="meta-val"><FaClock /> {ord.delivery_time_slot || ord.deliveryTimeSlot || 'Morning 7-10 AM'}</span>
                      </div>
                      <div className="ticket-meta-item">
                        <span className="meta-label">Payment:</span>
                        <span className="meta-val">
                          <FaRupeeSign /> {formatCurrency(ord.total_amount || ord.totalAmount)} ({ord.payment_status || 'Paid'})
                        </span>
                      </div>
                    </div>

                    <div className="ticket-crops-list">
                      <span className="crops-list-title">Items to Harvest & Pack:</span>
                      <div className="crops-mini-tags">
                        {(ord.items || []).map((it, i) => (
                          <span key={i} className="crop-item-pill">
                            <strong>{it.name}</strong> × {it.quantity} {it.unit || 'kg'} ({formatCurrency((it.price || 0) * it.quantity)})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Order Progression Actions for the Farmer */}
                    <div className="ticket-actions-row">
                      <span className="action-instruction">Grower Fulfillment Actions:</span>
                      <div className="stage-actions-group">
                        {status === 'Pending' && (
                          <button
                            type="button"
                            className="btn btn--primary btn--sm"
                            onClick={() => handleUpdateOrderStatus(ordId, 'Accepted')}
                          >
                            <FaCheck /> 1. Accept Harvest Availability
                          </button>
                        )}

                        {status === 'Accepted' && (
                          <button
                            type="button"
                            className="btn btn--primary btn--sm"
                            onClick={() => handleUpdateOrderStatus(ordId, 'Preparing')}
                          >
                            <FaLeaf /> 2. Mark Harvested & Packed
                          </button>
                        )}

                        {status === 'Preparing' && (
                          <button
                            type="button"
                            className="btn btn--primary btn--sm"
                            onClick={() => handleUpdateOrderStatus(ordId, 'Ready')}
                          >
                            <FaTruck /> 3. Ready for Hub Dispatch
                          </button>
                        )}

                        {status === 'Ready' && (
                          <span className="status-note-ready">
                            ✓ Ready for Electric Van Loading at Mira Collection Hub
                          </span>
                        )}

                        {status === 'Out for Delivery' && (
                          <span className="status-note-transit">
                            🚚 Currently en route with Driver Sanjay Raut (Van #03)
                          </span>
                        )}

                        {status === 'Delivered' && (
                          <span className="status-note-delivered">
                            ✓ Successfully Handed Over to Consumer Doorstep
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Product Create / Edit Modal with ImageUpload */}
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
              className="modal modal--wide"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h3>{editingProduct ? 'Edit Harvest Produce Details' : 'List New Farm Harvest'}</h3>
              <p className="modal-subtext">Add pesticide-tested produce harvested directly from your Mira Bhayandar plot.</p>

              {formError && <div className="alert alert-error">{formError}</div>}

              <form className="product-form" onSubmit={handleFormSubmit}>
                <div className="form-grid-two">
                  <label>
                    Produce Name
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Fresh Desi Tomatoes"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </label>
                  <label>
                    Category
                    <select name="category" value={formData.category} onChange={handleFormChange}>
                      <option value="vegetables">Fresh Vegetables</option>
                      <option value="leafy_greens">Leafy Greens</option>
                      <option value="fruits">Farm Fruits</option>
                      <option value="grains">Grains & Pulses</option>
                      <option value="dairy">Dairy & Eggs</option>
                      <option value="spices">Spices & Seasoning</option>
                    </select>
                  </label>
                </div>

                <label>
                  Description
                  <textarea
                    name="description"
                    placeholder="Describe morning freshness, taste, and natural cultivation method..."
                    value={formData.description}
                    onChange={handleFormChange}
                    rows="3"
                    required
                  />
                </label>

                <div className="form-row-three">
                  <label>
                    Price (₹)
                    <input
                      type="number"
                      name="price"
                      step="1"
                      min="1"
                      placeholder="35"
                      value={formData.price}
                      onChange={handleFormChange}
                      required
                    />
                  </label>
                  <label>
                    Available Harvest Stock
                    <input
                      type="number"
                      name="stock"
                      min="1"
                      placeholder="50"
                      value={formData.stock}
                      onChange={handleFormChange}
                      required
                    />
                  </label>
                  <label>
                    Selling Unit
                    <select name="unit" value={formData.unit} onChange={handleFormChange}>
                      <option value="1 kg">1 kg</option>
                      <option value="500 g">500 g</option>
                      <option value="250 g bunch">250 g bunch</option>
                      <option value="1 dozen">1 dozen</option>
                      <option value="1 pc">1 pc</option>
                      <option value="1 Litre bottle">1 Litre bottle</option>
                      <option value="6 pcs pack">6 pcs pack</option>
                    </select>
                  </label>
                </div>

                <div className="form-grid-two">
                  <label>
                    Origin Farm Name / Village
                    <input
                      type="text"
                      name="originFarm"
                      placeholder="Uttan Coastal Agro Farm"
                      value={formData.originFarm}
                      onChange={handleFormChange}
                    />
                  </label>
                  <label>
                    Harvest Time Note
                    <input
                      type="text"
                      name="harvestDate"
                      placeholder="Today at 5:30 AM"
                      value={formData.harvestDate}
                      onChange={handleFormChange}
                    />
                  </label>
                </div>

                {/* Direct Image Upload Component */}
                <ImageUpload
                  value={formData.image}
                  onChange={(img) => setFormData(prev => ({ ...prev, image: img }))}
                  label="Produce Photo (Upload Camera/File or Enter URL)"
                />

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => { setShowForm(false); resetForm(); }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn--primary" disabled={saving}>
                    {saving ? 'Saving Crop Listing...' : (editingProduct ? 'Save Changes' : 'Publish Crop Listing')}
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
