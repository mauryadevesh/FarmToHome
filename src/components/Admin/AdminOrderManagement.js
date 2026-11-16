import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/currency';

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminOrders();
      setOrders(Array.isArray(response) ? response : []);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      console.log('Updating order status:', { orderId, newStatus });
      const response = await api.updateOrderStatus(orderId, newStatus);
      console.log('Status update response:', response);
      setSuccess('Order status updated successfully!');
      fetchOrders();
    } catch (err) {
      console.error('Update order status error:', err);
      setError(`Failed to update order status: ${err.message || 'Unknown error'}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  if (loading) {
    return (
      <div className="admin-order-management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-order-management">
      <div className="section-header">
        <h2>Order Management</h2>
        <p>Manage all customer orders and update their status</p>
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

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const orderKey = order._id || order.id || Math.random().toString();
              const orderDisplayId = (order._id || order.id || 'ORD').toString().slice(-8);
              return (
                <tr key={orderKey}>
                  <td className="order-id">#{orderDisplayId}</td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{order.user?.name || 'Unknown'}</div>
                      <div className="customer-email">{order.user?.email || 'N/A'}</div>
                    </div>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <div className="order-items">
                      {(order.items || []).map((item, index) => (
                        <div key={index} className="item-info">
                          {item.quantity}x {item.product?.name || item.name || 'Product'}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="order-total">{formatCurrency(order.totalAmount)}</td>
                  <td>
                    <span className={`status-badge status-badge--${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id || order.id, e.target.value)}
                      className="status-select"
                    >
                      {orderStatuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrderManagement;
