import { NextResponse } from 'next/server';
import { get, update, id as genId } from '@/lib/store';

export const runtime = 'nodejs';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || '').trim().slice(0, 60) || 'Neuer Tisch';
  update((state) => {
    state.seating.tables.push({ id: genId(), name, guestNames: [] });
  });
  return NextResponse.json({ ok: true, seating: get().seating });
}
