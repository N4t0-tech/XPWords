import { useState, useEffect } from 'react';
import SectionHeader from '../components/SectionHeader';
import Toast from '../components/Toast';
import { api } from '../api/client';

export default function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '' });
  const [toast, setToast] = useState({ show: false, msg: '' });

  useEffect(() => {
    api.get('/classes').then(setClasses).catch(() => {});
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const created = await api.post('/classes', {
        title: form.title,
        description: form.description,
        date: new Date(form.date).toISOString(),
      });
      setClasses(prev => [...prev, created].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setShowForm(false);
      setForm({ title: '', description: '', date: '' });
      setToast({ show: true, msg: 'Clase creada' });
    } catch (err) {
      setToast({ show: true, msg: err.message });
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/classes/${id}`);
      setClasses(prev => prev.filter(c => c.id !== id));
      setToast({ show: true, msg: 'Clase eliminada' });
    } catch (err) {
      setToast({ show: true, msg: err.message });
    }
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="xp-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <SectionHeader icon="calendar" label="MIS CLASES" />
        <button className="xp-btn-primary" onClick={() => setShowForm(true)}>AÑADIR CLASE</button>
      </div>

      {classes.length === 0 && (
        <p style={{ color: '#4b5563', fontSize: '14px', textAlign: 'center', padding: '2rem' }}>
          No tienes clases programadas
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {classes.map(c => (
          <div key={c.id} className="xp-res-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="xp-res-thumb link" style={{ background: '#0d2420', color: '#6ee7b7' }}>
              <i className="ti ti-calendar-event" aria-hidden="true" />
            </div>
            <div className="xp-res-info" style={{ flex: 1 }}>
              <div className="xp-res-title">{c.title}</div>
              <div className="xp-res-meta">{formatDate(c.date)}</div>
              {c.description && <div className="xp-res-meta" style={{ marginTop: '2px', color: '#6b7280' }}>{c.description}</div>}
            </div>
            <button
              onClick={() => handleDelete(c.id)}
              style={{ background: '#2a1010', border: '1px solid #3a1515', borderRadius: '6px', padding: '6px 14px', fontSize: '13px', color: '#f87171', cursor: 'pointer' }}
            >
              <i className="ti ti-trash" />
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="xp-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="xp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button className="xp-modal-close" onClick={() => setShowForm(false)}>✕</button>
            <div className="xp-section-hdr" style={{ marginBottom: '1.2rem' }}>
              <i className="ti ti-calendar-plus" aria-hidden="true" />
              <span>NUEVA CLASE</span>
            </div>
            <form className="xp-modal-form" onSubmit={handleCreate}>
              <div className="xp-modal-field">
                <label>Título</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div className="xp-modal-field">
                <label>Descripción (opcional)</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  style={{ background: '#13161f', border: '1px solid #1c2030', borderRadius: '7px', padding: '12px 14px', fontSize: '14px', color: '#e2e8f0', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical' }}
                />
              </div>
              <div className="xp-modal-field">
                <label>Fecha y hora</label>
                <input
                  type="datetime-local"
                  value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  required
                  style={{ background: '#13161f', border: '1px solid #1c2030', borderRadius: '7px', padding: '12px 14px', fontSize: '14px', color: '#e2e8f0', fontFamily: 'Inter, sans-serif', outline: 'none', colorScheme: 'dark' }}
                />
              </div>
              <button type="submit" className="xp-btn-primary" style={{ width: '100%' }}>CREAR CLASE</button>
            </form>
          </div>
        </div>
      )}

      <Toast message={toast.msg} show={toast.show} onClose={() => setToast({ show: false, msg: '' })} />
    </div>
  );
}
