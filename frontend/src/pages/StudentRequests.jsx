import { useState, useEffect } from 'react';
import SectionHeader from '../components/SectionHeader';
import Skeleton from '../components/Skeleton';
import { api } from '../api/client';
import { useToast } from '../components/ToastContext';

export default function StudentRequests({ user }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [teacherId, setTeacherId] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/class-requests?as=student').then(setRequests).catch(err => showToast(err.message)),
      api.get('/users/teachers').then(setTeachers).catch(err => showToast(err.message)),
    ]).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!teacherId || !topic.trim()) return;
    setSending(true);
    try {
      const body = {
        teacherId: parseInt(teacherId),
        topic: topic.trim(),
        message: message.trim() || undefined,
        requestedDate: requestedDate ? new Date(requestedDate).toISOString() : undefined,
      };
      await api.post('/class-requests', body);
      const updated = await api.get('/class-requests?as=student');
      setRequests(updated);
      setTopic('');
      setMessage('');
      setRequestedDate('');
      showToast('Solicitud enviada');
    } catch (err) {
      showToast(err.message);
    } finally {
      setSending(false);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="xp-body">
      <SectionHeader icon="messages" label="SOLICITAR CLASE PRIVADA" />

      <div className="xp-settings-card" style={{ marginBottom: '2rem' }}>
        {loading
          ? <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Skeleton width="100%" height={44} borderRadius={7} />
              <Skeleton width="100%" height={44} borderRadius={7} />
              <Skeleton width="100%" height={88} borderRadius={7} />
              <Skeleton width="100%" height={44} borderRadius={7} />
              <Skeleton width={160} height={44} borderRadius={7} />
            </div>
          : <form className="xp-modal-form" onSubmit={handleSubmit}>
          <div className="xp-modal-field">
            <label htmlFor="req-teacher">Profesor</label>
            <select id="req-teacher" value={teacherId} onChange={e => setTeacherId(e.target.value)} required>
              <option value="">Seleccionar profesor</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="xp-modal-field">
            <label htmlFor="req-topic">Tema</label>
            <input id="req-topic" type="text" placeholder="Ej: Present Perfect" value={topic} onChange={e => setTopic(e.target.value)} required />
          </div>
          <div className="xp-modal-field">
            <label htmlFor="req-message">Mensaje (opcional)</label>
            <textarea
              id="req-message"
              rows={3}
              placeholder="¿Sobre qué te gustaría trabajar?"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>
          <div className="xp-modal-field">
            <label htmlFor="req-date">Fecha preferida (opcional)</label>
              <input
                id="req-date"
                type="datetime-local"
                value={requestedDate}
                onChange={e => setRequestedDate(e.target.value)}
              />
          </div>
          <button type="submit" className="xp-btn-primary" style={{ alignSelf: 'flex-start' }} disabled={sending}>
            {sending ? 'ENVIANDO...' : 'ENVIAR SOLICITUD'}
          </button>
          </form>
        }
      </div>

      <SectionHeader icon="list" label="MIS SOLICITUDES" />

      {loading
        ? <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => (
              <div key={i} className="xp-res-item" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Skeleton width={44} height={44} borderRadius={10} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Skeleton width="40%" height={16} />
                  <Skeleton width="60%" height={14} />
                </div>
                <Skeleton width={60} height={24} borderRadius={4} />
              </div>
            ))}
          </div>
        : <>
            {requests.length === 0 && (
              <p style={{ color: 'var(--text-muted2)', fontSize: '14px', textAlign: 'center', padding: '2rem' }}>
                No has enviado ninguna solicitud
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {requests.map(r => (
          <div key={r.id} className="xp-res-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="xp-res-thumb link" style={{ background: 'var(--bg-purple)', color: 'var(--purple)' }}>
              <i className="ti ti-mail" aria-hidden="true" />
            </div>
            <div className="xp-res-info" style={{ flex: 1, minWidth: '200px' }}>
              <div className="xp-res-title">{r.topic}</div>
              <div className="xp-res-meta">
                Profesor: {r.teacherName || `#${r.teacherId}`}
              </div>
              {r.message && <div className="xp-res-meta" style={{ marginTop: '2px', color: 'var(--text-muted)' }}>{r.message}</div>}
              <div className="xp-res-meta" style={{ marginTop: '2px' }}>
                {formatDate(r.createdAt)}
              </div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: {PENDING:'var(--gold)',APPROVED:'var(--accent)',REJECTED:'var(--red)'}[r.status] || 'var(--text-muted)' }}>
              {{PENDING:'Pendiente',APPROVED:'Aprobada',REJECTED:'Rechazada'}[r.status] || r.status}
            </span>
          </div>
        ))}
            </div>
          </>
      }

    </div>
  );
}
