import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (!['pending', 'done'].includes(body.status)) {
    return NextResponse.json({ error: 'Ungültiger Status' }, { status: 400 });
  }
  update((state) => {
    const entry = state.songRequests.find((r) => r.id === id);
    if (entry) entry.status = body.status;
  });
  return NextResponse.json({ ok: true, songRequests: get().songRequests });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  update((state) => {
    state.songRequests = state.songRequests.filter((r) => r.id !== id);
  });
  return NextResponse.json({ ok: true, songRequests: get().songRequests });
}
