export interface PersonalDetails {
  firstName: string;
  lastName: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  maritalStatus?: string | null;
  bloodGroup?: string | null;
}

export interface ContactDetails {
  officialEmail: string;
  personalEmail?: string | null;
  mobileNumber: string;
  alternateMobile?: string | null;
  location?: string | null;
}

export interface EmployeeProfile {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  initials: string;
  role: string;
  department: string;
  shift: string;
  status: string;
  personalDetails: PersonalDetails;
  contactDetails: ContactDetails;
  profileImage?: string | null;
}

export interface ProfileUpdatePayload {
  personalDetails?: Partial<PersonalDetails>;
  contactDetails?: Partial<ContactDetails>;
  profileImage?: string | null;
}
