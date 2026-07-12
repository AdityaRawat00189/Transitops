import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Direct URL to avoid Vite proxy issues
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
