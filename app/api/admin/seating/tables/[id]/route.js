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
    if (Number.isFinite(body.x)) table.x = Math.max(0, body.x);
    if (Number.isFinite(body.y)) table.y = Math.max(0, body.y);
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
