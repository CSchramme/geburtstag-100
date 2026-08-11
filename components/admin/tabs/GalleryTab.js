'use client';

import { api } from '@/lib/api';

const STATUS_LABEL = { pending: 'Wartet', approved: 'Freigegeben', rejected: 'Abgelehnt' };

export default function GalleryTab({ gallery }) {
  async function setStatus(id, status) {
    await api(`/api/admin/gallery/${id}`, { method: 'PATCH', body: { status } });
  }
  async function remove(id) {
    await api(`/api/admin/gallery/${id}`, { method: 'DELETE' });
  }

  const sorted = gallery.slice().reverse();

  return (
    <div className="panel">
      <p className="panel-title">Eingereichte Fotos</p>
      {sorted.length ? (
        <div className="mod-gallery-grid">
          {sorted.map((photo) => (
            <div key={photo.id} className="mod-gallery-item">
              <img src={photo.url} alt={photo.caption || ''} />
              <span className={`badge badge-${photo.status === 'approved' ? 'green' : photo.status === 'rejected' ? 'red' : 'gold'}`}>
                {STATUS_LABEL[photo.status]}
              </span>
              {(photo.name || photo.caption) && (
                <p className="small muted">{photo.name}{photo.caption ? ` — ${photo.caption}` : ''}</p>
              )}
              <div className="admin-list-actions">
                {photo.status !== 'approved' && (
                  <button type="button" className="btn btn-gold btn-sm" onClick={() => setStatus(photo.id, 'approved')}>Freigeben</button>
                )}
                {photo.status !== 'rejected' && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStatus(photo.id, 'rejected')}>Ablehnen</button>
                )}
                <button type="button" className="btn btn-wine btn-sm" onClick={() => remove(photo.id)}>Löschen</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">Noch keine Fotos eingereicht.</p>
      )}
    </div>
  );
}
