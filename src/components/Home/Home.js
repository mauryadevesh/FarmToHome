import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, useReducedMotion } from 'framer-motion';
import { PageTransition } from '../UI/Motion';
import { FaLeaf, FaTruck, FaRupeeSign, FaUsers, FaArrowRight, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';

const categories = [
  { name: 'Fresh Vegetables', category: 'vegetables', count: '9 items' },
  { name: 'Farm Fruits', category: 'fruits', count: '6 items' },
  { name: 'Whole Grains', category: 'grains', count: '4 items' },
  { name: 'Pulses & Dals', category: 'pulses', count: '4 items' },
  { name: 'Dairy & Eggs', category: 'dairy', count: '3 items' },
  { name: 'Spices', category: 'spices', count: '1 item' },
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

  return (
    <PageTransition className="home-editorial">
      {/* 1. Hero Stage */}
      <section className="hero-stage">
        <div className="hero-stage-container">
          <motion.div
            className="hero-copy"
            initial={shouldReduceMotion ? false : "hidden"}
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="hero-badge">
              <span className="live-pulse-dot" />
              <span className="hero-badge-tag">Direct Harvest Dispatch</span>
              <span className="hero-badge-sep">•</span>
              <span className="hero-badge-location">Active across Karnataka & Tamil Nadu</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="hero-title">
              Fresh village harvests, <span className="hero-title-italic">cut today</span> for your family's table
            </motion.h1>

            <motion.p variants={fadeInUp} className="hero-summary">
              Pure seasonal produce directly from verified local smallholders. Zero cold-storage holding, zero middleman markups, delivered to your kitchen within 24 hours of harvest.
            </motion.p>

            <motion.div variants={fadeInUp} className="hero-actions">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/products" className="btn btn--primary">
                  Browse Seasonal Produce
                  <FaArrowRight className="btn-icon-trailing" />
                </Link>
              </motion.div>
              {!isAuthenticated && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/register" state={{ role: 'consumer' }} className="btn btn--secondary">
                    Join as Consumer
                  </Link>
                </motion.div>
              )}
              {isAuthenticated && user?.role === 'farmer' && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/farmer-dashboard" className="btn btn--secondary">
                    Open Grower Dashboard
                  </Link>
                </motion.div>
              )}
            </motion.div>

            <motion.div variants={fadeInUp} className="hero-provenance-strip">
              <div className="prov-cell">
                <span className="prov-metric">27</span>
                <span className="prov-metric-sub">Fresh crops</span>
                <span className="prov-text">Harvested upon order</span>
              </div>
              <div className="prov-cell">
                <span className="prov-metric">₹0</span>
                <span className="prov-metric-sub">Middleman cut</span>
                <span className="prov-text">100% fair grower payment</span>
              </div>
              <div className="prov-cell">
                <span className="prov-metric">&lt;24h</span>
                <span className="prov-metric-sub">Field to doorstep</span>
                <span className="prov-text">Same-day delivery window</span>
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
                <span>Certified Direct Sourced</span>
              </div>

              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80"
                alt="Fresh daylight harvest of greens and vegetables"
                className="hero-image-fill"
              />

              <div className="hero-floating-farmer">
                <div className="hero-farmer-profile">
                  <div className="hero-farmer-avatar">
                    <FaLeaf />
                  </div>
                  <div className="hero-farmer-meta">
                    <span className="hero-farmer-name">Kisan Ramesh Kumar</span>
                    <span className="hero-farmer-village">Green Valley Farms • Doddaballapura</span>
                  </div>
                </div>
                <div className="hero-dispatch-chip">
                  <span className="live-pulse-dot" />
                  <span>Harvesting Daily</span>
                </div>
              </div>

              <div className="hero-image-caption">
                <span className="caption-tag">Morning harvest</span>
                <span>Regional smallholder farms</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Produce Category Index */}
      <section className="produce-index-section">
        <div className="section-head-minimal">
          <div>
            <span className="section-label">Field catalog</span>
            <h2 className="section-title">Shop by produce category</h2>
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
                <span className="category-index-name">{cat.name}</span>
                <span className="category-index-count">{cat.count}</span>
                <span className="category-index-arrow">→</span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </section>

      {/* 3. The 4 Provenance Pillars */}
      <section className="pillars-section">
        <div className="section-head-minimal">
          <div>
            <span className="section-label">Our promise</span>
            <h2 className="section-title">How direct farm purchasing works</h2>
          </div>
        </div>

        <motion.div
          className="pillars-grid"
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="pillar-card" whileHover={shouldReduceMotion ? undefined : { y: -5, transition: { duration: 0.2 } }}>
            <div className="pillar-icon"><FaTruck /></div>
            <h3 className="pillar-title">Direct morning harvest</h3>
            <p className="pillar-desc">
              Produce does not sit for weeks in distributor warehouses. Crops are picked to order from local village fields.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="pillar-card" whileHover={shouldReduceMotion ? undefined : { y: -5, transition: { duration: 0.2 } }}>
            <div className="pillar-icon"><FaLeaf /></div>
            <h3 className="pillar-title">Naturally cultivated</h3>
            <p className="pillar-desc">
              Grown by family farmers employing organic mulch, soil regeneration, and pesticide-tested practices.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="pillar-card" whileHover={shouldReduceMotion ? undefined : { y: -5, transition: { duration: 0.2 } }}>
            <div className="pillar-icon"><FaRupeeSign /></div>
            <h3 className="pillar-title">Equitable farm pricing</h3>
            <p className="pillar-desc">
              Removing multiple trade layers returns more revenue to growers while consumers pay honest market rates.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="pillar-card" whileHover={shouldReduceMotion ? undefined : { y: -5, transition: { duration: 0.2 } }}>
            <div className="pillar-icon"><FaUsers /></div>
            <h3 className="pillar-title">Rural community roots</h3>
            <p className="pillar-desc">
              Every order fosters financial stability for regional agricultural families and strengthens sustainable local food networks.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* 4. Sourcing Workflow */}
      <section className="workflow-section">
        <div className="section-head-minimal">
          <div>
            <span className="section-label">Field to table</span>
            <h2 className="section-title">How your basket is fulfilled</h2>
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
            <div className="step-count">Step 1</div>
            <h4 className="step-name">Select seasonal harvest</h4>
            <p className="step-desc">Browse transparent daily listings directly posted by regional family cultivators.</p>
          </motion.div>

          <motion.div variants={fadeInUp} className="workflow-step" whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}>
            <div className="step-count">Step 2</div>
            <h4 className="step-name">Order is transmitted</h4>
            <p className="step-desc">The local farmer receives your basket details immediately to plan harvest schedules.</p>
          </motion.div>

          <motion.div variants={fadeInUp} className="workflow-step" whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}>
            <div className="step-count">Step 3</div>
            <h4 className="step-name">Morning crop harvest</h4>
            <p className="step-desc">Produce is gently gathered at dawn, cleaned, and weighed into standardized paper cartons.</p>
          </motion.div>

          <motion.div variants={fadeInUp} className="workflow-step" whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}>
            <div className="step-count">Step 4</div>
            <h4 className="step-name">Next-day arrival</h4>
            <p className="step-desc">Direct delivery to urban homes ensuring peak flavor, nutritional density, and crispness.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* 5. Support & Direct Line */}
      <section className="helpline-section">
        <div className="helpline-container">
          <div className="helpline-copy">
            <span className="section-label">Support line</span>
            <h2 className="section-title">Questions about seasonal harvest?</h2>
            <p className="helpline-desc">
              Our operations desk works alongside rural growers. Contact us for order guidance, delivery windows, or farmer onboarding.
            </p>
          </div>

          <div className="helpline-actions">
            <a href="tel:7671014068" className="helpline-item">
              <FaPhoneAlt className="helpline-icon" />
              <div>
                <span className="helpline-tag">Helpline</span>
                <span className="helpline-val">+91 76710 14068</span>
              </div>
            </a>
            <a
              href="https://wa.me/917671014068?text=Hello%20FarmToHome,%20I%20have%20a%20query"
              target="_blank"
              rel="noopener noreferrer"
              className="helpline-item"
            >
              <FaWhatsapp className="helpline-icon" />
              <div>
                <span className="helpline-tag">WhatsApp desk</span>
                <span className="helpline-val">Direct chat support</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 6. Closing Statement */}
      <section className="closing-statement">
        <div className="closing-inner">
          <h2 className="closing-headline">
            {isAuthenticated ? `Welcome back, ${user?.name}.` : 'Begin receiving honest harvest today.'}
          </h2>
          <p className="closing-sub">
            Over 27 fresh seasonal items available right now across vegetables, fruits, pulses, and farm dairy.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn--primary">
              Explore catalog
            </Link>
            {!isAuthenticated && (
              <Link to="/register" state={{ role: 'farmer' }} className="btn btn--secondary">
                Register as grower
              </Link>
            )}
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default Home;
