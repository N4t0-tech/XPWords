import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api/client';
import Toast from './Toast';
import Tutorial from './Tutorial';

const TIMER_SECONDS = 12;
const IDLE_TIMEOUT = 20000;
const XP_PER_WORD = 80;
const STREAK_BONUS_EVERY = 3;
const STREAK_BONUS_XP = 25;

export default function ListenUp({ onClose }) {
  const [status, setStatus] = useState('welcome');
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [lastPick, setLastPick] = useState(null);
  const [words, setWords] = useState([]);
  const [toast, setToast] = useState({ show: false, msg: '' });
  const [showTutorial, setShowTutorial] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const answeredRef = useRef(false);
  const intervalRef = useRef(null);
  const scoreSubmitted = useRef(false);
  const timerStartedRef = useRef(false);
  const wordOrderRef = useRef([]);

  const showToast = useCallback((msg) => setToast({ show: true, msg }), []);

  useEffect(() => { answeredRef.current = answered; }, [answered]);

  useEffect(() => {
    if (lives <= 0 && status === 'playing') {
      const t = setTimeout(() => setStatus('gameover'), 800);
      return () => clearTimeout(t);
    }
  }, [lives, status]);

  useEffect(() => {
    if (status === 'gameover' && !scoreSubmitted.current) {
      scoreSubmitted.current = true;
      api.post('/games/score', { gameType: 'listenup', score, streak: maxStreak, round: index + 1 })
        .then(() => window.dispatchEvent(new Event('user-updated')))
        .catch(() => {});
    }
  }, [status]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && status === 'playing' && !answeredRef.current && timerStartedRef.current) {
      handleTimeout();
    }
  }, [timeLeft, status]);

  useEffect(() => {
    if (status !== 'playing') return;
    timerStartedRef.current = false;
    clearTimer();
    setTimeLeft(TIMER_SECONDS);
    const idleTimer = setTimeout(() => {
      if (!timerStartedRef.current && !answeredRef.current) {
        showToast('¡Tocá el parlante para escuchar!');
        setTimeout(() => {
          if (!timerStartedRef.current && !answeredRef.current) {
            handleTimeout();
          }
        }, 5000);
      }
    }, IDLE_TIMEOUT);
    return () => clearTimeout(idleTimer);
  }, [status, index]);

  useEffect(() => {
    api.get('/words?gameType=listenup').then(data => {
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

  function handleTimeout() {
    if (answeredRef.current) return;
    setAnswered(true);
    setStreak(0);
    setLives(prev => prev - 1);
    showToast('¡Se acabó el tiempo!');
  }

  function speak(text) {
    if (!window.speechSynthesis) {
      showToast('Tu navegador no soporta texto a voz');
      return;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setHasPlayed(true);
  }

  function handlePlay() {
    if (words.length === 0) return;
    if (!timerStartedRef.current) {
      timerStartedRef.current = true;
      startTimer();
    }
    speak(words[wordOrderRef.current[index % wordOrderRef.current.length]].word);
  }

  function handleAnswer(i) {
    if (answeredRef.current) return;
    clearTimer();
    window.speechSynthesis.cancel();
    setLastPick(i);
    setAnswered(true);

    if (i === words[wordOrderRef.current[index % wordOrderRef.current.length]].correct) {
      const newStreak = streak + 1;
      let xpGain = XP_PER_WORD;
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
    const next = index + 1;
    if (next >= wordOrderRef.current.length) {
      wordOrderRef.current = shuffle(words.map((_, i) => i));
    }
    setIndex(next);
    setAnswered(false);
    setLastPick(null);
    setHasPlayed(false);
  }

  function startGame() {
    if (words.length === 0) return;
    wordOrderRef.current = shuffle(words.map((_, i) => i));
    setStatus('playing');
    setIndex(0);
    setScore(0);
    setLives(3);
    setStreak(0);
    setMaxStreak(0);
    setAnswered(false);
    setLastPick(null);
    setHasPlayed(false);
  }

  function retry() {
    scoreSubmitted.current = false;
    setStatus('welcome');
    clearTimer();
  }

  const wordIdx = wordOrderRef.current.length > 0 ? wordOrderRef.current[index % wordOrderRef.current.length] : index;
  const w = words.length > 0 ? words[wordIdx] : { word: '', hint: '', options: [], correct: 0 };
  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const hearts = Array.from({ length: 3 }, (_, i) => i < lives);

  const listenSteps = [
    { icon: '👂', title: 'Escuchá la palabra', desc: 'Aparece un ícono de parlante. Tocálo para escuchar la palabra en inglés.' },
    { icon: '🔊', title: 'Repetí si es necesario', desc: 'Podés escuchar la palabra todas las veces que quieras antes de responder.' },
    { icon: '⏱️', title: 'Corre contra el tiempo', desc: 'El temporizador arranca cuando escuchás la palabra por primera vez. Tenés 12 segundos para responder.' },
    { icon: '♥', title: 'Cuidá tus vidas', desc: 'Tenés 3 vidas. Cada error o tiempo agotado te cuesta una vida.' },
    { icon: '🔥', title: 'Armá rachas', desc: 'Cada 3 aciertos consecutivos ganás +25 XP extra.' },
    { icon: '🏆', title: 'Sumá puntos', desc: 'Cada acierto da +80 XP. ¡Escuchá con atención! Las palabras pueden sonar similares.' },
  ];

  if (status === 'welcome') {
    return (
      <>
        <div className="xp-mini-game" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', position: 'relative' }}>
          <button onClick={onClose} className="xp-modal-close" style={{ position: 'absolute', top: '12px', right: '14px' }} aria-label="Cerrar">✕</button>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👂</div>
          <div className="xp-mini-title">ListenUp</div>
          <p className="xp-mini-sub" style={{ marginBottom: '1.5rem' }}>
            Escuchá la palabra en inglés y elegí la opción correcta.<br />
            12 segundos. 3 vidas.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button className="xp-btn-primary" onClick={startGame}>COMENZAR</button>
            <button className="xp-btn-secondary" onClick={() => setShowTutorial(true)}>¿CÓMO JUGAR?</button>
          </div>
        </div>
        {showTutorial && (
          <Tutorial
            steps={listenSteps}
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
        <button onClick={onClose} className="xp-modal-close" style={{ position: 'absolute', top: '12px', right: '14px' }} aria-label="Cerrar">✕</button>
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
        <div style={{ fontSize: '13px', color: '#6b7280', fontFamily: "'Rajdhani',sans-serif", fontWeight: 600 }}>
          Palabra {index + 1}
        </div>
        <div className="xp-score-disp">Puntaje: <span>{score}</span></div>
      </div>

      <div className="xp-timer-bg">
        <div className="xp-timer-fill" style={{ width: `${timerPct}%`, background: timeLeft <= 10 ? '#f87171' : '#6ee7b7' }} />
      </div>

      <div className={`xp-lu-speaker${isPlaying ? ' playing' : ''}`} onClick={handlePlay}>
        <span className="xp-lu-speaker-icon">{isPlaying ? '🔊' : '🔇'}</span>
        <div style={{ fontSize: '16px', color: '#e2e8f0', fontWeight: 600, marginBottom: '.3rem' }}>
          {hasPlayed ? 'VOLVER A ESCUCHAR' : 'TOCÁ PARA ESCUCHAR'}
        </div>
        <div className="xp-lu-speaker-hint">{w.hint}</div>
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

      <Toast message={toast.msg} show={toast.show} onClose={() => setToast({ show: false, msg: '' })} />
    </div>
  );
}
