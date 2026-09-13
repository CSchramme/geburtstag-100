'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import MixingConsole from './MixingConsole';
import SoundboardPanel from './SoundboardPanel';

const PLAYLIST_FIELDS = [
  { key: 'nebenbei', label: "Playlist „Nebenbei\"" },
  { key: 'vibe', label: "Playlist „Vibe\"" },
  { key: 'party', label: "Playlist „Party\"" }
];

export default function MusicTab({ music, sound }) {
  const [status, setStatus] = useState(null);
  const [devices, setDevices] = useState([]);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('spotify');
    if (s) {
      setNotice(
        s === 'connected'
          ? 'Spotify erfolgreich verbunden.'
          : s === 'not_configured'
            ? 'Spotify ist noch nicht eingerichtet (Client-ID/Secret fehlen in .env).'
            : `Spotify-Verbindung fehlgeschlagen (${s}).`
      );
      window.history.replaceState({}, '', '/admin');
    }
    refreshStatus();
  }, []);

  async function refreshStatus() {
    const s = await fetch('/api/spotify/status').then((r) => r.json());
    setStatus(s);
    if (s.connected) {
      const d = await fetch('/api/spotify/devices').then((r) => r.json());
      setDevices(d.devices || []);
    }
  }

  async function disconnect() {
    await api('/api/spotify/disconnect', { method: 'POST' });
    refreshStatus();
  }

  async function runSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const json = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`).then((r) => r.json());
      setResults(json);
    } finally {
      setSearching(false);
    }
  }

  async function play(uri, isContext) {
    await api('/api/spotify/play', { method: 'POST', body: isContext ? { contextUri: uri } : { uri } });
  }

  return (
    <div className="stack">
      {notice && <div className="panel notice">{notice}</div>}

      <div className="panel">
        <p className="panel-title">Spotify-Verbindung</p>
        {!status ? (
          <p className="muted">Prüfe Verbindung …</p>
        ) : !status.configured ? (
          <p className="muted">
            Noch nicht eingerichtet. Trage <code>SPOTIFY_CLIENT_ID</code> und <code>SPOTIFY_CLIENT_SECRET</code> in die
            Serverkonfiguration ein (siehe README).
          </p>
        ) : status.connected ? (
          <div className="spread">
            <span className="badge badge-green"><span className="badge-dot" />Verbunden</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={disconnect}>Trennen</button>
          </div>
        ) : (
          <a className="btn btn-gold" href="/api/spotify/login">Mit Spotify verbinden</a>
        )}
      </div>

      {status?.connected && (
        <>
          <div className="panel">
            <p className="panel-title">Mischpult</p>
            <MixingConsole devices={devices} onDevicesChange={refreshStatus} />
          </div>

          <div className="panel">
            <p className="panel-title">Song oder Playlist suchen</p>
            <form className="inline-form" onSubmit={runSearch}>
              <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Titel, Künstler oder Playlist …" />
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
        </>
      )}

      <SoundboardPanel sound={sound} />

      <PlaylistForm music={music} />
    </div>
  );
}

function PlaylistForm({ music }) {
  const [form, setForm] = useState(music.playlists);
  const [status, setStatus] = useState('idle');

  async function save(e) {
    e.preventDefault();
    setStatus('saving');
    await api('/api/admin/music', { method: 'PUT', body: form });
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 1200);
  }

  return (
    <form className="panel" onSubmit={save}>
      <p className="panel-title">Feste Playlist-Links</p>
      <div className="stack">
        {PLAYLIST_FIELDS.map((f) => (
          <div className="field" key={f.key}>
            <label className="label" htmlFor={f.key}>{f.label}</label>
            <input
              id={f.key}
              className="input"
              value={form[f.key] || ''}
              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
              placeholder="spotify:playlist:…"
            />
          </div>
        ))}
      </div>
      <button type="submit" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>
        {status === 'saved' ? 'Gespeichert ✓' : 'Speichern'}
      </button>
    </form>
  );
}
