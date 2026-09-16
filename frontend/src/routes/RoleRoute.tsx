import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export interface RoleRouteProps {
  allowedRoles: string[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user, activeDashboard, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner text="Checking access permissions..." fullScreen />;
  }

  const role = (activeDashboard || user?.role || '').toLowerCase();
  const allowed = allowedRoles.map((r) => r.toLowerCase());

  // Also check if user has the role in accessibleDashboards
  const hasAccess =
    allowed.includes(role) ||
    (user?.accessibleDashboards && user.accessibleDashboards.some((d) => allowed.includes(d.toLowerCase())));

  if (!hasAccess) {
    // Redirect to their default dashboard
    const fallback = user?.activeDashboard || user?.role?.toLowerCase() || 'employee';
    return <Navigate to={`/${fallback}/dashboard`} replace />;
  }

  return <Outlet />;
};
