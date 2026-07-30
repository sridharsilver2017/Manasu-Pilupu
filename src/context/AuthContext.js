'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const WP_API_BASE_URL = 'https://dev-sridhar-silver.pantheonsite.io/wp-json/mp-subs/v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for token on mount
    const token = localStorage.getItem('mp_token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const res = await fetch(`${WP_API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ ...data, token });
      } else {
        // Invalid token
        localStorage.removeItem('mp_token');
        setUser(null);
      }
    } catch (err) {
      console.error('Auth verification failed', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const res = await fetch(`${WP_API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    
    localStorage.setItem('mp_token', data.token);
    setUser({ id: data.user.id, username: data.user.username, token: data.token });
    // After login, we fetch full status
    await verifyToken(data.token);
    return data;
  };

  const register = async (username, email, password) => {
    const res = await fetch(`${WP_API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    
    localStorage.setItem('mp_token', data.token);
    setUser({ id: data.user.id, username: data.user.username, token: data.token });
    await verifyToken(data.token);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('mp_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, verifyToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
