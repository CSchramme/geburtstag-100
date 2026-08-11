import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  update((state) => {
    const item = state.agenda.find((a) => a.id === id);
    if (item) Object.assign(item, body);
    state.agenda.sort((a, b) => a.time.localeCompare(b.time));
  });
  return NextResponse.json({ ok: true, agenda: get().agenda });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  update((state) => {
    state.agenda = state.agenda.filter((a) => a.id !== id);
  });
  return NextResponse.json({ ok: true, agenda: get().agenda });
}
