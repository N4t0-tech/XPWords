import { useEffect } from 'react';

export default function Toast({ message, show, onClose }) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onClose, 2000);
      return () => clearTimeout(t);
    }
  }, [show, onClose]);

  return (
    <div className={`xp-toast${show ? ' show' : ''}`}>
      <i className="ti ti-bolt" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
