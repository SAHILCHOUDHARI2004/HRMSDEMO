export interface Employee {
  id: number;
  user_id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  gender?: string | null;
  dob?: string | null;
  marital_status?: string | null;
  blood_group?: string | null;
  department?: string | null;
  designation?: string | null;
  employee_type?: string | null;
  work_location?: string | null;
  shift_type?: string | null;
  shift_id?: number | null;
  doj?: string | null;
  official_email: string;
  personal_email?: string | null;
  mobile: string;
  alternate_mobile?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_number?: string | null;
  reporting_manager_id?: number | null;
  reporting_manager_name?: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
}

export interface EmployeeCreatePayload {
  first_name: string;
  last_name: string;
  gender?: string;
  dob?: string;
  marital_status?: string;
  blood_group?: string;
  department?: string;
  designation?: string;
  employee_type?: string;
  work_location?: string;
  shift_type?: string;
  shift_id?: number;
  doj?: string;
  official_email: string;
  personal_email?: string;
  mobile: string;
  alternate_mobile?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  reporting_manager_id?: number | null;
  status?: string;
}

export interface EmployeeUpdatePayload extends Partial<EmployeeCreatePayload> {}

export interface EmployeeListResponse {
  data: Employee[];
  total: int_or_number;
}

type int_or_number = number;

export interface EmployeeCredentials {
  employee_id: number;
  employee_code: string;
  employee_name: string;
  username: string;
  email: string;
  activation_required: boolean;
  temporary_password_hint: string;
  status: string;
}

export interface HrUserCreatePayload {
  full_name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
}

export interface HrUserResponse {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  status: string;
  created_at: string;
}

export interface HrListResponse {
  data: HrUserResponse[];
  total: number;
}

export type HrUserListResponse = HrListResponse;
