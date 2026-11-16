import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { getProductImage } from '../../utils/productImage';
import { useAuth } from '../../contexts/AuthContext';

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'ordered': return '#007bff';
      case 'pending': return '#6c757d';
      case 'processing': return '#ffc107';
      case 'shipped': return '#17a2b8';
      case 'out_for_delivery': return '#fd7e14';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
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
    <div className="order-tracking-container">
      <div className="dashboard-header">
        <h1>Order Tracking</h1>
        <p>Track and manage your order status</p>
      </div>

      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal">
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
                    <span className="status" style={{ backgroundColor: getStatusColor(selectedOrder.status) }}>
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
          </div>
        </div>
      )}

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
                    <span className="status" style={{ backgroundColor: getStatusColor(order.status) }}>
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

      <style jsx>{`
        .order-tracking-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .dashboard-header {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .dashboard-header h1 {
          margin: 0;
          color: #333;
        }

        .dashboard-header p {
          margin: 5px 0 0 0;
          color: #666;
        }

        .no-orders {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .no-orders h3 {
          margin-bottom: 10px;
          color: #333;
        }

        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .order-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .order-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .order-id h4 {
          margin: 0;
          color: #333;
        }

        .order-id small {
          color: #666;
        }

        .status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: white;
        }

        .order-summary {
          margin-bottom: 15px;
        }

        .order-items-preview {
          margin-bottom: 10px;
        }

        .item-preview {
          font-size: 14px;
          color: #666;
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .item-preview-image {
          width: 30px;
          height: 30px;
          flex-shrink: 0;
        }

        .item-preview-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
        }

        .order-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
        }

        .amount {
          color: #28a745;
          font-size: 16px;
        }

        .order-progress {
          margin-bottom: 20px;
        }

        .progress-bar {
          background: #f0f0f0;
          height: 4px;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-steps {
          display: flex;
          height: 100%;
        }

        .progress-step {
          position: relative;
        }

        .step-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ddd;
          margin: -4px auto;
        }

        .progress-step.completed .step-dot {
          background: #28a745;
        }

        .order-actions {
          display: flex;
          gap: 10px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 8px;
          max-width: 800px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .modal-header h2 {
          margin: 0;
          color: #333;
        }

        .order-details {
          padding: 20px;
        }

        .order-meta {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .order-meta > div {
          display: flex;
          flex-direction: column;
        }

        .label {
          font-weight: 600;
          color: #666;
          margin-bottom: 5px;
        }

        .tracking-timeline {
          margin-bottom: 30px;
        }

        .tracking-timeline h3 {
          margin-bottom: 20px;
          color: #333;
        }

        .timeline {
          position: relative;
          padding-left: 30px;
        }

        .timeline-item {
          position: relative;
          padding-bottom: 30px;
        }

        .timeline-item:last-child {
          padding-bottom: 0;
        }

        .timeline-dot {
          position: absolute;
          left: -30px;
          top: 5px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ddd;
          border: 2px solid white;
          box-shadow: 0 0 0 2px #ddd;
        }

        .timeline-item.completed .timeline-dot {
          background: #28a745;
          box-shadow: 0 0 0 2px #28a745;
        }

        .timeline-line {
          position: absolute;
          left: -24px;
          top: 17px;
          width: 2px;
          height: 30px;
          background: #ddd;
        }

        .timeline-content {
          position: relative;
        }

        .timeline-content h4 {
          margin: 0 0 5px 0;
          color: #333;
        }

        .timeline-item.completed .timeline-content h4 {
          color: #28a745;
        }

        .checkmark {
          position: absolute;
          right: 0;
          top: 0;
          color: #28a745;
          font-weight: bold;
        }

        .status-update {
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .status-update h3 {
          margin-bottom: 15px;
          color: #333;
        }

        .order-items {
          margin-bottom: 30px;
        }

        .order-items h3 {
          margin-bottom: 15px;
          color: #333;
        }

        .order-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }

        .item-image {
          position: relative;
          height: 200px;
          overflow: hidden;
          width: 200px;
          flex-shrink: 0;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-info h4 {
          margin: 0 0 5px 0;
          color: #333;
        }

        .item-info p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .item-total {
          font-weight: 600;
          color: #28a745;
        }

        .shipping-info {
          padding: 15px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .shipping-info h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .shipping-info p {
          margin: 0;
          color: #666;
        }

        .loading, .error {
          text-align: center;
          padding: 60px 20px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-outline {
          background: transparent;
          color: #007bff;
          border: 1px solid #007bff;
        }

        .btn-outline:hover {
          background: #007bff;
          color: white;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default OrderTracking;
