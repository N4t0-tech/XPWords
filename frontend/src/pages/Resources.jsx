import { useState } from 'react';
import ResourceItem from '../components/ResourceItem';
import SectionHeader from '../components/SectionHeader';
import { resources, resourceCategories } from '../data/mock';

export default function Resources() {
  const [cat, setCat] = useState('Todos');

  const filtered = cat === 'Todos' ? resources : resources.filter(r => r.category === cat);

  return (
    <div className="xp-body">
      <SectionHeader icon="books" label="RECURSOS" />
      <div className="xp-res-cats">
        {resourceCategories.map(c => (
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
