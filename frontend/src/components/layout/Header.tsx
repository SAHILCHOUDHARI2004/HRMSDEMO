import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  ChevronDown,
  User as UserIcon,
  Key,
  LogOut,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { getInitials } from '../../utils/formatters';

export interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, activeDashboard, switchDashboard, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const dashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (dashRef.current && !dashRef.current.contains(event.target as Node)) {
        setIsDashboardOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6">
      {/* Left side: Hamburger on mobile + Dashboard indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dashboard Switcher (if multiple accessible dashboards) */}
        {user && user.accessibleDashboards && user.accessibleDashboards.length > 1 ? (
          <div className="relative" ref={dashRef}>
            <button
              onClick={() => setIsDashboardOpen(!isDashboardOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span className="capitalize">{activeDashboard} Portal</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isDashboardOpen && (
              <div className="absolute left-0 mt-2 w-48 rounded-xl bg-white shadow-xl border border-slate-100 py-1.5 z-50">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Portal
                </div>
                {user.accessibleDashboards.map((dash) => (
                  <button
                    key={dash}
                    onClick={() => {
                      switchDashboard(dash);
                      setIsDashboardOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium capitalize flex items-center justify-between hover:bg-slate-50 ${
                      activeDashboard === dash ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{dash} Portal</span>
                    {activeDashboard === dash && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold uppercase tracking-wider">
            {activeDashboard || user?.role} Portal
          </span>
        )}
      </div>

      {/* Right side: Notifications + User Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        <NotificationDropdown />

        {/* User Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold text-xs flex items-center justify-center shadow-sm">
              {getInitials(user?.displayName)}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.displayName}
              </span>
              <span className="text-[11px] text-slate-400 capitalize">{user?.designation || user?.role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-slate-100 py-2 z-50 divide-y divide-slate-100">
              <div className="px-4 py-2.5">
                <p className="text-xs font-bold text-slate-900 leading-tight">{user?.displayName}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/employee/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  My Profile
                </Link>
                <Link
                  to="/employee/change-password"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                >
                  <Key className="w-4 h-4 text-slate-400" />
                  Change Password
                </Link>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
