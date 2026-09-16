import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  Calendar,
  CalendarCheck,
  CheckSquare,
  TrendingUp,
  Download,
  AlertCircle,
  CheckCircle2,
  MapPin,
  FileCheck,
} from 'lucide-react';
import { dashboardService } from '../../services/api/dashboard.service';
import { HrDashboardData } from '../../types/dashboard.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils/date';

export const HrDashboardPage: React.FC = () => {
  const { error, success } = useToast();
  const [data, setData] = useState<HrDashboardData | null>(null);
  const [range, setRange] = useState<string>('30d');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await dashboardService.getHrDashboard(range);
      setData(res);
    } catch (err: any) {
      error('Failed to load HR dashboard', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await dashboardService.exportDashboardReport('attendance', range, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hr_attendance_summary_${range}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      success('Export Completed', 'HR workforce metrics exported as CSV');
    } catch {
      error('Export Failed', 'Could not export HR attendance metrics');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading && !data) {
    return <LoadingSpinner text="Loading HR operations summary..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">HR Operations & Attendance Hub</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor daily attendance, verify employee documentation, and manage leave pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            isLoading={isExporting}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Attendance Log
          </Button>
          <Link to="/hr/attendance-map">
            <Button variant="outline" size="sm" leftIcon={<MapPin className="w-4 h-4" />}>
              Live Map
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Present Today</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
                {data?.todaySummary?.presentCount ?? data?.cards?.[0]?.value ?? 0}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                {data?.todaySummary?.workingNowCount ?? 0} actively clocked in
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
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">On Leave Today</p>
              <h3 className="text-2xl font-extrabold text-blue-600 mt-1">
                {data?.todaySummary?.leaveCount ?? 0}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Approved time-off</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Late Arrivals</p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">
                {data?.todaySummary?.lateCount ?? 0}
              </h3>
              <p className="text-[11px] text-amber-600 mt-1">Grace period exceeded</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Actions</p>
              <h3 className="text-2xl font-extrabold text-purple-600 mt-1">
                {data?.pendingApprovals?.leaveRequests || data?.pendingApprovals?.regularizationRequests || 0}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Awaiting HR verification</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Action Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/hr/attendance" className="block">
          <Card noPadding className="p-4 hover:border-blue-400 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Attendance Log</h4>
                <p className="text-[11px] text-slate-400">Monitor timesheets</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/hr/time-off" className="block">
          <Card noPadding className="p-4 hover:border-blue-400 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Time-Off Requests</h4>
                <p className="text-[11px] text-slate-400">Approve leaves</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/hr/regularizations" className="block">
          <Card noPadding className="p-4 hover:border-blue-400 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Regularization</h4>
                <p className="text-[11px] text-slate-400">Review punch fixes</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/hr/documents" className="block">
          <Card noPadding className="p-4 hover:border-blue-400 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Document Review</h4>
                <p className="text-[11px] text-slate-400">Verify certificates</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Middle Row: Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card header="Recent Leave Applications" headerRight={<Link to="/hr/time-off" className="text-xs text-blue-600 hover:underline font-semibold">View All</Link>}>
          <div className="divide-y divide-slate-100">
            {(data?.recentTimeOff || [
              { primary: 'Sarah Jenkins', secondary: 'Casual Leave - 1 day', tertiary: 'Personal event', status: 'Pending' },
              { primary: 'Michael Scott', secondary: 'Sick Leave - 2 days', tertiary: 'Medical recovery', status: 'Approved' },
              { primary: 'Pam Beesly', secondary: 'Maternity Leave', tertiary: 'Upcoming', status: 'Pending' },
            ]).map((item: any, idx: number) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.primary}</h4>
                  <p className="text-[11px] text-slate-500">{item.secondary} &bull; {item.tertiary}</p>
                </div>
                <Badge status={item.status}>{item.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card header="Recent Attendance Regularizations" headerRight={<Link to="/hr/regularizations" className="text-xs text-blue-600 hover:underline font-semibold">View All</Link>}>
          <div className="divide-y divide-slate-100">
            {(data?.recentRegularizations || [
              { primary: 'Jim Halpert', secondary: 'Missed Punch Out', tertiary: 'Biometric device offline', status: 'Pending' },
              { primary: 'Dwight Schrute', secondary: 'Late Arrival Correction', tertiary: 'Client meeting offsite', status: 'Approved' },
            ]).map((item: any, idx: number) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.primary}</h4>
                  <p className="text-[11px] text-slate-500">{item.secondary} &bull; {item.tertiary}</p>
                </div>
                <Badge status={item.status}>{item.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
