import ProfileCard from '../components/ProfileCard';
import Badge from '../components/Badge';
import HistoryRow from '../components/HistoryRow';
import SectionHeader from '../components/SectionHeader';
import CollapsiblePanel from '../components/CollapsiblePanel';
import ProfileSettings from '../components/ProfileSettings';
import AccountSettings from '../components/AccountSettings';
import { currentUser, badges, xpHistory } from '../data/mock';

export default function Profile({ onLogout }) {
  return (
    <div className="xp-body">
      <ProfileCard user={currentUser} />
      <div className="xp-badges">
        {badges.map(b => (
          <Badge key={b.name} badge={b} />
        ))}
      </div>
      <SectionHeader icon="history" label="HISTORIAL DE XP" />
      <div className="xp-history">
        {xpHistory.map((h, i) => (
          <HistoryRow key={i} item={h} />
        ))}
      </div>
      <CollapsiblePanel icon="settings" label="CONFIGURACIÓN">
        <ProfileSettings />
        <AccountSettings onLogout={onLogout} />
      </CollapsiblePanel>
    </div>
  );
}
