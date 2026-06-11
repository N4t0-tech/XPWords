import { useState, useEffect } from 'react';
import SectionHeader from '../components/SectionHeader';
import { api } from '../api/client';

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    api.get('/users/students').then(setStudents).catch(() => {});
  }, []);

  return (
    <div className="xp-body">
      <SectionHeader icon="users" label="ALUMNOS" />
      <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '14px' }}>{students.length} estudiantes registrados</p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ color: '#9ca3af', borderBottom: '1px solid #1c2030' }}>
              <th style={{ textAlign: 'left', padding: '10px 12px' }}>Nombre</th>
              <th style={{ textAlign: 'left', padding: '10px 12px' }}>Email</th>
              <th style={{ textAlign: 'center', padding: '10px 12px' }}>Nivel</th>
              <th style={{ textAlign: 'center', padding: '10px 12px' }}>XP</th>
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
                  {s.discordTag
                    ? <span style={{ color: '#5865f2', fontSize: '13px' }}><i className="ti ti-brand-discord" aria-hidden="true" /> {s.discordTag}</span>
                    : <span style={{ color: '#4b5563', fontSize: '12px' }}>—</span>
                  }
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#4b5563' }}>No hay estudiantes registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
