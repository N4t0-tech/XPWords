import { useState, useEffect } from 'react';
import SectionHeader from '../components/SectionHeader';
import Toast from '../components/Toast';
import { api } from '../api/client';

function WordEditor({ quizId, onBack }) {
  const [words, setWords] = useState([]);
  const [editingWord, setEditingWord] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '' });
  const [form, setForm] = useState({ word: '', hint: '', options: [''], correctIndex: 0 });

  useEffect(() => {
    api.get(`/quizzes/${quizId}/words`).then(setWords).catch(() => {});
  }, [quizId]);

  function resetForm() {
    setForm({ word: '', hint: '', options: [''], correctIndex: 0 });
  }

  function openCreate() {
    setEditingWord(null);
    resetForm();
    setShowForm(true);
  }

  function openEdit(w) {
    setEditingWord(w);
    setForm({
      word: w.word,
      hint: w.hint,
      options: JSON.parse(w.options || '[]'),
      correctIndex: w.correctIndex,
    });
    setShowForm(true);
  }

  function handleOptionChange(i, val) {
    const opts = [...form.options];
    opts[i] = val;
    setForm(p => ({ ...p, options: opts }));
  }

  function addOption() {
    setForm(p => ({ ...p, options: [...p.options, ''] }));
  }

  function removeOption(i) {
    const opts = form.options.filter((_, idx) => idx !== i);
    let ci = form.correctIndex;
    if (i < ci) ci--;
    else if (i === ci && ci >= opts.length) ci = opts.length - 1;
    setForm(p => ({ ...p, options: opts, correctIndex: Math.max(ci, 0) }));
  }

  async function handleSaveWord(e) {
    e.preventDefault();
    const payload = {
      word: form.word,
      hint: form.hint,
      options: JSON.stringify(form.options.filter(o => o.trim())),
      correctIndex: form.correctIndex,
    };
    try {
      if (editingWord) {
        const updated = await api.put(`/quizzes/${quizId}/words/${editingWord.id}`, payload);
        setWords(prev => prev.map(w => w.id === editingWord.id ? updated : w));
        setToast({ show: true, msg: 'Palabra actualizada' });
      } else {
        const created = await api.post(`/quizzes/${quizId}/words`, payload);
        setWords(prev => [...prev, created]);
        setToast({ show: true, msg: 'Palabra creada' });
      }
      setShowForm(false);
    } catch (err) {
      setToast({ show: true, msg: err.message });
    }
  }

  async function handleDeleteWord(wordId) {
    try {
      await api.delete(`/quizzes/${quizId}/words/${wordId}`);
      setWords(prev => prev.filter(w => w.id !== wordId));
      setToast({ show: true, msg: 'Palabra eliminada' });
    } catch (err) {
      setToast({ show: true, msg: err.message });
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
        <button onClick={onBack} style={{ background: '#13161f', border: '1px solid #1c2030', borderRadius: '6px', padding: '6px 12px', color: '#9ca3af', cursor: 'pointer', fontSize: '16px' }}>
          <i className="ti ti-arrow-left" />
        </button>
        <SectionHeader icon="vocabulary" label="PALABRAS DEL MINIJUEGO" />
        <button className="xp-btn-primary" onClick={openCreate}>AÑADIR PALABRA</button>
      </div>

      {words.map(w => {
        const opts = JSON.parse(w.options || '[]');
        return (
          <div key={w.id} style={{ background: '#0e1018', border: '1px solid #1c2030', borderRadius: '10px', padding: '1rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#e2e8f0' }}>{w.word}</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{w.hint}</div>
              <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {opts.map((o, i) => (
                  <span key={i} style={{ background: i === w.correctIndex ? '#1a3a1a' : '#13161f', padding: '2px 8px', borderRadius: '4px', color: i === w.correctIndex ? '#4ade80' : '#9ca3af', fontSize: '12px' }}>
                    {String.fromCharCode(65 + i)}) {o}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <button onClick={() => openEdit(w)} style={{ background: '#13161f', border: '1px solid #1c2030', borderRadius: '6px', padding: '6px 12px', color: '#9ca3af', cursor: 'pointer' }}>
                <i className="ti ti-pencil" />
              </button>
              <button onClick={() => handleDeleteWord(w.id)} style={{ background: '#2a1010', border: '1px solid #3a1515', borderRadius: '6px', padding: '6px 12px', color: '#f87171', cursor: 'pointer' }}>
                <i className="ti ti-trash" />
              </button>
            </div>
          </div>
        );
      })}

      {words.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#4b5563' }}>Este minijuego no tiene palabras todavía</div>
      )}

      {showForm && (
        <div className="xp-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="xp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <button className="xp-modal-close" onClick={() => setShowForm(false)}>✕</button>
            <div className="xp-section-hdr" style={{ marginBottom: '1.2rem' }}>
              <i className="ti ti-vocabulary" />
              <span>{editingWord ? 'EDITAR PALABRA' : 'NUEVA PALABRA'}</span>
            </div>
            <form className="xp-modal-form" onSubmit={handleSaveWord}>
              <div className="xp-modal-field">
                <label>Palabra</label>
                <input type="text" value={form.word} onChange={e => setForm(p => ({ ...p, word: e.target.value }))} required />
              </div>
              <div className="xp-modal-field">
                <label>Pista</label>
                <input type="text" value={form.hint} onChange={e => setForm(p => ({ ...p, hint: e.target.value }))} required />
              </div>
              <div className="xp-modal-field">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Opciones</span>
                  <span onClick={addOption} style={{ color: '#6ee7b7', cursor: 'pointer', fontSize: '13px' }}>+ Añadir opción</span>
                </label>
                {form.options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <input
                      type="radio"
                      name="correct"
                      checked={form.correctIndex === i}
                      onChange={() => setForm(p => ({ ...p, correctIndex: i }))}
                      style={{ accentColor: '#4ade80' }}
                    />
                    <span style={{ color: form.correctIndex === i ? '#4ade80' : '#9ca3af', fontWeight: 600, width: '18px', fontSize: '13px' }}>{String.fromCharCode(65 + i)}</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={e => handleOptionChange(i, e.target.value)}
                      placeholder={`Opción ${String.fromCharCode(65 + i)}`}
                      required
                      style={{ flex: 1, background: '#13161f', border: '1px solid #1c2030', borderRadius: '6px', padding: '8px', color: '#e2e8f0' }}
                    />
                    {form.options.length > 2 && (
                      <span onClick={() => removeOption(i)} style={{ color: '#f87171', cursor: 'pointer', fontSize: '16px' }}><i className="ti ti-x" /></span>
                    )}
                  </div>
                ))}
              </div>
              <button type="submit" className="xp-btn-primary" style={{ width: '100%' }}>
                {editingWord ? 'GUARDAR CAMBIOS' : 'CREAR PALABRA'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Toast message={toast.msg} show={toast.show} onClose={() => setToast({ show: false, msg: '' })} />
    </div>
  );
}

export default function TeacherQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [openQuizId, setOpenQuizId] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: '' });

  useEffect(() => {
    api.get('/quizzes').then(setQuizzes).catch(() => {});
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ title: '', description: '' });
    setShowForm(true);
  }

  function openEdit(q) {
    setEditing(q);
    setForm({ title: q.title, description: q.description || '' });
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      if (editing) {
        const updated = await api.put(`/quizzes/${editing.id}`, form);
        setQuizzes(prev => prev.map(q => q.id === editing.id ? updated : q));
        setToast({ show: true, msg: 'Minijuego actualizado' });
      } else {
        const created = await api.post('/quizzes', form);
        setQuizzes(prev => [...prev, created]);
        setToast({ show: true, msg: 'Minijuego creado' });
      }
      setShowForm(false);
    } catch (err) {
      setToast({ show: true, msg: err.message });
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/quizzes/${id}`);
      setQuizzes(prev => prev.filter(q => q.id !== id));
      if (openQuizId === id) setOpenQuizId(null);
      setToast({ show: true, msg: 'Minijuego eliminado' });
    } catch (err) {
      setToast({ show: true, msg: err.message });
    }
  }

  if (openQuizId) {
    const quiz = quizzes.find(q => q.id === openQuizId);
    return (
      <div className="xp-body">
        <WordEditor quizId={openQuizId} onBack={() => setOpenQuizId(null)} />
      </div>
    );
  }

  return (
    <div className="xp-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <SectionHeader icon="gamepad" label="MINIJUEGOS" />
        <button className="xp-btn-primary" onClick={openCreate}>CREAR MINIJUEGO</button>
      </div>

      {quizzes.map(q => (
        <div key={q.id} style={{ background: '#0e1018', border: '1px solid #1c2030', borderRadius: '10px', padding: '1rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => setOpenQuizId(q.id)}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#e2e8f0' }}>{q.title}</div>
            {q.description && <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{q.description}</div>}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <button onClick={() => openEdit(q)} style={{ background: '#13161f', border: '1px solid #1c2030', borderRadius: '6px', padding: '6px 12px', color: '#9ca3af', cursor: 'pointer' }}>
              <i className="ti ti-pencil" />
            </button>
            <button onClick={() => handleDelete(q.id)} style={{ background: '#2a1010', border: '1px solid #3a1515', borderRadius: '6px', padding: '6px 12px', color: '#f87171', cursor: 'pointer' }}>
              <i className="ti ti-trash" />
            </button>
          </div>
        </div>
      ))}

      {quizzes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#4b5563' }}>No hay minijuegos todavía</div>
      )}

      {showForm && (
        <div className="xp-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="xp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button className="xp-modal-close" onClick={() => setShowForm(false)}>✕</button>
            <div className="xp-section-hdr" style={{ marginBottom: '1.2rem' }}>
              <i className="ti ti-gamepad" />
              <span>{editing ? 'EDITAR MINIJUEGO' : 'NUEVO MINIJUEGO'}</span>
            </div>
            <form className="xp-modal-form" onSubmit={handleSave}>
              <div className="xp-modal-field">
                <label>Título</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div className="xp-modal-field">
                <label>Descripción (opcional)</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ background: '#13161f', border: '1px solid #1c2030', borderRadius: '6px', padding: '8px', color: '#e2e8f0', width: '100%', fontFamily: 'inherit', fontSize: '13px', resize: 'vertical' }} />
              </div>
              <button type="submit" className="xp-btn-primary" style={{ width: '100%' }}>
                {editing ? 'GUARDAR CAMBIOS' : 'CREAR MINIJUEGO'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Toast message={toast.msg} show={toast.show} onClose={() => setToast({ show: false, msg: '' })} />
    </div>
  );
}
