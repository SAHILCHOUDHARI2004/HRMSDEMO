import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
} from 'lucide-react';
import { timeoffService } from '../../services/api/timeoff.service';
import { TimeOffRequestResponse } from '../../types/timeoff.types';
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
import { getInitials } from '../../utils/formatters';

export const HrTimeOffRequestsPage: React.FC = () => {
  const { success, error } = useToast();
  const [requests, setRequests] = useState<TimeOffRequestResponse[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Decision Modal
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<TimeOffRequestResponse | null>(null);
  const [decisionType, setDecisionType] = useState<'approved' | 'rejected'>('approved');
  const [comment, setComment] = useState('');
  const [approvedHours, setApprovedHours] = useState<number>(8);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await timeoffService.getAllRequests(page, pageSize, statusFilter || undefined);
      setRequests(res.items || []);
      setTotalItems(res.totalItems || 0);
    } catch (err: any) {
      error('Failed to load leave requests', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleOpenDecision = (req: TimeOffRequestResponse, type: 'approved' | 'rejected') => {
    setSelectedReq(req);
    setDecisionType(type);
    setApprovedHours(req.duration_hours || 8);
    setComment('');
    setIsDecisionOpen(true);
  };

  const handleDecisionSubmit = async () => {
    if (!selectedReq) return;
    try {
      setIsActionLoading(true);
      await timeoffService.makeDecision(selectedReq.id, {
        decision: decisionType,
        comment,
        approvedHours: decisionType === 'approved' ? approvedHours : undefined,
      });
      success(
        decisionType === 'approved' ? 'Leave Approved' : 'Leave Rejected',
        `Processed request for ${selectedReq.employee_name || 'Employee'}`
      );
      setIsDecisionOpen(false);
      loadRequests();
    } catch (err: any) {
      error('Decision Failed', err.response?.data?.detail || err.message);
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Time-Off & Leave Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review employee time-off requests, calculate day quotas, and authorize leave allowances.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card noPadding className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Select
            label="Filter by Status"
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Pending Review', value: 'Pending' },
              { label: 'Approved', value: 'Approved' },
              { label: 'Rejected', value: 'Rejected' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="sm:w-64"
          />
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setStatusFilter('');
                setPage(1);
              }}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Requests Table */}
      <Card noPadding>
        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner text="Fetching leave requests..." />
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No time-off requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {req.employee_name || `Employee #${req.employee_id}`}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-blue-600">
                      {req.leave_type}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {formatDate(req.date)}
                      {req.start_time && req.end_time && (
                        <span className="block text-[11px] text-slate-400 font-mono">
                          {req.start_time} - {req.end_time}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
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
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleOpenDecision(req, 'approved')}
                            className="px-2.5 py-1 text-xs"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleOpenDecision(req, 'rejected')}
                            className="px-2.5 py-1 text-xs"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">Decided</span>
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

      {/* Decision Modal */}
      <Modal
        isOpen={isDecisionOpen}
        onClose={() => setIsDecisionOpen(false)}
        maxWidth="md"
        title={decisionType === 'approved' ? 'Approve Time-Off Request' : 'Reject Time-Off Request'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDecisionOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={decisionType === 'approved' ? 'success' : 'danger'}
              onClick={handleDecisionSubmit}
              isLoading={isActionLoading}
            >
              {decisionType === 'approved' ? 'Grant Leave' : 'Decline Request'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
            <p><strong className="text-slate-700">Employee:</strong> {selectedReq?.employee_name}</p>
            <p><strong className="text-slate-700">Leave Type:</strong> {selectedReq?.leave_type}</p>
            <p><strong className="text-slate-700">Date:</strong> {selectedReq?.date}</p>
            <p><strong className="text-slate-700">Reason:</strong> {selectedReq?.reason || 'No reason provided'}</p>
          </div>

          {decisionType === 'approved' && (
            <Input
              label="Approved Hours"
              type="number"
              value={approvedHours}
              onChange={(e) => setApprovedHours(Number(e.target.value))}
            />
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Decision Comments (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave notes for employee..."
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
