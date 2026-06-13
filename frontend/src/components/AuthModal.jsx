import { useState, useEffect } from 'react';
import { api, getAuthBaseUrl } from '../api/client';

export default function AuthModal({ mode, error: initialError, onClose, onLogin }) {
  const [tab, setTab] = useState(mode || 'login');
  const [view, setView] = useState('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (initialError) setError(initialError);
  }, [initialError]);

  const [resetCode, setResetCode] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');

  function validate() {
    if (!email || !password) {
      return 'Todos los campos son obligatorios';
    }
    if (tab === 'register') {
      if (!username) return 'Todos los campos son obligatorios';
      if (username.length < 2) return 'El nombre debe tener al menos 2 caracteres';
      if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
      if (password !== confirmPassword) return 'Las contraseñas no coinciden';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Email no válido';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
      const body = tab === 'login'
        ? { email, password, rememberMe }
        : { email, password, name: username, rememberMe };
      const data = await api.post(endpoint, body);
      await onLogin(data.token);
    } catch (err) {
      setError(err?.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email) { setError('Ingresa tu email'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError('Email no válido'); return; }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess('Si el email existe, recibirás un código de recuperación');
      setView('resetCode');
    } catch (err) {
      setError(err?.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!resetCode || resetCode.length !== 6) { setError('El código debe tener 6 dígitos'); return; }
    if (!resetPassword || resetPassword.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (resetPassword !== resetConfirm) { setError('Las contraseñas no coinciden'); return; }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { code: resetCode, newPassword: resetPassword });
      setSuccess('Contraseña actualizada correctamente');
      setTimeout(() => {
        setView('form');
        setTab('login');
        setResetCode('');
        setResetPassword('');
        setResetConfirm('');
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err?.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  function handleDiscord() {
    window.location.href = `${getAuthBaseUrl()}/oauth2/authorization/discord`;
  }

  function backToLogin() {
    setView('form');
    setTab('login');
    setError('');
    setSuccess('');
  }

  if (view === 'forgot') {
    return (
      <div className="xp-modal-overlay" onClick={onClose}>
        <div className="xp-modal" onClick={e => e.stopPropagation()}>
          <button className="xp-modal-close" onClick={onClose}>✕</button>
          <h2 style={{ color: '#e2e8f0', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Recuperar contraseña</h2>

          <form className="xp-modal-form" onSubmit={handleForgotPassword}>
            <div className="xp-modal-field">
              <label htmlFor="forgot-email">Email</label>
              <input
                id="forgot-email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            {error && <div className="xp-error-msg">{error}</div>}
            {success && <div className="xp-success-msg">{success}</div>}

            <button type="submit" className="xp-btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'ENVIANDO...' : 'ENVIAR CÓDIGO'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button onClick={backToLogin} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '13px' }}>
              ← Volver a iniciar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'resetCode') {
    return (
      <div className="xp-modal-overlay" onClick={onClose}>
        <div className="xp-modal" onClick={e => e.stopPropagation()}>
          <button className="xp-modal-close" onClick={onClose}>✕</button>
          <h2 style={{ color: '#e2e8f0', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Nueva contraseña</h2>

          <form className="xp-modal-form" onSubmit={handleResetPassword}>
            <div className="xp-modal-field">
              <label htmlFor="reset-code">Código de recuperación</label>
              <input
                id="reset-code"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={resetCode}
                onChange={e => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>

            <div className="xp-modal-field">
              <label htmlFor="reset-password">Nueva contraseña</label>
              <input
                id="reset-password"
                type="password"
                placeholder="••••••••"
                value={resetPassword}
                onChange={e => setResetPassword(e.target.value)}
              />
            </div>

            <div className="xp-modal-field">
              <label htmlFor="reset-confirm">Confirmar contraseña</label>
              <input
                id="reset-confirm"
                type="password"
                placeholder="••••••••"
                value={resetConfirm}
                onChange={e => setResetConfirm(e.target.value)}
              />
            </div>

            {error && <div className="xp-error-msg">{error}</div>}
            {success && <div className="xp-success-msg">{success}</div>}

            <button type="submit" className="xp-btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'CAMBIANDO...' : 'CAMBIAR CONTRASEÑA'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button onClick={backToLogin} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '13px' }}>
              ← Volver a iniciar sesión
            </button>
          </div>
        </div>
      </div>
    );
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

          {tab === 'register' && (
            <div className="xp-modal-field">
              <label htmlFor="auth-confirm">Confirmar contraseña</label>
              <input
                id="auth-confirm"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <div className="xp-modal-field xp-remember-row">
            <label className="xp-checkbox-label">
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
              Recordarme
            </label>
          </div>

          {tab === 'login' && (
            <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setView('forgot')}
                style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '13px' }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

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
