import apiClient from './api';
import type { Doctor } from '../types';

export const doctorService = {
  async getDoctors(params?: { hospitalId?: string; specialty?: string; status?: string }): Promise<Doctor[]> {
    const res = await apiClient.get('/doctors', { params });
    return res.data.data;
  },

  async getDoctorById(id: string): Promise<Doctor> {
    const res = await apiClient.get(`/doctors/${id}`);
    return res.data.data;
  }
};

export default doctorService;
