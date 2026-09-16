import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Clock,
  UserCheck,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { reportService } from '../../services/api/report.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { formatDate, formatTime, formatMinutes } from '../../utils/date';

export const AdminReportsPage: React.FC = () => {
  const { success, error } = useToast();

  const [reportType, setReportType] = useState<string>('attendance-summary');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [department, setDepartment] = useState<string>('');

  const [reportData, setReportData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page,
        pageSize,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: search || undefined,
        department: department || undefined,
      };

      let res: any;
      if (reportType === 'attendance-summary') {
        res = await reportService.getAttendanceSummary(params);
      } else if (reportType === 'late-arrivals') {
        res = await reportService.getLateArrivals(params);
      } else if (reportType === 'missing-punches') {
        res = await reportService.getMissingPunches(params);
      } else if (reportType === 'leave-usage') {
        res = await reportService.getLeaveUsage(params);
      } else if (reportType === 'hr-workload') {
        res = await reportService.getHrWorkload(params);
      } else if (reportType === 'employee-status') {
        res = await reportService.getEmployeeStatus(params);
      }

      setReportData(res?.data || []);
      setTotalItems(res?.total || 0);
    } catch (err: any) {
      error('Report Load Error', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [reportType, page, pageSize, startDate, endDate, search, department]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExport = async (format = 'csv') => {
    try {
      setIsExporting(true);
      const blob = await reportService.exportReport(reportType, format, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: search || undefined,
        department: department || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      success('Report Exported', `Downloaded as ${format.toUpperCase()}`);
    } catch {
      error('Export Error', 'Could not export report data.');
    } finally {
      setIsExporting(false);
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  const reportTypes = [
    { label: 'Attendance Summary', value: 'attendance-summary' },
    { label: 'Late Arrival Log', value: 'late-arrivals' },
    { label: 'Missing Punch Records', value: 'missing-punches' },
    { label: 'Leave & Time-Off Usage', value: 'leave-usage' },
    { label: 'HR Officer Workload', value: 'hr-workload' },
    { label: 'Employee Status & Quotas', value: 'employee-status' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Analytics & Reports</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate and export operational records for compliance, audits, and payroll verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExport('csv')}
            isLoading={isExporting}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleExport('pdf')}
            isLoading={isExporting}
            leftIcon={<FileSpreadsheet className="w-4 h-4" />}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card noPadding className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Select
            label="Report Type"
            options={reportTypes}
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value);
              setPage(1);
            }}
          />

          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
          />

          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
          />

          <Input
            label="Search Filter"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setSearch('');
                setPage(1);
              }}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="w-full"
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Table */}
      <Card noPadding>
        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner text="Generating report data..." />
          </div>
        ) : reportData.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No report entries found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting the date range or filter options.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {reportType === 'attendance-summary' && (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Present</th>
                    <th className="py-3 px-4">Absent</th>
                    <th className="py-3 px-4">Half Days</th>
                    <th className="py-3 px-4">Leaves</th>
                    <th className="py-3 px-4">Total Worked</th>
                    <th className="py-3 px-4">Overtime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{row.employeeName}</span>
                        <span className="text-[11px] font-mono text-blue-600">{row.employeeCode}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{row.department || '-'}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">{row.presentDays} days</td>
                      <td className="py-3.5 px-4 font-bold text-rose-600">{row.absentDays} days</td>
                      <td className="py-3.5 px-4 text-slate-600">{row.halfDays} days</td>
                      <td className="py-3.5 px-4 text-slate-600">{row.leaveDays} days</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">{formatMinutes(row.totalWorkingMinutes)}</td>
                      <td className="py-3.5 px-4 font-mono text-indigo-600 font-semibold">{formatMinutes(row.totalOvertimeMinutes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'late-arrivals' && (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Scheduled Start</th>
                    <th className="py-3 px-4">Punch In Time</th>
                    <th className="py-3 px-4">Late Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{row.employeeName}</span>
                        <span className="text-[11px] font-mono text-slate-400">{row.employeeCode}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{formatDate(row.date)}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{row.scheduledStart || '09:00:00'}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600">{row.punchIn || '-'}</td>
                      <td className="py-3.5 px-4 font-bold text-rose-600">{row.lateMinutes} mins late</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'missing-punches' && (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Punch In</th>
                    <th className="py-3 px-4">Punch Out</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{row.employeeName}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{formatDate(row.date)}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{row.punchIn || <span className="text-rose-500 font-bold">Missing</span>}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{row.punchOut || <span className="text-rose-500 font-bold">Missing</span>}</td>
                      <td className="py-3.5 px-4"><Badge status={row.status}>{row.status}</Badge></td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">{row.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'leave-usage' && (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{row.employeeName}</td>
                      <td className="py-3.5 px-4 font-semibold text-blue-600">{row.leaveType}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{row.durationHours} hrs ({row.durationHours / 8} days)</td>
                      <td className="py-3.5 px-4 text-slate-600">{formatDate(row.date)}</td>
                      <td className="py-3.5 px-4"><Badge status={row.status}>{row.status}</Badge></td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">{row.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'hr-workload' && (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">HR Personnel</th>
                    <th className="py-3 px-4">Pending Leave Requests</th>
                    <th className="py-3 px-4">Pending Regularizations</th>
                    <th className="py-3 px-4">Processed Leaves</th>
                    <th className="py-3 px-4">Processed Regularizations</th>
                    <th className="py-3 px-4">Total Handled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{row.hrName}</td>
                      <td className="py-3.5 px-4 font-bold text-amber-600">{row.pendingTimeoff}</td>
                      <td className="py-3.5 px-4 font-bold text-amber-600">{row.pendingRegularization}</td>
                      <td className="py-3.5 px-4 text-emerald-600 font-semibold">{row.processedTimeoff}</td>
                      <td className="py-3.5 px-4 text-emerald-600 font-semibold">{row.processedRegularization}</td>
                      <td className="py-3.5 px-4 font-bold text-blue-600">{row.totalHandled} tasks</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'employee-status' && (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department & Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">DOJ</th>
                    <th className="py-3 px-4">Leave Balance Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{row.employeeName}</span>
                        <span className="text-[11px] font-mono text-blue-600">{row.employeeCode}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">{row.designation || '-'}</span>
                        <span className="text-xs text-slate-500">{row.department || '-'}</span>
                      </td>
                      <td className="py-3.5 px-4"><Badge status={row.status}>{row.status}</Badge></td>
                      <td className="py-3.5 px-4 text-slate-600">{formatDate(row.doj)}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">{row.timeoffBalanceHours} hrs ({row.timeoffBalanceHours / 8} days)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </Card>
    </div>
  );
};
