import axios from 'axios';

// Base URL from Vercel environment variable
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('lifeos_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle unauthorized responses (auto logout)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lifeos_token');
      localStorage.removeItem('lifeos_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
