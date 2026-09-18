import { NextResponse } from 'next/server';
import { get, update, id as genId } from '@/lib/store';

export const runtime = 'nodejs';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || '').trim().slice(0, 60) || 'Neuer Tisch';
  update((state) => {
    const count = state.seating.tables.length;
    state.seating.tables.push({
      id: genId(),
      name,
      x: 40 + (count % 4) * 200,
      y: 40 + Math.floor(count / 4) * 160,
      seats: 6,
      seatRefs: Array(6).fill(null)
    });
  });
  return NextResponse.json({ ok: true, seating: get().seating });
}
