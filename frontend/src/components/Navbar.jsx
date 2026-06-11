import { Link, useLocation } from 'react-router-dom';
import UserChip from './UserChip';

const teacherTabs = [
  { path: '/teacher/students', label: 'Alumnos' },
  { path: '/teacher/quizzes', label: 'Minijuegos' },
  { path: '/teacher/badges', label: 'Medallas' },
  { path: '/teacher/resources', label: 'Recursos' },
  { path: '/teacher/classes', label: 'Clases' },
  { path: '/teacher/requests', label: 'Solicitudes' },
  { path: '/teacher/admin', label: 'Admin' },
];

const studentTabs = [
  { path: '/games', label: 'Minijuegos' },
  { path: '/resources', label: 'Recursos' },
  { path: '/requests', label: 'Solicitudes' },
];

export default function Navbar({ user, viewMode, onToggleView }) {
  const { pathname } = useLocation();
  const isTeacherView = viewMode === 'teacher';
  const tabs = isTeacherView ? teacherTabs : studentTabs;

  return (
    <header aria-label="Navegación principal">
      <nav className="xp-nav">
        <Link to="/home" className="xp-logo" style={{ textDecoration: 'none' }}>XP<span>Words</span></Link>
        {tabs.map(t => (
          <Link
            key={t.path}
            to={t.path}
            className={`xp-nav-btn${pathname === t.path || pathname.startsWith(t.path) ? ' active' : ''}`}
          >
            {t.label}
          </Link>
        ))}
        {user?.role === 'MODERATOR' && (
          <button
            className="xp-view-toggle"
            onClick={onToggleView}
            title={isTeacherView ? 'Cambiar a vista estudiante' : 'Cambiar a vista profesor'}
          >
            <span className={`xp-view-opt${isTeacherView ? ' active' : ''}`}>Profe</span>
            <span className="xp-view-switch">
              <span className={`xp-view-knob${isTeacherView ? '' : ' right'}`} />
            </span>
            <span className={`xp-view-opt${!isTeacherView ? ' active' : ''}`}>Alumno</span>
          </button>
        )}
        <Link to="/profile" style={{ textDecoration: 'none' }}>
          <UserChip user={user} />
        </Link>
      </nav>
    </header>
  );
}
