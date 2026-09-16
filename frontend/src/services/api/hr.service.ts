import { apiClient } from './apiClient';
import { HrUserCreatePayload, HrUserListResponse, HrUserResponse } from '../../types/employee.types';

export interface HrUserFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const hrService = {
  async list(params?: HrUserFilterParams): Promise<HrUserListResponse> {
    const response = await apiClient.get<HrUserListResponse>('/hr-users', { params });
    return response.data;
  },

  async create(payload: HrUserCreatePayload): Promise<HrUserResponse> {
    const response = await apiClient.post<HrUserResponse>('/hr-users', payload);
    return response.data;
  },
};
