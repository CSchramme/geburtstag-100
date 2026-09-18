import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

// Places `ref` into `tableId`'s seat `seatIndex`. If that ref already sat
// somewhere else, it's moved (not duplicated) - and if the target seat was
// occupied, that occupant is bumped into the ref's old seat (a true swap),
// or simply unseated if the ref came fresh from the pool.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { tableId, seatIndex, ref } = body;
  if (!tableId || !ref || !Number.isInteger(seatIndex) || seatIndex < 0) {
    return NextResponse.json({ error: 'tableId, seatIndex und ref erforderlich' }, { status: 400 });
  }
  update((state) => {
    const targetTable = state.seating.tables.find((t) => t.id === tableId);
    if (!targetTable) return;
    targetTable.seatRefs = targetTable.seatRefs || [];

    let sourceTable = null;
    let sourceIndex = -1;
    state.seating.tables.forEach((t) => {
      const idx = (t.seatRefs || []).indexOf(ref);
      if (idx !== -1) {
        sourceTable = t;
        sourceIndex = idx;
      }
    });

    if (sourceTable === targetTable && sourceIndex === seatIndex) return;

    while (targetTable.seatRefs.length <= seatIndex) targetTable.seatRefs.push(null);
    const displaced = targetTable.seatRefs[seatIndex];

    targetTable.seatRefs[seatIndex] = ref;
    if (sourceTable) {
      // Same-table or cross-table, the displaced occupant (if any) takes the
      // seat `ref` just vacated - a true swap. Coming from the pool (no
      // sourceTable), the displaced occupant is simply left unseated.
      sourceTable.seatRefs[sourceIndex] = displaced || null;
    }

    // Keep one free seat available at the end at all times, so the table
    // visibly grows the moment it fills up - no manual "+ Platz" needed.
    if (targetTable.seatRefs[targetTable.seatRefs.length - 1] !== null) {
      targetTable.seatRefs.push(null);
    }

    if (targetTable.seats < targetTable.seatRefs.length) targetTable.seats = targetTable.seatRefs.length;
    if (sourceTable && sourceTable.seats < sourceTable.seatRefs.length) sourceTable.seats = sourceTable.seatRefs.length;
  });
  return NextResponse.json({ ok: true, seating: get().seating });
}

export async function DELETE(request) {
  const body = await request.json().catch(() => ({}));
  const { ref } = body;
  update((state) => {
    state.seating.tables.forEach((t) => {
      const idx = (t.seatRefs || []).indexOf(ref);
      if (idx !== -1) t.seatRefs[idx] = null;
    });
  });
  return NextResponse.json({ ok: true, seating: get().seating });
}
