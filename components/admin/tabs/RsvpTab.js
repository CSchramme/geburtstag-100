'use client';

import { api } from '@/lib/api';

export default function RsvpTab({ rsvps }) {
  async function remove(id) {
    await api(`/api/admin/rsvps/${id}`, { method: 'DELETE' });
  }

  const yes = rsvps.filter((r) => r.attending === 'yes');
  const no = rsvps.filter((r) => r.attending === 'no');
  const totalGuests = yes.reduce((sum, r) => sum + (r.guestCount || 1), 0);
  const sorted = rsvps.slice().reverse();

  return (
    <div className="stack">
      <div className="overview-grid">
        <div className="panel overview-card">
          <p className="panel-title">Zusagen</p>
          <p className="overview-value">{yes.length}</p>
        </div>
        <div className="panel overview-card">
          <p className="panel-title">Personen gesamt</p>
          <p className="overview-value">{totalGuests}</p>
        </div>
        <div className="panel overview-card">
          <p className="panel-title">Absagen</p>
          <p className="overview-value">{no.length}</p>
        </div>
      </div>

      <div className="panel">
        <p className="panel-title">Rückmeldungen</p>
        {sorted.length ? (
          <ul className="admin-list">
            {sorted.map((r) => (
              <li key={r.id} className="admin-list-row">
                <span className={`badge ${r.attending === 'yes' ? 'badge-green' : 'badge-red'}`}>
                  {r.attending === 'yes' ? `${r.guestCount} Person${r.guestCount === 1 ? '' : 'en'}` : 'Absage'}
                </span>
                <div className="admin-list-body">
                  <strong>{r.name}</strong>
                  {r.notes && <p>{r.notes}</p>}
                </div>
                <div className="admin-list-actions">
                  <button type="button" className="btn btn-wine btn-sm" onClick={() => remove(r.id)}>Löschen</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Noch keine Rückmeldungen.</p>
        )}
      </div>
    </div>
  );
}
