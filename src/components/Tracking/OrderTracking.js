import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { getProductImage } from '../../utils/productImage';
import { PageTransition, motion, AnimatePresence } from '../UI/Motion';

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOrders();
      setOrders(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await apiService.put(`/api/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };


  const getStatusSteps = (status) => {
    const steps = [
      { key: 'ordered', label: 'Ordered', completed: ['ordered', 'processing', 'shipped', 'out_for_delivery', 'delivered'].includes(status) },
      { key: 'processing', label: 'Processing', completed: ['processing', 'shipped', 'out_for_delivery', 'delivered'].includes(status) },
      { key: 'out_for_delivery', label: 'Out for Delivery', completed: ['out_for_delivery', 'delivered'].includes(status) },
      { key: 'delivered', label: 'Delivered', completed: ['delivered'].includes(status) }
    ];
    return steps;
  };

  const getNextStatus = (currentStatus) => {
    const transitions = {
      'ordered': 'processing',
      'pending': 'processing',
      'processing': 'out_for_delivery',
      'shipped': 'out_for_delivery',
      'out_for_delivery': 'delivered',
      'delivered': null,
      'cancelled': null
    };
    return transitions[currentStatus];
  };

  if (loading) {
    return (
      <div className="order-tracking-container">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-tracking-container">
        <div className="error">
          <h3>Error loading orders</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchOrders}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="order-tracking-container">
      <div className="dashboard-header">
        <h1>Order Tracking</h1>
        <p>Track and manage your order status</p>
      </div>

      <AnimatePresence>
        {selectedOrder && (
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
              data-lenis-prevent
            >
              <div className="modal-header">
                <h2>Order Details - #{selectedOrder._id.substring(0, 8)}</h2>
                <button className="btn btn-outline" onClick={() => setSelectedOrder(null)}>
                  ×
                </button>
              </div>
            <div className="order-details">
              <div className="order-info">
                <div className="order-meta">
                  <div>
                    <span className="label">Order Date:</span>
                    <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="label">Total Amount:</span>
                    <span className="amount">₹{selectedOrder.totalAmount}</span>
                  </div>
                  <div>
                    <span className="label">Current Status:</span>
                    <span className={`badge-status badge-status--${selectedOrder.status}`}>
                      {selectedOrder.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="tracking-timeline">
                  <h3>Order Progress</h3>
                  <div className="timeline">
                    {getStatusSteps(selectedOrder.status).map((step, index) => (
                      <div key={step.key} className={`timeline-item ${step.completed ? 'completed' : 'pending'}`}>
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <h4>{step.label}</h4>
                          {step.completed && (
                            <span className="checkmark">✓</span>
                          )}
                        </div>
                        {index < getStatusSteps(selectedOrder.status).length - 1 && (
                          <div className="timeline-line"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {getNextStatus(selectedOrder.status) && (
                  <div className="status-update">
                    <h3>Update Status</h3>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleStatusUpdate(selectedOrder._id, getNextStatus(selectedOrder.status))}
                      disabled={updatingStatus}
                    >
                      {updatingStatus ? 'Updating...' : `Mark as ${getNextStatus(selectedOrder.status).replace('_', ' ').toUpperCase()}`}
                    </button>
                  </div>
                )}

                <div className="order-items">
                  <h3>Order Items</h3>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-image">
                        <img 
                          src={getProductImage(item.product?.image, item.name)} 
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = getProductImage(null, item.name);
                          }}
                        />
                      </div>
                      <div className="item-info">
                        <h4>{item.name}</h4>
                        <p>Quantity: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <div className="item-total">
                        ₹{(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="shipping-info">
                  <h3>Shipping Address</h3>
                  <p>{selectedOrder.shippingAddress}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

      <div className="dashboard-content">
        {orders.length === 0 ? (
          <div className="no-orders">
            <h3>No orders yet</h3>
            <p>Start shopping to see your orders here.</p>
            <a href="/products" className="btn btn-primary">Browse Products</a>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-id">
                    <h4>Order #{order._id.substring(0, 8)}</h4>
                    <small>{new Date(order.createdAt).toLocaleDateString()}</small>
                  </div>
                  <div className="order-status">
                    <span className={`badge-status badge-status--${order.status}`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="order-summary">
                  <div className="order-items-preview">
                    {order.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="item-preview">
                        <div className="item-preview-image">
                          <img 
                            src={getProductImage(item.product?.image, item.name)} 
                            alt={item.name}
                            onError={(e) => {
                              e.target.src = getProductImage(null, item.name);
                            }}
                          />
                        </div>
                        <span>{item.name} × {item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="item-preview">
                        <span>+{order.items.length - 2} more items</span>
                      </div>
                    )}
                  </div>
                  <div className="order-total">
                    <span className="label">Total:</span>
                    <span className="amount">₹{order.totalAmount}</span>
                  </div>
                </div>

                <div className="order-progress">
                  <div className="progress-bar">
                    <div className="progress-steps">
                      {getStatusSteps(order.status).map((step, index) => (
                        <div
                          key={step.key}
                          className={`progress-step ${step.completed ? 'completed' : 'pending'}`}
                          style={{ width: '25%' }}
                        >
                          <div className="step-dot"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="order-actions">
                  <button
                    className="btn btn-outline"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Details
                  </button>
                  {getNextStatus(order.status) && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleStatusUpdate(order._id, getNextStatus(order.status))}
                      disabled={updatingStatus}
                    >
                      {updatingStatus ? 'Updating...' : `Update Status`}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default OrderTracking;
