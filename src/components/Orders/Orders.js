import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import apiService from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { getProductImage } from '../../utils/productImage';
import { FaBoxOpen } from 'react-icons/fa';
import { PageTransition, motion, AnimatePresence } from '../UI/Motion';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const location = useLocation();
  const [orderSuccess] = useState(Boolean(location.state?.orderSuccess));

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (location.state?.orderSuccess) {
      window.history.replaceState({ ...window.history.state, usr: { ...location.state, orderSuccess: false } }, '', window.location.pathname);
    }
  }, [location.state]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOrders();
      setOrders(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    try {
      setCancellingId(orderId);
      await apiService.cancelOrder(orderId);
      await fetchOrders();
      setShowCancelPopup(true);
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    if (!showCancelPopup) return;
    const timer = setTimeout(() => setShowCancelPopup(false), 2000);
    return () => clearTimeout(timer);
  }, [showCancelPopup]);

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading">Loading your orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-primary" onClick={fetchOrders}>Retry</button>
      </div>
    );
  }

  return (
    <PageTransition className="orders-container">
      <div className="orders-header">
        <h1>My Orders</h1>
        <p>Track every farm-fresh purchase</p>
      </div>

      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="alert alert-success"
          >
            Your order successfully placed. Thank you!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="orders-content">
        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-orders-icon">
              <FaBoxOpen />
            </div>
            <h2>No orders yet</h2>
            <p>Start ordering fresh produce from local farmers!</p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            <AnimatePresence>
              {orders.map((order, idx) => (
                <motion.div
                  key={order._id || order.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                  className="order-card"
                >
                  <div className="order-card-header">
                    <div>
                      <span className="order-label">Order ID</span>
                      <p className="order-id">#{(order._id || order.id || 'ORD000').toString().slice(-6).toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="order-label">Placed on</span>
                      <p>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div>
                      <span className="order-label">Total</span>
                      <p className="order-total">{formatCurrency(order.totalAmount || 0)}</p>
                    </div>
                  </div>

                  <div className="order-items">
                    {(order.items || []).map(item => (
                      <div key={item._id || item.productId} className="order-item">
                        <div className="order-item-media">
                          <img
                            src={getProductImage(item.image || item.product?.image, item.name)}
                            alt={item.name}
                            onError={(e) => {
                              e.target.src = getProductImage(null, item.name);
                            }}
                          />
                        </div>
                        <div className="order-item-info">
                          <h3>{item.name}</h3>
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: {formatCurrency(item.price)} / {item.unit || item.product?.unit || 'unit'}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-meta">
                    <div>
                      <span className="order-label">Shipping Address</span>
                      <p>{order.shippingAddress || 'Not provided'}</p>
                      {order.deliveryTimeSlot && (
                        <p style={{ marginTop: '4px', fontSize: '0.85rem', color: '#1b4d29', fontWeight: 600 }}>
                          🕒 Slot: {order.deliveryTimeSlot} ({order.deliveryDate || 'Scheduled'})
                        </p>
                      )}
                    </div>
                    <div className="order-meta-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="order-label">Status</span>
                      <span className={`order-status ${order.status || 'pending'}`}>{order.status || 'Pending'}</span>
                      <Link
                        to={`/tracking?orderId=${order._id || order.id}`}
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.85rem', borderColor: '#236838', color: '#236838', fontWeight: 600 }}
                      >
                        🚚 Track Delivery
                      </Link>
                      {['ordered', 'pending', 'accepted'].includes(order.status?.toLowerCase()) && (
                        <button
                          className="btn btn-outline"
                          onClick={() => handleCancel(order._id || order.id)}
                          disabled={cancellingId === (order._id || order.id)}
                          style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                        >
                          {cancellingId === (order._id || order.id) ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCancelPopup && (
          <motion.div
            className="modal-overlay success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-lenis-prevent
          >
            <motion.div
              className="modal success"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
            >
              <h3>Your order cancelled successfully</h3>
              <p>Thank you</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default Orders;
