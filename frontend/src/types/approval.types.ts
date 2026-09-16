export interface ApprovalDecisionPayload {
  decision: 'approved' | 'rejected';
  comment?: string | null;
  approvedHours?: number | null;
  override?: boolean;
  overrideReason?: string | null;
}

export interface ApprovalItem {
  id: number;
  requestType: string;
  requestId: number;
  employeeId: number;
  employeeName: string;
  status: string;
  submittedAt: string;
  priority: string;
  assignedRole: string;
}

export interface ApprovalQueueResponse {
  items: ApprovalItem[];
  counts: {
    timeoff: number;
    regularization: number;
    total: number;
  };
}

export interface ApprovalTask {
  id: number;
  requestType: string;
  requestId: number;
  employeeId: number;
  assignedRole: string;
  status: string;
  priority: string;
  submittedBy: number;
  reviewedBy?: number | null;
  reviewedAt?: string | null;
  decisionComment?: string | null;
  managerReviewedBy?: number | null;
  managerReviewedAt?: string | null;
  managerDecisionComment?: string | null;
  createdAt: string;
}
