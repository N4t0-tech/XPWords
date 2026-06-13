import { useState, useEffect } from 'react';
import ResourceItem from '../components/ResourceItem';
import SectionHeader from '../components/SectionHeader';
import Skeleton from '../components/Skeleton';
import { api } from '../api/client';
import { useToast } from '../components/ToastContext';

export default function Resources() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('Todos');
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/resources').then(setResources).catch(err => showToast(err.message)),
      api.get('/resources/categories').then(setCategories).catch(err => showToast(err.message)),
    ]).finally(() => setLoading(false));
  }, []);

  const filtered = cat === 'Todos' ? resources : resources.filter(r => r.category === cat);

  return (
    <div className="xp-body">
      <SectionHeader icon="books" label="RECURSOS" />
      {loading
        ? <>
            <div className="xp-res-cats">
              {[1,2,3,4].map(i => <Skeleton key={i} width={80} height={30} borderRadius={10} style={{ display: 'inline-block', marginRight: 8 }} />)}
            </div>
            <div className="xp-res-list">
              {[1,2,3,4].map(i => (
                <div key={i} className="xp-res-item" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Skeleton width={44} height={44} borderRadius={10} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Skeleton width="50%" height={16} />
                    <Skeleton width="70%" height={14} />
                  </div>
                </div>
              ))}
            </div>
          </>
        : <>
            <div className="xp-res-cats">
              {categories.map(c => (
                <div
                  key={c}
                  className={`xp-res-cat${cat === c ? ' active' : ''}`}
                  onClick={() => setCat(c)}
                >
                  {c}
                </div>
              ))}
            </div>
            <div className="xp-res-list">
              {filtered.map(r => <ResourceItem key={r.id} item={r} />)}
            </div>
          </>
      }
    </div>
  );
}
