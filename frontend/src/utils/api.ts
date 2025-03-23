import axios from 'axios';
import { useClerk } from '@clerk/clerk-react';

// Declare Clerk on the window object for TypeScript
declare global {
  interface Window {
    Clerk: any;
  }
}

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to get the current token
const getToken = async () => {
  const clerk = window.Clerk;
  if (!clerk || !clerk.session) return null;
  
  try {
    return await clerk.session.getToken();
  } catch (error) {
    console.error('Error getting token from Clerk:', error);
    return null;
  }
};

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  async (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    
    // Get token from Clerk
    const token = await getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      // Handle unauthorized errors
      // Only redirect if not already on login page to prevent infinite loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
