import { NextResponse } from 'next/server';
import { get, update, id as genId } from '@/lib/store';

export const runtime = 'nodejs';

export async function POST() {
  update((state) => {
    // Spawn away from (40,40), where the first table also lands, so a new
    // wall never appears hidden directly underneath it. Successive walls
    // step further down so they don't stack exactly on top of each other.
    const count = state.seating.walls.length;
    state.seating.walls.push({
      id: genId(),
      x: 40 + (count % 4) * 180,
      y: 420 + Math.floor(count / 4) * 40,
      length: 160,
      vertical: false
    });
  });
  return NextResponse.json({ ok: true, seating: get().seating });
}
