import axios from 'axios';

// All requests go through this one instance, so the base URL and auth
// header logic only need to be set up once, not repeated in every component.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
  },
});

// Before every request, check if we have a token saved and attach it.
// This is what makes every protected endpoint (my-skills, swap-requests,
// water-orders, etc.) work without repeating this logic everywhere.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever responds 401 (token invalid/expired), automatically
// log the user out on the frontend too, rather than leaving them stuck on
// a page that silently fails every request.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
