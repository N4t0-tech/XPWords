import { useState } from 'react';

export default function CollapsiblePanel({ icon, label, children, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false);

  return (
    <div className="xp-collapsible">
      <button className="xp-collapsible-hdr" onClick={() => setOpen(o => !o)}>
        <div className="xp-collapsible-hdr-left">
          <i className={`ti ti-${icon}`} aria-hidden="true" />
          <span>{label}</span>
        </div>
        <i className={`ti ti-chevron-${open ? 'up' : 'down'}`} aria-hidden="true" />
      </button>
      {open && <div className="xp-collapsible-body">{children}</div>}
    </div>
  );
}
