'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('de-DE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function PhotoboxTab() {
  const [configured, setConfigured] = useState(null);
  const [status, setStatus] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setError('');
    try {
      const s = await fetch('/api/admin/photobox/status').then((r) => r.json());
      setConfigured(s.configured);
      if (s.status) setStatus(s.status);
      if (s.error) setError(s.error);

      if (s.configured) {
        const p = await fetch('/api/admin/photobox/photos').then((r) => r.json());
        setPhotos(p.photos || []);
        if (p.error) setError(p.error);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function toggleUploads(open) {
    setBusy(true);
    try {
      await api('/api/admin/photobox/uploads', { method: 'POST', body: { open } });
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleDownloads(open) {
    setBusy(true);
    try {
      await api('/api/admin/photobox/downloads', { method: 'POST', body: { open } });
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto(id, filename) {
    if (!window.confirm(`„${filename}" endgültig aus der Fotobox löschen?`)) return;
    try {
      await api(`/api/admin/photobox/photos/${encodeURIComponent(id)}`, { method: 'DELETE' });
      setPhotos((list) => list.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (configured === false) {
    return (
      <div className="panel">
        <p className="panel-title">Fotobox</p>
        <p className="muted">
          Noch nicht eingerichtet. Trage <code>PHOTOS_API_KEY</code> (und bei Bedarf
          <code> PHOTOS_API_BASE_URL</code>) in die Serverkonfiguration ein, um die externe Fotobox unter
          photos.50und50.de von hier aus zu steuern.
        </p>
      </div>
    );
  }

  return (
    <div className="stack">
      {error && <div className="panel notice">{error}</div>}

      <div className="panel">
        <div className="spread">
          <p className="panel-title mt-0">Fotobox-Status</p>
          <button type="button" className="btn btn-ghost btn-sm" onClick={refresh} disabled={busy}>
            Aktualisieren
          </button>
        </div>

        {status ? (
          <>
            <div className="overview-grid">
              <div className="panel overview-card">
                <p className="panel-title">Fotos gesamt</p>
                <p className="overview-value">{status.photoCount}</p>
              </div>
              <div className="panel overview-card">
                <p className="panel-title">Läuft gerade hoch</p>
                <p className="overview-value">{status.activeUploads}</p>
              </div>
              <div className="panel overview-card">
                <p className="panel-title">Abgelehnt (WhatsApp)</p>
                <p className="overview-value">{status.rejectedWhatsapp}</p>
              </div>
            </div>

            <div className="divider" />

            <div className="spread">
              <span>Foto-Upload für Gäste</span>
              <button
                type="button"
                className={`seal-toggle ${status.uploadOpen ? 'is-on' : ''}`}
                onClick={() => toggleUploads(!status.uploadOpen)}
                disabled={busy}
                aria-pressed={status.uploadOpen}
                aria-label="Foto-Upload ein-/ausschalten"
              />
            </div>
            <div className="spread" style={{ marginTop: 10 }}>
              <span>Download-Seite (/dwn) für Gäste</span>
              <button
                type="button"
                className={`seal-toggle ${status.downloadOpen ? 'is-on' : ''}`}
                onClick={() => toggleDownloads(!status.downloadOpen)}
                disabled={busy}
                aria-pressed={status.downloadOpen}
                aria-label="Download-Seite ein-/ausschalten"
              />
            </div>
          </>
        ) : (
          <p className="muted">Lade Status …</p>
        )}
      </div>

      <div className="panel">
        <p className="panel-title">Hochgeladene Fotos ({photos.length})</p>
        {photos.length ? (
          <ul className="admin-list">
            {photos
              .slice()
              .reverse()
              .map((p) => (
                <li key={p.id} className="admin-list-row">
                  <div className="admin-list-body">
                    <strong>{p.originalFilename}</strong>
                    <p>
                      {p.uploaderName ? `${p.uploaderName} · ` : ''}
                      {p.width && p.height ? `${p.width}×${p.height} · ` : ''}
                      {formatBytes(p.size)} · {formatDate(p.uploadedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-wine btn-sm"
                    onClick={() => removePhoto(p.id, p.originalFilename)}
                  >
                    Löschen
                  </button>
                </li>
              ))}
          </ul>
        ) : (
          <p className="muted">Noch keine Fotos in der Fotobox.</p>
        )}
      </div>
    </div>
  );
}
