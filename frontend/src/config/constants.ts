export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const WS_BASE_URL = (() => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  const loc = window.location;
  const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${loc.host}`;
})();

export const TOKEN_STORAGE_KEY = 'hrms_access_token';
export const USER_STORAGE_KEY = 'hrms_user_session';
export const ACTIVE_DASHBOARD_KEY = 'hrms_active_dashboard';

export enum UserRole {
  ADMIN = 'admin',
  HR = 'hr',
  EMPLOYEE = 'employee',
}

export enum WorkMode {
  OFFICE = 'Office',
  REMOTE = 'Remote',
  HYBRID = 'Hybrid',
}

export enum AttendanceStatus {
  WORKING = 'Working',
  PRESENT = 'Present',
  ABSENT = 'Absent',
  NOT_MARKED = 'Not Marked',
}
