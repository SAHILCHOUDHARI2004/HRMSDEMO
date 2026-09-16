import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Key,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Send,
  MoreVertical,
  Mail,
  Phone,
  Building,
} from 'lucide-react';
import { employeeService } from '../../services/api/employee.service';
import { masterDataService } from '../../services/api/masterData.service';
import { Employee, EmployeeCreatePayload, EmployeeCredentials } from '../../types/employee.types';
import { Department, Designation, Shift } from '../../types/masterData.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils/date';
import { getInitials } from '../../utils/formatters';

export const AdminEmployeesPage: React.FC = () => {
  const { success, error, info } = useToast();

  // State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Master data state for form dropdowns
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [credentials, setCredentials] = useState<EmployeeCredentials | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Form State
  const initialForm: EmployeeCreatePayload = {
    first_name: '',
    last_name: '',
    official_email: '',
    personal_email: '',
    mobile: '',
    department: '',
    designation: '',
    shift_type: 'Regular',
    work_location: 'Headquarters',
    employee_type: 'Full-Time',
    gender: 'Male',
    doj: new Date().toISOString().split('T')[0],
    status: 'Active',
  };
  const [formData, setFormData] = useState<EmployeeCreatePayload>(initialForm);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [empRes, deptRes, desigRes, shiftRes] = await Promise.all([
        employeeService.list({
          page,
          limit: pageSize,
          search,
          department: departmentFilter,
          status: statusFilter,
        }),
        masterDataService.getDepartments().catch(() => []),
        masterDataService.getDesignations().catch(() => []),
        masterDataService.getShifts().catch(() => []),
      ]);

      setEmployees(empRes.data || []);
      setTotalCount(empRes.total || 0);
      setDepartments(deptRes);
      setDesignations(desigRes);
      setShifts(shiftRes);
    } catch (err: any) {
      error('Failed to load employees', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, departmentFilter, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setFormData({
      ...initialForm,
      department: departments[0]?.name || 'Engineering',
      designation: designations[0]?.name || 'Software Engineer',
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsActionLoading(true);
      await employeeService.create(formData);
      success('Employee Created', `${formData.first_name} ${formData.last_name} has been enrolled.`);
      setIsCreateModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Creation Failed', err.response?.data?.detail || 'Could not create employee.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setFormData({
      first_name: emp.first_name,
      last_name: emp.last_name,
      official_email: emp.official_email,
      personal_email: emp.personal_email || '',
      mobile: emp.mobile,
      department: emp.department || '',
      designation: emp.designation || '',
      shift_type: emp.shift_type || 'Regular',
      work_location: emp.work_location || 'Headquarters',
      employee_type: emp.employee_type || 'Full-Time',
      gender: emp.gender || 'Male',
      doj: emp.doj || '',
      status: emp.status,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    try {
      setIsActionLoading(true);
      await employeeService.update(selectedEmployee.id, formData);
      success('Employee Updated', 'Information successfully saved.');
      setIsEditModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Update Failed', err.response?.data?.detail || 'Could not update employee.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleViewCredentials = async (emp: Employee) => {
    try {
      setSelectedEmployee(emp);
      const creds = await employeeService.getCredentials(emp.id);
      setCredentials(creds);
      setIsCredsModalOpen(true);
    } catch (err: any) {
      error('Credentials Error', 'Could not retrieve employee account credentials.');
    }
  };

  const handleRegeneratePassword = async () => {
    if (!selectedEmployee) return;
    try {
      setIsActionLoading(true);
      const res = await employeeService.regeneratePassword(selectedEmployee.id);
      success('Password Regenerated', res.message || 'New temporary password generated.');
      const creds = await employeeService.getCredentials(selectedEmployee.id);
      setCredentials(creds);
    } catch (err: any) {
      error('Action Failed', 'Could not regenerate password.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResendInvitation = async () => {
    if (!selectedEmployee) return;
    try {
      setIsActionLoading(true);
      await employeeService.resendInvitation(selectedEmployee.id);
      success('Invitation Dispatched', 'Activation email resent to employee.');
    } catch (err: any) {
      error('Action Failed', 'Could not resend activation invitation.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    const newStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await employeeService.updateStatus(emp.id, newStatus);
      success('Status Changed', `${emp.first_name} is now marked as ${newStatus}.`);
      loadData();
    } catch (err: any) {
      error('Status Update Failed', err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEmployee) return;
    try {
      setIsActionLoading(true);
      await employeeService.delete(selectedEmployee.id);
      success('Employee Removed', `${selectedEmployee.first_name} has been removed.`);
      setIsDeleteOpen(false);
      loadData();
    } catch (err: any) {
      error('Delete Failed', err.response?.data?.detail || 'Could not delete employee record.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage organization members, onboard new personnel, and configure account access.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Add Employee
        </Button>
      </div>

      {/* Filter Bar */}
      <Card noPadding className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search by name, email, or code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />

          <Select
            options={[
              { label: 'All Departments', value: '' },
              ...departments.map((d) => ({ label: d.name, value: d.name })),
            ]}
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setPage(1);
            }}
          />

          <Select
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />

          <Button
            variant="secondary"
            onClick={() => {
              setSearch('');
              setDepartmentFilter('');
              setStatusFilter('');
              setPage(1);
            }}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Reset Filters
          </Button>
        </div>
      </Card>

      {/* Employees Table */}
      <Card noPadding>
        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner text="Fetching employee records..." />
          </div>
        ) : employees.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No employees found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department & Role</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Shift & Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {getInitials(`${emp.first_name} ${emp.last_name}`)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {emp.first_name} {emp.last_name}
                          </span>
                          <span className="text-[11px] font-mono text-blue-600 font-medium">
                            {emp.employee_code}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{emp.designation || 'Staff'}</span>
                      <span className="text-xs text-slate-500">{emp.department || 'General'}</span>
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{emp.official_email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{emp.mobile}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="block font-medium text-slate-800">{emp.shift_type || 'Regular'}</span>
                      <span className="text-xs text-slate-500">{emp.work_location || 'Office'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={emp.status}>{emp.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewCredentials(emp)}
                          title="View Login Credentials"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          title="Edit Details"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          title={emp.status === 'Active' ? 'Deactivate' : 'Activate'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            emp.status === 'Active'
                              ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {emp.status === 'Active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setIsDeleteOpen(true);
                          }}
                          title="Delete Employee"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
          totalItems={totalCount}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </Card>

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
        }}
        maxWidth="2xl"
        title={isCreateModalOpen ? 'Onboard New Employee' : `Edit Employee - ${selectedEmployee?.employee_code}`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={isCreateModalOpen ? handleCreateSubmit : handleEditSubmit}
              isLoading={isActionLoading}
            >
              {isCreateModalOpen ? 'Create Account' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            required
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          />
          <Input
            label="Last Name"
            required
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          />

          <Input
            label="Official Work Email"
            type="email"
            required
            value={formData.official_email}
            onChange={(e) => setFormData({ ...formData, official_email: e.target.value })}
          />
          <Input
            label="Personal Email"
            type="email"
            value={formData.personal_email}
            onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
          />

          <Input
            label="Mobile Number"
            required
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
          />
          <Select
            label="Gender"
            options={[
              { label: 'Male', value: 'Male' },
              { label: 'Female', value: 'Female' },
              { label: 'Other', value: 'Other' },
            ]}
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          />

          <Select
            label="Department"
            options={departments.map((d) => ({ label: d.name, value: d.name }))}
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
          <Select
            label="Designation"
            options={designations.map((d) => ({ label: d.name, value: d.name }))}
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
          />

          <Select
            label="Shift Schedule"
            options={shifts.map((s) => ({ label: s.name, value: s.name }))}
            value={formData.shift_type}
            onChange={(e) => setFormData({ ...formData, shift_type: e.target.value })}
          />
          <Input
            label="Date of Joining"
            type="date"
            value={formData.doj}
            onChange={(e) => setFormData({ ...formData, doj: e.target.value })}
          />
        </form>
      </Modal>

      {/* Credentials Modal */}
      <Modal
        isOpen={isCredsModalOpen}
        onClose={() => setIsCredsModalOpen(false)}
        maxWidth="md"
        title="Employee Access Credentials"
        footer={
          <Button variant="secondary" onClick={() => setIsCredsModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Employee:</span>
              <span className="font-bold text-slate-800">{credentials?.employee_name} ({credentials?.employee_code})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Username/Email:</span>
              <span className="font-bold text-slate-800">{credentials?.username || credentials?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Password / Hint:</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{credentials?.temporary_password_hint || '********'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Activation Status:</span>
              <Badge size="sm">{credentials?.activation_required ? 'Pending First Login' : 'Activated'}</Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegeneratePassword}
              isLoading={isActionLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="flex-1"
            >
              Regenerate Password
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResendInvitation}
              isLoading={isActionLoading}
              leftIcon={<Send className="w-3.5 h-3.5" />}
              className="flex-1"
            >
              Resend Invite
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Employee"
        message={`Are you sure you want to delete ${selectedEmployee?.first_name} ${selectedEmployee?.last_name}? This action cannot be undone.`}
        confirmText="Delete Record"
        isLoading={isActionLoading}
      />
    </div>
  );
};
