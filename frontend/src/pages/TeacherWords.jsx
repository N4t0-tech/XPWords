import { useState, useEffect } from 'react';
import SectionHeader from '../components/SectionHeader';
import Toast from '../components/Toast';
import { api } from '../api/client';

export default function TeacherWords() {
  const [words, setWords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ word: '', hint: '', options: '[]', correctIndex: 0 });
  const [toast, setToast] = useState({ show: false, msg: '' });

  useEffect(() => {
    api.get('/words').then(setWords).catch(() => {});
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ word: '', hint: '', options: '["","","",""]', correctIndex: 0 });
    setShowForm(true);
  }

  function openEdit(w) {
    setEditing(w);
    setForm({ word: w.word, hint: w.hint, options: w.options, correctIndex: w.correctIndex });
    setShowForm(true);
  }

  function parseOptions(str) {
    try { return JSON.parse(str); } catch { return []; }
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      if (editing) {
        const updated = await api.put(`/words/${editing.id}`, form);
        setWords(prev => prev.map(w => w.id === editing.id ? updated : w));
        setToast({ show: true, msg: 'Palabra actualizada' });
      } else {
        const created = await api.post('/words', form);
        setWords(prev => [...prev, created]);
        setToast({ show: true, msg: 'Palabra creada' });
      }
      setShowForm(false);
    } catch (err) {
      setToast({ show: true, msg: err.message });
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/words/${id}`);
      setWords(prev => prev.filter(w => w.id !== id));
      setToast({ show: true, msg: 'Palabra eliminada' });
    } catch (err) {
      setToast({ show: true, msg: err.message });
    }
  }

  return (
    <div className="xp-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <SectionHeader icon="vocabulary" label="GESTIÓN DE PALABRAS" />
        <button className="xp-btn-primary" onClick={openCreate}>AÑADIR PALABRA</button>
      </div>

      <div className="xp-res-list">
        {words.map(w => {
          const opts = parseOptions(w.options);
          return (
            <div key={w.id} className="xp-word-card" style={{ background: '#0e1018', border: '1px solid #1c2030', borderRadius: '10px', padding: '1rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#e2e8f0' }}>{w.word}</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{w.hint}</div>
                <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px' }}>
                  {opts.map((o, i) => (
                    <span key={i} style={{ background: i === w.correctIndex ? '#1a3a1a' : '#13161f', padding: '2px 8px', borderRadius: '4px', marginRight: '4px', color: i === w.correctIndex ? '#4ade80' : '#9ca3af' }}>{o}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button className="xp-btn-sm" onClick={() => openEdit(w)} style={{ background: '#13161f', border: '1px solid #1c2030', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', color: '#9ca3af', cursor: 'pointer' }}>
                  <i className="ti ti-pencil" />
                </button>
                <button className="xp-btn-sm" onClick={() => handleDelete(w.id)} style={{ background: '#2a1010', border: '1px solid #3a1515', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', color: '#f87171', cursor: 'pointer' }}>
                  <i className="ti ti-trash" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="xp-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="xp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <button className="xp-modal-close" onClick={() => setShowForm(false)}>✕</button>
            <div className="xp-section-hdr" style={{ marginBottom: '1.2rem' }}>
              <i className="ti ti-vocabulary" aria-hidden="true" />
              <span>{editing ? 'EDITAR PALABRA' : 'NUEVA PALABRA'}</span>
            </div>
            <form className="xp-modal-form" onSubmit={handleSave}>
              <div className="xp-modal-field">
                <label>Palabra</label>
                <input type="text" value={form.word} onChange={e => setForm(p => ({ ...p, word: e.target.value }))} required />
              </div>
              <div className="xp-modal-field">
                <label>Pista</label>
                <input type="text" value={form.hint} onChange={e => setForm(p => ({ ...p, hint: e.target.value }))} required />
              </div>
              <div className="xp-modal-field">
                <label>Opciones (JSON array)</label>
                <textarea rows={3} value={form.options} onChange={e => setForm(p => ({ ...p, options: e.target.value }))} style={{ background: '#13161f', border: '1px solid #1c2030', borderRadius: '6px', padding: '8px', color: '#e2e8f0', width: '100%', fontFamily: 'monospace', fontSize: '13px', resize: 'vertical' }} required />
              </div>
              <div className="xp-modal-field">
                <label>Índice correcto ({parseOptions(form.options).length - 1} máximo)</label>
                <input type="number" min={0} max={parseOptions(form.options).length - 1} value={form.correctIndex} onChange={e => setForm(p => ({ ...p, correctIndex: parseInt(e.target.value) || 0 }))} required />
              </div>
              <button type="submit" className="xp-btn-primary" style={{ width: '100%' }}>
                {editing ? 'GUARDAR CAMBIOS' : 'CREAR PALABRA'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Toast message={toast.msg} show={toast.show} onClose={() => setToast({ show: false, msg: '' })} />
    </div>
  );
}
