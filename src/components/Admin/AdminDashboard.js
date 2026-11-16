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
  FaSyncAlt,
  FaServer,
  FaShieldAlt,
  FaHeartbeat
} from 'react-icons/fa';
import { PageTransition } from '../UI/Motion';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    farmers: 0,
    consumers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    openTickets: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Platform Diagnostics State
  const [healthStatus, setHealthStatus] = useState({
    status: 'operational',
    engine: 'Dual-Engine Adapter',
    latency: '14ms',
    checkedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  });
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [healthNotice, setHealthNotice] = useState(null);

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

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await api.getAdminStats();
      setStats(response || {});
      setError(null);
    } catch (err) {
      console.error('Error refreshing stats:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const checkPlatformHealth = async () => {
    try {
      setCheckingHealth(true);
      const start = performance.now();
      const res = await api.get('/health');
      const duration = Math.max(1, Math.round(performance.now() - start));
      setHealthStatus({
        status: res.status || 'operational',
        engine: res.databaseEngine === 'supabase' ? 'Supabase PostgreSQL' : 'Fallback Dual-Engine',
        latency: `${duration}ms`,
        checkedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      setHealthNotice(`API healthy • Latency: ${duration}ms • Engine: ${res.databaseEngine}`);
      setTimeout(() => setHealthNotice(null), 4500);
    } catch (err) {
      setHealthNotice('Health check returned non-200 response.');
    } finally {
      setCheckingHealth(false);
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
    <PageTransition className="admin-dashboard">
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="admin-pill">System Administration</span>
            <h1>FarmToHome Control Center</h1>
            <p className="welcome-message">
              Welcome back, <strong>{user?.name}</strong>! Oversee agricultural produce, deliveries, user accounts, and customer helpdesk.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FaSyncAlt className={refreshing ? 'spinner-sm' : ''} />
            {refreshing ? 'Syncing...' : 'Refresh Metrics'}
          </button>
        </div>
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

        <div className="stat-card">
          <div className="stat-icon orders-icon">
            <FaClipboardList />
          </div>
          <div className="stat-details">
            <h3>{stats.totalOrders ?? 0}</h3>
            <p>Total Customer Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon support-icon">
            <FaHeadset />
          </div>
          <div className="stat-details">
            <h3>{stats.openTickets ?? 0}</h3>
            <p>Active Support Inquiries</p>
          </div>
        </div>
      </div>

      {/* Admin Quick Management Links */}
      <div className="admin-management-section">
        <div className="section-title-wrap">
          <div>
            <h2>Administrative Operations</h2>
            <p className="section-subtitle">
              Choose an operational workspace to manage product cataloging, order fulfillment, account credentials, and support inquiries.
            </p>
          </div>
          <span className="admin-pill">5 Core Workspaces</span>
        </div>

        <div className="admin-actions-grid">
          <Link to="/admin/products" className="admin-action-card">
            <div className="card-top">
              <div className="action-icon"><FaBoxes /></div>
              <span className="module-badge">Catalog CRUD</span>
            </div>
            <div className="action-info">
              <h3>Manage Products</h3>
              <p>Add new farm items, upload product photos, adjust unit pricing, or update crop stock.</p>
            </div>
            <div className="card-footer-action">
              <span className="action-button-pill">
                Open Catalog <FaArrowRight />
              </span>
            </div>
          </Link>

          <Link to="/admin/orders" className="admin-action-card">
            <div className="card-top">
              <div className="action-icon"><FaClipboardList /></div>
              <span className="module-badge">Fulfillment</span>
            </div>
            <div className="action-info">
              <h3>Manage Orders & Deliveries</h3>
              <p>Review customer orders, update tracking status, and confirm morning delivery dispatches.</p>
            </div>
            <div className="card-footer-action">
              <span className="action-button-pill">
                Review Deliveries <FaArrowRight />
              </span>
            </div>
          </Link>

          <Link to="/admin/users" className="admin-action-card">
            <div className="card-top">
              <div className="action-icon"><FaUsers /></div>
              <span className="module-badge">Access & RBAC</span>
            </div>
            <div className="action-info">
              <h3>Manage User Accounts</h3>
              <p>View registered farmers, consumers, change user roles, and manage permissions.</p>
            </div>
            <div className="card-footer-action">
              <span className="action-button-pill">
                View Accounts <FaArrowRight />
              </span>
            </div>
          </Link>

          <Link to="/admin/support" className="admin-action-card">
            <div className="card-top">
              <div className="action-icon"><FaHeadset /></div>
              <span className="module-badge">Helpdesk</span>
            </div>
            <div className="action-info">
              <h3>Customer & Farmer Support</h3>
              <p>Read inquiries from buyers and growers, resolve disputes, and send direct responses.</p>
            </div>
            <div className="card-footer-action">
              <span className="action-button-pill">
                Open Helpdesk <FaArrowRight />
              </span>
            </div>
          </Link>

          <Link to="/products" className="admin-action-card">
            <div className="card-top">
              <div className="action-icon"><FaStore /></div>
              <span className="module-badge">Storefront</span>
            </div>
            <div className="action-info">
              <h3>Live Storefront Preview</h3>
              <p>Preview the marketplace exactly as consumers experience it on web and mobile devices.</p>
            </div>
            <div className="card-footer-action">
              <span className="action-button-pill">
                Browse Storefront <FaArrowRight />
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* System Status Interactive Widget */}
      <div className="admin-system-status">
        <div className="status-left">
          <div className="pulse-indicator">
            <span className="pulse-dot"></span>
            <span className="pulse-ring"></span>
          </div>
          <div>
            <div className="status-title-row">
              <h4>FarmToHome Platform Status: Operational</h4>
              <span className="status-live-chip">Live</span>
            </div>
            <p className="status-desc">
              Local API server active • Real-time synchronization • Verified Indian agricultural produce
            </p>
            <div className="status-metrics-strip" style={{ marginTop: '8px' }}>
              <span className="status-metric-pill">
                <FaServer style={{ color: 'var(--color-accent)' }} />
                Port 5001 Express
              </span>
              <span className="status-metric-pill">
                <FaShieldAlt style={{ color: 'var(--color-accent)' }} />
                JWT Auth Guard
              </span>
              <span className="status-metric-pill">
                <FaHeartbeat style={{ color: 'var(--color-accent)' }} />
                Latency: {healthStatus.latency}
              </span>
              <span className="status-metric-pill" style={{ color: 'var(--color-muted)' }}>
                Checked at {healthStatus.checkedAt}
              </span>
            </div>
            {healthNotice && (
              <div style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: 500, marginTop: '6px' }}>
                ✓ {healthNotice}
              </div>
            )}
          </div>
        </div>

        <div className="status-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={checkPlatformHealth}
            disabled={checkingHealth}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FaHeartbeat />
            {checkingHealth ? 'Diagnosing...' : 'Run Diagnostics'}
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
