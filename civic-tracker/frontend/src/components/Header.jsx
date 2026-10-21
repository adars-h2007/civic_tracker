export default function Header({ view, setView, onReport, user, onLogout }) {
  const isSolver = user?.role === 'SOLVER';
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand">
          <span className="brand-mark">◉</span>
          <div>
            <div className="brand-name">CivicPulse</div>
            <div className="brand-sub">Report · Track · Resolve</div>
          </div>
        </div>

        <nav className="tabs-nav" aria-label="Main">
          <button className={view === 'explore' ? 'active' : ''} onClick={() => setView('explore')}>
            Public feed
          </button>
          {isSolver && (
            <button className={view === 'admin' ? 'active' : ''} onClick={() => setView('admin')}>
              Issue desk
            </button>
          )}
        </nav>

        <div className="header-actions">
          {user && (
            <div className="user-pill">
              {user.name || user.email?.split('@')[0] || 'Resident'} · {isSolver ? 'Issue solver' : 'Resident'}
            </div>
          )}
          {user && (
            <button className="btn btn-ghost btn-sm" onClick={onLogout}>
              Log out
            </button>
          )}
          {!isSolver && (
            <button className="btn btn-accent" onClick={onReport}>
              + Report issue
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
