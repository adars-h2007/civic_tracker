import { useCallback, useEffect, useRef, useState } from 'react';
import { getCurrentUser, getStats, listIssues, login, logout, register, upvote } from './api.js';
import Header from './components/Header.jsx';
import StatsHero from './components/StatsHero.jsx';
import Filters from './components/Filters.jsx';
import IssueCard from './components/IssueCard.jsx';
import IssueModal from './components/IssueModal.jsx';
import ReportModal from './components/ReportModal.jsx';
import AdminBoard from './components/AdminBoard.jsx';
import AuthPage from './components/AuthPage.jsx';
import { OPEN_STATUSES } from './constants.js';

const DEFAULT_FILTERS = { category: 'ALL', q: '', sort: 'top', status: 'ALL' };

export default function App() {
  const [user, setUser] = useState(undefined);
  const [view, setView] = useState('explore');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [reporting, setReporting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  const notify = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useEffect(() => {
    getCurrentUser()
      .then((account) => {
        setUser(account);
        if (account.role === 'SOLVER') setView('admin');
      })
      .catch(() => setUser(null));
  }, []);

  const reload = useCallback(() => setRefreshKey((k) => k + 1), []);

  // The public feed uses the filters; the council desk always shows every issue.
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const params =
      view === 'admin'
        ? {}
        : { category: filters.category, q: filters.q.trim(), sort: filters.sort };
    const t = setTimeout(() => {
      listIssues(params)
        .then((data) => {
          setIssues(data);
          setError('');
        })
        .catch(() => setError('Could not reach the server. Is the Spring Boot backend running on port 8080?'))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [user, view, filters.category, filters.q, filters.sort, refreshKey]);

  useEffect(() => {
    if (!user) return;
    getStats().then(setStats).catch(() => {});
  }, [user, refreshKey]);

  const visible = issues.filter((i) => {
    if (filters.status === 'ALL') return true;
    if (filters.status === 'OPEN') return OPEN_STATUSES.includes(i.status);
    return i.status === 'RESOLVED';
  });

  const onUpvote = async (issue) => {
    try {
      await upvote(issue.id);
      notify('Thanks for backing this issue 👍');
      reload();
    } catch (e) {
      notify(`Error: ${e.message}`);
    }
  };

  const handleAuth = async (mode, credentials) => {
    const nextUser = mode === 'register'
      ? await register(credentials)
      : await login(credentials);
    setUser(nextUser);
    setView(nextUser.role === 'SOLVER' ? 'admin' : 'explore');
    notify(`Welcome, ${nextUser.name || nextUser.email}!`);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setSelectedId(null);
    setReporting(false);
    notify('You have been logged out.');
  };

  const isSolver = user?.role === 'SOLVER';
  const activeView = isSolver ? view : 'explore';

  if (user === undefined) {
    return <div className="auth-shell"><div className="auth-card">Checking your session…</div></div>;
  }

  if (!user) {
    return <AuthPage onAuth={handleAuth} />;
  }

  return (
    <div className="app">
      <Header
        view={activeView}
        setView={setView}
        onReport={() => setReporting(true)}
        user={user}
        onLogout={() => handleLogout().catch((e) => notify(`Logout failed: ${e.message}`))}
      />

      <main className="container">
        {activeView === 'explore' ? (
          <>
            <StatsHero stats={stats} />
            <Filters filters={filters} setFilters={setFilters} />

            {error && <div className="banner-error">{error}</div>}

            {loading ? (
              <div className="skeleton">Loading issues…</div>
            ) : visible.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🏙️</div>
                <h3>No issues match these filters</h3>
                <p className="muted">Try another category, or be the first to report one.</p>
                <button className="btn btn-accent" onClick={() => setReporting(true)}>
                  Report an issue
                </button>
              </div>
            ) : (
              <div className="grid">
                {visible.map((i) => (
                  <IssueCard
                    key={i.id}
                    issue={i}
                    canSupport={user.role === 'RESIDENT'}
                    onOpen={setSelectedId}
                    onUpvote={onUpvote}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <section className="admin-head">
              <div>
                <span className="eyebrow">Issue resolution workspace</span>
                <h1>Issue desk</h1>
                <p className="muted">
                  Move issues through the workflow, set priority, and leave public updates
                  that residents see on the timeline.
                </p>
              </div>
            </section>

            {error && <div className="banner-error">{error}</div>}
            {loading ? (
              <div className="skeleton">Loading issues…</div>
            ) : (
              <AdminBoard
                issues={issues}
                onChanged={reload}
                notify={notify}
                onOpen={setSelectedId}
              />
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <div className="container">CivicPulse · Report · Track · Resolve</div>
      </footer>

      {selectedId && (
        <IssueModal
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={reload}
          notify={notify}
          user={user}
        />
      )}
      {reporting && (
        <ReportModal
          onClose={() => setReporting(false)}
          onCreated={() => {
            setReporting(false);
            notify('Thanks! Your report is now live 🎉');
            reload();
          }}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
