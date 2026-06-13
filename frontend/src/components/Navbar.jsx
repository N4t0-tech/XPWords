import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import UserChip from './UserChip';

const teacherTabs = [
  { path: '/home', label: 'Dashboard' },
  { path: '/teacher/students', label: 'Alumnos' },
  { path: '/teacher/quizzes', label: 'Minijuegos' },
  { path: '/teacher/badges', label: 'Medallas' },
  { path: '/teacher/resources', label: 'Recursos' },
  { path: '/teacher/classes', label: 'Clases' },
  { path: '/teacher/requests', label: 'Solicitudes' },
  { path: '/teacher/admin', label: 'Admin' },
];

const studentTabs = [
  { path: '/home', label: 'Dashboard' },
  { path: '/games', label: 'Minijuegos' },
  { path: '/resources', label: 'Recursos' },
  { path: '/requests', label: 'Solicitudes' },
];

export default function Navbar({ user, viewMode, onToggleView }) {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isTeacherView = viewMode === 'teacher';
  const tabs = isTeacherView ? teacherTabs : studentTabs;

  useEffect(() => {
    if (window.innerWidth >= 769) {
      setSidebarOpen(true);
    }
  }, []);

  function toggleSidebar() {
    setSidebarOpen(prev => !prev);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <>
      <button className={`xp-hamburger${sidebarOpen ? ' behind' : ''}`} onClick={toggleSidebar} aria-label="Abrir menú">
        <i className={`ti ti-${sidebarOpen ? 'x' : 'menu-2'}`} />
      </button>

      {sidebarOpen && <div className="xp-sidebar-overlay" onClick={closeSidebar} />}

      <aside className={`xp-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="xp-sidebar-header">
          <Link to="/home" className="xp-logo" onClick={closeSidebar} style={{ textDecoration: 'none' }}>
            XP<span>Words</span>
          </Link>
          <button className="xp-sidebar-close" onClick={closeSidebar} aria-label="Cerrar menú">
            <i className="ti ti-x" />
          </button>
        </div>

        <nav className="xp-sidebar-nav">
          {tabs.map(t => (
            <Link
              key={t.path}
              to={t.path}
              className={`xp-sidebar-link${pathname === t.path || pathname.startsWith(t.path) ? ' active' : ''}`}
              onClick={closeSidebar}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="xp-sidebar-footer">
          <Link to="/profile" style={{ textDecoration: 'none', alignSelf: 'flex-start' }} onClick={closeSidebar}>
            <UserChip user={user} />
          </Link>
          {user?.role === 'MODERATOR' && (
            <button className="xp-view-toggle" onClick={onToggleView}>
              <span className={`xp-view-opt${isTeacherView ? ' active' : ''}`}>Profe</span>
              <span className="xp-view-switch">
                <span className={`xp-view-knob${isTeacherView ? '' : ' right'}`} />
              </span>
              <span className={`xp-view-opt${!isTeacherView ? ' active' : ''}`}>Alumno</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
