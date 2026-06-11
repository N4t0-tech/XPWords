import { useState, useEffect } from 'react';
import ResourceItem from '../components/ResourceItem';
import SectionHeader from '../components/SectionHeader';
import Toast from '../components/Toast';
import { api } from '../api/client';

export default function TeacherResources() {
  const [resources, setResources] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', category: 'Vocabulario', meta: '', type: 'flash', btn: '', url: '' });
  const [toast, setToast] = useState({ show: false, msg: '' });

  useEffect(() => {
    api.get('/resources').then(setResources).catch(() => {});
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ title: '', category: 'Vocabulario', meta: '', type: 'flash', btn: '', url: '' });
    setShowForm(true);
  }

  function openEdit(r) {
    setEditing(r);
    setForm({ title: r.title, category: r.category, meta: r.meta || '', type: r.type, btn: r.btn || '', url: r.url || '' });
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      if (editing) {
        const updated = await api.put(`/resources/${editing.id}`, form);
        setResources(prev => prev.map(r => r.id === editing.id ? updated : r));
        setToast({ show: true, msg: 'Recurso actualizado' });
      } else {
        const created = await api.post('/resources', form);
        setResources(prev => [...prev, created]);
        setToast({ show: true, msg: 'Recurso creado' });
      }
      setShowForm(false);
    } catch (err) {
      setToast({ show: true, msg: err.message });
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/resources/${id}`);
      setResources(prev => prev.filter(r => r.id !== id));
      setToast({ show: true, msg: 'Recurso eliminado' });
    } catch (err) {
      setToast({ show: true, msg: err.message });
    }
  }

  return (
    <div className="xp-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <SectionHeader icon="books" label="GESTIÓN DE RECURSOS" />
        <button className="xp-btn-primary" onClick={openCreate}>AÑADIR RECURSO</button>
      </div>

      <div className="xp-res-list">
        {resources.map(r => (
          <ResourceItem
            key={r.id}
            item={r}
            actions={
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button className="xp-btn-sm" onClick={() => openEdit(r)} style={{ background: '#13161f', border: '1px solid #1c2030', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', color: '#9ca3af', cursor: 'pointer' }}>
                  <i className="ti ti-pencil" />
                </button>
                <button className="xp-btn-sm" onClick={() => handleDelete(r.id)} style={{ background: '#2a1010', border: '1px solid #3a1515', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', color: '#f87171', cursor: 'pointer' }}>
                  <i className="ti ti-trash" />
                </button>
              </div>
            }
          />
        ))}
      </div>

      {showForm && (
        <div className="xp-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="xp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button className="xp-modal-close" onClick={() => setShowForm(false)}>✕</button>
            <div className="xp-section-hdr" style={{ marginBottom: '1.2rem' }}>
              <i className="ti ti-books" aria-hidden="true" />
              <span>{editing ? 'EDITAR RECURSO' : 'NUEVO RECURSO'}</span>
            </div>
            <form className="xp-modal-form" onSubmit={handleSave}>
              <div className="xp-modal-field">
                <label>Título</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div className="xp-modal-field">
                <label>Categoría</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  <option value="Vocabulario">Vocabulario</option>
                  <option value="Gramática">Gramática</option>
                  <option value="Listening">Listening</option>
                  <option value="Writing">Writing</option>
                </select>
              </div>
              <div className="xp-modal-field">
                <label>Meta (ej: "PDF · por Aldana")</label>
                <input type="text" value={form.meta} onChange={e => setForm(p => ({ ...p, meta: e.target.value }))} />
              </div>
              <div className="xp-modal-field">
                <label>Tipo</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="flash">Flashcards</option>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="link">Link</option>
                </select>
              </div>
              <div className="xp-modal-field">
                <label>Texto del botón</label>
                <input type="text" value={form.btn} onChange={e => setForm(p => ({ ...p, btn: e.target.value }))} />
              </div>
              <div className="xp-modal-field">
                <label>URL (opcional)</label>
                <input type="text" value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} />
              </div>
              <button type="submit" className="xp-btn-primary" style={{ width: '100%' }}>
                {editing ? 'GUARDAR CAMBIOS' : 'CREAR RECURSO'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Toast message={toast.msg} show={toast.show} onClose={() => setToast({ show: false, msg: '' })} />
    </div>
  );
}
