import { useCallback, useEffect, useState } from 'react';
import { addComment, getIssue, upvote } from '../api.js';
import { CATEGORY_MAP, formatDate, timeAgo } from '../constants.js';
import StatusBadge from './StatusBadge.jsx';
import ProgressSteps from './ProgressSteps.jsx';

export default function IssueModal({ id, onClose, onChanged, notify, user }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const load = useCallback(() => {
    getIssue(id)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const issue = data?.issue;
  const closed = issue && (issue.status === 'RESOLVED' || issue.status === 'REJECTED');
  const cat = issue && CATEGORY_MAP[issue.category];

  const onUpvote = async () => {
    try {
      await upvote(id);
      notify('Thanks for backing this issue 👍');
      load();
      onChanged();
    } catch (e) {
      notify(`Error: ${e.message}`);
    }
  };

  const onComment = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await addComment(id, { author: author.trim(), text: text.trim() });
      setText('');
      notify('Comment posted');
      load();
    } catch (err) {
      notify(`Error: ${err.message}`);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {error && <div className="form-error">{error}</div>}
        {!issue && !error && <div className="skeleton">Loading…</div>}

        {issue && (
          <div className="detail">
            <div className="issue-top">
              <span className="cat-chip">
                {cat.icon} {cat.label}
              </span>
              <StatusBadge status={issue.status} />
            </div>

            <h2>{issue.title}</h2>
            <p className="detail-desc">{issue.description || 'No description provided.'}</p>

            <dl className="details">
              <div>
                <dt>📍 Location</dt>
                <dd>{issue.location}</dd>
              </div>
              <div>
                <dt>🏘️ Ward</dt>
                <dd>{issue.ward}</dd>
              </div>
              <div>
                <dt>👤 Reported by</dt>
                <dd>{issue.reporterName}</dd>
              </div>
              <div>
                <dt>🗓️ Reported on</dt>
                <dd>{formatDate(issue.createdAt)}</dd>
              </div>
              <div>
                <dt>⚡ Priority</dt>
                <dd className={`prio prio-${issue.priority.toLowerCase()}`}>{issue.priority}</dd>
              </div>
            </dl>

            <ProgressSteps status={issue.status} />

            {user.role === 'RESIDENT' ? (
              <button className="btn btn-accent btn-block" disabled={closed} onClick={onUpvote}>
                👍 Back this issue · {issue.upvotes}
              </button>
            ) : (
              <p className="muted small">👍 {issue.upvotes} residents support this issue.</p>
            )}

            <h3 className="sec-title">Timeline</h3>
            <ol className="timeline">
              {data.timeline.map((t) => (
                <li key={t.id} className={`tl ${t.kind === 'STATUS' ? 'tl-status' : ''}`}>
                  <div className="tl-dot" />
                  <div className="tl-body">
                    <div className="tl-head">
                      <strong>{t.author}</strong>
                      <span className="muted small">{timeAgo(t.createdAt)}</span>
                    </div>
                    <p>{t.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            {user.role === 'RESIDENT' ? (
              <form className="comment-form" onSubmit={onComment}>
                <input
                  required
                  maxLength={80}
                  placeholder="Your name"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
                <textarea
                  required
                  maxLength={500}
                  rows={2}
                  placeholder="Add an update or more details…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button className="btn btn-primary" disabled={posting}>
                  {posting ? 'Posting…' : 'Post comment'}
                </button>
              </form>
            ) : (
              <p className="muted small">Use an issue status update to leave a public resolver note.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
