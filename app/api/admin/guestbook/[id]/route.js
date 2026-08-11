import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (!['approved', 'pending', 'rejected'].includes(body.status)) {
    return NextResponse.json({ error: 'Ungültiger Status' }, { status: 400 });
  }
  update((state) => {
    const entry = state.guestbook.find((g) => g.id === id);
    if (entry) entry.status = body.status;
  });
  return NextResponse.json({ ok: true, guestbook: get().guestbook });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  update((state) => {
    state.guestbook = state.guestbook.filter((g) => g.id !== id);
  });
  return NextResponse.json({ ok: true, guestbook: get().guestbook });
}
