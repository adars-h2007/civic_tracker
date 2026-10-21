import { CATEGORIES } from '../constants.js';

const STATUS_OPTIONS = [
  { key: 'ALL', label: 'All' },
  { key: 'OPEN', label: 'Open' },
  { key: 'RESOLVED', label: 'Resolved' },
];

export default function Filters({ filters, setFilters }) {
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }));

  return (
    <section className="filters">
      <div className="cat-row" role="group" aria-label="Category">
        <button
          className={`cat-pill ${filters.category === 'ALL' ? 'active' : ''}`}
          onClick={() => set({ category: 'ALL' })}
        >
          All categories
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            className={`cat-pill ${filters.category === c.key ? 'active' : ''}`}
            onClick={() => set({ category: c.key })}
          >
            <span>{c.icon}</span> {c.label}
          </button>
        ))}
      </div>

      <div className="filter-row">
        <div className="search-box">
          <span className="search-icon">🔎</span>
          <input
            type="search"
            placeholder="Search by issue, street or ward…"
            value={filters.q}
            onChange={(e) => set({ q: e.target.value })}
          />
        </div>

        <div className="seg" role="group" aria-label="Status">
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.key}
              className={filters.status === o.key ? 'active' : ''}
              onClick={() => set({ status: o.key })}
            >
              {o.label}
            </button>
          ))}
        </div>

        <select className="select" value={filters.sort} onChange={(e) => set({ sort: e.target.value })}>
          <option value="top">Most supported</option>
          <option value="new">Newest first</option>
        </select>
      </div>
    </section>
  );
}
