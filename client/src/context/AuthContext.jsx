import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mini_crm_token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = () => {
    localStorage.removeItem('mini_crm_token');
    localStorage.removeItem('mini_crm_admin');
    setToken('');
    setAdmin(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Set default Axios auth header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token/fetch profile on mount if token exists
      const storedAdmin = localStorage.getItem('mini_crm_admin');
      if (storedAdmin) {
        try {
          setAdmin(JSON.parse(storedAdmin));
        } catch (e) {
          setAdmin(null);
        }
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setAdmin(null);
    }
    setLoading(false);
  }, [token]);

  // Global 401 interceptor — auto-logout on expired/invalid token
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem('mini_crm_token');
          localStorage.removeItem('mini_crm_admin');
          setToken('');
          setAdmin(null);
          delete axios.defaults.headers.common['Authorization'];
        }
        return Promise.reject(err);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      if (response.data.success) {
        const { token: newToken, ...adminData } = response.data.data;
        localStorage.setItem('mini_crm_token', newToken);
        localStorage.setItem('mini_crm_admin', JSON.stringify(adminData));
        // Set header immediately before state update triggers re-render,
        // so DashboardPage's fetchLeads() has the header available on first call
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        setAdmin(adminData);
        return { success: true };
      }
    } catch (err) {
      let message;
      if (!err.response) {
        // Network error / CORS failure
        message = 'Unable to connect to the server. Check that the backend is running and your device is on the same network.';
      } else if (err.response.status === 401) {
        message = err.response.data?.message || 'Invalid email or password.';
      } else if (err.response.status === 400) {
        message = err.response.data?.message || 'Please check your input.';
      } else if (err.response.status === 403) {
        message = err.response.data?.message || 'Access denied.';
      } else if (err.response.status >= 500) {
        message = 'A server error occurred. Please try again in a moment.';
      } else {
        message = err.response.data?.message || 'Login failed. Please try again.';
      }
      setError(message);
      return { success: false, message };
    }
  };

  return (
    <AuthContext.Provider value={{ admin, token, loading, error, login, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
