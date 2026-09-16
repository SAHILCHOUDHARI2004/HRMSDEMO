import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Database,
  CheckSquare,
  FileText,
  Clock,
  MapPin,
  Calendar,
  CalendarCheck,
  FileCheck,
  GraduationCap,
  Activity,
  User,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, activeDashboard } = useAuth();
  const currentRole = (activeDashboard || user?.role || 'employee').toLowerCase();

  const adminNav = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Employees', path: '/admin/employees', icon: Users },
    { label: 'HR Personnel', path: '/admin/hr-users', icon: UserCheck },
    { label: 'Master Data', path: '/admin/master-data', icon: Database },
    { label: 'Approval Center', path: '/admin/approvals', icon: CheckSquare },
    { label: 'Reports', path: '/admin/reports', icon: FileText },
    { label: 'Login Activity', path: '/admin/login-activity', icon: Activity },
  ];

  const hrNav = [
    { label: 'Dashboard', path: '/hr/dashboard', icon: LayoutDashboard },
    { label: 'Employees', path: '/hr/employees', icon: Users },
    { label: 'Attendance Monitor', path: '/hr/attendance', icon: Clock },
    { label: 'Live Map', path: '/hr/attendance-map', icon: MapPin },
    { label: 'Time-Off Requests', path: '/hr/time-off', icon: Calendar },
    { label: 'Regularizations', path: '/hr/regularizations', icon: CalendarCheck },
    { label: 'Document Review', path: '/hr/documents', icon: FileCheck },
    { label: 'Trainings & Tests', path: '/hr/trainings', icon: GraduationCap },
    { label: 'Approval Center', path: '/hr/approvals', icon: CheckSquare },
    { label: 'HR Reports', path: '/hr/reports', icon: FileText },
  ];

  const employeeNav = [
    { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { label: 'My Timesheets', path: '/employee/timesheets', icon: Clock },
    { label: 'Apply Leave', path: '/employee/time-off', icon: Calendar },
    { label: 'Regularization', path: '/employee/regularization', icon: CalendarCheck },
    { label: 'My Documents', path: '/employee/documents', icon: FileCheck },
    { label: 'My Trainings', path: '/employee/trainings', icon: GraduationCap },
    { label: 'My Profile', path: '/employee/profile', icon: User },
  ];

  const navItems = currentRole === 'admin' ? adminNav : currentRole === 'hr' ? hrNav : employeeNav;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar sidebar container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 transform bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Brand */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-base tracking-tight leading-none">
                  AIVAN <span className="text-blue-400">HRMS</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
                  Enterprise Portal
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-10rem)]">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
          <div className="flex items-center justify-between">
            <span>Aivan HRMS v2.0</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Connected" />
          </div>
        </div>
      </aside>
    </>
  );
};
