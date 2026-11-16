import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { getProductImage } from '../../utils/productImage';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../UI/Motion';
import ProductSkeletonGrid from '../UI/ProductSkeleton';
import {
  FaSearch,
  FaFilter,
  FaShoppingBag,
  FaLeaf,
  FaTimes,
  FaSignInAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaSortAmountDown,
  FaSort,
  FaMapMarkerAlt,
  FaClock
} from 'react-icons/fa';

const ALL_CATEGORIES = [
  { value: '', label: 'All categories' },
  { value: 'vegetables', label: 'Fresh vegetables' },
  { value: 'leafy_greens', label: 'Leafy greens' },
  { value: 'fruits', label: 'Farm fruits' },
  { value: 'grains', label: 'Grains & pulses' },
  { value: 'dairy', label: 'Dairy & eggs' },
  { value: 'spices', label: 'Spices & seasoning' },
];

const ProductList = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingProductId, setAddingProductId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';
  const initialFarmer = searchParams.get('farmerId') || '';

  const [filters, setFilters] = useState({
    category: initialCategory,
    search: initialSearch,
    farmerId: initialFarmer,
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const { isAuthenticated, user } = useAuth();
  const isFarmer = isAuthenticated && user?.role === 'farmer';
  const isAdmin = isAuthenticated && user?.role === 'admin';

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category') || '';
    const q = params.get('search') || '';
    const fId = params.get('farmerId') || '';
    setFilters(prev => ({
      ...prev,
      category: cat,
      search: q,
      farmerId: fId
    }));
  }, [location.search]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3500);
    return () => clearTimeout(timer);
  }, [feedback]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts();
      setAllProducts(Array.isArray(response) ? response : []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Unable to load produce from farms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      farmerId: '',
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  const handleAddToCart = async (product) => {
    if (isAdmin) {
      setFeedback({ type: 'error', message: 'Administrator accounts cannot purchase items.' });
      return;
    }

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const prodId = product._id || product.id;
    try {
      setAddingProductId(prodId);
      await apiService.addToCart(prodId, 1);
      setFeedback({
        type: 'success',
        message: `Added 1 ${product.unit || 'kg'} of fresh ${product.name} to your basket!`
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Could not add to cart.' });
    } finally {
      setAddingProductId(null);
    }
  };

  // Filter and sort locally
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (filters.category) {
      result = result.filter(p => p.category?.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.farmerId) {
      result = result.filter(p =>
        p.farmer_id === filters.farmerId ||
        p.farmerId === filters.farmerId ||
        p.farmer?.id === filters.farmerId ||
        p.farmer?._id === filters.farmerId
      );
    }

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.origin_farm?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let aVal = a[filters.sortBy];
      let bVal = b[filters.sortBy];

      if (filters.sortBy === 'price') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [allProducts, filters]);

  const hasActiveFilters = Boolean(filters.category || filters.search || filters.farmerId);

  return (
    <PageTransition className="product-list-container">
      {/* Page Header */}
      <div className="product-list-header">
        <span className="section-label">Direct Harvest Catalog</span>
        <h1>Local Farm Produce • Mira Bhayandar</h1>
        <p>Harvested fresh from Uttan, Chena Creek, and Rai-Morva. 0% middleman markups and guaranteed morning dispatch.</p>
      </div>

      {isFarmer && (
        <div className="farmer-callout">
          <div>
            <h3>
              <FaLeaf style={{ marginRight: '8px', color: 'var(--brand)', verticalAlign: 'middle' }} />
              You are logged in as a Cultivator
            </h3>
            <p>
              Looking to list new harvest crops, change unit prices, or update stock? Manage your listings in the Farmer Dashboard.
            </p>
          </div>
          <div className="farmer-callout-actions">
            <Link to="/farmer-dashboard" className="btn btn-primary">
              Manage Farm Inventory
            </Link>
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div className={`alert ${feedback.type === 'error' ? 'alert-error' : 'alert-success'} feedback-toast`}>
          {feedback.type === 'success' ? <FaCheckCircle style={{ marginRight: '8px' }} /> : <FaExclamationCircle style={{ marginRight: '8px' }} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Guest Sign-in Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              className="auth-prompt-modal"
              data-lenis-prevent
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="modal-close-btn" onClick={() => setShowAuthModal(false)} aria-label="Close modal">
                <FaTimes />
              </button>
              <div className="modal-icon-badge">
                <FaShoppingBag />
              </div>
              <h3>Sign in to Add to Cart</h3>
              <p>
                Please log in or create a quick Farm2Home consumer account to add items to your basket and enjoy doorstep delivery.
              </p>
              <div className="modal-actions">
                <Link to="/login" className="btn btn-primary btn-block">
                  <FaSignInAlt style={{ marginRight: '6px' }} />
                  Login to Continue
                </Link>
                <Link to="/register" state={{ role: 'consumer' }} className="btn btn-outline btn-block">
                  Register New Account
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Toolbar */}
      <div className="filters-section">
        {/* Category Navigation Pills */}
        <div className="category-pills-bar" role="tablist" aria-label="Category Filter">
          {ALL_CATEGORIES.map(cat => {
            const isSelected = (filters.category || '').toLowerCase() === cat.value.toLowerCase();
            return (
              <button
                key={cat.value}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`category-pill-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, category: cat.value }))}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeCategoryPill"
                    className="category-pill-active-bg"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}
                <span className="category-pill-text">{cat.label}</span>
              </button>
            );
          })}
        </div>

        <div className="filters-grid">
          <div className="filter-group search-group">
            <label htmlFor="search" className="filter-label">
              <FaSearch className="filter-label-icon" /> Search Produce
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="filter-input"
              placeholder="e.g. Tomato, Palak, Methi, Mango, Milk..."
            />
          </div>

          <div className="filter-group">
            <label htmlFor="category" className="filter-label">
              <FaFilter className="filter-label-icon" /> Category
            </label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="filter-input"
            >
              {ALL_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sortBy" className="filter-label">
              <FaSortAmountDown className="filter-label-icon" /> Sort By
            </label>
            <select
              id="sortBy"
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="filter-input"
            >
              <option value="name">Product Name (A-Z)</option>
              <option value="price">Price (₹)</option>
              <option value="stock">Stock Available</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sortOrder" className="filter-label">
              <FaSort className="filter-label-icon" /> Order By
            </label>
            <select
              id="sortOrder"
              name="sortOrder"
              value={filters.sortOrder}
              onChange={handleFilterChange}
              className="filter-input"
            >
              <option value="asc">Ascending (Low to High)</option>
              <option value="desc">Descending (High to Low)</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="active-filters-bar">
            <span>
              Showing {filteredProducts.length} of {allProducts.length} items
              {filters.category ? ` in ${filters.category}` : ''}
              {filters.search ? ` matching "${filters.search}"` : ''}
              {filters.farmerId ? ' from selected cultivator' : ''}
            </span>
            <button onClick={clearFilters} className="btn btn-outline btn-sm clear-filter-btn">
              <FaTimes style={{ marginRight: '4px' }} /> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="catalog-loading-wrapper">
          <div className="catalog-loading-meta">
            <span className="live-pulse-dot" />
            <span>Fetching fresh field inventory from local village cultivators...</span>
          </div>
          <ProductSkeletonGrid count={8} />
        </div>
      )}

      {error && !loading && (
        <div className="alert alert-error">
          <p>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={fetchProducts} style={{ marginTop: '8px' }}>
            Retry Loading
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && (
        <>
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">
                <FaLeaf />
              </div>
              <h3>No Produce Found</h3>
              <p>We couldn't find any farm items matching your current search or category filter.</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn btn-primary" style={{ marginTop: '12px' }}>
                  Show All Produce
                </button>
              )}
            </div>
          ) : (
            <motion.div layout className="products-grid">
              {filteredProducts.map(product => {
                const prodId = product._id || product.id;
                const isAdding = addingProductId === prodId;
                const isOutOfStock = product.stock <= 0;

                return (
                  <motion.div
                    layout
                    key={prodId}
                    className="product-card"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="product-image">
                      <img
                        src={getProductImage(product.image, product.name)}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = getProductImage(null, product.name);
                        }}
                      />
                      {isOutOfStock ? (
                        <span className="availability-badge out-of-stock">Sold Out</span>
                      ) : (
                        <span className="availability-badge available">✓ Fresh in Stock</span>
                      )}
                      <span className="product-card-rating">★ {product.rating || 4.8}</span>
                    </div>

                    <div className="product-info">
                      <div className="product-top-meta">
                        <span className="product-category-tag">{product.category}</span>
                        <span className="product-stock-tag">{product.stock} {product.unit} left</span>
                      </div>

                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-description">{product.description}</p>

                      <div className="product-farmer">
                        <FaMapMarkerAlt className="farmer-icon" />
                        <span className="farmer-name">
                          {product.origin_farm || product.farmer_name || product.farmer?.name || 'Uttan Agro Farm'}
                        </span>
                      </div>

                      <div className="product-harvest-time">
                        <FaClock style={{ fontSize: '11px', marginRight: '4px' }} />
                        <span>{product.harvest_date || 'Harvested 5:30 AM'}</span>
                      </div>

                      <div className="product-pricing-bar">
                        <div className="price-box">
                          <span className="currency-symbol">₹</span>
                          <span className="price-amount">{product.price}</span>
                          <span className="price-unit">/{product.unit}</span>
                        </div>
                      </div>

                      <div className="product-actions">
                        <Link to={`/products/${prodId}`} className="btn btn-outline btn-details">
                          View Details
                        </Link>
                        {!isFarmer && !isAdmin && (
                          <motion.button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            disabled={isAdding || isOutOfStock}
                            className={`btn btn-primary btn-add-cart ${isAdding ? 'loading' : ''}`}
                            title={isOutOfStock ? 'Currently out of stock' : 'Add 1 unit to cart'}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.96 }}
                          >
                            <FaShoppingBag style={{ marginRight: '6px' }} />
                            {isAdding ? 'Adding...' : (isOutOfStock ? 'Out of Stock' : 'Add to Cart')}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </>
      )}
    </PageTransition>
  );
};

export default ProductList;
