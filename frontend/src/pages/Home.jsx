import Leaderboard from '../components/Leaderboard';
import SectionHeader from '../components/SectionHeader';
import { stats, leaderboard } from '../data/mock';

export default function Home() {
  return (
    <div className="xp-body">
      <div className="xp-hero">
        <div className="xp-hero-title">Subí de nivel<br />en <span>inglés</span></div>
        <p className="xp-hero-sub">
          Clases, minijuegos y recursos para la comunidad del servidor.<br />
          Cada clase y juego te da XP real. ¿Hasta qué nivel llegás?
        </p>
      </div>
      <div className="xp-stats">
        {stats.map(s => (
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
