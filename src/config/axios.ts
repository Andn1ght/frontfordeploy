import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for regular requests
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => {
    // If the response is a string, wrap it in an object
    if (typeof response.data === 'string' && response.config.url?.includes('/upload')) {
      return {
        ...response,
        data: { id: response.data }
      };
    }
    return response;
  },
  (error) => {
    let message = 'An error occurred';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      message = error.response.data?.message || message;
      
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      message = 'No response from server';
    } else {
      // Something happened in setting up the request that triggered an Error
      message = error.message;
    }
    
    // Don't show toast for upload errors as they're handled separately
    if (!error.config?.url?.includes('/upload')) {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;