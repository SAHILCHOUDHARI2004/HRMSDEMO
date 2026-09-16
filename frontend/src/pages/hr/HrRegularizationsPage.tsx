import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { regularizationService } from '../../services/api/regularization.service';
import { RegularizationRequestResponse } from '../../types/regularization.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils/date';

export const HrRegularizationsPage: React.FC = () => {
  const { success, error } = useToast();
  const [requests, setRequests] = useState<RegularizationRequestResponse[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Decision Modal
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<RegularizationRequestResponse | null>(null);
  const [decisionType, setDecisionType] = useState<'approved' | 'rejected'>('approved');
  const [comment, setComment] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await regularizationService.getAllRequests(page, pageSize, statusFilter || undefined);
      setRequests(res.items || []);
      setTotalItems(res.totalItems || 0);
    } catch (err: any) {
      error('Failed to load regularizations', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleOpenDecision = (req: RegularizationRequestResponse, type: 'approved' | 'rejected') => {
    setSelectedReq(req);
    setDecisionType(type);
    setComment('');
    setIsDecisionOpen(true);
  };

  const handleDecisionSubmit = async () => {
    if (!selectedReq) return;
    try {
      setIsActionLoading(true);
      await regularizationService.makeDecision(selectedReq.id, {
        status: decisionType,
        reviewComment: comment,
      });
      success(
        decisionType === 'approved' ? 'Regularization Approved' : 'Regularization Rejected',
        `Adjusted timesheet for ${selectedReq.employeeName || 'Employee'}.`
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Regularization Hub</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review missed punch corrections, verify outdoor client duty slips, and resolve clock-in disputes.
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
            <LoadingSpinner text="Fetching regularization requests..." />
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <CalendarCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No regularization requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Attendance Date</th>
                  <th className="py-3 px-4">Requested In / Out</th>
                  <th className="py-3 px-4">Reason Category</th>
                  <th className="py-3 px-4">Reason Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {req.employeeName || `Employee #${req.employeeId}`}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {formatDate(req.attendanceDate)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-blue-600">
                      {req.requestedPunchIn || '--:--'} - {req.requestedPunchOut || '--:--'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {req.reasonType}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {req.reasonText}
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
                        <span className="text-slate-400 text-xs font-medium">Processed</span>
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
        title={decisionType === 'approved' ? 'Approve Regularization' : 'Reject Regularization'}
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
              {decisionType === 'approved' ? 'Apply Correction' : 'Decline Correction'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
            <p><strong className="text-slate-700">Employee:</strong> {selectedReq?.employeeName}</p>
            <p><strong className="text-slate-700">Date:</strong> {selectedReq?.attendanceDate}</p>
            <p><strong className="text-slate-700">Requested Times:</strong> {selectedReq?.requestedPunchIn} - {selectedReq?.requestedPunchOut}</p>
            <p><strong className="text-slate-700">Reason:</strong> {selectedReq?.reasonText}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Reviewer Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide reason or audit note..."
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
