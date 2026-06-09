import { useState } from 'react';

export default function AuthModal({ mode, onClose, onLogin }) {
  const [tab, setTab] = useState(mode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    if (tab === 'register' && !username) return;
    onLogin();
  }

  function handleDiscord() {
    alert('Próximamente disponible');
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

          <button type="submit" className="xp-btn-primary" style={{ width: '100%' }}>
            {tab === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}
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
