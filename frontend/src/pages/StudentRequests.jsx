import { useState, useEffect } from 'react';
import SectionHeader from '../components/SectionHeader';
import Toast from '../components/Toast';
import { api } from '../api/client';

const statusLabels = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
};

const statusColors = {
  PENDING: '#f59e0b',
  APPROVED: '#6ee7b7',
  REJECTED: '#f87171',
};

export default function StudentRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [teacherId, setTeacherId] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '' });

  useEffect(() => {
    api.get('/class-requests').then(setRequests).catch(() => {});
    api.get('/users/teachers').then(setTeachers).catch(() => {});
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
      const updated = await api.get('/class-requests');
      setRequests(updated);
      setTopic('');
      setMessage('');
      setRequestedDate('');
      setToast({ show: true, msg: 'Solicitud enviada' });
    } catch (err) {
      setToast({ show: true, msg: err.message });
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
        <form className="xp-modal-form" onSubmit={handleSubmit}>
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
              style={{ background: '#13161f', border: '1px solid #1c2030', borderRadius: '7px', padding: '12px 14px', fontSize: '14px', color: '#e2e8f0', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical' }}
            />
          </div>
          <div className="xp-modal-field">
            <label htmlFor="req-date">Fecha preferida (opcional)</label>
            <input
              id="req-date"
              type="datetime-local"
              value={requestedDate}
              onChange={e => setRequestedDate(e.target.value)}
              style={{ background: '#13161f', border: '1px solid #1c2030', borderRadius: '7px', padding: '12px 14px', fontSize: '14px', color: '#e2e8f0', fontFamily: 'Inter, sans-serif', outline: 'none', colorScheme: 'dark' }}
            />
          </div>
          <button type="submit" className="xp-btn-primary" style={{ alignSelf: 'flex-start' }} disabled={sending}>
            {sending ? 'ENVIANDO...' : 'ENVIAR SOLICITUD'}
          </button>
        </form>
      </div>

      <SectionHeader icon="list" label="MIS SOLICITUDES" />

      {requests.length === 0 && (
        <p style={{ color: '#4b5563', fontSize: '14px', textAlign: 'center', padding: '2rem' }}>
          No has enviado ninguna solicitud
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {requests.map(r => (
          <div key={r.id} className="xp-res-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="xp-res-thumb link" style={{ background: '#1a1230', color: '#a78bfa' }}>
              <i className="ti ti-mail" aria-hidden="true" />
            </div>
            <div className="xp-res-info" style={{ flex: 1, minWidth: '200px' }}>
              <div className="xp-res-title">{r.topic}</div>
              <div className="xp-res-meta">
                Profesor: {r.teacherName || `#${r.teacherId}`}
              </div>
              {r.message && <div className="xp-res-meta" style={{ marginTop: '2px', color: '#6b7280' }}>{r.message}</div>}
              <div className="xp-res-meta" style={{ marginTop: '2px' }}>
                {formatDate(r.createdAt)}
              </div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: statusColors[r.status] || '#6b7280' }}>
              {statusLabels[r.status] || r.status}
            </span>
          </div>
        ))}
      </div>

      <Toast message={toast.msg} show={toast.show} onClose={() => setToast({ show: false, msg: '' })} />
    </div>
  );
}
