import axios from 'axios';

const baseURL = 'http://localhost:8080/api';

console.log('API URL:', baseURL);
console.log('Base URL being used:', baseURL);

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false,
  timeout: 30000
});

// Add auth token to requests

axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request to:', config.url);
    console.log('Request headers:', config.headers);
    return config;
  },
  error => Promise.reject(error)
);

// Improve error logging
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend connection refused. Please ensure the backend server is running.');
    }
    console.error('Request failed:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      code: error.code,
      headers: error.config?.headers
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;
