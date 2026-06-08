export default function Badge({ badge }) {
  return (
    <div className={`xp-badge${badge.earned ? ' earned' : ''}`}>
      <i className={`ti ti-${badge.icon}`} aria-hidden="true" />
      {badge.name}
    </div>
  );
}
