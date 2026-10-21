import { STATUS_MAP } from '../constants.js';

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status];
  return (
    <span className="status-pill" style={{ '--c': s.color }}>
      <span className="status-dot" />
      {s.label}
    </span>
  );
}
