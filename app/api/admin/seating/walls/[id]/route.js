import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  update((state) => {
    const wall = state.seating.walls.find((w) => w.id === id);
    if (!wall) return;
    if (Number.isFinite(body.x)) wall.x = Math.max(0, body.x);
    if (Number.isFinite(body.y)) wall.y = Math.max(0, body.y);
    if (Number.isFinite(body.length)) wall.length = Math.max(20, Math.min(800, Math.round(body.length)));
    if (typeof body.vertical === 'boolean') wall.vertical = body.vertical;
  });
  return NextResponse.json({ ok: true, seating: get().seating });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  update((state) => {
    state.seating.walls = state.seating.walls.filter((w) => w.id !== id);
  });
  return NextResponse.json({ ok: true, seating: get().seating });
}
