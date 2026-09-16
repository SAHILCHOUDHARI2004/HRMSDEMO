import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { attendanceService } from '../../services/api/attendance.service';
import { AttendanceRecord } from '../../types/attendance.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { formatDate, formatTime, formatMinutes } from '../../utils/date';
import { getInitials } from '../../utils/formatters';

export const HrAttendanceMonitorPage: React.FC = () => {
  const { error } = useToast();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Photo Preview Modal
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await attendanceService.getAllAttendance({
        page,
        limit: pageSize,
        date: dateFilter || undefined,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setRecords(res.data || []);
      setTotalCount(res.total || 0);
    } catch (err: any) {
      error('Failed to load attendance logs', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, dateFilter, statusFilter, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Real-Time Attendance Monitor</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Live workforce check-ins, punch photos, GPS addresses, and worked hours audit.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card noPadding className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            label="Filter by Date"
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
          />

          <Select
            label="Attendance Status"
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Working Now', value: 'Working' },
              { label: 'Present', value: 'Present' },
              { label: 'Absent', value: 'Absent' },
              { label: 'Half Day', value: 'Half-Day' },
              { label: 'On Leave', value: 'Leave' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />

          <Input
            label="Search Employee"
            placeholder="Name or employee code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />

          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setDateFilter('');
                setStatusFilter('');
                setSearch('');
                setPage(1);
              }}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="w-full"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Attendance Table */}
      <Card noPadding>
        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner text="Fetching attendance records..." />
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No attendance records found</p>
            <p className="text-xs text-slate-400 mt-1">Try selecting a different date or clearing filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Punch In</th>
                  <th className="py-3 px-4">Punch Out</th>
                  <th className="py-3 px-4">Worked Time</th>
                  <th className="py-3 px-4">Overtime</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Selfie Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {getInitials(rec.employeeName)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{rec.employeeName}</span>
                          <span className="text-[11px] font-mono text-blue-600">{rec.employeeCode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {formatDate(rec.date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-medium text-slate-800 block">
                        {rec.punchIn ? formatTime(rec.punchIn) : '--:--'}
                      </span>
                      {rec.punchInAddress && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate max-w-[160px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {rec.punchInAddress}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-medium text-slate-800 block">
                        {rec.punchOut ? formatTime(rec.punchOut) : '--:--'}
                      </span>
                      {rec.punchOutAddress && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate max-w-[160px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {rec.punchOutAddress}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                      {formatMinutes(rec.totalWorkingMinutes)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-indigo-600">
                      {rec.overtimeMinutes > 0 ? formatMinutes(rec.overtimeMinutes) : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={rec.status}>{rec.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {rec.punchInImage && (
                          <button
                            onClick={() =>
                              setPreviewPhoto({
                                url: rec.punchInImage!,
                                title: `${rec.employeeName} - Punch In Photo`,
                              })
                            }
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="View Punch In Selfie"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        )}
                        {rec.punchOutImage && (
                          <button
                            onClick={() =>
                              setPreviewPhoto({
                                url: rec.punchOutImage!,
                                title: `${rec.employeeName} - Punch Out Photo`,
                              })
                            }
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            title="View Punch Out Selfie"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        )}
                        {!rec.punchInImage && !rec.punchOutImage && (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalCount}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </Card>

      {/* Selfie Photo Preview Modal */}
      <Modal
        isOpen={!!previewPhoto}
        onClose={() => setPreviewPhoto(null)}
        maxWidth="md"
        title={previewPhoto?.title || 'Attendance Selfie'}
        footer={
          <Button variant="secondary" onClick={() => setPreviewPhoto(null)}>
            Close
          </Button>
        }
      >
        {previewPhoto && (
          <div className="flex justify-center p-2">
            <img
              src={previewPhoto.url}
              alt="Attendance Selfie"
              className="rounded-2xl max-h-96 w-auto object-cover shadow-lg border border-slate-200"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
