'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function SeatingTab({ seating }) {
  const [newName, setNewName] = useState('');

  async function addTable(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    await api('/api/admin/seating/tables', { method: 'POST', body: { name: newName } });
    setNewName('');
  }

  return (
    <div className="stack">
      <form className="panel" onSubmit={addTable}>
        <p className="panel-title">Neuer Tisch</p>
        <div className="inline-form">
          <input
            className="input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="z.B. Tisch 1 – Die Tafelrunde"
          />
          <button type="submit" className="btn btn-gold btn-sm">Hinzufügen</button>
        </div>
      </form>

      {seating.tables.map((table) => (
        <TableCard key={table.id} table={table} />
      ))}

      {!seating.tables.length && (
        <div className="panel">
          <p className="muted">Noch keine Tische angelegt.</p>
        </div>
      )}
    </div>
  );
}

function TableCard({ table }) {
  const [name, setName] = useState(table.name);
  const [guestsText, setGuestsText] = useState(table.guestNames.join('\n'));

  async function saveName() {
    if (name === table.name) return;
    await api(`/api/admin/seating/tables/${table.id}`, { method: 'PATCH', body: { name } });
  }

  async function saveGuests() {
    const guestNames = guestsText.split('\n').map((n) => n.trim()).filter(Boolean);
    await api(`/api/admin/seating/tables/${table.id}`, { method: 'PATCH', body: { guestNames } });
  }

  async function remove() {
    await api(`/api/admin/seating/tables/${table.id}`, { method: 'DELETE' });
  }

  const guestCount = guestsText.split('\n').map((n) => n.trim()).filter(Boolean).length;

  return (
    <div className="panel">
      <div className="spread">
        <input
          className="input"
          style={{ maxWidth: 320 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveName}
        />
        <button type="button" className="btn btn-wine btn-sm" onClick={remove}>Tisch löschen</button>
      </div>
      <div className="field" style={{ marginTop: 12 }}>
        <label className="label">Gäste an diesem Tisch (ein Name pro Zeile) · {guestCount}</label>
        <textarea
          className="textarea"
          rows={4}
          value={guestsText}
          onChange={(e) => setGuestsText(e.target.value)}
          onBlur={saveGuests}
        />
      </div>
    </div>
  );
}
