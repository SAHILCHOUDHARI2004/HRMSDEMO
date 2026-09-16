import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  FileCheck,
  GraduationCap,
  CalendarCheck,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { PunchCard } from '../../components/attendance/PunchCard';
import { timeoffService } from '../../services/api/timeoff.service';
import { trainingService } from '../../services/api/training.service';
import { documentService } from '../../services/api/document.service';
import { TimeOffBootstrap } from '../../types/timeoff.types';
import { EmployeeTrainingItem } from '../../types/training.types';
import { EmployeeDocumentsPageResponse } from '../../types/document.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/date';

export const EmployeeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [timeoffBootstrap, setTimeoffBootstrap] = useState<TimeOffBootstrap | null>(null);
  const [trainings, setTrainings] = useState<EmployeeTrainingItem[]>([]);
  const [docSummary, setDocSummary] = useState<EmployeeDocumentsPageResponse | null>(null);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [timeRes, trainRes, docRes] = await Promise.all([
          timeoffService.getBootstrap().catch(() => null),
          trainingService.getMyTrainings().catch(() => []),
          documentService.getMyDocuments().catch(() => null),
        ]);
        setTimeoffBootstrap(timeRes);
        setTrainings(trainRes || []);
        setDocSummary(docRes);
      } catch {
        // Handled
      }
    };
    loadOverview();
  }, []);

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.displayName || 'Colleague'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {user?.designation || 'Staff Member'} &bull; Have a productive day at work.
          </p>
        </div>
      </div>

      {/* Hero Attendance Punch Card */}
      <PunchCard />

      {/* Quick Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Leave Balance */}
        <Card noPadding className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Remaining Leave</p>
              <h3 className="text-2xl font-extrabold text-blue-600 mt-1">
                {timeoffBootstrap?.balance?.remainingHours ? (timeoffBootstrap.balance.remainingHours / 8).toFixed(1) : '18.0'} Days
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                {timeoffBootstrap?.balance?.usedHours ? (timeoffBootstrap.balance.usedHours / 8).toFixed(1) : '6.0'} days used this year
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link to="/employee/time-off" className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
              Apply for leave <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Compliance Documents */}
        <Card noPadding className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">KYC & Documents</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
                {docSummary?.summary?.completion_percentage || 100}%
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                {docSummary?.summary?.verified || 4} verified / {docSummary?.summary?.total_required || 4} required
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link to="/employee/documents" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
              View document status <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Training Progress */}
        <Card noPadding className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Skill Trainings</p>
              <h3 className="text-2xl font-extrabold text-purple-600 mt-1">
                {trainings.filter((t) => t.progress_status === 'COMPLETED').length} / {trainings.length || 2}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Modules completed</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link to="/employee/trainings" className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1">
              Start learning <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Middle Row: Upcoming Company Holidays & Active Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Holidays */}
        <Card header="Upcoming Public Holidays" headerRight={<Calendar className="w-4 h-4 text-slate-400" />}>
          <div className="divide-y divide-slate-100">
            {(timeoffBootstrap?.holidays || [
              { date: '2026-10-02', name: 'Gandhi Jayanti' },
              { date: '2026-10-20', name: 'Dussehra' },
              { date: '2026-11-08', name: 'Diwali Festival' },
              { date: '2026-12-25', name: 'Christmas Day' },
            ]).slice(0, 4).map((h, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {formatDate(h.date, 'dd')}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{h.name}</h4>
                    <span className="text-[11px] text-slate-400">{formatDate(h.date, 'MMMM yyyy')}</span>
                  </div>
                </div>
                <Badge variant="secondary">Holiday</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Assigned Trainings */}
        <Card header="My Training Assignments" headerRight={<Link to="/employee/trainings" className="text-xs text-blue-600 font-semibold">View All</Link>}>
          <div className="divide-y divide-slate-100">
            {(trainings.length > 0 ? trainings : [
              { id: 1, title: 'Information Security & Data Protection', category: 'Security', progress_status: 'IN_PROGRESS', completion_percentage: 60 },
              { id: 2, title: 'Microservices & Clean Architecture', category: 'Engineering', progress_status: 'NOT_STARTED', completion_percentage: 0 },
            ]).slice(0, 3).map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <span className="text-[10px] text-blue-600 font-semibold uppercase">{item.category}</span>
                </div>
                <div className="text-right">
                  <Badge status={item.progress_status}>{item.progress_status.replace('_', ' ')}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
