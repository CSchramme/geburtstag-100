'use client';

import { useState } from 'react';

export default function GuestbookSection({ guestbook, theme }) {
  const labels = theme.labels;
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !message.trim()) {
      setError('Bitte Name und Botschaft eintragen.');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/public/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Senden fehlgeschlagen');
      setStatus('done');
      setName('');
      setMessage('');
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  }

  return (
    <section id="gaestebuch" className="section">
      <h2 className="section-title">{labels.guestbookSectionHeading}</h2>

      <form className="panel" onSubmit={handleSubmit}>
        {status === 'done' ? (
          <p className="center-text">{labels.guestbookSubmitThanks}</p>
        ) : (
          <div className="stack">
            <div className="field">
              <label className="label" htmlFor="gb-name">Euer Name</label>
              <input
                id="gb-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                required
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="gb-message">Eure Botschaft an das Jubelpaar</label>
              <textarea
                id="gb-message"
                className="textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                required
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-gold" disabled={status === 'sending'}>
              {status === 'sending' ? 'Wird eingetragen …' : 'Ins Gästebuch eintragen'}
            </button>
          </div>
        )}
      </form>

      {guestbook?.length ? (
        <ul className="guestbook-list">
          {guestbook
            .slice()
            .reverse()
            .map((entry) => (
              <li key={entry.id} className="guestbook-entry">
                <p>„{entry.message}"</p>
                <span className="guestbook-author">— {entry.name}</span>
              </li>
            ))}
        </ul>
      ) : (
        <p className="muted center-text">Noch ist das Buch leer – seid die Ersten, die sich eintragen!</p>
      )}
    </section>
  );
}
