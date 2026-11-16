import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import formatCurrency from '../../utils/currency';
import { PageTransition } from '../UI/Motion';
import {
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaLeaf,
  FaShoppingBag
} from 'react-icons/fa';

// The 6-stage delivery lifecycle required by the specification
const DELIVERY_STAGES = [
  { key: 'Pending', label: 'Order Placed', desc: 'Received & transmitted to local farm network' },
  { key: 'Accepted', label: 'Harvest Accepted', desc: 'Farmer confirmed crop availability at village plot' },
  { key: 'Preparing', label: 'Picking & Packing', desc: 'Hand-picked fresh at dawn and graded in eco-crates' },
  { key: 'Ready', label: 'Quality Hub Verified', desc: 'Arrived & inspected at Mira Road fulfillment center' },
  { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'En route with electric delivery van to your doorstep' },
  { key: 'Delivered', label: 'Delivered', desc: 'Handed over fresh to your kitchen within 12h of harvest' }
];

const OrderTracking = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [advancingStage, setAdvancingStage] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.getOrders();
      const list = Array.isArray(res) ? res : [];
      setOrders(list);

      // Check URL query param or select first order
      const params = new URLSearchParams(location.search);
      const urlOrderId = params.get('orderId');

      if (urlOrderId && list.some(o => (o.id || o._id) === urlOrderId)) {
        setSelectedOrderId(urlOrderId);
      } else if (list.length > 0) {
        setSelectedOrderId(list[0].id || list[0]._id);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching orders for tracking:', err);
      setError('Unable to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [location.search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (selectedOrderId) {
      fetchTrackingDetails(selectedOrderId);
    }
  }, [selectedOrderId]);

  const fetchTrackingDetails = async (orderId) => {
    try {
      const data = await apiService.getDeliveryTracking(orderId);
      setTrackingData(data);
    } catch (err) {
      console.error('Error loading tracking data:', err);
    }
  };

  const handleAdvanceStage = async (nextStage) => {
    if (!selectedOrderId) return;
    try {
      setAdvancingStage(true);
      await apiService.updateDeliveryStatus(selectedOrderId, { status: nextStage });
      await fetchTrackingDetails(selectedOrderId);
      await fetchOrders();
    } catch (err) {
      alert(err.message || 'Could not update delivery status');
    } finally {
      setAdvancingStage(false);
    }
  };

  const currentOrder = orders.find(o => (o.id || o._id) === selectedOrderId);
  const currentStatus = trackingData?.currentStatus || currentOrder?.order_status || currentOrder?.status || 'Pending';

  const getStageIndex = (status) => {
    const idx = DELIVERY_STAGES.findIndex(s => s.key.toLowerCase() === (status || '').toLowerCase());
    return idx >= 0 ? idx : 0;
  };

  const currentStageIndex = getStageIndex(currentStatus);

  // SVG Delivery Map coordinates calculation for visual path
  const getVanProgressPercent = () => {
    switch (currentStatus) {
      case 'Pending': return 10;
      case 'Accepted': return 25;
      case 'Preparing': return 45;
      case 'Ready': return 65;
      case 'Out for Delivery': return 85;
      case 'Delivered': return 100;
      default: return 10;
    }
  };

  if (loading) {
    return (
      <div className="tracking-page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Connecting to Mira Bhayandar GPS delivery network...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <PageTransition className="tracking-page-container">
        <div className="tracking-header">
          <span className="section-label">Live Dispatch Coordination</span>
          <h1>Track Your Farm Harvest</h1>
          <p>6-Stage end-to-end provenance tracking from village plot to urban doorstep.</p>
        </div>
        <div className="empty-orders-card">
          <FaShoppingBag className="empty-icon" />
          <h3>No Active Delivery Orders</h3>
          <p>You haven't placed an order yet. Select seasonal produce and pick your preferred delivery time slot.</p>
          <Link to="/products" className="btn btn--primary" style={{ marginTop: '1rem' }}>
            Browse Fresh Produce
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="tracking-page-container">
      {/* Header */}
      <div className="tracking-header">
        <div className="tracking-header-left">
          <span className="section-label">Mira Bhayandar Delivery Logistics</span>
          <h1>Live Harvest Dispatch Tracker</h1>
          <p>Direct farm-to-table visibility with GPS-simulated route map and 6-stage verification.</p>
        </div>

        {/* Order Selector Dropdown */}
        <div className="order-selector-wrap">
          <label htmlFor="orderSelect" className="selector-label">Select Order to Track:</label>
          <select
            id="orderSelect"
            value={selectedOrderId || ''}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="order-select-input"
          >
            {orders.map((ord) => (
              <option key={ord.id || ord._id} value={ord.id || ord._id}>
                Order #{ord.id || ord._id} • {ord.delivery_time_slot || ord.deliveryTimeSlot || 'Morning'} ({ord.status || ord.order_status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{error}</span>
        </div>
      )}

      {currentOrder && (
        <div className="tracking-grid-layout">
          {/* Left Column: 6-Stage Stepper & Order Details */}
          <div className="tracking-stepper-column">
            {/* Status Summary Banner */}
            <div className={`status-summary-banner status-banner--${currentStatus.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="status-banner-left">
                <span className="status-lead">Current Stage:</span>
                <h2 className="status-title">{currentStatus}</h2>
                <span className="status-eta">
                  <FaClock /> Estimated Delivery: {currentOrder.delivery_time_slot || currentOrder.deliveryTimeSlot || '07:00 AM - 10:00 AM'}
                </span>
              </div>
              <div className="status-banner-progress">
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${getVanProgressPercent()}%` }}
                  />
                </div>
                <span className="progress-percent">{getVanProgressPercent()}% Completed</span>
              </div>
            </div>

            {/* The 6-Stage Stepper */}
            <div className="six-stage-card">
              <h3 className="card-subhead">6-Stage Delivery Pipeline</h3>
              <div className="stages-timeline">
                {DELIVERY_STAGES.map((stage, idx) => {
                  const isDone = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  const isPending = idx > currentStageIndex;

                  return (
                    <div
                      key={stage.key}
                      className={`timeline-stage-item ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''} ${isPending ? 'is-pending' : ''}`}
                    >
                      <div className="stage-marker-col">
                        <div className="stage-marker-circle">
                          {isDone ? <FaCheckCircle /> : idx + 1}
                        </div>
                        {idx < DELIVERY_STAGES.length - 1 && <div className="stage-line" />}
                      </div>

                      <div className="stage-content-col">
                        <div className="stage-head-row">
                          <h4 className="stage-title">{stage.label}</h4>
                          {isCurrent && <span className="stage-pill-live">In Progress</span>}
                          {isDone && <span className="stage-pill-done">Completed</span>}
                        </div>
                        <p className="stage-desc">{stage.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Admin-only Stage Advancement Panel */}
            {user?.role === 'admin' && (
              <div className="stage-advance-panel">
                <div className="advance-panel-head">
                  <span className="badge-demo">Idea Lab Admin Console</span>
                  <h4>Advance Delivery Stage:</h4>
                </div>
                <p className="advance-panel-sub">
                  Simulate the real-time fulfillment progression across Mira Bhayandar and update transit coordinates:
                </p>
                <div className="stage-buttons-row">
                  {DELIVERY_STAGES.map((stg) => (
                    <button
                      key={stg.key}
                      type="button"
                      onClick={() => handleAdvanceStage(stg.key)}
                      disabled={advancingStage || currentStatus === stg.key}
                      className={`btn-stage-step ${currentStatus === stg.key ? 'active' : ''}`}
                    >
                      {stg.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Order Items Preview */}
            <div className="tracking-items-card">
              <h3 className="card-subhead">Harvest Items in Basket</h3>
              <div className="items-list-compact">
                {(currentOrder.items || []).map((item, i) => (
                  <div key={i} className="item-row-compact">
                    <img src={item.image} alt={item.name} className="item-thumb-compact" />
                    <div className="item-info-compact">
                      <span className="item-name-compact">{item.name}</span>
                      <span className="item-farmer-compact">
                        <FaLeaf /> {item.farmer_name || 'Uttan / Chena Farmer'}
                      </span>
                    </div>
                    <div className="item-qty-compact">
                      <span>{item.quantity} {item.unit || 'unit'}</span>
                      <strong>{formatCurrency(item.price * item.quantity)}</strong>
                    </div>
                  </div>
                ))}
              </div>
              <div className="items-total-row">
                <span>Total Amount Paid (COD / Prepaid):</span>
                <strong>{formatCurrency(currentOrder.total_amount || currentOrder.totalAmount)}</strong>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Mira Bhayandar Delivery Route Map */}
          <div className="tracking-map-column">
            <div className="map-card-wrapper">
              <div className="map-card-head">
                <div className="map-head-title">
                  <FaMapMarkerAlt className="map-icon" />
                  <div>
                    <h3>Mira Bhayandar Route Map</h3>
                    <span>Live GPS dispatch simulation across MBMC local sectors</span>
                  </div>
                </div>
                <div className="map-live-badge">
                  <span className="beacon-dot" />
                  <span>GPS Active</span>
                </div>
              </div>

              {/* Interactive SVG Mira Bhayandar Transit Map */}
              <div className="mira-map-canvas">
                <svg
                  viewBox="0 0 600 480"
                  className="mira-svg-map"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Background terrain */}
                  <rect width="600" height="480" fill="#f4f8f4" rx="8" />

                  {/* Arabian Sea / Coast on West */}
                  <path
                    d="M 0,0 L 90,0 Q 110,120 70,240 T 80,480 L 0,480 Z"
                    fill="#e3f2fd"
                  />
                  <text x="20" y="240" fill="#90caf9" fontSize="12" fontWeight="600" transform="rotate(-90 20 240)">
                    Arabian Sea (West)
                  </text>

                  {/* Vasai Creek (North) */}
                  <path
                    d="M 70,0 Q 250,50 600,30 L 600,0 Z"
                    fill="#bbdefb"
                  />
                  <text x="320" y="22" fill="#1565c0" fontSize="11" fontWeight="600">
                    Vasai Creek Northern Border
                  </text>

                  {/* Western Railway Tracks Corridor */}
                  <line x1="280" y1="40" x2="290" y2="480" stroke="#b0bec5" strokeWidth="4" strokeDasharray="6,4" />
                  <text x="296" y="220" fill="#78909c" fontSize="10" transform="rotate(88 296 220)">
                    Western Railway Line
                  </text>

                  {/* Ghodbunder / Chena Creek Green Hills (East) */}
                  <path
                    d="M 500,60 Q 560,180 520,320 T 570,480 L 600,480 L 600,60 Z"
                    fill="#e8f5e9"
                  />
                  <text x="530" y="250" fill="#4caf50" fontSize="11" fontWeight="600" transform="rotate(90 530 250)">
                    Chena Creek Green Valley
                  </text>

                  {/* Farm Zone 1: Uttan Coastal Belt */}
                  <g className="map-node farm-node">
                    <circle cx="110" cy="300" r="14" fill="#2d7a3e" />
                    <circle cx="110" cy="300" r="22" fill="rgba(45, 122, 62, 0.2)" />
                    <text x="110" y="332" textAnchor="middle" fill="#1b4d29" fontSize="11" fontWeight="700">
                      Uttan Coastal Farm
                    </text>
                    <text x="110" y="344" textAnchor="middle" fill="#555" fontSize="9">
                      Vine Tomatoes & Root Crops
                    </text>
                  </g>

                  {/* Farm Zone 2: Chena Creek Greens */}
                  <g className="map-node farm-node">
                    <circle cx="510" cy="180" r="14" fill="#2d7a3e" />
                    <circle cx="510" cy="180" r="22" fill="rgba(45, 122, 62, 0.2)" />
                    <text x="510" y="210" textAnchor="middle" fill="#1b4d29" fontSize="11" fontWeight="700">
                      Chena Creek Greens
                    </text>
                    <text x="510" y="222" textAnchor="middle" fill="#555" fontSize="9">
                      Palak, Methi, Cow Milk
                    </text>
                  </g>

                  {/* Farm Zone 3: Rai-Morva Fields */}
                  <g className="map-node farm-node">
                    <circle cx="210" cy="90" r="12" fill="#2d7a3e" />
                    <text x="210" y="118" textAnchor="middle" fill="#1b4d29" fontSize="10" fontWeight="700">
                      Rai-Morva Fields
                    </text>
                  </g>

                  {/* Central Transit Hub: Mira Road Station Quality Hub */}
                  <g className="map-node hub-node">
                    <rect x="295" y="260" width="30" height="26" rx="4" fill="#1565c0" />
                    <text x="310" y="278" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">
                      HUB
                    </text>
                    <text x="310" y="304" textAnchor="middle" fill="#0d47a1" fontSize="11" fontWeight="700">
                      Mira Rd Quality Center
                    </text>
                    <text x="310" y="316" textAnchor="middle" fill="#666" fontSize="9">
                      Batch Sorting & Cold Staging
                    </text>
                  </g>

                  {/* Delivery Transit Route Line */}
                  <path
                    d="M 110,300 Q 200,280 295,273 T 410,290"
                    fill="none"
                    stroke="#2e7d32"
                    strokeWidth="3.5"
                    strokeDasharray="6,4"
                  />

                  {/* Destination: Customer Address in Beverly Park / Mira Road */}
                  <g className="map-node destination-node">
                    <circle cx="410" cy="290" r="14" fill="#d32f2f" />
                    <circle cx="410" cy="290" r="24" fill="rgba(211, 47, 47, 0.2)" />
                    <text x="410" y="322" textAnchor="middle" fill="#b71c1c" fontSize="11" fontWeight="700">
                      Delivery Address
                    </text>
                    <text x="410" y="334" textAnchor="middle" fill="#555" fontSize="9">
                      Beverly Park, Mira Rd (401107)
                    </text>
                  </g>

                  {/* Dynamic Van Marker on Route based on progress */}
                  {(() => {
                    // Interpolate coordinates based on status
                    let vanX = 110;
                    let vanY = 300;
                    if (currentStatus === 'Accepted') { vanX = 160; vanY = 288; }
                    else if (currentStatus === 'Preparing') { vanX = 220; vanY = 278; }
                    else if (currentStatus === 'Ready') { vanX = 310; vanY = 273; }
                    else if (currentStatus === 'Out for Delivery') { vanX = 370; vanY = 282; }
                    else if (currentStatus === 'Delivered') { vanX = 410; vanY = 290; }

                    return (
                      <g className="animated-van-marker" transform={`translate(${vanX}, ${vanY})`}>
                        <circle r="18" fill="#ff9800" opacity="0.3" className="van-pulse-circle" />
                        <rect x="-12" y="-10" width="24" height="20" rx="3" fill="#e65100" />
                        <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11">🚚</text>
                        <text x="0" y="-15" textAnchor="middle" fill="#e65100" fontSize="10" fontWeight="bold">
                          Van #03
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Driver & Transit Vehicle Metadata Card */}
              <div className="driver-metadata-strip">
                <div className="driver-info-block">
                  <div className="driver-avatar">
                    <FaTruck />
                  </div>
                  <div className="driver-names">
                    <span className="driver-name-text">Sanjay Raut (Driver)</span>
                    <span className="driver-vehicle-text">Farm2Home Electric Van #03 • MBMC Route 4</span>
                  </div>
                </div>

                <div className="driver-action-block">
                  <a href="tel:9820599887" className="btn-call-driver">
                    <FaPhoneAlt /> Call Driver
                  </a>
                </div>
              </div>

              {/* Transit Diagnostics */}
              <div className="transit-diagnostics-grid">
                <div className="diag-box">
                  <span className="diag-label">Origin Hub</span>
                  <span className="diag-val">Uttan Collection Station</span>
                </div>
                <div className="diag-box">
                  <span className="diag-label">Transit Sector</span>
                  <span className="diag-val">Kanakia Rd / Beverly Park</span>
                </div>
                <div className="diag-box">
                  <span className="diag-label">Destination Pincode</span>
                  <span className="diag-val">MBMC 401107</span>
                </div>
                <div className="diag-box">
                  <span className="diag-label">Scheduled Slot</span>
                  <span className="diag-val">{currentOrder.delivery_time_slot || '07:00 AM - 10:00 AM'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

export default OrderTracking;
