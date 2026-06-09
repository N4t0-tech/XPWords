import { useState } from 'react';
import ChangePasswordModal from './ChangePasswordModal';
import DeleteAccountModal from './DeleteAccountModal';
import Toast from './Toast';

export default function AccountSettings({ onLogout }) {
  const [showChangePw, setShowChangePw] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '' });

  return (
    <div className="xp-settings-card">
      <div className="xp-section-hdr"><i className="ti ti-shield" aria-hidden="true" /><span>CUENTA</span></div>

      <div className="xp-settings-actions">
        <button className="xp-settings-btn" onClick={() => setShowChangePw(true)}>
          <i className="ti ti-lock" aria-hidden="true" />
          Cambiar contraseña
        </button>

        <div className="xp-settings-row">
          <div className="xp-settings-row-info">
            <i className="ti ti-brand-discord" aria-hidden="true" style={{ color: '#5865f2' }} />
            <span>Discord: <strong style={{ color: '#e2e8f0' }}>@usuario#1234</strong></span>
          </div>
          <button className="xp-settings-btn xp-settings-btn-sm" onClick={() => setToast({ show: true, msg: 'Discord desconectado (mock)' })}>
            Desconectar
          </button>
        </div>

        <button className="xp-settings-btn" onClick={onLogout}>
          <i className="ti ti-logout" aria-hidden="true" />
          Cerrar sesión
        </button>

        <hr className="xp-settings-divider" />

        <button className="xp-settings-btn xp-settings-btn-danger" onClick={() => setShowDelete(true)}>
          <i className="ti ti-trash" aria-hidden="true" />
          Eliminar cuenta
        </button>
      </div>

      {showChangePw && (
        <ChangePasswordModal
          onClose={() => setShowChangePw(false)}
          onDone={() => { setShowChangePw(false); setToast({ show: true, msg: 'Contraseña cambiada (mock)' }); }}
        />
      )}
      {showDelete && (
        <DeleteAccountModal
          onClose={() => setShowDelete(false)}
          onDone={() => { setShowDelete(false); setToast({ show: true, msg: 'Cuenta eliminada (mock)' }); }}
        />
      )}
      <Toast message={toast.msg} show={toast.show} onClose={() => setToast({ show: false, msg: '' })} />
    </div>
  );
}
