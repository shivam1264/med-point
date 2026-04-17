import apiClient from './api';

export const profileService = {
  async getProfile(): Promise<any> {
    const res = await apiClient.get('/auth/profile');
    return res.data.data;
  },

  async updateProfile(updates: any): Promise<any> {
    const res = await apiClient.put('/auth/profile', updates);
    return res.data.data;
  }
};

export default profileService;
