'use client';

import { useState } from 'react';

export default function ImpressumModal({ text }) {
  const [open, setOpen] = useState(false);
  const paragraphs = (text || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>
        Impressum &amp; Rechtliches
      </button>

      {open && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <div className="parchment modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="spread">
              <h2 className="mt-0">Impressum</h2>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setOpen(false)}>
                Schließen
              </button>
            </div>
            <div className="impressum-body">
              {paragraphs.map((p, i) => (
                <p key={i}>
                  {p.split('\n').map((line, j) => (
                    <span key={j}>
                      {j > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
