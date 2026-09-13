'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const PLAYLIST_FIELDS = [
  { key: 'nebenbei', label: "Playlist „Nebenbei\"" },
  { key: 'vibe', label: "Playlist „Vibe\"" },
  { key: 'party', label: "Playlist „Party\"" }
];

export default function MusicTab({ music }) {
  const [status, setStatus] = useState(null);
  const [notice, setNotice] = useState('');

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
  }

  async function disconnect() {
    await api('/api/spotify/disconnect', { method: 'POST' });
    refreshStatus();
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
        {status?.connected && (
          <p className="small muted" style={{ marginTop: 10 }}>
            Mischpult, Suche, Musikwünsche und Soundeffekte findest du jetzt im Tab <strong>Master</strong>.
          </p>
        )}
      </div>

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
