import { apiClient } from './apiClient';
import {
  PunchRequest,
  TodayAttendanceState,
  AttendanceRecord,
  AttendanceListResponse,
  EmployeeLocationResponse,
  EmployeeAnalytics,
} from '../../types/attendance.types';

export interface AttendanceFilterParams {
  page?: number;
  limit?: number;
  date?: string;
  startDate?: string;
  endDate?: string;
  department?: string;
  status?: string;
  employeeId?: number;
  search?: string;
}

export const attendanceService = {
  async punch(payload: PunchRequest): Promise<TodayAttendanceState> {
    const response = await apiClient.post<TodayAttendanceState>('/attendance/me/punch', payload);
    return response.data;
  },

  async punchIn(payload: PunchRequest): Promise<AttendanceRecord> {
    const response = await apiClient.post<AttendanceRecord>('/attendance/punch-in', payload);
    return response.data;
  },

  async punchOut(payload: PunchRequest): Promise<AttendanceRecord> {
    const response = await apiClient.post<AttendanceRecord>('/attendance/punch-out', payload);
    return response.data;
  },

  async getTodayState(employeeId?: number): Promise<TodayAttendanceState> {
    const params = employeeId ? { employeeId } : undefined;
    const response = await apiClient.get<TodayAttendanceState>('/attendance/today-state', { params });
    return response.data;
  },

  async getMyTodayState(): Promise<TodayAttendanceState> {
    const response = await apiClient.get<TodayAttendanceState>('/attendance/me/today');
    return response.data;
  },

  async setWorkMode(workMode: string): Promise<TodayAttendanceState> {
    const response = await apiClient.post<TodayAttendanceState>('/attendance/work-mode', { workMode });
    return response.data;
  },

  async continueWorking(employeeId?: number): Promise<TodayAttendanceState> {
    const response = await apiClient.post<TodayAttendanceState>('/attendance/continue-working', { employeeId });
    return response.data;
  },

  async extendOvertime(employeeId?: number): Promise<TodayAttendanceState> {
    const response = await apiClient.post<TodayAttendanceState>('/attendance/extend-overtime', { employeeId });
    return response.data;
  },

  async getMyTimesheets(startDate?: string, endDate?: string): Promise<AttendanceRecord[]> {
    const params = { startDate, endDate };
    const response = await apiClient.get<AttendanceRecord[]>('/attendance/me/timesheets', { params });
    return response.data;
  },

  async getAllAttendance(params?: AttendanceFilterParams): Promise<AttendanceListResponse> {
    const response = await apiClient.get<AttendanceListResponse>('/attendance/all', { params });
    return response.data;
  },

  async getTodayLocations(): Promise<EmployeeLocationResponse[]> {
    const response = await apiClient.get<EmployeeLocationResponse[]>('/attendance/today-locations');
    return response.data;
  },

  async getEmployeeAnalytics(employeeId?: number): Promise<EmployeeAnalytics[]> {
    const params = employeeId ? { employeeId } : undefined;
    const response = await apiClient.get<EmployeeAnalytics[]>('/attendance/employee-analytics', { params });
    return response.data;
  },

  async getMySummary(): Promise<any> {
    const response = await apiClient.get<any>('/attendance/me/summary');
    return response.data;
  },
};
