import apiClient from './api';
import type { Hospital } from '../types';

export const hospitalService = {
  async getNearbyHospitals(lat: number, lng: number, limit = 5, onlyWithBeds = false): Promise<Hospital[]> {
    const res = await apiClient.get('/hospitals/nearby', { 
      params: { 
        lat, lng, limit, 
        onlyWithBeds: onlyWithBeds.toString(),
        _t: Date.now() // Cache busting
      } 
    });
    return res.data.data;
  },

  async getHospitalById(id: string): Promise<Hospital> {
    const res = await apiClient.get(`/hospitals/${id}`);
    return res.data.data;
  },

  async getAllHospitals(params?: { search?: string; status?: string; page?: number }): Promise<Hospital[]> {
    const res = await apiClient.get('/hospitals', { params });
    return res.data.data;
  }
};

export default hospitalService;
