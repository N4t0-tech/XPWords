import { useState } from 'react';
import { api } from '../api/client';

export default function DeleteAccountModal({ onClose, onDone }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (input !== 'ELIMINAR') return;
    setLoading(true);
    try {
      await api.delete('/users/me');
      onDone();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="xp-modal-overlay" onClick={onClose}>
      <div className="xp-modal" onClick={e => e.stopPropagation()}>
        <button className="xp-modal-close" onClick={onClose}>✕</button>
        <div className="xp-mini-title" style={{ marginBottom: '.8rem', fontSize: '18px', color: 'var(--red)' }}>Eliminar cuenta</div>
        <p style={{ fontSize: '14px', color: 'var(--text-muted3)', marginBottom: '1.2rem', lineHeight: 1.6 }}>
          Tu cuenta será desactivada. No podrás iniciar sesión hasta que un administrador la reactive.
          Tus datos, XP e insignias se conservarán.
        </p>
        <form className="xp-modal-form" onSubmit={handleSubmit}>
          <div className="xp-modal-field">
            <label htmlFor="delete-confirm">Escribí <strong style={{ color: 'var(--red)' }}>ELIMINAR</strong> para confirmar</label>
            <input
              id="delete-confirm"
              type="text"
              placeholder="ELIMINAR"
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{ borderColor: input === 'ELIMINAR' ? 'var(--red)' : undefined }}
            />
          </div>
          {error && <p className="xp-error-msg">{error}</p>}
          <button
            type="submit"
            className="xp-settings-btn xp-settings-btn-danger"
            style={{ width: '100%', justifyContent: 'center', opacity: input === 'ELIMINAR' ? 1 : .5 }}
            disabled={loading || input !== 'ELIMINAR'}
          >
            {loading ? 'ELIMINANDO...' : 'ELIMINAR CUENTA'}
          </button>
        </form>
      </div>
    </div>
  );
}
