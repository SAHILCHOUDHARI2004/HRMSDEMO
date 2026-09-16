import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Globe,
  Monitor,
  Smartphone,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { loginActivityService } from '../../services/api/loginActivity.service';
import { LoginActivity } from '../../types/loginActivity.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { formatDateTime } from '../../utils/date';

export const AdminLoginActivityPage: React.FC = () => {
  const { error } = useToast();
  const [activities, setActivities] = useState<LoginActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await loginActivityService.getLoginHistory({
        filter_type: filterType || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setActivities(res || []);
    } catch (err: any) {
      error('Failed to load login activity', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filterType, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security & Login Activity Logs</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time audit trail of authentication sessions, client devices, IP geolocation, and intrusion anomalies.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card noPadding className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select
            label="Filter Period"
            options={[
              { label: 'All History', value: '' },
              { label: 'Today', value: 'today' },
              { label: 'Last 7 Days', value: 'week' },
              { label: 'Last 30 Days', value: 'month' },
            ]}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          />

          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setFilterType('');
                setStartDate('');
                setEndDate('');
              }}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="w-full"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Activity Table */}
      <Card noPadding>
        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner text="Fetching security audit logs..." />
          </div>
        ) : activities.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Activity className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No login records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">IP Address & Location</th>
                  <th className="py-3 px-4">Device & OS</th>
                  <th className="py-3 px-4">Browser</th>
                  <th className="py-3 px-4">Auth Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activities.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">
                        {item.user_display_name || item.employee_name || `User #${item.user_id}`}
                      </span>
                      {item.employee_code && (
                        <span className="text-[11px] font-mono text-blue-600">{item.employee_code}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {formatDateTime(item.login_time || item.created_at)}
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-slate-800 font-medium">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.ip_address || '127.0.0.1'}</span>
                      </div>
                      {item.location && (
                        <span className="text-[11px] text-slate-400 block">{item.location}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">{item.device || 'Desktop PC'}</span>
                      <span className="text-xs text-slate-400">{item.operating_system || 'Windows'}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {item.browser || 'Chrome'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={item.status === 'Success' ? 'Active' : 'Rejected'}>
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
