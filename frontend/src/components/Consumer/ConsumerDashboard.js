import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaStore,
  FaShoppingBasket,
  FaClipboardList,
  FaMapMarkerAlt,
  FaHeadset,
  FaPhoneAlt,
  FaWhatsapp,
  FaSeedling,
  FaArrowRight
} from 'react-icons/fa';

const ConsumerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="consumer-dashboard-page">
      {/* Welcome Banner */}
      <div className="consumer-welcome-card">
        <div className="welcome-avatar">🌱</div>
        <div className="welcome-text">
          <span className="welcome-tag">Consumer Member Hub</span>
          <h1>Welcome, {user?.name || 'Valued Food Lover'}!</h1>
          <p>
            Connected to verified village farms. Your orders support local rural cultivators directly.
          </p>
          <div className="consumer-account-pills">
            <span className="pill">📧 {user?.email}</span>
            {user?.phone && <span className="pill">📞 {user.phone}</span>}
            {user?.address && <span className="pill">📍 {user.address}</span>}
          </div>
        </div>
      </div>

      {/* Main Action Grid */}
      <div className="consumer-hub-grid">
        <Link to="/products" className="consumer-action-tile highlight">
          <div className="tile-icon"><FaStore /></div>
          <h3>Browse Fresh Produce</h3>
          <p>Explore today's harvested vegetables, fruits, dals, and milk.</p>
          <span className="tile-link">Explore Produce <FaArrowRight /></span>
        </Link>

        <Link to="/orders" className="consumer-action-tile">
          <div className="tile-icon"><FaClipboardList /></div>
          <h3>My Orders & Receipts</h3>
          <p>View your past farm orders, item details, and invoice summaries.</p>
          <span className="tile-link">View Orders <FaArrowRight /></span>
        </Link>

        <Link to="/tracking" className="consumer-action-tile">
          <div className="tile-icon"><FaMapMarkerAlt /></div>
          <h3>Track Active Delivery</h3>
          <p>Check morning dispatch and out-for-delivery status for your current order.</p>
          <span className="tile-link">Track Delivery <FaArrowRight /></span>
        </Link>

        <Link to="/cart" className="consumer-action-tile">
          <div className="tile-icon"><FaShoppingBasket /></div>
          <h3>My Shopping Basket</h3>
          <p>Review items in your cart, adjust quantities, and checkout.</p>
          <span className="tile-link">Go to Cart <FaArrowRight /></span>
        </Link>

        <Link to="/support" className="consumer-action-tile">
          <div className="tile-icon"><FaHeadset /></div>
          <h3>Help & Customer Support</h3>
          <p>Have an issue with delivery or produce quality? Submit or check support tickets.</p>
          <span className="tile-link">Get Support <FaArrowRight /></span>
        </Link>
      </div>

      {/* Delivery Slot & Farm Guarantee Notice */}
      <div className="consumer-perks-box">
        <div className="perk-card">
          <span className="perk-emoji">🚜</span>
          <div>
            <h4>Direct From Nearby Fields</h4>
            <p>Produce is gathered upon order, avoiding multi-week warehouse storage.</p>
          </div>
        </div>
        <div className="perk-card">
          <span className="perk-emoji">⏰</span>
          <div>
            <h4>Morning Delivery Window</h4>
            <p>Orders are dispatched daily between 6:30 AM and 8:30 AM right to your doorstep.</p>
          </div>
        </div>
        <div className="perk-card">
          <span className="perk-emoji">🤝</span>
          <div>
            <h4>Human Helpline & WhatsApp</h4>
            <p>Talk to our Bangalore operations team directly at +91 76710 14068 for any assistance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerDashboard;
