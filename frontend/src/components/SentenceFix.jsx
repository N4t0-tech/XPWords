import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api/client';
import Toast from './Toast';
import Tutorial from './Tutorial';

const TIMER_SECONDS = 30;
const XP_PER_SENTENCE = 100;
const STREAK_BONUS_EVERY = 3;
const STREAK_BONUS_XP = 25;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SentenceFix({ onClose }) {
  const [status, setStatus] = useState('welcome');
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [words, setWords] = useState([]);
  const [slots, setSlots] = useState([]);
  const [pool, setPool] = useState([]);
  const [toast, setToast] = useState({ show: false, msg: '' });
  const [showTutorial, setShowTutorial] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const streakRef = useRef(0);
  const scoreSubmitted = useRef(false);
  const timerRef = useRef(null);
  const dragRef = useRef(null);
  const wordOrderRef = useRef([]);

  const showToast = useCallback((msg) => setToast({ show: true, msg }), []);

  useEffect(() => { streakRef.current = streak; }, [streak]);

  useEffect(() => {
    api.get('/words?gameType=sentencefix').then(data => {
      const parsed = data.map(w => ({
        ...w,
        options: typeof w.options === 'string' ? JSON.parse(w.options) : w.options,
      }));
      setWords(parsed);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (status === 'gameover' && !scoreSubmitted.current) {
      scoreSubmitted.current = true;
      api.post('/games/score', { gameType: 'sentencefix', score, streak: maxStreak, round: index + 1 })
        .then(() => window.dispatchEvent(new Event('user-updated')))
        .catch(() => {});
    }
  }, [status]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && status === 'playing') {
      clearTimer();
      setLives(p => p - 1);
      setStreak(0);
      showToast('¡Se acabó el tiempo!');
      if (lives - 1 <= 0) {
        setTimeout(() => setStatus('gameover'), 800);
      } else {
        setTimeout(nextSentence, 1500);
      }
    }
  }, [timeLeft]);

  useEffect(() => {
    if (lives <= 0 && status === 'playing') {
      const t = setTimeout(() => setStatus('gameover'), 800);
      return () => clearTimeout(t);
    }
  }, [lives, status]);

  function startTimer() {
    clearTimer();
    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) return 0;
        return t - 1;
      });
    }, 1000);
  }

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function initSentence() {
    if (words.length === 0) return;
    if (index >= wordOrderRef.current.length) {
      wordOrderRef.current = shuffle(words.map((_, i) => i));
    }
    const w = words[wordOrderRef.current[index % wordOrderRef.current.length]];
    const correctWords = w.word.split(' ').filter(Boolean);
    const wordIndices = correctWords.map((_, i) => i);
    setSlots(Array(correctWords.length).fill(null));
    setPool(shuffle(wordIndices));
    setSelectedWord(null);
    setSelectedSource(null);
    setShowResult(false);
    setLastResult(null);
    startTimer();
  }

  function checkAnswer() {
    const w = words[wordOrderRef.current[index % wordOrderRef.current.length]];
    const correctWords = w.word.split(' ').filter(Boolean);
    const correct = slots.every((s, i) => s !== null && s === i);
    if (correct) {
      const newStreak = streakRef.current + 1;
      let xpGain = XP_PER_SENTENCE;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      if (newStreak > 0 && newStreak % STREAK_BONUS_EVERY === 0) {
        xpGain += STREAK_BONUS_XP;
        showToast(`+${xpGain} XP (¡racha de ${newStreak}!)`);
      } else {
        showToast(`+${xpGain} XP`);
      }
      setScore(s => s + xpGain);
      setLastResult('correct');
      setShowResult(true);
      clearTimer();
      setTimeout(() => {
        setIndex(i => i + 1);
        initSentence();
      }, 1200);
    } else {
      setStreak(0);
      setLives(p => p - 1);
      showToast('¡Orden incorrecto!');
      setLastResult('wrong');
      setShowResult(true);
      setTimeout(() => {
        setShowResult(false);
        setLastResult(null);
        initSentence();
      }, 1500);
    }
  }

  function nextSentence() {
    setIndex(i => i + 1);
    initSentence();
  }

  function handleSelectFromPool(wordIdx) {
    if (showResult) return;
    if (selectedWord === null) {
      dragRef.current = { source: 'pool', index: wordIdx };
      setSelectedWord(wordIdx);
      setSelectedSource('pool');
    } else if (selectedSource === 'pool') {
      if (selectedWord === wordIdx) {
        setSelectedWord(null);
        setSelectedSource(null);
        dragRef.current = null;
      } else {
        dragRef.current = { source: 'pool', index: wordIdx };
        setSelectedWord(wordIdx);
        setSelectedSource('pool');
      }
    } else if (selectedSource === 'slot') {
      const slotIdx = selectedWord;
      setSlots(prev => {
        const next = [...prev];
        next[slotIdx] = wordIdx;
        return next;
      });
      setPool(prev => prev.filter(i => i !== wordIdx));
      setSelectedWord(null);
      setSelectedSource(null);
      dragRef.current = null;
    }
  }

  function handleSelectFromSlot(slotIdx) {
    if (showResult) return;
    if (slots[slotIdx] === null) {
      if (selectedWord !== null && selectedSource === 'pool') {
        setSlots(prev => {
          const next = [...prev];
          next[slotIdx] = selectedWord;
          return next;
        });
        setPool(prev => prev.filter(i => i !== selectedWord));
        setSelectedWord(null);
        setSelectedSource(null);
        dragRef.current = null;
      }
      return;
    }
    if (selectedWord === null) {
      dragRef.current = { source: 'slot', index: slotIdx };
      setSelectedWord(slotIdx);
      setSelectedSource('slot');
      setSlots(prev => {
        const next = [...prev];
        next[slotIdx] = null;
        return next;
      });
      setPool(prev => [...prev, slots[slotIdx]]);
    } else if (selectedSource === 'pool') {
      const poolWordIdx = selectedWord;
      const oldSlotWord = slots[slotIdx];
      setSlots(prev => {
        const next = [...prev];
        next[slotIdx] = poolWordIdx;
        return next;
      });
      setPool(prev => {
        const result = prev.filter(i => i !== poolWordIdx);
        result.push(oldSlotWord);
        return result;
      });
      setSelectedWord(null);
      setSelectedSource(null);
      dragRef.current = null;
    }
  }

  function startGame() {
    if (words.length === 0) return;
    scoreSubmitted.current = false;
    wordOrderRef.current = shuffle(words.map((_, i) => i));
    setStatus('playing');
    setIndex(0);
    setScore(0);
    setLives(3);
    setStreak(0);
    setMaxStreak(0);
    initSentence();
  }

  function retry() {
    scoreSubmitted.current = false;
    setStatus('welcome');
    clearTimer();
  }

  const wordIdx = wordOrderRef.current.length > 0 ? wordOrderRef.current[index % wordOrderRef.current.length] : index;
  const w = words.length > 0 ? words[wordIdx] : { word: '', hint: '', options: [] };
  const correctWords = w.word.split(' ').filter(Boolean);
  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const hearts = Array.from({ length: 3 }, (_, i) => i < lives);
  const allFilled = slots.every(s => s !== null);

  const fixSteps = [
    { icon: '🧩', title: 'Armá la oración', desc: 'Las palabras están desordenadas. Tenés que ordenarlas para formar la oración correcta en inglés.' },
    { icon: '👆', title: 'Seleccioná y colocá', desc: 'Tocá una palabra del panel de abajo para seleccionarla (se marca en verde). Después tocá un espacio vacío arriba para colocarla.' },
    { icon: '🔄', title: 'Mové las palabras', desc: 'Si te equivocaste, tocá una palabra ya colocada para devolverla al panel inferior y volver a intentar.' },
    { icon: '⏱️', title: 'Contrarreloj', desc: 'Tenés 30 segundos por oración. Si el tiempo llega a cero, pierdes una vida.' },
    { icon: '♥', title: 'Cuidá tus vidas', desc: 'Tenés 3 vidas. Perdés una al ordenar mal o al acabarse el tiempo.' },
    { icon: '🏆', title: 'Sumá puntos', desc: 'Cada oración correcta da +100 XP. Cada 3 aciertos consecutivos ganás +25 XP extra.' },
  ];

  if (status === 'welcome') {
    return (
      <>
        <div className="xp-mini-game" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', position: 'relative' }}>
          <button onClick={onClose} className="xp-modal-close" style={{ position: 'absolute', top: '12px', right: '14px' }} aria-label="Cerrar">✕</button>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧩</div>
          <div className="xp-mini-title">SentenceFix</div>
          <p className="xp-mini-sub" style={{ marginBottom: '1.5rem' }}>
            Ordená las palabras para formar la oración correcta.<br />
            30 segundos. 3 vidas.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button className="xp-btn-primary" onClick={startGame}>COMENZAR</button>
            <button className="xp-btn-secondary" onClick={() => setShowTutorial(true)}>¿CÓMO JUGAR?</button>
          </div>
        </div>
        {showTutorial && (
          <Tutorial
            steps={fixSteps}
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
            <div className="xp-gm-stat-lbl">Oraciones</div>
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
          Oración {index + 1}
        </div>
        <div className="xp-score-disp">Puntaje: <span>{score}</span></div>
      </div>

      <div className="xp-timer-bg">
        <div className="xp-timer-fill" style={{ width: `${timerPct}%`, background: timeLeft <= 10 ? '#f87171' : '#6ee7b7' }} />
      </div>

      <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '.8rem', textAlign: 'center' }}>
        {w.hint}
      </p>

      <div className="xp-sf-slots">
        {slots.map((slotContent, i) => (
          <div
            key={i}
            className={`xp-sf-slot${slotContent !== null ? ' filled' : ''}${selectedWord !== null && slotContent === null && selectedSource === 'pool' ? ' droppable' : ''}${showResult && lastResult === 'correct' ? ' correct' : ''}${showResult && lastResult === 'wrong' ? ' wrong' : ''}`}
            onClick={() => handleSelectFromSlot(i)}
            draggable={slotContent !== null}
            onDragStart={slotContent !== null ? (e) => {
              dragRef.current = { source: 'slot', index: slotContent, slotIndex: i };
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', i.toString());
            } : undefined}
            onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
            onDrop={e => {
              e.preventDefault();
              const src = dragRef.current;
              if (!src || slotContent !== null) return;
              if (src.source === 'pool') {
                setSlots(prev => { const n = [...prev]; n[i] = src.index; return n; });
                setPool(prev => prev.filter(idx => idx !== src.index));
              } else if (src.source === 'slot' && src.slotIndex !== i) {
                setSlots(prev => { const n = [...prev]; n[i] = n[src.slotIndex]; n[src.slotIndex] = null; return n; });
              }
              setSelectedWord(null);
              setSelectedSource(null);
              dragRef.current = null;
            }}
          >
            {slotContent !== null ? (
              <span className="xp-sf-word">{w.options[slotContent] || correctWords[slotContent]}</span>
            ) : (
              <span className="xp-sf-slot-num">{i + 1}</span>
            )}
          </div>
        ))}
      </div>

      <div
        className="xp-sf-pool"
        onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
        onDrop={e => {
          e.preventDefault();
          const src = dragRef.current;
          if (!src) return;
          if (src.source === 'slot') {
            setSlots(prev => { const n = [...prev]; n[src.slotIndex] = null; return n; });
            setPool(prev => [...prev, src.index]);
          }
          setSelectedWord(null);
          setSelectedSource(null);
          dragRef.current = null;
        }}
      >
        {pool.map(wordIdx => (
          <div
            key={wordIdx}
            className={`xp-sf-tile${selectedWord === wordIdx && selectedSource === 'pool' ? ' selected' : ''}`}
            draggable
            onClick={() => handleSelectFromPool(wordIdx)}
            onDragStart={e => {
              dragRef.current = { source: 'pool', index: wordIdx };
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', wordIdx.toString());
            }}
          >
            {w.options[wordIdx] || correctWords[wordIdx]}
          </div>
        ))}
      </div>

      <div className="xp-game-footer">
        {allFilled && !showResult && (
          <button className="xp-btn-primary" onClick={checkAnswer}>VERIFICAR ✓</button>
        )}
      </div>

      <Toast message={toast.msg} show={toast.show} onClose={() => setToast({ show: false, msg: '' })} />
    </div>
  );
}
