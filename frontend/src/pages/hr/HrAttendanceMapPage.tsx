import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, RefreshCw, Users, Clock, Globe } from 'lucide-react';
import { attendanceService } from '../../services/api/attendance.service';
import { EmployeeLocationResponse } from '../../types/attendance.types';
import { LocationMap } from '../../components/attendance/LocationMap';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatTime } from '../../utils/date';
import { getInitials } from '../../utils/formatters';

export const HrAttendanceMapPage: React.FC = () => {
  const [locations, setLocations] = useState<EmployeeLocationResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedLocation, setSelectedLocation] = useState<EmployeeLocationResponse | null>(null);

  const loadLocations = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await attendanceService.getTodayLocations();
      setLocations(res || []);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const activeLocations = locations.filter((l) => l.latitude && l.longitude);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workforce Geolocation Radar</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time geospatial check-in tracking and office geofence boundary visualizer.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadLocations}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh GPS Radar
        </Button>
      </div>

      {/* Map & Live List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Leaflet Map */}
        <div className="lg:col-span-2">
          <Card noPadding className="p-1">
            {isLoading ? (
              <div className="h-[550px] flex items-center justify-center">
                <LoadingSpinner text="Acquiring satellite coordinate feeds..." />
              </div>
            ) : (
              <LocationMap
                locations={locations}
                height="550px"
                officeCenter={[18.5204, 73.8567]}
                geofenceRadius={60}
              />
            )}
          </Card>
        </div>

        {/* Right 1 Col: Checked-in list */}
        <Card header={`Active Check-ins (${activeLocations.length})`} className="lg:col-span-1 max-h-[570px] flex flex-col">
          <div className="overflow-y-auto divide-y divide-slate-100 pr-1 flex-1">
            {activeLocations.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No active GPS pings today</p>
              </div>
            ) : (
              activeLocations.map((loc) => (
                <div
                  key={loc.employeeId}
                  onClick={() => setSelectedLocation(loc)}
                  className={`p-3 rounded-xl transition-all cursor-pointer ${
                    selectedLocation?.employeeId === loc.employeeId
                      ? 'bg-blue-50/70 border border-blue-200'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        {getInitials(loc.employeeName)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{loc.employeeName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{loc.employeeCode} &bull; {loc.department}</span>
                      </div>
                    </div>
                    <Badge size="sm" status={loc.status}>{loc.status}</Badge>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Mode:</span>
                      <span className="font-semibold text-slate-800">{loc.workMode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Punched In:</span>
                      <span className="font-semibold text-slate-800">{formatTime(loc.punchIn)}</span>
                    </div>
                    {loc.address && (
                      <p className="text-[10px] text-slate-400 italic truncate mt-0.5">
                        {loc.address}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
