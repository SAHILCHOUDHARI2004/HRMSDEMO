export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getInitials(name?: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function getStatusBadgeClass(status?: string): string {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'active':
    case 'present':
    case 'approved':
    case 'published':
    case 'completed':
    case 'verified':
    case 'passed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';
    case 'pending':
    case 'pending_review':
    case 'draft':
    case 'in_progress':
    case 'working':
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20';
    case 'absent':
    case 'rejected':
    case 'failed':
    case 'archived':
    case 'inactive':
    case 'resubmission_required':
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20';
    case 'half_day':
    case 'half-day':
    case 'leave':
      return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/20';
  }
}
