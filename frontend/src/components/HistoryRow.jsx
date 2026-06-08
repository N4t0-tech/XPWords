const iconMap = {
  class: 'school',
  game: 'device-gamepad-2',
  res: 'cards',
};

export default function HistoryRow({ item }) {
  return (
    <div className="xp-hist-row">
      <div className={`xp-hist-icon ${item.icon}`}>
        <i className={`ti ti-${iconMap[item.icon] || 'circle'}`} aria-hidden="true" />
      </div>
      <div className="xp-hist-desc" dangerouslySetInnerHTML={{ __html: item.desc }} />
      <div className="xp-hist-xp">{item.xp}</div>
    </div>
  );
}
