const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getAuthBaseUrl() {
  return import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3001';
}

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const isAuthEndpoint = endpoint === '/auth/login' || endpoint === '/auth/register';

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && !isAuthEndpoint) {
    localStorage.removeItem('token');
    window.location.href = '/';
    throw new Error('Sesión expirada');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `Error ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export { getToken, getAuthBaseUrl };
