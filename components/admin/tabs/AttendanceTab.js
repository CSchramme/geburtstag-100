'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { seatablePool } from '@/lib/seating';
import QrCodePanel from './QrCodePanel';

export default function AttendanceTab({ guests, rsvps, checkedIn }) {
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');

  const presentSet = new Set(checkedIn);
  const pool = seatablePool(guests, rsvps);
  const presentCount = pool.filter((p) => presentSet.has(p.ref)).length;

  const needle = search.trim().toLowerCase();
  const filtered = needle ? pool.filter((p) => p.name.toLowerCase().includes(needle)) : pool;
  const sorted = filtered.slice().sort((a, b) => {
    const aPresent = presentSet.has(a.ref);
    const bPresent = presentSet.has(b.ref);
    if (aPresent === bPresent) return a.name.localeCompare(b.name, 'de');
    return aPresent ? 1 : -1;
  });

  async function setPresent(ref, present) {
    await api('/api/admin/attendance', { method: present ? 'POST' : 'DELETE', body: { ref } });
  }

  async function addWalkIn(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await api('/api/admin/guests', { method: 'POST', body: { name } });
    const newGuest = res.guests[res.guests.length - 1];
    if (newGuest) await setPresent(`g:${newGuest.id}`, true);
    setName('');
  }

  return (
    <div className="stack">
      <div className="overview-grid">
        <div className="panel overview-card">
          <p className="panel-title">Anwesend</p>
          <p className="overview-value">{presentCount} / {pool.length}</p>
        </div>
      </div>

      <QrCodePanel
        path="/einchecken"
        title="Self-Check-in per QR-Code"
        intro="Ausgedruckt am Eingang aufstellen — Gäste checken sich dann selbst ein:"
        filename="check-in-qr.png"
      />

      <form className="panel" onSubmit={addWalkIn}>
        <p className="panel-title">Unangemeldeter Gast an der Tür</p>
        <p className="small muted mt-0">Registriert die Person und checkt sie in einem Schritt ein.</p>
        <div className="inline-form">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name eintragen" />
          <button type="submit" className="btn btn-gold btn-sm">Registrieren &amp; einchecken</button>
        </div>
      </form>

      <div className="panel">
        <p className="panel-title">Wer ist da?</p>
        <input
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suchen …"
          style={{ marginBottom: 12 }}
        />
        {sorted.length ? (
          <ul className="admin-list">
            {sorted.map((p) => {
              const present = presentSet.has(p.ref);
              return (
                <li key={p.ref} className="admin-list-row">
                  <span className={`badge ${present ? 'badge-green' : 'badge-gold'}`}>{present ? 'da' : 'noch nicht da'}</span>
                  <div className="admin-list-body">
                    <strong>{p.name}</strong>
                    {p.kind === 'rsvp' && <span className="small muted"> · Zusage</span>}
                  </div>
                  <div className="admin-list-actions">
                    <button
                      type="button"
                      className={`btn btn-sm ${present ? 'btn-ghost' : 'btn-gold'}`}
                      onClick={() => setPresent(p.ref, !present)}
                    >
                      {present ? 'Abwesend' : 'Anwesend'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="muted small">{pool.length ? 'Keine Treffer.' : 'Noch niemand registriert oder zugesagt.'}</p>
        )}
      </div>
    </div>
  );
}
