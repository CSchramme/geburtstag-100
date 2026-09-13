import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

export async function DELETE(request, { params }) {
  const { id } = await params;
  const ref = `r:${id}`;
  update((state) => {
    state.rsvps = state.rsvps.filter((r) => r.id !== id);
    state.seating.tables.forEach((t) => {
      t.guestRefs = (t.guestRefs || []).filter((r2) => r2 !== ref);
    });
  });
  return NextResponse.json({ ok: true, rsvps: get().rsvps, seating: get().seating });
}
