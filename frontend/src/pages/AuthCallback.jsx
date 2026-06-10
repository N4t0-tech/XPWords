import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback({ onLogin }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      onLogin(token);
    }
    navigate('/home', { replace: true });
  }, []);

  return (
    <div className="xp" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#4b5563' }}>
      Iniciando sesión...
    </div>
  );
}
