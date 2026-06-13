import { useState, useEffect } from 'react';
import SectionHeader from '../components/SectionHeader';
import Skeleton from '../components/Skeleton';
import { api } from '../api/client';
import { useToast } from '../components/ToastContext';

const ICONS = ['trophy', 'star', 'flame', 'zap', 'crown', 'shield', 'medal', 'award', 'rocket', 'heart',
  'diamond', 'sparkles', 'target', 'bolt', 'brain', 'book', 'code', 'music', 'palette', 'run'];

export default function TeacherBadges() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', icon: 'trophy', description: '' });

  useEffect(() => {
    api.get('/badges').then(setBadges).catch(err => showToast(err.message)).finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: '', icon: 'trophy', description: '' });
    setShowForm(true);
  }

  function openEdit(b) {
    setEditing(b);
    setForm({ name: b.name, icon: b.icon, description: b.description || '' });
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      if (editing) {
        const updated = await api.put(`/badges/${editing.id}`, form);
        setBadges(prev => prev.map(b => b.id === editing.id ? updated : b));
        showToast('Medalla actualizada');
      } else {
        const created = await api.post('/badges', form);
        setBadges(prev => [...prev, created]);
        showToast('Medalla creada');
      }
      setShowForm(false);
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/badges/${id}`);
      setBadges(prev => prev.filter(b => b.id !== id));
      showToast('Medalla eliminada');
    } catch (err) {
      showToast(err.message);
    }
  }

  return (
    <div className="xp-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <SectionHeader icon="medal" label="GESTIÓN DE MEDALLAS" />
        <button className="xp-btn-primary" onClick={openCreate}>AÑADIR MEDALLA</button>
      </div>

      <div className="xp-res-list">
        {loading
          ? [1,2,3,4].map(i => (
              <div key={i} style={{ background: '#0e1018', border: '1px solid #1c2030', borderRadius: '10px', padding: '1rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Skeleton width={44} height={44} borderRadius={8} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Skeleton width="40%" height={16} />
                  <Skeleton width="60%" height={14} />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Skeleton width={32} height={32} borderRadius={6} />
                  <Skeleton width={32} height={32} borderRadius={6} />
                </div>
              </div>
            ))
          : badges.map(b => (
          <div key={b.id} style={{ background: '#0e1018', border: '1px solid #1c2030', borderRadius: '10px', padding: '1rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '28px', width: '44px', textAlign: 'center', color: '#fbbf24' }}>
              <i className={`ti ti-${b.icon}`} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{b.name}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>{b.description}</div>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <button onClick={() => openEdit(b)} style={{ background: '#13161f', border: '1px solid #1c2030', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', color: '#9ca3af', cursor: 'pointer' }}>
                <i className="ti ti-pencil" />
              </button>
              <button onClick={() => handleDelete(b.id)} style={{ background: '#2a1010', border: '1px solid #3a1515', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', color: '#f87171', cursor: 'pointer' }}>
                <i className="ti ti-trash" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="xp-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="xp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button className="xp-modal-close" onClick={() => setShowForm(false)}>✕</button>
            <div className="xp-section-hdr" style={{ marginBottom: '1.2rem' }}>
              <i className={`ti ti-${form.icon}`} aria-hidden="true" />
              <span>{editing ? 'EDITAR MEDALLA' : 'NUEVA MEDALLA'}</span>
            </div>
            <form className="xp-modal-form" onSubmit={handleSave}>
              <div className="xp-modal-field">
                <label>Nombre</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="xp-modal-field">
                <label>Icono (Tabler Icons)</label>
                <select value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} style={{ background: '#13161f', border: '1px solid #1c2030', borderRadius: '6px', padding: '8px', color: '#e2e8f0', width: '100%' }}>
                  {ICONS.map(ic => (
                    <option key={ic} value={ic}><i className={`ti ti-${ic}`} /> {ic}</option>
                  ))}
                </select>
                <div style={{ marginTop: '6px', fontSize: '24px', textAlign: 'center', color: '#fbbf24' }}>
                  <i className={`ti ti-${form.icon}`} />
                </div>
              </div>
              <div className="xp-modal-field">
                <label>Descripción</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ background: '#13161f', border: '1px solid #1c2030', borderRadius: '6px', padding: '8px', color: '#e2e8f0', width: '100%', fontFamily: 'inherit', fontSize: '13px', resize: 'vertical' }} />
              </div>
              <button type="submit" className="xp-btn-primary" style={{ width: '100%' }}>
                {editing ? 'GUARDAR CAMBIOS' : 'CREAR MEDALLA'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
