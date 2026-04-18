import axios from 'axios';
import { BASE_URL } from '../config';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token store (module-level so it persists without AsyncStorage)
let _token: string | null = null;

export const setAuthToken = (token: string | null) => {
  _token = token;
};

export const getAuthToken = (): string | null => _token;

// Request interceptor — attach Bearer token
apiClient.interceptors.request.use(
  (config) => {
    if (_token) {
      config.headers.Authorization = `Bearer ${_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      _token = null;
    }
    return Promise.reject(error);
  }
);

export default apiClient;
