import { createContext, useContext, useState, useCallback } from 'react';
import Toast from './Toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ show: false, msg: '' });
  const showToast = useCallback((msg) => setToast({ show: true, msg }), []);
  const hideToast = useCallback(() => setToast({ show: false, msg: '' }), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast message={toast.msg} show={toast.show} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
