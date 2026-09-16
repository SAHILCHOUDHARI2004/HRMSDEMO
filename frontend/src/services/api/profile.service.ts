import { apiClient } from './apiClient';
import { EmployeeProfile, ProfileUpdatePayload } from '../../types/profile.types';

export const profileService = {
  async getProfile(): Promise<EmployeeProfile> {
    const response = await apiClient.get<EmployeeProfile>('/profile/me');
    return response.data;
  },

  async updateProfile(payload: ProfileUpdatePayload): Promise<EmployeeProfile> {
    const response = await apiClient.put<EmployeeProfile>('/profile/update', payload);
    return response.data;
  },
};
