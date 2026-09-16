export interface NotificationEmployee {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string | null;
  full_name?: string;
}

export interface AppNotification {
  id: number;
  user_id: number;
  type: string; // LOGIN_ACTIVITY, NEWS, ATTENDANCE, LEAVE, SYSTEM, APPROVAL
  title: string;
  message: string;
  reference_id?: number | null;
  is_read: boolean;
  category?: string | null;
  severity?: string | null;
  employee_id?: number | null;
  created_by?: number | null;
  receiver_role?: string | null;
  notification_metadata?: Record<string, any> | null;
  created_at: string;
  read_at?: string | null;
  updated_at?: string | null;
  employee?: NotificationEmployee | null;
}

export interface NotificationUnreadCount {
  unread_count: number;
}
