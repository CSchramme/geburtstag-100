import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

// Grows or shrinks a table by one seat. Shrinking only removes a trailing
// EMPTY seat, so an occupied seat is never silently dropped along with its
// guest - the table only ever gets shorter from the end, and only when
// that end seat is actually free.
export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const delta = body.delta === -1 ? -1 : 1;
  update((state) => {
    const table = state.seating.tables.find((t) => t.id === id);
    if (!table) return;
    table.seatRefs = table.seatRefs || [];
    if (delta > 0) {
      if (table.seatRefs.length < 24) table.seatRefs.push(null);
    } else if (table.seatRefs.length > 2 && table.seatRefs[table.seatRefs.length - 1] === null) {
      table.seatRefs.pop();
    }
    table.seats = table.seatRefs.length;
  });
  return NextResponse.json({ ok: true, seating: get().seating });
}
