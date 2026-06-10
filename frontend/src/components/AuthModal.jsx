import { useState } from 'react';
import { api, getAuthBaseUrl } from '../api/client';

export default function AuthModal({ mode, onClose, onLogin }) {
  const [tab, setTab] = useState(mode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Todos los campos son obligatorios');
      return;
    }
    if (tab === 'register' && !username) {
      setError('Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
      const body = tab === 'login'
        ? { email, password, rememberMe }
        : { email, password, name: username, role, rememberMe };
      const data = await api.post(endpoint, body);
      await onLogin(data.token);
    } catch (err) {
      setError(err?.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  function handleDiscord() {
    window.location.href = `${getAuthBaseUrl()}/oauth2/authorization/discord`;
  }

  return (
    <div className="xp-modal-overlay" onClick={onClose}>
      <div className="xp-modal" onClick={e => e.stopPropagation()}>
        <button className="xp-modal-close" onClick={onClose}>✕</button>

        <div className="xp-modal-tabs">
          <button
            className={`xp-modal-tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => setTab('login')}
          >
            Iniciar Sesión
          </button>
          <button
            className={`xp-modal-tab${tab === 'register' ? ' active' : ''}`}
            onClick={() => setTab('register')}
          >
            Registrarse
          </button>
        </div>

        <form className="xp-modal-form" onSubmit={handleSubmit}>
          {tab === 'register' && (
            <>
              <div className="xp-modal-field">
                <label htmlFor="auth-username">Nombre de usuario</label>
                <input
                  id="auth-username"
                  type="text"
                  placeholder="tu_usuario"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
              <div className="xp-modal-field">
                <label htmlFor="auth-role">Rol</label>
                <select
                  id="auth-role"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="STUDENT">Estudiante</option>
                  <option value="TEACHER">Profesor</option>
                </select>
              </div>
            </>
          )}

          <div className="xp-modal-field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="xp-modal-field">
            <label htmlFor="auth-password">Contraseña</label>
            <input
              id="auth-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className="xp-modal-field xp-remember-row">
            <label className="xp-checkbox-label">
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
              Recordarme
            </label>
          </div>

          {error && <div className="xp-error-msg">{error}</div>}

          <button type="submit" className="xp-btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'CARGANDO...' : tab === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}
          </button>
        </form>

        <div className="xp-modal-divider">
          <span>o</span>
        </div>

        <button className="xp-btn-discord" onClick={handleDiscord}>
          <i className="ti ti-brand-discord" aria-hidden="true" />
          {tab === 'login' ? 'Iniciar con Discord' : 'Registrarse con Discord'}
        </button>
      </div>
    </div>
  );
}
