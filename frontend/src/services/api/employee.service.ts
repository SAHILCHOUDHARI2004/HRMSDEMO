import { apiClient } from './apiClient';
import {
  Employee,
  EmployeeCreatePayload,
  EmployeeUpdatePayload,
  EmployeeListResponse,
  EmployeeCredentials,
} from '../../types/employee.types';

export interface EmployeeFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  type?: string;
  status?: string;
  exclude_hr?: boolean;
}

export const employeeService = {
  async list(params?: EmployeeFilterParams): Promise<EmployeeListResponse> {
    const response = await apiClient.get<EmployeeListResponse>('/employees', { params });
    return response.data;
  },

  async getById(id: number): Promise<Employee> {
    const response = await apiClient.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  async create(payload: EmployeeCreatePayload): Promise<Employee> {
    const response = await apiClient.post<Employee>('/employees', payload);
    return response.data;
  },

  async update(id: number, payload: EmployeeUpdatePayload): Promise<Employee> {
    const response = await apiClient.put<Employee>(`/employees/${id}`, payload);
    return response.data;
  },

  async delete(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/employees/${id}`);
    return response.data;
  },

  async updateStatus(id: number, status: string): Promise<Employee> {
    const response = await apiClient.put<Employee>(`/employees/${id}`, { status });
    return response.data;
  },

  async getCredentials(id: number): Promise<EmployeeCredentials> {
    const response = await apiClient.get<EmployeeCredentials>(`/employees/${id}/credentials`);
    return response.data;
  },

  async resetAccess(id: number): Promise<EmployeeCredentials> {
    const response = await apiClient.post<EmployeeCredentials>(`/employees/${id}/reset-access`);
    return response.data;
  },

  async regeneratePassword(id: number): Promise<{ message: string; temporary_password?: string }> {
    const res = await this.resetAccess(id);
    return {
      message: 'Access reset link sent successfully.',
      temporary_password: res.temporary_password_hint,
    };
  },

  async resendInvitation(id: number): Promise<{ message: string }> {
    await this.resetAccess(id);
    return { message: 'Invitation email resent successfully.' };
  },
};
