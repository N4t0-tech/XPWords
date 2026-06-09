import { useState } from 'react';
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
import './App.css';

export default function App() {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState(null);

  function handleLogin() {
    setLoggedIn(true);
    setAuthMode(null);
  }

  return (
    <BrowserRouter>
      <div className="xp">
        {isLoggedIn && <Navbar />}
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? <Navigate to="/home" replace /> : <Landing onOpenAuth={setAuthMode} />
            }
          />
          <Route path="/home" element={<AuthGuard isLoggedIn={isLoggedIn}><Home /></AuthGuard>} />
          <Route path="/games" element={<AuthGuard isLoggedIn={isLoggedIn}><Games /></AuthGuard>} />
          <Route path="/resources" element={<AuthGuard isLoggedIn={isLoggedIn}><Resources /></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard isLoggedIn={isLoggedIn}><Profile /></AuthGuard>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {authMode && (
        <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onLogin={handleLogin} />
      )}
    </BrowserRouter>
  );
}
