export interface LoginActivity {
  id: number;
  user_id: number;
  employee_id?: number | null;
  login_time: string;
  browser?: string | null;
  device?: string | null;
  operating_system?: string | null;
  ip_address?: string | null;
  location?: string | null;
  status: string;
  created_at: string;
  employee_code?: string | null;
  employee_name?: string | null;
  user_display_name?: string | null;
}
