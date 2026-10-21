import { CATEGORY_MAP, timeAgo } from '../constants.js';
import StatusBadge from './StatusBadge.jsx';
import ProgressSteps from './ProgressSteps.jsx';

export default function IssueCard({ issue, onOpen, onUpvote, canSupport }) {
  const cat = CATEGORY_MAP[issue.category];
  const closed = issue.status === 'RESOLVED' || issue.status === 'REJECTED';

  return (
    <article
      className={`issue-card ${closed ? 'closed' : ''}`}
      onClick={() => onOpen(issue.id)}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(issue.id)}
      tabIndex={0}
    >
      <div className="issue-top">
        <span className="cat-chip">
          {cat.icon} {cat.label}
        </span>
        <StatusBadge status={issue.status} />
      </div>

      <h3>{issue.title}</h3>
      <p className="issue-desc">{issue.description || 'No description provided.'}</p>

      <div className="issue-meta">
        <span>📍 {issue.location}</span>
        <span>🏘️ {issue.ward}</span>
      </div>

      <ProgressSteps status={issue.status} />

      <div className="issue-foot">
        <span className="muted small">
          {issue.reporterName} · {timeAgo(issue.createdAt)}
        </span>
        {canSupport ? (
          <button
            className="vote-btn"
            disabled={closed}
            title={closed ? 'This issue is closed' : 'Back this issue'}
            onClick={(e) => {
              e.stopPropagation();
              onUpvote(issue);
            }}
          >
            👍 {issue.upvotes}
          </button>
        ) : (
          <span className="muted small">👍 {issue.upvotes} supporters</span>
        )}
      </div>
    </article>
  );
}
