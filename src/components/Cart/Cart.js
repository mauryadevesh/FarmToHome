import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { getProductImage } from '../../utils/productImage';
import { FaTrashAlt, FaShoppingBasket, FaTruck, FaMoneyBillWave, FaMobileAlt, FaArrowRight, FaCheckCircle, FaExclamationCircle, FaLeaf } from 'react-icons/fa';
import { PageTransition, motion, AnimatePresence } from '../UI/Motion';

const Cart = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [checkoutMessage, setCheckoutMessage] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [placingOrder, setPlacingOrder] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
    if (user?.address) {
      setShippingAddress(user.address);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCart();
      setCart({ items: Array.isArray(response) ? response : (response?.items || []) });
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load your cart');
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      setUpdatingItemId(itemId);
      await apiService.updateCartItem(itemId, quantity);
      await fetchCart();
    } catch (err) {
      setError(err.message || 'Could not update item quantity');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setUpdatingItemId(itemId);
      await apiService.removeFromCart(itemId);
      await fetchCart();
    } catch (err) {
      setError(err.message || 'Could not remove item');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleCheckoutClick = () => {
    if (!shippingAddress.trim()) {
      setCheckoutMessage({ type: 'error', text: 'Please enter a shipping address before completing order.' });
      return;
    }
    setShowPaymentOptions(true);
    setCheckoutMessage(null);
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      setCheckoutMessage({ type: 'error', text: 'Shipping address is required.' });
      return;
    }

    try {
      setPlacingOrder(true);
      await apiService.createOrder({
        shippingAddress: shippingAddress.trim(),
        paymentMethod: selectedPayment
      });
      await fetchCart();
      navigate('/orders', { state: { orderSuccess: true } });
    } catch (err) {
      setCheckoutMessage({ type: 'error', text: err.message || 'Order could not be placed. Please try again.' });
    } finally {
      setPlacingOrder(false);
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      const price = item.price || item.product?.price || 0;
      return total + price * (item.quantity || 1);
    }, 0);
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your fresh basket...</p>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const grandTotal = calculateTotal();

  if (items.length === 0) {
    return (
      <PageTransition className="cart-container">
        <div className="cart-header">
          <h1>My Fresh Produce Basket</h1>
          <p>Review items directly sourced from local family farms.</p>
        </div>

        <div className="cart-empty">
          <div className="empty-cart-icon">
            <FaShoppingBasket />
          </div>
          <h2>Your basket is empty</h2>
          <p>Pick some crispy vegetables, farm fruits, or fresh milk straight from local cultivators!</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            <FaShoppingBasket style={{ marginRight: '8px' }} />
            Browse Fresh Produce
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="cart-container">
      <div className="cart-header">
        <h1>My Fresh Produce Basket</h1>
        <p>Direct farm items reserved for your household delivery.</p>
      </div>

      <AnimatePresence>
        {checkoutMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`alert ${checkoutMessage.type === 'error' ? 'alert-error' : 'alert-success'}`}
          >
            {checkoutMessage.type === 'error' ? <FaExclamationCircle style={{ marginRight: '6px' }} /> : <FaCheckCircle style={{ marginRight: '6px' }} />}
            {checkoutMessage.text}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="alert alert-error"
          >
            <FaExclamationCircle style={{ marginRight: '6px' }} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="cart-layout">
        {/* Cart Items List */}
        <div className="cart-items-section">
          <AnimatePresence initial={false}>
            {items.map(item => {
              const product = item.product || {};
              const itemId = item._id || product._id || product.id;
              const price = item.price || product.price || 0;
              const qty = item.quantity || 1;
              const unit = product.unit || item.unit || 'unit';
              const isUpdating = updatingItemId === itemId;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
                  key={itemId}
                  className="cart-item-card"
                >
                  <div className="cart-item-image">
                    <img
                      src={getProductImage(product.image, product.name)}
                      alt={product.name || 'Produce'}
                      onError={(e) => {
                        e.target.src = getProductImage(null, product.name);
                      }}
                    />
                  </div>

                  <div className="cart-item-info">
                    <div className="item-title-row">
                      <h3>{product.name || 'Farm Produce'}</h3>
                      <motion.button
                        type="button"
                        className="btn-remove-item"
                        onClick={() => handleRemoveItem(itemId)}
                        disabled={isUpdating}
                        title="Remove from basket"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaTrashAlt />
                      </motion.button>
                    </div>

                    <p className="item-farmer">
                      <FaLeaf style={{ marginRight: '6px', color: 'var(--brand)', verticalAlign: 'middle' }} />
                      Cultivated by: <strong>{product.farmer?.name || 'Local Verified Farmer'}</strong>
                    </p>

                    <div className="item-pricing-row">
                      <span className="unit-price">₹{price} / {unit}</span>
                      <span className="item-total">Item Total: <strong>₹{price * qty}</strong></span>
                    </div>

                    <div className="cart-quantity-row">
                      <div className="quantity-controls">
                        <motion.button
                          type="button"
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(itemId, qty - 1)}
                          disabled={qty <= 1 || isUpdating}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.88 }}
                        >
                          -
                        </motion.button>
                        <span className="quantity-display">{qty}</span>
                        <motion.button
                          type="button"
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(itemId, qty + 1)}
                          disabled={isUpdating}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.88 }}
                        >
                          +
                        </motion.button>
                      </div>
                      <span className="quantity-unit-label">{unit}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <div className="cart-actions-row">
            <Link to="/products" className="btn btn-outline">
              ← Add More Produce
            </Link>
          </div>
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="cart-summary-card">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Items Count:</span>
            <span>{items.length} items</span>
          </div>

          <div className="summary-row">
            <span>Produce Subtotal:</span>
            <span>₹{grandTotal}</span>
          </div>

          <div className="summary-row">
            <span>Direct Farm Delivery:</span>
            <span className="free-badge">FREE (Promotional)</span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row total-row">
            <span>Total Payable:</span>
            <span className="grand-total">₹{grandTotal}</span>
          </div>

          <div className="shipping-address-box">
            <label htmlFor="shippingAddress" className="form-label">
              <FaTruck style={{ marginRight: '6px', color: 'var(--color-accent)' }} />
              Delivery Address:
            </label>
            <textarea
              id="shippingAddress"
              rows="3"
              className="form-input"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter full flat/house number, street name, pincode..."
            />
          </div>

          <AnimatePresence mode="wait">
            {showPaymentOptions ? (
              <motion.div
                key="payment"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="payment-options-block"
              >
                <h3>Choose Payment Method:</h3>
                <div className="payment-radios">
                  <label className={`payment-radio-label ${selectedPayment === 'cod' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={selectedPayment === 'cod'}
                      onChange={() => setSelectedPayment('cod')}
                    />
                    <FaMoneyBillWave className="payment-icon" />
                    <div>
                      <strong>Cash on Delivery (COD)</strong>
                      <p>Pay when you inspect fresh produce at your door</p>
                    </div>
                  </label>

                  <label className={`payment-radio-label ${selectedPayment === 'upi' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={selectedPayment === 'upi'}
                      onChange={() => setSelectedPayment('upi')}
                    />
                    <FaMobileAlt className="payment-icon" />
                    <div>
                      <strong>UPI / QR Code</strong>
                      <p>Google Pay, PhonePe, Paytm upon arrival</p>
                    </div>
                  </label>
                </div>

                <motion.button
                  type="button"
                  className="btn btn-primary btn-full btn-place-order"
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {placingOrder ? 'Confirming Order with Farmers...' : `Confirm & Place Order (₹${grandTotal})`}
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                key="checkout-btn"
                type="button"
                className="btn btn-primary btn-full btn-checkout"
                onClick={handleCheckoutClick}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span>Proceed to Checkout</span>
                <FaArrowRight style={{ marginLeft: '8px' }} />
              </motion.button>
            )}
          </AnimatePresence>

          <div className="harvest-note">
            <FaCheckCircle style={{ marginRight: '6px', color: 'var(--brand)', verticalAlign: 'middle' }} />
            <strong>Harvest Guarantee:</strong> If any item is bruised or unsatisfactory, get an instant replacement or refund.
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Cart;
