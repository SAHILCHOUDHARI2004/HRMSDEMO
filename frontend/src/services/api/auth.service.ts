import { apiClient } from './apiClient';
import {
  LoginRequest,
  LoginResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  StandardResponse,
  WebSocketTicketResponse,
  UserSession,
} from '../../types/auth.types';

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', payload);
    return response.data;
  },

  async getMe(): Promise<UserSession> {
    const response = await apiClient.get<UserSession>('/auth/me');
    return response.data;
  },

  async changePassword(payload: ChangePasswordRequest): Promise<StandardResponse> {
    const response = await apiClient.post<StandardResponse>('/auth/change-password', payload);
    return response.data;
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<StandardResponse> {
    const response = await apiClient.post<StandardResponse>('/auth/forgot-password', payload);
    return response.data;
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<StandardResponse> {
    const response = await apiClient.post<StandardResponse>('/auth/reset-password', payload);
    return response.data;
  },

  async getWebSocketTicket(): Promise<WebSocketTicketResponse> {
    const response = await apiClient.post<WebSocketTicketResponse>('/auth/ws-ticket');
    return response.data;
  },
};
