import { useState, useEffect } from 'react';
import ResourceItem from '../components/ResourceItem';
import SectionHeader from '../components/SectionHeader';
import { api } from '../api/client';

export default function Resources() {
  const [cat, setCat] = useState('Todos');
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/resources').then(setResources).catch(() => {});
    api.get('/resources/categories').then(setCategories).catch(() => {});
  }, []);

  const filtered = cat === 'Todos' ? resources : resources.filter(r => r.category === cat);

  return (
    <div className="xp-body">
      <SectionHeader icon="books" label="RECURSOS" />
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
        {filtered.map(r => (
          <ResourceItem key={r.id} item={r} />
        ))}
      </div>
    </div>
  );
}
