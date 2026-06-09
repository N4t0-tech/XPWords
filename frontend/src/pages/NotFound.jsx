import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="xp-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1rem' }}>
      <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: '5rem', fontWeight: 700, color: '#6ee7b7' }}>404</div>
      <p style={{ fontSize: '14px', color: '#6b7280' }}>Esta página no existe</p>
      <Link to="/" className="xp-next-btn" style={{ textDecoration: 'none' }}>Volver al inicio</Link>
    </div>
  );
}
