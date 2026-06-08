export default function GameCard({ game, onStart }) {
  return (
    <div
      className={`xp-game-card${!game.available ? ' disabled' : ''}`}
      onClick={game.available ? onStart : undefined}
    >
      <span className="xp-game-icon">{game.icon}</span>
      <div className="xp-game-title">{game.title}</div>
      <p className="xp-game-desc">{game.desc}</p>
      <div className="xp-game-meta">
        <span className="xp-game-xp">{game.xp}</span>
        <span className={`xp-game-diff diff-${game.diffClass}`}>{game.diff}</span>
      </div>
    </div>
  );
}
