import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { FaSearch, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminOrders();
      setOrders(Array.isArray(response) ? response : []);
    } catch (err) {
      setError('Failed to fetch orders from server.');
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      setError(null);
      await api.updateAdminOrderStatus(orderId, newStatus);
      setSuccess(`Order #${orderId.slice(-6)} status updated to "${newStatus}".`);
      setOrders(prev => prev.map(o => ((o.id === orderId || o._id === orderId) ? { ...o, status: newStatus } : o)));
    } catch (err) {
      console.error('Update order status error:', err);
      setError(`Failed to update order status: ${err.message || 'Unknown error'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent Order';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recent Order';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = !searchTerm || (
      (order.id || order._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.shippingAddress || order.shipping_address || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="admin-order-management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading customer order logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-order-management">
      <div className="section-header">
        <h2>Order & Delivery Management</h2>
        <p>Monitor farm dispatch progress, track deliveries, and manage customer fulfillment status.</p>
      </div>

      {error && (
        <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="success-message" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaCheckCircle />
          <span>{success}</span>
        </div>
      )}

      {/* Toolbar with Search and Status Filter */}
      <div className="admin-toolbar" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by order ID, customer, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({orders.length})
          </button>
          {ORDER_STATUSES.map(st => {
            const count = orders.filter(o => o.status === st).length;
            return (
              <button
                key={st}
                type="button"
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setStatusFilter(st)}
                style={{ textTransform: 'capitalize' }}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date & Time</th>
              <th>Produce Items</th>
              <th>Total Amount</th>
              <th>Current Status</th>
              <th>Update Tracking</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--color-muted)' }}>
                  No orders match this filter.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => {
                const orderKey = order.id || order._id;
                const orderDisplayId = (orderKey || 'ORD').toString().slice(-8);
                const orderDate = order.createdAt || order.created_at;
                const total = order.totalAmount ?? order.total_amount ?? 0;

                return (
                  <tr key={orderKey}>
                    <td className="order-id">
                      <strong>#{orderDisplayId}</strong>
                    </td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name" style={{ fontWeight: 600 }}>{order.user?.name || 'Customer'}</div>
                        <div className="customer-email" style={{ fontSize: '11px', color: 'var(--color-muted)' }}>{order.user?.email || 'N/A'}</div>
                        {(order.shippingAddress || order.shipping_address) && (
                          <div style={{ fontSize: '11px', color: 'var(--color-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            📍 {order.shippingAddress || order.shipping_address}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(orderDate)}</td>
                    <td>
                      <div className="order-items">
                        {(order.items || []).map((item, index) => (
                          <div key={index} className="item-info" style={{ fontSize: '11px' }}>
                            <strong>{item.quantity}×</strong> {item.name || item.product?.name || 'Produce'}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="order-total" style={{ fontWeight: 600 }}>
                      {formatCurrency(total)}
                    </td>
                    <td>
                      <span className={`status-badge status-badge--${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.status}
                        disabled={updatingId === orderKey}
                        onChange={(e) => handleStatusUpdate(orderKey, e.target.value)}
                        className="status-select"
                      >
                        {ORDER_STATUSES.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrderManagement;
