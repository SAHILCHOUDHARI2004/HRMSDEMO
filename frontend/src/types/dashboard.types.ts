export interface DashboardCard {
  icon: string;
  label: string;
  value: string;
}

export interface DashboardRecentItem {
  primary: string;
  secondary: string;
  tertiary: string;
  status: string;
}

export interface DepartmentDistributionItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface MonthlyHiringItem {
  month: string;
  count: number;
}

export interface AttendanceOverviewPoint {
  date: string;
  percentage: number;
  present: number;
  total: number;
}

export interface RecentJoinerItem {
  id: number;
  name: string;
  designation: string;
  department: string;
  doj: string;
  avatar?: string | null;
  initials: string;
}

export interface BirthdayItem {
  id: number;
  name: string;
  designation: string;
  department: string;
  dob: string;
  avatar?: string | null;
  initials: string;
  isToday: boolean;
}

export interface PendingApprovalsSummary {
  leaveRequests: number;
  timeOffRequests: number;
  regularizationRequests: number;
  expenseClaims: number;
}

export interface AdminProfileInfo {
  name: string;
  code: string;
  role: string;
  department: string;
  shift: string;
  status: string;
}

export interface AdminDashboardData {
  cards: DashboardCard[];
  hrUsers: DashboardRecentItem[];
  employees: DashboardRecentItem[];
  totalEmployees?: number;
  employeeGrowthCount?: number;
  employeeGrowthRate?: number;
  attendanceRate?: number;
  attendanceGrowthRate?: number;
  pendingLeavesCount?: number;
  payrollStatus?: string;
  payrollPeriod?: string;
  headcountTrend?: number[];
  attendanceTrend?: number[];
  leaveTrend?: number[];
  payrollTrend?: number[];
  adminProfile?: AdminProfileInfo;
  attendanceOverview?: AttendanceOverviewPoint[];
  departmentDistribution?: DepartmentDistributionItem[];
  monthlyHiringTrend?: MonthlyHiringItem[];
  recentJoiners?: RecentJoinerItem[];
  todayBirthdays?: BirthdayItem[];
  pendingApprovals?: PendingApprovalsSummary;
  [key: string]: any;
}

export interface QuickStat {
  total: number;
  name: string;
}

export interface RecentTimeSheet {
  employee: string;
  employeeCode: string;
  date: string;
  punchIn: string;
  punchOut: string;
  breakTime: string;
  overtime: string;
  totalHours: string;
  status: string;
  punchInImage?: string | null;
  punchOutImage?: string | null;
}

export interface UpcomingEvent {
  name: string;
  note: string;
  role: string;
}

export interface WeeklyAttendanceTrendItem {
  date: string;
  present: number;
  absent: number;
  leave: number;
  wfh: number;
  total: number;
  percentage: number;
}

export interface HrDashboardData {
  totalEmployees: number;
  presentEmployees: number;
  checkedInEmployees: number;
  checkedOutEmployees: number;
  notMarkedEmployees: number;
  workModeBreakdown: number[];
  genderBreakdown: number[];
  quickStats: QuickStat[];
  recentTimeSheets: RecentTimeSheet[];
  upcomingEvents: UpcomingEvent[];
  weeklyAttendanceTrend: WeeklyAttendanceTrendItem[];
  cards?: DashboardCard[];
  todaySummary?: {
    presentCount?: number;
    workingNowCount?: number;
    leaveCount?: number;
    lateCount?: number;
  };
  pendingApprovals?: {
    leaveRequests?: number;
    regularizationRequests?: number;
  };
  recentTimeOff?: any[];
  recentRegularizations?: any[];
  [key: string]: any;
}
