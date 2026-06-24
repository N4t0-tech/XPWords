import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export default function Landing({ onOpenAuth }) {
  const [searchParams] = useSearchParams();
  const [stats, setStats] = useState(null);
  const discordError = searchParams.get('discord_error');

  useEffect(() => {
    api.get('/stats').then(setStats).catch(() => {});
  }, []);

  if (discordError) {
    window.history.replaceState({}, '', '/');
    const msg = discordError === 'account_disabled'
      ? 'Tu cuenta ha sido desactivada'
      : 'Inicio de sesión con Discord cancelado';
    setTimeout(() => onOpenAuth({ mode: 'login', error: msg }), 0);
  }

  return (
    <div className="xp-body">
      <div className="xp-landing">
        <div className="xp-landing-hero">
          <div className="xp-landing-logo">XP<span>Words</span></div>
          <div className="xp-landing-title">
            Sube de nivel<br />en <span>inglés</span>
          </div>
          <p className="xp-landing-sub">
            Clases, minijuegos y recursos para la comunidad.<br />
            Cada actividad te da XP real. ¿Hasta dónde llegarás?
          </p>
          <div className="xp-landing-cta">
            <button className="xp-btn-primary" onClick={() => onOpenAuth('register')}>
              CREAR CUENTA
            </button>
            <button className="xp-btn-secondary" onClick={() => onOpenAuth('login')}>
              INICIAR SESIÓN
            </button>
          </div>
        </div>

        <div className="xp-landing-section">
          <h2 className="xp-landing-section-title">Cómo funciona</h2>
          <div className="xp-landing-steps">
            <div className="xp-landing-step">
              <div className="xp-landing-step-num">1</div>
              <div className="xp-landing-step-title">Asiste a clase</div>
              <p className="xp-landing-step-desc">Participa en las clases por voz del servidor y gana XP.</p>
            </div>
            <div className="xp-landing-step-arrow">→</div>
            <div className="xp-landing-step">
              <div className="xp-landing-step-num">2</div>
              <div className="xp-landing-step-title">Juega minijuegos</div>
              <p className="xp-landing-step-desc">Practica con WordSnap, LinkWords y más desafíos.</p>
            </div>
            <div className="xp-landing-step-arrow">→</div>
            <div className="xp-landing-step">
              <div className="xp-landing-step-num">3</div>
              <div className="xp-landing-step-title">Sube de nivel</div>
              <p className="xp-landing-step-desc">Acumula XP y compite en el leaderboard.</p>
            </div>
          </div>
        </div>

        <div className="xp-landing-section">
          <h2 className="xp-landing-section-title">Minijuegos</h2>
          <div className="xp-landing-games">
            <div className="xp-landing-game">
              <span className="xp-landing-game-icon">🎯</span>
              <div className="xp-landing-game-name">WordSnap</div>
              <div className="xp-landing-game-diff diff-easy">FÁCIL</div>
            </div>
            <div className="xp-landing-game">
              <span className="xp-landing-game-icon">🔗</span>
              <div className="xp-landing-game-name">LinkWords</div>
              <div className="xp-landing-game-diff diff-med">MEDIO</div>
            </div>
            <div className="xp-landing-game">
              <span className="xp-landing-game-icon">🧩</span>
              <div className="xp-landing-game-name">SentenceFix</div>
              <div className="xp-landing-game-diff diff-hard">DIFÍCIL</div>
            </div>
            <div className="xp-landing-game">
              <span className="xp-landing-game-icon">👂</span>
              <div className="xp-landing-game-name">ListenUp</div>
              <div className="xp-landing-game-diff diff-med">MEDIO</div>
            </div>
          </div>
        </div>

        <div className="xp-landing-section">
          <div className="xp-landing-stats">
            <div className="xp-landing-stat">
              <div className="xp-landing-stat-val">{stats ? stats.activeMembers : '...'}</div>
              <div className="xp-landing-stat-lbl">Estudiantes activos</div>
            </div>
            <div className="xp-landing-stat">
              <div className="xp-landing-stat-val">{stats ? stats.games : '...'}</div>
              <div className="xp-landing-stat-lbl">Minijuegos</div>
            </div>
            <div className="xp-landing-stat">
              <div className="xp-landing-stat-val">{stats ? stats.resources : '...'}</div>
              <div className="xp-landing-stat-lbl">Recursos</div>
            </div>
          </div>
        </div>

        <div className="xp-landing-section xp-landing-cta-section">
          <h2 className="xp-landing-section-title">¿Listo para subir de nivel?</h2>
          <p className="xp-landing-sub">Crea tu cuenta gratis y empieza a ganar XP hoy.</p>
          <button className="xp-btn-primary" onClick={() => onOpenAuth('register')}>
            CREAR CUENTA GRATIS
          </button>
        </div>
      </div>
    </div>
  );
}
