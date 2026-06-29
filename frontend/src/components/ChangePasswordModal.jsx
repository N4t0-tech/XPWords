import { useState } from 'react';
import { api } from '../api/client';

export default function ChangePasswordModal({ onClose, onDone }) {
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!current || !newPw || !confirm) return;
    if (newPw !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await api.put('/users/me/password', { currentPassword: current, newPassword: newPw });
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
        <div className="xp-mini-title" style={{ marginBottom: '1rem', fontSize: '18px' }}>Cambiar contraseña</div>
        <form className="xp-modal-form" onSubmit={handleSubmit}>
          <div className="xp-modal-field">
            <label htmlFor="pw-current">Contraseña actual</label>
            <input id="pw-current" type="password" placeholder="••••••••" value={current} onChange={e => setCurrent(e.target.value)} />
          </div>
          <div className="xp-modal-field">
            <label htmlFor="pw-new">Nueva contraseña</label>
            <input id="pw-new" type="password" placeholder="••••••••" value={newPw} onChange={e => setNewPw(e.target.value)} />
          </div>
          <div className="xp-modal-field">
            <label htmlFor="pw-confirm">Confirmar nueva contraseña</label>
            <input id="pw-confirm" type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
          {error && <p className="xp-error-msg">{error}</p>}
          <button type="submit" className="xp-btn-primary" style={{ width: '100%' }} disabled={loading || newPw !== confirm || !current}>
            {loading ? 'CARGANDO...' : 'CAMBIAR CONTRASEÑA'}
          </button>
        </form>
      </div>
    </div>
  );
}
