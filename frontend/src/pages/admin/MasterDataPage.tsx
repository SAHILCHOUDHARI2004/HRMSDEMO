import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Building,
  Briefcase,
  Clock,
  MapPin,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { masterDataService } from '../../services/api/masterData.service';
import {
  Department,
  Designation,
  Shift,
  WorkLocation,
  LeaveType,
  Holiday,
} from '../../types/masterData.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils/date';

export const MasterDataPage: React.FC = () => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'departments' | 'designations' | 'shifts' | 'locations' | 'leaves' | 'holidays'>('departments');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // Data lists
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [locations, setLocations] = useState<WorkLocation[]>([]);
  const [leaves, setLeaves] = useState<LeaveType[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  // Modals & Selected Item
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Generic form state
  const [formData, setFormData] = useState<any>({});

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await masterDataService.getBootstrap();
      setDepartments(res.departments || []);
      setDesignations(res.designations || []);
      setShifts(res.shifts || []);
      setLocations(res.workLocations || []);
      setLeaves(res.leaveTypes || []);
      setHolidays(res.holidays || []);
    } catch (err: any) {
      error('Load Error', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedItem(null);
    if (activeTab === 'departments') {
      setFormData({ name: '', code: '', description: '', is_active: true });
    } else if (activeTab === 'designations') {
      setFormData({ name: '', code: '', description: '', is_active: true });
    } else if (activeTab === 'shifts') {
      setFormData({
        name: '',
        code: '',
        start_time: '09:00:00',
        end_time: '18:00:00',
        working_hours: 8,
        grace_minutes: 30,
        lunch_duration_minutes: 40,
        overtime_allowed: true,
        max_overtime_minutes: 120,
        is_active: true,
      });
    } else if (activeTab === 'locations') {
      setFormData({
        name: '',
        code: '',
        location_type: 'Office',
        latitude: 18.5204,
        longitude: 73.8567,
        geofence_radius_meters: 50,
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setModalMode('edit');
    setSelectedItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsActionLoading(true);
      if (activeTab === 'departments') {
        if (modalMode === 'create') {
          await masterDataService.createDepartment(formData);
          success('Department Created', formData.name);
        } else {
          await masterDataService.updateDepartment(selectedItem.id, formData);
          success('Department Updated', formData.name);
        }
      } else if (activeTab === 'designations') {
        if (modalMode === 'create') {
          await masterDataService.createDesignation(formData);
          success('Designation Created', formData.name);
        } else {
          await masterDataService.updateDesignation(selectedItem.id, formData);
          success('Designation Updated', formData.name);
        }
      } else if (activeTab === 'shifts') {
        if (modalMode === 'create') {
          await masterDataService.createShift(formData);
          success('Shift Schedule Created', formData.name);
        } else {
          await masterDataService.updateShift(selectedItem.id, formData);
          success('Shift Schedule Updated', formData.name);
        }
      } else if (activeTab === 'locations') {
        if (modalMode === 'create') {
          await masterDataService.createWorkLocation(formData);
          success('Work Location Created', formData.name);
        } else {
          await masterDataService.updateWorkLocation(selectedItem.id, formData);
          success('Work Location Updated', formData.name);
        }
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Operation Failed', err.response?.data?.detail || err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    try {
      setIsActionLoading(true);
      if (activeTab === 'departments') {
        await masterDataService.deleteDepartment(selectedItem.id);
      } else if (activeTab === 'designations') {
        await masterDataService.deleteDesignation(selectedItem.id);
      } else if (activeTab === 'shifts') {
        await masterDataService.deleteShift(selectedItem.id);
      } else if (activeTab === 'locations') {
        await masterDataService.deleteWorkLocation(selectedItem.id);
      }
      success('Record Removed', 'Master data item deleted successfully.');
      setIsDeleteOpen(false);
      loadData();
    } catch (err: any) {
      error('Delete Failed', err.response?.data?.detail || err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const tabs = [
    { id: 'departments', label: 'Departments', icon: Building, count: departments.length },
    { id: 'designations', label: 'Designations', icon: Briefcase, count: designations.length },
    { id: 'shifts', label: 'Shift Schedules', icon: Clock, count: shifts.length },
    { id: 'locations', label: 'Work Locations & Geofence', icon: MapPin, count: locations.length },
    { id: 'leaves', label: 'Leave Types', icon: Calendar, count: leaves.length },
    { id: 'holidays', label: 'Holiday Calendar', icon: Calendar, count: holidays.length },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Data Configuration</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure enterprise organizational units, shifts, locations, geofence rules, and calendars.
          </p>
        </div>

        {['departments', 'designations', 'shifts', 'locations'].includes(activeTab) && (
          <Button variant="primary" onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
            Add {activeTab.slice(0, -1)}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200/80 pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table Content */}
      <Card noPadding>
        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner text="Fetching master records..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'departments' && (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">Department Name</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departments.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                      <td className="py-3.5 px-4 font-mono text-blue-600">{item.code}</td>
                      <td className="py-3.5 px-4 text-slate-500">{item.description || '-'}</td>
                      <td className="py-3.5 px-4">
                        <Badge status={item.is_active ? 'Active' : 'Inactive'}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setSelectedItem(item); setIsDeleteOpen(true); }} className="p-1.5 text-slate-400 hover:text-rose-600 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'designations' && (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">Designation Title</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {designations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                      <td className="py-3.5 px-4 font-mono text-blue-600">{item.code}</td>
                      <td className="py-3.5 px-4 text-slate-500">{item.description || '-'}</td>
                      <td className="py-3.5 px-4">
                        <Badge status={item.is_active ? 'Active' : 'Inactive'}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setSelectedItem(item); setIsDeleteOpen(true); }} className="p-1.5 text-slate-400 hover:text-rose-600 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'shifts' && (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">Shift Name</th>
                    <th className="py-3 px-4">Timings</th>
                    <th className="py-3 px-4">Working Hours</th>
                    <th className="py-3 px-4">Grace & OT</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shifts.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{item.name}</span>
                        <span className="text-[11px] font-mono text-slate-400">{item.code}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {item.start_time} - {item.end_time}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{item.working_hours}h / day</td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        Grace: {item.grace_minutes}m &bull; OT: {item.overtime_allowed ? `${item.max_overtime_minutes}m` : 'Disabled'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={item.is_active ? 'Active' : 'Inactive'}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setSelectedItem(item); setIsDeleteOpen(true); }} className="p-1.5 text-slate-400 hover:text-rose-600 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'locations' && (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">Location Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Coordinates</th>
                    <th className="py-3 px-4">Geofence Radius</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {locations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{item.name}</span>
                        <span className="text-[11px] font-mono text-slate-400">{item.code}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{item.location_type}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        {item.latitude ? `${item.latitude.toFixed(4)}, ${item.longitude?.toFixed(4)}` : 'GPS Not Set'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-blue-600">{item.geofence_radius_meters} meters</td>
                      <td className="py-3.5 px-4">
                        <Badge status={item.is_active ? 'Active' : 'Inactive'}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setSelectedItem(item); setIsDeleteOpen(true); }} className="p-1.5 text-slate-400 hover:text-rose-600 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'leaves' && (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Unit Type</th>
                    <th className="py-3 px-4">Annual Quota</th>
                    <th className="py-3 px-4">Approval Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaves.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                      <td className="py-3.5 px-4 font-mono text-blue-600">{item.code}</td>
                      <td className="py-3.5 px-4 text-slate-700 capitalize">{item.unit_type.replace('_', ' ')}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{item.default_balance_hours / 8} Days ({item.default_balance_hours} hrs)</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="primary">{item.requires_approval ? 'Yes' : 'Auto Approved'}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'holidays' && (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">Holiday Name</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {holidays.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                      <td className="py-3.5 px-4 font-semibold text-blue-600">{formatDate(item.holiday_date)}</td>
                      <td className="py-3.5 px-4 text-slate-500">{item.description || '-'}</td>
                      <td className="py-3.5 px-4">
                        <Badge status={item.is_optional ? 'Optional' : 'Mandatory'}>
                          {item.is_optional ? 'Optional Holiday' : 'Public Holiday'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Card>

      {/* CRUD Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="lg"
        title={`${modalMode === 'create' ? 'Add' : 'Edit'} ${activeTab.slice(0, -1)}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleFormSubmit} isLoading={isActionLoading}>
              Save
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Name / Title"
            required
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Unique Code"
            required
            value={formData.code || ''}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />

          {(activeTab === 'departments' || activeTab === 'designations') && (
            <Input
              label="Description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          )}

          {activeTab === 'shifts' && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start Time"
                type="time"
                value={formData.start_time || ''}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
              <Input
                label="End Time"
                type="time"
                value={formData.end_time || ''}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
              <Input
                label="Working Hours"
                type="number"
                value={formData.working_hours || 8}
                onChange={(e) => setFormData({ ...formData, working_hours: Number(e.target.value) })}
              />
              <Input
                label="Grace Minutes"
                type="number"
                value={formData.grace_minutes || 30}
                onChange={(e) => setFormData({ ...formData, grace_minutes: Number(e.target.value) })}
              />
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Latitude"
                type="number"
                step="0.0001"
                value={formData.latitude || ''}
                onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
              />
              <Input
                label="Longitude"
                type="number"
                step="0.0001"
                value={formData.longitude || ''}
                onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
              />
              <div className="col-span-2">
                <Input
                  label="Geofence Radius (meters)"
                  type="number"
                  value={formData.geofence_radius_meters || 50}
                  onChange={(e) => setFormData({ ...formData, geofence_radius_meters: Number(e.target.value) })}
                />
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Record"
        message={`Are you sure you want to delete ${selectedItem?.name}?`}
        isLoading={isActionLoading}
      />
    </div>
  );
};
