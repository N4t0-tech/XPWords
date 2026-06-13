import { useState, useEffect } from 'react';
import SectionHeader from '../components/SectionHeader';
import Skeleton from '../components/Skeleton';
import { api } from '../api/client';
import { useToast } from '../components/ToastContext';

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
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    api.get('/class-requests?as=teacher').then(setRequests).catch(err => showToast(err.message)).finally(() => setLoading(false));
  }, []);

  async function handleStatus(id, status) {
    try {
      await api.put(`/class-requests/${id}/status`, { status });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      const label = status === 'APPROVED' ? 'aprobada' : 'rechazada';
      showToast(`Solicitud ${label}`);
    } catch (err) {
      showToast(err.message);
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

      {loading
        ? <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4].map(i => (
              <div key={i} className="xp-res-item" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Skeleton width={44} height={44} borderRadius={10} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Skeleton width="40%" height={16} />
                  <Skeleton width="60%" height={14} />
                </div>
                <Skeleton width={80} height={30} borderRadius={6} />
              </div>
            ))}
          </div>
        : <>
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
          </>
      }

    </div>
  );
}
