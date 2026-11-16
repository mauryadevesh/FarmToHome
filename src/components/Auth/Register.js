import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUserPlus, FaLeaf, FaShoppingBag, FaExclamationCircle } from 'react-icons/fa';
import { PageTransition, motion, AnimatePresence } from '../UI/Motion';

const Register = () => {
  const location = useLocation();
  const initialRole = location.state?.role || 'consumer';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (location.state?.role) {
      setFormData(prev => ({ ...prev, role: location.state.role }));
    }
  }, [location.state]);

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

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required for delivery coordination';
    } else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = formData.role === 'farmer' ? 'Farm location / village is required' : 'Delivery address is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const { confirmPassword, ...registrationData } = formData;
      const result = await register(registrationData, (user) => {
        if (user.role === 'farmer') {
          navigate('/farmer-dashboard', { replace: true });
        } else {
          navigate('/consumer-dashboard', { replace: true });
        }
      });

      if (!result.success) {
        setErrors(prev => ({
          ...prev,
          form: result.message
        }));
      }
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        form: err.message || 'An error occurred during registration. Please try again.'
      }));
    }
  };

  return (
    <PageTransition className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="auth-header">
          <div className="auth-icon-badge">
            <FaLeaf />
          </div>
          <h1>Join FarmToHome</h1>
          <p>Direct farm-to-table connection with honest pricing and fresh produce.</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="alert alert-error"
            >
              <FaExclamationCircle style={{ marginRight: '6px' }} />
              {error}
            </motion.div>
          )}
          {errors.form && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="alert alert-error"
            >
              <FaExclamationCircle style={{ marginRight: '6px' }} />
              {errors.form}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group role-selector-group">
            <label className="form-label">I want to:</label>
            <div className="role-toggle-pills">
              <button
                type="button"
                className={`role-pill ${formData.role === 'consumer' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'consumer' }))}
              >
                <FaShoppingBag style={{ marginRight: '6px' }} />
                Buy Fresh Produce (Consumer)
              </button>
              <button
                type="button"
                className={`role-pill ${formData.role === 'farmer' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'farmer' }))}
              >
                <FaLeaf style={{ marginRight: '6px' }} />
                Sell Farm Harvest (Farmer)
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g. Ramesh Kumar or Priya Sharma"
              disabled={loading}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="e.g. yourname@example.com"
              disabled={loading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="e.g. +91 98765 43210"
              disabled={loading}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">
              {formData.role === 'farmer' ? 'Farm Location / Village & District' : 'Home Delivery Address'}
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`form-input ${errors.address ? 'error' : ''}`}
              placeholder={formData.role === 'farmer' ? 'e.g. Green Valley Farm, Doddaballapura, Karnataka' : 'e.g. Flat 302, Palm Grove Apts, Indiranagar, Bengaluru'}
              rows="3"
              disabled={loading}
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <div className="form-row">
            <div className="form-group col-6">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Min 6 characters"
                disabled={loading}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group col-6">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Repeat password"
                disabled={loading}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>

          <motion.button
            type="submit"
            className="btn btn-primary btn-full btn-auth-submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaUserPlus style={{ marginRight: '8px' }} />
            {loading ? 'Creating Your Account...' : `Join as ${formData.role === 'farmer' ? 'Farmer' : 'Consumer'}`}
          </motion.button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </PageTransition>
  );
};

export default Register;
