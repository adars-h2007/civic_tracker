import { useEffect, useState } from 'react';
import { createIssue } from '../api.js';
import { CATEGORIES } from '../constants.js';

const EMPTY = {
  title: '',
  category: 'ROADS',
  location: '',
  ward: '',
  description: '',
  reporterName: '',
};

export default function ReportModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await createIssue({
        ...form,
        title: form.title.trim(),
        location: form.location.trim(),
        ward: form.ward.trim(),
        reporterName: form.reporterName.trim(),
        description: form.description.trim() || null,
      });
      onCreated();
    } catch (err) {
      setError(err.message || 'Could not submit the report.');
      setBusy(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <form
        className="modal modal-wide"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <span className="eyebrow">New report</span>
        <h2>What needs fixing?</h2>
        <p className="muted">Be specific about the place so the right team can find it fast.</p>

        <div className="field">
          <span>Category</span>
          <div className="cat-picker">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.key}
                className={`cat-opt ${form.category === c.key ? 'active' : ''}`}
                onClick={() => setForm((f) => ({ ...f, category: c.key }))}
              >
                <span className="cat-opt-icon">{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span>Short title *</span>
          <input
            required
            maxLength={120}
            value={form.title}
            onChange={set('title')}
            placeholder="e.g. Pothole near the school gate"
          />
        </label>

        <div className="row">
          <label className="field">
            <span>Location / street *</span>
            <input required maxLength={160} value={form.location} onChange={set('location')} />
          </label>
          <label className="field">
            <span>Ward *</span>
            <input required maxLength={80} value={form.ward} onChange={set('ward')} placeholder="e.g. Ward 4" />
          </label>
        </div>

        <label className="field">
          <span>Details</span>
          <textarea
            rows={3}
            maxLength={1000}
            value={form.description}
            onChange={set('description')}
            placeholder="Size, how long it's been there, any risk to people…"
          />
        </label>

        <label className="field">
          <span>Your name *</span>
          <input required maxLength={80} value={form.reporterName} onChange={set('reporterName')} />
        </label>

        {error && <div className="form-error">{error}</div>}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Submitting…' : 'Submit report'}
          </button>
        </div>
      </form>
    </div>
  );
}
