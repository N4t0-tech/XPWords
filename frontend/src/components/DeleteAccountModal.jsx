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
        <div className="xp-mini-title" style={{ marginBottom: '.8rem', fontSize: '18px', color: '#f87171' }}>Eliminar cuenta</div>
        <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '1.2rem', lineHeight: 1.6 }}>
          Esta acción es irreversible. Se perderán todos tus datos, XP, insignias e historial.
        </p>
        <form className="xp-modal-form" onSubmit={handleSubmit}>
          <div className="xp-modal-field">
            <label htmlFor="delete-confirm">Escribí <strong style={{ color: '#f87171' }}>ELIMINAR</strong> para confirmar</label>
            <input
              id="delete-confirm"
              type="text"
              placeholder="ELIMINAR"
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{ borderColor: input === 'ELIMINAR' ? '#f87171' : undefined }}
            />
          </div>
          {error && <p style={{ color: '#f87171', fontSize: '13px' }}>{error}</p>}
          <button
            type="submit"
            style={{
              width: '100%', background: '#2a1010', color: '#f87171', border: '1px solid #4a2020',
              borderRadius: '7px', padding: '12px', fontSize: '14px',
              fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, cursor: 'pointer',
              letterSpacing: '.05em', opacity: input === 'ELIMINAR' ? 1 : .5,
            }}
            disabled={loading || input !== 'ELIMINAR'}
          >
            {loading ? 'ELIMINANDO...' : 'ELIMINAR CUENTA'}
          </button>
        </form>
      </div>
    </div>
  );
}
