import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  update((state) => {
    const item = state.chronicle.find((c) => c.id === id);
    if (item) Object.assign(item, body);
    state.chronicle.sort((a, b) => a.time.localeCompare(b.time));
  });
  return NextResponse.json({ ok: true, chronicle: get().chronicle });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  update((state) => {
    state.chronicle = state.chronicle.filter((c) => c.id !== id);
  });
  return NextResponse.json({ ok: true, chronicle: get().chronicle });
}
