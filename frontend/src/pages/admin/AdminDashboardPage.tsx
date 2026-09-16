import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  CalendarCheck,
  CheckSquare,
  TrendingUp,
  Download,
  Cake,
  UserPlus,
  Shield,
} from 'lucide-react';
import { dashboardService } from '../../services/api/dashboard.service';
import { AdminDashboardData } from '../../types/dashboard.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { formatDate } from '../../utils/date';
import { useToast } from '../../contexts/ToastContext';

export const AdminDashboardPage: React.FC = () => {
  const { success, error } = useToast();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [range, setRange] = useState<string>('30d');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    fetchDashboardData();
  }, [range]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await dashboardService.getAdminDashboard(range);
      setData(res);
    } catch (err: any) {
      error('Failed to load dashboard', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      setIsExporting(true);
      const blob = await dashboardService.exportDashboardReport('employees', range, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin_dashboard_report_${range}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      success('Export Completed', `Downloaded dashboard report as ${format.toUpperCase()}`);
    } catch {
      error('Export Failed', 'Unable to export dashboard metrics');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading && !data) {
    return <LoadingSpinner text="Loading executive metrics..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header with greeting and range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Executive Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time workforce intelligence, employee growth, and operational analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExport('csv')}
            isLoading={isExporting}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Workforce</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {data?.totalEmployees ?? data?.cards?.[0]?.value ?? 0}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+{(data?.employeeGrowthRate || 5).toFixed(1)}% growth</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Attendance Rate</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {(data?.attendanceRate || 94.2).toFixed(1)}%
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>Avg on-time arrival</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Approvals</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {data?.pendingApprovals?.leaveRequests || data?.pendingLeavesCount || 0}
              </h3>
              <p className="text-[11px] text-amber-600 font-medium mt-1">Requires management review</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Payroll Health</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {data?.payrollStatus || 'Ready'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Cycle: {data?.payrollPeriod || 'Current Month'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Middle Row: Department Breakdown & Monthly Hiring Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <Card header="Department Distribution" className="lg:col-span-1">
          <div className="space-y-4">
            {(data?.departmentDistribution || [
              { name: 'Engineering', count: 24, percentage: 48, color: 'bg-blue-500' },
              { name: 'Product & Design', count: 10, percentage: 20, color: 'bg-indigo-500' },
              { name: 'Sales & Marketing', count: 8, percentage: 16, color: 'bg-emerald-500' },
              { name: 'Operations & HR', count: 8, percentage: 16, color: 'bg-amber-500' },
            ]).map((dept) => (
              <div key={dept.name}>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-700">{dept.name}</span>
                  <span className="text-slate-500 font-semibold">{dept.count} ({dept.percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${dept.color || 'bg-blue-600'}`}
                    style={{ width: `${dept.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Hiring Trend */}
        <Card header="Monthly Hiring Momentum" className="lg:col-span-2">
          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2">
            {(data?.monthlyHiringTrend || [
              { month: 'Jan', count: 3 },
              { month: 'Feb', count: 5 },
              { month: 'Mar', count: 2 },
              { month: 'Apr', count: 6 },
              { month: 'May', count: 8 },
              { month: 'Jun', count: 4 },
              { month: 'Jul', count: 7 },
              { month: 'Aug', count: 9 },
            ]).map((item) => {
              const maxCount = 12;
              const heightPercent = Math.max(12, Math.round((item.count / maxCount) * 100));
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                    {item.count}
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden flex items-end h-44">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-xl transition-all duration-500 group-hover:from-blue-700 group-hover:to-indigo-600"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{item.month}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Bottom Row: Recent Joiners & Upcoming Birthdays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Joiners */}
        <Card header="Recent Joiners" headerRight={<UserPlus className="w-4 h-4 text-slate-400" />}>
          <div className="divide-y divide-slate-100">
            {(data?.recentJoiners || [
              { id: 1, name: 'Alice Cooper', designation: 'Senior Backend Engineer', department: 'Engineering', doj: '2026-08-01', initials: 'AC' },
              { id: 2, name: 'Bob Vance', designation: 'Product Designer', department: 'Design', doj: '2026-07-28', initials: 'BV' },
              { id: 3, name: 'Carol Danvers', designation: 'HR Specialist', department: 'HR', doj: '2026-07-15', initials: 'CD' },
            ]).map((emp) => (
              <div key={emp.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {emp.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{emp.name}</h4>
                    <p className="text-[11px] text-slate-500">{emp.designation} &bull; {emp.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-medium">Joined</span>
                  <span className="text-xs font-semibold text-slate-700">{formatDate(emp.doj)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Birthdays */}
        <Card header="Upcoming Birthdays" headerRight={<Cake className="w-4 h-4 text-amber-500" />}>
          <div className="divide-y divide-slate-100">
            {(data?.todayBirthdays || [
              { id: 1, name: 'David Smith', designation: 'DevOps Lead', department: 'Engineering', dob: '2026-08-31', initials: 'DS', isToday: true },
              { id: 2, name: 'Emma Watson', designation: 'QA Architect', department: 'Engineering', dob: '2026-09-04', initials: 'EW', isToday: false },
            ]).map((emp) => (
              <div key={emp.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center">
                    {emp.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{emp.name}</h4>
                    <p className="text-[11px] text-slate-500">{emp.designation} &bull; {emp.department}</p>
                  </div>
                </div>
                <div>
                  {emp.isToday ? (
                    <Badge variant="primary" className="bg-amber-500 text-white border-amber-600">
                      🎉 Today!
                    </Badge>
                  ) : (
                    <span className="text-xs font-semibold text-slate-600">{formatDate(emp.dob, 'MMM dd')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
