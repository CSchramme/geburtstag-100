import { NextResponse } from 'next/server';
import { get, update, id as genId } from '@/lib/store';

export const runtime = 'nodejs';

export async function POST() {
  update((state) => {
    state.seating.walls.push({
      id: genId(),
      x: 40,
      y: 40,
      length: 160,
      vertical: false
    });
  });
  return NextResponse.json({ ok: true, seating: get().seating });
}
