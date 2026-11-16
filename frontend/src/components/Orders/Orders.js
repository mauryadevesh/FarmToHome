import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import apiService from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { getProductImage } from '../../utils/productImage';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const location = useLocation();
  const [orderSuccess, setOrderSuccess] = useState(Boolean(location.state?.orderSuccess));

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
    <div className="orders-container">
      <div className="orders-header">
        <h1>My Orders</h1>
        <p>Track every farm-fresh purchase</p>
      </div>

      {orderSuccess && (
        <div className="alert alert-success">
          Your order successfully placed. Thank you!
        </div>
      )}

      <div className="orders-content">
        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-orders-icon">📦</div>
            <h2>No orders yet</h2>
            <p>Start ordering fresh produce from local farmers!</p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id || order.id} className="order-card">
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
                  </div>
                  <div className="order-meta-actions">
                    <span className="order-label">Status</span>
                    <span className={`order-status ${order.status || 'pending'}`}>{order.status || 'Pending'}</span>
                    {['ordered', 'pending', 'processing', 'shipped'].includes(order.status) && (
                      <button
                        className="btn btn-outline"
                        onClick={() => handleCancel(order._id || order.id)}
                        disabled={cancellingId === (order._id || order.id)}
                      >
                        {cancellingId === (order._id || order.id) ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCancelPopup && (
        <div className="modal-overlay success">
          <div className="modal success">
            <h3>Your order cancelled successfully</h3>
            <p>Thank you</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
