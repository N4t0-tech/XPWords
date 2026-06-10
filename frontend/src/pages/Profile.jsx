import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';
import Badge from '../components/Badge';
import HistoryRow from '../components/HistoryRow';
import SectionHeader from '../components/SectionHeader';
import CollapsiblePanel from '../components/CollapsiblePanel';
import ProfileSettings from '../components/ProfileSettings';
import AccountSettings from '../components/AccountSettings';
import Toast from '../components/Toast';
import { api } from '../api/client';

export default function Profile({ user, onLogout }) {
  const [badges, setBadges] = useState([]);
  const [xpHistory, setXpHistory] = useState([]);
  const [searchParams] = useSearchParams();
  const [toast, setToast] = useState({ show: false, msg: '' });

  useEffect(() => {
    api.get('/badges/mine').then(setBadges).catch(() => {});
    api.get('/xp/history').then(setXpHistory).catch(() => {});
  }, []);

  useEffect(() => {
    const discord = searchParams.get('discord');
    if (discord === 'linked') {
      setToast({ show: true, msg: 'Cuenta de Discord vinculada' });
      window.history.replaceState({}, '', '/profile');
    } else if (discord === 'updated') {
      setToast({ show: true, msg: 'Cuenta de Discord actualizada' });
      window.history.replaceState({}, '', '/profile');
    } else if (discord === 'error') {
      setToast({ show: true, msg: 'Error al vincular Discord' });
      window.history.replaceState({}, '', '/profile');
    }
  }, []);

  return (
    <div className="xp-body">
      <ProfileCard user={user} />
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
        <ProfileSettings user={user} />
        <AccountSettings user={user} onLogout={onLogout} />
      </CollapsiblePanel>
      <Toast message={toast.msg} show={toast.show} onClose={() => setToast({ show: false, msg: '' })} />
    </div>
  );
}
