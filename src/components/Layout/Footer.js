import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="editorial-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand & Mission */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-wordmark">
              FarmToHome
            </Link>
            <p className="footer-mission">
              Direct agricultural distribution connecting regional family cultivators directly with urban households. Fresh morning harvest with transparent provenance.
            </p>
            <div className="footer-provenance-tags">
              <span className="prov-tag">Direct village harvest</span>
              <span className="prov-tag">Verified cultivators</span>
            </div>
          </div>

          {/* Fresh Produce Categories */}
          <div className="footer-col">
            <h4 className="footer-col-title">Produce Index</h4>
            <ul className="footer-links">
              <li><Link to="/products?category=vegetables">Fresh vegetables</Link></li>
              <li><Link to="/products?category=fruits">Orchard fruits</Link></li>
              <li><Link to="/products?category=grains">Whole grains</Link></li>
              <li><Link to="/products?category=pulses">Pulses & dals</Link></li>
              <li><Link to="/products?category=dairy">Farm dairy & eggs</Link></li>
            </ul>
          </div>

          {/* Quick Navigation */}
          <div className="footer-col">
            <h4 className="footer-col-title">Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/products">Browse full catalog</Link></li>
              <li><Link to="/orders">Order records</Link></li>
              <li><Link to="/tracking">Dispatch tracking</Link></li>
              <li><Link to="/support">Support desk</Link></li>
              <li><Link to="/register" state={{ role: 'farmer' }}>Grower registration</Link></li>
            </ul>
          </div>

          {/* Direct Line */}
          <div className="footer-col contact-col">
            <h4 className="footer-col-title">Grower Desk</h4>
            <ul className="footer-contact-list">
              <li>
                <FaPhoneAlt className="contact-icon" />
                <a href="tel:7671014068">+91 76710 14068</a>
              </li>
              <li>
                <FaWhatsapp className="contact-icon" />
                <a
                  href="https://wa.me/917671014068?text=Hello%20FarmToHome"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp direct channel
                </a>
              </li>
              <li>
                <FaEnvelope className="contact-icon" />
                <a href="mailto:help@farmtohome.com">help@farmtohome.com</a>
              </li>
              <li>
                <FaMapMarkerAlt className="contact-icon" />
                <span>Regional Fulfillment Hubs, Bengaluru</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-colophon">
          <p className="colophon-copy">
            © {new Date().getFullYear()} FarmToHome Protocol. Cultivated for regional Indian growers and conscious households.
          </p>
          <div className="colophon-links">
            <Link to="/support">Support</Link>
            <Link to="/products">Produce</Link>
            <span>Morning dispatch window: 6:30 AM to 8:30 AM</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
