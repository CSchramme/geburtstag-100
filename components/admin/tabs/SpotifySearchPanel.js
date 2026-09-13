'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import { api } from '@/lib/api';

// Exposes a searchFor(text) method via ref so other panels (e.g. song
// requests) on the same tab can trigger a search without duplicating state.
const SpotifySearchPanel = forwardRef(function SpotifySearchPanel(_, ref) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  async function runSearch(e, presetQuery) {
    if (e) e.preventDefault();
    const q = presetQuery ?? query;
    if (!q.trim()) return;
    setSearching(true);
    try {
      const json = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}`).then((r) => r.json());
      setResults(json);
    } finally {
      setSearching(false);
    }
  }

  useImperativeHandle(ref, () => ({
    searchFor(text) {
      setQuery(text);
      runSearch(null, text);
      document.getElementById('music-search-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }));

  async function play(uri, isContext) {
    await api('/api/spotify/play', { method: 'POST', body: isContext ? { contextUri: uri } : { uri } });
  }

  return (
    <div className="panel">
      <p className="panel-title">Song oder Playlist suchen</p>
      <form className="inline-form" onSubmit={runSearch}>
        <input
          id="music-search-input"
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Titel, Künstler oder Playlist …"
        />
        <button type="submit" className="btn btn-gold btn-sm" disabled={searching}>Suchen</button>
      </form>
      {results && (
        <div className="search-results">
          {[...(results.playlists || []), ...(results.tracks || [])].map((r) => (
            <button key={r.uri} type="button" className="search-result" onClick={() => play(r.uri, r.owner !== undefined)}>
              {r.image && <img src={r.image} alt="" />}
              <span>
                <strong>{r.name}</strong>
                <br />
                <span className="muted small">{r.artists || r.owner || ''}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default SpotifySearchPanel;
