export default function Leaderboard({ data }) {
  return (
    <div className="xp-leaderboard">
      {data.map(row => (
        <div key={row.rank} className="xp-lb-row" style={row.dimmed ? { opacity: '.5' } : undefined}>
          <div className={`xp-lb-rank${row.color ? ` ${row.color}` : ''}`}>{row.rank}</div>
          <div
            className="xp-lb-av"
            style={{
              background: row.bg,
              color: row.dimmed ? '#6b7280' : undefined,
              fontSize: row.dimmed ? '11px' : undefined,
            }}
          >
            {row.initials}
          </div>
          <div className="xp-lb-name" style={row.dimmed ? { color: '#4b5563' } : undefined}>
            {row.name}
          </div>
          <div className="xp-lb-lvl">{row.level ? `LVL ${row.level}` : ''}</div>
          <div className="xp-lb-xp" style={row.dimmed ? { color: '#1c2030' } : undefined}>
            {row.xp ? `${row.xp} XP` : '—'}
          </div>
        </div>
      ))}
    </div>
  );
}
