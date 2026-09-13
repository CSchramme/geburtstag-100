import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  update((state) => {
    const table = state.seating.tables.find((t) => t.id === id);
    if (!table) return;
    if (typeof body.name === 'string') table.name = body.name.trim().slice(0, 60);
    if (Array.isArray(body.guestNames)) {
      table.guestNames = body.guestNames.map((n) => String(n).trim()).filter(Boolean).slice(0, 40);
    }
  });
  return NextResponse.json({ ok: true, seating: get().seating });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  update((state) => {
    state.seating.tables = state.seating.tables.filter((t) => t.id !== id);
  });
  return NextResponse.json({ ok: true, seating: get().seating });
}
