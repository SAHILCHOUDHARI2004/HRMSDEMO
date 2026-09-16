import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { regularizationService } from '../../services/api/regularization.service';
import {
  RegularizationRequestResponse,
  RegularizationRequestCreate,
} from '../../types/regularization.types';
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

export const EmployeeRegularizationPage: React.FC = () => {
  const { success, error } = useToast();
  const [requests, setRequests] = useState<RegularizationRequestResponse[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Apply Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [form, setForm] = useState<RegularizationRequestCreate>({
    attendanceDate: new Date().toISOString().split('T')[0],
    requestedPunchIn: '09:00:00',
    requestedPunchOut: '18:00:00',
    reasonType: 'Forgot to Punch',
    reasonText: '',
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await regularizationService.getMyRequests(page, pageSize);
      setRequests(res.items || []);
      setTotalItems(res.totalItems || 0);
    } catch (err: any) {
      error('Failed to load regularizations', err.message);
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
      await regularizationService.submit(form);
      success('Regularization Submitted', 'Sent to HR for review.');
      setIsApplyModalOpen(false);
      setForm({
        attendanceDate: new Date().toISOString().split('T')[0],
        requestedPunchIn: '09:00:00',
        requestedPunchOut: '18:00:00',
        reasonType: 'Forgot to Punch',
        reasonText: '',
      });
      loadData();
    } catch (err: any) {
      error('Submission Failed', err.response?.data?.detail || err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Regularization</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Request timesheet corrections for missed punches, client on-site visits, or biometric device anomalies.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsApplyModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Request Regularization
        </Button>
      </div>

      {/* Requests Table */}
      <Card header="My Regularization Applications" noPadding>
        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner text="Fetching regularization history..." />
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <CalendarCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No regularization requests</p>
            <p className="text-xs text-slate-400 mt-1">All your attendance punches are clean and recorded.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Requested Times</th>
                  <th className="py-3 px-4">Reason Category</th>
                  <th className="py-3 px-4">Reason Note</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">HR Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatDate(req.attendanceDate)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-blue-600">
                      {req.requestedPunchIn || '--:--'} - {req.requestedPunchOut || '--:--'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {req.reasonType}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {req.reasonText}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={req.status}>{req.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {req.reviewComment || '-'}
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

      {/* Apply Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        maxWidth="md"
        title="Request Attendance Regularization"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApplySubmit} isLoading={isActionLoading}>
              Submit for Approval
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Attendance Date"
            type="date"
            required
            value={form.attendanceDate}
            onChange={(e) => setForm({ ...form, attendanceDate: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Actual In Time"
              type="time"
              required
              value={form.requestedPunchIn || ''}
              onChange={(e) => setForm({ ...form, requestedPunchIn: e.target.value })}
            />
            <Input
              label="Actual Out Time"
              type="time"
              required
              value={form.requestedPunchOut || ''}
              onChange={(e) => setForm({ ...form, requestedPunchOut: e.target.value })}
            />
          </div>

          <Select
            label="Reason Category"
            options={[
              { label: 'Forgot to Punch In / Out', value: 'Forgot to Punch' },
              { label: 'Client / On-Site Duty', value: 'On-site Client Visit' },
              { label: 'Biometric / System Glitch', value: 'Technical Error' },
              { label: 'Working from Home / Remote Setup', value: 'Remote Work' },
            ]}
            value={form.reasonType}
            onChange={(e) => setForm({ ...form, reasonType: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Detailed Explanation
            </label>
            <textarea
              rows={3}
              required
              value={form.reasonText}
              onChange={(e) => setForm({ ...form, reasonText: e.target.value })}
              placeholder="Explain why the punch was missed or irregular..."
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
