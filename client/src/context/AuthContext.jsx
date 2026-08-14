import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mini_crm_token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      if (response.data.success) {
        const { token: newToken, ...adminData } = response.data.data;
        localStorage.setItem('mini_crm_token', newToken);
        localStorage.setItem('mini_crm_admin', JSON.stringify(adminData));
        setToken(newToken);
        setAdmin(adminData);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your network and credentials.';
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('mini_crm_token');
    localStorage.removeItem('mini_crm_admin');
    setToken('');
    setAdmin(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ admin, token, loading, error, login, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
