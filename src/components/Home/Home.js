import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, useReducedMotion } from 'framer-motion';
import { PageTransition } from '../UI/Motion';
import {
  FaLeaf,
  FaTruck,
  FaRupeeSign,
  FaUsers,
  FaArrowRight,
  FaPhoneAlt,
  FaWhatsapp,
  FaSearch,
  FaMapMarkerAlt,
  FaClock,
  FaShieldAlt,
  FaAward,
  FaCheckCircle,
  FaCalendarCheck,
  FaSeedling
} from 'react-icons/fa';
import apiService from '../../services/api';
import formatCurrency from '../../utils/currency';

const categories = [
  { name: 'Fresh Vegetables', category: 'vegetables', count: '9 items', desc: 'Desi tomatoes, red onions, potatoes, bhindi' },
  { name: 'Leafy Greens', category: 'leafy_greens', count: '4 items', desc: 'Fresh palak, tender methi, coriander from Chena Creek' },
  { name: 'Farm Fruits', category: 'fruits', count: '6 items', desc: 'Vasai gold bananas, Ratnagiri Alphonso, pomegranates' },
  { name: 'Grains & Pulses', category: 'grains', count: '6 items', desc: 'Aged Wada Kolam rice, unpolished yellow moong dal' },
  { name: 'Dairy & Farm Fresh', category: 'dairy', count: '3 items', desc: 'A2 Gir cow milk, thick artisanal curd, country eggs' },
  { name: 'Spices & Aromatics', category: 'spices', count: '2 items', desc: 'Sun-dried chillies and freshly ground seasonings' },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [deliverySlots, setDeliverySlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadHomeData() {
      try {
        const [prodData, farmerData, slotData] = await Promise.all([
          apiService.getProducts(),
          apiService.getFarmers(),
          apiService.getDeliverySlots()
        ]);
        if (isMounted) {
          setFeaturedProducts((prodData || []).slice(0, 4));
          setFarmers(farmerData || []);
          setDeliverySlots((slotData || []).slice(0, 3));
        }
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadHomeData();
    return () => { isMounted = false; };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <PageTransition className="home-editorial">
      {/* 0. Idea Lab Problem Statement Ribbon */}
      <div className="idealab-ribbon">
        <div className="idealab-ribbon-content">
          <span className="idealab-badge">
            <FaAward /> Idea Lab College Project
          </span>
          <span className="idealab-text">
            <strong>Mira Bhayandar Challenge:</strong> Connecting local cultivators in Uttan, Chena Creek & Rai directly with urban households, eliminating 40–60% middleman deduction and irregular delivery schedules.
          </span>
          <Link to="/products" className="idealab-link">
            Explore Direct Model →
          </Link>
        </div>
      </div>

      {/* 1. Hero Stage */}
      <section className="hero-stage">
        <div className="hero-stage-container">
          <motion.div
            className="hero-copy"
            initial={shouldReduceMotion ? false : "hidden"}
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="hero-locality-badge">
              <FaMapMarkerAlt className="icon-pulse" />
              <span>Direct Peri-Urban Harvest • Mira Bhayandar & Vasai Belt</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="hero-title">
              Fresh from Local Farms <span className="hero-title-italic">to Your Home</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="hero-summary">
              Empowering local cultivators near Mira Bhayandar to sell farm-fresh harvests directly to urban families. 0% middleman markups, 100% transparent pricing, and predictable scheduled delivery slots.
            </motion.p>

            {/* Interactive Produce Search Bar */}
            <motion.form variants={fadeInUp} onSubmit={handleSearchSubmit} className="hero-search-box">
              <FaSearch className="search-box-icon" />
              <input
                type="text"
                placeholder="Search fresh tomatoes, palak, methi, bananas, milk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hero-search-input"
                aria-label="Search produce"
              />
              <button type="submit" className="hero-search-btn">
                Search Produce
              </button>
            </motion.form>

            <motion.div variants={fadeInUp} className="hero-actions">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/products" className="btn btn--primary">
                  Browse Fresh Catalog
                  <FaArrowRight className="btn-icon-trailing" />
                </Link>
              </motion.div>
              {!isAuthenticated ? (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/register" state={{ role: 'farmer' }} className="btn btn--secondary">
                    Join as Local Farmer
                  </Link>
                </motion.div>
              ) : user?.role === 'farmer' ? (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/farmer-dashboard" className="btn btn--secondary">
                    Open Grower Hub
                  </Link>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/orders" className="btn btn--secondary">
                    Track My Deliveries
                  </Link>
                </motion.div>
              )}
            </motion.div>

            <motion.div variants={fadeInUp} className="hero-provenance-strip">
              <div className="prov-cell">
                <span className="prov-metric">0%</span>
                <span className="prov-metric-sub">Intermediary cut</span>
                <span className="prov-text">Direct farmer remuneration</span>
              </div>
              <div className="prov-cell">
                <span className="prov-metric">&lt;12h</span>
                <span className="prov-metric-sub">Field to kitchen</span>
                <span className="prov-text">Harvested same morning</span>
              </div>
              <div className="prov-cell">
                <span className="prov-metric">3 Slots</span>
                <span className="prov-metric-sub">Daily delivery windows</span>
                <span className="prov-text">Predictable transit schedule</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hero-ambient-glow" />
            <div className="hero-frame">
              <div className="hero-floating-badge">
                <FaLeaf style={{ fontSize: '11px' }} />
                <span>Verified Direct Sourced</span>
              </div>

              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80"
                alt="Fresh daylight harvest of greens and vegetables from Uttan farms"
                className="hero-image-fill"
              />

              <div className="hero-floating-farmer">
                <div className="hero-farmer-profile">
                  <div className="hero-farmer-avatar">
                    <FaLeaf />
                  </div>
                  <div className="hero-farmer-meta">
                    <span className="hero-farmer-name">Ramesh Patil</span>
                    <span className="hero-farmer-village">Uttan Coastal Agro Farm • Mira Bhayandar</span>
                  </div>
                </div>
              </div>

              <div className="hero-image-caption">
                <span className="caption-tag">Daily Morning Harvest</span>
                <span>Uttan & Chena Creek Green Belts</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Featured Seasonal Produce */}
      <section className="featured-produce-section">
        <div className="section-head-minimal">
          <div>
            <span className="section-label">Fresh Morning Pick</span>
            <h2 className="section-title">Today's Harvest from Local Plots</h2>
          </div>
          <Link to="/products" className="section-link">
            Explore All Produce ({featuredProducts.length > 0 ? '16+' : 'Loading...'}) <FaArrowRight />
          </Link>
        </div>

        <div className="featured-products-grid">
          {featuredProducts.map((prod) => (
            <motion.div
              key={prod.id || prod._id}
              className="featured-product-card"
              whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
            >
              <div className="product-card-image-wrap">
                <img src={prod.image} alt={prod.name} className="product-card-img" />
                <span className="product-origin-badge">
                  <FaMapMarkerAlt /> {prod.origin_farm || 'Uttan Agro Farm'}
                </span>
                <span className="product-harvest-time">
                  <FaClock /> {prod.harvest_date || 'Harvested 5:30 AM'}
                </span>
              </div>
              <div className="product-card-body">
                <div className="product-card-meta">
                  <span className="product-category-tag">{prod.category}</span>
                  <span className="product-rating-pill">★ {prod.rating || 4.8}</span>
                </div>
                <h3 className="product-card-title">{prod.name}</h3>
                <p className="product-card-desc">{prod.description}</p>
                <div className="product-card-footer">
                  <div className="product-price-block">
                    <span className="product-price">{formatCurrency(prod.price)}</span>
                    <span className="product-unit">/ {prod.unit || '1 kg'}</span>
                  </div>
                  <Link to={`/products/${prod.id || prod._id}`} className="btn btn--primary btn--sm">
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Featured Local Farmers (Mira Bhayandar Smallholders) */}
      <section className="featured-farmers-section">
        <div className="section-head-minimal">
          <div>
            <span className="section-label">Meet Your Cultivators</span>
            <h2 className="section-title">Verified Smallholders Behind Your Food</h2>
          </div>
          <span className="section-subtext">No middlemen. Direct relationships and fair trade payments.</span>
        </div>

        <div className="farmers-grid">
          {farmers.map((farmer) => (
            <motion.div
              key={farmer.id || farmer._id}
              className="farmer-card"
              whileHover={shouldReduceMotion ? undefined : { y: -5, transition: { duration: 0.25 } }}
            >
              <div className="farmer-card-header">
                <img src={farmer.image} alt={farmer.name} className="farmer-avatar-img" />
                <div className="farmer-title-block">
                  <div className="farmer-name-row">
                    <h3 className="farmer-name">{farmer.name}</h3>
                    <span className="farmer-badge-verified">
                      <FaCheckCircle /> Verified
                    </span>
                  </div>
                  <span className="farmer-farm-name">{farmer.farm_name || farmer.farmName}</span>
                  <span className="farmer-location">
                    <FaMapMarkerAlt /> {farmer.location}
                  </span>
                </div>
              </div>

              <p className="farmer-bio">{farmer.bio}</p>

              <div className="farmer-stats-strip">
                <div className="farmer-stat">
                  <span className="stat-label">Plot Size</span>
                  <span className="stat-value">{farmer.farm_size || '3 Acres'}</span>
                </div>
                <div className="farmer-stat">
                  <span className="stat-label">Experience</span>
                  <span className="stat-value">{farmer.experience_years || 10}+ Years</span>
                </div>
                <div className="farmer-stat">
                  <span className="stat-label">Buyer Rating</span>
                  <span className="stat-value">★ {farmer.rating || 4.9}</span>
                </div>
              </div>

              <div className="farmer-card-action">
                <Link
                  to={`/products?farmerId=${farmer.user_id || farmer.userId || farmer.id}`}
                  className="btn btn--secondary btn--full"
                >
                  View Harvests from this Farm →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Delivery Scheduling & Overbooking Guard Preview */}
      <section className="delivery-preview-section">
        <div className="delivery-preview-card">
          <div className="delivery-preview-info">
            <span className="section-label">Predictable Logistics</span>
            <h2 className="delivery-card-title">Mira Bhayandar Delivery Windows</h2>
            <p className="delivery-card-desc">
              Irregular delivery schedules cause food waste. Farm2Home coordinates designated morning, afternoon, and evening slots with strict capacity limits to prevent overbooking and guarantee punctual doorstep delivery.
            </p>
            <div className="coverage-areas-tags">
              <span className="cov-tag">Mira Road East</span>
              <span className="cov-tag">Bhayandar West</span>
              <span className="cov-tag">Beverly Park</span>
              <span className="cov-tag">Sheetal Nagar</span>
              <span className="cov-tag">Kanakia Spaces</span>
              <span className="cov-tag">Uttan Coastal</span>
            </div>
          </div>

          <div className="delivery-slots-column">
            <h4 className="slots-preview-title">
              <FaCalendarCheck /> Available Windows for Today:
            </h4>
            <div className="slots-stack">
              {deliverySlots.map((slot) => (
                <div key={slot.id || slot._id} className="slot-preview-item">
                  <div className="slot-item-time">
                    <FaClock className="slot-clock-icon" />
                    <div>
                      <span className="slot-time-text">{slot.time_window || slot.timeWindow}</span>
                      <span className="slot-label-text">{slot.label || 'Harvest Dispatch'}</span>
                    </div>
                  </div>
                  <div className="slot-item-capacity">
                    <span className="capacity-badge">
                      {slot.available_capacity !== undefined ? slot.available_capacity : (slot.max_capacity - slot.booked_count)} slots left
                    </span>
                    <span className="capacity-status">Active & Guaranteed</span>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/products" className="btn btn--primary btn--full" style={{ marginTop: '1rem' }}>
              Select Items & Reserve Slot
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Produce Category Index */}
      <section className="produce-index-section">
        <div className="section-head-minimal">
          <div>
            <span className="section-label">Field Index</span>
            <h2 className="section-title">Shop by Produce Category</h2>
          </div>
          <Link to="/products" className="section-link">
            View full index <FaArrowRight />
          </Link>
        </div>

        <motion.ul
          className="category-index-list"
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
        >
          {categories.map((cat, idx) => (
            <motion.li
              key={cat.category}
              className="category-index-row"
              variants={fadeInUp}
              whileHover={shouldReduceMotion ? undefined : { x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <Link to={`/products?category=${cat.category}`} className="category-index-anchor">
                <span className="category-index-order">0{idx + 1}</span>
                <div className="category-info-wrap">
                  <span className="category-index-name">{cat.name}</span>
                  <span className="category-index-desc">{cat.desc}</span>
                </div>
                <span className="category-index-count">{cat.count}</span>
                <span className="category-index-arrow">→</span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </section>

      {/* 6. "How It Works" 4-Stage Transparent Protocol */}
      <section className="workflow-section">
        <div className="section-head-minimal">
          <div>
            <span className="section-label">Field to Doorstep</span>
            <h2 className="section-title">How Farm2Home Solves the Delivery Challenge</h2>
          </div>
        </div>

        <motion.div
          className="workflow-track"
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="workflow-step" whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}>
            <div className="step-count">01</div>
            <h4 className="step-name">Direct Field Listing</h4>
            <p className="step-desc">
              Cultivators in Uttan, Chena, and Rai list exact crop harvest quantities without passing through wholesale mandis.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="workflow-step" whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}>
            <div className="step-count">02</div>
            <h4 className="step-name">Slot Selection</h4>
            <p className="step-desc">
              Consumers select their preferred morning, mid-day, or evening delivery window with automated overbooking protection.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="workflow-step" whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}>
            <div className="step-count">03</div>
            <h4 className="step-name">Morning Harvest & Pack</h4>
            <p className="step-desc">
              Crops are picked at dawn upon order confirmation, washed, quality-graded, and sorted into eco-friendly crates.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="workflow-step" whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}>
            <div className="step-count">04</div>
            <h4 className="step-name">Doorstep Dispatch</h4>
            <p className="step-desc">
              Electric delivery vans route orders across Mira Road and Bhayandar West within 12 hours of field harvest.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* 7. Benefits for Farmers & Consumers */}
      <section className="pillars-section">
        <div className="section-head-minimal">
          <div>
            <span className="section-label">Equitable Trade</span>
            <h2 className="section-title">Benefits for Both Growers and Urban Households</h2>
          </div>
        </div>

        <div className="benefits-two-column">
          <div className="benefit-column-box farmer-box">
            <div className="benefit-col-header">
              <FaSeedling className="benefit-header-icon" />
              <h3>For Local Farmers</h3>
            </div>
            <ul className="benefit-check-list">
              <li>
                <FaCheckCircle className="check-icon" />
                <div>
                  <strong>0% Commission Deductions:</strong> Keep 100% of the produce value instead of losing 40–60% to market middlemen.
                </div>
              </li>
              <li>
                <FaCheckCircle className="check-icon" />
                <div>
                  <strong>Guaranteed Advance Demand:</strong> Scheduled slots allow farmers to pick exact quantities, eliminating post-harvest wastage.
                </div>
              </li>
              <li>
                <FaCheckCircle className="check-icon" />
                <div>
                  <strong>Simple Smartphone Dashboard:</strong> One-click crop photo uploads, stock counter, and order acceptance for rural ease.
                </div>
              </li>
              <li>
                <FaCheckCircle className="check-icon" />
                <div>
                  <strong>Direct Community Recognition:</strong> Direct customer ratings and repeat household loyalty.
                </div>
              </li>
            </ul>
          </div>

          <div className="benefit-column-box consumer-box">
            <div className="benefit-col-header">
              <FaShieldAlt className="benefit-header-icon" />
              <h3>For Urban Consumers</h3>
            </div>
            <ul className="benefit-check-list">
              <li>
                <FaCheckCircle className="check-icon" />
                <div>
                  <strong>Harvested Under 12 Hours:</strong> Far crisper and more nutrient-dense than 5-day-old supermarket cold-storage produce.
                </div>
              </li>
              <li>
                <FaCheckCircle className="check-icon" />
                <div>
                  <strong>100% Traceable Provenance:</strong> Know the specific farm plot, cultivator name, and harvest timestamp for every crop.
                </div>
              </li>
              <li>
                <FaCheckCircle className="check-icon" />
                <div>
                  <strong>Predictable Delivery Windows:</strong> Choose morning (7–10 AM) or evening (5–8 PM) slots that fit your kitchen schedule.
                </div>
              </li>
              <li>
                <FaCheckCircle className="check-icon" />
                <div>
                  <strong>Live 6-Stage Tracking:</strong> Follow your basket from field harvest to electric van transit on the Mira Bhayandar route map.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 8. Sustainability & Environmental Impact */}
      <section className="sustainability-section">
        <div className="sustainability-container">
          <div className="sustainability-head">
            <span className="section-label">Sustainable Urban-Rural Linkage</span>
            <h2 className="section-title">Preserving Mira Bhayandar's Green Peri-Urban Belts</h2>
            <p className="sustainability-summary">
              Urban sprawl threatens traditional farming in Uttan and Chena Creek. By enabling direct economic viability for local farmers, Farm2Home actively protects urban green belts and cuts carbon emissions.
            </p>
          </div>

          <div className="sustainability-grid">
            <div className="sustain-card">
              <span className="sustain-stat">85%</span>
              <h4 className="sustain-card-title">Fewer Food Miles</h4>
              <p className="sustain-card-desc">
                Produce travels less than 12 km from Uttan / Chena to your doorstep, avoiding cross-state highway freight.
              </p>
            </div>
            <div className="sustain-card">
              <span className="sustain-stat">Zero</span>
              <h4 className="sustain-card-title">Single-Use Plastics</h4>
              <p className="sustain-card-desc">
                Packed in reusable wooden crates and compostable vegetable sleeves returned on the next delivery cycle.
              </p>
            </div>
            <div className="sustain-card">
              <span className="sustain-stat">100%</span>
              <h4 className="sustain-card-title">Regenerative Cultivation</h4>
              <p className="sustain-card-desc">
                Supporting vermicompost soil nourishment, native seeds, and natural pest-repellent herbs over synthetic toxins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Support & Direct Line */}
      <section className="helpline-section">
        <div className="helpline-container">
          <div className="helpline-copy">
            <span className="section-label">Grower & Customer Desk</span>
            <h2 className="section-title">Direct Connection to the Farming Hub</h2>
            <p className="helpline-desc">
              Have questions regarding daily harvest schedules, bulk orders, or grower verification? Our Mira Road fulfillment team is available daily.
            </p>
          </div>

          <div className="helpline-actions">
            <a href="tel:7671014068" className="helpline-item">
              <FaPhoneAlt className="helpline-icon" />
              <div>
                <span className="helpline-tag">Direct Helpline</span>
                <span className="helpline-val">+91 76710 14068</span>
              </div>
            </a>
            <a
              href="https://wa.me/917671014068?text=Hello%20Farm2Home%20Mira%20Bhayandar"
              target="_blank"
              rel="noopener noreferrer"
              className="helpline-item"
            >
              <FaWhatsapp className="helpline-icon" />
              <div>
                <span className="helpline-tag">WhatsApp Channel</span>
                <span className="helpline-val">Instant Chat Support</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 10. Closing Call to Action */}
      <section className="closing-statement">
        <div className="closing-inner">
          <h2 className="closing-headline">
            {isAuthenticated ? `Welcome back to the farm network, ${user?.name}.` : 'Ready to taste harvest fresh from the soil?'}
          </h2>
          <p className="closing-sub">
            Over 27 fresh seasonal items available today directly from verified smallholder cultivators in Mira Bhayandar.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn--primary">
              Browse Seasonal Produce
            </Link>
            {!isAuthenticated && (
              <Link to="/register" state={{ role: 'farmer' }} className="btn btn--secondary">
                Register as Cultivator
              </Link>
            )}
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default Home;
