import { useSearchParams } from 'react-router-dom';

export default function Landing({ onOpenAuth }) {
  const [searchParams] = useSearchParams();
  const discordError = searchParams.get('discord_error');

  if (discordError) {
    window.history.replaceState({}, '', '/');
    setTimeout(() => onOpenAuth({ mode: 'login', error: 'Inicio de sesión con Discord cancelado' }), 0);
  }

  return (
    <div className="xp-body">
      <div className="xp-landing">
        <div className="xp-landing-hero">
          <div className="xp-landing-badge">Beta</div>
          <div className="xp-landing-title">
            Sube de nivel<br />en <span>inglés</span>
          </div>
          <p className="xp-landing-sub">
            Clases, minijuegos y recursos para la comunidad del servidor.<br />
            Cada clase y juego te da XP real. ¿Hasta qué nivel llegas?
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

        <div className="xp-landing-features">
          <div className="xp-landing-feature">
            <div className="xp-landing-feat-icon">🎮</div>
            <div className="xp-landing-feat-title">Minijuegos</div>
            <p className="xp-landing-feat-desc">WordSnap, LinkWords y más desafíos para practicar vocabulario.</p>
          </div>
          <div className="xp-landing-feature">
            <div className="xp-landing-feat-icon">📚</div>
            <div className="xp-landing-feat-title">Recursos</div>
            <p className="xp-landing-feat-desc">Flashcards, guías y ejercicios creados por la comunidad.</p>
          </div>
          <div className="xp-landing-feature">
            <div className="xp-landing-feat-icon">🏆</div>
            <div className="xp-landing-feat-title">Leaderboard</div>
            <p className="xp-landing-feat-desc">Competí con otros estudiantes y llegá al top del ranking.</p>
          </div>
          <div className="xp-landing-feature">
            <div className="xp-landing-feat-icon">🎙️</div>
            <div className="xp-landing-feat-title">Clases en vivo</div>
            <p className="xp-landing-feat-desc">Ganá XP por participar en las llamadas de voz del servidor.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
