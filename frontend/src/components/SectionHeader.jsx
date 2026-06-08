export default function SectionHeader({ icon, label }) {
  return (
    <div className="xp-section-hdr">
      <i className={`ti ti-${icon}`} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
