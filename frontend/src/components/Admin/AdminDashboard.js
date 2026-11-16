import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FaUsers,
  FaBoxes,
  FaLeaf,
  FaShoppingBag,
  FaClipboardList,
  FaHeadset,
  FaStore,
  FaArrowRight,
  FaCheckCircle
} from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    farmers: 0,
    consumers: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminStats();
      setStats(response || {});
      setError(null);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Unable to load latest statistics. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading administrative dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <span className="admin-pill">System Administration</span>
        <h1>FarmToHome Control Center</h1>
        <p className="welcome-message">
          Welcome back, <strong>{user?.name}</strong>! Monitor farm listings, oversee deliveries, and manage the marketplace community.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={fetchAdminStats} style={{ marginTop: '6px' }}>
            Retry
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users-icon">
            <FaUsers />
          </div>
          <div className="stat-details">
            <h3>{stats.totalUsers ?? 0}</h3>
            <p>Total Registered Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon products-icon">
            <FaBoxes />
          </div>
          <div className="stat-details">
            <h3>{stats.totalProducts ?? 0}</h3>
            <p>Total Produce Items</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon farmers-icon">
            <FaLeaf />
          </div>
          <div className="stat-details">
            <h3>{stats.farmers ?? 0}</h3>
            <p>Verified Village Farmers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon consumers-icon">
            <FaShoppingBag />
          </div>
          <div className="stat-details">
            <h3>{stats.consumers ?? 0}</h3>
            <p>Active Household Consumers</p>
          </div>
        </div>
      </div>

      {/* Admin Quick Management Links */}
      <div className="admin-management-section">
        <h2>Administrative Operations</h2>
        <div className="admin-actions-grid">
          <Link to="/admin/products" className="admin-action-card">
            <div className="action-icon"><FaBoxes /></div>
            <div className="action-info">
              <h3>Manage Products</h3>
              <p>Add new farm items, update pricing per unit, or adjust stock levels.</p>
            </div>
            <FaArrowRight className="action-arrow" />
          </Link>

          <Link to="/admin/orders" className="admin-action-card">
            <div className="action-icon"><FaClipboardList /></div>
            <div className="action-info">
              <h3>Manage Orders & Deliveries</h3>
              <p>Review customer orders, update shipping progress, and mark as delivered.</p>
            </div>
            <FaArrowRight className="action-arrow" />
          </Link>

          <Link to="/admin/users" className="admin-action-card">
            <div className="action-icon"><FaUsers /></div>
            <div className="action-info">
              <h3>Manage User Accounts</h3>
              <p>View registered farmers, consumers, contact numbers, and login activity.</p>
            </div>
            <FaArrowRight className="action-arrow" />
          </Link>

          <Link to="/admin/support" className="admin-action-card">
            <div className="action-icon"><FaHeadset /></div>
            <div className="action-info">
              <h3>Customer & Farmer Support</h3>
              <p>Read incoming inquiries and respond directly to support tickets.</p>
            </div>
            <FaArrowRight className="action-arrow" />
          </Link>

          <Link to="/products" className="admin-action-card">
            <div className="action-icon"><FaStore /></div>
            <div className="action-info">
              <h3>Live Storefront Preview</h3>
              <p>View the marketplace as consumers see it on desktop and mobile.</p>
            </div>
            <FaArrowRight className="action-arrow" />
          </Link>
        </div>
      </div>

      {/* System Status Banner */}
      <div className="admin-system-status">
        <FaCheckCircle className="status-icon-good" />
        <div>
          <h4>FarmToHome Platform Status: Operational</h4>
          <p>Local API server active • Real-time synchronization • Verified Indian agricultural produce</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
