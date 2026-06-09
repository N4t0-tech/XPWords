import { useState } from 'react';

const steps = [
  {
    icon: '🎯',
    title: 'Leé la palabra',
    desc: 'En el centro vas a ver una palabra en inglés con su tipo (adjetivo, verbo, etc.).',
  },
  {
    icon: '⏱️',
    title: 'Corre contra el tiempo',
    desc: 'Tenés 10 segundos para responder. La barra verde muestra cuánto tiempo te queda.',
  },
  {
    icon: '♥',
    title: 'Cuidá tus vidas',
    desc: 'Tenés 3 vidas. Perdés una al responder mal o si se acaba el tiempo. ¡3 fallos y se termina!',
  },
  {
    icon: '🔥',
    title: 'Armá rachas',
    desc: 'Cada 3 aciertos consecutivos ganás +25 XP extra. ¡Intentá no fallar!',
  },
  {
    icon: '🏆',
    title: 'Sumá puntos',
    desc: 'Cada acierto da +50 XP. Al perder todas las vidas ves tu puntaje final y podés volver a intentar.',
  },
];

export default function Tutorial({ onClose, onStart }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="xp-mini-game"
        style={{
          maxWidth: '420px', width: '100%', padding: '0',
          position: 'relative', textAlign: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        <Carousel onClose={onClose} onStart={onStart} />
      </div>
    </div>
  );
}

function Carousel({ onClose, onStart }) {
  const [step, setStep] = useState(0);
  const s = steps[step];

  return (
    <div style={{ padding: '2rem 1.5rem 1.5rem' }}>
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '12px', right: '14px',
          background: 'none', border: 'none', color: '#4b5563',
          fontSize: '18px', cursor: 'pointer', fontFamily: "'Inter',sans-serif",
        }}
        aria-label="Cerrar tutorial"
      >
        ✕
      </button>

      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{s.icon}</div>
      <div className="xp-mini-title" style={{ marginBottom: '.5rem' }}>{s.title}</div>
      <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: 1.6, marginBottom: '1.5rem' }}>
        {s.desc}
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '1.2rem' }}>
        {steps.map((_, i) => (
          <div
            key={i}
            style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: i === step ? '#6ee7b7' : '#1c2030',
              transition: 'background .2s',
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        {step > 0 && (
          <button className="xp-btn-secondary" onClick={() => setStep(s => s - 1)}>
            ← ANTERIOR
          </button>
        )}
        {step < steps.length - 1 ? (
          <button className="xp-btn-primary" onClick={() => setStep(s => s + 1)}>
            SIGUIENTE →
          </button>
        ) : (
          <button className="xp-btn-primary" onClick={onStart}>
            COMENZAR
          </button>
        )}
      </div>
    </div>
  );
}
