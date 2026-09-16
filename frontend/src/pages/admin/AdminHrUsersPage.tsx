import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck,
  UserPlus,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Building,
  ShieldCheck,
} from 'lucide-react';
import { hrService } from '../../services/api/hr.service';
import { HrUserResponse, HrUserCreatePayload } from '../../types/employee.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils/date';
import { getInitials } from '../../utils/formatters';

export const AdminHrUsersPage: React.FC = () => {
  const { success, error } = useToast();
  const [hrUsers, setHrUsers] = useState<HrUserResponse[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Add HR modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [formData, setFormData] = useState<HrUserCreatePayload>({
    full_name: '',
    email: '',
    phone: '',
    department: 'Human Resources',
    designation: 'HR Specialist',
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await hrService.list({
        page,
        limit: pageSize,
        search,
      });
      setHrUsers(res.data || []);
      setTotalCount(res.total || 0);
    } catch (err: any) {
      error('Failed to load HR users', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsActionLoading(true);
      await hrService.create(formData);
      success('HR Officer Enrolled', `${formData.full_name} has been added to HR.`);
      setIsCreateOpen(false);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        department: 'Human Resources',
        designation: 'HR Specialist',
      });
      loadData();
    } catch (err: any) {
      error('Creation Failed', err.response?.data?.detail || 'Could not enroll HR user.');
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">HR Personnel Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage HR administrators, staff managers, and their operational access rights.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Add HR Personnel
        </Button>
      </div>

      {/* Filter Bar */}
      <Card noPadding className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Input
            placeholder="Search HR by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
            className="flex-1"
          />
          <Button
            variant="secondary"
            onClick={() => {
              setSearch('');
              setPage(1);
            }}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Reset
          </Button>
        </div>
      </Card>

      {/* HR Users Table */}
      <Card noPadding>
        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner text="Fetching HR personnel..." />
          </div>
        ) : hrUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <UserCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No HR users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">HR Personnel</th>
                  <th className="py-3 px-4">Department & Role</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Enrolled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {hrUsers.map((hr) => (
                  <tr key={hr.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {getInitials(hr.full_name)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{hr.full_name}</span>
                          <span className="text-[11px] text-indigo-600 font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> HR Role
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{hr.designation || 'HR Officer'}</span>
                      <span className="text-xs text-slate-500">{hr.department || 'Human Resources'}</span>
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{hr.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{hr.phone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={hr.status}>{hr.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(hr.created_at)}
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
        />
      </Card>

      {/* Add HR Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        maxWidth="md"
        title="Add HR Personnel"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} isLoading={isActionLoading}>
              Enroll HR
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Full Name"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />
          <Input
            label="Official Work Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Phone Number"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
          <Input
            label="Designation"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
};
