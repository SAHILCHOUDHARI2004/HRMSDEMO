import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Calendar,
  MapPin,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { attendanceService } from '../../services/api/attendance.service';
import { AttendanceRecord } from '../../types/attendance.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { formatDate, formatTime, formatMinutes } from '../../utils/date';

export const EmployeeTimesheetsPage: React.FC = () => {
  const { error } = useToast();
  const [timesheets, setTimesheets] = useState<AttendanceRecord[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await attendanceService.getMyTimesheets(
        startDate || undefined,
        endDate || undefined
      );
      setTimesheets(res || []);
    } catch (err: any) {
      error('Failed to load timesheets', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Aggregate monthly stats
  const totalWorkedMins = timesheets.reduce((acc, t) => acc + (t.totalWorkingMinutes || 0), 0);
  const totalOvertimeMins = timesheets.reduce((acc, t) => acc + (t.overtimeMinutes || 0), 0);
  const presentDays = timesheets.filter((t) => t.status === 'Present' || t.status === 'Working').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Attendance & Timesheets</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your daily check-in timestamps, total working hours, break periods, and overtime logs.
          </p>
        </div>
      </div>

      {/* Summary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase">Days Present</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{presentDays} days</h3>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase">Total Hours Worked</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{formatMinutes(totalWorkedMins)}</h3>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase">Total Overtime</p>
          <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{formatMinutes(totalOvertimeMins)}</h3>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card noPadding className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <div className="flex items-end sm:self-end">
            <Button
              variant="secondary"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Timesheets Table */}
      <Card noPadding>
        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner text="Fetching attendance timesheets..." />
          </div>
        ) : timesheets.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No timesheet records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Punch In</th>
                  <th className="py-3 px-4">Punch Out</th>
                  <th className="py-3 px-4">Total Worked</th>
                  <th className="py-3 px-4">Overtime</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {timesheets.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatDate(row.date)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                      {row.punchIn ? formatTime(row.punchIn) : '--:--'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                      {row.punchOut ? formatTime(row.punchOut) : '--:--'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                      {formatMinutes(row.totalWorkingMinutes)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-indigo-600 font-semibold">
                      {row.overtimeMinutes > 0 ? formatMinutes(row.overtimeMinutes) : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={row.status}>{row.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
