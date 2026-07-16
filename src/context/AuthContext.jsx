import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    const token = localStorage.getItem('auth_token');

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  async function register(name, email, password) {
    const response = await apiClient.post('/register', { name, email, password });
    saveSession(response.data.user, response.data.token);
    return response.data;
  }

  async function login(email, password) {
    const response = await apiClient.post('/login', { email, password });
    saveSession(response.data.user, response.data.token);
    return response.data;
  }

  async function logout() {
    try {
      await apiClient.post('/logout');
    } finally {
      clearSession();
    }
  }

  // Used after any action that changes the user's own data without a full
  // re-login — right now just the avatar upload/remove, but this is the
  // right place to plug in future profile edits (name, bio, etc.) too,
  // rather than adding a new one-off update mechanism each time.
  function updateUser(updatedUser) {
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }

  function saveSession(userData, token) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setUser(userData);
  }

  function clearSession() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return context;
}
