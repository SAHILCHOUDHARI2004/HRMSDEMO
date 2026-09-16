import { apiClient } from './apiClient';
import { AdminDashboardData, HrDashboardData } from '../../types/dashboard.types';

export const dashboardService = {
  async getAdminDashboard(range = '30d'): Promise<AdminDashboardData> {
    const response = await apiClient.get<AdminDashboardData>('/dashboard/admin', {
      params: { range },
    });
    return response.data;
  },

  async getHrDashboard(range = '30d'): Promise<HrDashboardData> {
    const response = await apiClient.get<HrDashboardData>('/dashboard/hr', {
      params: { range },
    });
    return response.data;
  },

  async exportDashboardReport(cardType: string, range = '30d', format = 'csv'): Promise<Blob> {
    const response = await apiClient.get('/dashboard/export', {
      params: { card_type: cardType, range, format },
      responseType: 'blob',
    });
    return response.data;
  },
};
