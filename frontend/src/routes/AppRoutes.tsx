import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { DashboardLayout } from '../components/layout/DashboardLayout';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminEmployeesPage } from '../pages/admin/AdminEmployeesPage';
import { AdminHrUsersPage } from '../pages/admin/AdminHrUsersPage';
import { MasterDataPage } from '../pages/admin/MasterDataPage';
import { ApprovalCenterPage } from '../pages/admin/ApprovalCenterPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminLoginActivityPage } from '../pages/admin/AdminLoginActivityPage';

// HR Pages
import { HrDashboardPage } from '../pages/hr/HrDashboardPage';
import { HrEmployeesPage } from '../pages/hr/HrEmployeesPage';
import { HrAttendanceMonitorPage } from '../pages/hr/HrAttendanceMonitorPage';
import { HrAttendanceMapPage } from '../pages/hr/HrAttendanceMapPage';
import { HrTimeOffRequestsPage } from '../pages/hr/HrTimeOffRequestsPage';
import { HrRegularizationsPage } from '../pages/hr/HrRegularizationsPage';
import { HrDocumentVerificationPage } from '../pages/hr/HrDocumentVerificationPage';
import { HrTrainingManagementPage } from '../pages/hr/HrTrainingManagementPage';
import { HrReportsPage } from '../pages/hr/HrReportsPage';

// Employee Pages
import { EmployeeDashboardPage } from '../pages/employee/EmployeeDashboardPage';
import { EmployeeTimesheetsPage } from '../pages/employee/EmployeeTimesheetsPage';
import { EmployeeTimeOffPage } from '../pages/employee/EmployeeTimeOffPage';
import { EmployeeRegularizationPage } from '../pages/employee/EmployeeRegularizationPage';
import { EmployeeDocumentsPage } from '../pages/employee/EmployeeDocumentsPage';
import { EmployeeTrainingsPage } from '../pages/employee/EmployeeTrainingsPage';
import { EmployeeAssessmentExamPage } from '../pages/employee/EmployeeAssessmentExamPage';
import { EmployeeProfilePage } from '../pages/employee/EmployeeProfilePage';
import { ChangePasswordPage } from '../pages/employee/ChangePasswordPage';

const RootRedirect: React.FC = () => {
  const { user, activeDashboard, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  const role = (activeDashboard || user?.role || 'employee').toLowerCase();
  return <Navigate to={`/${role}/dashboard`} replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RootRedirect />} />

        {/* Dashboard Layout Wrap */}
        <Route element={<DashboardLayout />}>
          {/* Admin Routes */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/employees" element={<AdminEmployeesPage />} />
            <Route path="/admin/hr-users" element={<AdminHrUsersPage />} />
            <Route path="/admin/master-data" element={<MasterDataPage />} />
            <Route path="/admin/approvals" element={<ApprovalCenterPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/login-activity" element={<AdminLoginActivityPage />} />
          </Route>

          {/* HR Routes */}
          <Route element={<RoleRoute allowedRoles={['hr', 'admin']} />}>
            <Route path="/hr/dashboard" element={<HrDashboardPage />} />
            <Route path="/hr/employees" element={<HrEmployeesPage />} />
            <Route path="/hr/attendance" element={<HrAttendanceMonitorPage />} />
            <Route path="/hr/attendance-map" element={<HrAttendanceMapPage />} />
            <Route path="/hr/time-off" element={<HrTimeOffRequestsPage />} />
            <Route path="/hr/regularizations" element={<HrRegularizationsPage />} />
            <Route path="/hr/documents" element={<HrDocumentVerificationPage />} />
            <Route path="/hr/trainings" element={<HrTrainingManagementPage />} />
            <Route path="/hr/approvals" element={<ApprovalCenterPage />} />
            <Route path="/hr/reports" element={<HrReportsPage />} />
          </Route>

          {/* Employee Routes */}
          <Route element={<RoleRoute allowedRoles={['employee', 'hr', 'admin']} />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
            <Route path="/employee/timesheets" element={<EmployeeTimesheetsPage />} />
            <Route path="/employee/time-off" element={<EmployeeTimeOffPage />} />
            <Route path="/employee/regularization" element={<EmployeeRegularizationPage />} />
            <Route path="/employee/documents" element={<EmployeeDocumentsPage />} />
            <Route path="/employee/trainings" element={<EmployeeTrainingsPage />} />
            <Route path="/employee/trainings/:id/exam" element={<EmployeeAssessmentExamPage />} />
            <Route path="/employee/profile" element={<EmployeeProfilePage />} />
            <Route path="/employee/change-password" element={<ChangePasswordPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
