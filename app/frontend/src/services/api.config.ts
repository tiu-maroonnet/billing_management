import axios from 'axios';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = getCookie('access_token') || localStorage.getItem('access_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = getCookie('refresh_token') || localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`
              }
            }
          );

          const { access_token } = response.data;
          
          // Store new token
          setCookie('access_token', access_token);
          localStorage.setItem('access_token', access_token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        deleteCookie('access_token');
        deleteCookie('refresh_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      console.error('Access forbidden. Insufficient permissions.');
    }

    if (error.response?.status === 500) {
      console.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default api;