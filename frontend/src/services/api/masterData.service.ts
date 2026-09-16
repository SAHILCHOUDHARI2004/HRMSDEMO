import { apiClient } from './apiClient';
import {
  Department,
  DepartmentCreatePayload,
  Designation,
  DesignationCreatePayload,
  Shift,
  ShiftCreatePayload,
  WorkLocation,
  WorkLocationCreatePayload,
  LeaveType,
  Holiday,
  MasterDataBootstrap,
} from '../../types/masterData.types';

export const masterDataService = {
  async getBootstrap(): Promise<MasterDataBootstrap> {
    const response = await apiClient.get<MasterDataBootstrap>('/master-data/bootstrap');
    return response.data;
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    const response = await apiClient.get<Department[]>('/master-data/departments');
    return response.data;
  },
  async createDepartment(payload: DepartmentCreatePayload): Promise<Department> {
    const response = await apiClient.post<Department>('/master-data/departments', payload);
    return response.data;
  },
  async updateDepartment(id: number, payload: Partial<DepartmentCreatePayload>): Promise<Department> {
    const response = await apiClient.put<Department>(`/master-data/departments/${id}`, payload);
    return response.data;
  },
  async deleteDepartment(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/master-data/departments/${id}`);
    return response.data;
  },

  // Designations
  async getDesignations(): Promise<Designation[]> {
    const response = await apiClient.get<Designation[]>('/master-data/designations');
    return response.data;
  },
  async createDesignation(payload: DesignationCreatePayload): Promise<Designation> {
    const response = await apiClient.post<Designation>('/master-data/designations', payload);
    return response.data;
  },
  async updateDesignation(id: number, payload: Partial<DesignationCreatePayload>): Promise<Designation> {
    const response = await apiClient.put<Designation>(`/master-data/designations/${id}`, payload);
    return response.data;
  },
  async deleteDesignation(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/master-data/designations/${id}`);
    return response.data;
  },

  // Shifts
  async getShifts(): Promise<Shift[]> {
    const response = await apiClient.get<Shift[]>('/master-data/shifts');
    return response.data;
  },
  async createShift(payload: ShiftCreatePayload): Promise<Shift> {
    const response = await apiClient.post<Shift>('/master-data/shifts', payload);
    return response.data;
  },
  async updateShift(id: number, payload: Partial<ShiftCreatePayload>): Promise<Shift> {
    const response = await apiClient.put<Shift>(`/master-data/shifts/${id}`, payload);
    return response.data;
  },
  async deleteShift(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/master-data/shifts/${id}`);
    return response.data;
  },

  // Work Locations
  async getWorkLocations(): Promise<WorkLocation[]> {
    const response = await apiClient.get<WorkLocation[]>('/master-data/work-locations');
    return response.data;
  },
  async createWorkLocation(payload: WorkLocationCreatePayload): Promise<WorkLocation> {
    const response = await apiClient.post<WorkLocation>('/master-data/work-locations', payload);
    return response.data;
  },
  async updateWorkLocation(id: number, payload: Partial<WorkLocationCreatePayload>): Promise<WorkLocation> {
    const response = await apiClient.put<WorkLocation>(`/master-data/work-locations/${id}`, payload);
    return response.data;
  },
  async deleteWorkLocation(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/master-data/work-locations/${id}`);
    return response.data;
  },

  // Leave Types
  async getLeaveTypes(): Promise<LeaveType[]> {
    const response = await apiClient.get<LeaveType[]>('/master-data/leave-types');
    return response.data;
  },

  // Holidays
  async getHolidays(): Promise<Holiday[]> {
    const response = await apiClient.get<Holiday[]>('/master-data/holidays');
    return response.data;
  },
};
