import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // This is crucial for cookies
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized (redirect to login, etc.)
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;