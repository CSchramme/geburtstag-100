'use client';

import { useState } from 'react';
import { lastNameInitial, CANVAS_WIDTH, CANVAS_HEIGHT } from '@/lib/seating';

export default function SeatingLookup({ seating }) {
  const [query, setQuery] = useState('');
  const [letter, setLetter] = useState('');
  const [searched, setSearched] = useState(false);

  const tables = seating?.tables || [];
  const walls = seating?.walls || [];

  function handleSearch(e) {
    e.preventDefault();
    setSearched(true);
  }

  function handleQueryChange(e) {
    setQuery(e.target.value);
    setLetter('');
    setSearched(false);
  }

  const people = tables.flatMap((t) =>
    t.guestNames.map((name) => ({ name, tableId: t.id, tableName: t.name }))
  );

  const needle = query.trim().toLowerCase();
  const rawMatches = needle ? people.filter((p) => p.name.toLowerCase().includes(needle)) : [];

  const needsLetter = rawMatches.length > 1 && !letter.trim();
  const finalMatches = needsLetter
    ? []
    : rawMatches.length > 1
      ? rawMatches.filter((p) => lastNameInitial(p.name) === letter.trim()[0].toUpperCase())
      : rawMatches;

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
              onChange={handleQueryChange}
              placeholder="z.B. Max Mustermann"
            />
            <button type="submit" className="btn btn-gold btn-sm">Suchen</button>
          </div>
        </div>

        {searched && needle && (
          <>
            {needsLetter && (
              <div className="field" style={{ marginTop: 12 }}>
                <label className="label" htmlFor="seating-letter">
                  Diesen Namen gibt es mehrfach — erster Buchstabe des Nachnamens?
                </label>
                <input
                  id="seating-letter"
                  className="input"
                  style={{ maxWidth: 80 }}
                  maxLength={1}
                  value={letter}
                  onChange={(e) => setLetter(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            {!needsLetter && finalMatches.length === 1 && (
              <div style={{ marginTop: 12 }}>
                <p className="center-text">
                  Ihr sitzt an: <strong>{finalMatches[0].tableName}</strong>
                </p>
                <SeatingMiniMap tables={tables} walls={walls} highlightId={finalMatches[0].tableId} />
              </div>
            )}

            {!needsLetter && finalMatches.length === 0 && (
              <p className="small muted center-text" style={{ marginTop: 12 }}>
                Kein Eintrag gefunden — fragt am Empfang nach.
              </p>
            )}

            {!needsLetter && finalMatches.length > 1 && (
              <p className="small muted center-text" style={{ marginTop: 12 }}>
                Mehrere Einträge gefunden — fragt am Empfang nach.
              </p>
            )}
          </>
        )}
      </form>
    </section>
  );
}

function SeatingMiniMap({ tables, walls, highlightId }) {
  return (
    <svg
      className="seating-minimap"
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      role="img"
      aria-label="Position des Tisches im Raum"
    >
      {walls.map((w) => (
        <rect
          key={w.id}
          className="seating-minimap-wall"
          x={w.x}
          y={w.y}
          width={w.vertical ? 14 : w.length}
          height={w.vertical ? w.length : 14}
          rx="2"
        />
      ))}
      {tables.map((t) => (
        <rect
          key={t.id}
          className={`seating-minimap-table ${t.id === highlightId ? 'is-target' : ''}`}
          x={t.x}
          y={t.y}
          width={t.vertical ? 46 : 90}
          height={t.vertical ? 90 : 46}
          rx="8"
        />
      ))}
    </svg>
  );
}
