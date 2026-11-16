import React from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaPhoneAlt, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand & Mission */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-brand">
              <span className="brand-icon">🌾</span>
              <span className="brand-text">FarmToHome</span>
            </Link>
            <p className="footer-mission">
              Connecting rural family farms directly with conscious consumers.
              Fresh morning harvest, zero artificial cold storage, and fair incomes for the hands that feed us.
            </p>
            <div className="footer-badges">
              <span className="footer-badge">🌱 100% Pesticide-Tested</span>
              <span className="footer-badge">🚜 Verified Cultivators</span>
            </div>
          </div>

          {/* Fresh Produce Categories */}
          <div className="footer-col">
            <h3>Farm Categories</h3>
            <ul className="footer-links">
              <li><Link to="/products?category=vegetables">Fresh Vegetables</Link></li>
              <li><Link to="/products?category=fruits">Orchard Fruits</Link></li>
              <li><Link to="/products?category=grains">Whole Grains & Rice</Link></li>
              <li><Link to="/products?category=pulses">Organic Dals & Pulses</Link></li>
              <li><Link to="/products?category=dairy">Pure Milk & Farm Dairy</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/products">Browse All Produce</Link></li>
              <li><Link to="/#how-it-works">How Delivery Works</Link></li>
              <li><Link to="/tracking">Track Your Order</Link></li>
              <li><Link to="/support">Help & Support Desk</Link></li>
              <li><Link to="/register" state={{ role: 'farmer' }}>Register as a Farmer</Link></li>
              <li><Link to="/login">Account Login</Link></li>
            </ul>
          </div>

          {/* Human Contact & Assistance */}
          <div className="footer-col contact-col">
            <h3>Talk to Us</h3>
            <p className="contact-sub">Real people, no robotic automated menus.</p>
            <ul className="contact-list">
              <li>
                <FaPhoneAlt className="contact-icon" />
                <a href="tel:7671014068">+91 76710 14068</a>
              </li>
              <li>
                <FaWhatsapp className="contact-icon whatsapp" />
                <a
                  href="https://wa.me/917671014068?text=Hello%20FarmToHome"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp Direct Chat
                </a>
              </li>
              <li>
                <FaEnvelope className="contact-icon" />
                <a href="mailto:help@farmtohome.com">help@farmtohome.com</a>
              </li>
              <li>
                <FaMapMarkerAlt className="contact-icon" />
                <span>Indiranagar & Doddaballapura Hubs, Bengaluru</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} FarmToHome Marketplace. Built with <FaHeart style={{ color: '#e53935', margin: '0 4px' }} /> for Indian farmers & families.</p>
          <div className="footer-bottom-links">
            <Link to="/support">Contact Admin</Link>
            <span>•</span>
            <Link to="/products">Storefront</Link>
            <span>•</span>
            <span>Morning Delivery Window: 6:30 AM – 8:30 AM</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
