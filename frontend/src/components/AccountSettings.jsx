import { useState } from 'react';
import { api, getAuthBaseUrl } from '../api/client';
import ChangePasswordModal from './ChangePasswordModal';
import SetPasswordModal from './SetPasswordModal';
import DeleteAccountModal from './DeleteAccountModal';
import { useToast } from './ToastContext';

export default function AccountSettings({ user, onLogout }) {
  const { showToast } = useToast();
  const [showChangePw, setShowChangePw] = useState(false);
  const [showSetPw, setShowSetPw] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const discordTag = user?.discordTag || null;
  const role = user?.role || 'STUDENT';

  async function handleConnectDiscord() {
    try {
      const data = await api.get('/users/me/discord/link');
      window.location.href = data.url;
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleDisconnectDiscord() {
    try {
      await api.post('/auth/discord', {});
      const u = await api.get('/users/me');
      showToast('Discord desconectado');
    } catch (err) {
      showToast(err.message);
    }
  }

  return (
    <div className="xp-settings-card">
      <div className="xp-section-hdr"><i className="ti ti-shield" aria-hidden="true" /><span>CUENTA</span></div>

      <div className="xp-settings-actions">
        <div className="xp-settings-row">
          <div className="xp-settings-row-info">
            <i className="ti ti-badge" aria-hidden="true" style={{ color: 'var(--purple)' }} />
            <span>Rol: <strong className={`xp-role-badge xp-role-${role.toLowerCase()}`}>{role === 'STUDENT' ? 'Estudiante' : role === 'TEACHER' ? 'Profesor' : 'Moderador'}</strong></span>
          </div>
        </div>
        {discordTag ? (
          <button className="xp-settings-btn" onClick={() => setShowSetPw(true)}>
            <i className="ti ti-lock" aria-hidden="true" />
            Establecer contraseña
          </button>
        ) : (
          <button className="xp-settings-btn" onClick={() => setShowChangePw(true)}>
            <i className="ti ti-lock" aria-hidden="true" />
            Cambiar contraseña
          </button>
        )}

          <div className="xp-settings-row">
            <div className="xp-settings-row-info">
              <i className="ti ti-brand-discord" aria-hidden="true" style={{ color: '#5865f2' }} />
              <span>Discord: <strong style={{ color: 'var(--text-heading)' }}>{discordTag || 'No conectado'}</strong></span>
            </div>
            {discordTag ? (
              <button className="xp-settings-btn xp-settings-btn-sm" onClick={handleDisconnectDiscord}>
                Desconectar
              </button>
            ) : (
              <button className="xp-settings-btn xp-settings-btn-sm" onClick={handleConnectDiscord}>
                Conectar
              </button>
            )}
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

      {showSetPw && (
        <SetPasswordModal
          onClose={() => setShowSetPw(false)}
          onDone={() => { setShowSetPw(false); showToast('Contraseña establecida'); }}
        />
      )}
      {showChangePw && (
        <ChangePasswordModal
          onClose={() => setShowChangePw(false)}
          onDone={() => { setShowChangePw(false); showToast('Contraseña actualizada'); }}
        />
      )}
      {showDelete && (
        <DeleteAccountModal
          onClose={() => setShowDelete(false)}
          onDone={() => { setShowDelete(false); onLogout(); }}
        />
      )}
    </div>
  );
}
