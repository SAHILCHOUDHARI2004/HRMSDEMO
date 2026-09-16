import { apiClient } from './apiClient';
import {
  ApprovalQueueResponse,
  ApprovalDecisionPayload,
  ApprovalTask,
} from '../../types/approval.types';

export const approvalService = {
  async getPending(): Promise<ApprovalQueueResponse> {
    const response = await apiClient.get<ApprovalQueueResponse>('/approvals/pending');
    return response.data;
  },

  async getHistory(page = 1, pageSize = 10, requestType?: string, employeeId?: number): Promise<{
    items: ApprovalTask[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }> {
    const params = { page, pageSize, requestType, employeeId };
    const response = await apiClient.get('/approvals/history', { params });
    return response.data;
  },

  async makeDecision(approvalTaskId: number, payload: ApprovalDecisionPayload): Promise<ApprovalTask> {
    const response = await apiClient.post<ApprovalTask>(`/approvals/${approvalTaskId}/decision`, payload);
    return response.data;
  },
};
