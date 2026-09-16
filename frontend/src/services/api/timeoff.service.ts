import { apiClient } from './apiClient';
import {
  TimeOffRequestCreate,
  TimeOffRequestResponse,
  TimeOffApplyPayload,
  TimeOffApplyResponse,
  TimeOffRequestPaginatedResponse,
  TimeOffDecisionRequest,
  TimeOffBootstrap,
} from '../../types/timeoff.types';

export const timeoffService = {
  async getBootstrap(): Promise<TimeOffBootstrap> {
    const response = await apiClient.get<TimeOffBootstrap>('/timeoff/bootstrap');
    return response.data;
  },

  async apply(payload: TimeOffApplyPayload): Promise<TimeOffApplyResponse> {
    const response = await apiClient.post<TimeOffApplyResponse>('/timeoff/apply', payload);
    return response.data;
  },

  async request(payload: TimeOffRequestCreate): Promise<TimeOffRequestResponse> {
    const response = await apiClient.post<TimeOffRequestResponse>('/timeoff/request', payload);
    return response.data;
  },

  async getMyRequests(page = 1, pageSize = 10, status?: string): Promise<TimeOffRequestPaginatedResponse> {
    const params = { page, pageSize, status };
    const response = await apiClient.get<TimeOffRequestPaginatedResponse>('/timeoff/requests/my', { params });
    return response.data;
  },

  async getAllRequests(page = 1, pageSize = 10, status?: string, department?: string): Promise<TimeOffRequestPaginatedResponse> {
    const params = { page, pageSize, status, department };
    const response = await apiClient.get<TimeOffRequestPaginatedResponse>('/timeoff/requests', { params });
    return response.data;
  },

  async makeDecision(requestId: number, payload: TimeOffDecisionRequest): Promise<TimeOffRequestResponse> {
    const response = await apiClient.post<TimeOffRequestResponse>(`/timeoff/requests/${requestId}/decision`, payload);
    return response.data;
  },

  async cancelRequest(requestId: number): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>(`/timeoff/requests/${requestId}/cancel`);
    return response.data;
  },
};
