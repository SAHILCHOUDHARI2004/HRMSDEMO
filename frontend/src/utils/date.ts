import { format, parseISO, isValid } from 'date-fns';

export function formatDate(dateString?: string | null, formatStr = 'MMM dd, yyyy'): string {
  if (!dateString) return '-';
  try {
    const d = parseISO(dateString);
    if (!isValid(d)) return dateString;
    return format(d, formatStr);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string | null, formatStr = 'MMM dd, yyyy hh:mm a'): string {
  if (!dateString) return '-';
  try {
    const d = parseISO(dateString);
    if (!isValid(d)) return dateString;
    return format(d, formatStr);
  } catch {
    return dateString;
  }
}

export function formatTime(timeStr?: string | null): string {
  if (!timeStr) return '-';
  if (timeStr.includes('T')) {
    return formatDateTime(timeStr, 'hh:mm a');
  }
  // Try hh:mm:ss
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }
  return timeStr;
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '00:00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatMinutes(minutes: number): string {
  if (!minutes || minutes <= 0) return '0h 0m';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
}
