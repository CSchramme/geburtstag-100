'use client';

import { useState } from 'react';
import { useLiveState } from '@/lib/useLiveState';
import { lastNameInitial } from '@/lib/seating';
import { resolveTheme } from '@/lib/theme';
import ThemeStyle from '@/components/ThemeStyle';
import Crest from '@/components/Crest';

export default function CheckInApp() {
  const { state } = useLiveState();
  const [query, setQuery] = useState('');
  const [letter, setLetter] = useState('');
  const [searched, setSearched] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(null);
  const [error, setError] = useState('');

  if (!state) {
    return (
      <div className="page-loading">
        <p className="label">Einen Moment …</p>
      </div>
    );
  }

  const theme = resolveTheme(state.theme);
  const roster = state.checkinRoster || [];
  const presentSet = new Set(state.checkedIn || []);

  function handleQueryChange(e) {
    setQuery(e.target.value);
    setLetter('');
    setSearched(false);
    setError('');
  }

  function handleSearch(e) {
    e.preventDefault();
    setSearched(true);
  }

  async function doCheckIn(ref, name) {
    setError('');
    try {
      const res = await fetch('/api/public/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Einchecken fehlgeschlagen');
      setJustCheckedIn(json.name);
    } catch (err) {
      setError(err.message);
    }
  }

  const needle = searched ? query.trim().toLowerCase() : '';
  const rawMatches = needle ? roster.filter((p) => p.name.toLowerCase().includes(needle)) : [];
  const needsLetter = rawMatches.length > 1 && !letter.trim();
  const finalMatches = needsLetter
    ? []
    : rawMatches.length > 1
      ? rawMatches.filter((p) => lastNameInitial(p.name) === letter.trim()[0].toUpperCase())
      : rawMatches;

  return (
    <div className="page checkin-page">
      <ThemeStyle cssVars={theme.cssVars} />
      <div className="container checkin-inner">
        <Crest size={100} preset={theme.preset} coupleNames={state.party.coupleNames} />
        <h1 className="public-title" style={{ marginTop: 16 }}>Willkommen!</h1>
        <p className="hero-intro center-text">{state.party.coupleNames}</p>

        {justCheckedIn ? (
          <div className="panel center-text checkin-done">
            <p className="section-title" style={{ marginTop: 0 }}>Willkommen, {justCheckedIn}!</p>
            <p className="muted">Ihr seid eingecheckt — schaut auf die Leinwand!</p>
          </div>
        ) : (
          <form className="panel" onSubmit={handleSearch}>
            <div className="field">
              <label className="label" htmlFor="checkin-search">Euer Name</label>
              <div className="inline-form">
                <input
                  id="checkin-search"
                  className="input"
                  value={query}
                  onChange={handleQueryChange}
                  placeholder="z.B. Max Mustermann"
                  autoFocus
                />
                <button type="submit" className="btn btn-gold btn-sm">Suchen</button>
              </div>
            </div>

            {needsLetter && (
              <div className="field" style={{ marginTop: 12 }}>
                <label className="label" htmlFor="checkin-letter">
                  Diesen Namen gibt es mehrfach — erster Buchstabe des Nachnamens?
                </label>
                <input
                  id="checkin-letter"
                  className="input"
                  style={{ maxWidth: 80 }}
                  maxLength={1}
                  value={letter}
                  onChange={(e) => setLetter(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            {error && <p className="form-error" style={{ marginTop: 12 }}>{error}</p>}

            {!needsLetter && searched && needle && finalMatches.length === 0 && (
              <p className="small muted center-text" style={{ marginTop: 12 }}>
                {theme.labels.checkinNotFound}
              </p>
            )}

            {!needsLetter && finalMatches.length > 0 && (
              <ul className="admin-list" style={{ marginTop: 12 }}>
                {finalMatches.map((p) => {
                  const already = presentSet.has(p.ref);
                  return (
                    <li key={p.ref} className="admin-list-row">
                      <div className="admin-list-body"><strong>{p.name}</strong></div>
                      <div className="admin-list-actions">
                        {already ? (
                          <span className="badge badge-green">Schon da</span>
                        ) : (
                          <button type="button" className="btn btn-gold btn-sm" onClick={() => doCheckIn(p.ref, p.name)}>
                            Ich bin da!
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
