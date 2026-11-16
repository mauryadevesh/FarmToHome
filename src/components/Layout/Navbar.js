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
  FaUsers
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

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
        {active && (
          <motion.div
            layoutId="navActiveIndicator"
            className="nav-active-indicator"
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          />
        )}
      </Link>
    );
  };

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Brand Masthead */}
        <Link to="/" className="site-brand">
          <span className="brand-wordmark">FarmToHome</span>
          <span className="brand-descriptor">Direct growers marketplace</span>
        </Link>

        {/* Primary Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          {renderNavLink('/', <FaHome className="nav-icon" />, 'Home')}
          {renderNavLink('/products', <FaStore className="nav-icon" />, 'Produce')}

          {/* Consumer navigation */}
          {isAuthenticated && user?.role === 'consumer' && (
            <>
              {renderNavLink('/cart', <FaShoppingCart className="nav-icon" />, 'Cart')}
              {renderNavLink('/orders', <FaClipboardList className="nav-icon" />, 'Orders')}
              {renderNavLink('/tracking', <FaMapMarkerAlt className="nav-icon" />, 'Tracking')}
              {renderNavLink('/consumer-dashboard', null, 'Account')}
            </>
          )}

          {/* Farmer navigation */}
          {isAuthenticated && user?.role === 'farmer' && (
            <>
              {renderNavLink('/farmer-dashboard', <FaLeaf className="nav-icon" />, 'Grower hub')}
              {renderNavLink('/orders', <FaClipboardList className="nav-icon" />, 'Harvest orders')}
            </>
          )}

          {/* Admin navigation */}
          {isAuthenticated && user?.role === 'admin' && (
            <>
              {renderNavLink('/admin-dashboard', null, 'Dashboard')}
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
              <Link to="/login" className="btn btn--secondary btn--sm">
                <FaSignInAlt className="btn-icon" />
                <span>Sign in</span>
              </Link>
              <Link to="/register" className="btn btn--primary btn--sm">
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
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mobile-drawer-links">
            <Link to="/" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link to="/products" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              Seasonal produce
            </Link>

            {isAuthenticated && user?.role === 'consumer' && (
              <>
                <Link to="/cart" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  Shopping cart
                </Link>
                <Link to="/orders" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  Order history
                </Link>
                <Link to="/tracking" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  Order tracking
                </Link>
                <Link to="/consumer-dashboard" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  Member profile
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'farmer' && (
              <>
                <Link to="/farmer-dashboard" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  Farm management
                </Link>
                <Link to="/orders" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  Incoming orders
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Link to="/admin-dashboard" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  Platform overview
                </Link>
                <Link to="/admin/products" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  Manage catalog
                </Link>
                <Link to="/admin/orders" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  All orders
                </Link>
                <Link to="/admin/users" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  User roles
                </Link>
                <Link to="/admin/support" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  Support tickets
                </Link>
              </>
            )}

            <Link to="/support" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              Customer support
            </Link>
          </div>

          <div className="mobile-drawer-footer">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="btn btn--secondary btn--block"
              >
                Sign out ({user?.name})
              </button>
            ) : (
              <div className="mobile-drawer-auth">
                <Link to="/login" className="btn btn--secondary btn--block" onClick={() => setIsMenuOpen(false)}>
                  Sign in
                </Link>
                <Link to="/register" className="btn btn--primary btn--block" onClick={() => setIsMenuOpen(false)}>
                  Create account
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </header>
  );
};

export default Navbar;
