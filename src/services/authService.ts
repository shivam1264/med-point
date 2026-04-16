import apiClient, { setAuthToken } from './api';
import type { AuthUser, AuthAmbulance } from '../types';

export interface LoginUserResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

export interface LoginAmbulanceResponse {
  success: boolean;
  token: string;
  driver: AuthAmbulance;
}

export const authService = {
  // Register a new user (patient)
  async registerUser(data: {
    name: string;
    phone: string;
    password: string;
    email?: string;
    bloodGroup?: string;
  }): Promise<LoginUserResponse> {
    const res = await apiClient.post<LoginUserResponse>('/auth/user/register', data);
    return res.data;
  },

  // Login as patient/user
  async loginUser(phone: string, password: string): Promise<LoginUserResponse> {
    const res = await apiClient.post<LoginUserResponse>('/auth/user/login', { phone, password });
    if (res.data.token) setAuthToken(res.data.token);
    return res.data;
  },

  // Login as ambulance driver
  async loginAmbulance(driverId: string, password: string): Promise<LoginAmbulanceResponse> {
    const res = await apiClient.post<LoginAmbulanceResponse>('/auth/ambulance/login', { driverId, password });
    if (res.data.token) setAuthToken(res.data.token);
    return res.data;
  },

  logout() {
    setAuthToken(null);
  }
};

export default authService;
