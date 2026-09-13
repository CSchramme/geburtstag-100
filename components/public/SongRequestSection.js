'use client';

import { useState } from 'react';

export default function SongRequestSection() {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!text.trim()) {
      setError('Bitte einen Songwunsch eintragen.');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/public/song-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, text })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Senden fehlgeschlagen');
      setStatus('done');
      setName('');
      setText('');
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  }

  return (
    <section id="wunschlied" className="section">
      <h2 className="section-title">Wunschlied für den Hofmusikus</h2>
      <form className="panel" onSubmit={handleSubmit}>
        {status === 'done' ? (
          <p className="center-text">Der Wunsch ist beim Hofmusikus angekommen — er entscheidet, wann er passt.</p>
        ) : (
          <div className="stack">
            <div className="field">
              <label className="label" htmlFor="sr-name">Euer Name (optional)</label>
              <input id="sr-name" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
            </div>
            <div className="field">
              <label className="label" htmlFor="sr-text">Song oder Künstler</label>
              <input
                id="sr-text"
                className="input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={200}
                placeholder="z.B. Freddy Mercury – Don't Stop Me Now"
                required
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-gold" disabled={status === 'sending'}>
              {status === 'sending' ? 'Wird gesendet …' : 'Wunsch einreichen'}
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
