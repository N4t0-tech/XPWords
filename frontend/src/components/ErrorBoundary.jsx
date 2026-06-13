import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="xp" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem', color: '#e2e8f0' }}>
          <div style={{ fontSize: '3rem' }}>💥</div>
          <h2 style={{ color: '#f87171' }}>Algo salió mal</h2>
          <p style={{ color: '#6b7280', textAlign: 'center', maxWidth: '400px' }}>
            Ocurrió un error inesperado. Recargá la página para intentar de nuevo.
          </p>
          <button onClick={() => window.location.reload()} className="xp-btn-primary">RECARGAR</button>
        </div>
      );
    }
    return this.props.children;
  }
}
