import { useState, useEffect } from 'react';
import SectionHeader from '../components/SectionHeader';
import Skeleton from '../components/Skeleton';
import { api } from '../api/client';
import { useToast } from '../components/ToastContext';

const GAMES = [
  { id: 'wordsnap', icon: '🎯', title: 'WordSnap', desc: 'Adivina el significado' },
  { id: 'linkwords', icon: '🔗', title: 'LinkWords', desc: 'Conecta palabras con definiciones' },
  { id: 'sentencefix', icon: '🧩', title: 'SentenceFix', desc: 'Ordena oraciones' },
  { id: 'listenup', icon: '👂', title: 'ListenUp', desc: 'Escucha y escribe' },
];

function WordEditor({ game, onBack }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState([]);
  const [editingWord, setEditingWord] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ word: '', hint: '', options: [''], correctIndex: 0 });

  useEffect(() => {
    api.get(`/words?gameType=${game.id}`).then(data => {
      setWords(data.map(w => ({
        ...w,
        options: typeof w.options === 'string' ? JSON.parse(w.options) : w.options,
      })));
    }).catch(err => showToast(err.message)).finally(() => setLoading(false));
  }, [game.id]);

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
      options: [...(w.options || [])],
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
    else if (i === ci && ci >= opts.length) ci = Math.max(opts.length - 1, 0);
    setForm(p => ({ ...p, options: opts, correctIndex: Math.max(ci, 0) }));
  }

  async function handleSaveWord(e) {
    e.preventDefault();
    const payload = {
      word: form.word,
      hint: form.hint,
      options: JSON.stringify(form.options.filter(o => o.trim())),
      correctIndex: form.correctIndex,
      gameType: game.id,
    };
    try {
      if (editingWord) {
        const updated = await api.put(`/words/${editingWord.id}`, payload);
        updated.options = typeof updated.options === 'string' ? JSON.parse(updated.options) : updated.options;
        setWords(prev => prev.map(w => w.id === editingWord.id ? updated : w));
        showToast('Palabra actualizada');
      } else {
        const created = await api.post('/words', payload);
        created.options = typeof created.options === 'string' ? JSON.parse(created.options) : created.options;
        setWords(prev => [...prev, created]);
        showToast('Palabra creada');
      }
      setShowForm(false);
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleDeleteWord(wordId) {
    try {
      await api.delete(`/words/${wordId}`);
      setWords(prev => prev.filter(w => w.id !== wordId));
      showToast('Palabra eliminada');
    } catch (err) {
      showToast(err.message);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
        <button onClick={onBack} style={{ background: '#13161f', border: '1px solid #1c2030', borderRadius: '6px', padding: '6px 12px', color: '#9ca3af', cursor: 'pointer', fontSize: '16px' }}>
          <i className="ti ti-arrow-left" />
        </button>
        <SectionHeader icon="vocabulary" label={`${game.title} — PALABRAS`} />
        <button className="xp-btn-primary" onClick={openCreate}>AÑADIR PALABRA</button>
      </div>

      {loading
        ? <div>{[1,2,3,4].map(i => (
            <div key={i} style={{ background: '#0e1018', border: '1px solid #1c2030', borderRadius: '10px', padding: '1rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Skeleton width="40%" height={16} />
                <Skeleton width="60%" height={14} />
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  {[1,2,3,4].map(j => <Skeleton key={j} width={60} height={22} borderRadius={4} />)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Skeleton width={32} height={32} borderRadius={6} />
                <Skeleton width={32} height={32} borderRadius={6} />
              </div>
            </div>
          ))}</div>
        : <>
            <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '1rem' }}>{words.length} palabras</div>
            {words.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#4b5563' }}>Este juego no tiene palabras todavía</div>
            )}
            {words.map(w => (
        <div key={w.id} style={{ background: '#0e1018', border: '1px solid #1c2030', borderRadius: '10px', padding: '1rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#e2e8f0' }}>{w.word}</div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{w.hint}</div>
            <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {(w.options || []).map((o, i) => (
                <span key={i} style={{ background: i === w.correctIndex ? '#1a3a1a' : '#13161f', padding: '2px 8px', borderRadius: '4px', color: i === w.correctIndex ? '#4ade80' : '#9ca3af' }}>
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
      ))}

      {showForm && (
        <div className="xp-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="xp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <button className="xp-modal-close" onClick={() => setShowForm(false)}>✕</button>
            <div className="xp-section-hdr" style={{ marginBottom: '1.2rem' }}>
              <i className="ti ti-vocabulary" />
              <span>{editingWord ? 'EDITAR PALABRA' : 'NUEVA PALABRA'} · {game.title}</span>
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
                    <input type="radio" name="correct" checked={form.correctIndex === i} onChange={() => setForm(p => ({ ...p, correctIndex: i }))} style={{ accentColor: '#4ade80' }} />
                    <span style={{ color: form.correctIndex === i ? '#4ade80' : '#9ca3af', fontWeight: 600, width: '18px', fontSize: '13px' }}>{String.fromCharCode(65 + i)}</span>
                    <input type="text" value={opt} onChange={e => handleOptionChange(i, e.target.value)} placeholder={`Opción ${String.fromCharCode(65 + i)}`} required style={{ flex: 1, background: '#13161f', border: '1px solid #1c2030', borderRadius: '6px', padding: '8px', color: '#e2e8f0' }} />
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
      </>
      }

    </div>
  );
}

export default function TeacherQuizzes() {
  const [selected, setSelected] = useState(null);

  if (selected) {
    const game = GAMES.find(g => g.id === selected);
    return (
      <div className="xp-body">
        <WordEditor game={game} onBack={() => setSelected(null)} />
      </div>
    );
  }

  return (
    <div className="xp-body">
      <SectionHeader icon="device-gamepad-2" label="MINIJUEGOS" />
      <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '14px' }}>Seleccioná un juego para editar su vocabulario</p>

      {GAMES.map(g => (
        <div
          key={g.id}
          onClick={() => setSelected(g.id)}
          style={{ background: '#0e1018', border: '1px solid #1c2030', borderRadius: '10px', padding: '1rem 1.2rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
        >
          <div style={{ fontSize: '28px' }}>{g.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#e2e8f0' }}>{g.title}</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>{g.desc}</div>
          </div>
          <span style={{ color: '#4b5563' }}><i className="ti ti-chevron-right" /></span>
        </div>
      ))}
    </div>
  );
}
