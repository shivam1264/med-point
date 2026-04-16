import apiClient from './api';
import type { Emergency } from '../types';

export const sosService = {
  async triggerSOS(lat: number, lng: number, hospitalId?: string, address?: string): Promise<{
    success: boolean;
    message: string;
    data: Emergency;
    ambulanceDispatched: boolean;
    nearestHospital: { name: string; address: string; phone: string; distance: string } | null;
  }> {
    const res = await apiClient.post('/emergencies/sos', { lat, lng, hospitalId, address });
    return res.data;
  },

  async getMyEmergency(): Promise<Emergency | null> {
    const res = await apiClient.get('/emergencies/my');
    return res.data.data;
  },

  async getActiveEmergency(): Promise<Emergency | null> {
    const res = await apiClient.get('/emergencies/active');
    return res.data.data;
  },

  async acceptEmergency(id: string): Promise<Emergency> {
    const res = await apiClient.patch(`/emergencies/${id}/accept`);
    return res.data.data;
  },

  async declineEmergency(id: string): Promise<void> {
    await apiClient.patch(`/emergencies/${id}/decline`);
  },

  async completeEmergency(id: string): Promise<Emergency> {
    const res = await apiClient.patch(`/emergencies/${id}/complete`);
    return res.data.data;
  },

  async updateAmbulanceStatus(ambulanceId: string, updates: {
    isOnline?: boolean;
    isAvailable?: boolean;
    currentLocation?: { lat: number; lng: number };
  }): Promise<void> {
    await apiClient.patch(`/ambulances/${ambulanceId}/status`, updates);
  }
};

export default sosService;
