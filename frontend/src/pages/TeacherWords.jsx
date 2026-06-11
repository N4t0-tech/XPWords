import { useState, useEffect } from 'react';
import SectionHeader from '../components/SectionHeader';
import Toast from '../components/Toast';
import { api } from '../api/client';

export default function TeacherWords() {
  const [words, setWords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ word: '', hint: '', optA: '', optB: '', optC: '', optD: '', correctIndex: 0 });
  const [toast, setToast] = useState({ show: false, msg: '' });

  useEffect(() => {
    api.get('/words').then(setWords).catch(() => {});
  }, []);

  function parseOptions(str) {
    try { return JSON.parse(str); } catch { return []; }
  }

  function toForm(w) {
    const opts = parseOptions(w.options);
    return {
      word: w.word,
      hint: w.hint,
      optA: opts[0] || '',
      optB: opts[1] || '',
      optC: opts[2] || '',
      optD: opts[3] || '',
      correctIndex: w.correctIndex,
    };
  }

  function openCreate() {
    setEditing(null);
    setForm({ word: '', hint: '', optA: '', optB: '', optC: '', optD: '', correctIndex: 0 });
    setShowForm(true);
  }

  function openEdit(w) {
    setEditing(w);
    setForm(toForm(w));
    setShowForm(true);
  }

  function buildPayload(f) {
    return {
      word: f.word,
      hint: f.hint,
      options: JSON.stringify([f.optA, f.optB, f.optC, f.optD]),
      correctIndex: f.correctIndex,
    };
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      const payload = buildPayload(form);
      if (editing) {
        const updated = await api.put(`/words/${editing.id}`, payload);
        setWords(prev => prev.map(w => w.id === editing.id ? updated : w));
        setToast({ show: true, msg: 'Palabra actualizada' });
      } else {
        const created = await api.post('/words', payload);
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

  const LETTERS = ['A', 'B', 'C', 'D'];

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
                    <span key={i} style={{ background: i === w.correctIndex ? '#1a3a1a' : '#13161f', padding: '2px 8px', borderRadius: '4px', marginRight: '4px', color: i === w.correctIndex ? '#4ade80' : '#9ca3af' }}>{LETTERS[i]}) {o}</span>
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
          <div className="xp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
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
                <label>Opciones</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {LETTERS.map((l, i) => (
                    <label key={l} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 0' }}>
                      <input
                        type="radio"
                        name="correctIndex"
                        checked={form.correctIndex === i}
                        onChange={() => setForm(p => ({ ...p, correctIndex: i }))}
                        style={{ accentColor: '#4ade80' }}
                      />
                      <span style={{ color: form.correctIndex === i ? '#4ade80' : '#9ca3af', fontWeight: 600, width: '16px' }}>{l}</span>
                      <input
                        type="text"
                        value={form[`opt${l}`]}
                        onChange={e => setForm(p => ({ ...p, [`opt${l}`]: e.target.value }))}
                        placeholder={`Opción ${l}`}
                        required
                        style={{ flex: 1, background: '#13161f', border: form.correctIndex === i ? '1px solid #4ade80' : '1px solid #1c2030', borderRadius: '6px', padding: '8px', color: '#e2e8f0' }}
                      />
                    </label>
                  ))}
                </div>
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
