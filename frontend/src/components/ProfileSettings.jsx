import { useState, useEffect } from 'react';
import { api } from '../api/client';
import Toast from './Toast';

export default function ProfileSettings({ user }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [toast, setToast] = useState({ show: false, msg: '' });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    try {
      await api.put('/users/me', { name, email });
      setToast({ show: true, msg: 'Cambios guardados' });
    } catch (err) {
      setToast({ show: true, msg: err.message });
    }
  }

  return (
    <div className="xp-settings-card">
      <div className="xp-section-hdr"><i className="ti ti-user" aria-hidden="true" /><span>PERFIL</span></div>
      <form className="xp-settings-form" onSubmit={handleSave}>
        <div className="xp-modal-field">
          <label htmlFor="settings-name">Nombre de usuario</label>
          <input id="settings-name" type="text" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="xp-modal-field">
          <label htmlFor="settings-email">Email</label>
          <input id="settings-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <button type="submit" className="xp-btn-primary" style={{ alignSelf: 'flex-start' }}>
          GUARDAR CAMBIOS
        </button>
      </form>
      <Toast message={toast.msg} show={toast.show} onClose={() => setToast({ show: false, msg: '' })} />
    </div>
  );
}
