import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no specific roles are required, allow access
  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  // Check if user's role is in the allowed roles
  const hasPermission = allowedRoles.includes(user.role);
  
  if (!hasPermission) {
    // Redirect to dashboard based on user role
    switch(user.role) {
      case 'admin':
        return <Navigate to="/admin-dashboard" replace />;
      case 'farmer':
        return <Navigate to="/farmer-dashboard" replace />;
      case 'consumer':
        return <Navigate to="/consumer-dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
