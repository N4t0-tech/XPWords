export default function Badge({ badge }) {
  return (
    <div className="xp-badge earned">
      <i className={`ti ti-${badge.icon}`} aria-hidden="true" />
      {badge.name}
    </div>
  );
}
