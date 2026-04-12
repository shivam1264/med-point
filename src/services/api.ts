import axios from 'axios';

/**
 * Shared HTTP client for future MedRoute API integration.
 * No endpoints are called from the UI yet.
 */
export const apiClient = axios.create({
  baseURL: 'https://api.medroute.example',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
