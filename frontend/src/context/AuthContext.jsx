import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('certificate_auth_token');
    const storedUser = localStorage.getItem('certificate_auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data.data;
        
        // MVP Storage Mechanism: localStorage.
        // For production, httpOnly cookies are recommended for better security.
        localStorage.setItem('certificate_auth_token', newToken);
        localStorage.setItem('certificate_auth_user', JSON.stringify(newUser));
        
        setToken(newToken);
        setUser(newUser);
        
        return { success: true, role: newUser.role };
      }
    } catch (error) {
      // Return safe error message
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  const register = async (studentData) => {
    try {
      const response = await api.post('/auth/register', studentData);
      
      if (response.data.success) {
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('certificate_auth_token');
    localStorage.removeItem('certificate_auth_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
