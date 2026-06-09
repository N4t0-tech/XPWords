import { useState } from 'react';
import Toast from './Toast';

export default function ProfileSettings() {
  const [name, setName] = useState('tú_acá');
  const [email, setEmail] = useState('tu_acá@ejemplo.com');
  const [toast, setToast] = useState({ show: false, msg: '' });

  function handleSave(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setToast({ show: true, msg: 'Cambios guardados (mock)' });
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
