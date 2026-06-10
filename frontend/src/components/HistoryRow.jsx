const iconMap = {
  GAME: 'device-gamepad-2',
  LESSON: 'school',
  RESOURCE: 'cards',
  BADGE: 'award',
};

export default function HistoryRow({ item }) {
  const source = item.source || 'GAME';
  const icon = iconMap[source] || 'circle';
  const desc = item.description || `${source} - ${item.amount} XP`;

  return (
    <div className="xp-hist-row">
      <div className={`xp-hist-icon ${source.toLowerCase()}`}>
        <i className={`ti ti-${icon}`} aria-hidden="true" />
      </div>
      <div className="xp-hist-desc">{desc}</div>
      <div className="xp-hist-xp">+{item.amount}</div>
    </div>
  );
}
