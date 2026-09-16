import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserSession,
  LoginRequest,
  LoginResponse,
} from '../types/auth.types';
import {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  ACTIVE_DASHBOARD_KEY,
} from '../config/constants';
import { authService } from '../services/api/auth.service';
import { wsService } from '../services/websocket.service';

interface AuthContextType {
  user: UserSession | null;
  activeDashboard: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
  switchDashboard: (dashboard: string) => void;
  refreshUser: () => Promise<UserSession | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [activeDashboard, setActiveDashboard] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_DASHBOARD_KEY) || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_DASHBOARD_KEY);
    setUser(null);
    setActiveDashboard(null);
    wsService.disconnect();
    navigate('/login');
  }, [navigate]);

  const refreshUser = useCallback(async (): Promise<UserSession | null> => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return null;
    }
    try {
      const session = await authService.getMe();
      const role = (session.role || 'employee').toLowerCase();
      const accessibleDashboards = session.accessibleDashboards || (role === 'admin' ? ['admin', 'hr', 'employee'] : role === 'hr' ? ['hr', 'employee'] : ['employee']);
      const normalizedSession: UserSession = {
        ...session,
        accessibleDashboards,
        activeDashboard: session.activeDashboard || role,
      };
      setUser(normalizedSession);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedSession));
      
      // Determine active dashboard
      const savedDash = localStorage.getItem(ACTIVE_DASHBOARD_KEY);
      const chosen = savedDash && accessibleDashboards.includes(savedDash.toLowerCase())
        ? savedDash.toLowerCase()
        : normalizedSession.activeDashboard || role;
      
      setActiveDashboard(chosen);
      localStorage.setItem(ACTIVE_DASHBOARD_KEY, chosen);

      // Connect WebSocket
      wsService.connect(session.id);
      return normalizedSession;
    } catch {
      logout();
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refreshUser();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [refreshUser, logout]);

  const login = async (payload: LoginRequest): Promise<LoginResponse> => {
    const res = await authService.login(payload);
    if (res.accessToken && res.me) {
      const role = (res.me.role || 'employee').toLowerCase();
      const accessibleDashboards = res.me.accessibleDashboards || (role === 'admin' ? ['admin', 'hr', 'employee'] : role === 'hr' ? ['hr', 'employee'] : ['employee']);
      const normalizedUser: UserSession = {
        ...res.me,
        accessibleDashboards,
      };
      localStorage.setItem(TOKEN_STORAGE_KEY, res.accessToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
      setUser(normalizedUser);

      const dashboard = (payload.activeDashboard || res.me.activeDashboard || role).toLowerCase();
      setActiveDashboard(dashboard);
      localStorage.setItem(ACTIVE_DASHBOARD_KEY, dashboard);

      wsService.connect(res.me.id);
    }
    return res;
  };

  const switchDashboard = (dashboard: string) => {
    const target = dashboard.toLowerCase();
    const allowed = user?.accessibleDashboards?.map(d => d.toLowerCase()) || [];
    const isSuper = user?.role?.toLowerCase() === 'admin';
    if (user && (allowed.includes(target) || isSuper || user.role?.toLowerCase() === target)) {
      setActiveDashboard(target);
      localStorage.setItem(ACTIVE_DASHBOARD_KEY, target);
      navigate(`/${target}/dashboard`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeDashboard,
        isAuthenticated: !!user && !!localStorage.getItem(TOKEN_STORAGE_KEY),
        isLoading,
        login,
        logout,
        switchDashboard,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
