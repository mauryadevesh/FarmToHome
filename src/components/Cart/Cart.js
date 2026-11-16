import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { getProductImage } from '../../utils/productImage';
import formatCurrency from '../../utils/currency';
import {
  FaTrashAlt,
  FaShoppingBasket,
  FaTruck,
  FaMoneyBillWave,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationCircle,
  FaLeaf,
  FaClock,
  FaCalendarAlt,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { PageTransition, motion, AnimatePresence } from '../UI/Motion';

const MIRA_AREAS = [
  'Mira Road East (Beverly Park / Kanakia)',
  'Mira Road East (Sheetal Nagar / Shanti Park)',
  'Mira Road East (Pleasant Park / Jangid)',
  'Bhayandar West (150ft Rd / Maxus Mall)',
  'Bhayandar West (Venkateshwar Nagar)',
  'Bhayandar East (Navghar / Indralok)',
  'Uttan Coastal Village Belt'
];

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [checkoutMessage, setCheckoutMessage] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Delivery Scheduling & Address State
  const todayStr = new Date().toISOString().split('T')[0];
  const tmrwStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [selectedArea, setSelectedArea] = useState(MIRA_AREAS[0]);
  const [flatBuilding, setFlatBuilding] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('401107');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const fetchSlotsForDate = useCallback(async (date) => {
    try {
      setSlotsLoading(true);
      const slots = await apiService.getDeliverySlots(date);
      setAvailableSlots(slots || []);
      const firstAvailable = (slots || []).find(s => !s.is_full);
      if (firstAvailable) {
        setSelectedSlotId(firstAvailable.id || firstAvailable._id);
      }
    } catch (err) {
      console.error('Error fetching delivery slots:', err);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  const fetchCart = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchCart();
    fetchSlotsForDate(todayStr);
    if (user?.address) {
      setFlatBuilding(user.address);
    }
  }, [user, todayStr, fetchCart, fetchSlotsForDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchSlotsForDate(date);
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

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      const price = item.price || item.product?.price || 0;
      return total + price * (item.quantity || 1);
    }, 0);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!flatBuilding.trim()) {
      setCheckoutMessage({ type: 'error', text: 'Please enter your flat number and building name.' });
      return;
    }

    const chosenSlot = availableSlots.find(s => (s.id || s._id) === selectedSlotId);
    if (!chosenSlot) {
      setCheckoutMessage({ type: 'error', text: 'Please select an available delivery slot.' });
      return;
    }

    if (chosenSlot.is_full) {
      setCheckoutMessage({ type: 'error', text: 'Selected delivery slot is fully booked. Please choose another slot.' });
      return;
    }

    const fullShippingAddress = `${flatBuilding.trim()}, ${landmark ? landmark.trim() + ', ' : ''}${selectedArea}, Mira Bhayandar ${pincode}`;

    try {
      setPlacingOrder(true);
      const newOrder = await apiService.createOrder({
        shippingAddress: fullShippingAddress,
        deliverySlotId: selectedSlotId,
        deliveryDate: selectedDate,
        deliveryTimeSlot: chosenSlot.time_window || chosenSlot.timeWindow,
        paymentMethod
      });

      await fetchCart();
      const orderId = newOrder?.id || newOrder?._id;
      navigate(`/tracking?orderId=${orderId}`, { state: { orderSuccess: true } });
    } catch (err) {
      setCheckoutMessage({ type: 'error', text: err.message || 'Order could not be placed. Please try again.' });
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your farm harvest basket...</p>
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
          <span className="section-label">Direct Farm Sourcing</span>
          <h1>My Fresh Produce Basket</h1>
          <p>Review items reserved directly from local cultivators in Mira Bhayandar.</p>
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
        <span className="section-label">Direct Farm Sourcing</span>
        <h1>My Fresh Produce Basket</h1>
        <p>Harvest items reserved from local cultivators in Mira Bhayandar.</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaExclamationCircle />
          <span>{error}</span>
        </div>
      )}

      <AnimatePresence>
        {checkoutMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`alert ${checkoutMessage.type === 'error' ? 'alert-error' : 'alert-success'} feedback-toast`}
          >
            {checkoutMessage.type === 'error' ? <FaExclamationCircle /> : <FaCheckCircle />}
            <span>{checkoutMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="cart-layout-grid">
        {/* Left Column: Basket Items */}
        <div className="cart-items-column">
          <div className="cart-table-wrapper">
            <table className="cart-items-table">
              <thead>
                <tr>
                  <th>Produce</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const itemId = item.id || item._id;
                  const prod = item.product || {};
                  const isUpdating = updatingItemId === itemId;
                  const itemPrice = prod.price || item.price || 0;
                  const lineTotal = itemPrice * item.quantity;

                  return (
                    <tr key={itemId} className="cart-item-row">
                      <td className="item-produce-cell">
                        <img
                          src={getProductImage(prod.image, prod.name)}
                          alt={prod.name}
                          className="cart-thumb-img"
                        />
                        <div className="item-meta">
                          <span className="item-name">{prod.name}</span>
                          <span className="item-farmer">
                            <FaLeaf /> {prod.origin_farm || 'Uttan / Chena Farm'}
                          </span>
                        </div>
                      </td>

                      <td className="item-price-cell">
                        {formatCurrency(itemPrice)} <small>/ {prod.unit || 'kg'}</small>
                      </td>

                      <td className="item-qty-cell">
                        <div className="cart-qty-controls">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => handleQuantityChange(itemId, item.quantity - 1)}
                            disabled={isUpdating || item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => handleQuantityChange(itemId, item.quantity + 1)}
                            disabled={isUpdating || item.quantity >= (prod.stock || 50)}
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="item-subtotal-cell">
                        <strong>{formatCurrency(lineTotal)}</strong>
                      </td>

                      <td className="item-remove-cell">
                        <button
                          type="button"
                          className="btn-remove-item"
                          onClick={() => handleRemoveItem(itemId)}
                          disabled={isUpdating}
                          title="Remove item from basket"
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="cart-extra-note">
            <FaTruck />
            <span>
              Orders placed before 9:00 PM are harvested at 5:00 AM the following morning and delivered within your selected window.
            </span>
          </div>
        </div>

        {/* Right Column: Checkout & Delivery Scheduling */}
        <div className="cart-checkout-column">
          <div className="checkout-card">
            <h3 className="checkout-card-title">Order & Delivery Scheduling</h3>

            {/* Price Summary */}
            <div className="summary-breakdown">
              <div className="summary-row">
                <span>Subtotal ({items.length} crops):</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
              <div className="summary-row">
                <span>Direct Delivery (Mira Bhayandar):</span>
                <span className="free-tag">FREE (Launch Offer)</span>
              </div>
              <div className="summary-row">
                <span>Intermediary Commission:</span>
                <span className="strike-tag">₹0 (Zero Markup)</span>
              </div>
              <div className="summary-total-row">
                <span>Grand Total:</span>
                <span className="total-amount-highlight">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Delivery Date Selection */}
            <div className="checkout-step-block">
              <label className="step-label">
                <FaCalendarAlt /> 1. Select Delivery Date:
              </label>
              <div className="date-toggle-pills">
                <button
                  type="button"
                  className={`date-pill ${selectedDate === todayStr ? 'active' : ''}`}
                  onClick={() => handleDateChange(todayStr)}
                >
                  Today ({new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
                </button>
                <button
                  type="button"
                  className={`date-pill ${selectedDate === tmrwStr ? 'active' : ''}`}
                  onClick={() => handleDateChange(tmrwStr)}
                >
                  Tomorrow ({new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
                </button>
              </div>
            </div>

            {/* Delivery Time Slot Selection (Overbooking Protection) */}
            <div className="checkout-step-block">
              <div className="step-head-wrap">
                <label className="step-label">
                  <FaClock /> 2. Delivery Time Slot:
                </label>
                <span className="capacity-note">Capacity Guard Active</span>
              </div>

              {slotsLoading ? (
                <div className="slots-loading-text">Checking slot availability...</div>
              ) : (
                <div className="slot-cards-group">
                  {availableSlots.map((slot) => {
                    const slotId = slot.id || slot._id;
                    const isSelected = selectedSlotId === slotId;
                    const spotsLeft = slot.available_capacity !== undefined ? slot.available_capacity : (slot.max_capacity - slot.booked_count);
                    const isFull = slot.is_full || spotsLeft <= 0;

                    return (
                      <div
                        key={slotId}
                        onClick={() => !isFull && setSelectedSlotId(slotId)}
                        className={`slot-card-option ${isSelected ? 'selected' : ''} ${isFull ? 'disabled-full' : ''}`}
                      >
                        <div className="slot-card-left">
                          <input
                            type="radio"
                            name="deliverySlot"
                            checked={isSelected}
                            disabled={isFull}
                            onChange={() => setSelectedSlotId(slotId)}
                          />
                          <div className="slot-meta">
                            <span className="slot-time-bold">{slot.time_window || slot.timeWindow}</span>
                            <span className="slot-window-name">{slot.label || 'Harvest Dispatch'}</span>
                          </div>
                        </div>

                        <div className="slot-card-right">
                          {isFull ? (
                            <span className="badge-slot-full">Full (Overbooking Guard)</span>
                          ) : (
                            <span className={`badge-slot-available ${spotsLeft <= 5 ? 'almost-full' : ''}`}>
                              {spotsLeft} spots remaining
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Delivery Address in Mira Bhayandar */}
            <div className="checkout-step-block">
              <label className="step-label">
                <FaMapMarkerAlt /> 3. Mira Bhayandar Address:
              </label>

              <div className="form-group-compact">
                <label>Area / Sector:</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="input-compact"
                >
                  {MIRA_AREAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div className="form-group-compact">
                <label>Flat / Building / Wing:</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 402, Beverly Park Tower A"
                  value={flatBuilding}
                  onChange={(e) => setFlatBuilding(e.target.value)}
                  className="input-compact"
                  required
                />
              </div>

              <div className="form-row-compact">
                <div className="form-group-compact">
                  <label>Landmark:</label>
                  <input
                    type="text"
                    placeholder="Near Cinemax"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="input-compact"
                  />
                </div>
                <div className="form-group-compact" style={{ width: '100px' }}>
                  <label>Pincode:</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="input-compact"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="checkout-step-block">
              <label className="step-label">
                <FaMoneyBillWave /> 4. Payment Method:
              </label>
              <div className="payment-options-grid">
                <label className={`payment-pill-card ${paymentMethod === 'cod' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <span>Cash on Delivery (Verify upon arrival)</span>
                </label>
                <label className={`payment-pill-card ${paymentMethod === 'upi' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                  />
                  <span>Instant UPI / QR Scanner</span>
                </label>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={placingOrder || !selectedSlotId}
              className="btn btn--primary btn--full btn--checkout"
            >
              {placingOrder ? 'Confirming Harvest Order...' : `Place Farm Harvest Order • ${formatCurrency(grandTotal)}`}
              <FaArrowRight style={{ marginLeft: '8px' }} />
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Cart;
