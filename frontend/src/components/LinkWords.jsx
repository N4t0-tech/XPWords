import { useState, useEffect, useRef, useCallback } from 'react';
import { words } from '../data/mock';
import Toast from './Toast';
import Tutorial from './Tutorial';

const ROUND_TIME = 60;
const PAIRS_PER_ROUND = 4;
const XP_PER_MATCH = 75;
const BONUS_XP = 50;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LinkWords({ onClose }) {
  const [status, setStatus] = useState('welcome');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [totalPairs, setTotalPairs] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [toast, setToast] = useState({ show: false, msg: '' });
  const [showTutorial, setShowTutorial] = useState(false);

  const [pairs, setPairs] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [selectedDef, setSelectedDef] = useState(null);
  const [wrongDef, setWrongDef] = useState(null);
  const [wrongWord, setWrongWord] = useState(null);
  const [roundStarted, setRoundStarted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [roundErrors, setRoundErrors] = useState(0);

  const usedIndices = useRef(new Set());
  const timerRef = useRef(null);
  const streakRef = useRef(0);

  const showToast = useCallback((msg) => setToast({ show: true, msg }), []);

  useEffect(() => { streakRef.current = streak; }, [streak]);

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function generateRound() {
    const available = [];
    for (let i = 0; i < words.length; i++) {
      if (!usedIndices.current.has(i)) available.push(i);
    }
    if (available.length < PAIRS_PER_ROUND) {
      usedIndices.current.clear();
      return generateRound();
    }
    const chosen = shuffle(available).slice(0, PAIRS_PER_ROUND);
    chosen.forEach(i => usedIndices.current.add(i));

    const newPairs = chosen.map(i => ({
      id: i,
      definition: words[i].options[words[i].correct],
      word: words[i].word,
    }));

    setPairs(newPairs);
    setShuffledWords(shuffle(newPairs.map(p => ({ id: p.id, word: p.word }))));
    setMatched(new Set());
    setSelectedDef(null);
    setRoundErrors(0);
    setTimeLeft(ROUND_TIME);
    setRoundStarted(true);
    startTimer();
  }

  function startTimer() {
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearTimer();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    if (timeLeft === 0 && status === 'playing' && roundStarted && matched.size < PAIRS_PER_ROUND) {
      setRoundStarted(false);
      setStatus('gameover');
    }
  }, [timeLeft, status, roundStarted, matched.size]);

  useEffect(() => {
    return () => clearTimer();
  }, []);

  function handleSelectDef(idx) {
    if (matched.has(idx) || status !== 'playing') return;
    setSelectedDef(idx);
  }

  function handleSelectWord(wordIdx) {
    if (selectedDef === null || status !== 'playing') return;
    const def = pairs[selectedDef];
    const word = shuffledWords[wordIdx];

    if (def.id === word.id) {
      setMatched(prev => new Set([...prev, selectedDef]));
      setSelectedDef(null);
      setScore(s => s + XP_PER_MATCH);
      setTotalPairs(t => t + 1);
      const newStreak = streakRef.current + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      showToast(`+${XP_PER_MATCH} XP`);

      if (matched.size + 1 >= PAIRS_PER_ROUND) {
        clearTimer();
        setTimeout(() => {
          let bonus = roundErrors === 0 ? BONUS_XP : 0;
          if (bonus) {
            setScore(s => s + bonus);
            showToast(`¡Ronda completa! +${bonus} XP bonus`);
          }
          setTimeout(() => {
            setRound(r => r + 1);
            generateRound();
          }, 800);
        }, 300);
      }
    } else {
      setWrongDef(selectedDef);
      setWrongWord(wordIdx);
      setStreak(0);
      setRoundErrors(e => e + 1);
      setLives(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setTimeout(() => setStatus('gameover'), 600);
        }
        return next;
      });
      showToast('¡No coinciden!');
      setTimeout(() => {
        setWrongDef(null);
        setWrongWord(null);
        setSelectedDef(null);
      }, 500);
    }
  }

  function startGame() {
    usedIndices.current.clear();
    setStatus('playing');
    setRound(1);
    setScore(0);
    setLives(3);
    setTotalPairs(0);
    setMaxStreak(0);
    setStreak(0);
    generateRound();
  }

  function retry() {
    setStatus('welcome');
    clearTimer();
  }

const linkSteps = [
  { icon: '🔗', title: 'Conectá definiciones', desc: 'Del lado izquierdo ves definiciones en español. Del lado derecho, palabras en inglés. Tu tarea es conectarlas.' },
  { icon: '👆', title: 'Seleccioná primero', desc: 'Tocá una definición de la izquierda para seleccionarla. Se marca con un borde verde.' },
  { icon: '🤝', title: 'Emparejala', desc: 'Después de seleccionar la definición, tocá la palabra en inglés que creas que corresponde. Si aciertas, se marca como completada.' },
  { icon: '⏱️', title: 'Contrarreloj', desc: 'Tienes 60 segundos por ronda para completar los 4 pares. Si el tiempo llega a cero, el juego termina.' },
  { icon: '♥', title: 'Cuidá tus vidas', desc: 'Tienes 3 vidas. Cada error te cuesta una vida. ¡Si las pierdes todas, se acabó!' },
  { icon: '🏆', title: 'Bonus por ronda perfecta', desc: 'Si completas los 4 pares sin errores, ganas +50 XP extra. ¡Intenta ser perfecto!' },
];

  if (status === 'welcome') {
    return (
      <>
      <div className="xp-mini-game" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', position: 'relative' }}>
        <button onClick={onClose} className="xp-modal-close" style={{ position: 'absolute', top: '12px', right: '14px' }} aria-label="Cerrar">✕</button>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
        <div className="xp-mini-title">LinkWords</div>
        <p className="xp-mini-sub" style={{ marginBottom: '1.5rem' }}>
          Conecta cada definición con su palabra en inglés.<br />
          4 pares por ronda. 60 segundos. 3 vidas.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button className="xp-btn-primary" onClick={startGame}>COMENZAR</button>
          <button className="xp-btn-secondary" onClick={() => setShowTutorial(true)}>¿CÓMO JUGAR?</button>
        </div>
      </div>
      {showTutorial && (
        <Tutorial
          steps={linkSteps}
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
            <div className="xp-gm-stat-val">{totalPairs}</div>
            <div className="xp-gm-stat-lbl">Matches</div>
          </div>
          <div className="xp-gm-stat">
            <div className="xp-gm-stat-val">{maxStreak}</div>
            <div className="xp-gm-stat-lbl">Mejor racha</div>
          </div>
        </div>
        <button className="xp-btn-primary" onClick={retry}>JUGAR DE NUEVO</button>
      </div>
    );
  }

  const timerPct = (timeLeft / ROUND_TIME) * 100;
  const hearts = Array.from({ length: 3 }, (_, i) => i < lives);

  return (
    <div className="xp-mini-game">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.5rem' }}>
        <div className="xp-lives">
          {hearts.map((alive, i) => (
            <span key={i} className={`xp-heart${alive ? '' : ' lost'}`}>♥</span>
          ))}
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: "'Rajdhani',sans-serif", fontWeight: 600 }}>
          Ronda {round}
        </div>
        <div className="xp-score-disp">Puntaje: <span>{score}</span></div>
      </div>

      <div className="xp-timer-bg">
        <div className="xp-timer-fill" style={{ width: `${timerPct}%`, background: timeLeft <= 10 ? '#f87171' : '#6ee7b7' }} />
      </div>

      <p style={{ fontSize: '12px', color: '#4b5563', marginBottom: '.8rem', textAlign: 'center' }}>
        Selecciona una definición y luego su palabra en inglés
      </p>

      <div className="xp-link-grid">
        <div className="xp-link-col">
          {pairs.map((p, i) => (
            <button
              key={p.id}
              className={`xp-link-item${matched.has(i) ? ' matched' : ''}${selectedDef === i ? ' selected' : ''}${wrongDef === i ? ' wrong' : ''}`}
              onClick={() => handleSelectDef(i)}
              disabled={matched.has(i)}
            >
              <span className="xp-link-num">{i + 1}</span>
              <span>{p.definition}</span>
            </button>
          ))}
        </div>

        <div className="xp-link-col">
          {shuffledWords.map((w, i) => {
            const isMatched = pairs.findIndex(p => p.id === w.id && matched.has(pairs.findIndex(p2 => p2.id === w.id))) !== -1;
            return (
              <button
                key={`${w.id}-${i}`}
                className={`xp-link-item${isMatched ? ' matched' : ''}${wrongWord === i ? ' wrong' : ''}`}
                onClick={() => handleSelectWord(i)}
                disabled={isMatched}
              >
                {w.word}
              </button>
            );
          })}
        </div>
      </div>

      <Toast message={toast.msg} show={toast.show} onClose={() => setToast({ show: false, msg: '' })} />
    </div>
  );
}
