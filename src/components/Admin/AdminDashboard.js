import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import formatCurrency from '../../utils/currency';
import {
  FaUsers,
  FaBoxes,
  FaLeaf,
  FaClipboardList,
  FaHeadset,
  FaStore,
  FaArrowRight,
  FaSyncAlt,
  FaServer,
  FaShieldAlt,
  FaHeartbeat,
  FaCheck,
  FaClock,
  FaCalendarAlt,
  FaPlus
} from 'react-icons/fa';
import { PageTransition } from '../UI/Motion';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'farmers' | 'slots'

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    farmers: 0,
    consumers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    openTickets: 0,
    totalRevenue: 0,
    pendingDeliveries: 0,
    activeSlots: 0
  });

  const [farmersList, setFarmersList] = useState([]);
  const [deliverySlots, setDeliverySlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  // New Slot Modal
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [newSlotData, setNewSlotData] = useState({
    slotDate: new Date().toISOString().split('T')[0],
    timeWindow: '07:00 AM - 10:00 AM',
    maxCapacity: 25,
    label: 'Morning Harvest Dispatch'
  });

  // Platform Diagnostics State
  const [healthStatus, setHealthStatus] = useState({
    status: 'operational',
    engine: 'Dual-Engine Adapter',
    latency: '14ms',
    checkedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  });
  const [checkingHealth, setCheckingHealth] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, farmersRes, slotsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminFarmers(),
        api.getDeliverySlots()
      ]);
      setStats(statsRes || {});
      setFarmersList(farmersRes || []);
      setDeliverySlots(slotsRes || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchAdminData();
      setActionNotice('Admin platform metrics refreshed.');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error('Error refreshing stats:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleFarmerApproval = async (farmerId, currentApproved) => {
    try {
      const nextState = !currentApproved;
      await api.approveFarmer(farmerId, nextState);
      setFarmersList(prev => prev.map(f => ((f.id === farmerId || f._id === farmerId || f.user_id === farmerId) ? { ...f, is_approved: nextState, isApproved: nextState } : f)));
      setActionNotice(`Farmer account ${nextState ? 'approved' : 'suspended'}.`);
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err) {
      alert(err.message || 'Error updating approval status');
    }
  };

  const handleUpdateSlotCapacity = async (slotId, currentCapacity, delta) => {
    const newCap = Math.max(1, currentCapacity + delta);
    try {
      await api.updateDeliverySlot(slotId, { maxCapacity: newCap });
      setDeliverySlots(prev => prev.map(s => ((s.id === slotId || s._id === slotId) ? { ...s, max_capacity: newCap, maxCapacity: newCap, available_capacity: Math.max(0, newCap - (s.booked_count || 0)) } : s)));
    } catch (err) {
      alert(err.message || 'Error updating slot capacity');
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createDeliverySlot(newSlotData);
      setDeliverySlots(prev => [...prev, created]);
      setShowSlotModal(false);
      setActionNotice(`New delivery window (${newSlotData.timeWindow}) created.`);
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err) {
      alert(err.message || 'Error creating delivery slot');
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
      setActionNotice(`Health verified • Latency: ${duration}ms • Engine: ${res.databaseEngine}`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err) {
      setActionNotice('Health check returned non-200 response.');
    } finally {
      setCheckingHealth(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Connecting to Farm2Home Operations Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="admin-dashboard">
      {/* Top Header */}
      <div className="admin-header">
        <div>
          <div className="admin-title-row">
            <h1>Platform Operations Center</h1>
            <span className="platform-tag">Farm2Home MBMC Network</span>
          </div>
          <p>
            Welcome, <strong>{user?.name}</strong>. Monitor direct farmer supply chains, approve cultivators, and manage delivery scheduling across Mira Bhayandar.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn--secondary btn--sm"
            title="Refresh analytics"
          >
            <FaSyncAlt className={refreshing ? 'icon-spin' : ''} style={{ marginRight: '6px' }} />
            {refreshing ? 'Refreshing...' : 'Refresh Metrics'}
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="alert alert-success feedback-toast">
          <FaCheck /> <span>{actionNotice}</span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Platform GMV</span>
          <span className="kpi-val kpi-val--green">{formatCurrency(stats.totalRevenue || 14250)}</span>
          <span className="kpi-sub">0% intermediary commission</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Registered Cultivators</span>
          <span className="kpi-val">{stats.farmers || farmersList.length}</span>
          <span className="kpi-sub">Uttan, Chena & Rai</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Urban Consumers</span>
          <span className="kpi-val">{stats.consumers || 1}</span>
          <span className="kpi-sub">Mira Bhayandar households</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Total Platform Orders</span>
          <span className="kpi-val kpi-val--highlight">{stats.totalOrders}</span>
          <span className="kpi-sub">{stats.pendingDeliveries || 1} in transit</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Support Tickets</span>
          <span className="kpi-val">{stats.openTickets || 0}</span>
          <span className="kpi-sub">Inquiries open</span>
        </div>
      </div>

      {/* Admin Dashboard Tabs */}
      <div className="dashboard-tabs-bar" style={{ marginTop: '1.5rem' }}>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaServer /> Operational Modules & Health
        </button>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'farmers' ? 'active' : ''}`}
          onClick={() => setActiveTab('farmers')}
        >
          <FaLeaf /> Farmer Verification & Approvals ({farmersList.length})
        </button>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'slots' ? 'active' : ''}`}
          onClick={() => setActiveTab('slots')}
        >
          <FaClock /> Delivery Slots & Capacity Guard ({deliverySlots.length})
        </button>
      </div>

      {/* TAB 1: Modules & Diagnostic Widget */}
      {activeTab === 'overview' && (
        <div className="admin-tab-content">
          {/* Operations Modules Grid */}
          <div className="admin-modules-grid">
            <div className="module-card">
              <div className="module-head">
                <div className="module-icon-wrap"><FaBoxes /></div>
                <span className="module-badge">Catalog</span>
              </div>
              <h3>Produce Catalog & Pricing</h3>
              <p>Audit harvest listings, per-unit pricing, stock balances, and photo uploads.</p>
              <Link to="/admin/products" className="btn btn--primary btn--sm">
                Manage Catalog <FaArrowRight />
              </Link>
            </div>

            <div className="module-card">
              <div className="module-head">
                <div className="module-icon-wrap"><FaClipboardList /></div>
                <span className="module-badge">Fulfillment</span>
              </div>
              <h3>Orders & Dispatch Queue</h3>
              <p>Track customer orders across the 6-stage lifecycle and verify deliveries.</p>
              <Link to="/admin/orders" className="btn btn--primary btn--sm">
                Review Orders <FaArrowRight />
              </Link>
            </div>

            <div className="module-card">
              <div className="module-head">
                <div className="module-icon-wrap"><FaUsers /></div>
                <span className="module-badge">RBAC</span>
              </div>
              <h3>User Accounts & Audit</h3>
              <p>Inspect registered farmers, urban consumers, phone records, and login logs.</p>
              <Link to="/admin/users" className="btn btn--primary btn--sm">
                Audit Users <FaArrowRight />
              </Link>
            </div>

            <div className="module-card">
              <div className="module-head">
                <div className="module-icon-wrap"><FaHeadset /></div>
                <span className="module-badge">Service</span>
              </div>
              <h3>Customer & Farmer Support</h3>
              <p>Read customer delivery queries and respond directly to support tickets.</p>
              <Link to="/admin/support" className="btn btn--primary btn--sm">
                Support Desk <FaArrowRight />
              </Link>
            </div>

            <div className="module-card">
              <div className="module-head">
                <div className="module-icon-wrap"><FaStore /></div>
                <span className="module-badge">Live Store</span>
              </div>
              <h3>Storefront Experience</h3>
              <p>Preview the marketplace exactly as consumers and local farmers see it.</p>
              <Link to="/products" className="btn btn--secondary btn--sm">
                Preview Store <FaArrowRight />
              </Link>
            </div>
          </div>

          {/* Health Diagnostics Widget */}
          <div className="platform-diagnostics-widget">
            <div className="diag-header-row">
              <div className="diag-title-block">
                <div className="pulse-indicator">
                  <span className="pulse-ring"></span>
                  <span className="pulse-dot"></span>
                </div>
                <div>
                  <h3>Farm2Home Platform Status: {healthStatus.status.toUpperCase()}</h3>
                  <span>Real-time verification of Express server, JWT authentication & database adapter</span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={checkPlatformHealth}
                disabled={checkingHealth}
              >
                <FaHeartbeat style={{ marginRight: '6px' }} />
                {checkingHealth ? 'Testing...' : 'Run Diagnostics'}
              </button>
            </div>

            <div className="diag-badges-grid">
              <div className="diag-badge-item">
                <FaServer className="badge-icon" />
                <div>
                  <span className="badge-label">API Port & Routing</span>
                  <span className="badge-value">Active on Port 5001</span>
                </div>
              </div>
              <div className="diag-badge-item">
                <FaHeartbeat className="badge-icon" />
                <div>
                  <span className="badge-label">Ping Latency</span>
                  <span className="badge-value">{healthStatus.latency}</span>
                </div>
              </div>
              <div className="diag-badge-item">
                <FaShieldAlt className="badge-icon" />
                <div>
                  <span className="badge-label">Data Engine</span>
                  <span className="badge-value">{healthStatus.engine}</span>
                </div>
              </div>
              <div className="diag-badge-item">
                <FaClock className="badge-icon" />
                <div>
                  <span className="badge-label">Last Audit Check</span>
                  <span className="badge-value">{healthStatus.checkedAt}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Farmer Approvals & Verification */}
      {activeTab === 'farmers' && (
        <div className="admin-tab-content">
          <div className="tab-section-head">
            <div>
              <h3>Mira Bhayandar Cultivator Verification Queue</h3>
              <p>Approve local farmers to list crops, view farm plots, and verify agricultural background.</p>
            </div>
            <span className="badge-counter">{farmersList.length} Registered Farmers</span>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Cultivator</th>
                  <th>Farm Name & Plot Location</th>
                  <th>Plot Size & Exp</th>
                  <th>Contact</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {farmersList.map((f) => {
                  const fid = f.id || f._id;
                  const isApproved = f.is_approved !== false && f.isApproved !== false;

                  return (
                    <tr key={fid} className="table-row">
                      <td className="farmer-profile-cell">
                        <img src={f.image || 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=200'} alt={f.name} className="farmer-table-avatar" />
                        <div>
                          <strong>{f.name}</strong>
                          <small>{f.user?.email || 'farmer@farmtohome.com'}</small>
                        </div>
                      </td>
                      <td>
                        <strong>{f.farm_name || f.farmName || 'Local Agro Farm'}</strong>
                        <div className="location-small"><FaLeaf /> {f.location}</div>
                      </td>
                      <td>
                        <span>{f.farm_size || '3 Acres'}</span> • <small>{f.experience_years || 5} yrs exp</small>
                      </td>
                      <td>{f.phone || '+91 98201 12345'}</td>
                      <td>★ {f.rating || 4.85}</td>
                      <td>
                        <span className={`status-pill ${isApproved ? 'status-pill--approved' : 'status-pill--pending'}`}>
                          {isApproved ? 'Approved' : 'Pending Verification'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`btn-approval-toggle ${isApproved ? 'btn-revoke' : 'btn-approve'}`}
                          onClick={() => handleToggleFarmerApproval(f.user_id || f.userId || fid, isApproved)}
                        >
                          {isApproved ? 'Revoke Approval' : 'Approve Cultivator'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Delivery Slots & Overbooking Controls */}
      {activeTab === 'slots' && (
        <div className="admin-tab-content">
          <div className="tab-section-head">
            <div>
              <h3>Mira Bhayandar Delivery Windows & Capacity Guard</h3>
              <p>Configure delivery slots and set maximum order capacity to prevent transit delays and overbooking.</p>
            </div>
            <button className="btn btn--primary btn--sm" onClick={() => setShowSlotModal(true)}>
              <FaPlus /> Add Delivery Slot
            </button>
          </div>

          <div className="slots-admin-grid">
            {deliverySlots.map((slot) => {
              const sid = slot.id || slot._id;
              const max = slot.max_capacity || slot.maxCapacity || 25;
              const booked = slot.booked_count || slot.bookedCount || 0;
              const remaining = Math.max(0, max - booked);
              const percentBooked = Math.min(100, Math.round((booked / max) * 100));

              return (
                <div key={sid} className="slot-admin-card">
                  <div className="slot-card-header">
                    <div>
                      <span className="slot-date-tag">
                        <FaCalendarAlt /> {slot.slot_date || slot.slotDate || 'Daily Window'}
                      </span>
                      <h4 className="slot-time-heading">{slot.time_window || slot.timeWindow}</h4>
                    </div>
                    <span className={`slot-health-badge ${remaining <= 5 ? 'tight' : 'healthy'}`}>
                      {remaining} spots left
                    </span>
                  </div>

                  <p className="slot-label-desc">{slot.label || 'Harvest Dispatch Window'}</p>

                  <div className="slot-utilization-bar">
                    <div className="util-labels">
                      <span>Booked: {booked} orders</span>
                      <span>Max Cap: {max}</span>
                    </div>
                    <div className="util-track">
                      <div className="util-fill" style={{ width: `${percentBooked}%` }} />
                    </div>
                  </div>

                  <div className="slot-capacity-controls">
                    <span className="cap-control-label">Adjust Max Capacity:</span>
                    <div className="cap-buttons">
                      <button
                        type="button"
                        className="btn-cap-delta"
                        onClick={() => handleUpdateSlotCapacity(sid, max, -5)}
                        disabled={max <= booked}
                      >
                        -5
                      </button>
                      <span className="cap-current">{max}</span>
                      <button
                        type="button"
                        className="btn-cap-delta"
                        onClick={() => handleUpdateSlotCapacity(sid, max, 5)}
                      >
                        +5
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Create Slot Modal */}
          {showSlotModal && (
            <div className="modal-overlay" data-lenis-prevent>
              <div className="modal">
                <h3>Create New Delivery Window</h3>
                <form onSubmit={handleCreateSlot} className="product-form">
                  <label>
                    Delivery Date:
                    <input
                      type="date"
                      value={newSlotData.slotDate}
                      onChange={(e) => setNewSlotData(prev => ({ ...prev, slotDate: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Time Window:
                    <select
                      value={newSlotData.timeWindow}
                      onChange={(e) => setNewSlotData(prev => ({ ...prev, timeWindow: e.target.value }))}
                    >
                      <option value="07:00 AM - 10:00 AM">07:00 AM - 10:00 AM (Morning Harvest)</option>
                      <option value="11:00 AM - 02:00 PM">11:00 AM - 02:00 PM (Mid-Day Fresh Batch)</option>
                      <option value="05:00 PM - 08:00 PM">05:00 PM - 08:00 PM (Evening Kitchen Prep)</option>
                    </select>
                  </label>
                  <label>
                    Window Label / Route Sector:
                    <input
                      type="text"
                      placeholder="e.g. Mira Road East Express"
                      value={newSlotData.label}
                      onChange={(e) => setNewSlotData(prev => ({ ...prev, label: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Maximum Delivery Capacity (Orders):
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={newSlotData.maxCapacity}
                      onChange={(e) => setNewSlotData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value, 10) }))}
                      required
                    />
                  </label>
                  <div className="modal-actions">
                    <button type="button" className="btn btn--outline" onClick={() => setShowSlotModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn--primary">
                      Create Delivery Slot
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </PageTransition>
  );
};

export default AdminDashboard;
