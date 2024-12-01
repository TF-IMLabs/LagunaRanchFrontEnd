// src/services/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://amelieapp.alwaysdata.net/api/', // URL base para todas las rutas
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
