import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaShoppingCart,
  FaBox,
  FaHome,
  FaStore,
  FaClipboardList,
  FaHeadset,
  FaSignInAlt,
  FaUserPlus,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaLeaf,
  FaUsers,
  FaUserCircle,
  FaTachometerAlt
} from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile drawer on route transition
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout(() => {
      navigate('/login');
    });
  };

  const renderNavLink = (to, icon, label) => {
    const active = location.pathname === to;
    return (
      <Link to={to} className={`nav-link ${active ? 'nav-item--active' : ''}`}>
        {icon}
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Brand Masthead */}
        <Link to="/" className="site-brand">
          <div className="brand-logo-badge">
            <FaLeaf className="brand-leaf-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-name">
              Farm<span className="brand-accent">2</span>Home
            </span>
            <span className="brand-tagline">Fresh Local Produce</span>
          </div>
        </Link>

        {/* Primary Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          {renderNavLink('/', <FaHome className="nav-icon" />, 'Home')}
          {renderNavLink('/products', <FaStore className="nav-icon" />, 'Produce')}

          {/* Consumer navigation */}
          {isAuthenticated && user?.role === 'consumer' && (
            <>
              {renderNavLink('/cart', <FaShoppingCart className="nav-icon" />, 'Cart')}
              {renderNavLink('/orders', <FaClipboardList className="nav-icon" />, 'My Orders')}
              {renderNavLink('/tracking', <FaMapMarkerAlt className="nav-icon" />, 'Tracking')}
              {renderNavLink('/consumer-dashboard', <FaUserCircle className="nav-icon" />, 'Account')}
            </>
          )}

          {/* Farmer navigation */}
          {isAuthenticated && user?.role === 'farmer' && (
            <>
              {renderNavLink('/farmer-dashboard', <FaLeaf className="nav-icon" />, 'Grower Hub')}
              {renderNavLink('/orders', <FaClipboardList className="nav-icon" />, 'Harvest Orders')}
            </>
          )}

          {/* Admin navigation */}
          {isAuthenticated && user?.role === 'admin' && (
            <>
              {renderNavLink('/admin-dashboard', <FaTachometerAlt className="nav-icon" />, 'Admin Hub')}
              {renderNavLink('/admin/products', <FaBox className="nav-icon" />, 'Catalog')}
              {renderNavLink('/admin/orders', <FaClipboardList className="nav-icon" />, 'Orders')}
              {renderNavLink('/admin/users', <FaUsers className="nav-icon" />, 'Members')}
              {renderNavLink('/admin/support', <FaHeadset className="nav-icon" />, 'Support')}
            </>
          )}

          {/* Universal Help link */}
          {(!user || user.role !== 'admin') && renderNavLink('/support', <FaHeadset className="nav-icon" />, 'Help')}
        </nav>

        {/* Auth & Session Actions */}
        <div className="header-actions">
          {isAuthenticated ? (
            <div className="session-pill">
              <span className="session-name">{user?.name?.split(' ')[0] || 'Member'}</span>
              <span className={`role-tag role-tag--${user?.role}`}>{user?.role}</span>
              <button
                onClick={handleLogout}
                className="btn-text-logout"
                title="Sign out of account"
              >
                <FaSignOutAlt />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <div className="guest-actions">
              <Link to="/login" className="btn-signin">
                <FaSignInAlt className="btn-icon" />
                <span>Sign in</span>
              </Link>
              <Link to="/register" className="btn-join">
                <FaUserPlus className="btn-icon" />
                <span>Join</span>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className={`mobile-toggle ${isMenuOpen ? 'mobile-toggle--active' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMenuOpen}
          >
            <span className="toggle-line"></span>
            <span className="toggle-line"></span>
            <span className="toggle-line"></span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="mobile-drawer-inner">
              <div className="mobile-locality-banner">
                <FaMapMarkerAlt />
                <span>Serving Mira Road East, Bhayandar West, Uttan & nearby localities</span>
              </div>
              <nav className="mobile-nav" aria-label="Mobile Navigation">
                <Link to="/" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  <FaHome /> Home
                </Link>
                <Link to="/products" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  <FaStore /> Produce Index
                </Link>

                {isAuthenticated && user?.role === 'consumer' && (
                  <>
                    <Link to="/cart" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                      <FaShoppingCart /> Cart
                    </Link>
                    <Link to="/orders" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                      <FaClipboardList /> Orders
                    </Link>
                    <Link to="/tracking" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                      <FaMapMarkerAlt /> Live Order Tracking
                    </Link>
                    <Link to="/consumer-dashboard" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                      Account Overview
                    </Link>
                  </>
                )}

                {isAuthenticated && user?.role === 'farmer' && (
                  <>
                    <Link to="/farmer-dashboard" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                      <FaLeaf /> Grower Hub
                    </Link>
                    <Link to="/orders" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                      <FaClipboardList /> Harvest Orders
                    </Link>
                  </>
                )}

                {isAuthenticated && user?.role === 'admin' && (
                  <>
                    <Link to="/admin-dashboard" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                      Operations Dashboard
                    </Link>
                    <Link to="/admin/products" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                      <FaBox /> Product Catalog
                    </Link>
                    <Link to="/admin/orders" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                      <FaClipboardList /> Order Management
                    </Link>
                    <Link to="/admin/users" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                      <FaUsers /> User Audit
                    </Link>
                    <Link to="/admin/support" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                      <FaHeadset /> Support Queue
                    </Link>
                  </>
                )}

                {(!user || user.role !== 'admin') && (
                  <Link to="/support" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                    <FaHeadset /> Support Desk
                  </Link>
                )}
              </nav>

              <div className="mobile-drawer-auth">
                {isAuthenticated ? (
                  <button onClick={handleLogout} className="btn btn--secondary btn--full">
                    <FaSignOutAlt /> Sign Out ({user?.name?.split(' ')[0]})
                  </button>
                ) : (
                  <div className="mobile-auth-grid">
                    <Link to="/login" className="btn btn--secondary" onClick={() => setIsMenuOpen(false)}>
                      Sign In
                    </Link>
                    <Link to="/register" className="btn btn--primary" onClick={() => setIsMenuOpen(false)}>
                      Join Free
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
