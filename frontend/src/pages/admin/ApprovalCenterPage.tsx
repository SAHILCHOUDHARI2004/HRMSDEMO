import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare,
  Clock,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  MessageSquare,
  History,
  AlertCircle,
} from 'lucide-react';
import { approvalService } from '../../services/api/approval.service';
import { ApprovalItem, ApprovalTask } from '../../types/approval.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { formatDate, formatDateTime } from '../../utils/date';

export const ApprovalCenterPage: React.FC = () => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [pendingItems, setPendingItems] = useState<ApprovalItem[]>([]);
  const [counts, setCounts] = useState<{ timeoff: number; regularization: number; total: number }>({
    timeoff: 0,
    regularization: 0,
    total: 0,
  });
  const [historyTasks, setHistoryTasks] = useState<ApprovalTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Decision Modal
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ApprovalItem | null>(null);
  const [decisionType, setDecisionType] = useState<'approved' | 'rejected'>('approved');
  const [decisionComment, setDecisionComment] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadPending = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await approvalService.getPending();
      setPendingItems(res.items || []);
      setCounts(res.counts || { timeoff: 0, regularization: 0, total: 0 });
    } catch (err: any) {
      error('Failed to load pending queue', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await approvalService.getHistory(1, 30);
      setHistoryTasks(res.items || []);
    } catch (err: any) {
      error('Failed to load history', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'pending') {
      loadPending();
    } else {
      loadHistory();
    }
  }, [activeTab, loadPending, loadHistory]);

  const handleOpenDecision = (item: ApprovalItem, type: 'approved' | 'rejected') => {
    setSelectedTask(item);
    setDecisionType(type);
    setDecisionComment('');
    setIsDecisionOpen(true);
  };

  const handleDecisionSubmit = async () => {
    if (!selectedTask) return;
    try {
      setIsActionLoading(true);
      await approvalService.makeDecision(selectedTask.id, {
        decision: decisionType,
        comment: decisionComment,
      });
      success(
        decisionType === 'approved' ? 'Request Approved' : 'Request Rejected',
        `Successfully processed ${selectedTask.requestType} for ${selectedTask.employeeName}.`
      );
      setIsDecisionOpen(false);
      loadPending();
    } catch (err: any) {
      error('Decision Failed', err.response?.data?.detail || err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Approval Center</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Central review station for leave allocations, timesheet regularization, and managerial sign-offs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Pending Queue</span>
            {counts.total > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {counts.total}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Decision Log</span>
          </button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        <Card noPadding>
          {isLoading ? (
            <div className="py-16">
              <LoadingSpinner text="Fetching pending approval tasks..." />
            </div>
          ) : pendingItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-400 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-700">All clear! No pending requests</p>
              <p className="text-xs text-slate-400 mt-1">All employee submissions have been handled.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingItems.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      {item.requestType?.toLowerCase().includes('timeoff') || item.requestType?.toLowerCase().includes('leave') ? (
                        <Calendar className="w-5 h-5" />
                      ) : (
                        <CalendarCheck className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{item.employeeName}</h4>
                        <Badge size="sm" variant="primary">{item.requestType}</Badge>
                        <Badge size="sm" status={item.priority}>{item.priority || 'Normal'}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Submitted: {formatDateTime(item.submittedAt)} &bull; Assigned to: <strong className="font-semibold text-slate-700">{item.assignedRole}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleOpenDecision(item, 'approved')}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleOpenDecision(item, 'rejected')}
                      leftIcon={<XCircle className="w-4 h-4" />}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <Card noPadding>
          {isLoading ? (
            <div className="py-16">
              <LoadingSpinner text="Fetching audit decision logs..." />
            </div>
          ) : historyTasks.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <History className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No past decision records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">Request Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Decision Comment</th>
                    <th className="py-3 px-4">Reviewed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{task.requestType}</td>
                      <td className="py-3.5 px-4">
                        <Badge status={task.status}>{task.status}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs max-w-xs truncate">
                        {task.decisionComment || task.managerDecisionComment || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{formatDateTime(task.reviewedAt || task.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Decision Modal */}
      <Modal
        isOpen={isDecisionOpen}
        onClose={() => setIsDecisionOpen(false)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2">
            {decisionType === 'approved' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600" />
            )}
            <span>{decisionType === 'approved' ? 'Approve Request' : 'Reject Request'}</span>
          </div>
        }
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
              {decisionType === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
            <p><strong className="text-slate-700">Employee:</strong> {selectedTask?.employeeName}</p>
            <p><strong className="text-slate-700">Type:</strong> {selectedTask?.requestType}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Reviewer Notes / Feedback (Optional)
            </label>
            <textarea
              rows={3}
              value={decisionComment}
              onChange={(e) => setDecisionComment(e.target.value)}
              placeholder="Provide context for this approval decision..."
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
