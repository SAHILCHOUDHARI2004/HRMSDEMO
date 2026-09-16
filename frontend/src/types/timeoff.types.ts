export interface TimeOffRequestCreate {
  date: string;
  leave_type: string;
  start_time?: string | null;
  end_time?: string | null;
  duration_hours: number;
  reason?: string | null;
  attachment_name?: string | null;
}

export interface TimeOffRequestResponse {
  id: number;
  employee_id: number;
  employee_code?: string | null;
  date: string;
  leave_type: string;
  start_time?: string | null;
  end_time?: string | null;
  duration_hours: number;
  status: string;
  employee_name?: string | null;
  reason?: string | null;
  attachment_name?: string | null;
}

export interface TimeOffApplyPayload {
  date: string;
  leave_type: string;
  start_time?: string | null;
  end_time?: string | null;
}

export interface TimeOffApplyResponse {
  id: number;
  employee_id: number;
  employee_code?: string | null;
  date: string;
  leave_type: string;
  start_time?: string | null;
  end_time?: string | null;
  duration_hours: number;
  status: string;
  approved_hours_today: number;
  remaining_hours_today: number;
  approved_seconds_today: number;
  remaining_seconds_today: number;
  employee_name?: string | null;
}

export interface TimeOffRequestPaginatedResponse {
  items: TimeOffRequestResponse[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface TimeOffDecisionRequest {
  decision: 'approved' | 'rejected';
  comment?: string | null;
  approvedHours?: number | null;
}

export interface TimeOffBootstrap {
  leaveTypes: Array<{
    id: number;
    name: string;
    code: string;
    unitType: string;
  }>;
  balance: {
    totalHours: number;
    usedHours: number;
    remainingHours: number;
  };
  holidays: Array<{
    date: string;
    name: string;
  }>;
}
