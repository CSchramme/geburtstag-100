'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { seatablePool, resolveRef } from '@/lib/seating';

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 520;
const WALL_THICKNESS = 14;
const SEAT_SIZE = 34;
const SEAT_GAP = 8;
const TABLE_SURFACE = 40;
const TABLE_THICKNESS = SEAT_SIZE * 2 + TABLE_SURFACE;

function clamp(v, min, max) {
  if (max < min) return min;
  return Math.max(min, Math.min(max, v));
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function tableLength(seatCount) {
  const perSide = Math.max(1, Math.ceil(seatCount / 2));
  return perSide * (SEAT_SIZE + SEAT_GAP) + SEAT_GAP;
}

export default function SeatingTab({ seating, guests, rsvps }) {
  const [selected, setSelected] = useState(null);
  const [moveMode, setMoveMode] = useState(false);
  const [dragOverKey, setDragOverKey] = useState(null);

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
  async function renameTable(id, name) {
    await api(`/api/admin/seating/tables/${id}`, { method: 'PATCH', body: { name } });
  }
  async function rotateTable(id, vertical) {
    await api(`/api/admin/seating/tables/${id}`, { method: 'PATCH', body: { vertical } });
  }
  async function seatDelta(id, delta) {
    await api(`/api/admin/seating/tables/${id}/seats`, { method: 'POST', body: { delta } });
  }
  async function removeTable(id) {
    await api(`/api/admin/seating/tables/${id}`, { method: 'DELETE' });
    setSelected((s) => (s?.type === 'table' && s.id === id ? null : s));
  }
  async function removeWall(id) {
    await api(`/api/admin/seating/walls/${id}`, { method: 'DELETE' });
    setSelected((s) => (s?.type === 'wall' && s.id === id ? null : s));
  }
  async function dropOnSeat(tableId, seatIndex, ref) {
    setDragOverKey(null);
    if (!ref) return;
    await api('/api/admin/seating/assign', { method: 'POST', body: { tableId, seatIndex, ref } });
  }
  async function dropOnPool(ref) {
    setDragOverKey(null);
    if (!ref) return;
    await api('/api/admin/seating/assign', { method: 'DELETE', body: { ref } });
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
            <button
              type="button"
              className={`btn btn-sm ${moveMode ? 'btn-gold' : 'btn-ghost'}`}
              onClick={() => setMoveMode((v) => !v)}
            >
              {moveMode ? '✓ Verschieben aktiv' : 'Tische & Wände verschieben'}
            </button>
            <a className="btn btn-ghost btn-sm" href="/api/admin/export/seating-cards">Tischkarten als PDF</a>
          </div>
        </div>
        <p className="small muted mt-0">
          {moveMode
            ? 'Verschieben-Modus aktiv: Tische und Wände lassen sich jetzt ziehen und neu platzieren. Zum Sitzplätze-Zuordnen den Knopf oben wieder ausschalten.'
            : 'Zieht Gäste aus der Gästeliste rechts direkt auf einen freien Platz — der Tisch wächst automatisch mit. Zum Verschieben der Tische und Wände selbst erst den Knopf oben aktivieren.'}
        </p>

        <div className="seating-layout">
          <div className="seating-canvas-wrap">
            <div
              className={`seating-canvas ${moveMode ? 'is-move-mode' : ''}`}
              style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
              onPointerDown={() => setSelected(null)}
            >
              {walls.map((w) => (
                <DraggableWall
                  key={w.id}
                  wall={w}
                  moveMode={moveMode}
                  selected={selected?.type === 'wall' && selected.id === w.id}
                  onSelect={() => setSelected({ type: 'wall', id: w.id })}
                  onMove={moveWall}
                />
              ))}
              {tables.map((t) => (
                <TableShape
                  key={t.id}
                  table={t}
                  guests={guests}
                  rsvps={rsvps}
                  moveMode={moveMode}
                  selected={selected?.type === 'table' && selected.id === t.id}
                  onSelect={() => setSelected({ type: 'table', id: t.id })}
                  onMove={moveTable}
                  dragOverKey={dragOverKey}
                  onSeatDragEnter={setDragOverKey}
                  onSeatDragLeave={(key) => setDragOverKey((k) => (k === key ? null : k))}
                  onSeatDrop={dropOnSeat}
                />
              ))}
            </div>
          </div>

          <GuestListPanel
            guests={guests}
            rsvps={rsvps}
            tables={tables}
            moveMode={moveMode}
            dragOverPool={dragOverKey === 'pool'}
            onPoolDragEnter={() => setDragOverKey('pool')}
            onPoolDragLeave={() => setDragOverKey((k) => (k === 'pool' ? null : k))}
            onUnassign={dropOnPool}
          />
        </div>
      </div>

      {selectedTable && (
        <TableProperties
          table={selectedTable}
          onClose={() => setSelected(null)}
          onDelete={() => removeTable(selectedTable.id)}
          onRename={renameTable}
          onSeatDelta={seatDelta}
          onRotate={rotateTable}
        />
      )}

      {selectedWall && (
        <WallProperties wall={selectedWall} onClose={() => setSelected(null)} onDelete={() => removeWall(selectedWall.id)} />
      )}
    </div>
  );
}

function TableShape({ table, guests, rsvps, moveMode, selected, onSelect, onMove, dragOverKey, onSeatDragEnter, onSeatDragLeave, onSeatDrop }) {
  const seatRefs = table.seatRefs && table.seatRefs.length ? table.seatRefs : [null, null];
  const vertical = Boolean(table.vertical);
  const long = tableLength(seatRefs.length);
  const short = TABLE_THICKNESS;
  const width = vertical ? short : long;
  const height = vertical ? long : short;

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
    if (!moveMode) return;
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
      onMove(table.id, Math.round(posRef.current.x), Math.round(posRef.current.y));
    }
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }

  const surfaceStyle = vertical
    ? { left: SEAT_SIZE, width: TABLE_SURFACE, top: 0, bottom: 0 }
    : { top: SEAT_SIZE, height: TABLE_SURFACE, left: 0, right: 0 };
  // Rotated tables are only TABLE_SURFACE (40px) wide, too narrow for even a
  // short name - so the label itself rotates 90° and runs along the table's
  // full length instead of wrapping/clipping in that narrow band.
  const nameStyle = vertical ? { transform: 'rotate(-90deg)', width: long } : undefined;

  return (
    <div
      className={`seating-table ${vertical ? 'is-vertical' : ''} ${selected ? 'is-selected' : ''}`}
      style={{ left: pos.x, top: pos.y, width, height }}
      onPointerDown={onPointerDown}
    >
      <div className="seating-table-top" style={surfaceStyle}>
        <span className={`seating-table-name ${vertical ? 'is-vertical' : ''}`} style={nameStyle}>{table.name}</span>
      </div>
      {seatRefs.map((ref, i) => {
        const side = i % 2 === 0 ? (vertical ? 'left' : 'top') : (vertical ? 'right' : 'bottom');
        const slot = Math.floor(i / 2);
        const offset = SEAT_GAP + slot * (SEAT_SIZE + SEAT_GAP);
        const resolved = ref ? resolveRef(guests, rsvps, ref) : null;
        const key = `${table.id}:${i}`;
        return (
          <div
            key={i}
            className={`seating-seat seating-seat-${side} ${resolved ? 'is-occupied' : 'is-empty'} ${dragOverKey === key ? 'is-dragover' : ''}`}
            style={vertical ? { top: offset } : { left: offset }}
            draggable={Boolean(resolved)}
            onPointerDown={(e) => e.stopPropagation()}
            onDragStart={(e) => e.dataTransfer.setData('text/plain', ref)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => {
              e.preventDefault();
              onSeatDragEnter(key);
            }}
            onDragLeave={() => onSeatDragLeave(key)}
            onDrop={(e) => {
              e.preventDefault();
              const droppedRef = e.dataTransfer.getData('text/plain');
              onSeatDrop(table.id, i, droppedRef);
            }}
            title={resolved ? resolved.name : 'Freier Platz'}
          >
            {resolved ? initials(resolved.name) : ''}
          </div>
        );
      })}
    </div>
  );
}

function DraggableWall({ wall, moveMode, selected, onSelect, onMove }) {
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
    if (!moveMode) return;
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

function TableProperties({ table, onClose, onDelete, onRename, onSeatDelta, onRotate }) {
  const [name, setName] = useState(table.name);

  useEffect(() => setName(table.name), [table.id, table.name]);

  async function saveName() {
    if (name.trim() && name !== table.name) onRename(table.id, name);
  }

  const seatCount = table.seatRefs?.length || table.seats || 2;

  return (
    <div className="panel">
      <div className="spread">
        <input className="input" style={{ maxWidth: 280 }} value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName} />
        <div className="inline-form">
          <button type="button" className="btn btn-wine btn-sm" onClick={onDelete}>Tisch löschen</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Schließen</button>
        </div>
      </div>
      <div className="inline-form" style={{ marginTop: 12 }}>
        <span className="label" style={{ margin: 0 }}>Sitzplätze: {seatCount}</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onSeatDelta(table.id, -1)}>− Platz</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onSeatDelta(table.id, 1)}>+ Platz</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onRotate(table.id, !table.vertical)}>
          {table.vertical ? 'Waagerecht stellen' : 'Senkrecht stellen'}
        </button>
      </div>
      <p className="small muted" style={{ marginTop: 10 }}>
        Zieht Gäste aus der Gästeliste rechts direkt auf einen freien Platz an diesem Tisch — er wächst automatisch,
        wenn mehr Plätze gebraucht werden. Ein Platz lässt sich nur entfernen, wenn er frei ist.
      </p>
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

function GuestListPanel({ guests, rsvps, tables, moveMode, dragOverPool, onPoolDragEnter, onPoolDragLeave, onUnassign }) {
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');

  async function add(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await api('/api/admin/guests', { method: 'POST', body: { name } });
    setName('');
  }
  async function remove(id) {
    await api(`/api/admin/guests/${id}`, { method: 'DELETE' });
  }

  const seatedMap = new Map();
  tables.forEach((t) => {
    (t.seatRefs || []).forEach((ref) => {
      if (ref) seatedMap.set(ref, t.name);
    });
  });

  const pool = seatablePool(guests, rsvps);
  const needle = search.trim().toLowerCase();
  const filteredPool = needle ? pool.filter((p) => p.name.toLowerCase().includes(needle)) : pool;

  return (
    <div className="panel seating-sidebar">
      <p className="panel-title">Gästeliste</p>
      <p className="small muted mt-0">
        Registriert hier Gäste, die nicht selbst über die Zusage-Seite geantwortet haben. Zieht anschließend jede
        Person von hier auf einen freien Platz im Grundriss links — oder zieht sie von dort wieder hierher zurück,
        um den Platz freizugeben.
      </p>
      <form className="inline-form" onSubmit={add}>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name eintragen" />
        <button type="submit" className="btn btn-gold btn-sm">Registrieren</button>
      </form>

      <input
        className="input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Suchen …"
        style={{ marginTop: 12 }}
      />

      <div
        className={`seating-pool ${dragOverPool ? 'is-dragover' : ''} ${moveMode ? 'is-disabled' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => {
          e.preventDefault();
          onPoolDragEnter();
        }}
        onDragLeave={onPoolDragLeave}
        onDrop={(e) => {
          e.preventDefault();
          const ref = e.dataTransfer.getData('text/plain');
          onUnassign(ref);
        }}
      >
        {filteredPool.map((p) => {
          const tableName = seatedMap.get(p.ref);
          return (
            <div key={p.ref} className={`seating-chip ${tableName ? 'is-seated' : ''}`} draggable={!tableName} onDragStart={(e) => e.dataTransfer.setData('text/plain', p.ref)}>
              <span>{p.name}</span>
              {tableName ? (
                <span className="small muted"> · {tableName}</span>
              ) : p.kind === 'guest' ? (
                <button
                  type="button"
                  className="seating-chip-remove"
                  onClick={() => remove(p.ref.slice(2))}
                  title="Gast löschen"
                >
                  ×
                </button>
              ) : null}
            </div>
          );
        })}
        {!pool.length && <p className="muted small">Noch niemand registriert oder zugesagt.</p>}
        {pool.length > 0 && !filteredPool.length && <p className="muted small">Keine Treffer.</p>}
      </div>
    </div>
  );
}
