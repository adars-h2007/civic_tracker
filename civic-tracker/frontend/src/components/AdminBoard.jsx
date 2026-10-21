import { useState } from 'react';
import { changeStatus } from '../api.js';
import { CATEGORY_MAP, COLUMNS, NEXT_STATUS, PRIORITIES, STATUS_MAP } from '../constants.js';

export default function AdminBoard({ issues, onChanged, notify, onOpen }) {
  return (
    <section className="board">
      {COLUMNS.map((col) => {
        const items = issues.filter((i) => i.status === col);
        return (
          <div className="column" key={col}>
            <header className="col-head" style={{ '--c': STATUS_MAP[col].color }}>
              <span>{STATUS_MAP[col].label}</span>
              <span className="count">{items.length}</span>
            </header>
            <div className="col-body">
              {items.length === 0 && <div className="col-empty">Nothing here</div>}
              {items.map((i) => (
                <AdminCard
                  key={i.id}
                  issue={i}
                  onChanged={onChanged}
                  notify={notify}
                  onOpen={onOpen}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function AdminCard({ issue, onChanged, notify, onOpen }) {
  const [target, setTarget] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const cat = CATEGORY_MAP[issue.category];
  const options = NEXT_STATUS[issue.status] || [];

  const run = async (body, message) => {
    setBusy(true);
    try {
      await changeStatus(issue.id, body);
      notify(message);
      setTarget('');
      setNote('');
      onChanged();
    } catch (e) {
      notify(`Error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const move = () =>
    run(
      { status: target, note: note.trim() || null },
      `Moved to ${STATUS_MAP[target].label}`
    );

  return (
    <article className="admin-card">
      <div className="admin-top">
        <span className="cat-chip sm">
          {cat.icon} {cat.label}
        </span>
        <span className="up">👍 {issue.upvotes}</span>
      </div>

      <h4 className="link-title" onClick={() => onOpen(issue.id)}>
        {issue.title}
      </h4>
      <div className="muted small">
        📍 {issue.location} · {issue.ward}
      </div>

      <label className="mini-label">
        Priority
        <select
          value={issue.priority}
          disabled={busy}
          onChange={(e) => run({ priority: e.target.value }, `Priority set to ${e.target.value}`)}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>

      {options.length > 0 ? (
        <div className="move">
          <select value={target} onChange={(e) => setTarget(e.target.value)} disabled={busy}>
            <option value="">Move to…</option>
            {options.map((o) => (
              <option key={o} value={o}>
                {STATUS_MAP[o].label}
              </option>
            ))}
          </select>
          <input
            placeholder="Public note (optional)"
            maxLength={300}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" disabled={!target || busy} onClick={move}>
            Move
          </button>
        </div>
      ) : (
        <div className="muted small closed-note">Closed</div>
      )}
    </article>
  );
}
