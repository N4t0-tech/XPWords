import { useState } from 'react';
import GameCard from '../components/GameCard';
import MiniGame from '../components/MiniGame';
import SectionHeader from '../components/SectionHeader';
import { games } from '../data/mock';

export default function Games() {
  const [started, setStarted] = useState(false);

  return (
    <div className="xp-body">
      <SectionHeader icon="device-gamepad-2" label="MINIJUEGOS" />
      <div className="xp-games-grid">
        {games.map(g => (
          <GameCard key={g.id} game={g} onStart={g.id === 'wordsnap' ? () => setStarted(true) : undefined} />
        ))}
      </div>
      {started && <MiniGame />}
    </div>
  );
}
