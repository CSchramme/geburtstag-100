import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  update((state) => {
    const guest = state.guests.find((g) => g.id === id);
    if (guest && typeof body.name === 'string') {
      guest.name = body.name.trim().slice(0, 60);
    }
  });
  return NextResponse.json({ ok: true, guests: get().guests });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const ref = `g:${id}`;
  update((state) => {
    state.guests = state.guests.filter((g) => g.id !== id);
    state.seating.tables.forEach((t) => {
      (t.seatRefs || []).forEach((r, i) => {
        if (r === ref) t.seatRefs[i] = null;
      });
    });
  });
  return NextResponse.json({ ok: true, guests: get().guests, seating: get().seating });
}
