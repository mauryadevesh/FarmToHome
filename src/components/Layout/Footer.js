import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaLeaf, FaTruck, FaRupeeSign } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="editorial-footer">
      <div className="footer-container">
        {/* Top Impact Banner for College Idea Lab */}
        <div className="footer-idea-lab-strip">
          <div className="idea-lab-tag">
            <span className="idea-lab-pill">College Idea Lab Initiative</span>
            <span className="idea-lab-text">
              Direct Peri-Urban Agricultural Network solving the Mira Bhayandar farm-to-table delivery challenge.
            </span>
          </div>
          <div className="idea-lab-stats">
            <div className="lab-stat">
              <FaRupeeSign />
              <span>0% Middleman Deduction</span>
            </div>
            <div className="lab-stat">
              <FaTruck />
              <span>&lt;12h Field to Doorstep</span>
            </div>
            <div className="lab-stat">
              <FaLeaf />
              <span>100% Pesticide Tested</span>
            </div>
          </div>
        </div>

        <div className="footer-grid">
          {/* Brand & Mission */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-wordmark">
              Farm2Home
            </Link>
            <p className="footer-tagline">“Fresh from Local Farms to Your Home”</p>
            <p className="footer-mission">
              Direct agricultural distribution connecting regional family cultivators in <strong>Uttan</strong>, <strong>Chena Creek</strong>, and <strong>Rai-Morva</strong> directly with households across Mira Bhayandar. Fresh daily harvest with transparent provenance and predictable delivery schedules.
            </p>
            <div className="footer-provenance-tags">
              <span className="prov-tag">Uttan Coastal Belt</span>
              <span className="prov-tag">Chena Creek Greens</span>
              <span className="prov-tag">Rai-Morva Fields</span>
            </div>
          </div>

          {/* Fresh Produce Categories */}
          <div className="footer-col">
            <h4 className="footer-col-title">Produce Index</h4>
            <ul className="footer-links">
              <li><Link to="/products?category=vegetables">Fresh Vegetables (Tomatoes, Onions)</Link></li>
              <li><Link to="/products?category=leafy_greens">Leafy Greens (Palak, Methi, Coriander)</Link></li>
              <li><Link to="/products?category=fruits">Orchard Fruits (Vasai Bananas, Mangoes)</Link></li>
              <li><Link to="/products?category=grains">Heritage Grains & Pulses (Wada Kolam, Dals)</Link></li>
              <li><Link to="/products?category=dairy">Farm Dairy & Country Eggs</Link></li>
              <li><Link to="/products?category=spices">Native Spices & Herbs</Link></li>
            </ul>
          </div>

          {/* Quick Navigation & Delivery Slots */}
          <div className="footer-col">
            <h4 className="footer-col-title">Platform Access</h4>
            <ul className="footer-links">
              <li><Link to="/products">Browse Fresh Harvest</Link></li>
              <li><Link to="/tracking">Live Delivery Tracking (6 Stages)</Link></li>
              <li><Link to="/register" state={{ role: 'farmer' }}>Grower Onboarding (Sell Harvest)</Link></li>
              <li><Link to="/register" state={{ role: 'consumer' }}>Customer Account (Buy Direct)</Link></li>
              <li><Link to="/support">Order Help & Support Desk</Link></li>
            </ul>
            <div className="footer-delivery-windows">
              <span className="sub-heading">Delivery Windows (Mira Bhayandar):</span>
              <span className="window-pill">Morning: 7:00 AM - 10:00 AM</span>
              <span className="window-pill">Afternoon: 11:00 AM - 2:00 PM</span>
              <span className="window-pill">Evening: 5:00 PM - 8:00 PM</span>
            </div>
          </div>

          {/* Direct Line */}
          <div className="footer-col contact-col">
            <h4 className="footer-col-title">Fulfillment & Grower Desk</h4>
            <ul className="footer-contact-list">
              <li>
                <FaPhoneAlt className="contact-icon" />
                <a href="tel:7671014068">+91 76710 14068</a>
              </li>
              <li>
                <FaWhatsapp className="contact-icon" />
                <a
                  href="https://wa.me/917671014068?text=Hello%20Farm2Home%20Mira%20Bhayandar"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp Direct Support
                </a>
              </li>
              <li>
                <FaEnvelope className="contact-icon" />
                <a href="mailto:support@farm2home.in">support@farm2home.in</a>
              </li>
              <li>
                <FaMapMarkerAlt className="contact-icon" />
                <span>Station Road Collection Hub, Mira Road East, Mira Bhayandar 401107</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-colophon">
          <p className="colophon-copy">
            © {new Date().getFullYear()} Farm2Home — Idea Lab Agricultural Innovation. Direct-to-consumer peri-urban supply chain protocol.
          </p>
          <div className="colophon-links">
            <Link to="/support">Support Desk</Link>
            <Link to="/products">Seasonal Catalog</Link>
            <Link to="/tracking">Dispatch Tracker</Link>
            <span>Mira Bhayandar Municipal Area (MBMC)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
