import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaShoppingCart,
  FaBox,
  FaUserTie,
  FaLeaf,
  FaHome,
  FaStore,
  FaClipboardList,
  FaHeadset,
  FaSignInAlt,
  FaUserPlus,
  FaMapMarkerAlt,
  FaSignOutAlt
} from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePath, setActivePath] = useState('');

  // Close mobile menu when route changes
  useEffect(() => {
    setActivePath(location.pathname);
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout(() => {
      navigate('/login');
    });
  };

  const isActive = (path) => {
    return activePath === path ? 'active' : '';
  };

  const getRoleStyle = () => {
    const baseStyle = {
      padding: '0.2rem 0.6rem',
      borderRadius: '12px',
      fontSize: '0.72rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginLeft: '0.4rem',
      color: 'white',
      display: 'inline-block',
    };

    switch (user?.role) {
      case 'admin':
        return { ...baseStyle, backgroundColor: '#7b1fa2' };
      case 'farmer':
        return { ...baseStyle, backgroundColor: '#2e7d32' };
      case 'consumer':
        return { ...baseStyle, backgroundColor: '#0288d1' };
      default:
        return baseStyle;
    }
  };

  // Nav links for both guests and authenticated users
  const renderNavLinks = (isMobile = false) => {
    const handleLinkClick = () => {
      if (isMobile) setIsMenuOpen(false);
    };

    if (!isAuthenticated) {
      return (
        <>
          <Link to="/" className={`nav-link ${isActive('/')}`} onClick={handleLinkClick}>
            <FaHome className="nav-icon" />
            <span>Home</span>
          </Link>
          <Link to="/products" className={`nav-link ${isActive('/products')}`} onClick={handleLinkClick}>
            <FaStore className="nav-icon" />
            <span>Fresh Produce</span>
          </Link>
          <Link to="/support" className={`nav-link ${isActive('/support')}`} onClick={handleLinkClick}>
            <FaHeadset className="nav-icon" />
            <span>Help & Support</span>
          </Link>
        </>
      );
    }

    return (
      <>
        <Link to="/" className={`nav-link ${isActive('/')}`} onClick={handleLinkClick}>
          <FaHome className="nav-icon" />
          <span>Home</span>
        </Link>

        <Link to="/products" className={`nav-link ${isActive('/products')}`} onClick={handleLinkClick}>
          <FaStore className="nav-icon" />
          <span>Products</span>
        </Link>

        {/* Consumer-specific links */}
        {user?.role === 'consumer' && (
          <>
            <Link to="/cart" className={`nav-link ${isActive('/cart')}`} onClick={handleLinkClick}>
              <FaShoppingCart className="nav-icon" />
              <span>Cart</span>
            </Link>
            <Link to="/orders" className={`nav-link ${isActive('/orders')}`} onClick={handleLinkClick}>
              <FaClipboardList className="nav-icon" />
              <span>My Orders</span>
            </Link>
            <Link to="/tracking" className={`nav-link ${isActive('/tracking')}`} onClick={handleLinkClick}>
              <FaMapMarkerAlt className="nav-icon" />
              <span>Track Order</span>
            </Link>
            <Link to="/consumer-dashboard" className={`nav-link ${isActive('/consumer-dashboard')}`} onClick={handleLinkClick}>
              <FaUserTie className="nav-icon" />
              <span>My Account</span>
            </Link>
          </>
        )}

        {/* Farmer-specific links */}
        {user?.role === 'farmer' && (
          <>
            <Link to="/farmer-dashboard" className={`nav-link ${isActive('/farmer-dashboard')} farmer-link`} onClick={handleLinkClick}>
              <FaLeaf className="nav-icon" />
              <span>My Farm Dashboard</span>
            </Link>
            <Link to="/orders" className={`nav-link ${isActive('/orders')}`} onClick={handleLinkClick}>
              <FaClipboardList className="nav-icon" />
              <span>Orders</span>
            </Link>
          </>
        )}

        {/* Admin-specific links */}
        {user?.role === 'admin' && (
          <>
            <Link to="/admin-dashboard" className={`nav-link ${isActive('/admin-dashboard')} admin-link`} onClick={handleLinkClick}>
              <FaHome className="nav-icon" />
              <span>Dashboard</span>
            </Link>
            <Link to="/admin/products" className={`nav-link ${isActive('/admin/products')}`} onClick={handleLinkClick}>
              <FaBox className="nav-icon" />
              <span>Products</span>
            </Link>
            <Link to="/admin/orders" className={`nav-link ${isActive('/admin/orders')}`} onClick={handleLinkClick}>
              <FaClipboardList className="nav-icon" />
              <span>Orders</span>
            </Link>
            <Link to="/admin/users" className={`nav-link ${isActive('/admin/users')}`} onClick={handleLinkClick}>
              <FaUserTie className="nav-icon" />
              <span>Users</span>
            </Link>
            <Link to="/admin/support" className={`nav-link ${isActive('/admin/support')}`} onClick={handleLinkClick}>
              <FaHeadset className="nav-icon" />
              <span>Support</span>
            </Link>
          </>
        )}

        {/* Support link for regular users */}
        {user?.role !== 'admin' && (
          <Link to="/support" className={`nav-link ${isActive('/support')}`} onClick={handleLinkClick}>
            <FaHeadset className="nav-icon" />
            <span>Support</span>
          </Link>
        )}
      </>
    );
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-logo">🌾</span>
          <span className="brand-name">FarmToHome</span>
          <span className="brand-caption">Direct from farmers to your table</span>
        </Link>

        {/* Desktop Navigation Menu */}
        <div className="navbar-menu">
          {renderNavLinks(false)}
        </div>

        {/* Auth Section */}
        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="user-menu">
              <div className="user-greeting">
                <span className="welcome-text">Hi, {user?.name?.split(' ')[0] || 'User'}</span>
                <span className="user-role" style={getRoleStyle()}>
                  {user?.role}
                </span>
              </div>
              <button 
                onClick={handleLogout} 
                className="btn btn-outline btn-sm logout-btn"
                title="Logout from FarmToHome"
              >
                <FaSignOutAlt style={{ marginRight: '4px' }} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link 
                to="/login" 
                className="btn btn-outline"
                state={{ from: location.pathname }}
              >
                <FaSignInAlt className="btn-icon" />
                <span>Login</span>
              </Link>
              <Link 
                to="/register" 
                className="btn btn-primary"
                state={{ from: location.pathname }}
              >
                <FaUserPlus className="btn-icon" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          className={`mobile-menu-toggle ${isMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        {renderNavLinks(true)}

        <div className="mobile-menu-footer">
          {isAuthenticated ? (
            <div className="mobile-user-section">
              <div className="mobile-user-badge">
                Logged in as <strong>{user?.name}</strong> ({user?.role})
              </div>
              <button 
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }} 
                className="btn btn-outline btn-block"
              >
                <FaSignOutAlt style={{ marginRight: '6px' }} />
                Logout
              </button>
            </div>
          ) : (
            <div className="mobile-auth-buttons">
              <Link 
                to="/login" 
                className="btn btn-outline btn-block"
                onClick={() => setIsMenuOpen(false)}
                state={{ from: location.pathname }}
              >
                <FaSignInAlt className="btn-icon" />
                Login
              </Link>
              <Link 
                to="/register" 
                className="btn btn-primary btn-block"
                onClick={() => setIsMenuOpen(false)}
                state={{ from: location.pathname }}
              >
                <FaUserPlus className="btn-icon" />
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
