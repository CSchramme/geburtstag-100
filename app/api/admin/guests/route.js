import { NextResponse } from 'next/server';
import { get, update, id as genId } from '@/lib/store';

export const runtime = 'nodejs';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || '').trim().slice(0, 60);
  if (!name) {
    return NextResponse.json({ error: 'Bitte einen Namen eintragen' }, { status: 400 });
  }
  update((state) => {
    state.guests.push({ id: genId(), name, createdAt: new Date().toISOString() });
  });
  return NextResponse.json({ ok: true, guests: get().guests });
}
