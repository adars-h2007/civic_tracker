export const CATEGORIES = [
  { key: 'ROADS', label: 'Roads & potholes', icon: '🛣️' },
  { key: 'WATER', label: 'Water supply', icon: '💧' },
  { key: 'LIGHTING', label: 'Street lights', icon: '💡' },
  { key: 'GARBAGE', label: 'Garbage', icon: '🗑️' },
  { key: 'DRAINAGE', label: 'Drainage', icon: '🌊' },
  { key: 'PARKS', label: 'Parks & trees', icon: '🌳' },
  { key: 'OTHER', label: 'Other', icon: '📌' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));

export const STATUSES = [
  { key: 'REPORTED', label: 'Reported', color: '#64748b' },
  { key: 'ACKNOWLEDGED', label: 'Acknowledged', color: '#2563eb' },
  { key: 'IN_PROGRESS', label: 'In progress', color: '#d97706' },
  { key: 'RESOLVED', label: 'Resolved', color: '#16a34a' },
  { key: 'REJECTED', label: 'Rejected', color: '#dc2626' },
];

export const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.key, s]));

/** Workflow order shown as the progress bar on cards. */
export const FLOW = ['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'];

export const OPEN_STATUSES = ['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS'];

/** Must match the rules in IssueService on the backend. */
export const NEXT_STATUS = {
  REPORTED: ['ACKNOWLEDGED', 'REJECTED'],
  ACKNOWLEDGED: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'ACKNOWLEDGED'],
  RESOLVED: [],
  REJECTED: [],
};

export const COLUMNS = STATUSES.map((s) => s.key);
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

// Server timestamps can carry nanoseconds, which some browsers can't parse.
// Keep the first 19 characters (yyyy-MM-ddTHH:mm:ss).
const parse = (iso) => new Date(String(iso).slice(0, 19));

export const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - parse(iso).getTime()) / 1000);
  if (Number.isNaN(diff)) return '';
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const formatDate = (iso) =>
  iso
    ? parse(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
