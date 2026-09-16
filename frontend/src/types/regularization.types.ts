export interface RegularizationRequestCreate {
  attendanceDate: string;
  requestedPunchIn?: string | null;
  requestedPunchOut?: string | null;
  reasonType: string;
  reasonText: string;
}

export interface RegularizationRequestDecision {
  status: 'approved' | 'rejected';
  reviewComment?: string | null;
}

export interface RegularizationRequestResponse {
  id: number;
  employeeId: number;
  employeeName?: string | null;
  employeeCode?: string | null;
  attendanceDate: string;
  requestedPunchIn?: string | null;
  requestedPunchOut?: string | null;
  reasonType: string;
  reasonText: string;
  status: string;
  reviewedBy?: number | null;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
  reviewComment?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegularizationRequestPaginatedResponse {
  items: RegularizationRequestResponse[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
