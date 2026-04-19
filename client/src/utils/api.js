import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true
});

// Attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('lifeos_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lifeos_token');
      localStorage.removeItem('lifeos_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;