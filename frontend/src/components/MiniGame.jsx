import { useState } from 'react';
import { words } from '../data/mock';

export default function MiniGame() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [lastPick, setLastPick] = useState(null);

  const w = words[index % words.length];

  function handleAnswer(i) {
    if (answered) return;
    setLastPick(i);
    setAnswered(true);
    if (i === w.correct) {
      setScore(s => s + 50);
    }
  }

  function next() {
    setIndex(i => i + 1);
    setAnswered(false);
    setLastPick(null);
  }

  return (
    <div className="xp-mini-game" id="mini-game">
      <div className="xp-mini-title">
        WordSnap <span style={{ fontSize: '14px', color: '#4b5563', fontFamily: "'Inter',sans-serif", fontWeight: 400 }}>— ¿Qué significa?</span>
      </div>
      <p className="xp-mini-sub">Seleccioná la traducción correcta</p>
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
        <button className="xp-next-btn" onClick={next}>SIGUIENTE →</button>
      </div>
    </div>
  );
}
