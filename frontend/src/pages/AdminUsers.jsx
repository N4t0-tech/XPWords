import { useState, useEffect } from 'react';
import SectionHeader from '../components/SectionHeader';
import Toast from '../components/Toast';
import { api } from '../api/client';

const ROLE_LABELS = { STUDENT: 'Estudiante', TEACHER: 'Profesor', MODERATOR: 'Moderador' };

export default function AdminUsers({ user }) {
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState({ show: false, msg: '' });
  const isModerator = user?.role === 'MODERATOR';

  useEffect(() => {
    api.get('/admin/users').then(setUsers).catch(() => {});
  }, []);

  async function handleRoleChange(userId, newRole) {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setToast({ show: true, msg: `Rol cambiado a ${ROLE_LABELS[newRole]}` });
    } catch (err) {
      setToast({ show: true, msg: err.message });
    }
  }

  function allowedRoles(targetRole) {
    if (isModerator) return ['STUDENT', 'TEACHER', 'MODERATOR'];
    if (targetRole === 'MODERATOR') return ['MODERATOR'];
    return ['STUDENT', 'TEACHER'];
  }

  return (
    <div className="xp-body">
      <SectionHeader icon="shield-check" label="ADMIN — USUARIOS" />
      <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '14px' }}>{users.length} usuarios registrados</p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ color: '#9ca3af', borderBottom: '1px solid #1c2030' }}>
              <th style={{ textAlign: 'left', padding: '10px 12px' }}>Nombre</th>
              <th style={{ textAlign: 'left', padding: '10px 12px' }}>Email</th>
              <th style={{ textAlign: 'center', padding: '10px 12px' }}>Nivel</th>
              <th style={{ textAlign: 'center', padding: '10px 12px' }}>Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const opts = allowedRoles(u.role);
              const isSelf = u.id === user?.id;
              const isLocked = !isModerator && u.role === 'MODERATOR';
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #13161f', color: '#e2e8f0' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {u.discordAvatar
                        ? <img src={u.discordAvatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: u.avatarBg || '#1c2030', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#0a0b0f' }}>{u.name?.charAt(0)}</div>
                      }
                      {u.name}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#6b7280' }}>{u.email}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#6ee7b7', fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>{u.level}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    {isSelf || isLocked ? (
                      <span style={{ color: isSelf ? '#fbbf24' : '#9ca3af', fontSize: '13px', fontWeight: isSelf ? 600 : 400 }}>{ROLE_LABELS[u.role]}</span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        style={{ background: '#13161f', border: '1px solid #1c2030', borderRadius: '6px', padding: '6px 10px', color: '#e2e8f0', fontSize: '13px', cursor: 'pointer' }}
                      >
                        {opts.map(r => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#4b5563' }}>No hay usuarios</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Toast message={toast.msg} show={toast.show} onClose={() => setToast({ show: false, msg: '' })} />
    </div>
  );
}
