'use client';

import { useState } from 'react';

export default function RsvpSection() {
  const [name, setName] = useState('');
  const [attending, setAttending] = useState('yes');
  const [guestCount, setGuestCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Bitte euren Namen eintragen.');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/public/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, attending, guestCount, notes })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Senden fehlgeschlagen');
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  }

  return (
    <section id="zusage" className="section">
      <h2 className="section-title">Zu- oder Absage</h2>
      <form className="panel" onSubmit={handleSubmit}>
        {status === 'done' ? (
          <p className="center-text">
            {attending === 'yes'
              ? 'Eure Zusage ist beim Hofmarschall eingetroffen — wir freuen uns auf Euch!'
              : 'Schade, aber danke für die Rückmeldung.'}
          </p>
        ) : (
          <div className="stack">
            <div className="field">
              <label className="label" htmlFor="rsvp-name">Euer Name</label>
              <input id="rsvp-name" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required />
            </div>

            <div className="field">
              <span className="label">Kommt Ihr zum Hoffest?</span>
              <div className="inline-form">
                <button
                  type="button"
                  className={`btn btn-sm ${attending === 'yes' ? 'btn-gold' : 'btn-ghost'}`}
                  onClick={() => setAttending('yes')}
                >
                  Wir kommen
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${attending === 'no' ? 'btn-gold' : 'btn-ghost'}`}
                  onClick={() => setAttending('no')}
                >
                  Wir können leider nicht
                </button>
              </div>
            </div>

            {attending === 'yes' && (
              <div className="field" style={{ maxWidth: 160 }}>
                <label className="label" htmlFor="rsvp-count">Anzahl Personen (inkl. Euch)</label>
                <input
                  id="rsvp-count"
                  className="input"
                  type="number"
                  min="1"
                  max="20"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                />
              </div>
            )}

            <div className="field">
              <label className="label" htmlFor="rsvp-notes">Allergien, Essenswünsche oder Anmerkungen (optional)</label>
              <textarea
                id="rsvp-notes"
                className="textarea"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={300}
              />
            </div>

            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-gold" disabled={status === 'sending'}>
              {status === 'sending' ? 'Wird gesendet …' : 'Rückmeldung senden'}
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
