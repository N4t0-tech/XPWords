import { useState, useEffect } from 'react';
import Leaderboard from '../components/Leaderboard';
import SectionHeader from '../components/SectionHeader';
import Skeleton from '../components/Skeleton';
import { api } from '../api/client';
import { useToast } from '../components/ToastContext';

export default function Home() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/stats').then(setStats).catch(err => showToast(err.message)),
      api.get('/leaderboard').then(setLeaderboard).catch(err => showToast(err.message)),
    ]).finally(() => setLoading(false));
  }, []);

  const statItems = stats
    ? [
        { value: stats.activeMembers, label: 'Miembros activos' },
        { value: stats.games, label: 'Minijuegos' },
        { value: stats.resources, label: 'Recursos' },
      ]
    : [];

  return (
    <div className="xp-body">
      <div className="xp-hero">
        <div className="xp-hero-title">Sube de nivel<br />en <span>inglés</span></div>
        <p className="xp-hero-sub">
          Clases, minijuegos y recursos para la comunidad del servidor.<br />
          Cada clase y juego te da XP real. ¿Hasta qué nivel llegás?
        </p>
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
      <SectionHeader icon="trophy" label="LEADERBOARD" />
      {loading
        ? <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1,2,3,4,5].map(i => <Skeleton key={i} height={48} borderRadius={10} />)}</div>
        : <Leaderboard data={leaderboard} />
      }
    </div>
  );
}
