import apiClient from './api';
import type { Hospital } from '../types';

export interface HospitalResponse {
  success: boolean;
  data: Hospital[];
  count: number;
  total: number;
  pages: number;
  currentPage: number;
}

export interface SingleHospitalResponse {
  success: boolean;
  data: Hospital;
}

export interface HospitalSearchParams {
  search?: string;
  status?: 'available' | 'moderate' | 'full';
  sortBy?: 'name' | 'status' | 'rating' | 'createdAt';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface NearbyHospitalsParams {
  lat: number;
  lng: number;
  maxDistance?: number;
}

export interface BedUpdateParams {
  icuFree?: number;
  generalFree?: number;
  otFree?: number;
}

/**
 * Hospital API service for MedFlow backend
 */
export const hospitalService = {
  /**
   * Get all hospitals with optional search and filtering
   */
  async getHospitals(params?: HospitalSearchParams): Promise<HospitalResponse> {
    const response = await apiClient.get<HospitalResponse>('/hospitals', { params });
    return response.data;
  },

  /**
   * Get single hospital by ID
   */
  async getHospitalById(id: string): Promise<SingleHospitalResponse> {
    const response = await apiClient.get<SingleHospitalResponse>(`/hospitals/${id}`);
    return response.data;
  },

  /**
   * Get nearby hospitals based on coordinates
   */
  async getNearbyHospitals(params: NearbyHospitalsParams): Promise<{ success: boolean; data: Hospital[]; count: number }> {
    const response = await apiClient.get('/hospitals/nearby', { params });
    return response.data;
  },

  /**
   * Create a new hospital
   */
  async createHospital(hospitalData: Omit<Hospital, 'id'>): Promise<SingleHospitalResponse> {
    const response = await apiClient.post<SingleHospitalResponse>('/hospitals', hospitalData);
    return response.data;
  },

  /**
   * Update hospital information
   */
  async updateHospital(id: string, hospitalData: Partial<Hospital>): Promise<SingleHospitalResponse> {
    const response = await apiClient.put<SingleHospitalResponse>(`/hospitals/${id}`, hospitalData);
    return response.data;
  },

  /**
   * Update hospital bed availability
   */
  async updateBedAvailability(id: string, bedData: BedUpdateParams): Promise<SingleHospitalResponse> {
    const response = await apiClient.patch<SingleHospitalResponse>(`/hospitals/${id}/beds`, bedData);
    return response.data;
  },

  /**
   * Delete a hospital
   */
  async deleteHospital(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/hospitals/${id}`);
    return response.data;
  }
};

export default hospitalService;
