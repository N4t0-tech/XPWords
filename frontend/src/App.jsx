import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Games from './pages/Games';
import Resources from './pages/Resources';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Landing from './pages/Landing';
import AuthModal from './components/AuthModal';
import AuthGuard from './components/AuthGuard';
import TeacherResources from './pages/TeacherResources';
import TeacherClasses from './pages/TeacherClasses';
import TeacherRequests from './pages/TeacherRequests';
import TeacherQuizzes from './pages/TeacherQuizzes';
import TeacherBadges from './pages/TeacherBadges';
import TeacherStudents from './pages/TeacherStudents';
import AdminUsers from './pages/AdminUsers';
import StudentRequests from './pages/StudentRequests';
import AuthCallback from './pages/AuthCallback';
import { api } from './api/client';
import { useToast } from './components/ToastContext';
import './App.css';

export default function App() {
  const { showToast } = useToast();
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [authError, setAuthError] = useState(null);
  const openAuth = (param) => {
    if (typeof param === 'string') {
      setAuthMode(param);
      setAuthError(null);
    } else {
      setAuthMode(param.mode);
      setAuthError(param.error || null);
    }
  };
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('viewMode') || 'teacher');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCheckingAuth(false);
      return;
    }
    api.get('/users/me')
      .then(data => {
        setUser(data);
        setLoggedIn(true);
      })
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => {
        setCheckingAuth(false);
      });
  }, []);

  useEffect(() => {
    function refreshUser() {
      if (!localStorage.getItem('token')) return;
      api.get('/users/me').then(setUser).catch(() => {});
    }
    window.addEventListener('user-updated', refreshUser);
    return () => window.removeEventListener('user-updated', refreshUser);
  }, []);

  const effectiveView = !user
    ? 'student'
    : user.role === 'STUDENT'
      ? 'student'
      : user.role === 'MODERATOR'
        ? viewMode
        : 'teacher';

  function handleToggleView() {
    const next = viewMode === 'teacher' ? 'student' : 'teacher';
    setViewMode(next);
    localStorage.setItem('viewMode', next);
  }

  async function handleLogin(token) {
    localStorage.setItem('token', token);
    try {
      const data = await api.get('/users/me');
      setUser(data);
    } catch (err) {
      setUser(null);
      showToast(err.message);
    }
    setLoggedIn(true);
    setAuthMode(null);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('viewMode');
    setUser(null);
    setLoggedIn(false);
  }

  if (checkingAuth) {
    return <div className="xp" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#4b5563' }}>Cargando...</div>;
  }

  return (
    <BrowserRouter>
      <div className="xp">
        {isLoggedIn && <Navbar user={user} viewMode={effectiveView} onToggleView={handleToggleView} />}
        <main className="xp-main">
        <Routes>
          <Route
            path="/auth/callback"
            element={<AuthCallback onLogin={handleLogin} />}
          />
          <Route
            path="/"
            element={
              isLoggedIn ? <Navigate to="/home" replace /> : <Landing onOpenAuth={openAuth} />
            }
          />
          <Route path="/home" element={<AuthGuard isLoggedIn={isLoggedIn}><Home /></AuthGuard>} />
          <Route path="/games" element={<AuthGuard isLoggedIn={isLoggedIn}><Games /></AuthGuard>} />
          <Route path="/resources" element={<AuthGuard isLoggedIn={isLoggedIn}><Resources /></AuthGuard>} />
          <Route path="/requests" element={<AuthGuard isLoggedIn={isLoggedIn}><StudentRequests user={user} /></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard isLoggedIn={isLoggedIn}><Profile user={user} onLogout={handleLogout} /></AuthGuard>} />
          {effectiveView === 'teacher' && (
            <>
              <Route path="/teacher/resources" element={<AuthGuard isLoggedIn={isLoggedIn}><TeacherResources /></AuthGuard>} />
              <Route path="/teacher/classes" element={<AuthGuard isLoggedIn={isLoggedIn}><TeacherClasses /></AuthGuard>} />
              <Route path="/teacher/quizzes" element={<AuthGuard isLoggedIn={isLoggedIn}><TeacherQuizzes /></AuthGuard>} />
              <Route path="/teacher/badges" element={<AuthGuard isLoggedIn={isLoggedIn}><TeacherBadges /></AuthGuard>} />
              <Route path="/teacher/students" element={<AuthGuard isLoggedIn={isLoggedIn}><TeacherStudents /></AuthGuard>} />
              <Route path="/teacher/admin" element={<AuthGuard isLoggedIn={isLoggedIn}><AdminUsers user={user} /></AuthGuard>} />
              <Route path="/teacher/requests" element={<AuthGuard isLoggedIn={isLoggedIn}><TeacherRequests /></AuthGuard>} />
            </>
          )}
          {effectiveView === 'student' && (
            <Route path="/teacher/*" element={<AuthGuard isLoggedIn={isLoggedIn}><Navigate to="/home" replace /></AuthGuard>} />
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </main>
      </div>

      {authMode && (
        <AuthModal mode={authMode} error={authError} onClose={() => { setAuthMode(null); setAuthError(null); }} onLogin={handleLogin} />
      )}
    </BrowserRouter>
  );
}
