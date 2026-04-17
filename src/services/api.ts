import axios from 'axios';
import { MMKV } from 'react-native-mmkv'; // will use AsyncStorage instead for compat

// Update this IP to your PC's local IP when running on physical device
// Use 10.0.2.2 for Android emulator, or your PC's WiFi IP for physical device
export const BASE_URL = 'http://localhost:5000/api'; // Using ADB Reverse for Physical Device
// export const BASE_URL = 'http://10.0.2.2:5000/api'; // Use 10.0.2.2 for Android Emulator

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
