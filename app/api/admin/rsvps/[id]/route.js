import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

export async function DELETE(request, { params }) {
  const { id } = await params;
  update((state) => {
    state.rsvps = state.rsvps.filter((r) => r.id !== id);
  });
  return NextResponse.json({ ok: true, rsvps: get().rsvps });
}
