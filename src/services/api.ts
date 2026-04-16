import axios from 'axios';

/**
 * Shared HTTP client for MedFlow API integration.
 * Connects to the local backend server.
 */
export const apiClient = axios.create({
  baseURL: 'http://10.244.66.235:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
