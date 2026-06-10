const COLORS = [
  { color: '#eab308', bg: '#2a2510' },
  { color: '#a1a1aa', bg: '#20202a' },
  { color: '#d97746', bg: '#2a1e10' },
  { color: '#06b6d4', bg: '#10202a' },
  { color: '#10b981', bg: '#102a20' },
];

function getStyle(index) {
  return COLORS[index % COLORS.length];
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('');
}

export default function Leaderboard({ data }) {
  return (
    <div className="xp-leaderboard">
      {data.map((row, i) => {
        const style = getStyle(i);
        const initials = row.initials || getInitials(row.name);
        return (
          <div key={row.rank || i} className="xp-lb-row">
            <div className={`xp-lb-rank`} style={{ color: style.color }}>{row.rank}</div>
            <div className="xp-lb-av" style={{ background: style.bg, color: style.color }}>
              {initials}
            </div>
            <div className="xp-lb-name">{row.name}</div>
            <div className="xp-lb-lvl">{row.level ? `LVL ${row.level}` : ''}</div>
            <div className="xp-lb-xp">{row.xp ? `${row.xp} XP` : '—'}</div>
          </div>
        );
      })}
    </div>
  );
}
