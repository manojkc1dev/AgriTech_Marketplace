import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

api.interceptors.request.use(
  (config) => {
    // Retrieve token from possible storage keys
    const token = 
      localStorage.getItem('agritech_token') || 
      localStorage.getItem('access') || 
      localStorage.getItem('access_token') || 
      localStorage.getItem('token');
      
    // Debugging log to confirm token state for every request
    console.log(
      `[Axios Interceptor] URL: ${config.url} | Token Attached:`, 
      token ? "YES (Bearer)" : "NO"
    );

    if (token) {
      // Ensure clean Bearer token format
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);