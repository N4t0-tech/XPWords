import { useState } from 'react';
import { api } from '../api/client';

export default function SetPasswordModal({ onClose, onDone }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Mínimo 6 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await api.put('/users/me/set-password', { newPassword: password });
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="xp-modal-overlay" onClick={onClose}>
      <div className="xp-modal" onClick={e => e.stopPropagation()}>
        <button className="xp-modal-close" onClick={onClose}>✕</button>

        <div className="xp-section-hdr" style={{ marginBottom: '1.2rem' }}>
          <i className="ti ti-lock" aria-hidden="true" />
          <span>ESTABLECER CONTRASEÑA</span>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.5' }}>
          Tu cuenta fue creada con Discord. Establecé una contraseña para poder iniciar sesión también con email y contraseña.
        </p>

        <form className="xp-modal-form" onSubmit={handleSubmit}>
          <div className="xp-modal-field">
            <label htmlFor="setpw-new">Nueva contraseña</label>
            <input
              id="setpw-new"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <div className="xp-modal-field">
            <label htmlFor="setpw-confirm">Confirmar contraseña</label>
            <input
              id="setpw-confirm"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {error && <div className="xp-error-msg">{error}</div>}

          <button type="submit" className="xp-btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'GUARDANDO...' : 'ESTABLECER CONTRASEÑA'}
          </button>
        </form>
      </div>
    </div>
  );
}
