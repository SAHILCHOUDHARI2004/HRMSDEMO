import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { timeoffService } from '../../services/api/timeoff.service';
import {
  TimeOffBootstrap,
  TimeOffRequestResponse,
  TimeOffRequestCreate,
} from '../../types/timeoff.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils/date';

export const EmployeeTimeOffPage: React.FC = () => {
  const { success, error } = useToast();
  const [bootstrap, setBootstrap] = useState<TimeOffBootstrap | null>(null);
  const [requests, setRequests] = useState<TimeOffRequestResponse[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Apply Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [form, setForm] = useState<TimeOffRequestCreate>({
    date: new Date().toISOString().split('T')[0],
    leave_type: 'Casual Leave',
    duration_hours: 8,
    reason: '',
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [bootRes, reqRes] = await Promise.all([
        timeoffService.getBootstrap().catch(() => null),
        timeoffService.getMyRequests(page, pageSize).catch(() => ({ items: [], totalItems: 0 })),
      ]);
      setBootstrap(bootRes);
      setRequests(reqRes.items || []);
      setTotalItems(reqRes.totalItems || 0);
    } catch (err: any) {
      error('Failed to load leave data', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsActionLoading(true);
      await timeoffService.request(form);
      success('Leave Application Submitted', `Applied for ${form.leave_type} on ${form.date}.`);
      setIsApplyModalOpen(false);
      setForm({
        date: new Date().toISOString().split('T')[0],
        leave_type: bootstrap?.leaveTypes?.[0]?.name || 'Casual Leave',
        duration_hours: 8,
        reason: '',
      });
      loadData();
    } catch (err: any) {
      error('Application Failed', err.response?.data?.detail || err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) return;
    try {
      await timeoffService.cancelRequest(requestId);
      success('Application Cancelled', 'Leave request has been withdrawn.');
      loadData();
    } catch (err: any) {
      error('Cancel Failed', err.response?.data?.detail || err.message);
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Time-Off & Leave Portal</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Apply for planned leaves, check allocated annual quotas, and track management decisions.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            if (bootstrap?.leaveTypes?.length) {
              setForm((prev) => ({ ...prev, leave_type: bootstrap.leaveTypes[0].name }));
            }
            setIsApplyModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Apply for Leave
        </Button>
      </div>

      {/* Quotas & Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Annual Allocation</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
            {bootstrap?.balance?.totalHours ? (bootstrap.balance.totalHours / 8).toFixed(1) : '24.0'} Days
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Total approved entitlement</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Used Leaves</p>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-1">
            {bootstrap?.balance?.usedHours ? (bootstrap.balance.usedHours / 8).toFixed(1) : '6.0'} Days
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Taken in current cycle</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Remaining Balance</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
            {bootstrap?.balance?.remainingHours ? (bootstrap.balance.remainingHours / 8).toFixed(1) : '18.0'} Days
          </h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Available for use</p>
        </Card>
      </div>

      {/* Past Requests Table */}
      <Card header="My Leave Applications" noPadding>
        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner text="Fetching your leave records..." />
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No leave requests found</p>
            <p className="text-xs text-slate-400 mt-1">You haven't submitted any leave applications yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {req.leave_type}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {formatDate(req.date)}
                      {req.start_time && req.end_time && (
                        <span className="block text-[11px] text-slate-400 font-mono">
                          {req.start_time} - {req.end_time}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {req.duration_hours} hrs ({req.duration_hours / 8} d)
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {req.reason || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={req.status}>{req.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {req.status === 'Pending' ? (
                        <button
                          onClick={() => handleCancelRequest(req.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors"
                          title="Withdraw Application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
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
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </Card>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        maxWidth="md"
        title="Apply for Time-Off / Leave"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApplySubmit} isLoading={isActionLoading}>
              Submit Application
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Select
            label="Leave Type"
            options={(bootstrap?.leaveTypes || [
              { name: 'Casual Leave', id: 1 },
              { name: 'Sick Leave', id: 2 },
              { name: 'Privilege Leave', id: 3 },
            ]).map((t) => ({ label: t.name, value: t.name }))}
            value={form.leave_type}
            onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
          />

          <Input
            label="Leave Date"
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <Select
            label="Duration"
            options={[
              { label: 'Full Day (8 Hours)', value: 8 },
              { label: 'Half Day (4 Hours)', value: 4 },
              { label: 'Partial (2 Hours)', value: 2 },
            ]}
            value={form.duration_hours}
            onChange={(e) => setForm({ ...form, duration_hours: Number(e.target.value) })}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Reason for Absence
            </label>
            <textarea
              rows={3}
              required
              value={form.reason || ''}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="State the purpose of your time off..."
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
