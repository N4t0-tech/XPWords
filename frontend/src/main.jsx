import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ToastProvider } from './components/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <ToastProvider>
      <App />
    </ToastProvider>
  </ErrorBoundary>,
);
