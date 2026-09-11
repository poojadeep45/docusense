import React, { createContext, useContext, useState, useCallback } from 'react';
import { auth as authApi } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('docusense_token'));
  const [username, setUsername] = useState(localStorage.getItem('docusense_username'));

  const login = useCallback(async (u, password) => {
    const data = await authApi.login(u, password);
    localStorage.setItem('docusense_token', data.token);
    localStorage.setItem('docusense_username', u);
    setToken(data.token);
    setUsername(u);
  }, []);

  const register = useCallback(async (u, password, email) => {
    const data = await authApi.register(u, password, email);
    localStorage.setItem('docusense_token', data.token);
    localStorage.setItem('docusense_username', u);
    setToken(data.token);
    setUsername(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('docusense_token');
    localStorage.removeItem('docusense_username');
    setToken(null);
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, username, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}