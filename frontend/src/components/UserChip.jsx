export default function UserChip({ user }) {
  if (!user) {
    return (
      <div className="xp-user-chip" style={{ opacity: 0.5 }}>
        <div className="xp-avatar" style={{ background: '#1c2030' }}>?</div>
        <div className="xp-user-info">
          <span className="xp-user-name">Cargando...</span>
          <span className="xp-user-level">—</span>
        </div>
      </div>
    );
  }

  const initials = user.initials || user.name.split(' ').map(n => n[0]).join('');
  return (
    <div className="xp-user-chip">
      {user.discordAvatar
        ? <img className="xp-avatar xp-avatar-img" src={user.discordAvatar} alt="" />
        : <div className="xp-avatar" style={{ background: user.avatarBg }}>{initials}</div>
      }
      <div className="xp-user-info">
        <span className="xp-user-name">{user.name}</span>
        <span className="xp-user-level">LVL {user.level} · {user.xp} XP</span>
      </div>
    </div>
  );
}
