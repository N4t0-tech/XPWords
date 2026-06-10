import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api/client';
import Toast from './Toast';
import Tutorial from './Tutorial';

const TIMER_SECONDS = 10;
const STREAK_BONUS_EVERY = 3;
const STREAK_BONUS_XP = 25;

export default function MiniGame({ onClose }) {
  const [status, setStatus] = useState('welcome');
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [lastPick, setLastPick] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [toast, setToast] = useState({ show: false, msg: '' });
  const [showTutorial, setShowTutorial] = useState(false);
  const [words, setWords] = useState([]);

  const answeredRef = useRef(false);
  const intervalRef = useRef(null);
  const scoreSubmitted = useRef(false);

  const showToast = useCallback((msg) => {
    setToast({ show: true, msg });
  }, []);

  useEffect(() => {
    answeredRef.current = answered;
  }, [answered]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (lives <= 0 && status === 'playing') {
      const t = setTimeout(() => setStatus('gameover'), 800);
      return () => clearTimeout(t);
    }
  }, [lives, status]);

  useEffect(() => {
    if (status === 'gameover' && !scoreSubmitted.current) {
      scoreSubmitted.current = true;
      api.post('/games/score', { gameType: 'wordsnap', score, streak: maxStreak, round: index + 1 })
        .then(() => window.dispatchEvent(new Event('user-updated')))
        .catch(() => {});
    }
  }, [status]);

  const handleTimeout = useCallback(() => {
    if (answeredRef.current) return;
    setAnswered(true);
    setStreak(0);
    setLives(prev => prev - 1);
    showToast('¡Se acabó el tiempo!');
  }, [showToast]);

  useEffect(() => {
    if (timeLeft === 0 && status === 'playing' && !answeredRef.current) {
      handleTimeout();
    }
  }, [timeLeft, status, handleTimeout]);

  useEffect(() => {
    api.get('/words').then(data => {
      const parsed = data.map(w => ({
        ...w,
        options: typeof w.options === 'string' ? JSON.parse(w.options) : w.options,
        correct: w.correctIndex,
      }));
      setWords(parsed);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  function startTimer() {
    setTimeLeft(TIMER_SECONDS);
    clearTimer();
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) return 0;
        return t - 1;
      });
    }, 1000);
  }

  function handleAnswer(i) {
    if (answeredRef.current) return;
    clearTimer();
    setLastPick(i);
    setAnswered(true);

    if (i === words[index % words.length].correct) {
      const newStreak = streak + 1;
      let xpGain = 50;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      if (newStreak > 0 && newStreak % STREAK_BONUS_EVERY === 0) {
        xpGain += STREAK_BONUS_XP;
        setScore(s => s + xpGain);
        showToast(`+${xpGain} XP (¡racha de ${newStreak}!)`);
      } else {
        setScore(s => s + xpGain);
        showToast(`+${xpGain} XP`);
      }
    } else {
      setStreak(0);
      setLives(prev => prev - 1);
      showToast('¡Respuesta incorrecta!');
    }
  }

  function nextWord() {
    if (lives <= 0) return;
    setIndex(i => i + 1);
    setAnswered(false);
    setLastPick(null);
    startTimer();
  }

  function startGame() {
    if (words.length === 0) return;
    setStatus('playing');
    setIndex(0);
    setScore(0);
    setLives(3);
    setStreak(0);
    setMaxStreak(0);
    setAnswered(false);
    setLastPick(null);
    startTimer();
  }

  function retry() {
    scoreSubmitted.current = false;
    setStatus('welcome');
    clearTimer();
  }

  const w = words.length > 0 ? words[index % words.length] : { word: '', hint: '', options: [], correct: 0 };
  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const hearts = Array.from({ length: 3 }, (_, i) => i < lives);

  if (status === 'welcome') {
    return (
      <>
      <div className="xp-mini-game" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '12px', right: '14px', background: 'none', border: 'none',
            color: '#4b5563', fontSize: '18px', cursor: 'pointer', fontFamily: "'Inter',sans-serif",
          }}
          aria-label="Cerrar"
        >
          ✕
        </button>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
        <div className="xp-mini-title">WordSnap</div>
        <p className="xp-mini-sub" style={{ marginBottom: '1.5rem' }}>
          Adivina el significado de cada palabra antes de que se acabe el tiempo.<br />
          Tienes 3 vidas. ¡Cada 3 aciertos consecutivos ganas XP extra!
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button className="xp-btn-primary" onClick={startGame}>COMENZAR</button>
          <button className="xp-btn-secondary" onClick={() => setShowTutorial(true)}>¿CÓMO JUGAR?</button>
        </div>
      </div>
      {showTutorial && (
        <Tutorial
          onClose={() => setShowTutorial(false)}
          onStart={() => { setShowTutorial(false); startGame(); }}
        />
      )}
      </>
    );
  }

  if (status === 'gameover') {
    return (
      <div className="xp-mini-game" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '12px', right: '14px', background: 'none', border: 'none',
            color: '#4b5563', fontSize: '18px', cursor: 'pointer', fontFamily: "'Inter',sans-serif",
          }}
          aria-label="Cerrar"
        >
          ✕
        </button>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💀</div>
        <div className="xp-mini-title" style={{ color: '#f87171', marginBottom: '1.5rem' }}>GAME OVER</div>
        <div className="xp-gm-stats">
          <div className="xp-gm-stat">
            <div className="xp-gm-stat-val">{score}</div>
            <div className="xp-gm-stat-lbl">XP ganado</div>
          </div>
          <div className="xp-gm-stat">
            <div className="xp-gm-stat-val">{index + 1}</div>
            <div className="xp-gm-stat-lbl">Palabras</div>
          </div>
          <div className="xp-gm-stat">
            <div className="xp-gm-stat-val">{maxStreak}</div>
            <div className="xp-gm-stat-lbl">Mejor racha</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button className="xp-btn-primary" onClick={retry}>JUGAR DE NUEVO</button>
        </div>
      </div>
    );
  }

  return (
    <div className="xp-mini-game">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.5rem' }}>
        <div className="xp-lives">
          {hearts.map((alive, i) => (
            <span key={i} className={`xp-heart${alive ? '' : ' lost'}`}>♥</span>
          ))}
        </div>
        <div className="xp-streak">
          {streak > 0 && (
            <span>🔥 {streak}{streak > 0 && streak % STREAK_BONUS_EVERY === 0 ? ' ¡BONUS!' : ''}</span>
          )}
        </div>
      </div>

      <div className="xp-timer-bg">
        <div className="xp-timer-fill" style={{ width: `${timerPct}%` }} />
      </div>

      <div className="xp-word-display">
        <div className="xp-word">{w.word}</div>
        <div className="xp-word-hint">{w.hint}</div>
      </div>

      <div className="xp-options">
        {w.options.map((o, i) => {
          let cls = 'xp-opt';
          if (answered) {
            if (i === w.correct) cls += ' correct';
            else if (i === lastPick) cls += ' wrong';
          }
          return (
            <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={answered}>
              {o}
            </button>
          );
        })}
      </div>

      <div className="xp-game-footer">
        <div className="xp-score-disp">Puntaje: <span>{score}</span></div>
        {answered && lives > 0 && (
          <button className="xp-next-btn" onClick={nextWord}>SIGUIENTE →</button>
        )}
        {answered && lives <= 0 && (
          <button className="xp-btn-primary" onClick={() => setStatus('gameover')}>VER RESULTADOS</button>
        )}
      </div>

      <Toast
        message={toast.msg}
        show={toast.show}
        onClose={() => setToast({ show: false, msg: '' })}
      />
    </div>
  );
}
