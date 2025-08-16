import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

// Add an interceptor to include the token in the request headers
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Get the token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;