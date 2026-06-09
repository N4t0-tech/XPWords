import { useState } from 'react';
import GameCard from '../components/GameCard';
import MiniGame from '../components/MiniGame';
import LinkWords from '../components/LinkWords';
import SectionHeader from '../components/SectionHeader';
import { games } from '../data/mock';

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
