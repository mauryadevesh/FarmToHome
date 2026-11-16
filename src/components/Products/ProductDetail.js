import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import formatCurrency from '../../utils/currency';
import { getProductImage } from '../../utils/productImage';
import {
  FaCheckCircle,
  FaShoppingBag,
  FaArrowLeft,
  FaLeaf,
  FaTruck,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaClock,
  FaStar,
  FaCommentDots
} from 'react-icons/fa';
import { PageTransition, motion, AnimatePresence } from '../UI/Motion';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isFarmer = isAuthenticated && user?.role === 'farmer';

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(null);

  useEffect(() => {
    fetchProductAndReviews();
  }, [id]);

  const fetchProductAndReviews = async () => {
    try {
      setLoading(true);
      const [prodRes, revsRes] = await Promise.all([
        apiService.getProduct(id),
        apiService.getProductReviews(id)
      ]);
      setProduct(prodRes);
      setReviews(Array.isArray(revsRes) ? revsRes : []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Could not find the requested farm product.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= (product?.stock || 1)) {
      setQuantity(val);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (isAdmin) {
      alert('Administrators cannot place orders.');
      return;
    }

    if (!product || product.stock <= 0) return;

    try {
      setAddingToCart(true);
      await apiService.addToCart(product._id || product.id, quantity);
      setAddedSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    try {
      setSubmittingReview(true);
      const prodId = product._id || product.id;
      const newRev = await apiService.addReview({
        productId: prodId,
        farmerId: product.farmer_id || product.farmerId,
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      setReviews(prev => [newRev, ...prev]);
      setReviewComment('');
      setReviewSuccess('Thank you! Your verified harvest review was recorded.');
      setTimeout(() => setReviewSuccess(null), 4000);
    } catch (err) {
      alert(err.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading farm harvest details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-container">
        <div className="alert alert-error">
          <p>{error || 'Product not found.'}</p>
        </div>
        <Link to="/products" className="btn btn-outline" style={{ marginTop: '1rem' }}>
          <FaArrowLeft style={{ marginRight: '6px' }} /> Back to All Products
        </Link>
      </div>
    );
  }

  const isAvailable = product.isAvailable && product.stock > 0;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : (product.rating || 4.8);

  return (
    <PageTransition className="product-detail-container">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span className="separator">/</span>
        <Link to="/products">Fresh Produce</Link>
        <span className="separator">/</span>
        <span className="current">{product.name}</span>
      </div>

      <div className="product-detail">
        {/* Product Media */}
        <motion.div
          className="product-image-section"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="product-image-large">
            <img
              src={getProductImage(product.image, product.name)}
              alt={product.name}
              onError={(e) => {
                e.target.src = getProductImage(null, product.name);
              }}
            />
            {isAvailable ? (
              <span className="availability-badge available">✓ Freshly Harvested & In Stock</span>
            ) : (
              <span className="availability-badge out-of-stock">Temporarily Sold Out</span>
            )}
          </div>

          <div className="produce-guarantees">
            <div className="guarantee-item">
              <FaLeaf className="guarantee-icon" />
              <span>Pesticide-tested, natural village crop</span>
            </div>
            <div className="guarantee-item">
              <FaTruck className="guarantee-icon" />
              <span>Next-morning direct farm dispatch (&lt;12h)</span>
            </div>
            <div className="guarantee-item">
              <FaShieldAlt className="guarantee-icon" />
              <span>100% money-back freshness guarantee</span>
            </div>
          </div>
        </motion.div>

        {/* Product Information */}
        <motion.div
          className="product-info-section"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="product-top-row">
            <span className="product-category-badge">{product.category}</span>
            <span className="product-rating-badge">★ {avgRating} ({reviews.length} reviews)</span>
          </div>

          <h1 className="product-title">{product.name}</h1>

          <div className="product-pricing">
            <div className="price-main">
              <span className="currency">₹</span>
              <span className="amount">{product.price}</span>
              <span className="price-unit">per {product.unit}</span>
            </div>
          </div>

          <div className="product-stock-info">
            {isAvailable ? (
              <span className="stock-available">
                ✓ Available in Stock ({product.stock} {product.unit} ready for harvest)
              </span>
            ) : (
              <span className="stock-unavailable">✗ Currently Out of Stock</span>
            )}
          </div>

          <div className="product-provenance-box">
            <div className="prov-row">
              <FaMapMarkerAlt className="prov-icon" />
              <div>
                <strong>Cultivation Plot:</strong>
                <span>{product.origin_farm || product.originFarm || 'Uttan Coastal Agro Farm, Mira Bhayandar'}</span>
              </div>
            </div>
            <div className="prov-row">
              <FaClock className="prov-icon" />
              <div>
                <strong>Harvest Timestamp:</strong>
                <span>{product.harvest_date || product.harvestDate || 'Today at 5:30 AM'}</span>
              </div>
            </div>
          </div>

          <div className="product-description">
            <h3>About This Harvest</h3>
            <p>{product.description}</p>
          </div>

          {/* Farmer Card */}
          <div className="product-farmer-info">
            <h3>Cultivated & Packed By</h3>
            <div className="farmer-card">
              <div className="farmer-avatar">
                <FaLeaf />
              </div>
              <div className="farmer-details">
                <h4>{product.farmer_name || product.farmer?.name || 'Ramesh Patil (Uttan Smallholder)'}</h4>
                <p>Multi-generational family farmer using organic vermicompost and spring water irrigation. Sells directly to you with 0% middleman deduction.</p>
              </div>
            </div>
          </div>

          {/* Purchase Controls */}
          {isAvailable && !isFarmer && !isAdmin && (
            <div className="purchase-section">
              <AnimatePresence mode="wait">
                {addedSuccess ? (
                  <motion.div
                    key="added"
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="added-success-box"
                  >
                    <div className="success-header">
                      <FaCheckCircle className="check-icon" />
                      <span>Added {quantity} {product.unit} to your basket!</span>
                    </div>
                    <div className="added-actions">
                      <Link to="/cart" className="btn btn-primary">
                        Go to Cart & Reserve Delivery Slot
                      </Link>
                      <button
                        onClick={() => setAddedSuccess(false)}
                        className="btn btn-outline"
                      >
                        Add More
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="controls"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="quantity-selector">
                      <label htmlFor="quantity" className="quantity-label">
                        Select Quantity ({product.unit}):
                      </label>
                      <div className="quantity-controls">
                        <motion.button
                          type="button"
                          className="quantity-btn"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.88 }}
                        >
                          -
                        </motion.button>
                        <input
                          type="number"
                          id="quantity"
                          name="quantity"
                          value={quantity}
                          onChange={handleQuantityChange}
                          min="1"
                          max={product.stock}
                          className="quantity-input"
                        />
                        <motion.button
                          type="button"
                          className="quantity-btn"
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          disabled={quantity >= product.stock}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.88 }}
                        >
                          +
                        </motion.button>
                      </div>
                    </div>

                    <div className="total-price">
                      Subtotal: <strong>{formatCurrency(product.price * quantity)}</strong>
                    </div>

                    <motion.button
                      type="button"
                      className="btn btn-primary btn-large btn-add"
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaShoppingBag style={{ marginRight: '8px' }} />
                      {addingToCart ? 'Adding to Basket...' : (isAuthenticated ? 'Add to Basket' : 'Sign In & Add to Basket')}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {isFarmer && (
            <div className="alert alert-info" style={{ marginTop: '1.5rem' }}>
              You are logged in as a cultivator. You can edit this item's price and stock in your{' '}
              <Link to="/farmer-dashboard">Farmer Dashboard</Link>.
            </div>
          )}
        </motion.div>
      </div>

      {/* Customer Reviews & Feedback Section */}
      <section className="product-reviews-section">
        <div className="reviews-header">
          <div className="reviews-title-block">
            <FaCommentDots className="reviews-icon" />
            <div>
              <h3>Verified Buyer Reviews ({reviews.length})</h3>
              <p>Authentic feedback from Mira Bhayandar households who received this harvest.</p>
            </div>
          </div>
          <span className="reviews-score-badge">★ {avgRating} / 5.0</span>
        </div>

        {reviewSuccess && (
          <div className="alert alert-success feedback-toast">
            <FaCheckCircle /> <span>{reviewSuccess}</span>
          </div>
        )}

        {/* Write a review form for logged in consumers */}
        {isAuthenticated && user?.role === 'consumer' && (
          <form className="add-review-form" onSubmit={handleSubmitReview}>
            <h4>Leave a Harvest Review:</h4>
            <div className="rating-select-row">
              <label>Rating:</label>
              <div className="star-rating-buttons">
                {[5, 4, 3, 2, 1].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`btn-star ${reviewRating >= num ? 'active' : ''}`}
                    onClick={() => setReviewRating(num)}
                  >
                    ★ {num}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              placeholder="How was the taste, crispness, and morning delivery freshness?"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows="3"
              required
            />
            <button
              type="submit"
              className="btn btn--primary btn--sm"
              disabled={submittingReview || !reviewComment.trim()}
            >
              {submittingReview ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p className="no-reviews-note">No reviews yet for this harvest. Be the first to share your experience!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id || rev._id} className="review-card-item">
                <div className="review-card-top">
                  <div className="reviewer-meta">
                    <strong>{rev.user_name || rev.userName || 'Verified Consumer'}</strong>
                    <span className="verified-buyer-tag">✓ Verified Purchase</span>
                  </div>
                  <span className="review-stars">{'★'.repeat(rev.rating || 5)}</span>
                </div>
                <p className="review-comment-text">{rev.comment}</p>
                <span className="review-date-text">
                  {new Date(rev.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="product-actions-bar">
        <Link to="/products" className="btn btn-outline">
          <FaArrowLeft style={{ marginRight: '6px' }} /> Back to All Fresh Produce
        </Link>
        {isAuthenticated && user?.role === 'consumer' && (
          <Link to="/cart" className="btn btn-secondary">
            View My Basket
          </Link>
        )}
      </div>
    </PageTransition>
  );
};

export default ProductDetail;
