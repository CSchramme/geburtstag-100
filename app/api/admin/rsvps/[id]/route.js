import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

export async function DELETE(request, { params }) {
  const { id } = await params;
  const prefix = `r:${id}:`;
  update((state) => {
    state.rsvps = state.rsvps.filter((r) => r.id !== id);
    state.seating.tables.forEach((t) => {
      (t.seatRefs || []).forEach((r, i) => {
        if (r && r.startsWith(prefix)) t.seatRefs[i] = null;
      });
    });
    state.checkedIn = state.checkedIn.filter((r) => !r.startsWith(prefix));
  });
  return NextResponse.json({ ok: true, rsvps: get().rsvps, seating: get().seating });
}
