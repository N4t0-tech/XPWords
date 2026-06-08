export default function ProfileCard({ user }) {
  const pct = Math.round((user.xp / user.xpNext) * 100);
  return (
    <div className="xp-profile-card">
      <div className="xp-profile-top">
        <div className="xp-profile-av" style={{ background: user.avatarBg }}>{user.initials}</div>
        <div>
          <div className="xp-profile-name">{user.name}</div>
          <div className="xp-profile-tag">{user.tag}</div>
        </div>
      </div>
      <div className="xp-level-row">
        <span className="xp-level-label">NIVEL {user.level} — {user.title}</span>
        <span className="xp-level-num">{user.xp} / {user.xpNext} XP</span>
      </div>
      <div className="xp-bar-bg"><div className="xp-bar-fill" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
