'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { seatablePool, resolveRef, displayName, tableOccupancy, seatedRefSet } from '@/lib/seating';

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 520;
const TABLE_SIZE = 92;
const WALL_THICKNESS = 14;

function clamp(v, min, max) {
  if (max < min) return min;
  return Math.max(min, Math.min(max, v));
}

export default function SeatingTab({ seating, guests, rsvps }) {
  const [selected, setSelected] = useState(null);

  const tables = seating.tables;
  const walls = seating.walls;

  async function addTable() {
    await api('/api/admin/seating/tables', { method: 'POST', body: { name: `Tisch ${tables.length + 1}` } });
  }
  async function addWall() {
    await api('/api/admin/seating/walls', { method: 'POST' });
  }
  async function moveTable(id, x, y) {
    await api(`/api/admin/seating/tables/${id}`, { method: 'PATCH', body: { x, y } });
  }
  async function moveWall(id, x, y) {
    await api(`/api/admin/seating/walls/${id}`, { method: 'PATCH', body: { x, y } });
  }
  async function removeTable(id) {
    await api(`/api/admin/seating/tables/${id}`, { method: 'DELETE' });
    setSelected((s) => (s?.type === 'table' && s.id === id ? null : s));
  }
  async function removeWall(id) {
    await api(`/api/admin/seating/walls/${id}`, { method: 'DELETE' });
    setSelected((s) => (s?.type === 'wall' && s.id === id ? null : s));
  }

  const selectedTable = selected?.type === 'table' ? tables.find((t) => t.id === selected.id) : null;
  const selectedWall = selected?.type === 'wall' ? walls.find((w) => w.id === selected.id) : null;

  return (
    <div className="stack">
      <div className="panel">
        <div className="spread">
          <p className="panel-title mt-0">Grundriss</p>
          <div className="inline-form">
            <button type="button" className="btn btn-gold btn-sm" onClick={addTable}>+ Tisch</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addWall}>+ Wand</button>
            <a className="btn btn-ghost btn-sm" href="/api/admin/export/seating-cards">Tischkarten als PDF</a>
          </div>
        </div>
        <p className="small muted mt-0">
          Tische und Wände lassen sich frei verschieben — einfach anfassen und ziehen. Ein Klick auf einen Tisch
          öffnet die Sitzplatzvergabe darunter.
        </p>

        <div className="seating-canvas-wrap">
          <div
            className="seating-canvas"
            style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
            onPointerDown={() => setSelected(null)}
          >
            {walls.map((w) => (
              <DraggableWall
                key={w.id}
                wall={w}
                selected={selected?.type === 'wall' && selected.id === w.id}
                onSelect={() => setSelected({ type: 'wall', id: w.id })}
                onMove={moveWall}
              />
            ))}
            {tables.map((t) => (
              <DraggableTable
                key={t.id}
                table={t}
                occupancy={tableOccupancy(guests, rsvps, t)}
                selected={selected?.type === 'table' && selected.id === t.id}
                onSelect={() => setSelected({ type: 'table', id: t.id })}
                onMove={moveTable}
              />
            ))}
          </div>
        </div>
      </div>

      {selectedTable && (
        <TableProperties
          table={selectedTable}
          guests={guests}
          rsvps={rsvps}
          onClose={() => setSelected(null)}
          onDelete={() => removeTable(selectedTable.id)}
        />
      )}

      {selectedWall && (
        <WallProperties wall={selectedWall} onClose={() => setSelected(null)} onDelete={() => removeWall(selectedWall.id)} />
      )}

      <GuestListPanel guests={guests} rsvps={rsvps} tables={tables} />
    </div>
  );
}

function DraggableTable({ table, occupancy, selected, onSelect, onMove }) {
  const [pos, setPos] = useState({ x: table.x, y: table.y });
  const posRef = useRef(pos);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (!draggingRef.current) {
      posRef.current = { x: table.x, y: table.y };
      setPos(posRef.current);
    }
  }, [table.x, table.y]);

  function onPointerDown(e) {
    e.stopPropagation();
    onSelect();
    const rect = e.currentTarget.closest('.seating-canvas').getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const originX = posRef.current.x;
    const originY = posRef.current.y;
    draggingRef.current = true;

    function handleMove(ev) {
      const nx = clamp(originX + (ev.clientX - startX), 0, rect.width - TABLE_SIZE);
      const ny = clamp(originY + (ev.clientY - startY), 0, rect.height - TABLE_SIZE);
      posRef.current = { x: nx, y: ny };
      setPos(posRef.current);
    }
    function handleUp() {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      draggingRef.current = false;
      onMove(table.id, Math.round(posRef.current.x), Math.round(posRef.current.y));
    }
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }

  const over = table.seats && occupancy > table.seats;

  return (
    <div
      className={`seating-table ${selected ? 'is-selected' : ''} ${over ? 'is-over' : ''}`}
      style={{ left: pos.x, top: pos.y, width: TABLE_SIZE, height: TABLE_SIZE }}
      onPointerDown={onPointerDown}
    >
      <span className="seating-table-name">{table.name}</span>
      <span className="seating-table-count">{occupancy}/{table.seats}</span>
    </div>
  );
}

function DraggableWall({ wall, selected, onSelect, onMove }) {
  const [pos, setPos] = useState({ x: wall.x, y: wall.y });
  const posRef = useRef(pos);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (!draggingRef.current) {
      posRef.current = { x: wall.x, y: wall.y };
      setPos(posRef.current);
    }
  }, [wall.x, wall.y]);

  const width = wall.vertical ? WALL_THICKNESS : wall.length;
  const height = wall.vertical ? wall.length : WALL_THICKNESS;

  function onPointerDown(e) {
    e.stopPropagation();
    onSelect();
    const rect = e.currentTarget.closest('.seating-canvas').getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const originX = posRef.current.x;
    const originY = posRef.current.y;
    draggingRef.current = true;

    function handleMove(ev) {
      const nx = clamp(originX + (ev.clientX - startX), 0, rect.width - width);
      const ny = clamp(originY + (ev.clientY - startY), 0, rect.height - height);
      posRef.current = { x: nx, y: ny };
      setPos(posRef.current);
    }
    function handleUp() {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      draggingRef.current = false;
      onMove(wall.id, Math.round(posRef.current.x), Math.round(posRef.current.y));
    }
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }

  return (
    <div
      className={`seating-wall ${selected ? 'is-selected' : ''}`}
      style={{ left: pos.x, top: pos.y, width, height }}
      onPointerDown={onPointerDown}
    />
  );
}

function TableProperties({ table, guests, rsvps, onClose, onDelete }) {
  const [name, setName] = useState(table.name);
  const [seats, setSeats] = useState(table.seats);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setName(table.name);
    setSeats(table.seats);
  }, [table.id, table.name, table.seats]);

  async function saveName() {
    if (name.trim() && name !== table.name) {
      await api(`/api/admin/seating/tables/${table.id}`, { method: 'PATCH', body: { name } });
    }
  }
  async function saveSeats() {
    const n = Number(seats);
    if (n && n !== table.seats) {
      await api(`/api/admin/seating/tables/${table.id}`, { method: 'PATCH', body: { seats: n } });
    }
  }
  async function assign(ref) {
    await api('/api/admin/seating/assign', { method: 'POST', body: { tableId: table.id, ref } });
  }
  async function unassign(ref) {
    await api('/api/admin/seating/assign', { method: 'DELETE', body: { tableId: table.id, ref } });
  }

  const occupants = (table.guestRefs || []).map((ref) => resolveRef(guests, rsvps, ref)).filter(Boolean);
  const seatedRefs = new Set(table.guestRefs || []);
  const pool = seatablePool(guests, rsvps).filter((p) => !seatedRefs.has(p.ref));
  const needle = filter.trim().toLowerCase();
  const filteredPool = needle ? pool.filter((p) => p.name.toLowerCase().includes(needle)) : pool;

  return (
    <div className="panel">
      <div className="spread">
        <input className="input" style={{ maxWidth: 280 }} value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName} />
        <div className="inline-form">
          <button type="button" className="btn btn-wine btn-sm" onClick={onDelete}>Tisch löschen</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Schließen</button>
        </div>
      </div>

      <div className="field" style={{ maxWidth: 140, marginTop: 12 }}>
        <label className="label">Sitzplätze</label>
        <input
          className="input"
          type="number"
          min="1"
          max="30"
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
          onBlur={saveSeats}
        />
      </div>

      <div className="divider" />

      <p className="label mt-0">Zugeordnet</p>
      {occupants.length ? (
        <ul className="admin-list">
          {occupants.map((o) => (
            <li key={o.ref} className="admin-list-row">
              <div className="admin-list-body"><strong>{displayName(o)}</strong></div>
              <div className="admin-list-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => unassign(o.ref)}>Entfernen</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted small">Noch niemand an diesem Tisch.</p>
      )}

      <div className="divider" />

      <p className="label mt-0">Gast hinzufügen</p>
      <input
        className="input"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Suchen …"
        style={{ marginBottom: 10 }}
      />
      {filteredPool.length ? (
        <ul className="admin-list">
          {filteredPool.map((p) => (
            <li key={p.ref} className="admin-list-row">
              <div className="admin-list-body">
                <strong>{displayName(p)}</strong>
                {p.kind === 'rsvp' && <span className="small muted"> · Zusage</span>}
              </div>
              <div className="admin-list-actions">
                <button type="button" className="btn btn-gold btn-sm" onClick={() => assign(p.ref)}>Hinzufügen</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted small">
          {pool.length ? 'Keine Treffer.' : 'Alle registrierten Gäste sind bereits einem Tisch zugeordnet.'}
        </p>
      )}
    </div>
  );
}

function WallProperties({ wall, onClose, onDelete }) {
  const [length, setLength] = useState(wall.length);

  useEffect(() => setLength(wall.length), [wall.id, wall.length]);

  async function saveLength() {
    const n = Number(length);
    if (n && n !== wall.length) {
      await api(`/api/admin/seating/walls/${wall.id}`, { method: 'PATCH', body: { length: n } });
    }
  }
  async function toggleOrientation() {
    await api(`/api/admin/seating/walls/${wall.id}`, { method: 'PATCH', body: { vertical: !wall.vertical } });
  }

  return (
    <div className="panel">
      <div className="spread">
        <p className="panel-title mt-0">Wand</p>
        <div className="inline-form">
          <button type="button" className="btn btn-wine btn-sm" onClick={onDelete}>Löschen</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Schließen</button>
        </div>
      </div>
      <div className="inline-form">
        <div className="field" style={{ maxWidth: 140 }}>
          <label className="label">Länge</label>
          <input
            className="input"
            type="number"
            min="20"
            max="800"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            onBlur={saveLength}
          />
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={toggleOrientation}>
          {wall.vertical ? 'Waagerecht stellen' : 'Senkrecht stellen'}
        </button>
      </div>
    </div>
  );
}

function GuestListPanel({ guests, rsvps, tables }) {
  const [name, setName] = useState('');
  const seatedRefs = seatedRefSet(tables);

  async function add(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await api('/api/admin/guests', { method: 'POST', body: { name } });
    setName('');
  }
  async function remove(id) {
    await api(`/api/admin/guests/${id}`, { method: 'DELETE' });
  }

  const rsvpGuests = rsvps.filter((r) => r.attending === 'yes');

  return (
    <div className="panel">
      <p className="panel-title">Gästeliste</p>
      <p className="small muted mt-0">
        Registriert hier Gäste, die nicht selbst über die Zusage-Seite geantwortet haben (z.B. persönlich
        angemeldet) — sie stehen dann bei der Tischvergabe zur Auswahl, genau wie alle, die zugesagt haben.
      </p>
      <form className="inline-form" onSubmit={add}>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name eintragen" />
        <button type="submit" className="btn btn-gold btn-sm">Registrieren</button>
      </form>

      {guests.length > 0 && (
        <>
          <p className="label" style={{ marginTop: 16 }}>Manuell registriert</p>
          <ul className="admin-list">
            {guests.map((g) => (
              <li key={g.id} className="admin-list-row">
                <span className={`badge ${seatedRefs.has(`g:${g.id}`) ? 'badge-green' : 'badge-gold'}`}>
                  {seatedRefs.has(`g:${g.id}`) ? 'platziert' : 'ohne Tisch'}
                </span>
                <div className="admin-list-body"><strong>{g.name}</strong></div>
                <div className="admin-list-actions">
                  <button type="button" className="btn btn-wine btn-sm" onClick={() => remove(g.id)}>Löschen</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {rsvpGuests.length > 0 && (
        <>
          <p className="label" style={{ marginTop: 16 }}>Über Zusagen bestätigt</p>
          <ul className="admin-list">
            {rsvpGuests.map((r) => (
              <li key={r.id} className="admin-list-row">
                <span className={`badge ${seatedRefs.has(`r:${r.id}`) ? 'badge-green' : 'badge-gold'}`}>
                  {seatedRefs.has(`r:${r.id}`) ? 'platziert' : 'ohne Tisch'}
                </span>
                <div className="admin-list-body">
                  <strong>{r.name}</strong>
                  {r.guestCount > 1 && <span className="small muted"> · {r.guestCount} Personen</span>}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {!guests.length && !rsvpGuests.length && <p className="muted">Noch niemand registriert.</p>}
    </div>
  );
}
