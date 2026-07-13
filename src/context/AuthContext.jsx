import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

// Wrapping the whole app in this provider means any component can call
// useAuth() to know who's logged in, without passing user data down
// through props at every level ("prop drilling").
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, check if we already have a saved token (e.g. the user
  // refreshed the page) and restore their session instead of forcing a
  // fresh login every time.
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
      // Clear local state even if the API call fails (e.g. no internet) —
      // the user should always be able to log out of THIS device, even if
      // we can't reach the server to revoke the token remotely right now.
      clearSession();
    }
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
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook so components just write `const { user, login } = useAuth();`
// instead of importing useContext and AuthContext separately every time.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return context;
}
