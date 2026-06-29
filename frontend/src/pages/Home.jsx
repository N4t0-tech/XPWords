import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Leaderboard from '../components/Leaderboard';
import SectionHeader from '../components/SectionHeader';
import Skeleton from '../components/Skeleton';
import { api } from '../api/client';
import { useToast } from '../components/ToastContext';

export default function Home({ user }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/stats').then(setStats).catch(err => showToast(err.message)),
      api.get('/leaderboard').then(setLeaderboard).catch(err => showToast(err.message)),
      api.get('/xp/history').then(setHistory).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const statItems = stats
    ? [
        { value: stats.activeMembers, label: 'Miembros activos' },
        { value: stats.games, label: 'Minijuegos' },
        { value: stats.resources, label: 'Recursos' },
      ]
    : [];

  const xpInLevel = user ? user.xp % 1000 : 0;
  const xpForNext = 1000;

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  const sourceIcon = {
    CLASS: 'school',
    GAME: 'device-gamepad-2',
    RESOURCE: 'cards',
    BONUS: 'bolt',
  };

  const sourceClass = {
    CLASS: 'class',
    GAME: 'game',
    RESOURCE: 'res',
    BONUS: 'bonus',
  };

  return (
    <div className="xp-body">
      <div className="xp-dash-welcome">
        <div className="xp-dash-welcome-text">
          <div className="xp-dash-greeting">Bienvenido, {user?.name || 'estudiante'}</div>
          <div className="xp-dash-sub">¿Qué vas a practicar hoy?</div>
        </div>
        <div className="xp-dash-level-card">
          <div className="xp-dash-level-top">
            <span className="xp-dash-level-num">LVL {user?.level || 0}</span>
            <span className="xp-dash-level-rank">{user?.role === 'TEACHER' ? 'Profesor' : user?.role === 'MODERATOR' ? 'Moderador' : 'Estudiante'}</span>
          </div>
          <div className="xp-dash-level-bar">
            <div className="xp-dash-level-fill" style={{ width: `${(xpInLevel / xpForNext) * 100}%` }} />
          </div>
          <div className="xp-dash-level-xp">{user?.xp || 0} / {(Math.floor((user?.xp || 0) / 1000) + 1) * 1000} XP</div>
        </div>
      </div>

      <div className="xp-dash-actions">
        <Link to="/games" className="xp-dash-action" style={{ background: 'var(--bg-green)', color: 'var(--accent)' }}>
          <i className="ti ti-device-gamepad-2" />
          <span>Jugar</span>
        </Link>
        <Link to="/resources" className="xp-dash-action" style={{ background: 'var(--bg-purple)', color: 'var(--purple)' }}>
          <i className="ti ti-books" />
          <span>Recursos</span>
        </Link>
        <Link to="/requests" className="xp-dash-action" style={{ background: 'var(--bg-gold)', color: 'var(--gold)' }}>
          <i className="ti ti-messages" />
          <span>Solicitar clase</span>
        </Link>
      </div>

      <div className="xp-stats">
        {loading
          ? [1,2,3].map(i => (
              <div key={i} className="xp-stat">
                <Skeleton width={70} height={28} />
                <div style={{ marginTop: 4 }}><Skeleton width={100} height={14} /></div>
              </div>
            ))
          : statItems.map(s => (
              <div key={s.label} className="xp-stat">
                <div className="xp-stat-val">{s.value}</div>
                <div className="xp-stat-lbl">{s.label}</div>
              </div>
            ))
        }
      </div>

      <div className="xp-dash-bottom">
        <div className="xp-dash-col">
          <SectionHeader icon="history" label="ACTIVIDAD RECIENTE" />
          {loading
            ? [1,2,3].map(i => <Skeleton key={i} height={44} borderRadius={10} style={{ marginBottom: 8 }} />)
            : history.length === 0
              ? <div className="xp-history"><div className="xp-hist-row"><p className="xp-dash-empty">Aún no tienes actividad. ¡Empieza a jugar!</p></div></div>
              : <div className="xp-history">
                  {history.slice(0, 5).map((h, i) => (
                    <div key={i} className="xp-hist-row">
                      <div className={`xp-hist-icon ${sourceClass[h.source] || 'game'}`}>
                        <i className={`ti ti-${sourceIcon[h.source] || 'device-gamepad-2'}`} />
                      </div>
                      <div className="xp-dash-activity-info">
                        <div className="xp-dash-activity-desc">{h.description || h.source}</div>
                        <div className="xp-dash-activity-date">{formatDate(h.createdAt)}</div>
                      </div>
                      <div className="xp-dash-activity-xp">+{h.amount} XP</div>
                    </div>
                  ))}
                </div>
              }
        </div>
        <div className="xp-dash-col">
          <SectionHeader icon="trophy" label="LEADERBOARD" />
          {loading
            ? <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1,2,3,4,5].map(i => <Skeleton key={i} height={48} borderRadius={10} />)}</div>
            : <Leaderboard data={leaderboard} />
          }
        </div>
      </div>
    </div>
  );
}
