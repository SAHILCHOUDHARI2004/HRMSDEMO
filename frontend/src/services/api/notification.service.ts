import { apiClient } from './apiClient';
import { AppNotification, NotificationUnreadCount } from '../../types/notification.types';

export const notificationService = {
  async getNotifications(page = 1, limit = 50): Promise<AppNotification[]> {
    const response = await apiClient.get<AppNotification[] | { items: AppNotification[] }>('/notifications', {
      params: { page, limit },
    });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return (response.data as any)?.items || [];
  },

  async getUnreadCount(): Promise<NotificationUnreadCount> {
    const response = await apiClient.get<NotificationUnreadCount>('/notifications/unread-count');
    return response.data;
  },

  async markAsRead(id: number): Promise<AppNotification> {
    const response = await apiClient.put<AppNotification>(`/notifications/${id}/mark-read`);
    return response.data;
  },

  async markAllAsRead(): Promise<{ unread_count: number }> {
    const response = await apiClient.put<{ unread_count: number }>('/notifications/mark-all-read');
    return response.data;
  },

  async deleteNotification(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/notifications/${id}`);
    return response.data;
  },

  async clearAllNotifications(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>('/notifications/clear-all');
    return response.data;
  },
};
