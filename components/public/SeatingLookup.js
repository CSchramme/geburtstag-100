'use client';

import { useState } from 'react';

export default function SeatingLookup({ seating }) {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);

  const tables = seating?.tables || [];

  function handleSearch(e) {
    e.preventDefault();
    setSearched(true);
  }

  const needle = query.trim().toLowerCase();
  const matches = needle
    ? tables.filter((t) => t.guestNames.some((n) => n.toLowerCase().includes(needle)))
    : [];

  return (
    <section id="sitzplatz" className="section">
      <h2 className="section-title">Wo sitze ich?</h2>
      <form className="panel" onSubmit={handleSearch}>
        <div className="field">
          <label className="label" htmlFor="seating-search">Euer Name</label>
          <div className="inline-form">
            <input
              id="seating-search"
              className="input"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearched(false);
              }}
              placeholder="z.B. Max Mustermann"
            />
            <button type="submit" className="btn btn-gold btn-sm">Suchen</button>
          </div>
        </div>

        {searched && needle && (
          matches.length ? (
            <div className="stack" style={{ marginTop: 12 }}>
              {matches.map((t) => (
                <p key={t.id} className="center-text">
                  Ihr sitzt an: <strong>{t.name}</strong>
                  {t.guestNames.length > 1 && (
                    <><br /><span className="small muted">gemeinsam mit {t.guestNames.filter((n) => !n.toLowerCase().includes(needle)).join(', ') || 'niemandem weiter'}</span></>
                  )}
                </p>
              ))}
            </div>
          ) : (
            <p className="small muted center-text" style={{ marginTop: 12 }}>
              Kein Eintrag gefunden — fragt am Empfang nach.
            </p>
          )
        )}
      </form>
    </section>
  );
}
