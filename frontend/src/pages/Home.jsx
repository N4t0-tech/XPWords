import { useState, useEffect } from 'react';
import Leaderboard from '../components/Leaderboard';
import SectionHeader from '../components/SectionHeader';
import { api } from '../api/client';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    api.get('/stats').then(setStats).catch(() => {});
    api.get('/leaderboard').then(setLeaderboard).catch(() => {});
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
        {statItems.map(s => (
          <div key={s.label} className="xp-stat">
            <div className="xp-stat-val">{s.value}</div>
            <div className="xp-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>
      <SectionHeader icon="trophy" label="LEADERBOARD" />
      <Leaderboard data={leaderboard} />
    </div>
  );
}
