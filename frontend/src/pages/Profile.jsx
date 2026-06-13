import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';
import Badge from '../components/Badge';
import HistoryRow from '../components/HistoryRow';
import SectionHeader from '../components/SectionHeader';
import CollapsiblePanel from '../components/CollapsiblePanel';
import ProfileSettings from '../components/ProfileSettings';
import AccountSettings from '../components/AccountSettings';
import Skeleton from '../components/Skeleton';
import { api } from '../api/client';
import { useToast } from '../components/ToastContext';

export default function Profile({ user, onLogout }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState([]);
  const [xpHistory, setXpHistory] = useState([]);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    Promise.all([
      api.get('/badges/mine').then(setBadges).catch(err => showToast(err.message)),
      api.get('/xp/history').then(setXpHistory).catch(err => showToast(err.message)),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const discord = searchParams.get('discord');
    if (discord === 'linked') {
      showToast('Cuenta de Discord vinculada');
      window.history.replaceState({}, '', '/profile');
    } else if (discord === 'updated') {
      showToast('Cuenta de Discord actualizada');
      window.history.replaceState({}, '', '/profile');
    } else if (discord === 'error') {
      showToast('Error al vincular Discord');
      window.history.replaceState({}, '', '/profile');
    }
  }, []);

  return (
    <div className="xp-body">
      <ProfileCard user={user} />
      <SectionHeader icon="award" label="MEDALLAS" />
      <div className="xp-badges">
        {loading
          ? [1,2,3,4,5,6].map(i => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <Skeleton width={44} height={44} borderRadius={22} />
                <Skeleton width={60} height={12} />
              </div>
            ))
          : badges.map(b => <Badge key={b.name} badge={b} />)
        }
      </div>
      <SectionHeader icon="history" label="HISTORIAL DE XP" />
      <div className="xp-history">
        {loading
          ? [1,2,3].map(i => <Skeleton key={i} height={44} borderRadius={8} style={{ marginBottom: 6 }} />)
          : xpHistory.map((h, i) => <HistoryRow key={i} item={h} />)
        }
      </div>
      <CollapsiblePanel icon="settings" label="CONFIGURACIÓN">
        <ProfileSettings user={user} />
        <AccountSettings user={user} onLogout={onLogout} />
      </CollapsiblePanel>
    </div>
  );
}
