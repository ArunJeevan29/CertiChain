import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('certificate_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (Optional but good for global 401 handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // We will handle 401 globally in AuthContext if needed, 
      // but simple interceptor can also exist here.
      // E.g., if token expires, we could clear localStorage here.
    }
    return Promise.reject(error);
  }
);

export default api;
