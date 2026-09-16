import { apiClient } from './apiClient';
import {
  RegularizationRequestCreate,
  RegularizationRequestDecision,
  RegularizationRequestResponse,
  RegularizationRequestPaginatedResponse,
} from '../../types/regularization.types';

export const regularizationService = {
  async submit(payload: RegularizationRequestCreate): Promise<RegularizationRequestResponse> {
    const response = await apiClient.post<RegularizationRequestResponse>('/regularizations', payload);
    return response.data;
  },

  async getMyRequests(page = 1, pageSize = 10, status?: string): Promise<RegularizationRequestPaginatedResponse> {
    const params = { page, pageSize, status };
    const response = await apiClient.get<RegularizationRequestPaginatedResponse>('/regularizations/my', { params });
    return response.data;
  },

  async getAllRequests(page = 1, pageSize = 10, status?: string, department?: string): Promise<RegularizationRequestPaginatedResponse> {
    const params = { page, pageSize, status, department };
    const response = await apiClient.get<RegularizationRequestPaginatedResponse>('/regularizations', { params });
    return response.data;
  },

  async makeDecision(requestId: number, payload: RegularizationRequestDecision): Promise<RegularizationRequestResponse> {
    const response = await apiClient.post<RegularizationRequestResponse>(`/regularizations/${requestId}/decision`, payload);
    return response.data;
  },
};
