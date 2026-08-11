'use client';

import { useRef, useState } from 'react';

export default function GallerySection({ gallery }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const formRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const form = formRef.current;
    const file = form.file.files[0];
    if (!file) {
      setError('Bitte wähle ein Bild aus.');
      return;
    }
    setStatus('sending');
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('name', form.name.value);
      data.append('caption', form.caption.value);
      const res = await fetch('/api/public/gallery', { method: 'POST', body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Hochladen fehlgeschlagen');
      setStatus('done');
      form.reset();
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  }

  return (
    <section id="galerie" className="section">
      <div className="spread">
        <h2 className="section-title mt-0">Die königliche Bildergalerie</h2>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => setOpen((v) => !v)}>
          {open ? 'Schließen' : 'Foto einreichen'}
        </button>
      </div>

      {open && (
        <form ref={formRef} className="panel gallery-form" onSubmit={handleSubmit}>
          {status === 'done' ? (
            <p className="center-text">
              Dank sei Euch! Euer Bild wandert zur Prüfung durch den Hofmarschall, ehe es hier erscheint.
            </p>
          ) : (
            <>
              <div className="field">
                <label className="label" htmlFor="gallery-file">Bild</label>
                <input id="gallery-file" name="file" type="file" accept="image/*" className="input" required />
              </div>
              <div className="field">
                <label className="label" htmlFor="gallery-name">Euer Name (optional)</label>
                <input id="gallery-name" name="name" type="text" className="input" maxLength={60} />
              </div>
              <div className="field">
                <label className="label" htmlFor="gallery-caption">Bildunterschrift (optional)</label>
                <input id="gallery-caption" name="caption" type="text" className="input" maxLength={200} />
              </div>
              {error && <p className="form-error">{error}</p>}
              <button type="submit" className="btn btn-gold btn-block" disabled={status === 'sending'}>
                {status === 'sending' ? 'Wird gesendet …' : 'Einreichen'}
              </button>
            </>
          )}
        </form>
      )}

      {gallery?.length ? (
        <div className="gallery-grid">
          {gallery.map((photo) => (
            <figure key={photo.id} className="gallery-item">
              <img src={photo.url} alt={photo.caption || 'Foto vom Hoffest'} loading="lazy" />
              {(photo.caption || photo.name) && (
                <figcaption>
                  {photo.caption}
                  {photo.name && <span className="gallery-item-name"> — {photo.name}</span>}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      ) : (
        <p className="muted center-text">Noch hängen keine Bilder in der Galerie des Hofes.</p>
      )}
    </section>
  );
}
