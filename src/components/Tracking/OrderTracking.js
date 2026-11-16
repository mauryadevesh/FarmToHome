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

  const fetchTrackingDetails = useCallback(async (orderId) => {
    try {
      const data = await apiService.getDeliveryTracking(orderId);
      setTrackingData(data);
    } catch (err) {
      console.error('Error loading tracking data:', err);
    }
  }, []);

  useEffect(() => {
    if (selectedOrderId) {
      fetchTrackingDetails(selectedOrderId);
    }
  }, [selectedOrderId, fetchTrackingDetails]);

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

  const normalizeStatus = (s) => {
    if (!s) return 'Pending';
    const lower = s.trim().toLowerCase();
    const map = {
      pending: 'Pending',
      ordered: 'Pending',
      accepted: 'Accepted',
      preparing: 'Preparing',
      ready: 'Ready',
      'out for delivery': 'Out for Delivery',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return map[lower] || s;
  };

  const currentOrder = orders.find(o => (o.id || o._id) === selectedOrderId);
  const currentStatus = normalizeStatus(trackingData?.currentStatus || currentOrder?.order_status || currentOrder?.status || 'Pending');

  // Dynamic origin and route geometry based on order produce items
  const orderItems = currentOrder?.items || [];
  const isChenaOrigin = orderItems.some(it => {
    const n = (it.name || '').toLowerCase();
    const f = (it.farmer_name || '').toLowerCase();
    return n.includes('palak') || n.includes('methi') || n.includes('milk') || n.includes('curd') || f.includes('chena');
  });
  const isRaiOrigin = !isChenaOrigin && orderItems.some(it => {
    const n = (it.name || '').toLowerCase();
    const f = (it.farmer_name || '').toLowerCase();
    return n.includes('banana') || n.includes('wada') || n.includes('rice') || f.includes('rai');
  });

  const originName = isChenaOrigin
    ? 'Chena Creek Farm Station'
    : isRaiOrigin
    ? 'Rai-Morva Field Station'
    : 'Uttan Coastal Agro Station';

  const rawAddress = currentOrder?.shipping_address || currentOrder?.shippingAddress || 'Beverly Park, Mira Rd (401107)';
  const destinationShort = rawAddress.length > 28 ? rawAddress.slice(0, 25) + '...' : rawAddress;
  const transitSector = rawAddress.toLowerCase().includes('bhayandar')
    ? 'Bhayandar West Sector'
    : 'Mira Road East / Kanakia Sector';
  const destPincode = rawAddress.match(/\b(400\d{3}|401\d{3})\b/)?.[0] || 'MBMC 401107';

  // Geographic coordinates on the 600x480 canvas
  const startX = isChenaOrigin ? 500 : isRaiOrigin ? 210 : 110;
  const startY = isChenaOrigin ? 170 : isRaiOrigin ? 95 : 300;
  const hubX = 310;
  const hubY = 270;
  const destX = 420;
  const destY = 295;

  // Real-time van positioning along the active route
  let vanX = startX;
  let vanY = startY;
  if (currentStatus === 'Accepted') {
    vanX = Math.round(startX + (hubX - startX) * 0.35);
    vanY = Math.round(startY + (hubY - startY) * 0.35);
  } else if (currentStatus === 'Preparing') {
    vanX = Math.round(startX + (hubX - startX) * 0.72);
    vanY = Math.round(startY + (hubY - startY) * 0.72);
  } else if (currentStatus === 'Ready') {
    vanX = hubX;
    vanY = hubY;
  } else if (currentStatus === 'Out for Delivery') {
    vanX = Math.round(hubX + (destX - hubX) * 0.65);
    vanY = Math.round(hubY + (destY - hubY) * 0.65);
  } else if (currentStatus === 'Delivered') {
    vanX = destX;
    vanY = destY;
  }

  // Active highlighted transit path
  const activeRouteD = isChenaOrigin
    ? `M 500,170 Q 400,220 310,270 Q 365,280 420,295`
    : isRaiOrigin
    ? `M 210,95 Q 260,180 310,270 Q 365,280 420,295`
    : `M 110,300 Q 210,285 310,270 Q 365,280 420,295`;

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
      <PageTransition className="tracking-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Connecting to Mira Bhayandar GPS delivery network...</p>
        </div>
      </PageTransition>
    );
  }

  if (orders.length === 0) {
    return (
      <PageTransition className="tracking-container">
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
    <PageTransition className="tracking-container">
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
            {orders.map((ord, idx) => (
              <option key={ord.id || ord._id} value={ord.id || ord._id}>
                Order #{String(idx + 1).padStart(3, '0')} • {ord.delivery_time_slot || ord.deliveryTimeSlot || 'Morning'} ({ord.status || ord.order_status})
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
                  <rect width="600" height="480" fill="#f4f8f4" rx="10" />

                  {/* Arabian Sea / Coast on West */}
                  <path
                    d="M 0,0 L 80,0 Q 100,120 65,240 T 75,480 L 0,480 Z"
                    fill="#e0f2fe"
                  />
                  <g transform="translate(26, 240) rotate(-90)">
                    <text x="0" y="0" textAnchor="middle" fill="#0284c7" opacity="0.65" fontSize="10.5" fontWeight="700" letterSpacing="2">
                      ARABIAN SEA (WEST)
                    </text>
                  </g>

                  {/* Vasai Creek (North) */}
                  <path
                    d="M 65,0 Q 250,45 600,28 L 600,0 Z"
                    fill="#bae6fd"
                  />
                  <text x="330" y="19" textAnchor="middle" fill="#0369a1" opacity="0.85" fontSize="10" fontWeight="700" letterSpacing="1">
                    VASAI CREEK (NORTHERN BOUNDARY)
                  </text>

                  {/* Western Railway Tracks Corridor */}
                  <line x1="285" y1="35" x2="295" y2="480" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6,4" />
                  <text x="278" y="95" textAnchor="end" fill="#64748b" fontSize="9.5" fontWeight="700">
                    Western Railway Line
                  </text>
                  <text x="278" y="107" textAnchor="end" fill="#94a3b8" fontSize="8">
                    (Churchgate ⇄ Virar)
                  </text>

                  {/* Ghodbunder / Chena Creek Green Hills (East) */}
                  <path
                    d="M 520,50 Q 560,180 530,320 T 575,480 L 600,480 L 600,50 Z"
                    fill="#ecfdf5"
                  />
                  <g transform="translate(584, 250) rotate(90)">
                    <text x="0" y="0" textAnchor="middle" fill="#059669" opacity="0.75" fontSize="10" fontWeight="700" letterSpacing="1.5">
                      CHENA FOREST HILLS
                    </text>
                  </g>

                  {/* Static Agricultural Road Network (faint dashed lines) */}
                  {/* Uttan to Hub */}
                  <path
                    d="M 110,300 Q 210,285 310,270"
                    fill="none"
                    stroke="#bbf7d0"
                    strokeWidth="2.5"
                    strokeDasharray="4,4"
                  />
                  {/* Rai to Hub */}
                  <path
                    d="M 210,95 Q 260,180 310,270"
                    fill="none"
                    stroke="#bbf7d0"
                    strokeWidth="2.5"
                    strokeDasharray="4,4"
                  />
                  {/* Chena Creek to Hub */}
                  <path
                    d="M 500,170 Q 400,220 310,270"
                    fill="none"
                    stroke="#bbf7d0"
                    strokeWidth="2.5"
                    strokeDasharray="4,4"
                  />
                  {/* Hub to Destination */}
                  <path
                    d="M 310,270 Q 365,280 420,295"
                    fill="none"
                    stroke="#bbf7d0"
                    strokeWidth="2.5"
                    strokeDasharray="4,4"
                  />

                  {/* ACTIVE Delivery Transit Route (illuminated animated dashed path) */}
                  <path
                    d={activeRouteD}
                    fill="none"
                    stroke="#15803d"
                    strokeWidth="3.5"
                    strokeDasharray="8,5"
                    className="route-active-line"
                  />

                  {/* Farm Zone 1: Uttan Coastal Belt */}
                  <g className="map-node farm-node">
                    <circle cx="110" cy="300" r="14" fill="#15803d" />
                    {(!isChenaOrigin && !isRaiOrigin) && (
                      <circle cx="110" cy="300" r="22" fill="rgba(21, 128, 61, 0.25)">
                        <animate attributeName="r" values="18;26;18" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.35;0.08;0.35" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <text x="110" y="304" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">🌱</text>
                    <text x="110" y="328" textAnchor="middle" fill="#14532d" fontSize="11" fontWeight="700">
                      Uttan Coastal Farm
                    </text>
                    <text x="110" y="340" textAnchor="middle" fill="#64748b" fontSize="8.5">
                      Vine Tomatoes & Root Crops
                    </text>
                  </g>

                  {/* Farm Zone 2: Chena Creek Greens */}
                  <g className="map-node farm-node">
                    <circle cx="500" cy="170" r="14" fill="#15803d" />
                    {isChenaOrigin && (
                      <circle cx="500" cy="170" r="22" fill="rgba(21, 128, 61, 0.25)">
                        <animate attributeName="r" values="18;26;18" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.35;0.08;0.35" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <text x="500" y="174" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">🌿</text>
                    <text x="500" y="196" textAnchor="middle" fill="#14532d" fontSize="11" fontWeight="700">
                      Chena Creek Greens
                    </text>
                    <text x="500" y="208" textAnchor="middle" fill="#64748b" fontSize="8.5">
                      Palak, Methi, A2 Cow Milk
                    </text>
                  </g>

                  {/* Farm Zone 3: Rai-Morva Fields */}
                  <g className="map-node farm-node">
                    <circle cx="210" cy="95" r="12" fill="#15803d" />
                    {isRaiOrigin && (
                      <circle cx="210" cy="95" r="20" fill="rgba(21, 128, 61, 0.25)">
                        <animate attributeName="r" values="16;24;16" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.35;0.08;0.35" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <text x="210" y="99" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">🌾</text>
                    <text x="210" y="121" textAnchor="middle" fill="#14532d" fontSize="10.5" fontWeight="700">
                      Rai-Morva Agro Plot
                    </text>
                    <text x="210" y="132" textAnchor="middle" fill="#64748b" fontSize="8">
                      Local Bananas & Grains
                    </text>
                  </g>

                  {/* Central Transit Hub: Mira Road Station Quality Hub */}
                  <g className="map-node hub-node">
                    <rect x="292" y="254" width="36" height="30" rx="6" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.18))" />
                    <text x="310" y="273" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                      HUB
                    </text>
                    <text x="310" y="300" textAnchor="middle" fill="#1e3a8a" fontSize="11" fontWeight="700">
                      Mira Rd Quality Center
                    </text>
                    <text x="310" y="312" textAnchor="middle" fill="#64748b" fontSize="8.5">
                      Batch Sorting & Staging
                    </text>
                  </g>

                  {/* Destination: Customer Address */}
                  <g className="map-node destination-node">
                    <circle cx={destX} cy={destY} r="14" fill="#dc2626" />
                    <circle cx={destX} cy={destY} r="22" fill="rgba(220, 38, 38, 0.2)">
                      <animate attributeName="r" values="18;26;18" dur="2.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0.06;0.3" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                    <text x={destX} y={destY + 4} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">🏠</text>
                    <text x={destX} y={destY + 28} textAnchor="middle" fill="#991b1b" fontSize="11" fontWeight="700">
                      Delivery Destination
                    </text>
                    <text x={destX} y={destY + 40} textAnchor="middle" fill="#64748b" fontSize="8.5">
                      {destinationShort}
                    </text>
                  </g>

                  {/* Dynamic Van Marker on Route based on progress */}
                  <g className="animated-van-marker" transform={`translate(${vanX}, ${vanY})`}>
                    {/* SVG Native Pulse Ring (Immune to transform-origin CSS bugs) */}
                    <circle cx="0" cy="0" r="16" fill="#ea580c" opacity="0.25">
                      <animate attributeName="r" values="14;24;14" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.35;0.06;0.35" dur="2s" repeatCount="indefinite" />
                    </circle>

                    {/* Shadow underneath */}
                    <ellipse cx="0" cy="14" rx="11" ry="3.5" fill="rgba(0,0,0,0.18)" />

                    {/* Clean Van Badge */}
                    <rect x="-18" y="-13" width="36" height="24" rx="6" fill="#15803d" stroke="#ffffff" strokeWidth="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.22))" />

                    {/* Vector Delivery Truck Icon */}
                    <g transform="translate(-10, -7) scale(0.65)" fill="#ffffff">
                      <path d="M1 3h15v11H1zM16 7h4l3 3.5V14h-7V7zM4.5 17a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM17.5 17a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    </g>

                    {/* Van Label Tag above */}
                    <g transform="translate(0, -20)">
                      <rect x="-24" y="-8" width="48" height="14" rx="3" fill="#14532d" />
                      <text x="0" y="2.5" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontWeight="bold">
                        {currentStatus === 'Delivered' ? 'ARRIVED' : 'VAN #03'}
                      </text>
                    </g>
                  </g>
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
                  <span className="diag-val">{originName}</span>
                </div>
                <div className="diag-box">
                  <span className="diag-label">Transit Sector</span>
                  <span className="diag-val">{transitSector}</span>
                </div>
                <div className="diag-box">
                  <span className="diag-label">Destination Pincode</span>
                  <span className="diag-val">{destPincode}</span>
                </div>
                <div className="diag-box">
                  <span className="diag-label">Scheduled Slot</span>
                  <span className="diag-val">{currentOrder.delivery_time_slot || currentOrder.deliveryTimeSlot || '07:00 AM - 10:00 AM'}</span>
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
