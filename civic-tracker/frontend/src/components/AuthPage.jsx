import { useState } from 'react';

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'RESIDENT',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    if (mode === 'register' && !form.name.trim()) {
      setError('Please enter your full name to create an account.');
      return;
    }

    setSubmitting(true);
    try {
      await onAuth(mode, {
        ...(mode === 'register' ? { name: form.name.trim() } : {}),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError('');
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">CivicPulse</div>
        <h1 className="auth-title">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="auth-role-switch" role="tablist" aria-label="Choose account type">
            <button
              type="button"
              role="tab"
              aria-selected={form.role === 'RESIDENT'}
              className={form.role === 'RESIDENT' ? 'active' : ''}
              onClick={() => setForm((prev) => ({ ...prev, role: 'RESIDENT' }))}
            >
              Resident
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={form.role === 'SOLVER'}
              className={form.role === 'SOLVER' ? 'active' : ''}
              onClick={() => setForm((prev) => ({ ...prev, role: 'SOLVER' }))}
            >
              Issue solver
            </button>
          </div>

          {mode === 'register' && (
            <label>
              Full name
              <input
                type="text"
                name="name"
                autoComplete="name"
                maxLength={80}
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              name="email"
              autoComplete="email"
              maxLength={254}
              required
              value={form.email}
              onChange={handleChange}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={8}
              maxLength={72}
              required
              value={form.password}
              onChange={handleChange}
            />
            <span className="auth-hint">Use at least 8 characters.</span>
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting
              ? 'Please wait…'
              : mode === 'login'
                ? `Sign in as ${form.role === 'RESIDENT' ? 'resident' : 'issue solver'}`
                : 'Create an account'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? (
            <>
              New to CivicPulse?{' '}
              <button type="button" onClick={() => changeMode('register')}>Create an account</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => changeMode('login')}>Sign in</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
