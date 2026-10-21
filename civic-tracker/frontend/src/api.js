const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
let csrfTokenPromise;

async function getCsrfToken() {
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetch(`${BASE}/auth/csrf`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Could not get security token (${res.status})`);
        const body = await res.json();
        return body.token;
      })
      .catch((error) => {
        csrfTokenPromise = undefined;
        throw error;
      });
  }
  return csrfTokenPromise;
}

async function request(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    headers['X-XSRF-TOKEN'] = await getCsrfToken();
  }
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    method,
    headers,
    credentials: 'include',
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      // Errors are either { error: "..." } or { field: "message", ... } for validation
      msg = body.error || Object.values(body).join(', ') || msg;
    } catch {
      /* no JSON body */
    }
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

export const register = (body) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify(body) });

export const login = (body) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify(body) });

export const getCurrentUser = () => request('/auth/me');

export const logout = () => request('/auth/logout', { method: 'POST' });

const cleanParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v != null && v !== 'ALL')
  );

export const listIssues = (params = {}) =>
  request(`/issues?${new URLSearchParams(cleanParams(params))}`);

export const getIssue = (id) => request(`/issues/${id}`);

export const createIssue = (body) =>
  request('/issues', { method: 'POST', body: JSON.stringify(body) });

export const upvote = (id) => request(`/issues/${id}/upvote`, { method: 'POST' });

export const addComment = (id, body) =>
  request(`/issues/${id}/comments`, { method: 'POST', body: JSON.stringify(body) });

export const changeStatus = (id, body) =>
  request(`/issues/${id}/status`, { method: 'PUT', body: JSON.stringify(body) });

export const getStats = () => request('/stats');
