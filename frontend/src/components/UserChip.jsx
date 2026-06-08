export default function UserChip({ user }) {
  return (
    <div className="xp-user-chip">
      <div className="xp-avatar" style={{ background: user.avatarBg }}>{user.initials}</div>
      <div className="xp-user-info">
        <span className="xp-user-name">{user.name}</span>
        <span className="xp-user-level">LVL {user.level} · {user.xp} XP</span>
      </div>
    </div>
  );
}
