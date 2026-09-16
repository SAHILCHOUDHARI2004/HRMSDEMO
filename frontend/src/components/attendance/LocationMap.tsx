import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EmployeeLocationResponse } from '../../types/attendance.types';
import { formatTime } from '../../utils/date';
import { Badge } from '../common/Badge';

// Fix Leaflet's default icon issue with bundlers
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface LocationMapProps {
  locations: EmployeeLocationResponse[];
  center?: [number, number];
  zoom?: number;
  officeCenter?: [number, number];
  geofenceRadius?: number;
  height?: string;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  locations,
  center = [18.5204, 73.8567], // Default Pune / India coordinates or office coordinates
  zoom = 13,
  officeCenter,
  geofenceRadius = 50,
  height = '500px',
}) => {
  // If there are employee locations, pick the first valid one as center if default
  const validLocations = locations.filter((loc) => loc.latitude && loc.longitude);
  const mapCenter = officeCenter || (validLocations.length > 0 ? [validLocations[0].latitude!, validLocations[0].longitude!] : center);

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0" style={{ height }}>
      <MapContainer
        center={mapCenter as [number, number]}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Office Geofence Circle if specified */}
        {officeCenter && (
          <Circle
            center={officeCenter}
            radius={geofenceRadius}
            pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.2 }}
          />
        )}

        {/* Employee Markers */}
        {validLocations.map((loc) => (
          <Marker
            key={loc.employeeId || Math.random()}
            position={[loc.latitude!, loc.longitude!]}
          >
            <Popup className="custom-popup">
              <div className="p-1 max-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {loc.employeeName?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-800 leading-tight">{loc.employeeName}</h4>
                    <p className="text-[10px] text-slate-500">{loc.employeeCode || loc.employee_code || loc.designation} &bull; {loc.department}</p>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 border-t pt-1.5">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge size="sm" status={loc.status}>{loc.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Work Mode:</span>
                    <span className="font-medium text-slate-800">{loc.workMode || loc.work_mode}</span>
                  </div>
                  {(loc.punchIn || loc.punchInTime || loc.punch_in_time) && (
                    <div className="flex justify-between">
                      <span>Punch In:</span>
                      <span className="font-medium text-slate-800">{formatTime(loc.punchIn || loc.punchInTime || loc.punch_in_time)}</span>
                    </div>
                  )}
                  {(loc.address || loc.city || loc.state) && (
                    <p className="text-[10px] text-slate-400 mt-1 italic line-clamp-2">
                      {loc.address || `${loc.city || ''} ${loc.state || ''}`.trim()}
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
