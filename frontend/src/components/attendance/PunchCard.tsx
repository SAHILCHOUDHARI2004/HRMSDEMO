import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Play,
  Square,
  MapPin,
  Camera,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { TodayAttendanceState, PunchRequest } from '../../types/attendance.types';
import { attendanceService } from '../../services/api/attendance.service';
import { formatDuration, formatTime } from '../../utils/date';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { WebcamCaptureModal } from './WebcamCaptureModal';
import { useToast } from '../../contexts/ToastContext';
import confetti from 'canvas-confetti';

export interface PunchCardProps {
  onStateUpdate?: (state: TodayAttendanceState) => void;
}

export const PunchCard: React.FC<PunchCardProps> = ({ onStateUpdate }) => {
  const { success, error, info } = useToast();
  const [state, setState] = useState<TodayAttendanceState | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [workMode, setWorkMode] = useState<string>('Office');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isWebcamOpen, setIsWebcamOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<'punch' | 'punch-in' | 'punch-out'>('punch');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const fetchTodayState = useCallback(async () => {
    try {
      const data = await attendanceService.getMyTodayState();
      setState(data);
      setElapsedSeconds(data.totalWorkedSeconds || 0);
      if (data.workMode) setWorkMode(data.workMode);
      if (onStateUpdate) onStateUpdate(data);
    } catch {
      // Failed to load
    }
  }, [onStateUpdate]);

  useEffect(() => {
    fetchTodayState();
  }, [fetchTodayState]);

  // Live Clock & Elapsed Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (state?.isWorking) {
        setElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [state?.isWorking]);

  const handlePunchClick = (action: 'punch' | 'punch-in' | 'punch-out') => {
    setPendingAction(action);
    setIsWebcamOpen(true);
  };

  const handleWebcamCapture = async (photoDataUrl: string) => {
    setIsLoading(true);

    let latitude: number | null = null;
    let longitude: number | null = null;

    try {
      if (navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
          });
        });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      }
    } catch (geoErr) {
      info('Location Notice', 'Could not obtain GPS coordinate; proceeding with network location.');
    }

    const payload: PunchRequest = {
      workMode,
      latitude,
      longitude,
      image: photoDataUrl,
    };

    try {
      const updated = await attendanceService.punch(payload);
      setState(updated);
      setElapsedSeconds(updated.totalWorkedSeconds || 0);
      if (onStateUpdate) onStateUpdate(updated);

      if (updated.isWorking) {
        success('Punched In Successfully', `Started work at ${formatTime(updated.punchIn)}`);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } else {
        success('Punched Out Successfully', `Ended work at ${formatTime(updated.punchOut)}`);
      }
    } catch (err: any) {
      error('Punch Failed', err.response?.data?.detail || 'Could not record attendance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueWorking = async () => {
    try {
      setIsLoading(true);
      const updated = await attendanceService.continueWorking();
      setState(updated);
      setElapsedSeconds(updated.totalWorkedSeconds || 0);
      success('Shift Continued', 'Attendance timer resumed.');
    } catch (err: any) {
      error('Action Failed', err.response?.data?.detail || 'Failed to continue working');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtendOvertime = async () => {
    try {
      setIsLoading(true);
      const updated = await attendanceService.extendOvertime();
      setState(updated);
      success('Overtime Extended', 'Extended overtime approved for today.');
    } catch (err: any) {
      error('Action Failed', err.response?.data?.detail || 'Failed to extend overtime');
    } finally {
      setIsLoading(false);
    }
  };

  const isWorking = state?.isWorking || false;

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        {/* Background glow decoration */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Left: Clock & Time */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>
                {currentTime.toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-white">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <Badge
                variant="status"
                status={isWorking ? 'working' : state?.status || 'Not Marked'}
                className="text-xs uppercase"
              >
                {isWorking ? 'Working Now' : state?.status || 'Not Marked'}
              </Badge>
            </div>

            {/* Shift & Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-700/60 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Shift Timing</span>
                <span className="font-semibold text-slate-200">
                  {state?.shiftStart ? `${formatTime(state.shiftStart)} - ${formatTime(state.shiftEnd)}` : 'Standard (9am-6pm)'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Worked Today</span>
                <span className="font-semibold text-emerald-400 font-mono text-sm">
                  {formatDuration(elapsedSeconds)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Punch In</span>
                <span className="font-semibold text-slate-200">
                  {state?.punchIn ? formatTime(state.punchIn) : '--:--'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Punch Out</span>
                <span className="font-semibold text-slate-200">
                  {state?.punchOut ? formatTime(state.punchOut) : '--:--'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions & Punch Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-4">
            {/* Work Mode Toggle */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              {['Office', 'Remote', 'Hybrid'].map((mode) => (
                <button
                  key={mode}
                  disabled={isWorking}
                  onClick={() => setWorkMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    workMode === mode
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  } ${isWorking ? 'cursor-not-allowed opacity-75' : ''}`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Big Action Button */}
            <div className="flex items-center gap-3">
              {isWorking ? (
                <Button
                  size="lg"
                  variant="danger"
                  onClick={() => handlePunchClick('punch-out')}
                  isLoading={isLoading}
                  leftIcon={<Square className="w-5 h-5 fill-current" />}
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold shadow-rose-500/20"
                >
                  Punch Out
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => handlePunchClick('punch-in')}
                  isLoading={isLoading}
                  leftIcon={<Play className="w-5 h-5 fill-current" />}
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold shadow-blue-500/30"
                >
                  Punch In
                </Button>
              )}

              {state?.overtimeAllowed && !isWorking && state?.attendanceStatus === 'Present' && (
                <Button
                  size="md"
                  variant="outline"
                  onClick={handleExtendOvertime}
                  leftIcon={<Zap className="w-4 h-4 text-amber-400" />}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Extend Overtime
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Webcam Modal */}
      <WebcamCaptureModal
        isOpen={isWebcamOpen}
        onClose={() => setIsWebcamOpen(false)}
        onCapture={handleWebcamCapture}
        title={pendingAction === 'punch-out' ? 'Selfie for Punch Out' : 'Selfie for Punch In'}
      />
    </>
  );
};
