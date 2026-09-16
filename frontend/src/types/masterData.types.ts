export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  is_active: boolean;
}

export interface DepartmentCreatePayload {
  name: string;
  code: string;
  description?: string | null;
  is_active?: boolean;
}

export interface Designation {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  is_active: boolean;
}

export interface DesignationCreatePayload {
  name: string;
  code: string;
  description?: string | null;
  is_active?: boolean;
}

export interface Shift {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  working_hours: number;
  required_work_minutes: number;
  grace_minutes: number;
  lunch_duration_minutes: number;
  lunch_start_time?: string | null;
  lunch_end_time?: string | null;
  half_day_hours: number;
  minimum_half_day_minutes: number;
  present_hours: number;
  minimum_present_minutes: number;
  overtime_start_time?: string | null;
  overtime_allowed: boolean;
  max_overtime_minutes: number;
  late_mark_after_minutes: number;
  early_exit_before_minutes: number;
  is_night_shift: boolean;
  timezone: string;
  is_active: boolean;
}

export interface ShiftCreatePayload {
  name: string;
  code: string;
  description?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  working_hours?: number;
  required_work_minutes?: number;
  grace_minutes?: number;
  lunch_duration_minutes?: number;
  lunch_start_time?: string | null;
  lunch_end_time?: string | null;
  half_day_hours?: number;
  minimum_half_day_minutes?: number;
  present_hours?: number;
  minimum_present_minutes?: number;
  overtime_start_time?: string | null;
  overtime_allowed?: boolean;
  max_overtime_minutes?: number;
  late_mark_after_minutes?: number;
  early_exit_before_minutes?: number;
  is_night_shift?: boolean;
  timezone?: string;
  is_active?: boolean;
}

export interface WorkLocation {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  location_type: string;
  latitude?: number | null;
  longitude?: number | null;
  geofence_radius_meters: number;
  is_active: boolean;
}

export interface WorkLocationCreatePayload {
  name: string;
  code: string;
  description?: string | null;
  location_type?: string;
  latitude?: number | null;
  longitude?: number | null;
  geofence_radius_meters?: number;
  is_active?: boolean;
}

export interface LeaveType {
  id: number;
  name: string;
  code: string;
  unit_type: string;
  default_balance_hours: number;
  requires_approval: boolean;
  is_active: boolean;
}

export interface Holiday {
  id: number;
  name: string;
  code: string;
  holiday_date: string;
  description?: string | null;
  is_optional: boolean;
  is_active: boolean;
}

export interface MasterDataBootstrap {
  departments: Department[];
  designations: Designation[];
  shifts: Shift[];
  workLocations: WorkLocation[];
  leaveTypes: LeaveType[];
  holidays: Holiday[];
}
