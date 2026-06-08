import { Link, useLocation } from 'react-router-dom';
import UserChip from './UserChip';
import { currentUser } from '../data/mock';

const tabs = [
  { path: '/', label: 'Inicio' },
  { path: '/games', label: 'Minijuegos' },
  { path: '/resources', label: 'Recursos' },
  { path: '/profile', label: 'Perfil' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <header aria-label="Navegación principal">
      <nav className="xp-nav">
        <div className="xp-logo">XP<span>Words</span></div>
        {tabs.map(t => (
          <Link
            key={t.path}
            to={t.path}
            className={`xp-nav-btn${pathname === t.path ? ' active' : ''}`}
          >
            {t.label}
          </Link>
        ))}
        <UserChip user={currentUser} />
      </nav>
    </header>
  );
}
