import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './components/Home/Home';
import ProductList from './components/Products/ProductList';
import ProductDetail from './components/Products/ProductDetail';
import Cart from './components/Cart/Cart';
import Orders from './components/Orders/Orders';
import FarmerDashboard from './components/Farmer/FarmerDashboard';
import ConsumerDashboard from './components/Consumer/ConsumerDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminProducts from './components/Admin/AdminProducts';
import AdminOrders from './components/Admin/AdminOrders';
import AdminSupport from './components/Admin/AdminSupport';
import UserList from './components/Admin/UserList';
import SupportDashboard from './components/Support/SupportDashboard';
import OrderTracking from './components/Tracking/OrderTracking';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import SmoothScrollProvider from './components/UI/SmoothScrollProvider';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import './App.css';
import './styles/admin.css';
import './styles/farm2home.css';

// Protected route that redirects based on user role
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // If trying to access a protected route without authentication, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect based on user role
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
};

const AppContent = () => {
  const location = useLocation();

  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<RoleBasedRedirect />} />
            
            <Route
              path="/cart"
              element={
                <ProtectedRoute allowedRoles={['consumer']}>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={['consumer', 'farmer']}>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <SupportDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tracking"
              element={
                <ProtectedRoute>
                  <OrderTracking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tracking/:orderId"
              element={
                <ProtectedRoute>
                  <OrderTracking />
                </ProtectedRoute>
              }
            />
            
            {/* Role-specific dashboards */}
            <Route
              path="/consumer-dashboard"
              element={
                <ProtectedRoute allowedRoles={['consumer']}>
                  <ConsumerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer-dashboard"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <FarmerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/support"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSupport />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
        <Footer />
      </div>
  );
};

function App() {
  return (
    <SmoothScrollProvider>
      <AppContent />
    </SmoothScrollProvider>
  );
}

export default App;

