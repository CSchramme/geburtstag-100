'use client';

import { api } from '@/lib/api';

const STATUS_LABEL = { pending: 'Wartet', approved: 'Freigegeben', rejected: 'Abgelehnt' };

export default function GuestbookTab({ guestbook }) {
  async function setStatus(id, status) {
    await api(`/api/admin/guestbook/${id}`, { method: 'PATCH', body: { status } });
  }
  async function remove(id) {
    await api(`/api/admin/guestbook/${id}`, { method: 'DELETE' });
  }

  const sorted = guestbook.slice().reverse();

  return (
    <div className="panel">
      <p className="panel-title">Einträge im Gästebuch</p>
      {sorted.length ? (
        <ul className="admin-list">
          {sorted.map((entry) => (
            <li key={entry.id} className="admin-list-row">
              <span className={`badge badge-${entry.status === 'approved' ? 'green' : entry.status === 'rejected' ? 'red' : 'gold'}`}>
                {STATUS_LABEL[entry.status]}
              </span>
              <div className="admin-list-body">
                <strong>{entry.name}</strong>
                <p>„{entry.message}"</p>
              </div>
              <div className="admin-list-actions">
                {entry.status !== 'approved' && (
                  <button type="button" className="btn btn-gold btn-sm" onClick={() => setStatus(entry.id, 'approved')}>Freigeben</button>
                )}
                {entry.status !== 'rejected' && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStatus(entry.id, 'rejected')}>Ablehnen</button>
                )}
                <button type="button" className="btn btn-wine btn-sm" onClick={() => remove(entry.id)}>Löschen</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Noch keine Einträge.</p>
      )}
    </div>
  );
}
