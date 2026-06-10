const TITLES = ['Novato', 'Aprendiz', 'Explorador', 'Experto', 'Maestro', 'Leyenda'];

function getTitle(level) {
  return TITLES[Math.min(level - 1, TITLES.length - 1)] || 'Leyenda';
}

function xpForLevel(level) {
  return level * 100;
}

export default function ProfileCard({ user }) {
  if (!user) {
    return (
      <div className="xp-profile-card" style={{ opacity: 0.5 }}>
        <div className="xp-profile-top">
          <div className="xp-profile-av" style={{ background: '#1c2030' }}>?</div>
          <div>
            <div className="xp-profile-name">Cargando...</div>
            <div className="xp-profile-tag">@—</div>
          </div>
        </div>
      </div>
    );
  }

  const initials = user.initials || user.name.split(' ').map(n => n[0]).join('');
  const tag = user.tag || `@${user.name.toLowerCase().replace(/\s+/g, '')}`;
  const title = user.title || getTitle(user.level);
  const xpNext = user.xpNext || xpForLevel(user.level);
  const pct = Math.round((user.xp / xpNext) * 100);

  return (
    <div className="xp-profile-card">
      <div className="xp-profile-top">
        {user.discordAvatar
          ? <img className="xp-profile-av xp-avatar-img" src={user.discordAvatar} alt="" />
          : <div className="xp-profile-av" style={{ background: user.avatarBg }}>{initials}</div>
        }
        <div>
          <div className="xp-profile-name">{user.name}</div>
          <div className="xp-profile-tag">{tag}</div>
        </div>
      </div>
      <div className="xp-level-row">
        <span className="xp-level-label">NIVEL {user.level} — {title}</span>
        <span className="xp-level-num">{user.xp} / {xpNext} XP</span>
      </div>
      <div className="xp-bar-bg"><div className="xp-bar-fill" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
