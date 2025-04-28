// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Adjust according to your backend server
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
