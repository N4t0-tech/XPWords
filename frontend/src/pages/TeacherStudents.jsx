import { useState, useEffect } from 'react';
import SectionHeader from '../components/SectionHeader';
import Skeleton from '../components/Skeleton';
import { api } from '../api/client';
import { useToast } from '../components/ToastContext';

export default function TeacherStudents() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState({});
  const [assigning, setAssigning] = useState(null);

  useEffect(() => {
    api.get('/users/students').then(async (data) => {
      setStudents(data);
      const ubMap = {};
      await Promise.all(data.map(async (s) => {
        try {
          ubMap[s.id] = await api.get(`/badges/user/${s.id}`);
        } catch { ubMap[s.id] = []; }
      }));
      setUserBadges(ubMap);
    }).catch(err => showToast(err.message)).finally(() => setLoading(false));
    api.get('/badges').then(setBadges).catch(err => showToast(err.message));
  }, []);

  async function handleAssign(userId, badgeId) {
    try {
      await api.post('/badges/assign', { userId, badgeId });
      const updated = await api.get(`/badges/user/${userId}`);
      setUserBadges(prev => ({ ...prev, [userId]: updated }));
      setAssigning(null);
      showToast('Medalla asignada');
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleRemove(userId, badgeId) {
    try {
      await api.delete(`/badges/assign/${userId}/${badgeId}`);
      const updated = await api.get(`/badges/user/${userId}`);
      setUserBadges(prev => ({ ...prev, [userId]: updated }));
      showToast('Medalla removida');
    } catch (err) {
      showToast(err.message);
    }
  }

  const ownedIds = (userId) => userBadges[userId]?.map(b => b.id) || [];

  return (
    <div className="xp-body">
      <SectionHeader icon="users" label="ALUMNOS" />
      <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '14px' }}>{students.length} estudiantes registrados</p>

      {loading
        ? <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ color: '#9ca3af', borderBottom: '1px solid #1c2030' }}>
                  {['Nombre', 'Email', 'Nivel', 'XP', 'Medallas', 'Discord'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Nombre' || h === 'Email' ? 'left' : 'center' }}>
                      <Skeleton width={60} height={14} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1,2,3,4,5].map(row => (
                  <tr key={row} style={{ borderBottom: '1px solid #13161f' }}>
                    <td style={{ padding: '10px 12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Skeleton width={28} height={28} borderRadius={14} /><Skeleton width={100} height={14} /></div></td>
                    <td style={{ padding: '10px 12px' }}><Skeleton width={120} height={14} /></td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}><Skeleton width={30} height={14} /></td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}><Skeleton width={40} height={14} /></td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}><Skeleton width={60} height={14} /></td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}><Skeleton width={80} height={14} /></td>
                  </tr>
                ))}
            </tbody>
        </table>
      </div>
        : <>
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ color: '#9ca3af', borderBottom: '1px solid #1c2030' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px' }}>Nombre</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px' }}>Email</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px' }}>Nivel</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px' }}>XP</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px' }}>Medallas</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px' }}>Discord</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #13161f', color: '#e2e8f0' }}>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {s.discordAvatar
                      ? <img src={s.discordAvatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                      : <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: s.avatarBg || '#1c2030', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#0a0b0f' }}>{s.name.charAt(0)}</div>
                    }
                    {s.name}
                  </div>
                </td>
                <td style={{ padding: '10px 12px', color: '#6b7280' }}>{s.email}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', color: '#6ee7b7', fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>{s.level}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', color: '#fbbf24', fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>{s.xp}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                    {(userBadges[s.id] || []).map(b => (
                      <span
                        key={b.id}
                        title={b.name + (b.description ? ': ' + b.description : '') + ' (click para remover)'}
                        onClick={() => handleRemove(s.id, b.id)}
                        style={{ cursor: 'pointer', fontSize: '18px', color: '#fbbf24', opacity: 0.9, transition: 'opacity .15s' }}
                        onMouseEnter={e => e.target.style.opacity = '0.5'}
                        onMouseLeave={e => e.target.style.opacity = '0.9'}
                      >
                        <i className={`ti ti-${b.icon}`} />
                      </span>
                    ))}
                    <span
                      title="Asignar medalla"
                      onClick={() => setAssigning(s.id)}
                      style={{ cursor: 'pointer', fontSize: '16px', color: '#4b5563' }}
                    >
                      <i className="ti ti-plus" />
                    </span>
                  </div>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  {s.discordTag
                    ? <span style={{ color: '#5865f2', fontSize: '13px' }}><i className="ti ti-brand-discord" aria-hidden="true" /> {s.discordTag}</span>
                    : <span style={{ color: '#4b5563', fontSize: '12px' }}>—</span>
                  }
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#4b5563' }}>No hay estudiantes registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {assigning !== null && (
        <div className="xp-modal-overlay" onClick={() => setAssigning(null)}>
          <div className="xp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <button className="xp-modal-close" onClick={() => setAssigning(null)}>✕</button>
            <div className="xp-section-hdr" style={{ marginBottom: '1.2rem' }}>
              <i className="ti ti-medal" aria-hidden="true" />
              <span>ASIGNAR MEDALLA</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {badges.filter(b => !ownedIds(assigning).includes(b.id)).map(b => (
                <button
                  key={b.id}
                  onClick={() => handleAssign(assigning, b.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#13161f', border: '1px solid #1c2030', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0', cursor: 'pointer', textAlign: 'left', fontSize: '14px' }}
                >
                  <span style={{ fontSize: '20px', color: '#fbbf24' }}><i className={`ti ti-${b.icon}`} /></span>
                  <div>
                    <div style={{ fontWeight: 500 }}>{b.name}</div>
                    {b.description && <div style={{ fontSize: '12px', color: '#6b7280' }}>{b.description}</div>}
                  </div>
                </button>
              ))}
              {badges.filter(b => !ownedIds(assigning).includes(b.id)).length === 0 && (
                <div style={{ textAlign: 'center', color: '#4b5563', padding: '1rem' }}>Ya tiene todas las medallas</div>
              )}
            </div>
          </div>
        </div>
      )}
      </>}

    </div>
  );
}
