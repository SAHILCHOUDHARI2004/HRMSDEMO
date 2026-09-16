import { apiClient } from './apiClient';
import { LoginActivity } from '../../types/loginActivity.types';

export interface LoginActivityFilterParams {
  filter_type?: string;
  start_date?: string;
  end_date?: string;
  user_id?: number;
}

export const loginActivityService = {
  async getLoginHistory(params?: LoginActivityFilterParams): Promise<LoginActivity[]> {
    const response = await apiClient.get<LoginActivity[]>('/login-activity', { params });
    return response.data;
  },

  async getLoginDetail(id: number): Promise<LoginActivity> {
    const response = await apiClient.get<LoginActivity>(`/login-activity/${id}`);
    return response.data;
  },
};
