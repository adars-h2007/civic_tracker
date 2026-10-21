export default function StatsHero({ stats }) {
  const s = stats || {};
  const cards = [
    { label: 'Total reports', value: s.total, icon: '📝', color: '#6366f1' },
    { label: 'Open now', value: s.open, icon: '🛠️', color: '#d97706' },
    { label: 'Resolved', value: s.resolved, icon: '✅', color: '#16a34a' },
    {
      label: 'Resolution rate',
      value: s.resolutionRate != null ? `${s.resolutionRate}%` : undefined,
      icon: '📈',
      color: '#0ea5e9',
    },
  ];

  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow light">Better neighbourhoods, together</span>
        <h1>
          See it. Report it. <span className="grad">Track it to fixed.</span>
        </h1>
        <p>
          Potholes, dead street lights, blocked drains. Report one in a minute and follow every
          step until the council closes it.
        </p>
      </div>

      <div className="hero-stats">
        {cards.map((c) => (
          <div className="stat-card" key={c.label} style={{ '--c': c.color }}>
            <div className="stat-icon">{c.icon}</div>
            <div>
              <div className="stat-number">{c.value ?? '–'}</div>
              <div className="stat-caption">{c.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
