'use client';

import { api } from '@/lib/api';

export default function SongRequestsPanel({ requests, onSearch }) {
  const pending = requests.filter((r) => r.status === 'pending');
  const done = requests.filter((r) => r.status === 'done');

  async function markDone(id) {
    await api(`/api/admin/song-requests/${id}`, { method: 'PATCH', body: { status: 'done' } });
  }
  async function remove(id) {
    await api(`/api/admin/song-requests/${id}`, { method: 'DELETE' });
  }

  return (
    <div className="panel">
      <p className="panel-title">Musikwünsche der Gäste</p>
      {pending.length ? (
        <ul className="admin-list">
          {pending.map((r) => (
            <li key={r.id} className="admin-list-row">
              <div className="admin-list-body">
                <strong>{r.text}</strong>
                {r.name && <p>von {r.name}</p>}
              </div>
              <div className="admin-list-actions">
                <button type="button" className="btn btn-gold btn-sm" onClick={() => onSearch(r.text)}>
                  In Spotify suchen
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => markDone(r.id)}>
                  Erledigt
                </button>
                <button type="button" className="btn btn-wine btn-sm" onClick={() => remove(r.id)}>
                  Löschen
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Noch keine offenen Wünsche.</p>
      )}

      {done.length > 0 && (
        <details className="song-requests-done">
          <summary>{done.length} erledigt</summary>
          <ul className="admin-list">
            {done.map((r) => (
              <li key={r.id} className="admin-list-row">
                <div className="admin-list-body">
                  <strong>{r.text}</strong>
                  {r.name && <p>von {r.name}</p>}
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(r.id)}>
                  Löschen
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
