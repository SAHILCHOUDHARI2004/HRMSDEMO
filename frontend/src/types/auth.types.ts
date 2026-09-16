export interface UserSession {
  id: number;
  email: string;
  displayName: string;
  role: string;
  designation?: string | null;
  status: string;
  accessibleDashboards: string[];
  activeDashboard?: string | null;
  profileImage?: string | null;
  linkedEmployeeId?: number | null;
  linkedHrId?: number | null;
}

export interface LoginRequest {
  email: string;
  password: string;
  activeDashboard?: string | null;
}

export interface LoginResponse {
  accessToken?: string;
  tokenType?: string;
  me?: UserSession;
  requiresDashboardSelection?: boolean;
  availableDashboards?: string[];
  user?: UserSession;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface StandardResponse {
  success: boolean;
  message: string;
}

export interface WebSocketTicketResponse {
  ticket: string;
}
