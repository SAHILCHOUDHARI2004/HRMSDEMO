export interface PunchRequest {
  employeeId?: number | null;
  workMode: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  image?: string | null;
  customTime?: string | null;
}

export interface TodayAttendanceState {
  employeeId?: number | null;
  isWorking: boolean;
  status: string;
  totalWorkedSeconds: number;
  approvedSeconds: number;
  remainingSeconds: number;
  shiftTotalSeconds: number;
  shiftElapsedSeconds: number;
  shiftStart: string;
  shiftEnd: string;
  shiftName?: string | null;
  shiftCode?: string | null;
  lunchStart?: string | null;
  lunchEnd?: string | null;
  graceMinutes?: number | null;
  lunchDurationMinutes?: number | null;
  workMode: string;
  workLocationId?: number | null;
  workLocationName?: string | null;
  geofenceDistanceMeters?: number | null;
  punchIn?: string | null;
  punchOut?: string | null;
  punchInLatitude?: number | null;
  punchInLongitude?: number | null;
  punchInAddress?: string | null;
  punchOutLatitude?: number | null;
  punchOutLongitude?: number | null;
  punchOutAddress?: string | null;
  punchInImage?: string | null;
  punchOutImage?: string | null;
  yesterdayAutoCheckedOut?: boolean;
  flags?: string[];
  requiresRegularization?: boolean;
  overtimeApproved?: boolean;
  overtimeExtended?: boolean;
  maxOvertimeMinutes?: number;
  overtimeAllowed?: boolean;
  overtimeStartTime?: string | null;
  attendanceStatus?: string;
  badgeColor?: string;
}

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  department: string;
  date: string;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  taskDescription?: string | null;
  punchIn?: string | null;
  punchOut?: string | null;
  status: string;
  workMode: string;
  workLocationName?: string | null;
  totalWorkingMinutes: number;
  overtimeMinutes: number;
  breakMinutes: number;
  grandTotalMinutes: number;
  lateMinutes: number;
  earlyExitMinutes: number;
  punchInImage?: string | null;
  punchOutImage?: string | null;
  punchInAddress?: string | null;
  punchOutAddress?: string | null;
  punchInLatitude?: number | null;
  punchInLongitude?: number | null;
  punchOutLatitude?: number | null;
  punchOutLongitude?: number | null;
}

export interface AttendanceMetrics {
  present: number;
  working: number;
  absent: number;
  notMarked: number;
}

export interface AttendanceListResponse {
  data: AttendanceRecord[];
  total: number;
  metrics: AttendanceMetrics;
}

export interface EmployeeLocationResponse {
  employeeId?: number;
  employee_id?: number;
  employeeName?: string;
  employee_name?: string;
  employeeCode?: string;
  employee_code?: string;
  designation?: string;
  department?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  punchInTime?: string;
  punch_in_time?: string;
  punchIn?: string;
  punchOutTime?: string;
  punch_out_time?: string;
  punchOut?: string;
  workMode?: string;
  work_mode?: string;
  status?: string;
  address?: string;
}

export interface EmployeeAnalytics {
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  department: string;
  today: {
    punchIn?: string | null;
    punchOut?: string | null;
    status: string;
    workingHours: string;
  };
  monthly: {
    presentDays: number;
    absentDays: number;
    halfDays: number;
    lateCount: number;
    totalWorkingHours: string;
    totalOvertime: string;
    attendancePercentage: number;
  };
}
