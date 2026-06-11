const iconMap = {
  flash: 'cards',
  pdf: 'file-text',
  video: 'player-play',
  link: 'link',
};

export default function ResourceItem({ item, actions }) {
  return (
    <div className="xp-res-item">
      <div className={`xp-res-thumb ${item.type}`}>
        <i className={`ti ti-${iconMap[item.type] || 'file'}`} aria-hidden="true" />
      </div>
      <div className="xp-res-info">
        <div className="xp-res-title">{item.title}</div>
        <div className="xp-res-meta">{item.category} · {item.meta}</div>
      </div>
      {actions ? actions : <button className="xp-res-btn" disabled>{item.btn}</button>}
    </div>
  );
}
