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

export default function TeacherRequests() {
  const [requests, setRequests] = useState([]);
  const [toast, setToast] = useState({ show: false, msg: '' });

  useEffect(() => {
    api.get('/class-requests?as=teacher').then(setRequests).catch(() => {});
  }, []);

  async function handleStatus(id, status) {
    try {
      await api.put(`/class-requests/${id}/status`, { status });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      const label = status === 'APPROVED' ? 'aprobada' : 'rechazada';
      setToast({ show: true, msg: `Solicitud ${label}` });
    } catch (err) {
      setToast({ show: true, msg: err.message });
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="xp-body">
      <SectionHeader icon="messages" label="SOLICITUDES DE CLASES" />

      {requests.length === 0 && (
        <p style={{ color: '#4b5563', fontSize: '14px', textAlign: 'center', padding: '2rem' }}>
          No tienes solicitudes pendientes
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {requests.map(r => (
          <div key={r.id} className="xp-res-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="xp-res-thumb link" style={{ background: '#1a1230', color: '#a78bfa' }}>
              <i className="ti ti-user-question" aria-hidden="true" />
            </div>
            <div className="xp-res-info" style={{ flex: 1, minWidth: '200px' }}>
              <div className="xp-res-title">{r.topic}</div>
              <div className="xp-res-meta">
                {r.studentName || `Estudiante #${r.studentId}`} · {r.message || 'Sin mensaje'}
              </div>
              <div className="xp-res-meta" style={{ marginTop: '2px' }}>
                Fecha solicitada: {formatDate(r.requestedDate)} · Creado: {formatDate(r.createdAt)}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: statusColors[r.status] || '#6b7280' }}>
                {statusLabels[r.status] || r.status}
              </span>
              {r.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleStatus(r.id, 'APPROVED')}
                    className="xp-btn-sm"
                    style={{ background: '#0d2420', border: '1px solid #2d4a40', borderRadius: '6px', padding: '6px 14px', fontSize: '13px', color: '#6ee7b7', cursor: 'pointer' }}
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleStatus(r.id, 'REJECTED')}
                    className="xp-btn-sm"
                    style={{ background: '#2a1010', border: '1px solid #3a1515', borderRadius: '6px', padding: '6px 14px', fontSize: '13px', color: '#f87171', cursor: 'pointer' }}
                  >
                    Rechazar
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <Toast message={toast.msg} show={toast.show} onClose={() => setToast({ show: false, msg: '' })} />
    </div>
  );
}
