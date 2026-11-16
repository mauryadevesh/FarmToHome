import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Auth init: Token found in localStorage:', !!token);
      if (token) {
        api.setToken(token);
        try {
          const userData = await api.getCurrentUser();
          if (userData) {
            console.log('Auth init: User data received:', userData);
            setUser(userData);
          } else {
            console.log('Auth init: No user data, keeping token');
            // Keep the token even if getCurrentUser fails
            // This ensures login persistence
          }
        } catch (apiError) {
          console.log('Auth init: getCurrentUser failed, but keeping token');
          // Don't clear the token on API failure
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Don't clear token on initialization error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email, password, onSuccess = () => {}) => {
    setLoading(true);
    setError(null);
    try {
      console.log('AuthContext: Attempting login for:', email);
      const result = await api.login(email, password);
      console.log('AuthContext: Login result:', result);
      if (result && result.token) {
        // Token is already set in API service
        console.log('AuthContext: Setting user:', result.user);
        setUser(result.user);
        console.log('AuthContext: User state set, localStorage token:', localStorage.getItem('token'));
        onSuccess(result.user);
        return { success: true, user: result.user };
      } else {
        console.error('AuthContext: Invalid result:', result);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      const message = error.response?.message || error.message || 'Login failed. Please check your credentials.';
      console.log('AuthContext: Setting error message:', message);
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData, onSuccess = () => {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.register(userData);
      if (result.success) {
        setUser(result.user);
        onSuccess(result.user);
      }
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.message || 'Registration failed. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = (onSuccess = () => {}) => {
    api.logout();
    setUser(null);
    setError(null);
    onSuccess();
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
