import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaSignInAlt, FaLeaf, FaUserTie, FaUserShield, FaExclamationCircle } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const redirectTarget = location.state?.from;

      await login(formData.email, formData.password, (user) => {
        if (redirectTarget && redirectTarget !== '/login') {
          navigate(redirectTarget, { replace: true });
        } else if (user.role === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else if (user.role === 'farmer') {
          navigate('/farmer-dashboard', { replace: true });
        } else {
          navigate('/consumer-dashboard', { replace: true });
        }
      });
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        form: err.response?.message || err.message || 'Login failed. Please check your credentials.'
      }));
    }
  };

  const fillDemoAccount = (role) => {
    if (role === 'consumer') {
      setFormData({ email: 'consumer@farmtohome.com', password: 'password123' });
    } else if (role === 'farmer') {
      setFormData({ email: 'farmer@farmtohome.com', password: 'password123' });
    } else if (role === 'admin') {
      setFormData({ email: 'admin@farmtohome.com', password: 'admin123' });
    }
    setErrors({});
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">🌾</div>
          <h1>Welcome to FarmToHome</h1>
          <p>Sign in to access fresh produce orders, deliveries, or farm listings.</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <FaExclamationCircle style={{ marginRight: '6px' }} />
            {error}
          </div>
        )}
        {errors.form && (
          <div className="alert alert-error">
            <FaExclamationCircle style={{ marginRight: '6px' }} />
            {errors.form}
          </div>
        )}

        {/* Quick Demo Login Fillers for instant testing */}
        <div className="demo-accounts-box">
          <span className="demo-label">Quick Demo Logins:</span>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-btn consumer-demo"
              onClick={() => fillDemoAccount('consumer')}
            >
              <FaLeaf /> Consumer
            </button>
            <button
              type="button"
              className="demo-btn farmer-demo"
              onClick={() => fillDemoAccount('farmer')}
            >
              <FaUserTie /> Farmer
            </button>
            <button
              type="button"
              className="demo-btn admin-demo"
              onClick={() => fillDemoAccount('admin')}
            >
              <FaUserShield /> Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="e.g. consumer@farmtohome.com"
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              disabled={loading}
              autoComplete="current-password"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-auth-submit"
            disabled={loading}
          >
            <FaSignInAlt style={{ marginRight: '8px' }} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-link">
              Create an account here
            </Link>
          </p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
            <Link to="/products" className="auth-link-secondary">
              ← Continue browsing fresh produce as guest
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
