import { apiClient } from './apiClient';
import {
  AttendanceSummaryRow,
  LateArrivalRow,
  MissingPunchRow,
  LeaveUsageRow,
  HrWorkloadRow,
  EmployeeStatusRow,
  LoginActivitySummaryRow,
  PaginatedReportResponse,
} from '../../types/report.types';

export interface ReportFilterParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  department?: string;
  employeeId?: number;
  search?: string;
  status?: string;
}

function normalizeReportParams(params?: ReportFilterParams) {
  if (!params) return undefined;
  const { pageSize, limit, ...rest } = params;
  const effectiveLimit = limit ?? pageSize ?? 10;
  return {
    ...rest,
    limit: effectiveLimit,
    pageSize: effectiveLimit,
    page: params.page ?? 1,
  };
}

export const reportService = {
  async getAttendanceSummary(params?: ReportFilterParams): Promise<PaginatedReportResponse<AttendanceSummaryRow>> {
    const response = await apiClient.get('/reports/hr/attendance-summary', { params: normalizeReportParams(params) });
    return response.data;
  },

  async getLateArrivals(params?: ReportFilterParams): Promise<PaginatedReportResponse<LateArrivalRow>> {
    const response = await apiClient.get('/reports/hr/late-arrivals', { params: normalizeReportParams(params) });
    return response.data;
  },

  async getMissingPunches(params?: ReportFilterParams): Promise<PaginatedReportResponse<MissingPunchRow>> {
    const response = await apiClient.get('/reports/hr/missing-punches', { params: normalizeReportParams(params) });
    return response.data;
  },

  async getLeaveUsage(params?: ReportFilterParams): Promise<PaginatedReportResponse<LeaveUsageRow>> {
    const response = await apiClient.get('/reports/hr/leave-usage', { params: normalizeReportParams(params) });
    return response.data;
  },

  async getHrWorkload(params?: ReportFilterParams): Promise<PaginatedReportResponse<HrWorkloadRow>> {
    const response = await apiClient.get('/reports/admin/hr-workload', { params: normalizeReportParams(params) });
    return response.data;
  },

  async getEmployeeStatus(params?: ReportFilterParams): Promise<PaginatedReportResponse<EmployeeStatusRow>> {
    const response = await apiClient.get('/reports/admin/employee-status', { params: normalizeReportParams(params) });
    return response.data;
  },

  async getLoginActivity(params?: ReportFilterParams): Promise<PaginatedReportResponse<LoginActivitySummaryRow>> {
    const response = await apiClient.get('/reports/admin/login-activity', { params: normalizeReportParams(params) });
    return response.data;
  },

  async exportReport(reportType: string, format = 'csv', params?: ReportFilterParams): Promise<Blob> {
    const endpointMap: Record<string, string> = {
      'attendance-summary': '/reports/hr/attendance-summary',
      'late-arrivals': '/reports/hr/late-arrivals',
      'missing-punches': '/reports/hr/missing-punches',
      'leave-usage': '/reports/hr/leave-usage',
      'hr-workload': '/reports/admin/hr-workload',
      'employee-status': '/reports/admin/employee-status',
      'login-activity': '/reports/admin/login-activity',
    };
    const endpoint = endpointMap[reportType] || `/reports/hr/${reportType}`;
    const normParams = normalizeReportParams(params);
    const validFormat = (format === 'pdf' || format === 'csv') ? format : 'csv';
    const response = await apiClient.get(endpoint, {
      params: { ...normParams, export: validFormat },
      responseType: 'blob',
    });
    return response.data;
  },
};
