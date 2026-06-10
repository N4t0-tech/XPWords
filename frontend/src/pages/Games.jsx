import { useState } from 'react';
import GameCard from '../components/GameCard';
import MiniGame from '../components/MiniGame';
import LinkWords from '../components/LinkWords';
import SectionHeader from '../components/SectionHeader';

const games = [
  { id: 'wordsnap', icon: '🎯', title: 'WordSnap', desc: 'Adivina el significado antes de que se acabe el tiempo', xp: '+50 XP / ronda', diff: 'FÁCIL', diffClass: 'easy', available: true },
  { id: 'linkwords', icon: '🔗', title: 'LinkWords', desc: 'Conecta palabras con sus definiciones a contrarreloj', xp: '+75 XP / match', diff: 'MEDIO', diffClass: 'med', available: true },
  { id: 'sentencefix', icon: '🧩', title: 'SentenceFix', desc: 'Ordena las palabras para formar la oración correcta', xp: '+100 XP / ronda', diff: 'DIFÍCIL', diffClass: 'hard', available: false },
  { id: 'listenup', icon: '👂', title: 'ListenUp', desc: 'Escucha la palabra y escríbela correctamente', xp: '+80 XP / ronda', diff: 'MEDIO', diffClass: 'med', available: false },
];

export default function Games() {
  const [activeGame, setActiveGame] = useState(null);

  return (
    <div className="xp-body">
      <SectionHeader icon="device-gamepad-2" label="MINIJUEGOS" />
      <div className="xp-games-grid">
        {games.map(g => (
          <GameCard key={g.id} game={g} onStart={g.available ? () => setActiveGame(g.id) : undefined} />
        ))}
      </div>
      {activeGame === 'wordsnap' && <MiniGame onClose={() => setActiveGame(null)} />}
      {activeGame === 'linkwords' && <LinkWords onClose={() => setActiveGame(null)} />}
    </div>
  );
}
